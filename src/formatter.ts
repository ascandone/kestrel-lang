import {
  ConstLiteral,
  Expr,
  MatchPattern,
  TypeAst,
  UntypedDeclaration,
  UntypedImport,
  UntypedModule,
  UntypedTypeDeclaration,
} from "./parser";
import {
  Doc,
  lines,
  concat,
  nest,
  nil,
  pprint,
  sepBy,
  sepByString,
  text,
  break_,
  group,
} from "./pretty";

const ORDERED_PREFIX_SYMBOLS = [["!"]];

const ORDERED_INFIX_SYMBOLS = [
  ["^"],
  ["*", "*.", "/", "/.", "%"],
  ["+", "-", "+.", "-.", "<>"],
  ["::"],
  ["||"],
  ["&&"],
  ["==", "!="],
  ["<", "<=", ">", ">="],
  ["|>"],
];

const ORDERED_SYMBOLS = [...ORDERED_PREFIX_SYMBOLS, ...ORDERED_INFIX_SYMBOLS];

function isPrefix(name: string) {
  return ORDERED_PREFIX_SYMBOLS.some((s) => s.includes(name));
}

function isInfix(name: string) {
  return ORDERED_INFIX_SYMBOLS.some((s) => s.includes(name));
}

function getBindingPower(name: string): number | undefined {
  const index = ORDERED_SYMBOLS.findIndex((ops) => ops.includes(name));
  if (index === -1) {
    return undefined;
  }
  return index;
}

// eslint-disable-next-line no-inner-declarations
function hasLowerPrec(bindingPower: number, other: Expr): boolean {
  switch (other.type) {
    case "application":
      infix: if (other.caller.type === "identifier") {
        const selfBindingPower = getBindingPower(other.caller.name);
        if (selfBindingPower === undefined) {
          break infix;
        }
        return selfBindingPower > bindingPower;
      }

    case "constant":
    case "identifier":
    case "fn":
    case "let":
    case "if":
    case "match":
      return false;
  }
}

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
  return concat(nest(lines(), ...docs), lines());
}

function infixAliasForName(name: string) {
  if (name === "Cons") {
    return "::";
  }
  return name;
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

    case "application": {
      infix: if (ast.caller.type === "identifier") {
        const name = infixAliasForName(ast.caller.name);
        const infixIndex = getBindingPower(name);
        if (infixIndex === undefined) {
          break infix;
        }

        const left = ast.args[0]!;
        const leftNeedsParens = hasLowerPrec(infixIndex, left);
        const leftDoc = leftNeedsParens
          ? concat(text("("), exprToDoc(left, false), text(")"))
          : exprToDoc(left, false);

        if (isPrefix(name)) {
          return concat(text(`${name}`), leftDoc);
        }

        const right = ast.args[1]!;

        return concat(leftDoc, text(` ${name} `), exprToDoc(right, false));
      }

      const isTuple =
        ast.caller.type === "identifier" && ast.caller.name === "Tuple2";

      return concat(
        isTuple ? nil : exprToDoc(ast.caller, false),
        text("("),
        group(
          nest(
            break_(""),
            sepBy(
              concat(text(","), break_(" ")),
              ast.args.map((arg) => exprToDoc(arg, false)),
            ),
          ),
          break_(""),
        ),
        text(")"),
      );
    }

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
        lines(),
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
          : indent(sepBy(concat(text(","), lines()), clauses), text(",")),
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

    case "constructor": {
      if (pattern.name === "Cons" && pattern.args.length === 2) {
        const left = pattern.args[0]!;
        const right = pattern.args[1]!;
        return concat(patternToDoc(left), text(" :: "), patternToDoc(right));
      }

      if (pattern.args.length === 0) {
        return text(pattern.name);
      }

      const isTuple = pattern.name === "Tuple2";

      return concat(
        isTuple ? nil : text(pattern.name),
        text("("),
        sepByString(", ", pattern.args.map(patternToDoc)),
        text(")"),
      );
    }
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
                lines(),
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

function importToDoc(import_: UntypedImport): Doc {
  return concat(
    text("import ", import_.ns),
    import_.exposing.length === 0
      ? nil
      : concat(
          text(".{"),
          sepByString(
            ", ",
            import_.exposing.map((exposing) =>
              text(
                isInfix(exposing.name) || isPrefix(exposing.name)
                  ? `(${exposing.name})`
                  : exposing.name,
                exposing.type === "type" && exposing.exposeImpl ? "(..)" : "",
              ),
            ),
          ),
          text("}"),
        ),
  );
}

type Statement =
  | { type: "decl"; decl: UntypedDeclaration }
  | { type: "type"; decl: UntypedTypeDeclaration };

export function format(ast: UntypedModule): string {
  const importsDocs = ast.imports
    .sort((i1, i2) => (i1.ns > i2.ns ? 1 : -1))
    .map(importToDoc)
    .flatMap((doc) => [doc, lines()]);

  const statements = [
    ...ast.typeDeclarations.map<Statement>((decl) => ({ type: "type", decl })),
    ...ast.declarations.map<Statement>((decl) => ({ type: "decl", decl })),
  ].sort((s1, s2) => s1.decl.span[0] - s2.decl.span[0]);

  if (importsDocs.length !== 0 && statements.length !== 0) {
    importsDocs.push(lines());
  }

  const statementsDocs = statements
    .map((s) => {
      switch (s.type) {
        case "type":
          return typeDeclToDoc(s.decl);
        case "decl":
          return declToDoc(s.decl);
      }
    })
    .flatMap((doc, index, arr) => {
      const last = index === arr.length - 1;
      return [doc, lines(last ? 0 : 1)];
    });

  const docs = [...importsDocs, ...statementsDocs];

  return pprint({ type: "concat", docs });
}
