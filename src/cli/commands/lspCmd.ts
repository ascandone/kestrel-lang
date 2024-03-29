import {
  DiagnosticSeverity,
  MarkupKind,
  PublishDiagnosticsParams,
  SymbolKind,
  TextDocumentSyncKind,
  TextDocuments,
  TextEdit,
  WorkspaceEdit,
  _Connection,
  createConnection,
} from "vscode-languageserver";
import { TextDocument, Range } from "vscode-languageserver-textdocument";
import { Span, UntypedModule, parse } from "../../parser";
import {
  typecheckProject,
  typeToString,
  TypedModule,
  goToDefinitionOf,
  hoverOn,
  hoverToMarkdown,
  UntypedProject,
  findReferences,
} from "../../typecheck";
import { readProjectWithDeps } from "../common";
import { ErrorInfo, Severity } from "../../errors";
import { withDisabled } from "../../utils/colors";
import { format } from "../../formatter";
import { Config, readConfig } from "../config";
import { MatchResult } from "ohm-js";

type Connection = _Connection;

type Module = {
  ns: string;
  package_: string;
  document: TextDocument;
  untyped?: UntypedModule;
  typed?: TypedModule;
};

function parseErrToDiagnostic(
  document: TextDocument,
  matchResult: MatchResult,
): PublishDiagnosticsParams {
  const interval = matchResult.getInterval();
  return {
    uri: document.uri,
    diagnostics: [
      {
        message: matchResult.message ?? "Parsing",
        source: "Parsing",
        severity: DiagnosticSeverity.Error,
        range: spannedToRange(document, [interval.startIdx, interval.endIdx]),
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
      range: spannedToRange(document, e.span),
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
      this.insertByNs(this.modulesByNs[oldNs]!.package_, oldNs, textDoc);
    } else {
      this.insertByUri(package_, textDoc);
    }

    return this.typecheckProject();
  }

  insertByUri(package_: string, document: TextDocument) {
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
    for (const [k, [typed, errors]] of Object.entries(typecheckedProject)) {
      const module = this.modulesByNs[k]!;
      this.modulesByNs[k]!.typed = typed;
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
    this.modulesByNs[ns] = { ns, package_, document };
    const parsed = parse(document.getText());

    if (!parsed.ok) {
      return [parseErrToDiagnostic(document, parsed.matchResult)];
    }

    this.modulesByNs[ns]!.untyped = parsed.value;
    if (skipTypecheck) {
      return [];
    } else {
      return this.typecheckProject();
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
    state.insertByNs(raw.package, ns, textDoc, true);
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
    },
  }));

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
      findReferences(
        ns,
        module.document.offsetAt(position),
        state.getTypedProject(),
      )?.references ?? [];

    return refs.map(([referenceNs, referenceExpr]) => {
      const referenceModule = state.moduleByNs(referenceNs)!;

      return {
        uri: referenceModule.document.uri,
        range: spannedToRange(referenceModule.document, referenceExpr.span),
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

    const refs = findReferences(
      ns,
      module.document.offsetAt(position),
      state.getTypedProject(),
    );

    if (refs === undefined) {
      return;
    }

    const changes: NonNullable<WorkspaceEdit["changes"]> = {};
    switch (refs.resolution.type) {
      case "global-variable": {
        const module = state.moduleByNs(refs.resolution.namespace)!;

        getOrDefault(changes, module.document.uri, []).push({
          newText: newName,
          range: spannedToRange(
            module.document,
            refs.resolution.declaration.binding.span,
          ),
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

      getOrDefault(changes, refModule.document.uri, []).push({
        newText: newName,
        range: spannedToRange(refModule.document, ident.span),
      });
    }

    return { changes };
  });

  connection.onDocumentFormatting(({ textDocument }) => {
    const module = state.moduleByUri(textDocument.uri);

    if (module?.untyped === undefined) {
      return;
    }

    const formatted_ = format(module.untyped);
    return [
      {
        range: spannedToRange(module.document, [
          0,
          module.document.getText().length,
        ]),
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
      span: st.span,
    }));
    const typeDecl = module.typed.typeDeclarations.map((st) => ({
      name: st.name,
      span: st.span,
    }));
    return decls.concat(typeDecl).map(({ span, name }) => ({
      kind: SymbolKind.Variable,
      name,
      location: {
        uri: textDocument.uri,
        range: spannedToRange(module.document, span),
      },
    }));
  });

  connection.onCodeLens(({ textDocument }) => {
    const module = state.moduleByUri(textDocument.uri);
    if (module?.typed === undefined) {
      return;
    }

    return module.typed.declarations.map(({ span, binding, scheme }) => {
      const tpp = typeToString(binding.$.asType(), scheme);
      return {
        command: { title: tpp, command: "noop" },
        range: spannedToRange(module.document, span),
      };
    });
  });

  connection.onExecuteCommand(() => {});

  connection.onDefinition(({ textDocument, position }) => {
    const module = state.moduleByUri(textDocument.uri);
    if (module?.typed === undefined) {
      return;
    }

    const offset = module.document.offsetAt(position);
    const resolved = goToDefinitionOf(module.typed, offset);
    if (resolved === undefined) {
      return undefined;
    }

    const definitionDoc =
      resolved.namespace === undefined
        ? module.document
        : state.moduleByNs(resolved.namespace)!.document;

    return {
      uri: definitionDoc.uri,
      range: spannedToRange(definitionDoc, resolved.span),
    };
  });

  connection.onHover(({ textDocument, position }) => {
    const module = state.moduleByUri(textDocument.uri);
    if (module?.typed === undefined) {
      return;
    }

    const offset = module.document.offsetAt(position);
    const hoverData = hoverOn(module.ns, module.typed, offset);
    if (hoverData === undefined) {
      return undefined;
    }

    const [scheme, hover] = hoverData;
    const md = hoverToMarkdown(scheme, hover);
    return {
      range: spannedToRange(module.document, hover.span),
      contents: {
        kind: MarkupKind.Markdown,
        value: md,
      },
    };
  });

  documents.listen(connection);
  connection.listen();
}

function spannedToRange(doc: TextDocument, [start, end]: Span): Range {
  return {
    start: doc.positionAt(start),
    end: doc.positionAt(end),
  };
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
