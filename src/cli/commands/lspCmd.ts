import {
  DiagnosticSeverity,
  InlayHint,
  InlayHintKind,
  MarkupKind,
  Position,
  PublishDiagnosticsParams,
  SymbolKind,
  TextDocumentSyncKind,
  TextDocuments,
  TextEdit,
  WorkspaceEdit,
  createConnection,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { getConfigPackageName, readConfig } from "../config";
import { LsState } from "../../language-server/language-server";
import { readRawProject } from "../common";
import { nestedMapGetOrPutDefault } from "../../common/defaultMap";
import {
  ErrorInfo,
  ParsingError,
  Severity,
  typeToString,
} from "../../typecheck";
import { withDisabled } from "../../common/colors";
import {
  findReferences,
  functionSignatureHint,
  getCompletionItems,
  getInlayHints,
  goToDefinitionOf,
  hoverOn,
  hoverToMarkdown,
} from "../../analysis";
import { format } from "../../format";
import * as project from "../../typecheck/project";

export async function lspCmd() {
  const documents = new TextDocuments(TextDocument);
  const connection =
    // @ts-ignore
    createConnection();

  const currentDirectory = process.cwd();
  const config = await readConfig(currentDirectory);

  const [rawProject, deps] = await readRawProject_(currentDirectory);

  const state = new LsState(
    getConfigPackageName(config),
    currentDirectory,
    config["source-directories"],
    async (results) => {
      for (const res of results) {
        const doc = state.getDocByModuleId(res.moduleId);
        if (doc === undefined) {
          continue;
        }

        const [, errors] = res.output;

        const param = errorInfoToDiagnostic(errors, doc);
        connection.sendDiagnostics(param);
      }
    },
    rawProject,
    {
      packageDependencies: deps,
    },
  );

  connection.onInitialize(() => ({
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      hoverProvider: true,
      documentSymbolProvider: true,
      definitionProvider: true,
      codeLensProvider: { resolveProvider: true },
      documentFormattingProvider: true,
      referencesProvider: true,
      renameProvider: true,
      signatureHelpProvider: {
        triggerCharacters: ["("],
      },
      completionProvider: {
        triggerCharacters: ["."],
      },
      inlayHintProvider: true,
    },
  }));

  documents.listen(connection);
  connection.listen();

  state.runTypecheckSync();

  documents.onDidChangeContent((change) => {
    state.upsertDoc(change.document);
  });

  connection.languages.inlayHint.on((ctx) => {
    const module = state.moduleByUri(ctx.textDocument.uri);
    if (module === undefined) {
      return;
    }

    return getInlayHints(module[0]).map(
      (hint): InlayHint => ({
        label: hint.label,
        paddingLeft: hint.paddingLeft,
        kind: InlayHintKind.Type,
        position: hint.positition,
      }),
    );
  });

  connection.onSignatureHelp(({ textDocument, position }) => {
    const module = state.moduleByUri(textDocument.uri);
    if (module === undefined) {
      return;
    }

    const hint = functionSignatureHint(module[0], position);

    if (hint === undefined) {
      return;
    }

    const label = `${hint.name}: ${typeToString(hint.type, hint.ctx)}`;

    return {
      signatures: [
        {
          label,
          documentation:
            hint.docComment === undefined
              ? undefined
              : {
                  kind: MarkupKind.Markdown,
                  value: hint.docComment,
                },
        },
      ],
    };
  });

  connection.onCompletion(({ textDocument, position }) => {
    const module = state.moduleByUri(textDocument.uri);
    if (module === undefined) {
      return;
    }
    return getCompletionItems(module[0], position, {
      getModuleByNs(ns) {
        return state.moduleByUri(ns)?.[0];
      },
    });
  });

  connection.onReferences(({ textDocument, position }) => {
    const module = state.moduleByUri(textDocument.uri);
    if (module === undefined) {
      return;
    }

    const refs =
      findReferences(
        module[0].moduleInterface.package_,
        module[0].moduleInterface.ns,
        position,
        state.getTypedProject(),
      )?.references ?? [];

    return refs.map(([referenceNs, referenceExpr]) => {
      const referenceModule = state.getDocByModuleId(referenceNs)!;

      return {
        uri: referenceModule.uri,
        range: referenceExpr.range,
      };
    });
  });

  connection.onPrepareRename(() => {
    return undefined;
  });

  connection.onRenameRequest(({ textDocument, position, newName }) => {
    const module = state.moduleByUri(textDocument.uri);
    if (module === undefined) {
      return;
    }

    const refs = findReferences(
      module[0].moduleInterface.package_,
      module[0].moduleInterface.ns,
      position,
      state.getTypedProject(),
    );

    if (refs === undefined) {
      return;
    }

    const changes: NonNullable<WorkspaceEdit["changes"]> = {};
    switch (refs.resolution.type) {
      case "global-variable": {
        const module = state.getDocByModuleId(refs.resolution.namespace)!;

        getOrDefault(changes, module.uri, []).push({
          newText: newName,
          range: refs.resolution.declaration.binding.range,
        });

        break;
      }
      case "local-variable":
        break;
      case "constructor":
        break;
    }

    for (const [ns, ident] of refs.references) {
      const refModule = state.moduleByUri(ns);
      if (refModule === undefined) {
        continue;
      }

      const newText =
        ident.namespace === undefined
          ? newName
          : `${ident.namespace}.${newName}`;

      const doc = state.getDocByModuleId(ns);
      if (doc === undefined) {
        return undefined;
      }

      getOrDefault(changes, doc.uri, []).push({
        newText,
        range: ident.range,
      });
    }

    return { changes };
  });

  connection.onDocumentFormatting(({ textDocument }) => {
    const module = state.moduleByUri(textDocument.uri);

    if (module === undefined) {
      return;
    }

    const hasParsingErr = module[1].some((e) => e instanceof ParsingError);
    if (hasParsingErr) {
      return;
    }

    const formatted_ = format(module[0]);

    const doc = state.getDocByModuleId(module[0].moduleInterface.ns);
    if (doc === undefined) {
      return;
    }
    const start: Position = { line: 0, character: 0 };
    const len = doc.getText().length;
    const end = doc.positionAt(len);

    return [
      {
        range: { start, end },
        newText: formatted_,
      } as TextEdit,
    ];
  });

  connection.onDocumentSymbol(({ textDocument }) => {
    const module = state.moduleByUri(textDocument.uri);
    if (module === undefined) {
      return undefined;
    }

    const decls = module[0].declarations.map((st) => ({
      name: st.binding.name,
      range: st.range,
    }));
    const typeDecl = module[0].typeDeclarations.map((st) => ({
      name: st.name,
      range: st.range,
    }));
    return decls.concat(typeDecl).map(({ range, name }) => ({
      kind: SymbolKind.Variable,
      name,
      location: {
        uri: textDocument.uri,
        range,
      },
    }));
  });

  connection.onCodeLens(({ textDocument }) => {
    const module = state.moduleByUri(textDocument.uri);
    if (module === undefined) {
      return;
    }

    return module[0].declarations.map(({ binding, $traitsConstraints }) => {
      const tpp = typeToString(binding.$type, $traitsConstraints);
      return {
        command: { title: tpp, command: "noop" },
        range: binding.range,
      };
    });
  });

  connection.onExecuteCommand(() => {});

  connection.onDefinition(({ textDocument, position }) => {
    const module = state.moduleByUri(textDocument.uri);
    if (module === undefined) {
      return;
    }

    const resolved = goToDefinitionOf(module[0], position);
    if (resolved === undefined) {
      return undefined;
    }

    const definitionDoc = state.getDocByModuleId(resolved.namespace);
    if (definitionDoc === undefined) {
      return undefined;
    }

    return {
      uri: definitionDoc.uri,
      range: resolved.range,
    };
  });

  connection.onHover(({ textDocument, position }) => {
    const result = state.moduleByUri(textDocument.uri);
    if (result === undefined) {
      return;
    }

    const [typedModule] = result;
    const hoverData = hoverOn(
      typedModule.moduleInterface.package_,
      typedModule.moduleInterface.ns,
      typedModule,
      position,
    );
    if (hoverData === undefined) {
      return undefined;
    }

    const hover = hoverData;
    const md = hoverToMarkdown(hover);
    return {
      range: hover.range,
      contents: {
        kind: MarkupKind.Markdown,
        value: md,
      },
    };
  });
}

async function readRawProject_(
  path: string,
): Promise<
  [
    Map<string, Map<string, { doc: TextDocument; source: string }>>,
    project.ProjectOptions["packageDependencies"],
  ]
> {
  const [prj, deps] = await readRawProject(path);

  const rawProject: Map<
    string,
    Map<string, { doc: TextDocument; source: string }>
  > = new Map();

  for (const [moduleId, packages] of prj) {
    for (const [package_, raw] of packages) {
      nestedMapGetOrPutDefault(rawProject, moduleId).set(package_, {
        doc: TextDocument.create(
          `file://${raw.path}`,
          "kestrel",
          1,
          raw.content,
        ),
        source: raw.content,
      });
    }
  }

  return [rawProject, deps] as const;
}

function toDiagnosticSeverity(severity: Severity): DiagnosticSeverity {
  switch (severity) {
    case "error":
      return DiagnosticSeverity.Error;
    case "warning":
      return DiagnosticSeverity.Warning;
  }
}

function errorInfoToDiagnostic(
  errorsInfo: ErrorInfo[],
  document: TextDocument,
): PublishDiagnosticsParams {
  return {
    uri: document.uri,
    diagnostics: errorsInfo.map((e) => ({
      message: withDisabled(
        false,
        () =>
          `${e.description.errorName}\n\n${e.description.shortDescription()}`,
      ),
      severity: toDiagnosticSeverity(e.description.severity),
      range: e.range,
    })),
  };
}

function getOrDefault<V>(o: Record<string, V>, k: string, default_: V): V {
  if (!(k in o)) {
    o[k] = default_;
    return default_;
  }

  return o[k]!;
}
