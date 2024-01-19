export type ConstLiteral =
  | { type: "int"; value: number }
  | { type: "float"; value: number }
  | { type: "string"; value: string };

export type Expr<Meta = {}> = Meta &
  (
    | {
        type: "constant";
        value: ConstLiteral;
      }
    | {
        type: "identifier";
        name: string;
      }
    | {
        type: "fn";
        params: Array<{ name: string } & Meta>;
        body: Expr<Meta>;
      }
    | {
        type: "application";
        caller: Expr<Meta>;
        args: Expr<Meta>[];
      }
    | {
        type: "let";
        binding: { name: string } & Meta;
        value: Expr<Meta>;
        body: Expr<Meta>;
      }
    | {
        type: "if";
        condition: Expr<Meta>;
        then: Expr<Meta>;
        else: Expr<Meta>;
      }
  );

export type Statement<Meta = {}> = Meta & {
  type: "let";
  binding: { name: string } & Meta;
  value: Expr<Meta>;
};

export type Program<Meta = {}> = {
  statements: Statement<Meta>[];
};

export type Span = [startIdx: number, endIdx: number];
export type SpanMeta = { span: Span };

function spanContains([start, end]: Span, offset: number) {
  return start <= offset && end >= offset;
}

function exprByOffset<T extends SpanMeta>(
  ast: Expr<T>,
  offset: number,
): T | undefined {
  if (!spanContains(ast.span, offset)) {
    return;
  }

  switch (ast.type) {
    case "constant":
    case "identifier":
      return ast;
    case "application":
      for (const arg of ast.args) {
        const t = exprByOffset(arg, offset);
        if (t !== undefined) {
          return t;
        }
      }
      return exprByOffset(ast.caller, offset) ?? ast;

    case "let":
      if (spanContains(ast.binding.span, offset)) {
        return ast.binding;
      }
      return (
        exprByOffset(ast.value, offset) ?? exprByOffset(ast.body, offset) ?? ast
      );

    case "fn":
      for (const param of ast.params) {
        if (spanContains(param.span, offset)) {
          return param;
        }
      }
      return exprByOffset(ast.body, offset) ?? ast;

    case "if":
      return (
        exprByOffset(ast.condition, offset) ??
        exprByOffset(ast.then, offset) ??
        exprByOffset(ast.else, offset) ??
        ast
      );
  }
}

export function declByOffset<T extends SpanMeta>(
  program: Program<T>,
  offset: number,
): T | undefined {
  for (const st of program.statements) {
    if (spanContains(st.binding.span, offset)) {
      return st.binding;
    }
    const e = exprByOffset(st.value, offset);
    if (e !== undefined) {
      return e;
    }
  }

  return undefined;
}
