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
  Declaration,
  LineComment,
  MatchPattern,
  Position,
  Range,
  TypeAst,
  ExposedValue,
  Expr,
  Import,
  UntypedModule,
  TypeDeclaration,
} from "./ast";

const COMMENTS_CHANNEL = 1;

interface InfixExprContext extends ExprContext {
  _op: { text: string };
  expr(nth: number): ExprContext;
}

const makeInfixOp = <Ctx extends InfixExprContext>(ctx: Ctx): Expr => {
  const r = ctx.expr(1);

  return {
    type: "infix",
    left: new ExpressionVisitor().visit(ctx.expr(0)),
    right: new ExpressionVisitor().visit(r),
    operator: ctx._op.text,
    range: rangeOfCtx(ctx),
  };
};

class TypeVisitor extends Visitor<TypeAst> {
  visitNamedType = (ctx: NamedTypeContext): TypeAst => {
    const namespace = ctx.moduleNamespace()?.getText();
    return {
      type: "named",
      args: ctx.type__list().map((t) => this.visit(t)),
      name: ctx._name.text,
      range: rangeOfCtx(ctx),
      ...(namespace === undefined ? {} : { namespace }),
    };
  };

  visitGenericType = (ctx: GenericTypeContext): TypeAst => {
    const id = ctx.ID().getText();

    if (id === "_") {
      return {
        type: "any",
        range: rangeOfCtx(ctx),
      };
    }

    return {
      type: "var",
      ident: id,
      range: rangeOfCtx(ctx),
    };
  };

  visitFnType = (ctx: FnTypeContext): TypeAst => ({
    type: "fn",
    range: rangeOfCtx(ctx),
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
      range: rangeOfCtx(ctx),
    };
  };
}

class MatchPatternVisitor extends Visitor<MatchPattern> {
  visitMatchIdent = (ctx: MatchIdentContext): MatchPattern => ({
    type: "identifier",
    range: rangeOfCtx(ctx),
    name: ctx.ID().getText(),
  });

  visitConstructor = (ctx: ConstructorContext): MatchPattern => ({
    type: "constructor",
    range: rangeOfCtx(ctx),
    name: ctx._name.text,
    namespace: ctx.moduleNamespace()?.getText(),
    args: ctx.matchPattern_list().map((p) => this.visit(p)),
  });

  visitIntPattern = (ctx: IntPatternContext): MatchPattern => ({
    type: "lit",
    range: rangeOfCtx(ctx),
    literal: {
      type: "int",
      value: Number(ctx.getText()),
    },
  });

  visitFloatPattern = (ctx: FloatPatternContext): MatchPattern => ({
    type: "lit",
    range: rangeOfCtx(ctx),
    literal: {
      type: "float",
      value: Number(ctx.getText()),
    },
  });

  visitStringPattern = (ctx: StringPatternContext): MatchPattern => ({
    type: "lit",
    range: rangeOfCtx(ctx),
    literal: {
      type: "string",
      value: ctx.getText().slice(1, -1),
    },
  });

  visitCharPattern = (ctx: CharPatternContext): MatchPattern => ({
    type: "lit",
    range: rangeOfCtx(ctx),
    literal: {
      type: "char",
      value: ctx.getText().slice(1, -1),
    },
  });

  visitTuplePattern = (ctx: TuplePatternContext): MatchPattern => {
    const args = ctx.matchPattern_list();
    return {
      type: "constructor",
      range: rangeOfCtx(ctx),
      name: `Tuple${args.length}`,
      namespace: "Tuple",
      args: args.map((a) => this.visit(a)),
    };
  };

  visitConsPattern = (ctx: ConsPatternContext): MatchPattern => {
    return {
      type: "constructor",
      range: rangeOfCtx(ctx),
      namespace: "List",
      name: "Cons",
      args: [this.visit(ctx.matchPattern(0)), this.visit(ctx.matchPattern(1))],
    };
  };
}

class ExpressionVisitor extends Visitor<Expr> {
  visit(expr: ExprContext): Expr {
    if (expr.exception !== null) {
      if (expr instanceof FieldAccessContext) {
        return {
          type: "field-access",
          struct: this.visit(expr.expr()),
          field: { name: "", range: rangeOfCtx(expr), structName: undefined },
          range: rangeOfCtx(expr),
        };
      }

      return {
        type: "syntax-err",
        range: {
          start: {
            line: expr.stop!.line - 1,
            character: expr.stop!.column + 1,
          },
          end: {
            line: expr.start.line - 1,
            character: expr.start.column,
          },
        },
      };
    }

    return super.visit(expr);
  }

  visitInt = (ctx: IntContext): Expr => ({
    type: "constant",
    range: rangeOfCtx(ctx),
    value: {
      type: "int",
      value: Number(ctx.getText()),
    },
  });

  visitFloat = (ctx: FloatContext): Expr => ({
    type: "constant",
    range: rangeOfCtx(ctx),
    value: {
      type: "float",
      value: Number(ctx.getText()),
    },
  });

  visitString = (ctx: StringContext): Expr => ({
    type: "constant",
    range: rangeOfCtx(ctx),
    value: {
      type: "string",
      value: ctx.getText().slice(1, -1),
    },
  });

  visitChar = (ctx: CharContext): Expr => ({
    type: "constant",
    range: rangeOfCtx(ctx),
    value: {
      type: "char",
      value: ctx.getText().slice(1, -1),
    },
  });

  visitId = (ctx: IdContext): Expr => ({
    type: "identifier",
    namespace: ctx.qualifiedId().moduleNamespace()?.getText(),
    name: ctx.qualifiedId()._name.text,
    range: rangeOfCtx(ctx),
  });

  visitFieldAccess = (ctx: FieldAccessContext): Expr => {
    return {
      type: "field-access",
      struct: this.visit(ctx.expr()),
      field: {
        name: ctx.ID().getText(),
        structName:
          ctx._structName === undefined ? undefined : ctx._structName.text,
        range: rangeOfTerminalNode(ctx.ID()),
      },
      range: rangeOfCtx(ctx),
    };
  };

  visitBoolNot = (ctx: BoolNotContext): Expr => ({
    type: "application",
    caller: {
      type: "identifier",
      name: "!",
      range: rangeOfTk(ctx._op),
    },
    args: [this.visit(ctx.expr())],
    range: rangeOfCtx(ctx),
  });

  visitCall = (ctx: CallContext): Expr => ({
    type: "application",
    caller: this.visit(ctx.expr(0)),
    args: ctx
      .expr_list()
      .slice(1)
      .map((e) => this.visit(e)),
    range: rangeOfCtx(ctx),
  });

  visitBlockExpr = (ctx: BlockExprContext): Expr => {
    return {
      type: "block",
      range: rangeOfCtx(ctx),
      inner: this.visit(ctx.block()),
    };
  };

  visitBlockContentExpr = (ctx: BlockContentExprContext): Expr =>
    this.visit(ctx.expr());

  visitBlockContentLetExpr = (ctx: BlockContentLetExprContext): Expr => ({
    type: "let",
    range: rangeOfCtx(ctx),
    pattern: new MatchPatternVisitor().visit(ctx._pattern),
    value: this.visit(ctx._value),
    body: this.visit(ctx._body),
  });

  visitBlockContentLetHashExpr = (
    ctx: BlockContentLetHashExprContext,
  ): Expr => ({
    type: "let#",
    range: rangeOfCtx(ctx),
    pattern: new MatchPatternVisitor().visit(ctx._pattern),
    mapper: {
      name: ctx._mapper._name.text,
      range: rangeOfCtx(ctx.qualifiedId()),
      namespace: ctx.qualifiedId().moduleNamespace()?.getText(),
    },
    value: this.visit(ctx._value),
    body: this.visit(ctx._body),
  });

  visitBlock = (ctx: BlockContext): Expr => this.visit(ctx.blockContent());

  visitFn = (ctx: FnContext): Expr => ({
    type: "fn",
    range: rangeOfCtx(ctx),
    params: ctx
      .matchPattern_list()
      .map((patternCtx) => new MatchPatternVisitor().visit(patternCtx)),
    body: this.visit(ctx.block()),
  });

  visitIf = (ctx: IfContext): Expr => ({
    type: "if",
    range: rangeOfCtx(ctx),
    condition: this.visit(ctx._condition),
    then: this.visit(ctx._then),
    else: this.visit(ctx._else_),
  });

  visitMatch = (ctx: MatchContext): Expr => ({
    type: "match",
    range: rangeOfCtx(ctx),
    expr: this.visit(ctx._matched),
    clauses: ctx
      .matchClause_list()
      .map((clause) => [
        new MatchPatternVisitor().visit(clause.matchPattern()),
        this.visit(clause.expr()),
      ]),
  });

  visitParens = (ctx: ParensContext): Expr => this.visit(ctx.expr());
  visitAddSub = makeInfixOp;
  visitMulDiv = makeInfixOp;
  visitBoolAnd = makeInfixOp;
  visitBoolOr = makeInfixOp;
  visitComp = makeInfixOp;
  visitEq = makeInfixOp;

  visitCons = (ctx: ConsContext): Expr => ({
    type: "application",
    range: rangeOfCtx(ctx),
    caller: {
      type: "identifier",
      name: "Cons",
      namespace: "List",
      range: rangeOfTk(ctx._op),
    },
    args: [this.visit(ctx.expr(0)), this.visit(ctx.expr(1))],
  });

  visitTuple = (ctx: TupleContext): Expr => {
    // TODO this should be in the AST
    const args = ctx.expr_list().map((e) => this.visit(e));
    const count = args.length;

    return {
      type: "application",
      caller: {
        type: "identifier",
        name: `Tuple${count}`,
        namespace: "Tuple",
        range: rangeOfCtx(ctx),
      },
      args,
      range: rangeOfCtx(ctx),
    };
  };

  visitStructLit = (ctx: StructLitContext): Expr => {
    let spread: Expr | undefined = undefined;
    if (ctx._spread) {
      spread = this.visit(ctx._spread);
    }

    return {
      type: "struct-literal",
      range: rangeOfCtx(ctx),
      struct: {
        name: ctx.TYPE_ID().getText(),
        range: rangeOfTerminalNode(ctx.TYPE_ID()),
      },
      spread,
      fields:
        ctx
          .structFields()
          ?.structField_list()
          .map((v) => ({
            field: {
              name: v.ID().getText(),
              range: rangeOfTerminalNode(v.ID()),
            },
            range: rangeOfCtx(v),
            value: this.visit(v.expr()),
          })) ?? [],
    };
  };

  visitListLit = (ctx: ListLitContext): Expr => ({
    type: "list-literal",
    range: rangeOfCtx(ctx),
    values: ctx.expr_list().map((e) => this.visit(e)),
  });

  visitPipe = (ctx: PipeContext): Expr => ({
    type: "pipe",
    range: rangeOfCtx(ctx),
    left: this.visit(ctx.expr(0)),
    right: this.visit(ctx.expr(1)),
  });
}

type DeclarationType =
  | { type: "value"; decl: Declaration }
  | { type: "type"; decl: TypeDeclaration }
  | { type: "syntax-err" };

class ExposingVisitor extends Visitor<ExposedValue> {
  visitValueExposing = (ctx: ValueExposingContext): ExposedValue => ({
    type: "value",
    name: normalizeInfix(ctx._name.text),
    range: rangeOfCtx(ctx),
  });

  visitTypeExposing = (ctx: TypeExposingContext): ExposedValue => ({
    type: "type",
    exposeImpl: ctx.EXPOSING_NESTED() != null,
    name: ctx._name.text,
    range: rangeOfCtx(ctx),
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
    const value: Expr = new ExpressionVisitor().visit(e);

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
                range: typeHint.range,
                where: ctx._typeHint.traitImplClause_list().map((t) => ({
                  typeVar: t.ID().getText(),
                  traits: t.TYPE_ID_list().map((t) => t.getText()),
                })),
              },
            }),
        binding: {
          name: binding.getText(),
          range: rangeOfTerminalNode(binding),
        },
        range: rangeOfCtx(ctx),
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
          range: typeHint.range,
          where: ctx._typeHint.traitImplClause_list().map((t) => ({
            typeVar: t.ID().getText(),
            traits: t.TYPE_ID_list().map((t) => t.getText()),
          })),
        },
        binding: {
          name: normalizeInfix(ctx._binding.text),
          range: rangeOfTk(ctx._binding),
        },
        ...(docs === "" ? {} : { docComment: docs }),
        range: rangeOfCtx(ctx),
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
              range: rangeOfCtx(v),
              args: v.type__list().map((t) => new TypeVisitor().visit(t)),
            })) ?? [],
        params:
          ctx
            .paramsList()
            ?.ID_list()
            .map((i) => ({
              name: i.getText(),
              range: rangeOfTerminalNode(i),
            })) ?? [],
        ...(docs === "" ? {} : { docComment: docs }),
        range: rangeOfCtx(ctx),
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
              range: rangeOfCtx(v),
              // args: v.type__list().map((t) => new TypeVisitor().visit(t)),
              type_: new TypeVisitor().visit(v.type_()),
            })) ?? [],

        params:
          ctx
            .paramsList()
            ?.ID_list()
            .map((i) => ({
              name: i.getText(),
              range: rangeOfTerminalNode(i),
            })) ?? [],
        pub:
          ctx._pub === undefined
            ? false
            : ctx._pub.EXPOSING_NESTED() == null
              ? true
              : "..",
        name: ctx._name.text,
        ...(docs === "" ? {} : { docComment: docs }),
        range: rangeOfCtx(ctx),
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
              range: rangeOfTerminalNode(i),
            })) ?? [],
        ...(docs === "" ? {} : { docComment: docs }),
        range: rangeOfCtx(ctx),
      },
    };
  };
}

export class AntlrLexerError {
  constructor(
    public readonly position: Position,
    public readonly description: string,
  ) {}
}

export class AntlrParsingError {
  constructor(
    public readonly range: Range,
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
    this.errors.push(new AntlrLexerError({ line, character: column }, msg));
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
    this.errors.push(new AntlrParsingError(rangeOfTk(offendingSymbol), msg));
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

  const tkStream = new antlr4.CommonTokenStream(lexer);
  const parser = new Parser(tkStream);

  tkStream.fill();

  const lineComments = tkStream.tokens
    .filter((tk) => tk.channel === COMMENTS_CHANNEL)
    .map(
      (tk): LineComment => ({
        comment: tk.text,
        range: rangeOfTk(tk),
      }),
    );

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
    lineComments,
    ...(docs === "" ? {} : { moduleDoc: docs }),
    imports: declCtx.import__list().map((i): Import => {
      return {
        ns: i.moduleNamespace().getText(),
        exposing: i
          .importExposing_list()
          .map((e): ExposedValue => new ExposingVisitor().visit(e)),
        range: rangeOfCtx(i),
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

function positionOfTk(tk: Token): Position {
  return {
    line: tk.line - 1,
    character: tk.column,
  };
}

function rangeOfCtx(ctx: ParserRuleContext): Range {
  const start = positionOfTk(ctx.start);
  const end = positionOfTk(ctx.stop!);
  end.character += ctx.stop!.text.length;
  return { start, end };
}

function rangeOfTerminalNode(node: TerminalNode): Range {
  return rangeOfTk(node.symbol);
}

function rangeOfTk(tk: Token): Range {
  const start = positionOfTk(tk);

  const end: Position = {
    ...start,
    // we assume a token always spans one line
    character: start.character + tk.text.length,
  };
  return { start, end };
}
