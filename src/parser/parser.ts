import antlr4, {
  ErrorListener,
  ParserRuleContext,
  TerminalNode,
  Token,
} from "antlr4";
import Lexer from "./antlr/KestrelLexer";
import Parser, {
  BlockContentExprContext,
  BlockContentLetExprContext,
  BlockContentLetHashExprContext,
  BlockContext,
  BlockExprContext,
  BoolNotContext,
  CallContext,
  CharContext,
  CharPatternContext,
  ConsContext,
  ConsPatternContext,
  ConstructorContext,
  ExprContext,
  ExternLetDeclarationContext,
  ExternTypeDeclarationContext,
  FieldAccessContext,
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
  StructLitContext,
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
    span: spanOfCtx(ctx),
  };
};

class TypeVisitor extends Visitor<TypeAst> {
  visitNamedType = (ctx: NamedTypeContext): TypeAst => {
    const namespace = ctx.moduleNamespace()?.getText();
    return {
      type: "named",
      args: ctx.type__list().map((t) => this.visit(t)),
      name: ctx._name.text,
      span: spanOfCtx(ctx),
      ...(namespace === undefined ? {} : { namespace }),
    };
  };

  visitGenericType = (ctx: GenericTypeContext): TypeAst => {
    const id = ctx.ID().getText();

    if (id === "_") {
      return {
        type: "any",
        span: spanOfCtx(ctx),
      };
    }

    return {
      type: "var",
      ident: id,
      span: spanOfCtx(ctx),
    };
  };

  visitFnType = (ctx: FnTypeContext): TypeAst => ({
    type: "fn",
    span: spanOfCtx(ctx),
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

    return {
      type: "named",
      name: `Tuple${args.length}`,
      namespace: "Tuple",
      args,
      span: spanOfCtx(ctx),
    };
  };
}

class MatchPatternVisitor extends Visitor<UntypedMatchPattern> {
  visitMatchIdent = (ctx: MatchIdentContext): UntypedMatchPattern => ({
    type: "identifier",
    span: spanOfCtx(ctx),
    name: ctx.ID().getText(),
  });

  visitConstructor = (ctx: ConstructorContext): UntypedMatchPattern => ({
    type: "constructor",
    span: spanOfCtx(ctx),
    name: ctx._name.text,
    namespace: ctx.moduleNamespace()?.getText(),
    args: ctx.matchPattern_list().map((p) => this.visit(p)),
  });

  visitIntPattern = (ctx: IntPatternContext): UntypedMatchPattern => ({
    type: "lit",
    span: spanOfCtx(ctx),
    literal: {
      type: "int",
      value: Number(ctx.getText()),
    },
  });

  visitFloatPattern = (ctx: FloatPatternContext): UntypedMatchPattern => ({
    type: "lit",
    span: spanOfCtx(ctx),
    literal: {
      type: "float",
      value: Number(ctx.getText()),
    },
  });

  visitStringPattern = (ctx: StringPatternContext): UntypedMatchPattern => ({
    type: "lit",
    span: spanOfCtx(ctx),
    literal: {
      type: "string",
      value: ctx.getText().slice(1, -1),
    },
  });

  visitCharPattern = (ctx: CharPatternContext): UntypedMatchPattern => ({
    type: "lit",
    span: spanOfCtx(ctx),
    literal: {
      type: "char",
      value: ctx.getText().slice(1, -1),
    },
  });

  visitTuplePattern = (ctx: TuplePatternContext): UntypedMatchPattern => {
    const args = ctx.matchPattern_list();
    return {
      type: "constructor",
      span: spanOfCtx(ctx),
      name: `Tuple${args.length}`,
      namespace: "Tuple",
      args: args.map((a) => this.visit(a)),
    };
  };

  visitConsPattern = (ctx: ConsPatternContext): UntypedMatchPattern => {
    return {
      type: "constructor",
      span: spanOfCtx(ctx),
      namespace: "List",
      name: "Cons",
      args: [this.visit(ctx.matchPattern(0)), this.visit(ctx.matchPattern(1))],
    };
  };
}

class ExpressionVisitor extends Visitor<UntypedExpr> {
  visit(expr: ExprContext): UntypedExpr {
    if (expr.exception !== null) {
      if (expr instanceof FieldAccessContext) {
        return {
          type: "field-access",
          struct: this.visit(expr.expr()),
          field: { name: "", span: spanOfCtx(expr), structName: undefined },
          span: spanOfCtx(expr),
        };
      }

      const start = expr.stop!.start + 1;
      const stop = expr.start.stop + 1;

      return {
        type: "syntax-err",
        span: [start, stop],
      };
    }

    return super.visit(expr);
  }

  visitInt = (ctx: IntContext): UntypedExpr => ({
    type: "constant",
    span: spanOfCtx(ctx),
    value: {
      type: "int",
      value: Number(ctx.getText()),
    },
  });

  visitFloat = (ctx: FloatContext): UntypedExpr => ({
    type: "constant",
    span: spanOfCtx(ctx),
    value: {
      type: "float",
      value: Number(ctx.getText()),
    },
  });

  visitString = (ctx: StringContext): UntypedExpr => ({
    type: "constant",
    span: spanOfCtx(ctx),
    value: {
      type: "string",
      value: ctx.getText().slice(1, -1),
    },
  });

  visitChar = (ctx: CharContext): UntypedExpr => ({
    type: "constant",
    span: spanOfCtx(ctx),
    value: {
      type: "char",
      value: ctx.getText().slice(1, -1),
    },
  });

  visitId = (ctx: IdContext): UntypedExpr => ({
    type: "identifier",
    namespace: ctx.qualifiedId().moduleNamespace()?.getText(),
    name: ctx.qualifiedId()._name.text,
    span: spanOfCtx(ctx),
  });

  visitFieldAccess = (ctx: FieldAccessContext): UntypedExpr => {
    return {
      type: "field-access",
      struct: this.visit(ctx.expr()),
      field: {
        name: ctx.ID().getText(),
        structName:
          ctx._structName === undefined ? undefined : ctx._structName.text,
        span: spanOfTerminalNode(ctx.ID()),
      },
      span: spanOfCtx(ctx),
    };
  };

  visitBoolNot = (ctx: BoolNotContext): UntypedExpr => ({
    type: "application",
    caller: {
      type: "identifier",
      name: "!",
      span: spanOfTk(ctx._op),
    },
    args: [this.visit(ctx.expr())],
    span: spanOfCtx(ctx),
  });

  visitCall = (ctx: CallContext): UntypedExpr => ({
    type: "application",
    caller: this.visit(ctx.expr(0)),
    args: ctx
      .expr_list()
      .slice(1)
      .map((e) => this.visit(e)),
    span: spanOfCtx(ctx),
  });

  visitBlockExpr = (ctx: BlockExprContext): UntypedExpr =>
    this.visit(ctx.block());

  visitBlockContentExpr = (ctx: BlockContentExprContext): UntypedExpr =>
    this.visit(ctx.expr());

  visitBlockContentLetExpr = (
    ctx: BlockContentLetExprContext,
  ): UntypedExpr => ({
    type: "let",
    span: spanOfCtx(ctx),
    pattern: new MatchPatternVisitor().visit(ctx._pattern),
    value: this.visit(ctx._value),
    body: this.visit(ctx._body),
  });

  visitBlockContentLetHashExpr = (
    ctx: BlockContentLetHashExprContext,
  ): UntypedExpr => ({
    type: "let#",
    span: spanOfCtx(ctx),
    pattern: new MatchPatternVisitor().visit(ctx._pattern),
    mapper: {
      name: ctx._mapper._name.text,
      span: spanOfCtx(ctx.qualifiedId()),
      namespace: ctx.qualifiedId().moduleNamespace()?.getText(),
    },
    value: this.visit(ctx._value),
    body: this.visit(ctx._body),
  });

  visitBlock = (ctx: BlockContext): UntypedExpr =>
    this.visit(ctx.blockContent());

  visitFn = (ctx: FnContext): UntypedExpr => ({
    type: "fn",
    span: spanOfCtx(ctx),
    params: ctx
      .matchPattern_list()
      .map((patternCtx) => new MatchPatternVisitor().visit(patternCtx)),
    body: this.visit(ctx.block()),
  });

  visitIf = (ctx: IfContext): UntypedExpr => ({
    type: "if",
    span: spanOfCtx(ctx),
    condition: this.visit(ctx._condition),
    then: this.visit(ctx._then),
    else: this.visit(ctx._else_),
  });

  visitMatch = (ctx: MatchContext): UntypedExpr => ({
    type: "match",
    span: spanOfCtx(ctx),
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
    span: spanOfCtx(ctx),
    caller: {
      type: "identifier",
      name: "Cons",
      namespace: "List",
      span: spanOfTk(ctx._op),
    },
    args: [this.visit(ctx.expr(0)), this.visit(ctx.expr(1))],
  });

  visitTuple = (ctx: TupleContext): UntypedExpr => {
    // TODO this should be in the AST
    const args = ctx.expr_list().map((e) => this.visit(e));
    const count = args.length;

    return {
      type: "application",
      caller: {
        type: "identifier",
        name: `Tuple${count}`,
        namespace: "Tuple",
        span: spanOfCtx(ctx),
      },
      args,
      span: spanOfCtx(ctx),
    };
  };

  visitStructLit = (ctx: StructLitContext): UntypedExpr => {
    let spread: UntypedExpr | undefined = undefined;
    if (ctx._spread) {
      spread = this.visit(ctx._spread);
    }

    return {
      type: "struct-literal",
      span: spanOfCtx(ctx),
      struct: {
        name: ctx.TYPE_ID().getText(),
        span: spanOfTerminalNode(ctx.TYPE_ID()),
      },
      spread,
      fields:
        ctx
          .structFields()
          ?.structField_list()
          .map((v) => ({
            field: {
              name: v.ID().getText(),
              span: spanOfTerminalNode(v.ID()),
            },
            span: spanOfCtx(v),
            value: this.visit(v.expr()),
          })) ?? [],
    };
  };

  visitListLit = (ctx: ListLitContext): UntypedExpr => ({
    type: "list-literal",
    span: spanOfCtx(ctx),
    values: ctx.expr_list().map((e) => this.visit(e)),
  });

  visitPipe = (ctx: PipeContext): UntypedExpr => ({
    type: "pipe",
    span: spanOfCtx(ctx),
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
    span: spanOfCtx(ctx),
  });

  visitTypeExposing = (ctx: TypeExposingContext): UntypedExposedValue => ({
    type: "type",
    exposeImpl: ctx.EXPOSING_NESTED() != null,
    name: ctx._name.text,
    span: spanOfCtx(ctx),
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
          span: spanOfTerminalNode(binding),
        },
        span: spanOfCtx(ctx),
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
          span: spanOfTk(ctx._binding),
        },
        ...(docs === "" ? {} : { docComment: docs }),
        span: spanOfCtx(ctx),
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
              span: spanOfCtx(v),
              args: v.type__list().map((t) => new TypeVisitor().visit(t)),
            })) ?? [],
        params:
          ctx
            .paramsList()
            ?.ID_list()
            .map((i) => ({
              name: i.getText(),
              span: spanOfTerminalNode(i),
            })) ?? [],
        ...(docs === "" ? {} : { docComment: docs }),
        span: spanOfCtx(ctx),
      },
    };
  };

  visitStructDeclaration = (
    structDecl: StructDeclarationContext,
  ): DeclarationType => {
    const ctx = structDecl.structDeclaration_();

    const docs = ctx
      .DOC_COMMENT_LINE_list()
      .map((d) => d.getText().slice(3))
      .join("");

    return {
      type: "type",
      decl: {
        type: "struct",
        fields:
          ctx
            .declarationFields()
            ?.fieldDecl_list()
            .map((v) => ({
              name: v.ID().getText(),
              span: spanOfCtx(v),
              // args: v.type__list().map((t) => new TypeVisitor().visit(t)),
              type_: new TypeVisitor().visit(v.type_()),
            })) ?? [],

        params:
          ctx
            .paramsList()
            ?.ID_list()
            .map((i) => ({
              name: i.getText(),
              span: spanOfTerminalNode(i),
            })) ?? [],
        pub:
          ctx._pub === undefined
            ? false
            : ctx._pub.EXPOSING_NESTED() == null
              ? true
              : "..",
        name: ctx._name.text,
        ...(docs === "" ? {} : { docComment: docs }),
        span: spanOfCtx(ctx),
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
              span: spanOfTerminalNode(i),
            })) ?? [],
        ...(docs === "" ? {} : { docComment: docs }),
        span: spanOfCtx(ctx),
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
        span: spanOfCtx(i),
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

function spanOfCtx(ctx: ParserRuleContext): Span {
  return [ctx.start.start, ctx.stop!.stop + 1];
}

function spanOfTerminalNode(node: TerminalNode): Span {
  return [node.symbol.start, node.symbol.stop + 1];
}

function spanOfTk(tk: Token): Span {
  return [tk.start, tk.stop + 1];
}
