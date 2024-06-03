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
  ConsContext,
  DeclarationContext,
  ExprContext,
  FloatContext,
  FnContext,
  IdContext,
  IfContext,
  IntContext,
  ListLitContext,
  ParensContext,
  StringContext,
  TupleContext,
} from "./antlr/KestrelParser";
import Visitor from "./antlr/KestrelVisitor";
import { Span, UntypedDeclaration, UntypedExpr, UntypedModule } from "./ast";

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
    namespace: undefined,
    name: ctx.getText(),
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
      name: ctx._mapper.text,
      span: [ctx._mapper.start, ctx._mapper.stop + 1],
      namespace: undefined,
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
}

class DeclarationVisitor extends Visitor<UntypedDeclaration> {
  visitDeclaration = (ctx: DeclarationContext): UntypedDeclaration => {
    const binding = ctx.ID();

    const value = new ExpressionVisitor().visit(ctx.expr());

    return {
      extern: false,
      inline: false,
      pub: false,
      binding: {
        name: binding.getText(),
        span: [binding.symbol.start, binding.symbol.stop + 1],
      },
      span: [ctx.start.start, ctx.stop!.stop + 1],
      value,
    };
  };
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
    .map((d) => d.accept(new DeclarationVisitor()));

  return {
    declarations,
    imports: [],
    typeDeclarations: [],
  };
}
