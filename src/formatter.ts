import {
  ConstLiteral,
  Expr,
  UntypedDeclaration,
  UntypedModule,
} from "./parser";
import { Doc, break_, concat, nest, pprint, text } from "./pretty";

function constToDoc(lit: ConstLiteral): Doc {
  switch (lit.type) {
    case "int":
    case "float":
      return text(lit.value.toString());
    case "string":
      return text(`"${lit.value}"`);
  }
}

function indent(...docs: Doc[]): Doc {
  return concat(nest(break_(), ...docs), break_());
}

function exprToDoc(ast: Expr, block: boolean): Doc {
  switch (ast.type) {
    case "constant":
      return constToDoc(ast.value);

    case "identifier":
      return text(
        ast.namespace === undefined ? "" : `${ast.namespace}.`,
        ast.name,
      );

    case "fn": {
      const params = ast.params.map((p) => ` ${p.name}`).join(",");
      return concat(
        text("fn", ...params, " {"),
        indent(exprToDoc(ast.body, true)),
        text("}"),
      );
    }

    case "if":
      return nest(
        break_(),
        text("if "),
        exprToDoc(ast.condition, false),
        text(" {"),
        indent(exprToDoc(ast.then, true)),
        text("} else {"),
        indent(exprToDoc(ast.else, true)),
        text("}"),
      );

    case "let": {
      const inner = concat(
        // TODO same wrapping rules as let decl
        text(`let ${ast.binding.name} = `),
        exprToDoc(ast.value, false),
        text(";"),
        break_(),
        exprToDoc(ast.body, true),
      );

      if (block) {
        return inner;
      }

      return concat(text("{"), indent(inner), text("}"));
    }

    case "application":
    case "match":
      throw new Error("TODO handle expr: " + ast.type);
  }
}

function declToDoc(ast: UntypedDeclaration): Doc {
  if (ast.extern) {
    throw new Error("TODO handle extern pprint");
  }

  return concat(
    text(`let ${ast.binding.name} = `),
    exprToDoc(ast.value, false),
  );
}

export function format(ast: UntypedModule): string {
  const docs = ast.declarations.flatMap((decl, index) => {
    const last = index === ast.declarations.length - 1;
    return [declToDoc(decl), break_(last ? 0 : 1)];
  });

  return pprint(concat(...docs));
}
