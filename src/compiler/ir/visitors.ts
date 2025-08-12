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

export function lazyVisit(
  expr: ir.Expr,
  f: (expr: ir.Expr, next: () => void) => void,
) {
  function step(expr: ir.Expr): void {
    switch (expr.type) {
      case "identifier":
      case "constant":
        return;

      case "fn":
        fold(expr.body);
        return;

      case "application":
        fold(expr.caller);
        for (const arg of expr.args) {
          fold(arg);
        }
        return;

      case "let":
        fold(expr.value);
        fold(expr.body);
        return;

      case "if":
        fold(expr.condition);
        fold(expr.then);
        fold(expr.else);
        return;

      case "match":
        fold(expr.expr);
        for (const [, clause] of expr.clauses) {
          fold(clause);
        }
        return;

      case "field-access":
        fold(expr.struct);
        return;

      case "struct-literal":
        for (const field of expr.fields) {
          fold(field.expr);
        }
        if (expr.spread) {
          fold(expr.spread);
        }
        return;

      default:
        expr satisfies never;
    }
  }

  function fold(expr: ir.Expr) {
    return f(expr, () => step(expr));
  }

  return fold(expr);
}
