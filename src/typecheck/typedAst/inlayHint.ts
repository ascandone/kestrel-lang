import { typeToString } from "../type";
import { TypedExpr, TypedModule } from "../typedAst";

export type InlayHint = { label: string; offset: number };

export function getInlayHints(module: TypedModule): InlayHint[] {
  return module.declarations.flatMap<InlayHint>((d) => {
    if (d.extern) {
      return [];
    }
    return [...inlayHintsOfExpr(d.value)];
  });
}

function* inlayHintsOfExpr(ast: TypedExpr): Generator<InlayHint> {
  switch (ast.type) {
    case "syntax-err":
    case "constant":
    case "identifier":
      return;

    case "application": {
      const resolved = ast.caller.$.resolve();
      if (ast.isPipe) {
        if (resolved.type !== "bound" || resolved.value.type !== "fn") {
          // invalid pipe
          return;
        }

        const offset = ast.span[1];
        const label = typeToString(resolved.value.return);
        yield { label, offset };
      }

      for (const arg of ast.args) {
        yield* inlayHintsOfExpr(arg);
      }
      return;
    }

    case "fn":
      return yield* inlayHintsOfExpr(ast.body);

    case "list-literal":
      for (const value of ast.values) {
        yield* inlayHintsOfExpr(value);
      }
      return;

    case "let":
      yield* inlayHintsOfExpr(ast.body);
      yield* inlayHintsOfExpr(ast.value);
      return;

    case "if":
      yield* inlayHintsOfExpr(ast.then);
      yield* inlayHintsOfExpr(ast.condition);
      yield* inlayHintsOfExpr(ast.else);
      return;

    case "match":
      yield* inlayHintsOfExpr(ast.expr);
      for (const [_p, expr] of ast.clauses) {
        yield* inlayHintsOfExpr(expr);
      }
      return;
  }
}
