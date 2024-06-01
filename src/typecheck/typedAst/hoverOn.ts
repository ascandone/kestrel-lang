import { SpanMeta } from "../../parser";
import { TypeScheme, typeToString } from "../type";
import {
  IdentifierResolution,
  TypedDeclaration,
  TypedExpr,
  TypedMatchPattern,
  TypedModule,
  TypedTypeAst,
  TypedTypeDeclaration,
} from "../typedAst";
import { contains, firstBy, statementByOffset } from "./common";

export type HoveredInfo =
  | IdentifierResolution
  | { type: "type"; typeDecl: TypedTypeDeclaration; namespace: string };
export type Hovered = SpanMeta & { hovered: HoveredInfo };

export function hoverOn(
  namespace: string,
  module: TypedModule,
  offset: number,
): [TypeScheme, Hovered] | undefined {
  const statement = statementByOffset(module, offset);
  if (statement === undefined) {
    return undefined;
  }

  switch (statement.type) {
    case "declaration": {
      if (statement.declaration.typeHint !== undefined) {
        const res = hoverOnTypeAst(statement.declaration.typeHint.mono, offset);
        if (res !== undefined) {
          return res;
        }
      }

      const d = hoverOnDecl(namespace, statement.declaration, offset);
      if (d !== undefined) {
        return [statement.declaration.scheme, d];
      }
      return undefined;
    }

    case "type-declaration":
      if (statement.typeDeclaration.type === "adt") {
        for (const variant of statement.typeDeclaration.variants) {
          if (!contains(variant, offset)) {
            continue;
          }

          const res = firstBy(variant.args, (arg) =>
            hoverOnTypeAst(arg, offset),
          );
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
                declaration: statement.typeDeclaration,
                namespace,
              },
            },
          ];
        }
      }

      return [
        {},
        {
          span: statement.typeDeclaration.span,
          hovered: {
            type: "type",
            namespace,
            typeDecl: statement.typeDeclaration,
          },
        },
      ];

    case "import":
      return undefined;
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
      const tpp = typeToString(
        hovered.variant.$.asType(),
        hovered.variant.scheme,
      );
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

    case "list-literal":
      return firstBy(expr.values, (v) => hoverOnExpr(v, offset));

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

          return hoverOnPattern(param, offset);
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

    case "let": {
      if (contains(expr.pattern, offset)) {
        return hoverOnPattern(expr.pattern, offset);
      }

      return hoverOnExpr(expr.value, offset) ?? hoverOnExpr(expr.body, offset);
    }

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
