import { Position } from "../parser";
import { Type, TypeScheme } from "../type";
import { TypedExpr, TypedModule } from "../typecheck/typedAst";
import { firstBy, statementByOffset } from "./common";

export type FunctionSignatureHint = {
  name: string;
  type: Type;
  docComment?: string;
  scheme?: TypeScheme;
};

export function functionSignatureHint(
  module: TypedModule,
  position: Position,
): FunctionSignatureHint | undefined {
  const statement = statementByOffset(module, position);
  if (statement === undefined) {
    return undefined;
  }

  switch (statement.type) {
    case "declaration":
      if (statement.declaration.extern) {
        return undefined;
      }

      return functionSignatureHintExpr(statement.declaration.value, position);

    case "type-declaration":
      return undefined;
    case "import":
      return undefined;
  }
}

function functionSignatureHintExpr(
  expr: TypedExpr,
  position: Position,
): FunctionSignatureHint | undefined {
  switch (expr.type) {
    case "application": {
      const inner =
        functionSignatureHintExpr(expr.caller, position) ??
        firstBy(expr.args, (arg) => functionSignatureHintExpr(arg, position));

      if (inner !== undefined) {
        return inner;
      }

      // if inner is undefined, we are the closest wrapping expr
      if (
        expr.caller.type !== "identifier" ||
        expr.caller.$resolution === undefined
      ) {
        return;
      }

      switch (expr.caller.$resolution.type) {
        case "global-variable": {
          const { declaration } = expr.caller.$resolution;
          return {
            name: declaration.binding.name,
            type: declaration.binding.$type.asType(),
            docComment: declaration.docComment,
          };
        }

        case "local-variable": {
          const { binding } = expr.caller.$resolution;
          return {
            name: binding.name,
            type: binding.$type.asType(),
          };
        }

        case "constructor": {
          const { variant } = expr.caller.$resolution;
          return {
            name: variant.name,
            type: variant.$type.asType(),
            scheme: variant.$scheme,
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
        functionSignatureHintExpr(arg, position),
      );

    case "field-access":
      return functionSignatureHintExpr(expr.struct, position);

    case "struct-literal":
      return (
        firstBy(
          expr.fields.map((f) => f.value),
          (arg) => functionSignatureHintExpr(arg, position),
        ) ??
        (expr.spread === undefined
          ? undefined
          : functionSignatureHintExpr(expr.spread, position))
      );

    case "fn":
      return functionSignatureHintExpr(expr.body, position);

    case "if":
      return (
        functionSignatureHintExpr(expr.condition, position) ??
        functionSignatureHintExpr(expr.then, position) ??
        functionSignatureHintExpr(expr.else, position)
      );

    case "block*":
      return (
        firstBy(
          expr.statements.map((st) => st.value),
          (arg) => functionSignatureHintExpr(arg, position),
        ) ?? functionSignatureHintExpr(expr.returning, position)
      );

    case "let":
      return (
        functionSignatureHintExpr(expr.value, position) ??
        functionSignatureHintExpr(expr.body, position)
      );

    case "match":
      return (
        functionSignatureHintExpr(expr.expr, position) ??
        firstBy(expr.clauses, ([_pattern, expr]) =>
          functionSignatureHintExpr(expr, position),
        )
      );
  }
}
