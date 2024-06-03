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

const makeInfixOp = <Ctx extends InfixExprContext>(ctx: Ctx): UntypedExpr => ({
  type: "infix",
  left: new ExpressionVisitor().visit(ctx.expr(0)),
  right: new ExpressionVisitor().visit(ctx.expr(1)),
  operator: ctx._op.text,
  span: [ctx.start.start, ctx.stop!.stop + 1],
});

class TypeVisitor extends Visitor<TypeAst> {
  visitNamedType = (ctx: NamedTypeContext): TypeAst => ({
    type: "named",
    args: ctx.type__list().map((t) => this.visit(t)),
    name: ctx._name.text,
    span: [ctx.start.start, ctx.stop!.stop + 1],
  });

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
    name: ctx.TYPE_ID().getText(),
    namespace: undefined,
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
    pattern: {
      type: "identifier",
      name: ctx._binding.text,
      span: [ctx._binding.start, ctx._binding.stop + 1],
    },
    value: this.visit(ctx._value),
    body: this.visit(ctx._body),
  });

  visitBlockContentLetHashExpr = (
    ctx: BlockContentLetHashExprContext,
  ): UntypedExpr => ({
    type: "let#",
    span: [ctx.start.start, ctx.stop!.stop + 1],
    pattern: {
      type: "identifier",
      name: ctx._binding.text,
      span: [ctx._binding.start, ctx._binding.stop + 1],
    },
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
    params: ctx.ID_list().map((idCtx) => ({
      type: "identifier",
      name: idCtx.getText(),
      span: [idCtx.symbol.start, idCtx.symbol.stop + 1],
    })),
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
  | { type: "type"; decl: UntypedTypeDeclaration };

class ExposingVisitor extends Visitor<UntypedExposedValue> {
  visitValueExposing = (ctx: ValueExposingContext): UntypedExposedValue => ({
    type: "value",
    name: ctx._name.text,
    span: [ctx.start.start, ctx.stop!.stop + 1],
  });

  visitTypeExposing = (ctx: TypeExposingContext): UntypedExposedValue => ({
    type: "type",
    exposeImpl: ctx.exposingNested() != null,
    name: ctx._name.text,
    span: [ctx.start.start, ctx.stop!.stop + 1],
  });
}

class DeclarationVisitor extends Visitor<DeclarationType> {
  visitLetDeclaration = (ctx: LetDeclarationContext): DeclarationType => {
    const binding = ctx.ID();

    const value = new ExpressionVisitor().visit(ctx.expr());

    const typeHint: TypeAst | undefined =
      ctx._typeHint === undefined
        ? undefined
        : // @ts-ignore
          ctx._typeHint.accept(new TypeVisitor())[0];

    return {
      type: "value",
      decl: {
        extern: false,
        inline: false,
        pub: ctx._pub !== undefined,
        ...(typeHint === undefined
          ? {}
          : {
              typeHint: {
                mono: typeHint,
                span: typeHint.span,
                where: [],
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
    ctx: ExternLetDeclarationContext,
  ): DeclarationType => {
    const binding = ctx.ID();

    const typeHint: TypeAst =
      // @ts-ignore
      ctx._typeHint.accept(new TypeVisitor())[0];

    return {
      type: "value",
      decl: {
        extern: true,
        pub: ctx._pub !== undefined,
        typeHint: {
          mono: typeHint,
          span: typeHint.span,
          where: [],
        },
        binding: {
          name: binding.getText(),
          span: [binding.symbol.start, binding.symbol.stop + 1],
        },
        span: [ctx.start.start, ctx.stop!.stop + 1],
      },
    };
  };

  visitTypeDeclaration = (ctx: TypeDeclarationContext): DeclarationType => ({
    type: "type",
    decl: {
      type: "adt",
      pub:
        ctx._pub === undefined
          ? false
          : ctx._pub.exposingNested()?.children == null
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
      span: [ctx.start.start, ctx.stop!.stop + 1],
    },
  });

  visitExternTypeDeclaration = (
    ctx: ExternTypeDeclarationContext,
  ): DeclarationType => ({
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
      span: [ctx.start.start, ctx.stop!.stop + 1],
    },
  });
}

class ParsingError {
  constructor(
    public readonly span: Span,
    public readonly description: string,
  ) {}
}

class KestrelErrorListener extends ErrorListener<antlr4.Token> {
  errors: ParsingError[] = [];

  syntaxError(
    _recognizer: antlr4.Recognizer<antlr4.Token>,
    offendingSymbol: antlr4.Token,
    _line: number,
    _column: number,
    msg: string,
  ): void {
    this.errors.push(
      new ParsingError([offendingSymbol.start, offendingSymbol.stop], msg),
    );

    throw new Error(msg);
  }
}

export function unsafeParse(input: string): UntypedModule {
  const chars = new antlr4.InputStream(input);

  const lexer = new Lexer(
    // @ts-ignore
    chars,
  );

  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new Parser(tokens);
  parser.addErrorListener(new KestrelErrorListener());

  const declCtx = parser.program();

  const declarations = declCtx
    .declaration_list()
    .map((d) => new DeclarationVisitor().visit(d));

  return {
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
}
