import grammar from "./grammar.ohm-bundle";
import {
  ConstLiteral,
  Expr,
  Span,
  SpanMeta,
  TypeAst,
  TypeVariant,
  MatchPattern,
  UntypedModule,
  UntypedTypeDeclaration,
  UntypedDeclaration,
  UntypedExposedValue,
  UntypedImport,
} from "./ast";
import type {
  IterationNode,
  MatchResult,
  NonterminalNode,
  Node as OhmNode,
  TerminalNode,
} from "ohm-js";
import { TypeMeta } from "../typecheck";

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

  string(_lDel, s, _rDel) {
    return { type: "string", value: s.sourceString };
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

function parsePrefix(
  this: NonterminalNode,
  op: TerminalNode,
  exp: NonterminalNode,
): Expr<SpanMeta> {
  return {
    type: "application",
    span: getSpan(this),
    caller: {
      type: "identifier",
      name: op.sourceString,
      span: getSpan(op),
    },
    args: [exp.expr()],
  };
}

semantics.addOperation<{ name: string } & SpanMeta>("ident()", {
  infixIdent(_lparens, ident, _rparens) {
    return {
      name: ident.sourceString,
      span: getSpan(this),
    };
  },
  ident(_hd, _tl) {
    return {
      name: this.sourceString,
      span: getSpan(this),
    };
  },
});

semantics.addOperation<MatchPattern>("matchPattern()", {
  MatchPattern_ident(ident) {
    return {
      type: "ident",
      ident: ident.sourceString,
      span: getSpan(this),
    };
  },
  MatchPattern_lit(lit) {
    return {
      type: "lit",
      literal: lit.lit(),
      span: getSpan(this),
    };
  },

  ConsPattern_cons(l, _cons, r) {
    return {
      type: "constructor",
      name: "Cons",
      args: [l.matchPattern(), r.matchPattern()],
      span: getSpan(this),
    };
  },

  MatchPattern_tuple(_lparens, x, _comma, xs, _rparens) {
    const xs_ = xs.asIteration().children.map((c) => c.matchPattern());

    const count = 1 + xs_.length;
    const name = `Tuple${count}`;
    return {
      type: "constructor",
      name,
      args: [x.matchPattern(), ...xs_],
      span: getSpan(this),
    };
  },
  MatchPattern_constructor(ident, _lparent, args, _rparens) {
    let args_: MatchPattern[] = [];
    if (args.numChildren > 0) {
      args_ = args
        .child(0)
        .asIteration()
        .children.map((a) => a.matchPattern());
    }
    return {
      type: "constructor",
      name: ident.sourceString,
      args: args_,
      span: getSpan(this),
    };
  },
});

semantics.addOperation<[MatchPattern, Expr<TypeMeta>]>("matchClause()", {
  MatchClause_clause(match, _arrow, expr) {
    return [match.matchPattern(), expr.expr()];
  },
});

semantics.addOperation<Expr<SpanMeta>>("expr()", {
  PipeExp_pipe(left, _pipe, caller, _lparens, args, _trailingComma, _rparens) {
    return {
      type: "application",
      caller: caller.expr(),
      args: [left.expr(), ...args.asIteration().children.map((c) => c.expr())],
      span: getSpan(this),
    };
  },
  PriExp_literal(n) {
    return {
      type: "constant",
      value: n.lit(),
      span: getSpan(this),
    };
  },

  ConsExpr_cons(hd, cons, tl) {
    return {
      type: "application",
      span: getSpan(this),
      caller: {
        type: "identifier",
        name: "Cons",
        span: getSpan(cons),
      },
      args: [hd.expr(), tl.expr()],
    };
  },

  PriExp_tuple(_lparens, x, _comma, xs, _rparens) {
    const xs_ = xs.asIteration().children.map((m) => m.sourceString);

    const count = 1 + xs_.length;

    return {
      type: "application",
      caller: {
        type: "identifier",
        name: `Tuple${count}`,
        span: getSpan(this),
      },
      args: [x.expr(), ...xs_],
      span: getSpan(this),
    };
  },
  PriExp_paren(_open, e, _close) {
    return e.expr();
  },

  ident(_hd, _tl) {
    return {
      type: "identifier",
      span: getSpan(this),
      ...this.ident(),
    };
  },

  QualifiedIdent(ns, _dot, id) {
    const namespace =
      ns.numChildren === 0
        ? undefined
        : ns
            .child(0)
            .asIteration()
            .children.map((c) => c.sourceString)
            .join("/");

    return {
      type: "identifier",
      span: getSpan(this),
      namespace,
      name: id.sourceString,
    };
  },

  QualifiedName(ns, _dot, id) {
    const namespace =
      ns.numChildren === 0
        ? undefined
        : ns
            .child(0)
            .asIteration()
            .children.map((c) => c.sourceString)
            .join("/");

    return {
      type: "identifier",
      span: getSpan(this),
      namespace,
      name: id.sourceString,
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
  AddExp_plusFloat: parseInfix,
  AddExp_minus: parseInfix,
  AddExp_minusFloat: parseInfix,
  MulExp_mult: parseInfix,
  MulExp_multFloat: parseInfix,
  MulExp_divide: parseInfix,
  MulExp_divideFloat: parseInfix,
  MulExp_rem: parseInfix,
  ExpExp_power: parseInfix,
  AddExp_concat: parseInfix,

  NotExp_not: parsePrefix,

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

  PriExp_match(_match, expr, _lbracket, clauses, _comma, _rbracket) {
    return {
      type: "match",
      expr: expr.expr(),
      clauses: clauses.asIteration().children.map((c) => c.matchClause()),
      span: getSpan(this),
    };
  },

  BlockContent_exp(e) {
    return e.expr();
  },

  BlockContent_monadicLet(_let, bindFIdent, ident, _eq, value, _comma, body) {
    return {
      type: "application",
      caller: bindFIdent.expr(),
      args: [
        value.expr(),
        {
          type: "fn",
          params: [ident.ident()],
          body: body.expr(),
          span: getSpan(this),
        },
      ],
      span: getSpan(this),
    };
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

semantics.addOperation<{ namespace?: string; name: string }>(
  "qualifiedTypeAst()",
  {
    QualifiedTypeIdent(namespace, _dot, name) {
      return {
        name: name.sourceString,
        ...(namespace.numChildren === 0
          ? {}
          : { namespace: namespace.child(0).sourceString }),
      };
    },
  },
);

semantics.addOperation<TypeAst>("type()", {
  Type_any(_underscore) {
    return { type: "any", span: getSpan(this) };
  },

  Type_var(ident) {
    return { type: "var", ident: ident.sourceString, span: getSpan(this) };
  },

  Type_fn(_fn, _lparens, args, _rparens, _arrow, ret) {
    const args_ = args.asIteration().children.map((arg) => arg.type());
    return { type: "fn", args: args_, return: ret.type(), span: getSpan(this) };
  },

  Type_named(ident, _lbracket, args, _rbracket) {
    let args_: TypeAst[] = [];
    if (args.numChildren > 0) {
      args_ = args
        .child(0)
        .asIteration()
        .children.map((c) => c.type());
    }
    return {
      type: "named",
      args: args_,
      span: getSpan(this),
      ...ident.qualifiedTypeAst(),
    };
  },
});

type Statement =
  | { type: "typeDeclaration"; decl: UntypedTypeDeclaration }
  | { type: "declaration"; decl: UntypedDeclaration };

semantics.addOperation<TypeVariant<unknown>>("typeVariant()", {
  TypeVariant(name, _lparens, args, _rparens) {
    let args_: TypeAst[] = [];
    if (args.numChildren > 0) {
      args_ = args
        .child(0)
        .asIteration()
        .children.map((c) => c.type());
    }

    return { name: name.sourceString, args: args_ };
  },
});

function parseParams(params: IterationNode) {
  let params_: Array<{ name: string } & SpanMeta> = [];
  if (params.numChildren > 0) {
    params_ = params
      .child(0)
      .asIteration()
      .children.map((c) => ({
        name: c.sourceString,
        span: getSpan(c),
      }));
  }
  return params_;
}

semantics.addOperation<Statement>("statement()", {
  TypeDeclaration_externType(
    _extern,
    pubOpt,
    _type,
    typeName,
    _lT,
    params,
    _rT,
  ) {
    const pub = pubOpt.numChildren === 1;

    return {
      type: "typeDeclaration",
      decl: {
        type: "extern",
        pub,
        params: parseParams(params),
        name: typeName.sourceString,
        span: getSpan(this),
      },
    };
  },

  TypeDeclaration_typeDef(
    pubOpt,
    nestedPubOpt,
    _type,
    typeName,
    _lT,
    params,
    _rT,
    _lbracket,
    variants,
    _trailingComma,
    _rbracket,
  ) {
    const pub = pubOpt.numChildren === 1;
    const variants_ = variants
      .asIteration()
      .children.map<TypeVariant<unknown>>((n) => n.typeVariant());

    return {
      type: "typeDeclaration",
      decl: {
        type: "adt",
        pub: pub && nestedPubOpt.child(0).numChildren === 1 ? ".." : pub,
        params: parseParams(params),
        name: typeName.sourceString,
        variants: variants_,
        span: getSpan(this),
      },
    };
  },
  Declaration_externLetStmt(_extern, pubOpt, _let, ident, _colon, typeHint) {
    const pub = pubOpt.numChildren === 1;

    return {
      type: "declaration",
      decl: {
        pub,
        extern: true,
        binding: ident.ident(),
        span: getSpan(this),
        typeHint: {
          ...typeHint.type(),
          span: getSpan(typeHint.child(0)),
        },
      },
    };
  },
  Declaration_letStmt(pubOpt, _let, ident, _colon, typeHint, _eq, exp) {
    const pub = pubOpt.numChildren === 1;

    const th =
      typeHint.numChildren === 0
        ? {}
        : {
            typeHint: {
              ...typeHint.child(0).type(),
              span: getSpan(typeHint.child(0)),
            },
          };

    return {
      type: "declaration",
      decl: {
        pub,
        extern: false,
        binding: ident.ident(),
        value: exp.expr(),
        span: getSpan(this),
        ...th,
      },
    };
  },
});

semantics.addOperation<UntypedExposedValue>("exposing()", {
  Exposing_value(ident) {
    return {
      type: "value",
      name: ident.sourceString,
      span: getSpan(this),
    };
  },
  Exposing_type(ident, _parens, dots, _rparens) {
    const exposeImpl = dots.numChildren === 1;

    return {
      type: "type",
      exposeImpl,
      name: ident.sourceString,
      span: getSpan(this),
    };
  },
});

semantics.addOperation<UntypedImport>("import_()", {
  Import(_import, mod, _dot, _lparens, exposing, _rparens) {
    const exposing_ =
      exposing.numChildren === 0
        ? []
        : exposing
            .child(0)
            .asIteration()
            .children.map((c) => c.exposing());
    return {
      ns: mod.sourceString,
      exposing: exposing_,
      span: getSpan(this),
    };
  },
});

semantics.addOperation<UntypedModule>("parse()", {
  MAIN(imports, statements) {
    const statements_ = statements.children.map<Statement>((child) =>
      child.statement(),
    );

    return {
      imports: imports.children.map((c) => c.import_()),
      typeDeclarations: statements_.flatMap((st) =>
        st.type === "typeDeclaration" ? [st.decl] : [],
      ),
      declarations: statements_.flatMap((st) =>
        st.type === "declaration" ? [st.decl] : [],
      ),
    };
  },
});

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; matchResult: MatchResult };

export function parse(input: string): ParseResult<UntypedModule> {
  const matchResult = grammar.match(input);
  if (matchResult.failed()) {
    return { ok: false, matchResult };
  }

  return { ok: true, value: semantics(matchResult).parse() };
}

export function unsafeParse(input: string): UntypedModule {
  const res = parse(input);
  if (res.ok) {
    return res.value;
  }

  throw new Error(res.matchResult.message!);
}