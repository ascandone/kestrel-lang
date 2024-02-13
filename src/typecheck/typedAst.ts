import {
  Binding,
  Declaration,
  ExposedValue,
  Expr,
  Import,
  MatchPattern,
  Span,
  SpanMeta,
  TypeDeclaration,
  TypeVariant,
} from "../parser";
import { TypeMeta } from "./typecheck";
import { Poly, Type } from "./unify";

export type IdentifierResolution =
  | {
      type: "local-variable";
      binding: Binding<TypeMeta>;
    }
  | {
      type: "global-variable";
      declaration: TypedDeclaration;
      namespace?: string;
    }
  | {
      type: "constructor";
      variant: TypedTypeVariant;
      namespace?: string;
    };

export type IdentifierResolutionMeta = {
  resolution: IdentifierResolution | undefined;
};
export type TypedMatchPattern = MatchPattern<
  TypeMeta,
  IdentifierResolutionMeta
>;
export type TypedExpr = Expr<TypeMeta, IdentifierResolutionMeta>;

export type TypedExposing = ExposedValue<
  { resolved?: TypedTypeDeclaration },
  { declaration?: TypedDeclaration }
>;

export type TypedImport = Import<TypedExposing>;

export type PolyTypeMeta = { poly: Type<Poly> };
export type TypedTypeVariant = TypeVariant<PolyTypeMeta>;
export type TypedTypeDeclaration = TypeDeclaration<PolyTypeMeta>;

export type TypedDeclaration = Declaration<TypeMeta, IdentifierResolutionMeta>;

export type TypedModule = {
  imports: TypedImport[];
  typeDeclarations: TypedTypeDeclaration[];
  declarations: TypedDeclaration[];
};

function exprByOffset(ast: TypedExpr, offset: number): Node | undefined {
  if (!spanContains(ast.span, offset)) {
    return;
  }

  switch (ast.type) {
    case "constant":
    case "identifier":
      return ast;
    case "application":
      for (const arg of ast.args) {
        const t = exprByOffset(arg, offset);
        if (t !== undefined) {
          return t;
        }
      }
      return exprByOffset(ast.caller, offset) ?? ast;

    case "let":
      if (spanContains(ast.binding.span, offset)) {
        return ast.binding;
      }
      return (
        exprByOffset(ast.value, offset) ?? exprByOffset(ast.body, offset) ?? ast
      );

    case "fn":
      for (const param of ast.params) {
        if (spanContains(param.span, offset)) {
          return param;
        }
      }
      return exprByOffset(ast.body, offset) ?? ast;

    case "if":
      return (
        exprByOffset(ast.condition, offset) ??
        exprByOffset(ast.then, offset) ??
        exprByOffset(ast.else, offset) ??
        ast
      );

    case "match":
      for (const [binding, expr] of ast.clauses) {
        const t =
          matchExprByOffset(binding, offset) ?? exprByOffset(expr, offset);
        if (t !== undefined) {
          return t;
        }
      }

      return exprByOffset(ast.expr, offset) ?? ast;
  }
}

export type Node = TypeMeta & SpanMeta;
function matchExprByOffset(
  ast: MatchPattern<TypeMeta>,
  offset: number,
): Node | undefined {
  if (!spanContains(ast.span, offset)) {
    return;
  }

  switch (ast.type) {
    case "identifier":
      return ast;

    case "constructor":
      for (const arg of ast.args) {
        const t = matchExprByOffset(arg, offset);
        if (t !== undefined) {
          return t;
        }
      }
      return ast;
  }
}

export function declByOffset(
  module: TypedModule,
  offset: number,
): Node | undefined {
  for (const st of module.declarations) {
    if (!spanContains(st.span, offset)) {
      continue;
    }

    if (spanContains(st.binding.span, offset)) {
      return st.binding;
    }

    return st.extern ? undefined : exprByOffset(st.value, offset);
  }

  return undefined;
}

function spanContains([start, end]: Span, offset: number) {
  return start <= offset && end >= offset;
}

export function goToDefinitionOf(
  module: TypedModule,
  offset: number,
): IdentifierResolution | undefined {
  for (const st of module.declarations) {
    if (!spanContains(st.span, offset)) {
      continue;
    }

    return st.extern ? undefined : goToDefinitionOfExpr(st.value, offset);
  }

  return undefined;
}

function goToDefinitionOfExpr(
  ast: TypedExpr,
  offset: number,
): IdentifierResolution | undefined {
  if (!spanContains(ast.span, offset)) {
    return;
  }

  switch (ast.type) {
    case "identifier":
      return ast.resolution;

    case "constant":
      return undefined;

    case "application":
      for (const arg of ast.args) {
        const t = goToDefinitionOfExpr(arg, offset);
        if (t !== undefined) {
          return t;
        }
      }
      return goToDefinitionOfExpr(ast.caller, offset);

    case "let":
      return (
        goToDefinitionOfExpr(ast.value, offset) ??
        goToDefinitionOfExpr(ast.body, offset)
      );

    case "fn":
      for (const param of ast.params) {
        if (spanContains(param.span, offset)) {
          return undefined;
        }
      }
      return goToDefinitionOfExpr(ast.body, offset);

    case "if":
      return (
        goToDefinitionOfExpr(ast.condition, offset) ??
        goToDefinitionOfExpr(ast.then, offset) ??
        goToDefinitionOfExpr(ast.else, offset)
      );

    case "match":
      for (const [pattern, expr] of ast.clauses) {
        const t =
          goToDefinitionOfPattern(pattern, offset) ??
          goToDefinitionOfExpr(expr, offset);

        if (t !== undefined) {
          return t;
        }
      }

      return goToDefinitionOfExpr(ast.expr, offset);
  }
}

function goToDefinitionOfPattern(
  pattern: TypedMatchPattern,
  offset: number,
): IdentifierResolution | undefined {
  if (!spanContains(pattern.span, offset)) {
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

      return pattern.resolution;
  }
}
