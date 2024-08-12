import { Type, TypeScheme } from "../type";
import { TypedExpr, TypedModule } from "../typedAst";
import { firstBy, statementByOffset } from "./common";

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
  const statement = statementByOffset(module, offset);
  if (statement === undefined) {
    return undefined;
  }

  switch (statement.type) {
    case "declaration":
      if (statement.declaration.extern) {
        return undefined;
      }

      return functionSignatureHintExpr(statement.declaration.value, offset);

    case "type-declaration":
      return undefined;
    case "import":
      return undefined;
  }
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
            type: variant.$.asType(),
            scheme: variant.scheme,
          };
        }
      }
    }

    case "syntax-err":
    case "identifier":
    case "constant":
      return undefined;

    case "list-literal":
      return firstBy(expr.values, (arg) =>
        functionSignatureHintExpr(arg, offset),
      );

    case "field-access":
      return functionSignatureHintExpr(expr.struct, offset);

    case "struct-literal":
      return (
        firstBy(
          expr.fields.map((f) => f.value),
          (arg) => functionSignatureHintExpr(arg, offset),
        ) ??
        (expr.spread === undefined
          ? undefined
          : functionSignatureHintExpr(expr.spread, offset))
      );

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
