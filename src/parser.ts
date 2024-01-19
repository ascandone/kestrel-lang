import grammar from "./parser/grammar.ohm-bundle";
import {
  ConstLiteral,
  Program,
  Expr,
  Statement,
  Span,
  SpanMeta,
  TypeHint,
} from "./ast";
import type {
  MatchResult,
  NonterminalNode,
  Node as OhmNode,
  TerminalNode,
} from "ohm-js";

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

semantics.addOperation<{ name: string } & SpanMeta>("ident()", {
  ident(_hd, _tl) {
    return {
      name: this.sourceString,
      span: getSpan(this),
    };
  },
});

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
  PriExp_ident(node) {
    return {
      type: "identifier",
      ...node.ident(),
    };
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

  PriExp_apply(f, _lpar, args, _trailingComma, _rpar) {
    return {
      type: "application",
      caller: f.expr(),
      args: args.asIteration().children.map((c) => c.expr()),
      span: getSpan(this),
    };
  },

  PriExp_block(_lbracket, block, _rbracket) {
    return block.expr();
  },

  PriExp_fn(_fn, params, _lbracket, block, _rbracket) {
    return {
      type: "fn",
      params: params.asIteration().children.map((c) => c.ident()),
      body: block.expr(),
      span: getSpan(this),
    };
  },

  PriExp_if(_if, cond, _lb1, x, _rb1, _else, _lb2, y, _rb2) {
    return {
      type: "if",
      condition: cond.expr(),
      then: x.expr(),
      else: y.expr(),
      span: getSpan(this),
    };
  },

  BlockContent_exp(e) {
    return e.expr();
  },

  BlockContent_let(_let, ident, _eq, value, _comma, body) {
    return {
      type: "let",
      binding: ident.ident(),
      value: value.expr(),
      body: body.expr(),
      span: getSpan(this),
    };
  },
});

semantics.addOperation<TypeHint>("typeHint()", {
  TypeHint_any(_underscore) {
    return { type: "any" };
  },

  TypeHint_named(ident, _lbracket, args, _rbracket) {
    let args_: TypeHint[] = [];
    if (args.numChildren > 0) {
      args_ = args
        .child(0)
        .asIteration()
        .children.map((c) => c.typeHint());
    }
    return {
      type: "named",
      args: args_,
      name: ident.sourceString,
    };
  },
});

semantics.addOperation<Statement<SpanMeta>>("statement()", {
  Declaration_letStmt(_let, ident, _colon, typeHint, _eq, exp) {
    const th =
      typeHint.numChildren === 0
        ? {}
        : {
            typeHint: {
              ...typeHint.child(0).typeHint(),
              span: getSpan(typeHint.child(0)),
            },
          };

    return {
      type: "let",
      binding: ident.ident(),
      value: exp.expr(),
      span: getSpan(this),
      ...th,
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
