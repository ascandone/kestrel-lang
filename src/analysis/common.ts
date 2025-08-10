import { Position, contains } from "../parser";
import {
  TypedDeclaration,
  TypedImport,
  TypedModule,
  TypedTypeDeclaration,
} from "../typecheck/typedAst";

export function firstBy<T, U>(
  r: T[],
  f: (t: T) => U | undefined,
): U | undefined {
  for (const t of r) {
    const res = f(t);
    if (res !== undefined) {
      return res;
    }
  }
  return undefined;
}

export type StatementType =
  | {
      type: "declaration";
      declaration: TypedDeclaration;
    }
  | {
      type: "type-declaration";
      typeDeclaration: TypedTypeDeclaration;
    }
  | {
      type: "import";
      import: TypedImport;
    };

export function statementByOffset(
  module: TypedModule,
  position: Position,
): StatementType | undefined {
  // TODO this can be optimized with a binary search
  // or at least with an early exit
  for (const declaration of module.declarations) {
    if (contains(declaration, position)) {
      return { type: "declaration", declaration };
    }
  }

  for (const import_ of module.imports) {
    if (contains(import_, position)) {
      return { type: "import", import: import_ };
    }
  }

  for (const typeDeclaration of module.typeDeclarations) {
    if (contains(typeDeclaration, position)) {
      return { type: "type-declaration", typeDeclaration };
    }
  }

  return undefined;
}
