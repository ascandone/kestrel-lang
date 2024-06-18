import { TypeScheme, typeToString } from "../type";
import { TypedExpr, TypedModule } from "../typedAst";

export type InlayHint = {
  label: string;
  offset: number;
  paddingLeft: boolean;
};

export function getInlayHints(module: TypedModule): InlayHint[] {
  return module.declarations.flatMap<InlayHint>((d) => {
    if (d.extern) {
      return [];
    }
    return [...inlayHintsOfExpr(d.value, d.scheme)];
  });
}

function* inlayHintsOfExpr(
  ast: TypedExpr,
  scheme: TypeScheme,
): Generator<InlayHint> {
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

        const [arg] = ast.args;
        if (arg === undefined) {
          return;
        }

        yield {
          label: typeToString(arg.$.asType(), scheme),
          offset: arg.span[1],
          paddingLeft: true,
        };

        yield {
          label: typeToString(resolved.value.return, scheme),
          offset: ast.span[1],
          paddingLeft: true,
        };
      }

      for (const arg of ast.args) {
        yield* inlayHintsOfExpr(arg, scheme);
      }
      return;
    }

    case "fn":
      return yield* inlayHintsOfExpr(ast.body, scheme);

    case "list-literal":
      for (const value of ast.values) {
        yield* inlayHintsOfExpr(value, scheme);
      }
      return;

    case "let":
      yield* inlayHintsOfExpr(ast.body, scheme);
      yield* inlayHintsOfExpr(ast.value, scheme);
      return;

    case "if":
      yield* inlayHintsOfExpr(ast.then, scheme);
      yield* inlayHintsOfExpr(ast.condition, scheme);
      yield* inlayHintsOfExpr(ast.else, scheme);
      return;

    case "match":
      yield* inlayHintsOfExpr(ast.expr, scheme);
      for (const [_p, expr] of ast.clauses) {
        yield* inlayHintsOfExpr(expr, scheme);
      }
      return;
  }
}
