import {
  Binding,
  Declaration,
  ExposedValue,
  Expr,
  Import,
  MatchPattern,
  Span,
  SpanMeta,
  TypeAst,
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
      namespace: string;
    }
  | {
      type: "constructor";
      variant: TypedTypeVariant;
      namespace: string;
    };

export type TypedBinding = Binding<TypeMeta>;

export type TypeResolution = {
  declaration: TypedTypeDeclaration;
  namespace: string;
};

export type IdentifierResolutionMeta = {
  resolution: IdentifierResolution | undefined;
};
export type TypeResolutionMeta = {
  resolution: TypeResolution | undefined;
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

export type TypedTypeAst = TypeAst<TypeResolutionMeta>;
export type TypedDeclaration = { scheme: TypeScheme } & Declaration<
  TypeMeta,
  IdentifierResolutionMeta,
  TypeResolutionMeta,
  never
>;

export type TypedModule = {
  moduleDoc?: string;
  imports: TypedImport[];
  typeDeclarations: TypedTypeDeclaration[];
  declarations: TypedDeclaration[];
};

export type Node = TypeMeta & SpanMeta;

export type HoveredInfo =
  | IdentifierResolution
  | { type: "type"; typeDecl: TypedTypeDeclaration; namespace: string };
export type Hovered = SpanMeta & { hovered: HoveredInfo };

export function hoverOn(
  namespace: string,
  module: TypedModule,
  offset: number,
): [TypeScheme, Hovered] | undefined {
  for (const typeDecl of module.typeDeclarations) {
    if (!contains(typeDecl, offset)) {
      continue;
    }

    if (typeDecl.type === "adt") {
      for (const variant of typeDecl.variants) {
        if (!contains(variant, offset)) {
          continue;
        }

        const res = firstBy(variant.args, (arg) => hoverOnTypeAst(arg, offset));
        if (res !== undefined) {
          return res;
        }

        return [
          variant.scheme,
          {
            span: variant.span,
            hovered: {
              type: "constructor",
              variant,
              namespace,
            },
          },
        ];
      }
    }

    return [
      {},
      {
        span: typeDecl.span,
        hovered: { type: "type", namespace, typeDecl: typeDecl },
      },
    ];
  }

  for (const decl of module.declarations) {
    if (decl.typeHint !== undefined) {
      const res = hoverOnTypeAst(decl.typeHint, offset);
      if (res !== undefined) {
        return res;
      }
    }

    const d = hoverOnDecl(namespace, decl, offset);
    if (d !== undefined) {
      return [decl.scheme, d];
    }
  }

  return undefined;
}

type Autocompletable = {
  type: "namespace";
  namespace: string;
};

export function autocompletable(
  module: TypedModule,
  offset: number,
): Autocompletable | undefined {
  for (const decl of module.declarations) {
    const d = autocompleteDecl(decl, offset);
    if (d !== undefined) {
      return d;
    }
  }

  return undefined;
}

type FunctionSignatureHint = {
  declaration: TypedDeclaration;
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
        expr.caller.resolution === undefined ||
        expr.caller.resolution.type !== "global-variable"
      ) {
        return;
      }

      return {
        declaration: expr.caller.resolution.declaration,
      };
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

function autocompleteDecl(
  declaration: TypedDeclaration,
  offset: number,
): Autocompletable | undefined {
  if (!declaration.extern && contains(declaration.value, offset)) {
    return autocompleteExpr(declaration.value, offset);
  }

  return undefined;
}

function autocompleteExpr(
  expr: TypedExpr,
  offset: number,
): Autocompletable | undefined {
  if (!contains(expr, offset)) {
    return undefined;
  }

  switch (expr.type) {
    case "identifier": {
      if (expr.namespace !== undefined && expr.name === "") {
        return { type: "namespace", namespace: expr.namespace };
      }

      return undefined;
    }

    case "constant":
      return undefined;

    case "fn":
      return autocompleteExpr(expr.body, offset);

    case "application":
      return (
        autocompleteExpr(expr.caller, offset) ??
        firstBy(expr.args, (arg) => autocompleteExpr(arg, offset))
      );

    case "if":
      return (
        autocompleteExpr(expr.condition, offset) ??
        autocompleteExpr(expr.then, offset) ??
        autocompleteExpr(expr.else, offset)
      );

    case "let":
      return (
        autocompleteExpr(expr.value, offset) ??
        autocompleteExpr(expr.body, offset)
      );

    case "match":
      return (
        autocompleteExpr(expr.expr, offset) ??
        firstBy(expr.clauses, ([_pattern, expr]) =>
          autocompleteExpr(expr, offset),
        )
      );
  }
}

export function hoverOnTypeAst(
  typeAst: TypedTypeAst,
  offset: number,
): [TypeScheme, Hovered] | undefined {
  if (!contains(typeAst, offset)) {
    return;
  }

  switch (typeAst.type) {
    case "var":
    case "any":
      return undefined;
    case "named": {
      if (typeAst.resolution === undefined) {
        return undefined;
      }

      const res = firstBy(typeAst.args, (arg) => hoverOnTypeAst(arg, offset));
      if (res !== undefined) {
        return res;
      }

      return [
        {},
        {
          span: typeAst.span,
          hovered: {
            type: "type",
            typeDecl: typeAst.resolution.declaration,
            namespace: typeAst.resolution.namespace,
          },
        },
      ];
    }

    case "fn": {
      return (
        firstBy(typeAst.args, (arg) => hoverOnTypeAst(arg, offset)) ??
        hoverOnTypeAst(typeAst.return, offset)
      );
    }
  }
}

export function hoverToMarkdown(
  scheme: TypeScheme,
  { hovered }: Hovered,
): string {
  switch (hovered.type) {
    case "type":
      return `\`\`\`
type ${hovered.typeDecl.name}
\`\`\`

${hovered.typeDecl.docComment ?? ""}
      `;
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
${hovered.declaration.docComment ?? ""}
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
  namespace: string,
  declaration: TypedDeclaration,
  offset: number,
): Hovered | undefined {
  if (contains(declaration.binding, offset)) {
    return {
      span: declaration.binding.span,
      hovered: {
        type: "global-variable",
        declaration,
        namespace,
      },
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

export function foldTree<T>(
  src: TypedExpr,
  acc: T,
  f: (src: TypedExpr, acc: T) => T,
): T {
  switch (src.type) {
    case "identifier":
    case "constant":
      return f(src, acc);

    case "application":
      acc = foldTree(src.caller, acc, f);
      for (const arg of src.args) {
        acc = foldTree(arg, acc, f);
      }
      return acc;

    case "let":
      acc = foldTree(src.value, acc, f);
      acc = foldTree(src.body, acc, f);
      return acc;

    case "fn":
      return foldTree(src.body, acc, f);

    case "match":
      acc = foldTree(src.expr, acc, f);
      for (const [, expr] of src.clauses) {
        acc = foldTree(expr, acc, f);
      }
      return acc;
    case "if":
      acc = foldTree(src.condition, acc, f);
      acc = foldTree(src.then, acc, f);
      acc = foldTree(src.else, acc, f);
      return acc;
  }
}

export type Identifier = TypedExpr & { type: "identifier" };

export type References = {
  resolution: IdentifierResolution;
  references: Array<[string, Identifier]>;
};

// TODO also rename exposed imports
export function findReferences(
  namespace: string,
  offset: number,
  typedProject: Record<string, TypedModule>,
): References | undefined {
  const srcModule = typedProject[namespace];
  if (srcModule === undefined) {
    throw new Error("[unreachable] module not found");
  }

  for (const declaration of srcModule.declarations) {
    if (!contains(declaration, offset)) {
      continue;
    }

    if (!contains(declaration.binding, offset)) {
      return undefined;
    }

    return {
      resolution: { type: "global-variable", declaration, namespace },
      references: findReferencesOfDeclaration(declaration, typedProject),
    };
  }

  return undefined;
}

function findReferencesOfDeclaration(
  declaration: TypedDeclaration,
  typedProject: Record<string, TypedModule>,
): [string, Identifier][] {
  const ret: [string, Identifier][] = [];
  for (const [namespace, typedModule] of Object.entries(typedProject)) {
    const lookups = findReferencesOfDeclarationInModule(
      declaration,
      typedModule,
    );

    for (const l of lookups) {
      ret.push([namespace, l]);
    }
  }

  return ret;
}

function findReferencesOfDeclarationInModule(
  declaration: TypedDeclaration,
  module: TypedModule,
): Identifier[] {
  const res: Identifier[] = [];
  for (const decl of module.declarations) {
    if (decl.extern) {
      continue;
    }

    const res_ = foldTree<Identifier[]>(decl.value, [], (expr, acc) => {
      switch (expr.type) {
        case "identifier":
          if (
            expr.resolution !== undefined &&
            expr.resolution.type === "global-variable" &&
            expr.resolution.declaration === declaration
          ) {
            return acc.concat(expr);
          }

        default:
          return acc;
      }
    });

    res.push(...res_);
  }

  return res;
}
