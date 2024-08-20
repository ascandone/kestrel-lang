import * as t from "@babel/types";

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
