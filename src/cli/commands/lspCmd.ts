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
  UntypedProject,
} from "../../typecheck";
import { readProjectWithDeps } from "../common";
import { Severity } from "../../errors";
import { withDisabled } from "../../utils/colors";
import { format } from "../../formatter";
import { Config, readConfig } from "../config";

type Connection = _Connection;

type Result<Ok, Err> = { type: "OK"; value: Ok } | { type: "ERR"; error: Err };

class State {
  private untypedProject: UntypedProject = {};
  private docs: Record<string, TextDocument> = {};

  constructor(public readonly config: Config) {}

  get packageName(): string {
    return this.config.type === "package" ? this.config.name : "";
  }

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

  private newDocNs(uri: string) {
    let ns = uri.replace("file://", "").replace(process.cwd(), "");
    for (const sourceDir of this.config["source-directories"]) {
      const regexp = new RegExp(`^/${sourceDir}/`);
      ns = ns.replace(regexp, "");
    }
    ns = ns.replace(/.kes$/, "");
    return ns;
  }

  insertByNs(
    package_: string,
    ns: string,
    textDoc: TextDocument,
  ): Result<null, PublishDiagnosticsParams> {
    const result = State.parseDoc(textDoc);
    switch (result.type) {
      case "ERR":
        return result;
      case "OK":
        this.docs[ns] = textDoc;
        this.untypedProject[ns] = {
          package: package_,
          module: result.value,
        };
        return { type: "OK", value: null };
    }
  }

  upsertByUri(
    package_: string,
    textDoc: TextDocument,
  ): Result<null, PublishDiagnosticsParams> {
    const oldNs = this.nsByUri(textDoc.uri);
    if (oldNs !== undefined) {
      return this.insertByNs(
        this.untypedProject[oldNs]!.package,
        oldNs,
        textDoc,
      );
    }

    const ns = this.newDocNs(textDoc.uri);
    return this.insertByNs(package_, ns, textDoc);
  }

  addDocument(
    package_: string,
    ns: string,
    textDoc: TextDocument,
  ): Result<null, PublishDiagnosticsParams> {
    if (this.docs[ns]) {
      return { type: "OK", value: null };
    }

    const result = State.parseDoc(textDoc);
    switch (result.type) {
      case "ERR":
        return result;
      case "OK":
        this.untypedProject[ns] = {
          package: package_,
          module: result.value,
        };
        this.docs[ns] = textDoc;
        return { type: "OK", value: null };
    }
  }

  changeDocument(textDocument: TextDocument): PublishDiagnosticsParams[] {
    const ns = this.nsByUri(textDocument.uri);
    if (ns === undefined) {
      return [];
    }

    const package_ = this.untypedProject[ns]?.package;

    const parseResult = State.parseDoc(textDocument);
    switch (parseResult.type) {
      case "ERR":
        return [parseResult.error];

      case "OK": {
        this.docs[ns] = textDocument;
        this.untypedProject[ns] = {
          package: package_ ?? this.packageName,
          module: parseResult.value,
        };

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
    const result = state.insertByNs(raw.package, ns, textDoc);
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

  await initProject(connection, state);

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

  documents.onDidClose(async ({ document }) => {
    connection.sendDiagnostics({ uri: document.uri, diagnostics: [] });
  });

  documents.onDidChangeContent((change) => {
    const result = state.upsertByUri(state.packageName, change.document);
    switch (result.type) {
      case "OK": {
        const [, errors] = state.typecheckDocs();
        for (const diagnostic of errors) {
          connection.sendDiagnostics(diagnostic);
        }
        return;
      }
      case "ERR":
        connection.sendDiagnostics(result.error);
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
