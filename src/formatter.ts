import {
  ConstLiteral,
  Expr,
  MatchPattern,
  TypeAst,
  UntypedDeclaration,
  UntypedModule,
  UntypedTypeDeclaration,
} from "./parser";
import {
  Doc,
  break_,
  concat,
  nest,
  nil,
  pprint,
  sepBy,
  sepByString,
  text,
} from "./pretty";

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
        sepByString(
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

    case "match": {
      const clauses = ast.clauses.map(([pattern, expr]) =>
        concat(patternToDoc(pattern), text(" => "), exprToDoc(expr, false)),
      );

      return concat(
        text("match "),
        exprToDoc(ast.expr, false),
        text(" {"),
        clauses.length === 0
          ? text(" ")
          : indent(sepByString(",", clauses), text(",")),
        text("}"),
      );
    }
  }
}

function patternToDoc(pattern: MatchPattern): Doc {
  switch (pattern.type) {
    case "ident":
      return text(pattern.ident);

    case "lit":
      return constToDoc(pattern.literal);

    case "constructor":
      throw new Error("TODO match constructor");
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
        sepByString(", ", typeAst.args.map(typeAstToDoc)),
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
        sepByString(", ", typeAst.args.map(typeAstToDoc)),
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

    case "adt": {
      const variants =
        tDecl.variants.length === 0
          ? text(" ")
          : indent(
              sepBy(
                break_(),
                tDecl.variants.map((variant) =>
                  concat(
                    text(variant.name),
                    ...(variant.args.length === 0
                      ? []
                      : [
                          text("("),
                          sepByString(", ", variant.args.map(typeAstToDoc)),
                          text(")"),
                        ]),
                    text(","),
                  ),
                ),
              ),
            );

      const params =
        tDecl.params.length === 0
          ? nil
          : concat(
              text("<"),
              sepByString(
                ", ",
                tDecl.params.map((p) => text(p.name)),
              ),
              text(">"),
            );

      return concat(
        tDecl.pub === ".." ? text("pub(..) ") : tDecl.pub ? text("pub ") : nil,
        text("type "),
        text(tDecl.name),
        params,
        text(" {"),
        variants,
        text("}"),
      );
    }
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
