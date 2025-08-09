import { Position, Range, contains } from "../parser";
import {
  IdentifierResolution,
  TypedExpr,
  TypedMatchPattern,
  TypedModule,
  TypedTypeAst,
} from "../typecheck/typedAst";
import { firstBy, statementByOffset } from "./common";

export type Location = {
  namespace?: string;
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
        : goToDefinitionOfExpr(statement.declaration.value, position);

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

function goToDefinitionOfExpr(
  ast: TypedExpr,
  position: Position,
): Location | undefined {
  if (!contains(ast, position)) {
    return undefined;
  }

  switch (ast.type) {
    case "constant":
      return undefined;

    case "identifier":
      if (ast.$resolution === undefined) {
        return undefined;
      }
      return resolutionToLocation(ast.$resolution);

    case "fn":
      return goToDefinitionOfExpr(ast.body, position);

    case "application":
      return (
        firstBy(ast.args, (arg) => goToDefinitionOfExpr(arg, position)) ??
        goToDefinitionOfExpr(ast.caller, position)
      );

    case "list-literal":
      return firstBy(ast.values, (arg) => goToDefinitionOfExpr(arg, position));

    case "field-access":
      return goToDefinitionOfExpr(ast.struct, position);

    case "struct-literal":
      return (
        firstBy(
          ast.fields.map((f) => f.value),
          (arg) => goToDefinitionOfExpr(arg, position),
        ) ??
        (ast.spread === undefined
          ? undefined
          : goToDefinitionOfExpr(ast.spread, position))
      );

    case "if":
      return (
        goToDefinitionOfExpr(ast.condition, position) ??
        goToDefinitionOfExpr(ast.then, position) ??
        goToDefinitionOfExpr(ast.else, position)
      );

    case "block*":
      return (
        firstBy(
          ast.statements.map((st) => st.value),
          (arg) => goToDefinitionOfExpr(arg, position),
        ) ?? goToDefinitionOfExpr(ast.returning, position)
      );

    case "let":
      return (
        goToDefinitionOfExpr(ast.value, position) ??
        goToDefinitionOfExpr(ast.body, position)
      );

    case "match":
      return (
        goToDefinitionOfExpr(ast.expr, position) ??
        firstBy(
          ast.clauses,
          ([pattern, expr]) =>
            goToDefinitionOfPattern(pattern, position) ??
            goToDefinitionOfExpr(expr, position),
        )
      );

    case "syntax-err":
      return;
  }
}

function goToDefinitionOfPattern(
  pattern: TypedMatchPattern,
  position: Position,
): Location | undefined {
  if (!contains(pattern, position)) {
    return;
  }

  switch (pattern.type) {
    case "lit":
    case "identifier":
      return;

    case "constructor":
      for (const arg of pattern.args) {
        const res = goToDefinitionOfPattern(arg, position);
        if (res !== undefined) {
          return res;
        }
      }

      if (pattern.$resolution === undefined) {
        return undefined;
      }

      return resolutionToLocation(pattern.$resolution);
  }
}

function resolutionToLocation(resolution: IdentifierResolution): Location {
  switch (resolution.type) {
    case "local-variable":
      return { namespace: undefined, range: resolution.binding.range };
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
