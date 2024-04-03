import { Type, TypeScheme } from "../type";
import { TypedExpr, TypedModule } from "../typedAst";
import { contains, firstBy } from "./common";

export type FunctionSignatureHint = {
  name: string;
  type: Type;
  docComment?: string;
  scheme?: TypeScheme;
};

export function functionSignatureHint(
  module: TypedModule,
  offset: number,
): FunctionSignatureHint | undefined {
  for (const decl of module.declarations) {
    if (!contains(decl, offset)) {
      continue;
    }

    if (decl.extern) {
      continue;
    }

    return functionSignatureHintExpr(decl.value, offset);
  }

  return undefined;
}

function functionSignatureHintExpr(
  expr: TypedExpr,
  offset: number,
): FunctionSignatureHint | undefined {
  switch (expr.type) {
    case "application": {
      const inner =
        functionSignatureHintExpr(expr.caller, offset) ??
        firstBy(expr.args, (arg) => functionSignatureHintExpr(arg, offset));

      if (inner !== undefined) {
        return inner;
      }

      // if inner is undefined, we are the closest wrapping expr
      if (
        expr.caller.type !== "identifier" ||
        expr.caller.resolution === undefined
      ) {
        return;
      }

      switch (expr.caller.resolution.type) {
        case "global-variable": {
          const { declaration } = expr.caller.resolution;
          return {
            name: declaration.binding.name,
            type: declaration.binding.$.asType(),
            docComment: declaration.docComment,
          };
        }

        case "local-variable": {
          const { binding } = expr.caller.resolution;
          return {
            name: binding.name,
            type: binding.$.asType(),
          };
        }

        case "constructor": {
          const { variant } = expr.caller.resolution;
          return {
            name: variant.name,
            type: variant.mono,
            scheme: variant.scheme,
          };
        }
      }
    }

    case "identifier":
    case "constant":
      return undefined;

    case "fn":
      return functionSignatureHintExpr(expr.body, offset);

    case "if":
      return (
        functionSignatureHintExpr(expr.condition, offset) ??
        functionSignatureHintExpr(expr.then, offset) ??
        functionSignatureHintExpr(expr.else, offset)
      );

    case "let":
      return (
        functionSignatureHintExpr(expr.value, offset) ??
        functionSignatureHintExpr(expr.body, offset)
      );

    case "match":
      return (
        functionSignatureHintExpr(expr.expr, offset) ??
        firstBy(expr.clauses, ([_pattern, expr]) =>
          functionSignatureHintExpr(expr, offset),
        )
      );
  }
}
