import * as ir from "../ir";

/** Strict folding */
export function foldTree(expr: ir.Expr, f: (expr: ir.Expr) => ir.Expr) {
  function step(expr: ir.Expr): ir.Expr {
    switch (expr.type) {
      case "identifier":
      case "constant":
        return expr;

      case "fn":
        return {
          type: "fn",
          bindings: expr.bindings,
          body: fold(expr.body),
        };

      case "application":
        return {
          type: "application",
          caller: fold(expr.caller),
          args: expr.args.map(fold),
        };

      case "let":
        return {
          type: "let",
          binding: expr.binding,
          value: fold(expr.value),
          body: fold(expr.body),
        };

      case "if":
        return {
          type: "if",
          condition: fold(expr.condition),
          then: fold(expr.then),
          else: fold(expr.else),
        };

      case "match":
        return {
          type: "match",
          expr: fold(expr.expr),
          clauses: expr.clauses.map(([pat, clause]) => [pat, fold(clause)]),
        };

      case "field-access":
        return {
          type: "field-access",
          field: expr.field,
          struct: fold(expr.struct),
        };

      case "struct-literal":
        return {
          type: "struct-literal",
          struct: expr.struct,
          fields: expr.fields.map((field) => ({
            name: field.name,
            expr: fold(field.expr),
          })),
          spread: expr.spread === undefined ? undefined : fold(expr.spread),
        };
    }
  }

  function fold(expr: ir.Expr): ir.Expr {
    return step(f(expr));
  }

  return fold(expr);
}
