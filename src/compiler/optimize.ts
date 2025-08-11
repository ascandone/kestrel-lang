import * as ir from "./ir";

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
export function foldIIF(expr: ir.Expr): ir.Expr {
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
}
