import { ConstLiteral } from "../../parser";
import {
  Doc,
  break_,
  broken,
  group,
  lines,
  nest,
  pprint,
  sepBy,
  text,
} from "../../format/pretty";

export type SymbolAtom = { type: "symbol"; value: string };
export type SExpr = SymbolAtom | ConstLiteral | SExpr[];

export function sym(s: TemplateStringsArray): SExpr {
  return { type: "symbol", value: s.join("") };
}

function getIndentIndex([first]: SExpr[], idents: SpecialRules["indents"]) {
  if (
    idents === undefined ||
    Array.isArray(first) ||
    first === undefined ||
    first.type !== "symbol"
  ) {
    return undefined;
  }

  return idents[first.value];
}

function renderList(...docs: Doc[]) {
  return group(text("("), nest(...docs, text(")")));
}

function listToDoc(sexprs: SExpr[], specialRules: SpecialRules): Doc {
  const docs = sexprs.map((s) => sexprToDoc(s, specialRules));

  const indentIndex = getIndentIndex(sexprs, specialRules.indents);

  if (indentIndex === undefined) {
    return renderList(sepBy(break_(), docs));
  }

  const hd = sepBy(text(" "), docs.slice(0, indentIndex + 1));
  const tl = sepBy(break_(), docs.slice(indentIndex + 1));
  return renderList(hd, break_(), broken(tl));
}

/**
 * The element which'll start wrapping
 * e.g. setting the "if" indents to 1 will produce the following (when broken):
 * (if cond
 *  x
 *  y)
 * */
export type Indents = Record<string, number>;

export type SpecialRules = {
  indents: Indents;
};

function sexprToDoc(sexpr: SExpr, specialRules: SpecialRules): Doc {
  if (Array.isArray(sexpr)) {
    return listToDoc(sexpr, specialRules);
  }

  switch (sexpr.type) {
    case "string":
      return text(`"${sexpr.value}"`);
    case "char":
      return text(`'${sexpr.value}'`);
    case "int":
      return text(`${sexpr.value}`);
    case "float":
      // int number: add comma
      if (Math.floor(sexpr.value) === sexpr.value) {
        return text(`${sexpr.value}.0`);
      }
      return text(`${sexpr.value}`);

    // other
    case "symbol":
      return text(sexpr.value);
  }
}

export function formatSexpr(
  sexprs: SExpr[],
  { indents = {} }: Partial<SpecialRules> = {},
) {
  const sexprs_ = sepBy(
    lines(1),
    sexprs.map((sexpr) => sexprToDoc(sexpr, { indents })),
  );

  return pprint(sexprs_, {
    nestSize: 4,
  });
}
