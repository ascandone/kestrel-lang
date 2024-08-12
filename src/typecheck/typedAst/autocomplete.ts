import { TypedDeclaration, TypedExpr, TypedModule } from "../typedAst";
import { contains, firstBy } from "./common";

type Autocompletable = {
  type: "namespace";
  namespace: string;
};

export function autocompletable(
  module: TypedModule,
  offset: number,
): Autocompletable | undefined {
  for (const decl of module.declarations) {
    const d = autocompleteDecl(decl, offset);
    if (d !== undefined) {
      return d;
    }
  }

  return undefined;
}

function autocompleteExpr(
  expr: TypedExpr,
  offset: number,
): Autocompletable | undefined {
  if (!contains(expr, offset)) {
    return undefined;
  }

  switch (expr.type) {
    case "syntax-err":
    case "constant":
      return undefined;

    case "identifier": {
      if (expr.namespace !== undefined && expr.name === "") {
        return { type: "namespace", namespace: expr.namespace };
      }

      return undefined;
    }

    case "fn":
      return autocompleteExpr(expr.body, offset);

    case "list-literal":
      return firstBy(expr.values, (arg) => autocompleteExpr(arg, offset));

    case "field-access":
      return autocompleteExpr(expr.struct, offset);

    case "struct-literal":
      return (
        firstBy(
          expr.fields.map((f) => f.value),
          (arg) => autocompleteExpr(arg, offset),
        ) ??
        (expr.spread === undefined
          ? undefined
          : autocompleteExpr(expr.spread, offset))
      );

    case "application":
      return (
        autocompleteExpr(expr.caller, offset) ??
        firstBy(expr.args, (arg) => autocompleteExpr(arg, offset))
      );

    case "if":
      return (
        autocompleteExpr(expr.condition, offset) ??
        autocompleteExpr(expr.then, offset) ??
        autocompleteExpr(expr.else, offset)
      );

    case "let":
      return (
        autocompleteExpr(expr.value, offset) ??
        autocompleteExpr(expr.body, offset)
      );

    case "match":
      return (
        autocompleteExpr(expr.expr, offset) ??
        firstBy(expr.clauses, ([_pattern, expr]) =>
          autocompleteExpr(expr, offset),
        )
      );
  }
}

function autocompleteDecl(
  declaration: TypedDeclaration,
  offset: number,
): Autocompletable | undefined {
  if (!declaration.extern && contains(declaration.value, offset)) {
    return autocompleteExpr(declaration.value, offset);
  }

  return undefined;
}
