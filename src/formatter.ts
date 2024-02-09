import {
  ConstLiteral,
  Expr,
  TypeAst,
  UntypedDeclaration,
  UntypedModule,
  UntypedTypeDeclaration,
} from "./parser";
import { Doc, break_, concat, nest, nil, pprint, sepBy, text } from "./pretty";

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

    case "application":
      return concat(
        exprToDoc(ast.caller, false),
        text("("),
        sepBy(
          ", ",
          ast.args.map((arg) => exprToDoc(arg, false)),
        ),
        text(")"),
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
      return concat(
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

    case "match":
      throw new Error("TODO handle expr: " + ast.type);
  }
}

function typeAstToDoc(typeAst: TypeAst): Doc {
  switch (typeAst.type) {
    case "named": {
      const name = text(
        typeAst.namespace === undefined ? "" : `${typeAst.namespace}.`,
        typeAst.name,
      );

      if (typeAst.args.length === 0) {
        return name;
      }

      return concat(
        name,
        text("<"),
        sepBy(", ", typeAst.args.map(typeAstToDoc)),
        text(">"),
      );
    }

    case "var":
      return text(typeAst.ident);

    case "any":
      return text("_");

    case "fn":
      return concat(
        text("Fn("),
        sepBy(", ", typeAst.args.map(typeAstToDoc)),
        text(") -> "),
        typeAstToDoc(typeAst.return),
      );
  }
}

function declToDoc(ast: UntypedDeclaration): Doc {
  return concat(
    ast.extern ? text("extern ") : nil,
    ast.pub ? text("pub ") : nil,
    text(`let ${ast.binding.name}`),
    ast.typeHint === undefined
      ? nil
      : concat(text(": "), typeAstToDoc(ast.typeHint)),
    ast.extern ? nil : concat(text(" = "), exprToDoc(ast.value, false)),
  );
}

function typeDeclToDoc(tDecl: UntypedTypeDeclaration): Doc {
  switch (tDecl.type) {
    case "extern":
      return concat(
        text("extern "),
        tDecl.pub ? text("pub ") : nil,
        text("type "),
        text(tDecl.name),
      );

    case "adt":
      return concat(
        tDecl.pub === ".." ? text("pub(..) ") : tDecl.pub ? text("pub ") : nil,
        text("type "),
        text(tDecl.name),
        text(" {"),
        text(" "),
        text("}"),
      );
  }
}

export function format(ast: UntypedModule): string {
  const tDeclrs = ast.typeDeclarations.map(typeDeclToDoc);
  const declrs = ast.declarations.map(declToDoc);

  const docs = tDeclrs.concat(declrs).flatMap((doc, index, arr) => {
    const last = index === arr.length - 1;
    return [doc, break_(last ? 0 : 1)];
  });

  return pprint({ type: "concat", docs });
}
