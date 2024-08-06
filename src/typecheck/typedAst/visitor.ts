import { TypedExpr, TypedMatchPattern } from "../typedAst";

export interface ExpressionVisitor {
  onExprEnter?(ast: TypedExpr): void;
  visitApplication?(ast: TypedExpr & { type: "application" }): void;
  visitConstant?(ast: TypedExpr & { type: "constant" }): void;
  visitIdentifier?(ast: TypedExpr & { type: "identifier" }): void;

  visitPattern?(pattern: TypedMatchPattern): void;
}

export function visitExpression(ast: TypedExpr, visitor: ExpressionVisitor) {
  visitor.onExprEnter?.(ast);
  switch (ast.type) {
    case "syntax-err":
      return;
    case "identifier":
      return;
    case "constant":
      visitor.visitConstant?.(ast);
      return;
    case "list-literal":
      for (const value of ast.values) {
        visitExpression(value, visitor);
      }
      return;
    case "fn":
      visitExpression(ast.body, visitor);
      return;
    case "application":
      visitor.visitApplication?.(ast);
      visitExpression(ast.caller, visitor);
      for (const arg of ast.args) {
        visitExpression(arg, visitor);
      }
      return;
    case "let":
      visitExpression(ast.value, visitor);
      visitExpression(ast.body, visitor);
      return;
    case "if":
      visitExpression(ast.condition, visitor);
      visitExpression(ast.then, visitor);
      visitExpression(ast.else, visitor);
      return;
    case "match":
      visitExpression(ast.expr, visitor);
      for (const [_p, clause] of ast.clauses) {
        visitExpression(clause, visitor);
      }
      return;
  }
}

class StopVisiting<T> {
  constructor(public readonly value: T) {}
}

export type EarlyReturnVisitor<T> = (
  stopVisiting: (value: T) => never,
) => ExpressionVisitor;
export function visitExpressionEarlyReturn<T>(
  ast: TypedExpr,
  visitor: EarlyReturnVisitor<T>,
): T | undefined {
  try {
    const visitor_ = visitor((value) => {
      throw new StopVisiting(value);
    });

    visitExpression(ast, visitor_);
  } catch (error) {
    if (error instanceof StopVisiting) {
      return error.value;
    }
    throw error;
  }

  return undefined;
}
