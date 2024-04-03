import { Span } from "../../parser";
import {
  IdentifierResolution,
  TypedExpr,
  TypedMatchPattern,
  TypedModule,
  TypedTypeAst,
} from "../typedAst";
import { contains, firstBy } from "./common";

export type Location = {
  namespace?: string;
  span: Span;
};

export function goToDefinitionOf(
  module: TypedModule,
  offset: number,
): Location | undefined {
  for (const import_ of module.imports) {
    if (!contains(import_, offset)) {
      continue;
    }

    for (const exposing of import_.exposing) {
      if (!contains(exposing, offset)) {
        continue;
      }

      switch (exposing.type) {
        case "type":
          if (exposing.resolved === undefined) {
            return undefined;
          }

          return { namespace: import_.ns, span: exposing.resolved.span };

        case "value":
          if (exposing.declaration === undefined) {
            return undefined;
          }

          return {
            namespace: import_.ns,
            span: exposing.declaration.span,
          };
      }
    }
  }

  for (const t of module.typeDeclarations) {
    if (t.type === "extern") {
      continue;
    }

    if (!contains(t, offset)) {
      continue;
    }

    const ret = firstBy(t.variants, (variant) => {
      if (!contains(variant, offset)) {
        return undefined;
      }

      return firstBy(variant.args, (arg) =>
        goToDefinitionOfTypeAst(arg, offset),
      );
    });

    if (ret !== undefined) {
      return ret;
    }
  }

  for (const st of module.declarations) {
    if (!contains(st, offset)) {
      continue;
    }

    if (st.typeHint !== undefined) {
      const ret = goToDefinitionOfTypeAst(st.typeHint, offset);
      if (ret !== undefined) {
        return ret;
      }
    }

    return st.extern ? undefined : goToDefinitionOfExpr(st.value, offset);
  }

  return undefined;
}

function goToDefinitionOfTypeAst(
  t: TypedTypeAst,
  offset: number,
): Location | undefined {
  if (!contains(t, offset)) {
    return undefined;
  }

  switch (t.type) {
    case "var":
    case "any":
      return undefined;
    case "named": {
      const ret = firstBy(t.args, (arg) =>
        goToDefinitionOfTypeAst(arg, offset),
      );

      if (ret !== undefined) {
        return ret;
      }

      if (t.resolution === undefined) {
        return undefined;
      }

      return {
        span: t.resolution.declaration.span,
        namespace: t.resolution.namespace,
      };
    }

    case "fn": {
      return (
        firstBy(t.args, (arg) => goToDefinitionOfTypeAst(arg, offset)) ??
        goToDefinitionOfTypeAst(t.return, offset)
      );
    }
  }
}

function goToDefinitionOfExpr(
  ast: TypedExpr,
  offset: number,
): Location | undefined {
  if (!contains(ast, offset)) {
    return undefined;
  }

  switch (ast.type) {
    case "constant":
      return undefined;

    case "identifier":
      if (ast.resolution === undefined) {
        return undefined;
      }
      return resolutionToLocation(ast.resolution);

    case "fn":
      return goToDefinitionOfExpr(ast.body, offset);

    case "application":
      return (
        goToDefinitionOfExpr(ast.caller, offset) ??
        firstBy(ast.args, (arg) => goToDefinitionOfExpr(arg, offset))
      );

    case "if":
      return (
        goToDefinitionOfExpr(ast.condition, offset) ??
        goToDefinitionOfExpr(ast.then, offset) ??
        goToDefinitionOfExpr(ast.else, offset)
      );

    case "let":
      return (
        goToDefinitionOfExpr(ast.value, offset) ??
        goToDefinitionOfExpr(ast.body, offset)
      );

    case "match":
      return (
        goToDefinitionOfExpr(ast.expr, offset) ??
        firstBy(
          ast.clauses,
          ([pattern, expr]) =>
            goToDefinitionOfPattern(pattern, offset) ??
            goToDefinitionOfExpr(expr, offset),
        )
      );
  }
}

function goToDefinitionOfPattern(
  pattern: TypedMatchPattern,
  offset: number,
): Location | undefined {
  if (!contains(pattern, offset)) {
    return;
  }

  switch (pattern.type) {
    case "lit":
    case "identifier":
      return;

    case "constructor":
      for (const arg of pattern.args) {
        const res = goToDefinitionOfPattern(arg, offset);
        if (res !== undefined) {
          return res;
        }
      }

      if (pattern.resolution === undefined) {
        return undefined;
      }

      return resolutionToLocation(pattern.resolution);
  }
}

function resolutionToLocation(resolution: IdentifierResolution): Location {
  switch (resolution.type) {
    case "local-variable":
      return { namespace: undefined, span: resolution.binding.span };
    case "global-variable":
      return {
        namespace: resolution.namespace,
        span: resolution.declaration.binding.span,
      };
    case "constructor":
      return {
        namespace: resolution.namespace,
        span: resolution.variant.span,
      };
  }
}
