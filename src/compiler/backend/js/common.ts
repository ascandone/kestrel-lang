import * as t from "@babel/types";
import * as ir from "../../ir";

export const TAG_FIELD: t.Identifier = { type: "Identifier", name: "$" };

export type AdtReprType = "default" | "enum" | "unboxed";
// TODO(perf) cache this using weakmap
export function getAdtReprType(decl: ir.Adt): AdtReprType {
  if (decl.constructors.length === 1 && decl.constructors[0]!.arity === 1) {
    return "unboxed";
  }

  const isEnum = decl.constructors.every((v) => v.arity === 0);
  if (isEnum) {
    return "enum";
  }

  return "default";
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
