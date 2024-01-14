import grammar from "./parser/grammar.ohm-bundle";
import { ConstLiteral, Program, Expr, Statement } from "./ast";
import type {
  MatchResult,
  NonterminalNode,
  Node as OhmNode,
  TerminalNode,
} from "ohm-js";

export type Span = [startIdx: number, endIdx: number];
export type SpanMeta = { span: Span };

function getSpan({ source }: OhmNode): Span {
  return [source.startIdx, source.endIdx];
}

const semantics = grammar.createSemantics();

semantics.addOperation<ConstLiteral>("lit()", {
  number_whole(node) {
    return { type: "int", value: Number(node.sourceString) };
  },

  number_fract(_intPart, _comma, _floatPart) {
    return { type: "float", value: Number(this.sourceString) };
  },
});

function parseInfix(
  this: NonterminalNode,
  left: NonterminalNode,
  op: TerminalNode,
  right: NonterminalNode,
): Expr<SpanMeta> {
  return {
    type: "application",
    span: getSpan(this),
    caller: {
      type: "identifier",
      name: op.sourceString,
      span: getSpan(op),
    },
    args: [left.expr(), right.expr()],
  };
}

semantics.addOperation<Expr<SpanMeta>>("expr()", {
  number(n) {
    return {
      type: "constant",
      value: n.lit(),
      span: getSpan(this),
    };
  },
  PriExp_paren(_open, e, _close) {
    return e.expr();
  },
  CompExp_lt: parseInfix,
  CompExp_gt: parseInfix,
  CompExp_gte: parseInfix,
  CompExp_lte: parseInfix,
  EqExpr_eq: parseInfix,
  EqExpr_neq: parseInfix,
  OrExpr_or: parseInfix,
  AndExpr_and: parseInfix,
  AddExp_plus: parseInfix,
  AddExp_minus: parseInfix,
  MulExp_times: parseInfix,
  MulExp_divide: parseInfix,
  MulExp_rem: parseInfix,
  ExpExp_power: parseInfix,
});

semantics.addOperation<Statement<SpanMeta>>("statement()", {
  Statement_letStmt(_let, ident, _eq, exp) {
    return {
      type: "let",
      binding: ident.sourceString,
      value: exp.expr(),
      span: getSpan(this),
    };
  },
});

semantics.addOperation<Program<SpanMeta>>("parse()", {
  MAIN(statements) {
    return {
      statements: statements.children.map((child) => child.statement()),
    };
  },
});

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; matchResult: MatchResult };

export function parse(input: string): ParseResult<Program<SpanMeta>> {
  const matchResult = grammar.match(input);
  if (matchResult.failed()) {
    return { ok: false, matchResult };
  }

  return { ok: true, value: semantics(matchResult).parse() };
}

export function unsafeParse(input: string): Program<SpanMeta> {
  const res = parse(input);
  if (res.ok) {
    return res.value;
  }

  throw new Error(res.matchResult.message!);
}
