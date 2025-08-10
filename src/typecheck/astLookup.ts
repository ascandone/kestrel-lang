import { firstBy } from "../analysis/common";
import { Position, contains } from "../parser";
import { TypedExpr, TypedMatchPattern } from "./typedAst";

export type FinderCallback<Node, T> = (
  node: Node,
  next: () => T | undefined,
) => T | undefined;

export type FinderOptions<T> = {
  onExpression?: FinderCallback<TypedExpr, T>;
  onMatchPattern?: FinderCallback<TypedMatchPattern, T>;
};

export class Finder<T> {
  constructor(
    private readonly position: Position,
    private readonly opts: FinderOptions<T>,
  ) {}

  private visitPattern_(expr: TypedMatchPattern): T | undefined {
    switch (expr.type) {
      case "identifier":
      case "lit":
        return undefined;

      case "constructor":
        return firstBy(expr.args, (arg) => this.visitPattern(arg));
    }
  }

  public visitPattern(expr: TypedMatchPattern): T | undefined {
    if (!contains(expr, this.position)) {
      return undefined;
    }

    return this.opts.onMatchPattern?.(expr, () => this.visitPattern_(expr));
  }

  private visitExpr_(expr: TypedExpr): T | undefined {
    switch (expr.type) {
      case "syntax-err":
      case "constant":
      case "identifier":
        return;

      case "block":
        return (
          firstBy(
            expr.statements,
            (st) => this.visitPattern(st.pattern) ?? this.visitExpr(st.value),
          ) ?? this.visitExpr(expr.returning)
        );

      case "if":
        return (
          this.visitExpr(expr.condition) ??
          this.visitExpr(expr.then) ??
          this.visitExpr(expr.else)
        );

      case "application":
        return (
          this.visitExpr(expr.caller) ??
          firstBy(expr.args, (arg) => this.visitExpr(arg))
        );

      case "fn":
        return (
          firstBy(expr.params, (p) => this.visitPattern(p)) ??
          this.visitExpr(expr.body)
        );

      case "match":
        return (
          this.visitExpr(expr.expr) ??
          firstBy(
            expr.clauses,
            ([p, c]) => this.visitPattern(p) ?? this.visitExpr(c),
          )
        );

      case "list-literal":
        return firstBy(expr.values, (v) => this.visitExpr(v));

      case "field-access":
        return this.visitExpr(expr.struct);

      case "struct-literal":
        return (
          firstBy(expr.fields, (f) => this.visitExpr(f.value)) ??
          (expr.spread === undefined ? undefined : this.visitExpr(expr.spread))
        );

      default:
        return expr satisfies never;
    }
  }

  public visitExpr(expr: TypedExpr): T | undefined {
    if (!contains(expr, this.position)) {
      return undefined;
    }

    return this.opts.onExpression?.(expr, () => this.visitExpr_(expr));
  }
}

export function bindingFinder(position: Position) {
  return new Finder<TypedMatchPattern & { type: "identifier" }>(position, {
    onMatchPattern(expr, next) {
      switch (expr.type) {
        case "identifier":
          return expr;

        default:
          return next();
      }
    },
  });
}
