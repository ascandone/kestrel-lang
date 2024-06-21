import { TypedExpr } from "../typedAst";

export interface ExpressionVisitor {
  visitApplication?(ast: TypedExpr & { type: "application" }): void;
  visitConstant?(ast: TypedExpr & { type: "constant" }): void;
}

export function visitExpression(ast: TypedExpr, visitor: ExpressionVisitor) {
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
