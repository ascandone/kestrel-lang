export type ConstLiteral =
  | { type: "int"; value: number }
  | { type: "float"; value: number }
  | { type: "string"; value: string };

export type TypeAst = SpanMeta &
  (
    | {
        type: "var";
        ident: string;
      }
    | {
        type: "fn";
        args: TypeAst[];
        return: TypeAst;
      }
    | {
        type: "named";
        name: string;
        args: TypeAst[];
      }
    // This should only be used for type annotations, not type declarations
    | { type: "any" }
  );

export type MatchExpr<TypeMeta = {}> = (TypeMeta & SpanMeta) &
  (
    | {
        type: "ident";
        ident: string;
      }
    | {
        type: "constructor";
        name: string;
        args: MatchExpr<TypeMeta>[];
      }
  );

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
    | {
        type: "match";
        expr: Expr<TypeMeta>;
        clauses: Array<[MatchExpr<TypeMeta>, Expr<TypeMeta>]>;
      }
  );

export type Declaration<TypeMeta = {}> = SpanMeta & {
  typeHint?: TypeAst & SpanMeta;
  binding: { name: string } & TypeMeta & SpanMeta;
  value: Expr<TypeMeta>;
};

export type TypeVariant = { name: string; args: TypeAst[] };
export type TypeDeclaration = SpanMeta & {
  name: string;
  params: Array<{ name: string } & SpanMeta>;
} & ({ type: "adt"; variants: TypeVariant[] } | { type: "extern" });

export type Program<TypeMeta = {}> = {
  typeDeclarations: TypeDeclaration[];
  declarations: Declaration<TypeMeta>[];
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

    case "match":
      for (const [binding, expr] of ast.clauses) {
        const t =
          matchExprByOffset(binding, offset) ?? exprByOffset(expr, offset);
        if (t !== undefined) {
          return t;
        }
      }

      return exprByOffset(ast.expr, offset) ?? ast;
  }
}

function matchExprByOffset<T>(
  ast: MatchExpr<T>,
  offset: number,
): T | undefined {
  if (!spanContains(ast.span, offset)) {
    return;
  }

  switch (ast.type) {
    case "ident":
      return ast;

    case "constructor":
      for (const arg of ast.args) {
        const t = matchExprByOffset(arg, offset);
        if (t !== undefined) {
          return t;
        }
      }
      return ast;
  }
}

export function declByOffset<T>(
  program: Program<T>,
  offset: number,
): T | undefined {
  for (const st of program.declarations) {
    if (!spanContains(st.span, offset)) {
      continue;
    }

    if (spanContains(st.binding.span, offset)) {
      return st.binding;
    }

    return exprByOffset(st.value, offset);
  }

  return undefined;
}
