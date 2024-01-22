export type ConstLiteral =
  | { type: "int"; value: number }
  | { type: "float"; value: number }
  | { type: "string"; value: string };

export type TypeHint =
  | { type: "any" }
  | { type: "var"; ident: string }
  | { type: "fn"; args: TypeHint[]; return: TypeHint }
  | {
      type: "named";
      name: string;
      args: TypeHint[];
    };

export type Expr<TypeMeta = {}> = (TypeMeta & SpanMeta) &
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
        params: Array<{ name: string } & TypeMeta & SpanMeta>;
        body: Expr<TypeMeta>;
      }
    | {
        type: "application";
        caller: Expr<TypeMeta>;
        args: Expr<TypeMeta>[];
      }
    | {
        type: "let";
        binding: { name: string } & TypeMeta & SpanMeta;
        value: Expr<TypeMeta>;
        body: Expr<TypeMeta>;
      }
    | {
        type: "if";
        condition: Expr<TypeMeta>;
        then: Expr<TypeMeta>;
        else: Expr<TypeMeta>;
      }
  );

export type Declaration<TypeMeta = {}> = TypeMeta & {
  typeHint?: TypeHint & SpanMeta;
  binding: { name: string } & TypeMeta & SpanMeta;
  value: Expr<TypeMeta>;
};

export type TypeVariant = never; // TODO
export type TypeDeclaration<Meta = {}> = {
  type: "adt";
  name: string;
  variants: TypeVariant[];
};

export type Program<Meta = {}> = {
  typeDeclarations: TypeDeclaration[];
  declarations: Declaration<Meta>[];
};

export type Span = [startIdx: number, endIdx: number];
export type SpanMeta = { span: Span };

function spanContains([start, end]: Span, offset: number) {
  return start <= offset && end >= offset;
}

function exprByOffset<T>(ast: Expr<T>, offset: number): T | undefined {
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

export function declByOffset<T>(
  program: Program<T>,
  offset: number,
): T | undefined {
  for (const st of program.declarations) {
    if (spanContains(st.binding.span, offset)) {
      return st.value;
    }
    const e = exprByOffset(st.value, offset);
    if (e !== undefined) {
      return e;
    }
  }

  return undefined;
}
