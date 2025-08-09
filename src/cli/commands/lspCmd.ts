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
  _Connection,
  createConnection,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import {
  AntlrLexerError,
  AntlrParsingError,
  UntypedModule,
  parse,
} from "../../parser";
import {
  typecheckProject,
  typeToString,
  TypedModule,
  UntypedProject,
  ErrorInfo,
  Severity,
} from "../../typecheck";
import { readProjectWithDeps } from "../common";
import { withDisabled } from "../../utils/colors";
import { format } from "../../format";
import { Config, readConfig } from "../config";
import {
  getCompletionItems,
  findReferences,
  functionSignatureHint,
  getInlayHints,
  goToDefinitionOf,
  hoverOn,
  hoverToMarkdown,
} from "../../analysis";

type Connection = _Connection;

type Module = {
  ns: string;
  package_: string;
  document: TextDocument;
  untyped?: UntypedModule;
  lexerErrors: AntlrLexerError[];
  parsingErrors: AntlrParsingError[];
  typed?: TypedModule;
};

function parseErrToDiagnostic(
  document: TextDocument,
  err: AntlrParsingError,
): PublishDiagnosticsParams {
  return {
    uri: document.uri,
    diagnostics: [
      {
        message: err.description,
        source: "Parsing",
        severity: DiagnosticSeverity.Error,
        range: err.range,
      },
    ],
  };
}

function dedupParams(
  params: PublishDiagnosticsParams[],
): PublishDiagnosticsParams[] {
  const params_: PublishDiagnosticsParams[] = [];
  for (const p of params) {
    const prev = params_.find((p2) => p2.uri === p.uri);
    if (prev !== undefined) {
      prev.diagnostics.push(...p.diagnostics);
    } else {
      params_.push(p);
    }
  }

  return params_;
}

function lexerErrToDiagnostic(
  document: TextDocument,
  err: AntlrLexerError,
): PublishDiagnosticsParams {
  return {
    uri: document.uri,
    diagnostics: [
      {
        message: err.description,
        source: "Parsing",
        severity: DiagnosticSeverity.Error,
        range: { start: err.position, end: err.position },
      },
    ],
  };
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

class State {
  constructor(public readonly config: Config) {}
  private modulesByNs: Record<string, Module> = {};

  getTypedProject(): Record<string, TypedModule> {
    const typedProject: Record<string, TypedModule> = {};
    for (const [ns, module] of Object.entries(this.modulesByNs)) {
      if (module.typed !== undefined) {
        typedProject[ns] = module.typed;
      }
    }

    return typedProject;
  }

  getPackageName(): string {
    return this.config.type === "package" ? this.config.name : "";
  }

  moduleByUri(uri: string): Module | undefined {
    const ns = this.nsByUri(uri);
    if (ns === undefined) {
      return undefined;
    }
    return this.moduleByNs(ns);
  }

  moduleByNs(ns: string): Module | undefined {
    return this.modulesByNs[ns];
  }

  nsByUri(uri: string): string | undefined {
    for (const [k, v] of Object.entries(this.modulesByNs)) {
      if (v.document.uri === uri) {
        return k;
      }
    }
    return undefined;
  }

  upsertByUri(
    package_: string,
    textDoc: TextDocument,
  ): PublishDiagnosticsParams[] {
    const oldNs = this.nsByUri(textDoc.uri);

    if (oldNs !== undefined) {
      return this.insertByNs(this.modulesByNs[oldNs]!.package_, oldNs, textDoc);
    } else {
      return this.insertByUri(package_, textDoc);
    }
  }

  insertByUri(
    package_: string,
    document: TextDocument,
  ): PublishDiagnosticsParams[] {
    const ns = this.makeNsByUri(document.uri);
    return this.insertByNs(ns, package_, document);
  }

  typecheckProject(): PublishDiagnosticsParams[] {
    const untypedProject: UntypedProject = {};
    for (const [k, mod] of Object.entries(this.modulesByNs)) {
      if (mod.untyped !== undefined) {
        untypedProject[k] = { package: mod.package_, module: mod.untyped };
      }
    }

    const diagnostics: PublishDiagnosticsParams[] = [];

    const typecheckedProject = typecheckProject(untypedProject);
    for (const [k, { typedModule, errors }] of Object.entries(
      typecheckedProject,
    )) {
      const module = this.modulesByNs[k]!;
      this.modulesByNs[k]!.typed = typedModule;
      diagnostics.push(errorInfoToDiagnostic(errors, module.document));
    }

    return diagnostics;
  }

  insertByNs(
    package_: string,
    ns: string,
    document: TextDocument,
    skipTypecheck: boolean = false,
  ): PublishDiagnosticsParams[] {
    const parsed = parse(document.getText());

    const diagnostics: PublishDiagnosticsParams[] = [
      ...parsed.lexerErrors.map((e) => lexerErrToDiagnostic(document, e)),
      ...parsed.parsingErrors.map((e) => parseErrToDiagnostic(document, e)),
    ];

    this.modulesByNs[ns] = {
      ns,
      package_,
      document,
      parsingErrors: parsed.parsingErrors,
      lexerErrors: parsed.lexerErrors,
      untyped: parsed.parsed,
    };

    if (skipTypecheck) {
      return diagnostics;
    } else {
      return dedupParams([...diagnostics, ...this.typecheckProject()]);
    }
  }

  private makeNsByUri(uri: string) {
    let ns = uri.replace("file://", "").replace(process.cwd(), "");
    for (const sourceDir of this.config["source-directories"]) {
      const regexp = new RegExp(`^/${sourceDir}/`);
      ns = ns.replace(regexp, "");
    }
    ns = ns.replace(/.kes$/, "");
    return ns;
  }
}

async function initProject_(connection: Connection, state: State) {
  const path = process.cwd();
  const rawProject = await readProjectWithDeps(path, state.config);
  for (const [ns, raw] of Object.entries(rawProject)) {
    const uri = `file://${raw.path}`;
    const textDoc = TextDocument.create(uri, "kestrel", 1, raw.content);
    const diagnosticParams = state.insertByNs(raw.package, ns, textDoc, true);

    for (const p of diagnosticParams) {
      await connection.sendDiagnostics(p);
      return;
    }
  }

  for (const diagnostic of state.typecheckProject()) {
    connection.sendDiagnostics(diagnostic);
  }
}

export async function lspCmd() {
  const documents = new TextDocuments(TextDocument);
  const connection =
    // @ts-ignore
    createConnection();

  const path = process.cwd();
  const config = await readConfig(path);

  const state = new State(config);

  await initProject_(connection, state);

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

  connection.languages.inlayHint.on((ctx) => {
    const module = state.moduleByUri(ctx.textDocument.uri);
    if (module?.typed === undefined) {
      return;
    }
    return getInlayHints(module.typed).map(
      (hint): InlayHint => ({
        label: hint.label,
        paddingLeft: hint.paddingLeft,
        kind: InlayHintKind.Type,
        position: hint.positition,
      }),
    );
  });

  documents.onDidClose(async ({ document }) => {
    connection.sendDiagnostics({ uri: document.uri, diagnostics: [] });
  });

  documents.onDidChangeContent((change) => {
    const diagnostics = state.upsertByUri(
      state.getPackageName(),
      change.document,
    );
    for (const diagnostic of diagnostics) {
      connection.sendDiagnostics(diagnostic);
    }
  });

  connection.onSignatureHelp(({ textDocument, position }) => {
    const module = state.moduleByUri(textDocument.uri);

    if (module?.typed === undefined) {
      return;
    }

    const hint = functionSignatureHint(module.typed, position);

    if (hint === undefined) {
      return;
    }

    const label = `${hint.name}: ${typeToString(hint.type, hint.scheme)}`;

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

    if (module?.typed === undefined) {
      return;
    }

    const kind = getCompletionItems(module.typed, position, {
      getModuleByNs(ns) {
        return state.moduleByNs(ns)?.typed;
      },
    });

    return kind;
  });

  connection.onReferences(({ textDocument, position }) => {
    const ns = state.nsByUri(textDocument.uri);
    if (ns === undefined) {
      return;
    }

    const module = state.moduleByUri(textDocument.uri);
    if (module === undefined) {
      return;
    }

    const refs =
      findReferences(ns, position, state.getTypedProject())?.references ?? [];

    return refs.map(([referenceNs, referenceExpr]) => {
      const referenceModule = state.moduleByNs(referenceNs)!;

      return {
        uri: referenceModule.document.uri,
        range: referenceExpr.range,
      };
    });
  });

  connection.onPrepareRename(() => {
    return undefined;
  });

  connection.onRenameRequest(({ textDocument, position, newName }) => {
    const ns = state.nsByUri(textDocument.uri);
    if (ns === undefined) {
      return;
    }

    const module = state.moduleByUri(textDocument.uri);
    if (module === undefined) {
      return;
    }

    const refs = findReferences(ns, position, state.getTypedProject());

    if (refs === undefined) {
      return;
    }

    const changes: NonNullable<WorkspaceEdit["changes"]> = {};
    switch (refs.resolution.type) {
      case "global-variable": {
        const module = state.moduleByNs(refs.resolution.namespace)!;

        getOrDefault(changes, module.document.uri, []).push({
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
      const refModule = state.moduleByNs(ns);
      if (refModule === undefined) {
        continue;
      }

      const newText =
        ident.namespace === undefined
          ? newName
          : `${ident.namespace}.${newName}`;

      getOrDefault(changes, refModule.document.uri, []).push({
        newText,
        range: ident.range,
      });
    }

    return { changes };
  });

  connection.onDocumentFormatting(({ textDocument }) => {
    const module = state.moduleByUri(textDocument.uri);

    if (module === undefined || module?.untyped === undefined) {
      return;
    }

    if (module.lexerErrors.length !== 0 || module.parsingErrors.length !== 0) {
      return;
    }

    const formatted_ = format(module.untyped);

    const start: Position = { line: 0, character: 0 };
    const len = module.document.getText().length;
    const end = module.document.positionAt(len);

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

    if (module.typed === undefined) {
      return;
    }

    const decls = module.typed.declarations.map((st) => ({
      name: st.binding.name,
      range: st.range,
    }));
    const typeDecl = module.typed.typeDeclarations.map((st) => ({
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
    if (module?.typed === undefined) {
      return;
    }

    return module.typed.declarations.map(
      ({ range, binding, $scheme: scheme }) => {
        const tpp = typeToString(binding.$type.asType(), scheme);
        return {
          command: { title: tpp, command: "noop" },
          range,
        };
      },
    );
  });

  connection.onExecuteCommand(() => {});

  connection.onDefinition(({ textDocument, position }) => {
    const module = state.moduleByUri(textDocument.uri);
    if (module?.typed === undefined) {
      return;
    }

    const resolved = goToDefinitionOf(module.typed, position);
    if (resolved === undefined) {
      return undefined;
    }

    const definitionDoc =
      resolved.namespace === undefined
        ? module.document
        : state.moduleByNs(resolved.namespace)!.document;

    return {
      uri: definitionDoc.uri,
      range: resolved.range,
    };
  });

  connection.onHover(({ textDocument, position }) => {
    const module = state.moduleByUri(textDocument.uri);
    if (module?.typed === undefined) {
      return;
    }

    const hoverData = hoverOn(module.ns, module.typed, position);
    if (hoverData === undefined) {
      return undefined;
    }

    const [scheme, hover] = hoverData;
    const md = hoverToMarkdown(scheme, hover);
    return {
      range: hover.range,
      contents: {
        kind: MarkupKind.Markdown,
        value: md,
      },
    };
  });

  documents.listen(connection);
  connection.listen();
}

function toDiagnosticSeverity(severity: Severity): DiagnosticSeverity {
  switch (severity) {
    case "error":
      return DiagnosticSeverity.Error;
    case "warning":
      return DiagnosticSeverity.Warning;
  }
}

function getOrDefault<V>(o: Record<string, V>, k: string, default_: V): V {
  if (!(k in o)) {
    o[k] = default_;
    return default_;
  }

  return o[k]!;
}
