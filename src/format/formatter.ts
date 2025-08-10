import {
  gtEqPos,
  ConstLiteral,
  LineComment,
  MatchPattern,
  PolyTypeAst,
  RangeMeta,
  TypeAst,
  Declaration,
  Expr,
  Import,
  UntypedModule,
  TypeDeclaration,
  TypeVariant,
} from "../parser";
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
  broken,
  group,
  nextBreakFits,
  nestOnBreak,
} from "./pretty";

let currentLineComments: LineComment[] = [];
function popComments(ast: RangeMeta): Doc[] {
  const poppedComments: string[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const comment = currentLineComments.at(-1);

    if (comment === undefined || comment.range.end.line >= ast.range.end.line) {
      break;
    }

    poppedComments.push(comment.comment);
    currentLineComments.pop();
  }
  return poppedComments.map((comment) => concat(text(comment), lines()));
}

const ORDERED_PREFIX_SYMBOLS = [["!"]];

const ORDERED_INFIX_SYMBOLS = [
  ["^"],
  ["*", "*.", "/", "/.", "%"],
  ["+", "-", "+.", "-.", "++"],
  ["::"],
  ["==", "!="],
  ["<", "<=", ">", ">="],
  ["||"],
  ["&&"],
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

function hasLowerPrec(bindingPower: number, other: Expr): boolean {
  switch (other.type) {
    case "block*":
      // TODO are we sure?
      return hasLowerPrec(bindingPower, other.returning);

    case "infix": {
      const selfBindingPower = getBindingPower(other.operator);

      /* v8 ignore next 3 */
      if (selfBindingPower === undefined) {
        throw new Error("[unreachable] unknown infix operator");
      }

      return selfBindingPower > bindingPower;
    }

    case "application":
      infix: if (other.caller.type === "identifier") {
        const selfBindingPower = getBindingPower(other.caller.name);
        if (selfBindingPower === undefined) {
          break infix;
        }
        return selfBindingPower > bindingPower;
      }

    case "field-access":
    case "struct-literal":
    case "syntax-err":
    case "list-literal":
    case "pipe":
    case "constant":
    case "identifier":
    case "fn":
    case "if":
    case "match":
      return false;
  }
}

function constToDoc(lit: ConstLiteral): Doc {
  switch (lit.type) {
    case "int":
      return text(lit.value.toString());
    case "float": {
      const str = lit.value.toString();
      return text(str.includes(".") ? str : `${str}.0`);
    }
    case "string":
      return text(`"${lit.value}"`);
    case "char":
      return text(`'${lit.value}'`);
  }
}

function indentWithSpaceBreak(docs: Doc[], unbroken?: string): Doc {
  return group(
    nest(
      //
      break_(""),
      ...docs,
    ),
    break_("", unbroken),
  );
}

function block_(...docs: Doc[]): Doc {
  return group(
    //
    text("{"),
    broken(nest(break_(), ...docs)),
    break_(""),
    text("}"),
  );
}

function blockOpt_(...docs: Doc[]): Doc {
  return concat(
    //
    nest(break_("", "{"), ...docs),
    break_("", "", "}"),
  );
}

function infixAliasForName(name: string) {
  if (name === "Cons") {
    return "::";
  }
  return name;
}

function asBlockOpt(isBlock: boolean, docs: Doc[]): Doc {
  if (isBlock) {
    return concat(...docs);
  }
  return blockOpt_(...docs);
}

function exprToDocWithComments(ast: Expr, block: boolean): Doc {
  return concat(...popComments(ast), exprToDoc(ast, block));
}

function exprToDoc(ast: Expr, block: boolean): Doc {
  switch (ast.type) {
    /* v8 ignore next 2 */
    case "syntax-err":
      throw new Error("[unreachable]");

    case "block*":
      // return exprToDoc(ast.inner, false);
      throw new Error("TODO implement");

    case "list-literal":
      return group(
        text("["),

        indentWithSpaceBreak(
          [
            sepBy(
              concat(text(","), break_()),
              ast.values.map((expr) =>
                exprToDocWithComments(expr, expr.type !== "block*"),
              ),
            ),
          ],
          ",",
        ),
        text("]"),
      );

    case "struct-literal": {
      const fieldLines = ast.fields.map((field) => {
        return concat(
          //
          text(`${field.field.name}: `),
          exprToDoc(field.value, false),
          text(`,`),
        );
      });

      if (ast.spread !== undefined) {
        fieldLines.push(
          //
          concat(text(".."), exprToDoc(ast.spread, false)),
        );
      }

      const fields = sepBy(break_(), fieldLines);

      return concat(
        //
        text(ast.struct.name),
        text(" "),
        fieldLines.length === 0 ? text("{ }") : block_(fields),
      );
    }

    case "pipe": {
      const isNewLine = ast.left.range.end.line !== ast.range.end.line;
      const wrapped = isNewLine ? broken : concat;

      return wrapped(
        asBlockOpt(block, [
          exprToDoc(ast.left, true),
          break_(),
          text("|> "),
          exprToDoc(ast.right, true),
        ]),
      );
    }

    case "constant":
      return constToDoc(ast.value);

    case "identifier":
      return text(
        ast.namespace === undefined ? "" : `${ast.namespace}.`,
        ast.name,
      );

    case "infix": {
      const name = infixAliasForName(ast.operator);
      const infixIndex = getBindingPower(name);
      if (infixIndex === undefined) {
        throw new Error("[unreachable] unkown operator");
      }

      const leftNeedsParens = hasLowerPrec(infixIndex, ast.left);
      const leftDoc = leftNeedsParens
        ? concat(text("("), exprToDoc(ast.left, false), text(")"))
        : exprToDoc(ast.left, false);

      if (isPrefix(name)) {
        return concat(text(`${name}`), leftDoc);
      }

      return concat(leftDoc, text(` ${name} `), exprToDoc(ast.right, false));
    }

    case "field-access":
      return concat(
        //
        autoParens(DOT_ACCESS_BINDING_POWER, ast.struct),
        text("."),
        ast.field.structName === undefined
          ? nil
          : text(ast.field.structName, "#"),
        text(ast.field.name),
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
        ast.caller.type === "identifier" &&
        isTupleN(ast.caller.namespace, ast.caller.name);

      if (ast.args.length === 0) {
        return concat(exprToDoc(ast.caller, false), text("()"));
      }

      return nextBreakFits(
        group(
          isTuple ? nil : exprToDoc(ast.caller, false),
          text("("),
          nestOnBreak(
            break_(""),
            sepBy(
              concat(text(","), break_()),
              ast.args.map((arg, index, arr) => {
                const isLast = index === arr.length - 1;
                const inner = exprToDoc(arg, false);
                if (isLast) {
                  return nextBreakFits(group(inner));
                } else {
                  return inner;
                }
              }),
            ),
          ),
          break_("", isTuple ? "" : ","),
          text(")"),
        ),
        false,
      );
    }

    case "fn": {
      const params = ast.params.map((p) => concat(text(" "), patternToDoc(p)));

      return concat(
        text("fn"),
        sepByString(",", params),
        text(" "),
        block_(exprToDocWithComments(ast.body, true)),
      );
    }

    case "if":
      return broken(
        text("if "),
        exprToDoc(ast.condition, false),
        text(" "),
        block_(exprToDocWithComments(ast.then, true)),

        text(" else "),
        block_(exprToDocWithComments(ast.else, true)),
      );

    // case "let#": {
    //   const ns =
    //     ast.mapper.namespace === undefined ? "" : `${ast.mapper.namespace}.`;

    //   const inner = concat(
    //     text(`let#${ns}${ast.mapper.name} `),
    //     patternToDoc(ast.pattern),
    //     text(` =`),
    //     declarationValueToDoc(ast.value),
    //     text(";"),
    //     linesBetweenLet(ast),
    //     exprToDoc(ast.body, true),
    //   );

    //   if (block) {
    //     return inner;
    //   }

    //   return block_(inner);
    // }

    // case "let": {
    //   const inner = concat(
    //     text("let "),
    //     patternToDoc(ast.pattern),
    //     text(" ="),
    //     declarationValueToDoc(ast.value),
    //     text(";"),
    //     linesBetweenLet(ast),
    //     exprToDoc(ast.body, true),
    //   );

    //   if (block) {
    //     return inner;
    //   }

    //   return block_(inner);
    // }

    case "match": {
      const clauses = ast.clauses.map(([pattern, expr]) =>
        concat(patternToDoc(pattern), text(" => "), exprToDoc(expr, false)),
      );

      return concat(
        text("match "),
        exprToDoc(ast.expr, false),
        text(" "),
        clauses.length === 0
          ? text("{ }")
          : block_(
              sepBy(
                break_("", ""),
                clauses.map((clause) => concat(clause, text(","))),
              ),
            ),
      );
    }
  }
}

function patternToDoc(pattern: MatchPattern): Doc {
  switch (pattern.type) {
    case "identifier":
      return text(pattern.name);

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

      return concat(
        isTupleN(pattern.namespace, pattern.name)
          ? nil
          : text(
              pattern.namespace === undefined ? "" : `${pattern.namespace}.`,
              pattern.name,
            ),
        text("("),
        sepByString(", ", pattern.args.map(patternToDoc)),
        text(")"),
      );
    }
  }
}

function typeHintToDoc(poly: PolyTypeAst): Doc {
  if (poly.where.length === 0) {
    return typeAstToDoc(poly.mono);
  }

  const entries = poly.where
    .map(({ typeVar, traits }) => [typeVar, traits] as const)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tVar, traits]) => {
      const traitsDocs = traits.map((s) => text(s));
      return concat(text(tVar, ": "), sepBy(text(" + "), traitsDocs));
    });

  return concat(
    typeAstToDoc(poly.mono),
    text(" where "),
    sepBy(text(", "), entries),
  );
}

function typeAstToDoc(typeAst: TypeAst): Doc {
  switch (typeAst.type) {
    case "named": {
      if (isTupleN(typeAst.namespace, typeAst.name)) {
        const args = typeAst.args.map(typeAstToDoc);
        return concat(text("("), sepByString(", ", args), text(")"));
      }

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

function handleDocComment(content: string, init = "///") {
  return concat(
    ...content
      .split("\n")
      .slice(0, -1)
      .map((l) => group(text(`${init}${l}`), lines())),
  );
}

function declarationValueToDoc(expr: Expr): Doc {
  const exprDoc = exprToDoc(expr, false);

  switch (expr.type) {
    case "if":
      return indentWithSpaceBreak([exprDoc]);

    default: {
      const poppedComments = popComments(expr);

      if (poppedComments.length === 0) {
        return concat(text(" "), exprDoc);
      }

      return broken(
        nest(
          //
          break_(),
          ...poppedComments,
          exprDoc,
        ),
      );
    }
  }
}

function declToDoc(ast: Declaration): Doc {
  const name =
    isInfix(ast.binding.name) || isPrefix(ast.binding.name)
      ? `(${ast.binding.name})`
      : ast.binding.name;

  return concat(
    ast.docComment === undefined ? nil : handleDocComment(ast.docComment),
    !ast.extern && ast.inline ? concat(text("@inline"), lines()) : nil,
    ast.extern ? text("extern ") : nil,
    ast.pub ? text("pub ") : nil,
    text(`let ${name}`),
    ast.typeHint === undefined
      ? nil
      : concat(text(": "), typeHintToDoc(ast.typeHint)),
    ast.extern ? nil : concat(text(" ="), declarationValueToDoc(ast.value)),
  );
}

function typeDeclToDoc(tDecl: TypeDeclaration): Doc {
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

  const docComment =
    tDecl.docComment === undefined ? nil : handleDocComment(tDecl.docComment);

  switch (tDecl.type) {
    case "extern":
      return concat(
        docComment,
        text("extern "),
        tDecl.pub ? text("pub ") : nil,
        text("type "),
        text(tDecl.name),
        params,
      );

    case "adt": {
      const variants = sepBy(
        break_(),
        tDecl.variants.map((variant) =>
          concat(variantToDoc(variant), text(",")),
        ),
      );

      return concat(
        docComment,
        tDecl.pub === ".." ? text("pub(..) ") : tDecl.pub ? text("pub ") : nil,
        text("type "),
        text(tDecl.name),
        params,
        text(" "),
        tDecl.variants.length === 0 ? text("{ }") : block_(variants),
      );
    }

    case "struct": {
      const fields = sepBy(
        break_(),
        tDecl.fields.map((field) => {
          return concat(
            //
            text(`${field.name}: `),
            typeAstToDoc(field.typeAst),
            text(`,`),
          );
        }),
      );

      return concat(
        docComment,
        tDecl.pub === ".." ? text("pub(..) ") : tDecl.pub ? text("pub ") : nil,
        text("type "),
        text(tDecl.name),
        params,
        text(" struct "),
        tDecl.fields.length === 0 ? text("{ }") : block_(fields),
      );
    }
  }
}

function variantToDoc(variant: TypeVariant): Doc {
  const args =
    variant.args.length === 0
      ? []
      : [
          text("("),
          sepByString(", ", variant.args.map(typeAstToDoc)),
          text(")"),
        ];

  return concat(text(variant.name), ...args);
}

function importToDoc(import_: Import): Doc {
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
  | { type: "decl"; decl: Declaration }
  | { type: "type"; decl: TypeDeclaration };

export function format(ast: UntypedModule): string {
  currentLineComments = [...(ast.lineComments ?? [])];
  currentLineComments.reverse();

  const importsDocs = ast.imports
    .sort((i1, i2) => (i1.ns > i2.ns ? 1 : -1))
    .map(importToDoc)
    .flatMap((doc) => [doc, lines()]);

  const statements = [
    ...ast.typeDeclarations.map<Statement>((decl) => ({ type: "type", decl })),
    ...ast.declarations.map<Statement>((decl) => ({ type: "decl", decl })),
  ].sort((s1, s2) => {
    if (gtEqPos(s1.decl.range.start, s2.decl.range.start)) {
      return 1;
    }
    return -1;
  });

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

  const docs = [
    ast.moduleDoc === undefined
      ? nil
      : concat(handleDocComment(ast.moduleDoc, "////"), lines()),
    ...importsDocs,
    ...statementsDocs,
  ];

  return pprint({ type: "concat", docs });
}

function isTupleN(namespace: string | undefined, name: string): boolean {
  return namespace === "Tuple" && /Tuple[0-9]+/.test(name);
}

function autoParens(infixIndex: number, expr: Expr) {
  const needsParens = hasLowerPrec(infixIndex, expr);
  return needsParens
    ? concat(text("("), exprToDoc(expr, false), text(")"))
    : exprToDoc(expr, false);
}

const DOT_ACCESS_BINDING_POWER = 0;

// function linesBetweenLet(ast: Expr & { type: "let" | "let#" }) {
//   const linesDiff = Math.min(
//     Math.max(ast.body.range.start.line - ast.value.range.end.line - 1, 0),
//     1,
//   );

//   return lines(linesDiff);
// }
