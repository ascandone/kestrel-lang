import { TypedExpr, TypedMatchPattern } from "./typedAst";

export abstract class Visitor {
  // TODO statically make sure all switch are taken care of
  public visitExpr(expr: TypedExpr): void {
    switch (expr.type) {
      case "syntax-err":
        return;

      case "constant":
        return;

      case "identifier":
        this.visitIdentifier?.(expr);
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

  protected visitPattern?(expr: TypedMatchPattern): void;
  protected visitIdentifier?(expr: TypedExpr & { type: "identifier" }): void;

  protected visitLet(expr: TypedExpr & { type: "let" }) {
    this.visitPattern?.(expr.pattern);
    this.visitExpr(expr.body);
    this.visitExpr(expr.value);
  }

  protected visitIf(expr: TypedExpr & { type: "if" }) {
    this.visitExpr(expr.condition);
    this.visitExpr(expr.then);
    this.visitExpr(expr.else);
  }

  protected visitApplication(expr: TypedExpr & { type: "application" }) {
    this.visitExpr(expr.caller);
    for (const arg of expr.args) {
      this.visitExpr(arg);
    }
  }

  protected visitFn(expr: TypedExpr & { type: "fn" }) {
    for (const param of expr.params) {
      this.visitPattern?.(param);
    }
    this.visitExpr(expr.body);
  }

  protected visitMatch(expr: TypedExpr & { type: "match" }) {
    this.visitExpr(expr.expr);
    for (const [pattern, then] of expr.clauses) {
      this.visitPattern?.(pattern);
      this.visitExpr(then);
    }
  }
}
