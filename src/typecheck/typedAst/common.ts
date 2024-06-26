import { SpanMeta } from "../../parser";
import {
  TypedDeclaration,
  TypedExpr,
  TypedImport,
  TypedModule,
  TypedTypeDeclaration,
} from "../typedAst";

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
  offset: number,
): StatementType | undefined {
  // TODO this can be optimized with a binary search
  // or at least with an early exit
  for (const declaration of module.declarations) {
    if (contains(declaration, offset)) {
      return { type: "declaration", declaration };
    }
  }

  for (const import_ of module.imports) {
    if (contains(import_, offset)) {
      return { type: "import", import: import_ };
    }
  }

  for (const typeDeclaration of module.typeDeclarations) {
    if (contains(typeDeclaration, offset)) {
      return { type: "type-declaration", typeDeclaration };
    }
  }

  return undefined;
}

export function contains(spanned: SpanMeta, offset: number) {
  const [start, end] = spanned.span;
  return start <= offset && end >= offset;
}

export function foldTree<T>(
  src: TypedExpr,
  acc: T,
  f: (src: TypedExpr, acc: T) => T,
): T {
  switch (src.type) {
    case "syntax-err":
    case "identifier":
    case "constant":
      return f(src, acc);

    case "list-literal":
      return src.values.reduce((acc, x) => f(x, acc), acc);

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
