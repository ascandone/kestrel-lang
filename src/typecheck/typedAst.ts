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
import { Type, TypeScheme, typeToString } from "./type";

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
export type TypedExpr = Expr<TypeMeta, IdentifierResolutionMeta, never>;

export type TypedExposing = ExposedValue<
  { resolved?: TypedTypeDeclaration },
  { declaration?: TypedDeclaration }
>;

export type TypedImport = Import<TypedExposing>;

export type PolyTypeMeta = { scheme: TypeScheme; mono: Type };
export type TypedTypeVariant = TypeVariant<PolyTypeMeta>;
export type TypedTypeDeclaration = TypeDeclaration<PolyTypeMeta>;

export type TypedDeclaration = { scheme: TypeScheme } & Declaration<
  TypeMeta,
  IdentifierResolutionMeta,
  never
>;

export type TypedModule = {
  imports: TypedImport[];
  typeDeclarations: TypedTypeDeclaration[];
  declarations: TypedDeclaration[];
};

export type Node = TypeMeta & SpanMeta;

export type HoveredInfo = IdentifierResolution;
export type Hovered = SpanMeta & { hovered: HoveredInfo };

export function hoverOn(
  module: TypedModule,
  offset: number,
): [TypeScheme, Hovered] | undefined {
  for (const typeDecl of module.typeDeclarations) {
    if (!contains(typeDecl, offset)) {
      continue;
    }

    if (typeDecl.type !== "adt") {
      continue;
    }

    for (const variant of typeDecl.variants) {
      if (!contains(variant, offset)) {
        continue;
      }

      return [
        variant.scheme,
        {
          span: variant.span,
          hovered: { type: "constructor", variant },
        },
      ];
    }
  }

  for (const decl of module.declarations) {
    const d = hoverOnDecl(decl, offset);
    if (d !== undefined) {
      return [decl.scheme, d];
    }
  }

  return undefined;
}

export function hoverToMarkdown(
  scheme: TypeScheme,
  { hovered }: Hovered,
): string {
  switch (hovered.type) {
    case "local-variable": {
      const tpp = typeToString(hovered.binding.$.asType(), scheme);
      return `\`\`\`
${hovered.binding.name}: ${tpp}
\`\`\`
local declaration
`;
    }

    case "global-variable": {
      const tpp = typeToString(
        hovered.declaration.binding.$.asType(),
        hovered.declaration.scheme,
      );
      return `\`\`\`
${hovered.declaration.binding.name}: ${tpp}
\`\`\`
global declaration
`;
    }

    case "constructor": {
      const tpp = typeToString(hovered.variant.mono, hovered.variant.scheme);
      return `\`\`\`
${hovered.variant.name}: ${tpp}
\`\`\`
type constructor
`;
    }
  }
}

function hoverOnDecl(
  declaration: TypedDeclaration,
  offset: number,
): Hovered | undefined {
  if (contains(declaration.binding, offset)) {
    return {
      span: declaration.binding.span,
      hovered: { type: "global-variable", declaration },
    };
  }

  if (!declaration.extern && contains(declaration.value, offset)) {
    return hoverOnExpr(declaration.value, offset);
  }

  return undefined;
}

function hoverOnExpr(expr: TypedExpr, offset: number): Hovered | undefined {
  if (!contains(expr, offset)) {
    return undefined;
  }

  switch (expr.type) {
    case "constant":
      return undefined;

    case "identifier":
      if (expr.resolution === undefined) {
        return undefined;
      }
      return {
        span: expr.span,
        hovered: expr.resolution,
      };

    case "fn":
      return (
        hoverOnExpr(expr.body, offset) ??
        firstBy(expr.params, (param): Hovered | undefined => {
          if (!contains(param, offset)) {
            return undefined;
          }

          return {
            span: param.span,
            hovered: { type: "local-variable", binding: param },
          };
        })
      );

    case "application":
      return (
        hoverOnExpr(expr.caller, offset) ??
        firstBy(expr.args, (arg) => hoverOnExpr(arg, offset))
      );

    case "if":
      return (
        hoverOnExpr(expr.condition, offset) ??
        hoverOnExpr(expr.then, offset) ??
        hoverOnExpr(expr.else, offset)
      );

    case "let":
      if (contains(expr.binding, offset)) {
        return {
          span: expr.binding.span,
          hovered: { type: "local-variable", binding: expr.binding },
        };
      }

      return hoverOnExpr(expr.value, offset) ?? hoverOnExpr(expr.body, offset);

    case "match":
      return (
        hoverOnExpr(expr.expr, offset) ??
        firstBy(
          expr.clauses,
          ([pattern, expr]) =>
            hoverOnPattern(pattern, offset) ?? hoverOnExpr(expr, offset),
        )
      );
  }
}

function hoverOnPattern(
  pattern: TypedMatchPattern,
  offset: number,
): Hovered | undefined {
  if (!contains(pattern, offset)) {
    return undefined;
  }

  switch (pattern.type) {
    case "identifier":
      return {
        span: pattern.span,
        hovered: { type: "local-variable", binding: pattern },
      };

    case "constructor":
      return firstBy(pattern.args, (argPattern) =>
        hoverOnPattern(argPattern, offset),
      );

    case "lit":
      return undefined;
  }
}

function firstBy<T, U>(r: T[], f: (t: T) => U | undefined): U | undefined {
  for (const t of r) {
    const res = f(t);
    if (res !== undefined) {
      return res;
    }
  }
  return undefined;
}

function contains(spanned: SpanMeta, offset: number) {
  const [start, end] = spanned.span;
  return start <= offset && end >= offset;
}

function spanContains([start, end]: Span, offset: number) {
  return start <= offset && end >= offset;
}

export type Location = {
  namespace?: string;
  span: Span;
};

export function goToDefinitionOf(
  module: TypedModule,
  offset: number,
): Location | undefined {
  for (const import_ of module.imports) {
    if (!spanContains(import_.span, offset)) {
      continue;
    }

    for (const exposing of import_.exposing) {
      if (!spanContains(exposing.span, offset)) {
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

  for (const st of module.declarations) {
    if (!spanContains(st.span, offset)) {
      continue;
    }

    return st.extern ? undefined : goToDefinitionOfExpr(st.value, offset);
  }

  return undefined;
}

function resolutionToLocation(resolution: IdentifierResolution): Location {
  switch (resolution.type) {
    case "local-variable":
      return { namespace: undefined, span: resolution.binding.span };
    case "global-variable":
      return {
        namespace: resolution.namespace,
        span: resolution.declaration.span,
      };
    case "constructor":
      return {
        namespace: resolution.namespace,
        span: resolution.variant.span,
      };
  }
}

function goToDefinitionOfExpr(
  ast: TypedExpr,
  offset: number,
): Location | undefined {
  if (!spanContains(ast.span, offset)) {
    return;
  }

  switch (ast.type) {
    case "identifier":
      if (ast.resolution === undefined) {
        return undefined;
      }
      return resolutionToLocation(ast.resolution);

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
): Location | undefined {
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

      if (pattern.resolution === undefined) {
        return undefined;
      }

      return resolutionToLocation(pattern.resolution);
  }
}
