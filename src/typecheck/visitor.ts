import { TypedExpr, TypedMatchPattern, TypedTypeAst } from "./typedAst";

type VisitOptions = {
  // TypedAst
  onNamedType?(ast: TypedTypeAst & { type: "named" }): void;

  // MatchPattern
  onMatchClause?(pattern: TypedMatchPattern, then: TypedExpr): void;
  onPatternIdentifier?(expr: TypedMatchPattern & { type: "identifier" }): void;
  onPatternConstructor?(
    expr: TypedMatchPattern & { type: "constructor" },
  ): void;

  // Expr
  onIdentifier?(expr: TypedExpr & { type: "identifier" }): void;
  onFieldAccess?(expr: TypedExpr & { type: "field-access" }): void;
  onStructLiteral?(expr: TypedExpr & { type: "struct-literal" }): void;
  onLet?(expr: TypedExpr & { type: "let" }): VoidFunction | undefined;
  onFn?(expr: TypedExpr & { type: "fn" }): VoidFunction | undefined;
};

export function visitTypeAst(ast: TypedTypeAst, opts: VisitOptions) {
  switch (ast.type) {
    case "var":
    case "any":
      // TODO any has to be handled
      return;

    case "fn":
      for (const arg of ast.args) {
        visitTypeAst(arg, opts);
      }
      visitTypeAst(ast.return, opts);
      return;

    case "named":
      opts.onNamedType?.(ast);
      for (const arg of ast.args) {
        visitTypeAst(arg, opts);
      }
      return;
  }
}

export function visitPattern(
  expr: TypedMatchPattern,
  opts: VisitOptions,
): void {
  switch (expr.type) {
    case "lit":
      return;

    case "identifier":
      opts.onPatternIdentifier?.(expr);
      return;

    case "constructor":
      opts.onPatternConstructor?.(expr);
      for (const arg of expr.args) {
        visitPattern(arg, opts);
      }
  }
}

// TODO statically make sure all switch are taken care of

export function visitExpr(expr: TypedExpr, opts: VisitOptions) {
  switch (expr.type) {
    case "syntax-err":
    case "constant":
      return;

    case "identifier":
      opts.onIdentifier?.(expr);
      return;

    case "if":
      visitExpr(expr.condition, opts);
      visitExpr(expr.then, opts);
      visitExpr(expr.else, opts);
      return;

    case "let": {
      const onExit = opts.onLet?.(expr);
      visitPattern(expr.pattern, opts);
      visitExpr(expr.body, opts);
      visitExpr(expr.value, opts);
      onExit?.();
      return;
    }

    case "application":
      visitExpr(expr.caller, opts);
      for (const arg of expr.args) {
        visitExpr(arg, opts);
      }
      return;

    case "fn": {
      const onExit = opts.onFn?.(expr);
      for (const param of expr.params) {
        visitPattern?.(param, opts);
      }
      visitExpr(expr.body, opts);
      onExit?.();
      return;
    }

    case "match":
      visitExpr(expr.expr, opts);
      for (const [pattern, then] of expr.clauses) {
        opts.onMatchClause?.(pattern, then);
        visitPattern(pattern, opts);
        visitExpr(then, opts);
      }
      return;

    case "list-literal":
      for (const subExpr of expr.values) {
        visitExpr(subExpr, opts);
      }
      return;

    case "field-access":
      opts.onFieldAccess?.(expr);
      visitExpr(expr.struct, opts);
      return;

    case "struct-literal":
      opts.onStructLiteral?.(expr);
      for (const field of expr.fields) {
        visitExpr(field.value, opts);
      }
      if (expr.spread !== undefined) {
        visitExpr(expr.spread, opts);
      }
      return;
  }
}
