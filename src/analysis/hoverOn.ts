import { Position, RangeMeta, contains } from "../parser";
import { typeToString } from "../type";
import { Finder } from "../typecheck/astLookup";
import {
  IdentifierResolution,
  TypedDeclaration,
  TypedModule,
  TypedTypeAst,
  TypedTypeDeclaration,
} from "../typecheck/typedAst";
import { firstBy, statementByOffset } from "./common";

export type HoveredInfo =
  | IdentifierResolution
  | { type: "type"; typeDecl: TypedTypeDeclaration; namespace: string }
  | { type: "field"; type_: string };

export type Hovered = RangeMeta & { hovered: HoveredInfo };

/**
 * TODO fix regression:
 * we need to make sure that here:
 * ```kestrel
 * let f: (a) -> a = fn a {
 *   let id = fn b { b };
 *   a
 * }
 * ```
 *
 * we don't show `(a) -> a` when hovering on id
 */
export function hoverOn(
  package_: string,
  namespace: string,
  module: TypedModule,
  position: Position,
): Hovered | undefined {
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

      const d = hoverOnDecl(
        package_,
        namespace,
        statement.declaration,
        position,
      );
      if (d !== undefined) {
        return d;
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

          return {
            range: variant.range,
            hovered: {
              type: "constructor",
              variant,
              declaration: statement.typeDeclaration,
              package_,
              namespace,
            },
          };
        }
      }

      return {
        range: statement.typeDeclaration.range,
        hovered: {
          type: "type",
          namespace,
          typeDecl: statement.typeDeclaration,
        },
      };

    case "import":
      return undefined;
  }
}

export function hoverOnTypeAst(
  typeAst: TypedTypeAst,
  position: Position,
): Hovered | undefined {
  if (!contains(typeAst, position)) {
    return;
  }

  switch (typeAst.type) {
    case "var":
    case "any":
      return undefined;
    case "named": {
      if (typeAst.$resolution === undefined) {
        return undefined;
      }

      const res = firstBy(typeAst.args, (arg) => hoverOnTypeAst(arg, position));
      if (res !== undefined) {
        return res;
      }

      return {
        range: typeAst.range,
        hovered: {
          type: "type",
          typeDecl: typeAst.$resolution.declaration,
          namespace: typeAst.$resolution.namespace,
        },
      };
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
  // scheme: TypeScheme,
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
      const tpp = typeToString(hovered.binding.$type.asType());
      return `\`\`\`
${hovered.binding.name}: ${tpp}
\`\`\`
local declaration
`;
    }

    case "global-variable": {
      const tpp = typeToString(hovered.declaration.binding.$type.asType());
      return `\`\`\`
${hovered.declaration.binding.name}: ${tpp}
\`\`\`
${hovered.declaration.docComment ?? ""}
`;
    }

    case "constructor": {
      const tpp = typeToString(hovered.variant.$type);
      return `\`\`\`
${hovered.variant.name}: ${tpp}
\`\`\`
type constructor
`;
    }
  }
}

function hoverOnDecl(
  package_: string,
  namespace: string,
  declaration: TypedDeclaration,
  position: Position,
): Hovered | undefined {
  if (contains(declaration.binding, position)) {
    return {
      range: declaration.binding.range,
      hovered: {
        type: "global-variable",
        package_,
        declaration,
        namespace,
      },
    };
  }

  if (!declaration.extern && contains(declaration.value, position)) {
    return hoveredFinder(position).visitExpr(declaration.value);
  }

  return undefined;
}

function hoveredFinder(position: Position) {
  return new Finder<Hovered>(position, {
    onMatchPattern(pattern, next) {
      switch (pattern.type) {
        case "identifier":
          return {
            range: pattern.range,
            hovered: { type: "local-variable", binding: pattern },
          };

        default:
          return next();
      }
    },

    onExpression(expr, next) {
      switch (expr.type) {
        case "field-access":
          if (
            !contains(expr.field, position) ||
            expr.$resolution === undefined
          ) {
            break;
          }

          return {
            hovered: {
              type: "field",
              type_: typeToString(expr.$type.asType()),
            },
            range: expr.field.range,
          };

        case "identifier":
          if (expr.$resolution === undefined) {
            break;
          }

          return {
            range: expr.range,
            hovered: expr.$resolution,
          };
      }

      return next();
    },
  });
}
