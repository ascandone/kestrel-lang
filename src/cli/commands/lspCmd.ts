import {
  DiagnosticSeverity,
  MarkupKind,
  PublishDiagnosticsParams,
  SymbolKind,
  TextDocumentSyncKind,
  TextDocuments,
  _Connection,
  createConnection,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { UntypedModule, parse } from "../../parser";
import {
  typecheckProject,
  typePPrint,
  declByOffset,
  TypedModule,
} from "../../typecheck";
import { readCoreRaw, readProject } from "../common";
import { readConfig } from "../config";

type Connection = _Connection;

type Result<Ok, Err> = { type: "OK"; value: Ok } | { type: "ERR"; error: Err };

class State {
  private untypedProject: Record<string, UntypedModule> = {};
  private docs: Record<string, TextDocument> = {};

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
            range: {
              start: textDoc.positionAt(interval.startIdx),
              end: textDoc.positionAt(interval.endIdx),
            },
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
        diagnostics: errors.map((e) => {
          const [start, end] = e.span;

          return {
            message: e.description.getDescription(),
            source: "Typecheck",
            severity: DiagnosticSeverity.Error,
            range: {
              start: document.positionAt(start),
              end: document.positionAt(end),
            },
          };
        }),
      });
    }

    return [typedProject, diagnostics];
  }

  docByUri(uri: string): [TextDocument, TypedModule] | undefined {
    const ns = this.nsByUri(uri);

    if (ns === undefined) {
      return;
    }

    const [typed] = this.typecheckDocs();
    const doc = this.docs[ns]!;
    const ast = typed[ns]!;
    return [doc, ast];
  }

  private nsByUri(uri: string): string | undefined {
    for (const [ns, oldDoc] of Object.entries(this.docs)) {
      if (oldDoc.uri === uri) {
        return ns;
      }
    }

    return undefined;
  }
}

async function initProject(connection: Connection, state: State) {
  const config = await readConfig();
  const rawCore = await readCoreRaw();
  const rawProject = await readProject(process.cwd(), config);

  for (const [ns, raw] of Object.entries({ ...rawCore, ...rawProject })) {
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

  const state = new State();

  // Do not await
  initProject(connection, state);

  connection.onInitialize(() => ({
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      hoverProvider: true,
      documentSymbolProvider: true,
      codeLensProvider: { resolveProvider: true },
    },
  }));

  documents.onDidChangeContent((change) => {
    const errors = state.changeDocument(change.document);
    for (const err of errors) {
      connection.sendDiagnostics(err);
    }
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
    return decls.concat(typeDecl).map(({ span: [start, end], name }) => {
      return {
        kind: SymbolKind.Variable,
        name,
        location: {
          uri: textDocument.uri,
          range: { start: doc.positionAt(start), end: doc.positionAt(end) },
        },
      };
    });
  });

  connection.onCodeLens(({ textDocument }) => {
    const res = state.docByUri(textDocument.uri);
    if (res === undefined) {
      return;
    }
    const [doc, ast] = res;

    return ast.declarations.map(({ span: [start, end], binding }) => {
      const startPos = doc.positionAt(start);
      const endPos = doc.positionAt(end);
      const tpp = typePPrint(binding.$.asType());
      return {
        command: { title: tpp, command: "noop" },
        range: {
          start: startPos,
          end: endPos,
        },
      };
    });
  });

  connection.onExecuteCommand(() => {});

  connection.onHover(({ textDocument, position }) => {
    const res = state.docByUri(textDocument.uri);
    if (res === undefined) {
      return;
    }
    const [doc, ast] = res;

    const offset = doc.offsetAt(position);
    const node = declByOffset(ast, offset);
    if (node === undefined) {
      return undefined;
    }

    const tpp = typePPrint(node.$.asType());

    return {
      range: {
        start: doc.positionAt(node.span[0]),
        end: doc.positionAt(node.span[1]),
      },
      contents: {
        kind: MarkupKind.Markdown,
        value: `\`\`\`
${tpp}
\`\`\``,
      },
    };
  });

  documents.listen(connection);
  connection.listen();
}
