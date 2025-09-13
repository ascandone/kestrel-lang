import * as ir from "../ir";
import { foldTree, lazyVisit, substitute } from "./visitors";

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
export const betaReduction: Rule = (expr) => {
  if (expr.type !== "application" || expr.caller.type !== "fn") {
    return expr;
  }

  return expr.caller.bindings.reduceRight((body, binding, index): ir.Expr => {
    // TODO throw if params do not match
    const matchingArg = expr.args[index]!;
    return ir.desugarLet({
      binding,
      value: matchingArg,
      body,
    });
  }, expr.caller.body);
};

/**
 * Evaluate a pattern when the constructor is called inline. For example:
 * ```kestrel
 * match Ok(1, 2) {
 *   Ok(a, b) => a + b,
 *   Err(e) => e,
 * }
 * ```
 *
 * would become:
 * ```kestrel
 * {
 *   let a = 1;
 *   let b = 2;
 *   a + b
 * }
 * ```
 */
export const foldMatch: Rule = (expr) => {
  if (
    expr.type !== "match" ||
    expr.expr.type !== "application" ||
    expr.expr.caller.type !== "identifier" ||
    expr.expr.caller.ident.type !== "constructor"
  ) {
    return expr;
  }

  for (const [pat, ret] of expr.clauses) {
    if (
      pat.type !== "constructor" ||
      pat.typeName.name !== expr.expr.caller.ident.name
    ) {
      continue;
    }

    // TODO when we'll compile pattern match into the IR, we'll get rid of this bit
    const idents = pat.args.flatMap((pat) =>
      pat.type === "identifier" ? [pat] : [],
    );
    if (idents.length !== pat.args.length) {
      return expr;
    }

    // Found matching clause: returning

    const args = expr.expr.args;
    return idents.reduceRight((prev, curr, index) => {
      const matchingArg = args[index]!;

      return ir.desugarLet({
        binding: curr.ident,
        value: matchingArg,
        body: prev,
      });
    }, ret);
  }

  return expr;
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
export const inlineLet: Rule = (expr_) => {
  const expr = ir.mkLetSugar(expr_);
  if (expr === undefined) {
    return expr_;
  }

  switch (expr.value.type) {
    case "constant":
    case "identifier":
      return substitute(expr.body, expr.binding, expr.value);
  }

  const isRecursive = bindingOccursIn(expr.value, expr.binding);
  if (isRecursive) {
    return expr_;
  }

  // else, check occurrences
  const isJustOneOcc = bindingAppearsAtMostOnce(expr.body, expr.binding);
  if (isJustOneOcc) {
    return substitute(expr.body, expr.binding, expr.value);
  }

  // TODO implement rule 2
  return expr_;
};

const bindingAppearsAtMostOnce = (
  expr: ir.Expr,
  binding: ir.Ident & { type: "local" },
) => {
  let count = 0;
  let returnValue = true;

  lazyVisit(expr, (expr, next) => {
    if (expr.type === "fn") {
      returnValue = false;
      return;
    }

    if (
      expr.type === "identifier" &&
      expr.ident.type === "local" &&
      ir.localIdentEq(expr.ident, binding)
    ) {
      count++;
    }

    if (count > 1) {
      returnValue = false;
      return;
    }

    next();
  });

  return returnValue;
};

const bindingOccursIn = (
  expr: ir.Expr,
  binding: ir.Ident & { type: "local" },
) => {
  let appears = false;

  lazyVisit(expr, (expr, next) => {
    if (
      expr.type === "identifier" &&
      expr.ident.type === "local" &&
      ir.localIdentEq(expr.ident, binding)
    ) {
      appears = true;
      return;
    }

    next();
  });

  return appears;
};

/**
 * Rules composition: evaluates rules one at a time once, over the result of the previous rule
 * */
export const composeRules = (rules: Rule[]): Rule =>
  rules.reduce((prev, next) => (expr, ctx) => next(prev(expr, ctx), ctx));

export const allOptimizations = composeRules([
  betaReduction,
  inlineLet,
  foldMatch,
]);

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
    return foldTree(expr, (expr) => this.runOnce(expr));
  }
}

export function applyRule(rule: Rule, program: ir.Program): ir.Program {
  return new Rewriter(rule).run(program);
}
