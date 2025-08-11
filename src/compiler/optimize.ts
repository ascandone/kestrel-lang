import * as ir from "./ir";

export type Ctx = undefined;
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
  private readonly ctx: Ctx = undefined;

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

  /**
   * Traverse the whole expr by applying the rule recursively and track if any changes happenede
   */
  private traverseOnce(expr: ir.Expr): ir.Expr {
    const newExpr = this.runOnce(expr);
    if (newExpr !== expr) {
      return newExpr;
    }

    switch (expr.type) {
      case "constant":
      case "identifier":
      case "field-access":
        return expr;

      case "application":
        return {
          type: "application",
          caller: this.traverseOnce(expr.caller),
          args: expr.args.map((arg) => this.traverseOnce(arg)),
        };

      case "struct-literal":
        return {
          type: "struct-literal",
          fields: expr.fields,
          struct: expr.struct,
          spread:
            expr.spread === undefined
              ? undefined
              : this.traverseOnce(expr.spread),
        };

      case "fn":
        return {
          type: "fn",
          bindings: expr.bindings,
          body: this.traverseOnce(expr.body),
        };

      case "let":
        return {
          type: "let",
          binding: expr.binding,
          value: this.traverseOnce(expr.value),
          body: this.traverseOnce(expr.body),
        };

      case "if":
        return {
          type: "if",
          condition: this.traverseOnce(expr.condition),
          then: this.traverseOnce(expr.then),
          else: this.traverseOnce(expr.else),
        };

      case "match":
        return {
          type: "match",
          expr: this.traverseOnce(expr.expr),
          clauses: expr.clauses.map(
            ([pat, clause]) => [pat, this.traverseOnce(clause)] as const,
          ),
        };
    }
  }
}

export function applyRule(rule: Rule, program: ir.Program): ir.Program {
  return new Rewriter(rule).run(program);
}
