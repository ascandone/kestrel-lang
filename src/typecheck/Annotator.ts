import { ErrorInfo } from "../errors";
import { Expr, MatchPattern } from "../parser";
import { TVar } from "./type";
import { TypedExpr, TypedMatchPattern, TypedStructField } from "./typedAst";
import * as err from "../errors";

/**
 * TODO:
 * * resolveIdentifiers
 * * resolveField
 * * resolveConstructor
 */
export class Annotator {
  constructor(private readonly errors: ErrorInfo[]) {}

  private annotateMatchPattern(ast: MatchPattern): TypedMatchPattern {
    switch (ast.type) {
      case "lit":
      case "identifier":
        return {
          ...ast,
          $type: TVar.fresh(),
        };

      case "constructor":
        return {
          ...ast,
          args: ast.args.map((arg) => this.annotateMatchPattern(arg)),
          $resolution: undefined,
          $type: TVar.fresh(),
        };
    }
  }

  private annotateExpr(ast: Expr): TypedExpr {
    switch (ast.type) {
      // Syntax sugar
      case "block":
        return this.annotateExpr(ast);

      case "pipe":
        if (ast.right.type !== "application") {
          this.errors.push({
            range: ast.right.range,
            description: new err.InvalidPipe(),
          });
          return this.annotateExpr(ast.left);
        }

        return this.annotateExpr({
          type: "application",
          isPipe: true,
          range: ast.range,
          caller: ast.right.caller,
          args: [ast.left, ...ast.right.args],
        });

      case "let#":
        return this.annotateExpr({
          type: "application",
          caller: {
            type: "identifier",
            namespace: ast.mapper.namespace,
            name: ast.mapper.name,
            range: ast.mapper.range,
          },
          args: [
            ast.value,
            {
              type: "fn",
              params: [ast.pattern],
              body: ast.body,
              range: ast.range,
            },
          ],
          range: ast.range,
        });

      // Actual AST
      case "syntax-err":
      case "constant":
        return { ...ast, $type: TVar.fresh() };

      case "struct-literal":
        return {
          ...ast,
          fields: ast.fields.map(
            (field): TypedStructField => ({
              ...field,
              field: {
                ...field.field,
                $resolution: undefined,
              },
              value: this.annotateExpr(field.value),
            }),
          ),
          struct: {
            ...ast.struct,
            $resolution: undefined,
          },
          spread:
            ast.spread === undefined
              ? undefined
              : this.annotateExpr(ast.spread),
          $type: TVar.fresh(),
        };

      case "list-literal":
        return {
          ...ast,
          values: ast.values.map((v) => this.annotateExpr(v)),
          $type: TVar.fresh(),
        };

      case "identifier":
        return {
          ...ast,
          $resolution: undefined,
          $type: TVar.fresh(),
        };

      case "fn":
        return {
          ...ast,
          $type: TVar.fresh(),
          body: this.annotateExpr(ast.body),
          params: ast.params.map((p) => this.annotateMatchPattern(p)),
        };

      case "infix":
        return this.annotateExpr({
          type: "application",
          caller: { type: "identifier", name: ast.operator, range: ast.range },
          args: [ast.left, ast.right],
          range: ast.range,
        });

      case "application":
        return {
          ...ast,
          $type: TVar.fresh(),
          caller: this.annotateExpr(ast.caller),
          args: ast.args.map((arg) => this.annotateExpr(arg)),
        };

      case "field-access":
        return {
          ...ast,
          struct: this.annotateExpr(ast.struct),
          $resolution: undefined,
          $type: TVar.fresh(),
        };

      case "if":
        return {
          ...ast,
          condition: this.annotateExpr(ast.condition),
          then: this.annotateExpr(ast.then),
          else: this.annotateExpr(ast.else),
          $type: TVar.fresh(),
        };

      case "let":
        return {
          ...ast,
          $type: TVar.fresh(),
          pattern: this.annotateMatchPattern(ast.pattern),
          value: this.annotateExpr(ast.value),
          body: this.annotateExpr(ast.body),
        };

      case "match":
        return {
          ...ast,
          $type: TVar.fresh(),
          expr: this.annotateExpr(ast.expr),
          clauses: ast.clauses.map(([pattern, expr]) => {
            const annotatedPattern = this.annotateMatchPattern(pattern);
            const annotatedExpr = this.annotateExpr(expr);
            return [annotatedPattern, annotatedExpr];
          }),
        };
    }
  }
}
