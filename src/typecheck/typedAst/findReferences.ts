import {
  Identifier,
  IdentifierResolution,
  TypedDeclaration,
  TypedModule,
} from "../typedAst";
import { contains, foldTree } from "./common";

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
