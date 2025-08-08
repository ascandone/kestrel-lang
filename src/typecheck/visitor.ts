import { TypedExpr, TypedMatchPattern } from "./typedAst";

export abstract class Visitor {
  // TODO statically make sure all switch are taken care of
  protected visitExpr(expr: TypedExpr): void {
    switch (expr.type) {
      case "syntax-err":
        return;

      case "constant":
        return;

      case "identifier":
        this.onIdentifier?.(expr);
        return;

      case "if":
        this.visitIf(expr);
        return;

      case "let":
        this.visitLet(expr);
        return;

      case "application":
        this.visitApplication(expr);
        return;

      case "fn":
        this.visitFn(expr);
        return;

      case "match":
        this.visitMatch(expr);
        return;

      case "list-literal":
        for (const subExpr of expr.values) {
          this.visitExpr(subExpr);
        }
        return;

      case "field-access":
      case "struct-literal":
        throw new Error("TODO unimplemented");
    }
  }

  protected onPatternIdentifier?(
    expr: TypedMatchPattern & { type: "identifier" },
  ): void;
  protected onPatternConstructor?(
    expr: TypedMatchPattern & { type: "constructor" },
  ): void;

  private visitPattern(expr: TypedMatchPattern): void {
    switch (expr.type) {
      case "lit":
        return;

      case "identifier":
        this.onPatternIdentifier?.(expr);
        return;

      case "constructor":
        for (const arg of expr.args) {
          this.visitPattern(arg);
        }
    }
  }

  protected onIdentifier?(expr: TypedExpr & { type: "identifier" }): void;

  protected onLet?(expr: TypedExpr & { type: "let" }): VoidFunction | undefined;
  private visitLet(expr: TypedExpr & { type: "let" }) {
    const onExit = this.onLet?.(expr);
    this.visitPattern?.(expr.pattern);
    this.visitExpr(expr.body);
    this.visitExpr(expr.value);
    onExit?.();
  }

  private visitIf(expr: TypedExpr & { type: "if" }) {
    this.visitExpr(expr.condition);
    this.visitExpr(expr.then);
    this.visitExpr(expr.else);
  }

  private visitApplication(expr: TypedExpr & { type: "application" }) {
    this.visitExpr(expr.caller);
    for (const arg of expr.args) {
      this.visitExpr(arg);
    }
  }

  protected onFn?(expr: TypedExpr & { type: "fn" }): VoidFunction | undefined;
  private visitFn(expr: TypedExpr & { type: "fn" }) {
    const onExit = this.onFn?.(expr);
    for (const param of expr.params) {
      this.visitPattern?.(param);
    }
    this.visitExpr(expr.body);
    onExit?.();
  }

  protected onMatchClause?(pattern: TypedMatchPattern, then: TypedExpr): void;

  private visitMatch(expr: TypedExpr & { type: "match" }) {
    this.visitExpr(expr.expr);
    for (const [pattern, then] of expr.clauses) {
      this.onMatchClause?.(pattern, then);
      this.visitPattern(pattern);
      this.visitExpr(then);
    }
  }
}
