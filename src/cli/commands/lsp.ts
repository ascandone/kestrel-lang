import {
  DiagnosticSeverity,
  MarkupKind,
  SymbolKind,
  TextDocumentSyncKind,
  TextDocuments,
  createConnection,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Span, SpanMeta, parse } from "../../parser";
import { typeErrorPPrint, typePPrint } from "../../typecheck/pretty-printer";
import { TypeMeta, typecheck } from "../../typecheck/typecheck";
import { prelude } from "../../typecheck/prelude";
import { Expr, Program } from "../../ast";

const documents = new TextDocuments(TextDocument);
const docs = new Map<string, [TextDocument, Program<SpanMeta & TypeMeta>]>();

function spanContains([start, end]: Span, offset: number) {
  return start <= offset && end >= offset;
}

function exprByOffset<T extends SpanMeta>(
  ast: Expr<T>,
  offset: number,
): T | undefined {
  if (!spanContains(ast.span, offset)) {
    return;
  }

  switch (ast.type) {
    case "constant":
    case "identifier":
      return ast;
    case "application":
      for (const arg of ast.args) {
        const t = exprByOffset(arg, offset);
        if (t !== undefined) {
          return t;
        }
      }
      return exprByOffset(ast.caller, offset) ?? ast;

    case "let":
      if (spanContains(ast.binding.span, offset)) {
        return ast.binding;
      }
      return (
        exprByOffset(ast.value, offset) ?? exprByOffset(ast.body, offset) ?? ast
      );

    case "fn":
      for (const param of ast.params) {
        if (spanContains(param.span, offset)) {
          return param;
        }
      }
      return exprByOffset(ast.body, offset) ?? ast;

    case "if":
      return (
        exprByOffset(ast.condition, offset) ??
        exprByOffset(ast.then, offset) ??
        exprByOffset(ast.else, offset) ??
        ast
      );
  }
}

function declByOffset<T extends SpanMeta>(
  program: Program<T>,
  offset: number,
): T | undefined {
  for (const st of program.statements) {
    if (spanContains(st.binding.span, offset)) {
      return st.binding;
    }
    const e = exprByOffset(st.value, offset);
    if (e !== undefined) {
      return e;
    }
  }

  return undefined;
}

export function lspCmd() {
  const connection =
    // @ts-ignore
    createConnection();

  connection.onInitialize(() => ({
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      hoverProvider: true,
      documentSymbolProvider: true,
      // inlayHintProvider: true,
      // codeLensProvider: {
      //   resolveProvider: true,
      // },
      // documentSymbolProvider: true,
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

    const [typed, errors] = typecheck(parsed.value, prelude);
    docs.set(change.document.uri, [change.document, typed]);
    connection.sendDiagnostics({
      uri: change.document.uri,
      diagnostics: errors.map((e) => {
        const [start, end] = e.node.span;

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

    return ast.statements.map((st) => {
      const [start, end] = st.span;
      return {
        kind: SymbolKind.Variable,
        name: st.binding.name,
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
