import {
  DiagnosticSeverity,
  MarkupKind,
  PublishDiagnosticsParams,
  SymbolKind,
  TextDocumentSyncKind,
  TextDocuments,
  TextEdit,
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
} from "../../typecheck";
import { readProjectWithDeps } from "../common";
import { Severity } from "../../errors";
import { withDisabled } from "../../utils/colors";
import { format } from "../../formatter";
import { Config, readConfig } from "../config";

type Connection = _Connection;

type Result<Ok, Err> = { type: "OK"; value: Ok } | { type: "ERR"; error: Err };

class State {
  private untypedProject: Record<string, UntypedModule> = {};
  private docs: Record<string, TextDocument> = {};

  constructor(public readonly config: Config) {}

  private static parseDoc(
    textDoc: TextDocument,
  ): Result<UntypedModule, PublishDiagnosticsParams> {
    const parsed = parse(textDoc.getText());

    if (parsed.ok) {
      return { type: "OK", value: parsed.value };
    }

    const interval = parsed.matchResult.getInterval();
    return {
      type: "ERR",
      error: {
        uri: textDoc.uri,
        diagnostics: [
          {
            message: parsed.matchResult.message ?? "Parsing",
            source: "Parsing",
            severity: DiagnosticSeverity.Error,
            range: spannedToRange(textDoc, [
              interval.startIdx,
              interval.endIdx,
            ]),
          },
        ],
      },
    };
  }

  addDocument(
    ns: string,
    textDoc: TextDocument,
  ): Result<null, PublishDiagnosticsParams> {
    const result = State.parseDoc(textDoc);
    switch (result.type) {
      case "ERR":
        return result;
      case "OK":
        this.untypedProject[ns] = result.value;
        this.docs[ns] = textDoc;
        return { type: "OK", value: null };
    }
  }

  changeDocument(textDocument: TextDocument): PublishDiagnosticsParams[] {
    const parseResult = State.parseDoc(textDocument);
    switch (parseResult.type) {
      case "ERR":
        return [parseResult.error];

      case "OK": {
        const ns = this.nsByUri(textDocument.uri);
        if (ns === undefined) {
          return [];
        }

        this.docs[ns] = textDocument;
        this.untypedProject[ns] = parseResult.value;

        const [, errors] = this.typecheckDocs();
        return errors;
      }
    }
  }

  typecheckDocs(): [Record<string, TypedModule>, PublishDiagnosticsParams[]] {
    const typedProject: Record<string, TypedModule> = {};

    const tc = typecheckProject(this.untypedProject);

    const diagnostics: PublishDiagnosticsParams[] = [];
    for (const [ns, [typed, errors]] of Object.entries(tc)) {
      const document = this.docs[ns]!;
      typedProject[ns] = typed;

      diagnostics.push({
        uri: document.uri,
        diagnostics: errors.map((e) => ({
          message: withDisabled(
            false,
            () =>
              `${e.description.errorName}\n\n${e.description.shortDescription()}`,
          ),
          severity: toDiagnosticSeverity(e.description.severity ?? "error"),
          range: spannedToRange(document, e.span),
        })),
      });
    }

    return [typedProject, diagnostics];
  }

  docByNs(ns: string): TextDocument {
    return this.docs[ns]!;
  }

  docByUri(uri: string): [TextDocument, TypedModule, string] | undefined {
    const ns = this.nsByUri(uri);

    if (ns === undefined) {
      return;
    }

    const [typed] = this.typecheckDocs();
    const doc = this.docs[ns]!;
    const ast = typed[ns]!;
    return [doc, ast, ns];
  }

  nsByUri(uri: string): string | undefined {
    for (const [ns, oldDoc] of Object.entries(this.docs)) {
      if (oldDoc.uri === uri) {
        return ns;
      }
    }

    return undefined;
  }
}

async function initProject(connection: Connection, state: State) {
  const path = process.cwd();
  const rawProject = await readProjectWithDeps(path, state.config);
  for (const [ns, raw] of Object.entries(rawProject)) {
    const uri = `file://${raw.path}`;
    const textDoc = TextDocument.create(uri, "kestrel", 1, raw.content);
    const result = state.addDocument(ns, textDoc);
    if (result.type === "ERR") {
      connection.sendDiagnostics(result.error);
    }
  }

  const [, errors] = state.typecheckDocs();
  for (const diagnostic of errors) {
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

  // Do not await
  initProject(connection, state);

  connection.onInitialize(() => ({
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      hoverProvider: true,
      documentSymbolProvider: true,
      definitionProvider: true,
      codeLensProvider: { resolveProvider: true },
      documentFormattingProvider: true,
    },
  }));

  documents.onDidOpen((doc) => {
    let ns = doc.document.uri.replace("file://", "").replace(process.cwd(), "");
    for (const sourceDir of state.config["source-directories"]) {
      const regexp = new RegExp(`^/${sourceDir}/`);
      ns = ns.replace(regexp, "");
    }
    ns = ns.replace(/.kes$/, "");

    state.addDocument(ns, doc.document);
  });

  documents.onDidChangeContent((change) => {
    const errors = state.changeDocument(change.document);
    for (const err of errors) {
      connection.sendDiagnostics(err);
    }
  });

  connection.onDocumentFormatting(({ textDocument }) => {
    const pair = state.docByUri(textDocument.uri);
    if (pair === undefined) {
      return undefined;
    }
    const [doc] = pair;
    const original = doc.getText();
    // TODO this is inefficient
    // store untyped ast too
    const parsed = parse(original);
    if (!parsed.ok) {
      return;
    }
    const formatted = format(parsed.value);
    return [
      {
        range: spannedToRange(doc, [0, original.length]),
        newText: formatted,
      } as TextEdit,
    ];
  });

  connection.onDocumentSymbol(({ textDocument }) => {
    const ret = state.docByUri(textDocument.uri);
    if (ret === undefined) {
      return;
    }
    const [doc, ast] = ret;

    const decls = ast.declarations.map((st) => ({
      name: st.binding.name,
      span: st.span,
    }));
    const typeDecl = ast.typeDeclarations.map((st) => ({
      name: st.name,
      span: st.span,
    }));
    return decls.concat(typeDecl).map(({ span, name }) => ({
      kind: SymbolKind.Variable,
      name,
      location: {
        uri: textDocument.uri,
        range: spannedToRange(doc, span),
      },
    }));
  });

  connection.onCodeLens(({ textDocument }) => {
    const res = state.docByUri(textDocument.uri);
    if (res === undefined) {
      return;
    }
    const [doc, ast] = res;

    return ast.declarations.map(({ span, binding, scheme }) => {
      const tpp = typeToString(binding.$.asType(), scheme);
      return {
        command: { title: tpp, command: "noop" },
        range: spannedToRange(doc, span),
      };
    });
  });

  connection.onExecuteCommand(() => {});

  connection.onDefinition(({ textDocument, position }) => {
    const res = state.docByUri(textDocument.uri);
    if (res === undefined) {
      return;
    }
    const [doc, ast] = res;

    const offset = doc.offsetAt(position);
    const resolved = goToDefinitionOf(ast, offset);
    if (resolved === undefined) {
      return undefined;
    }

    const definitionDoc =
      resolved.namespace === undefined
        ? doc
        : state.docByNs(resolved.namespace);

    return {
      uri: definitionDoc.uri,
      range: spannedToRange(definitionDoc, resolved.span),
    };
  });

  connection.onHover(({ textDocument, position }) => {
    const res = state.docByUri(textDocument.uri);
    if (res === undefined) {
      return;
    }
    const [doc, ast, ns] = res;

    const offset = doc.offsetAt(position);
    const hoverData = hoverOn(ns, ast, offset);
    if (hoverData === undefined) {
      return undefined;
    }

    const [scheme, hover] = hoverData;
    const md = hoverToMarkdown(scheme, hover);
    return {
      range: spannedToRange(doc, hover.span),
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
