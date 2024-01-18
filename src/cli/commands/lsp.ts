import {
  DiagnosticSeverity,
  MarkupKind,
  TextDocumentSyncKind,
  TextDocuments,
  createConnection,
} from "vscode-languageserver";

import { TextDocument } from "vscode-languageserver-textdocument";
import { Span, SpanMeta, parse } from "../../parser";
import { Type } from "../../typecheck/unify";
import { typeErrorPPrint, typePPrint } from "../../typecheck/pretty-printer";
import { TypeMeta, typecheck } from "../../typecheck/typecheck";
import { prelude } from "../../typecheck/prelude";
import { Expr, Program } from "../../ast";

const documents = new TextDocuments(TextDocument);
const docs = new Map<string, [TextDocument, Program<SpanMeta & TypeMeta>]>();

function spanContains([start, end]: Span, offset: number) {
  return start <= offset && end >= offset;
}

function findTypeByOffsetE<T>(
  ast: Expr<SpanMeta & TypeMeta & T>,
  offset: number,
): Type | undefined {
  if (!spanContains(ast.span, offset)) {
    return;
  }

  switch (ast.type) {
    case "constant":
    case "identifier":
      return ast.$.asType();
    case "application":
      for (const arg of ast.args) {
        const t = findTypeByOffsetE(arg, offset);
        if (t !== undefined) {
          return t;
        }
      }
      return findTypeByOffsetE(ast.caller, offset);

    case "let":
      if (spanContains(ast.binding.span, offset)) {
        return ast.binding.$.asType();
      }
      return (
        findTypeByOffsetE(ast.value, offset) ??
        findTypeByOffsetE(ast.body, offset)
      );

    case "fn":
      for (const param of ast.params) {
        if (spanContains(param.span, offset)) {
          return param.$.asType();
        }
      }
      return findTypeByOffsetE(ast.body, offset);

    case "if":
      return (
        findTypeByOffsetE(ast.condition, offset) ??
        findTypeByOffsetE(ast.then, offset) ??
        findTypeByOffsetE(ast.else, offset)
      );
  }
}

function findTypeByOffsetP<T>(
  program: Program<SpanMeta & TypeMeta & T>,
  offset: number,
): Type | undefined {
  for (const st of program.statements) {
    if (spanContains(st.binding.span, offset)) {
      return st.binding.$.asType();
    }
    const e = findTypeByOffsetE(st.value, offset);
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

  connection.onHover(({ textDocument, position }) => {
    const pair = docs.get(textDocument.uri);
    if (pair === undefined) {
      return undefined;
    }

    const [doc, ast] = pair;

    const offset = doc.offsetAt(position);
    const $ = findTypeByOffsetP(ast, offset);
    if ($ === undefined) {
      return undefined;
    }
    const tpp = typePPrint($);

    return {
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
