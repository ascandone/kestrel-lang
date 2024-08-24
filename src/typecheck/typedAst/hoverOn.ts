import { Position, RangeMeta } from "../../parser";
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
  | { type: "type"; typeDecl: TypedTypeDeclaration; namespace: string }
  | { type: "field"; type_: string };

export type Hovered = RangeMeta & { hovered: HoveredInfo };

export function hoverOn(
  namespace: string,
  module: TypedModule,
  position: Position,
): [TypeScheme, Hovered] | undefined {
  const statement = statementByOffset(module, position);
  if (statement === undefined) {
    return undefined;
  }

  switch (statement.type) {
    case "declaration": {
      if (statement.declaration.typeHint !== undefined) {
        const res = hoverOnTypeAst(
          statement.declaration.typeHint.mono,
          position,
        );
        if (res !== undefined) {
          return res;
        }
      }

      const d = hoverOnDecl(namespace, statement.declaration, position);
      if (d !== undefined) {
        return [statement.declaration.scheme, d];
      }
      return undefined;
    }

    case "type-declaration":
      if (statement.typeDeclaration.type === "adt") {
        for (const variant of statement.typeDeclaration.variants) {
          if (!contains(variant, position)) {
            continue;
          }

          const res = firstBy(variant.args, (arg) =>
            hoverOnTypeAst(arg, position),
          );
          if (res !== undefined) {
            return res;
          }

          return [
            variant.scheme,
            {
              range: variant.range,
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
          range: statement.typeDeclaration.range,
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
  position: Position,
): [TypeScheme, Hovered] | undefined {
  if (!contains(typeAst, position)) {
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

      const res = firstBy(typeAst.args, (arg) => hoverOnTypeAst(arg, position));
      if (res !== undefined) {
        return res;
      }

      return [
        {},
        {
          range: typeAst.range,
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
        firstBy(typeAst.args, (arg) => hoverOnTypeAst(arg, position)) ??
        hoverOnTypeAst(typeAst.return, position)
      );
    }
  }
}

export function hoverToMarkdown(
  scheme: TypeScheme,
  { hovered }: Hovered,
): string {
  switch (hovered.type) {
    case "field": {
      return `\`\`\`
${hovered.type_}
\`\`\`
field
`;
    }

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
  position: Position,
): Hovered | undefined {
  if (contains(declaration.binding, position)) {
    return {
      range: declaration.binding.range,
      hovered: {
        type: "global-variable",
        declaration,
        namespace,
      },
    };
  }

  if (!declaration.extern && contains(declaration.value, position)) {
    return hoverOnExpr(declaration.value, position);
  }

  return undefined;
}

function hoverOnExpr(expr: TypedExpr, position: Position): Hovered | undefined {
  if (!contains(expr, position)) {
    return undefined;
  }

  switch (expr.type) {
    case "syntax-err":
    case "constant":
      return undefined;

    case "list-literal":
      return firstBy(expr.values, (v) => hoverOnExpr(v, position));

    case "identifier":
      if (expr.resolution === undefined) {
        return undefined;
      }
      return {
        range: expr.range,
        hovered: expr.resolution,
      };

    case "fn":
      return (
        hoverOnExpr(expr.body, position) ??
        firstBy(expr.params, (param): Hovered | undefined => {
          if (!contains(param, position)) {
            return undefined;
          }

          return hoverOnPattern(param, position);
        })
      );

    case "field-access":
      if (contains(expr.field, position)) {
        if (expr.resolution === undefined) {
          return;
        }

        return {
          hovered: {
            type: "field",
            type_: typeToString(expr.$.asType()),
          },
          range: expr.field.range,
        };
      }

      return hoverOnExpr(expr.struct, position);

    case "struct-literal":
      return (
        firstBy(
          expr.fields.map((f) => f.value),
          (arg) => hoverOnExpr(arg, position),
        ) ??
        (expr.spread === undefined
          ? undefined
          : hoverOnExpr(expr.spread, position))
      );

    case "application":
      return (
        firstBy(expr.args, (arg) => hoverOnExpr(arg, position)) ??
        hoverOnExpr(expr.caller, position)
      );

    case "if":
      return (
        hoverOnExpr(expr.condition, position) ??
        hoverOnExpr(expr.then, position) ??
        hoverOnExpr(expr.else, position)
      );

    case "let": {
      if (contains(expr.pattern, position)) {
        return hoverOnPattern(expr.pattern, position);
      }

      return (
        hoverOnExpr(expr.value, position) ?? hoverOnExpr(expr.body, position)
      );
    }

    case "match":
      return (
        hoverOnExpr(expr.expr, position) ??
        firstBy(
          expr.clauses,
          ([pattern, expr]) =>
            hoverOnPattern(pattern, position) ?? hoverOnExpr(expr, position),
        )
      );
  }
}

function hoverOnPattern(
  pattern: TypedMatchPattern,
  position: Position,
): Hovered | undefined {
  if (!contains(pattern, position)) {
    return undefined;
  }

  switch (pattern.type) {
    case "identifier":
      return {
        range: pattern.range,
        hovered: { type: "local-variable", binding: pattern },
      };

    case "constructor":
      return firstBy(pattern.args, (argPattern) =>
        hoverOnPattern(argPattern, position),
      );

    case "lit":
      return undefined;
  }
}
