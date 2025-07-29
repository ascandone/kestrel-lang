import { Position } from "vscode-languageserver";
import {
  Identifier,
  IdentifierResolution,
  TypedDeclaration,
  TypedModule,
} from "../typedAst";
import { contains, foldTree, statementByOffset } from "./common";

export type References = {
  resolution: IdentifierResolution;
  references: Array<[string, Identifier]>;
};

// TODO also rename exposed imports
export function findReferences(
  namespace: string,
  position: Position,
  typedProject: Record<string, TypedModule>,
): References | undefined {
  const srcModule = typedProject[namespace];
  if (srcModule === undefined) {
    throw new Error("[unreachable] module not found");
  }

  const statement = statementByOffset(srcModule, position);
  if (statement === undefined) {
    return undefined;
  }

  switch (statement.type) {
    case "declaration":
      if (!contains(statement.declaration.binding, position)) {
        return undefined;
      }

      return {
        resolution: {
          type: "global-variable",
          declaration: statement.declaration,
          namespace,
        },
        references: findReferencesOfDeclaration(
          statement.declaration,
          typedProject,
        ),
      };

    case "type-declaration":
      return undefined;
    case "import":
      return undefined;
  }
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
            expr.$resolution !== undefined &&
            expr.$resolution.type === "global-variable" &&
            expr.$resolution.declaration === declaration
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
