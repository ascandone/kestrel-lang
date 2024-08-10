import antlr4, { ErrorListener } from "antlr4";
import Lexer from "./antlr/KestrelLexer";
import Parser, {
  BlockContentExprContext,
  BlockContentLetExprContext,
  BlockContentLetHashExprContext,
  BlockContext,
  BlockExprContext,
  CallContext,
  CharContext,
  CharPatternContext,
  ConsContext,
  ConsPatternContext,
  ConstructorContext,
  ExprContext,
  ExternLetDeclarationContext,
  ExternTypeDeclarationContext,
  FloatContext,
  FloatPatternContext,
  FnContext,
  FnTypeContext,
  GenericTypeContext,
  IdContext,
  IfContext,
  IntContext,
  IntPatternContext,
  LetDeclarationContext,
  ListLitContext,
  MatchContext,
  MatchIdentContext,
  NamedTypeContext,
  ParensContext,
  PipeContext,
  StringContext,
  StringPatternContext,
  StructDeclarationContext,
  TupleContext,
  TuplePatternContext,
  TupleTypeContext,
  TypeDeclarationContext,
  TypeExposingContext,
  ValueExposingContext,
} from "./antlr/KestrelParser";
import Visitor from "./antlr/KestrelVisitor";
import {
  Span,
  TypeAst,
  UntypedDeclaration,
  UntypedExposedValue,
  UntypedExpr,
  UntypedImport,
  UntypedMatchPattern,
  UntypedModule,
  UntypedTypeDeclaration,
} from "./ast";

interface InfixExprContext extends ExprContext {
  _op: { text: string };
  expr(nth: number): ExprContext;
}

const makeInfixOp = <Ctx extends InfixExprContext>(ctx: Ctx): UntypedExpr => {
  const r = ctx.expr(1);

  return {
    type: "infix",
    left: new ExpressionVisitor().visit(ctx.expr(0)),
    right: new ExpressionVisitor().visit(r),
    operator: ctx._op.text,
    span: [ctx.start.start, ctx.stop!.stop + 1],
  };
};

class TypeVisitor extends Visitor<TypeAst> {
  visitNamedType = (ctx: NamedTypeContext): TypeAst => {
    const namespace = ctx.moduleNamespace()?.getText();
    return {
      type: "named",
      args: ctx.type__list().map((t) => this.visit(t)),
      name: ctx._name.text,
      span: [ctx.start.start, ctx.stop!.stop + 1],
      ...(namespace === undefined ? {} : { namespace }),
    };
  };

  visitGenericType = (ctx: GenericTypeContext): TypeAst => {
    const id = ctx.ID().getText();

    if (id === "_") {
      return {
        type: "any",
        span: [ctx.start.start, ctx.stop!.stop + 1],
      };
    }

    return {
      type: "var",
      ident: id,
      span: [ctx.start.start, ctx.stop!.stop + 1],
    };
  };

  visitFnType = (ctx: FnTypeContext): TypeAst => ({
    type: "fn",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    args:
      ctx
        .fnTypeParams()
        ?.type__list()
        .map((p) => this.visit(p)) ?? [],
    return: this.visit(ctx._ret),
  });
  visitTupleType = (ctx: TupleTypeContext): TypeAst => {
    // TODO this should be in the AST
    const args = ctx.type__list().map((e) => this.visit(e));
    const count = args.length;

    const span: Span = [ctx.start.start, ctx.stop!.start + 1];

    return {
      type: "named",
      name: `Tuple${count}`,
      namespace: "Tuple",
      args,
      span,
    };
  };
}

class MatchPatternVisitor extends Visitor<UntypedMatchPattern> {
  visitMatchIdent = (ctx: MatchIdentContext): UntypedMatchPattern => ({
    type: "identifier",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    name: ctx.ID().getText(),
  });

  visitConstructor = (ctx: ConstructorContext): UntypedMatchPattern => ({
    type: "constructor",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    name: ctx._name.text,
    namespace: ctx.moduleNamespace()?.getText(),
    args: ctx.matchPattern_list().map((p) => this.visit(p)),
  });

  visitIntPattern = (ctx: IntPatternContext): UntypedMatchPattern => ({
    type: "lit",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    literal: {
      type: "int",
      value: Number(ctx.getText()),
    },
  });

  visitFloatPattern = (ctx: FloatPatternContext): UntypedMatchPattern => ({
    type: "lit",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    literal: {
      type: "float",
      value: Number(ctx.getText()),
    },
  });

  visitStringPattern = (ctx: StringPatternContext): UntypedMatchPattern => ({
    type: "lit",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    literal: {
      type: "string",
      value: ctx.getText().slice(1, -1),
    },
  });

  visitCharPattern = (ctx: CharPatternContext): UntypedMatchPattern => ({
    type: "lit",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    literal: {
      type: "char",
      value: ctx.getText().slice(1, -1),
    },
  });

  visitTuplePattern = (ctx: TuplePatternContext): UntypedMatchPattern => {
    const args = ctx.matchPattern_list();
    return {
      type: "constructor",
      span: [ctx.start.start, ctx.stop!.stop + 1],
      name: `Tuple${args.length}`,
      namespace: "Tuple",
      args: args.map((a) => this.visit(a)),
    };
  };

  visitConsPattern = (ctx: ConsPatternContext): UntypedMatchPattern => {
    return {
      type: "constructor",
      span: [ctx.start.start, ctx.stop!.stop + 1],
      namespace: "List",
      name: "Cons",
      args: [this.visit(ctx.matchPattern(0)), this.visit(ctx.matchPattern(1))],
    };
  };
}

class ExpressionVisitor extends Visitor<UntypedExpr> {
  visitErrorNode(_node_: antlr4.ErrorNode): UntypedExpr {
    throw new Error("ERROR NODE");
  }

  visit(expr: ExprContext): UntypedExpr {
    if (expr.exception !== null) {
      return {
        type: "syntax-err",
        span: [expr.start.start, expr.stop!.stop + 1],
      };
    }

    return super.visit(expr);
  }

  visitInt = (ctx: IntContext): UntypedExpr => ({
    type: "constant",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    value: {
      type: "int",
      value: Number(ctx.getText()),
    },
  });

  visitFloat = (ctx: FloatContext): UntypedExpr => ({
    type: "constant",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    value: {
      type: "float",
      value: Number(ctx.getText()),
    },
  });

  visitString = (ctx: StringContext): UntypedExpr => ({
    type: "constant",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    value: {
      type: "string",
      value: ctx.getText().slice(1, -1),
    },
  });

  visitChar = (ctx: CharContext): UntypedExpr => ({
    type: "constant",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    value: {
      type: "char",
      value: ctx.getText().slice(1, -1),
    },
  });

  visitId = (ctx: IdContext): UntypedExpr => ({
    type: "identifier",
    namespace: ctx.qualifiedId().moduleNamespace()?.getText(),
    name: ctx.qualifiedId()._name.text,
    span: [ctx.start.start, ctx.stop!.stop + 1],
  });

  visitBoolNot = (ctx: ParensContext): UntypedExpr => ({
    type: "application",
    caller: {
      type: "identifier",
      name: "!",
      span: [ctx.start.start, ctx.start.start + 1],
    },
    args: [this.visit(ctx.expr())],
    span: [ctx.start.start, ctx.stop!.stop + 1],
  });

  visitCall = (ctx: CallContext): UntypedExpr => ({
    type: "application",
    caller: this.visit(ctx.expr(0)),
    args: ctx
      .expr_list()
      .slice(1)
      .map((e) => this.visit(e)),
    span: [ctx.start.start, ctx.stop!.stop + 1],
  });

  visitBlockExpr = (ctx: BlockExprContext): UntypedExpr =>
    this.visit(ctx.block());

  visitBlockContentExpr = (ctx: BlockContentExprContext): UntypedExpr =>
    this.visit(ctx.expr());

  visitBlockContentLetExpr = (
    ctx: BlockContentLetExprContext,
  ): UntypedExpr => ({
    type: "let",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    pattern: new MatchPatternVisitor().visit(ctx._pattern),
    value: this.visit(ctx._value),
    body: this.visit(ctx._body),
  });

  visitBlockContentLetHashExpr = (
    ctx: BlockContentLetHashExprContext,
  ): UntypedExpr => ({
    type: "let#",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    pattern: new MatchPatternVisitor().visit(ctx._pattern),
    mapper: {
      name: ctx._mapper._name.text,
      span: [ctx.qualifiedId().start.start, ctx.qualifiedId().stop!.stop + 1],
      namespace: ctx.qualifiedId().moduleNamespace()?.getText(),
    },
    value: this.visit(ctx._value),
    body: this.visit(ctx._body),
  });

  visitBlock = (ctx: BlockContext): UntypedExpr =>
    this.visit(ctx.blockContent());

  visitFn = (ctx: FnContext): UntypedExpr => ({
    type: "fn",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    params: ctx
      .matchPattern_list()
      .map((patternCtx) => new MatchPatternVisitor().visit(patternCtx)),
    body: this.visit(ctx.block()),
  });

  visitIf = (ctx: IfContext): UntypedExpr => ({
    type: "if",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    condition: this.visit(ctx._condition),
    then: this.visit(ctx._then),
    else: this.visit(ctx._else_),
  });

  visitMatch = (ctx: MatchContext): UntypedExpr => ({
    type: "match",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    expr: this.visit(ctx._matched),
    clauses: ctx
      .matchClause_list()
      .map((clause) => [
        new MatchPatternVisitor().visit(clause.matchPattern()),
        this.visit(clause.expr()),
      ]),
  });

  visitParens = (ctx: ParensContext): UntypedExpr => this.visit(ctx.expr());
  visitAddSub = makeInfixOp;
  visitMulDiv = makeInfixOp;
  visitBoolAnd = makeInfixOp;
  visitBoolOr = makeInfixOp;
  visitComp = makeInfixOp;
  visitEq = makeInfixOp;

  visitCons = (ctx: ConsContext): UntypedExpr => ({
    type: "application",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    caller: {
      type: "identifier",
      name: "Cons",
      namespace: "List",
      span: [ctx._op.start, ctx._op.stop + 1],
    },
    args: [this.visit(ctx.expr(0)), this.visit(ctx.expr(1))],
  });

  visitTuple = (ctx: TupleContext): UntypedExpr => {
    // TODO this should be in the AST
    const args = ctx.expr_list().map((e) => this.visit(e));
    const count = args.length;

    const span: Span = [ctx.start.start, ctx.stop!.start + 1];

    return {
      type: "application",
      caller: {
        type: "identifier",
        name: `Tuple${count}`,
        namespace: "Tuple",
        span,
      },
      args,
      span,
    };
  };

  visitListLit = (ctx: ListLitContext): UntypedExpr => ({
    type: "list-literal",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    values: ctx.expr_list().map((e) => this.visit(e)),
  });

  visitPipe = (ctx: PipeContext): UntypedExpr => ({
    type: "pipe",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    left: this.visit(ctx.expr(0)),
    right: this.visit(ctx.expr(1)),
  });
}

type DeclarationType =
  | { type: "value"; decl: UntypedDeclaration }
  | { type: "type"; decl: UntypedTypeDeclaration }
  | { type: "syntax-err" };

class ExposingVisitor extends Visitor<UntypedExposedValue> {
  visitValueExposing = (ctx: ValueExposingContext): UntypedExposedValue => ({
    type: "value",
    name: normalizeInfix(ctx._name.text),
    span: [ctx.start.start, ctx.stop!.stop + 1],
  });

  visitTypeExposing = (ctx: TypeExposingContext): UntypedExposedValue => ({
    type: "type",
    exposeImpl: ctx.EXPOSING_NESTED() != null,
    name: ctx._name.text,
    span: [ctx.start.start, ctx.stop!.stop + 1],
  });
}

class DeclarationVisitor extends Visitor<DeclarationType> {
  visitLetDeclaration = (letDecl: LetDeclarationContext): DeclarationType => {
    const ctx = letDecl.letDeclaration_();

    const binding = ctx.ID();

    const e = ctx.expr();
    if (e === null) {
      return { type: "syntax-err" };
    }
    const value: UntypedExpr = new ExpressionVisitor().visit(e);

    const typeHint: TypeAst | undefined =
      ctx._typeHint === undefined
        ? undefined
        : // @ts-ignore
          ctx._typeHint.accept(new TypeVisitor())[0];

    const docs = ctx
      .DOC_COMMENT_LINE_list()
      .map((d) => d.getText().slice(3))
      .join("");

    return {
      type: "value",
      decl: {
        extern: false,
        inline: ctx._inline !== undefined,
        pub: ctx._pub !== undefined,
        ...(docs === "" ? {} : { docComment: docs }),
        ...(typeHint === undefined
          ? {}
          : {
              typeHint: {
                mono: typeHint,
                span: typeHint.span,
                where: ctx._typeHint.traitImplClause_list().map((t) => ({
                  typeVar: t.ID().getText(),
                  traits: t.TYPE_ID_list().map((t) => t.getText()),
                })),
              },
            }),
        binding: {
          name: binding.getText(),
          span: [binding.symbol.start, binding.symbol.stop + 1],
        },
        span: [ctx.start.start, ctx.stop!.stop + 1],
        value,
      },
    };
  };

  visitExternLetDeclaration = (
    letDecl: ExternLetDeclarationContext,
  ): DeclarationType => {
    const ctx = letDecl.externLetDeclaration_();

    const typeHint: TypeAst =
      // @ts-ignore
      ctx._typeHint.accept(new TypeVisitor())[0];

    const docs = ctx
      .DOC_COMMENT_LINE_list()
      .map((d) => d.getText().slice(3))
      .join("");

    return {
      type: "value",
      decl: {
        extern: true,
        pub: ctx._pub !== undefined,
        typeHint: {
          mono: typeHint,
          span: typeHint.span,
          where: ctx._typeHint.traitImplClause_list().map((t) => ({
            typeVar: t.ID().getText(),
            traits: t.TYPE_ID_list().map((t) => t.getText()),
          })),
        },
        binding: {
          name: normalizeInfix(ctx._binding.text),
          span: [ctx._binding.start, ctx._binding.stop + 1],
        },
        ...(docs === "" ? {} : { docComment: docs }),
        span: [ctx.start.start, ctx.stop!.stop + 1],
      },
    };
  };

  visitTypeDeclaration = (
    typeDecl: TypeDeclarationContext,
  ): DeclarationType => {
    const ctx = typeDecl.typeDeclaration_();

    const docs = ctx
      .DOC_COMMENT_LINE_list()
      .map((d) => d.getText().slice(3))
      .join("");

    return {
      type: "type",
      decl: {
        type: "adt",
        pub:
          ctx._pub === undefined
            ? false
            : ctx._pub.EXPOSING_NESTED() == null
              ? true
              : "..",
        name: ctx._name.text,
        variants:
          ctx
            .typeVariants()
            ?.typeConstructorDecl_list()
            .map((v) => ({
              name: v._name.text,
              span: [v.start.start, v.stop!.stop + 1],
              args: v.type__list().map((t) => new TypeVisitor().visit(t)),
            })) ?? [],
        params:
          ctx
            .paramsList()
            ?.ID_list()
            .map((i) => ({
              name: i.getText(),
              span: [i.symbol.start, i.symbol.stop + 1],
            })) ?? [],
        ...(docs === "" ? {} : { docComment: docs }),
        span: [ctx.start.start, ctx.stop!.stop + 1],
      },
    };
  };

  visitStructDeclaration = (
    structDecl: StructDeclarationContext,
  ): DeclarationType => {
    const ctx = structDecl.structDeclaration_();

    return {
      type: "type",
      decl: {
        type: "struct",
        fields: [],

        params:
          ctx
            .paramsList()
            ?.ID_list()
            .map((i) => ({
              name: i.getText(),
              span: [i.symbol.start, i.symbol.stop + 1],
            })) ?? [],
        pub:
          ctx._pub === undefined
            ? false
            : ctx._pub.EXPOSING_NESTED() == null
              ? true
              : "..",
        name: ctx._name.text,
        span: [ctx.start.start, ctx.stop!.stop + 1],
      },
    };
  };

  visitExternTypeDeclaration = (
    typeDecl: ExternTypeDeclarationContext,
  ): DeclarationType => {
    const ctx = typeDecl.externTypeDeclaration_();

    const docs = ctx
      .DOC_COMMENT_LINE_list()
      .map((d) => d.getText().slice(3))
      .join("");

    return {
      type: "type",
      decl: {
        type: "extern",
        pub: ctx._pub !== undefined,
        name: ctx._name.text,

        params:
          ctx
            .paramsList()
            ?.ID_list()
            .map((i) => ({
              name: i.getText(),
              span: [i.symbol.start, i.symbol.stop + 1],
            })) ?? [],
        ...(docs === "" ? {} : { docComment: docs }),
        span: [ctx.start.start, ctx.stop!.stop + 1],
      },
    };
  };
}

export class AntlrLexerError {
  constructor(
    public readonly line: number,
    public readonly column: number,
    public readonly description: string,
  ) {}
}

export class AntlrParsingError {
  constructor(
    public readonly span: Span,
    public readonly description: string,
  ) {}
}

class LexerErrorListener extends ErrorListener<number> {
  errors: AntlrLexerError[] = [];

  syntaxError(
    _recognizer: antlr4.Recognizer<number>,
    _offendingSymbol: number,
    line: number,
    column: number,
    msg: string,
    _e: antlr4.RecognitionException | undefined,
  ): void {
    this.errors.push(new AntlrLexerError(line, column, msg));
  }
}

class ParsingErrorListener extends ErrorListener<antlr4.Token> {
  errors: AntlrParsingError[] = [];

  syntaxError(
    _recognizer: antlr4.Recognizer<antlr4.Token>,
    offendingSymbol: antlr4.Token,
    _line: number,
    _column: number,
    msg: string,
  ): void {
    this.errors.push(
      new AntlrParsingError([offendingSymbol.start, offendingSymbol.stop], msg),
    );
  }
}

export type ParseResult = {
  parsed: UntypedModule;

  lexerErrors: AntlrLexerError[];
  parsingErrors: AntlrParsingError[];
};

export function parse(input: string): ParseResult {
  const chars = new antlr4.CharStream(input);
  const lexer = new Lexer(chars);

  const lexerErrorListener = new LexerErrorListener();
  lexer.removeErrorListeners();
  lexer.addErrorListener(lexerErrorListener);

  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new Parser(tokens);

  const parsingErrorListener = new ParsingErrorListener();
  parser.removeErrorListeners();
  parser.addErrorListener(parsingErrorListener);

  const declCtx = parser.program();

  const docs = declCtx
    .MODULEDOC_COMMENT_LINE_list()
    .map((d) => d.getText().slice(4))
    .join("");

  const declarations = declCtx
    .declaration_list()
    .map((d) => new DeclarationVisitor().visit(d));

  const parsed: UntypedModule = {
    ...(docs === "" ? {} : { moduleDoc: docs }),
    imports: declCtx.import__list().map((i): UntypedImport => {
      return {
        ns: i.moduleNamespace().getText(),
        exposing: i
          .importExposing_list()
          .map((e): UntypedExposedValue => new ExposingVisitor().visit(e)),
        span: [i.start.start, i.stop!.stop + 1],
      };
    }),

    declarations: declarations.flatMap((d) => {
      if (d.type === "value") {
        return d.decl;
      }
      return [];
    }),

    typeDeclarations: declarations.flatMap((d) => {
      if (d.type === "type") {
        return d.decl;
      }
      return [];
    }),
  };

  return {
    parsed,
    parsingErrors: parsingErrorListener.errors,
    lexerErrors: lexerErrorListener.errors,
  };
}

export function unsafeParse(input: string): UntypedModule {
  const parsed = parse(input);
  if (parsed.lexerErrors.length !== 0) {
    throw new Error(`Lexing error: ${parsed.lexerErrors[0]!.description}`);
  }

  if (parsed.parsingErrors.length !== 0) {
    throw new Error(`Parsing error: ${parsed.parsingErrors[0]!.description}`);
  }

  return parsed.parsed;
}

function normalizeInfix(name: string) {
  return name.startsWith("(") ? name.slice(1, -1) : name;
}
