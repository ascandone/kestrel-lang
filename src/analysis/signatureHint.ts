import { Position } from "../parser";
import { Type } from "../type";
import { Finder } from "../typecheck/astLookup";
import { TypedExpr, TypedModule } from "../typecheck/typedAst";
import { statementByOffset } from "./common";

export type FunctionSignatureHint = {
  name: string;
  type: Type;
  docComment?: string;
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

      return hoveredFinder(position).visitExpr(statement.declaration.value);

    case "type-declaration":
      return undefined;
    case "import":
      return undefined;
  }
}

function getSignature(
  expr: TypedExpr & { type: "application" },
): FunctionSignatureHint | undefined {
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
        type: variant.$type,
      };
    }
  }
}

function hoveredFinder(position: Position) {
  return new Finder<FunctionSignatureHint>(position, {
    onExpression(expr, next) {
      switch (expr.type) {
        case "application": {
          const inner = next();
          if (inner !== undefined) {
            return inner;
          }

          // if inner is undefined, we are the closest wrapping expr
          return getSignature(expr);
        }
      }

      return next();
    },
  });
}
