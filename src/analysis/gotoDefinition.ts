import { Position, Range, contains } from "../parser";
import { Finder } from "../typecheck/astLookup";
import {
  IdentifierResolution,
  TypedExpr,
  TypedModule,
  TypedTypeAst,
} from "../typecheck/typedAst";
import { firstBy, statementByOffset } from "./common";

export type Location = {
  namespace: string;
  range: Range;
};

export function goToDefinitionOf(
  module: TypedModule,
  position: Position,
): Location | undefined {
  const statement = statementByOffset(module, position);
  if (statement === undefined) {
    return undefined;
  }

  switch (statement.type) {
    case "declaration":
      if (statement.declaration.typeHint !== undefined) {
        const ret = goToDefinitionOfTypeAst(
          statement.declaration.typeHint.mono,
          position,
        );
        if (ret !== undefined) {
          return ret;
        }
      }

      return statement.declaration.extern
        ? undefined
        : goToDefinitionOfExpr(
            statement.declaration.value,
            position,
            module.moduleInterface.ns,
          );

    case "type-declaration": {
      if (statement.typeDeclaration.type !== "adt") {
        return undefined;
      }

      const ret = firstBy(statement.typeDeclaration.variants, (variant) => {
        if (!contains(variant, position)) {
          return undefined;
        }

        return firstBy(variant.args, (arg) =>
          goToDefinitionOfTypeAst(arg, position),
        );
      });

      if (ret !== undefined) {
        return ret;
      }

      return undefined;
    }

    case "import":
      for (const exposing of statement.import.exposing) {
        if (!contains(exposing, position)) {
          continue;
        }

        switch (exposing.type) {
          case "type":
            if (exposing.$resolution === undefined) {
              return undefined;
            }

            return {
              namespace: statement.import.ns,
              range: exposing.$resolution.range,
            };

          case "value":
            if (exposing.$resolution === undefined) {
              return undefined;
            }

            return {
              namespace: statement.import.ns,
              range: exposing.$resolution.range,
            };
        }
      }
      return undefined;
  }
}

function goToDefinitionOfTypeAst(
  t: TypedTypeAst,
  position: Position,
): Location | undefined {
  if (!contains(t, position)) {
    return undefined;
  }

  switch (t.type) {
    case "var":
    case "any":
      return undefined;
    case "named": {
      const ret = firstBy(t.args, (arg) =>
        goToDefinitionOfTypeAst(arg, position),
      );

      if (ret !== undefined) {
        return ret;
      }

      if (t.$resolution === undefined) {
        return undefined;
      }

      return {
        range: t.$resolution.declaration.range,
        namespace: t.$resolution.namespace,
      };
    }

    case "fn": {
      return (
        firstBy(t.args, (arg) => goToDefinitionOfTypeAst(arg, position)) ??
        goToDefinitionOfTypeAst(t.return, position)
      );
    }
  }
}

function resolutionFinder(position: Position) {
  return new Finder<IdentifierResolution>(position, {
    onMatchPattern(expr, next) {
      switch (expr.type) {
        case "constructor":
          if (expr.$resolution !== undefined) {
            return expr.$resolution;
          }

        default:
          return next();
      }
    },

    onExpression(expr, next) {
      switch (expr.type) {
        case "identifier":
          if (expr.$resolution !== undefined) {
            return expr.$resolution;
          }

        default:
          return next();
      }
    },
  });
}

function goToDefinitionOfExpr(
  ast: TypedExpr,
  position: Position,
  moduleId: string,
): Location | undefined {
  const resolution = resolutionFinder(position).visitExpr(ast);
  if (resolution === undefined) {
    return undefined;
  }

  switch (resolution.type) {
    case "local-variable":
      return { namespace: moduleId, range: resolution.binding.range };
    case "global-variable":
      return {
        namespace: resolution.namespace,
        range: resolution.declaration.binding.range,
      };
    case "constructor":
      return {
        namespace: resolution.namespace,
        range: resolution.variant.range,
      };
  }
}
