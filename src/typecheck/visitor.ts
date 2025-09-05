import {
  TypedBlockStatement,
  TypedExpr,
  TypedMatchPattern,
  TypedTypeAst,
} from "./typedAst";

export type VisitOptions = {
  // TypedAst
  onNamedType?(ast: TypedTypeAst & { type: "named" }): void;

  // MatchPattern
  onMatchClause?(pattern: TypedMatchPattern, then: TypedExpr): void;

  onPatternIdentifier?(
    pattern: TypedMatchPattern & { type: "identifier" },
  ): void;
  onPatternConstructor?(
    pattern: TypedMatchPattern & { type: "constructor" },
  ): void;

  // Block
  onBlockStatement?(expr: TypedBlockStatement): void;
  onBlockStatementLet?(
    stmt: TypedBlockStatement & { type: "let" },
  ): VoidFunction | void;
  onBlockStatementLetHash?(
    stmt: TypedBlockStatement & { type: "let#" },
  ): VoidFunction | void;

  // Expr
  onBlock?(expr: TypedExpr & { type: "block" }): VoidFunction | void;
  onIdentifier?(expr: TypedExpr & { type: "identifier" }): void;
  onApplication?(expr: TypedExpr & { type: "application" }): void;
  onPipe?(expr: TypedExpr & { type: "pipe" }): void;
  onFieldAccess?(expr: TypedExpr & { type: "field-access" }): void;
  onStructLiteral?(expr: TypedExpr & { type: "struct-literal" }): void;
  onFn?(expr: TypedExpr & { type: "fn" }): VoidFunction | void;
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

    default:
      ast satisfies never;
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
      return;

    default:
      expr satisfies never;
  }
}

export function visitBlockStatementLetClause(
  expr: TypedBlockStatement,
  opts: VisitOptions,
): void {
  opts.onBlockStatement?.(expr);
  switch (expr.type) {
    case "let": {
      const onExit = opts.onBlockStatementLet?.(expr);
      visitPattern(expr.pattern, opts);
      visitExpr(expr.value, opts);
      onExit?.();
      break;
    }
    case "let#": {
      // Make sure pattern is visited *after* the expression (unlike normal let)
      const onExit = opts.onBlockStatementLetHash?.(expr);
      visitExpr(expr.mapper, opts);
      visitExpr(expr.value, opts);
      visitPattern(expr.pattern, opts);
      onExit?.();
      break;
    }
    default:
      expr satisfies never;
  }
}

export function visitExpr(expr: TypedExpr, opts: VisitOptions): void {
  switch (expr.type) {
    case "syntax-err":
    case "constant":
      return;

    case "identifier":
      opts.onIdentifier?.(expr);
      return;

    case "block": {
      const onExit = opts.onBlock?.(expr);
      for (const st of expr.statements) {
        visitBlockStatementLetClause(st, opts);
      }
      visitExpr(expr.returning, opts);
      onExit?.();
      return;
    }

    case "if":
      visitExpr(expr.condition, opts);
      visitExpr(expr.then, opts);
      visitExpr(expr.else, opts);
      return;

    case "application":
      opts.onApplication?.(expr);
      visitExpr(expr.caller, opts);
      for (const arg of expr.args) {
        visitExpr(arg, opts);
      }
      return;

    case "pipe":
      opts.onPipe?.(expr);
      visitExpr(expr.left, opts);
      visitExpr(expr.right, opts);
      return;

    case "fn": {
      const onExit = opts.onFn?.(expr);
      for (const param of expr.params) {
        visitPattern(param, opts);
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
      if (expr.tail !== undefined) {
        visitExpr(expr.tail, opts);
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

    default:
      expr satisfies never;
  }
}
