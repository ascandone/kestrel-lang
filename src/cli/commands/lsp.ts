import {
  DiagnosticSeverity,
  MarkupKind,
  SymbolKind,
  TextDocumentSyncKind,
  TextDocuments,
  createConnection,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { parse } from "../../parser";
import { typeErrorPPrint, typePPrint } from "../../typecheck/pretty-printer";
import { TypeMeta, typecheck } from "../../typecheck/typecheck";
import { Program, SpanMeta, declByOffset } from "../../ast";

const documents = new TextDocuments(TextDocument);
const docs = new Map<string, [TextDocument, Program<SpanMeta & TypeMeta>]>();

export function lspCmd() {
  const connection =
    // @ts-ignore
    createConnection();

  connection.onInitialize(() => ({
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      hoverProvider: true,
      documentSymbolProvider: true,
    },
  }));

  documents.onDidChangeContent((change) => {
    const src = change.document.getText();
    const parsed = parse(src);
    if (!parsed.ok) {
      const interval = parsed.matchResult.getInterval();

      connection.sendDiagnostics({
        uri: change.document.uri,
        diagnostics: [
          {
            message: parsed.matchResult.message ?? "Parsing error",
            source: "Parsing",
            severity: DiagnosticSeverity.Error,
            range: {
              start: change.document.positionAt(interval.startIdx),
              end: change.document.positionAt(interval.endIdx),
            },
          },
        ],
      });
      return;
    }

    const [typed, errors] = typecheck(parsed.value);
    docs.set(change.document.uri, [change.document, typed]);
    connection.sendDiagnostics({
      uri: change.document.uri,
      diagnostics: errors.map((e) => {
        const [start, end] = e.span;

        return {
          message: typeErrorPPrint(e),
          source: "Typecheck",
          severity: DiagnosticSeverity.Error,
          range: {
            start: change.document.positionAt(start),
            end: change.document.positionAt(end),
          },
        };
      }),
    });
  });

  connection.onDocumentSymbol(({ textDocument }) => {
    const pair = docs.get(textDocument.uri);

    if (pair === undefined) {
      return undefined;
    }
    const [doc, ast] = pair;

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

  connection.onHover(({ textDocument, position }) => {
    const pair = docs.get(textDocument.uri);
    if (pair === undefined) {
      return undefined;
    }

    const [doc, ast] = pair;

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
