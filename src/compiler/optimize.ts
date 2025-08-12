import * as ir from "./ir";
import { foldTree } from "./ir/visitors";

export type Ctx = object;
export type Rule = (expr: ir.Expr, ctx: Ctx) => ir.Expr;

/**
 * Turn:
 * ```kestrel
 * (fn x { x + 1 }) (y)
 * ```
 *
 * into:
 *
 * ```kestrel
 * {
 *   let x = y;
 *   x + 1
 * }
 * ```
 *
 * It works with 0-n arguments
 */
export const foldIIF: Rule = (expr) => {
  if (expr.type !== "application" || expr.caller.type !== "fn") {
    return expr;
  }

  return expr.caller.bindings.reduceRight((body, binding, index): ir.Expr => {
    // TODO throw if params do not match
    const matchingArg = expr.args[index]!;
    return {
      type: "let",
      binding,
      value: matchingArg,
      body,
    };
  }, expr.caller.body);
};

/**
 * inline the let binding if one of the 2 things happen:
 *
 * 1. the value is a simple expression: an identifier or a literal
 * 2. the value only occurs at most once in the body, and it never appears within a lambda
 *
 * for example:
 *
 * rule 1:
 * ```kestrel
 * // before:
 * { let x = 42; x + x }
 *
 * // after:
 * 42 + 42
 * ```
 *
 * rule 2:
 * ```kestrel
 * // from
 * { let x = complex_expr(); 1 + x }
 * // to
 * 1 + complex_expr()
 * ```
 *
 * while evaluating the rule 2, we must make sure we don't cross fn boundaries, in order not to introduce perf regression
 * for example:
 * ```kestrel
 * let my_fn = {
 *   let cached = expensive_fn();
 *   fn { cached }
 * }
 * ```
 * in this case, if we were to apply the rewrite rule, we'd prevent the user to cache the value once,
 * and the value would be computed again on every call of my_fn()
 */
export const inlineLet: Rule = (expr) => {
  if (expr.type !== "let") {
    return expr;
  }

  switch (expr.value.type) {
    case "constant":
    case "identifier":
      return substitute(expr.body, expr.binding, expr.value);
  }

  // TODO implement rule 2
  return expr;
};

function localIdentEq(
  x: ir.Ident & { type: "local" },
  y: ir.Ident & { type: "local" },
) {
  return (
    x.name === y.name &&
    x.unique === y.unique &&
    x.declaration.equals(y.declaration)
  );
}

const substitute = (
  expr: ir.Expr,
  binding: ir.Ident & { type: "local" },
  with_: ir.Expr,
) =>
  foldTree(expr, (expr, next) => {
    if (
      expr.type === "identifier" &&
      expr.ident.type === "local" &&
      localIdentEq(expr.ident, binding)
    ) {
      return with_;
    }

    return next();
  });

/**
 * Rules composition: evaluates rules one at a time once, over the result of the previous rule
 * */
export const composeRules = (rules: Rule[]): Rule =>
  rules.reduce((prev, next) => (expr, ctx) => next(prev(expr, ctx), ctx));

export const allOptimizations = composeRules([foldIIF]);

/**
 * An higher-order rule that evaluates the given rule until it reaches a fixedpoint
 * */
export const findFixedPoint =
  (rule: Rule): Rule =>
  (expr, ctx) => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const newResult = rule(expr, ctx);
      if (newResult === expr) {
        return expr;
      }
      expr = newResult;
    }
  };

class Rewriter {
  private readonly ctx: Ctx = {};

  constructor(private readonly rule: Rule) {}

  private didChange = false;

  public run(program: ir.Program): ir.Program {
    return {
      ...program,
      values: program.values.map((decl) => ({
        ...decl,
        value: this.findFixPoint(decl.value),
      })),
    };
  }

  // It feels like we're computing the fixed point so many times more than we'd need to
  private runOnce(expr: ir.Expr) {
    const out = this.rule(expr, this.ctx);
    if (out !== expr) {
      this.didChange = true;
    }
    return out;
  }

  private findFixPoint(expr: ir.Expr): ir.Expr {
    do {
      this.didChange = false;
      expr = this.traverseOnce(expr);
      // There's no point in comparing expr with the new expr, as newExpr is always different
      // thus we'll check the flag
    } while (this.didChange);
    return expr;
  }

  private traverseOnce(expr: ir.Expr): ir.Expr {
    return foldTree(expr, (expr, next) => {
      const newExpr = this.runOnce(expr);
      if (newExpr !== expr) {
        return newExpr;
      }
      return next();
    });
  }
}

export function applyRule(rule: Rule, program: ir.Program): ir.Program {
  return new Rewriter(rule).run(program);
}
