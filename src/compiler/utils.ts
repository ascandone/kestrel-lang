import * as t from "@babel/types";
import { TypedTypeDeclaration } from "../typecheck";

export const TAG_FIELD: t.Identifier = { type: "Identifier", name: "$" };

export function sanitizeNamespace(ns: string): string {
  return ns?.replace(/\//g, "$");
}

export function joinAndExprs(exprs: t.Expression[]): t.Expression {
  if (exprs.length === 0) {
    return { type: "BooleanLiteral", value: true };
  }

  return exprs.reduce(
    (left, right): t.Expression => ({
      type: "LogicalExpression",
      operator: "&&",
      left,
      right,
    }),
  );
}

// TODO utils file was a bad idea
export type AdtReprType = "default" | "enum" | "unboxed";
export function getAdtReprType(
  decl: TypedTypeDeclaration & { type: "adt" },
): AdtReprType {
  const isEnum = decl.variants.every((v) => v.args.length === 0);
  if (isEnum) {
    return "enum";
  }

  return "default";
}
