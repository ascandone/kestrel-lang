import { TypedDeclaration, TypedExpr, TypedModule } from "../typedAst";
import { contains, firstBy } from "./common";
import { TVar } from "../type";

type CompletionKind = {
  type: "field-access";
  structType: TVar;
};

export function getCompletionItems(
  module: TypedModule,
  offset: number,
): CompletionKind | undefined {
  for (const decl of module.declarations) {
    const d = declCompletion(decl, offset);
    if (d !== undefined) {
      return d;
    }
  }

  return undefined;
}

function declCompletion(
  declaration: TypedDeclaration,
  offset: number,
): CompletionKind | undefined {
  if (declaration.extern) {
    return undefined;
  }

  return exprCompletion(declaration.value, offset);
}

function exprCompletion(
  expr: TypedExpr,
  offset: number,
): CompletionKind | undefined {
  if (!contains(expr, offset)) {
    return undefined;
  }

  switch (expr.type) {
    case "syntax-err":
      // TODO this is a faulty expression
      // we probably want to emit suggestions here
      return undefined;

    case "constant":
      return undefined;

    case "identifier":
      return undefined;

    case "fn":
      return exprCompletion(expr.body, offset);

    case "list-literal":
      return firstBy(expr.values, (arg) => exprCompletion(arg, offset));

    case "field-access":
      if (expr.field.name === "") {
        return { type: "field-access", structType: expr.struct.$ };
      }

      return exprCompletion(expr.struct, offset);

    case "struct-literal":
      return (
        firstBy(
          expr.fields.map((f) => f.value),
          (arg) => exprCompletion(arg, offset),
        ) ??
        (expr.spread === undefined
          ? undefined
          : exprCompletion(expr.spread, offset))
      );

    case "application":
      return (
        firstBy(expr.args, (arg) => exprCompletion(arg, offset)) ??
        exprCompletion(expr.caller, offset)
      );

    case "if":
      return (
        exprCompletion(expr.condition, offset) ??
        exprCompletion(expr.then, offset) ??
        exprCompletion(expr.else, offset)
      );

    case "let":
      return (
        exprCompletion(expr.value, offset) ?? exprCompletion(expr.body, offset)
      );

    case "match":
      return (
        exprCompletion(expr.expr, offset) ??
        firstBy(expr.clauses, ([_pattern, expr]) =>
          exprCompletion(expr, offset),
        )
      );
  }
}
