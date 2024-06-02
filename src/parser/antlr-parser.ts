import antlr4 from "antlr4";
import Lexer from "./antlr/KestrelLexer";
import Parser, {
  AddSubContext,
  CharContext,
  DeclarationContext,
  FloatContext,
  IntContext,
  MulDivContext,
  StringContext,
} from "./antlr/KestrelParser";
import Visitor from "./antlr/KestrelVisitor";
import { UntypedDeclaration, UntypedExpr, UntypedModule } from "./ast";

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

  visitAddSub = (ctx: AddSubContext): UntypedExpr => ({
    type: "infix",
    left: new ExpressionVisitor().visit(ctx.expr(0)),
    right: new ExpressionVisitor().visit(ctx.expr(1)),
    operator: ctx._op.text,
    span: [ctx.start.start, ctx.stop!.stop + 1],
  });

  visitMulDiv = (ctx: MulDivContext): UntypedExpr => ({
    type: "infix",
    left: new ExpressionVisitor().visit(ctx.expr(0)),
    right: new ExpressionVisitor().visit(ctx.expr(1)),
    operator: ctx._op.text,
    span: [ctx.start.start, ctx.stop!.stop + 1],
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

export function unsafeParse(input: string): UntypedModule {
  const chars = new antlr4.InputStream(input);

  const lexer = new Lexer(
    // @ts-ignore
    chars,
  );

  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new Parser(tokens);

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
