import { Position } from "vscode-languageserver";
import {
  Identifier,
  IdentifierResolution,
  TypedDeclaration,
  TypedModule,
} from "../typecheck/typedAst";
import { statementByOffset } from "./common";
import { contains } from "../parser";
import * as visitor from "../typecheck/visitor";
import { TypedProject } from "../typecheck/project";
import { nestedMapGetOrPutDefault } from "../common/defaultMap";

export type References = {
  resolution: IdentifierResolution;
  references: Array<[string, Identifier]>;
};

// TODO also rename exposed imports
export function findReferences(
  package_: string,
  moduleId: string,
  position: Position,
  typedProject: TypedProject,
): References | undefined {
  const srcModule = nestedMapGetOrPutDefault(typedProject, moduleId).get(
    package_,
  );
  if (srcModule === undefined) {
    throw new Error("[unreachable] module not found");
  }

  const statement = statementByOffset(srcModule[0], position);
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
          package_,
          namespace: moduleId,
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
  typedProject: TypedProject,
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

    visitor.visitExpr(decl.value, {
      onIdentifier(expr) {
        if (
          expr.$resolution !== undefined &&
          expr.$resolution.type === "global-variable" &&
          expr.$resolution.declaration === declaration
        ) {
          res.push(expr);
        }
      },
    });
  }

  return res;
}
