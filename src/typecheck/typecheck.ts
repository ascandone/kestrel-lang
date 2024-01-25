import {
  Binding,
  ConstLiteral,
  Declaration,
  Expr,
  MatchExpr,
  Program,
  SpanMeta,
  TypeAst,
} from "../ast";
import { TypesPool, prelude } from "./prelude";
import {
  TVar,
  Type,
  unify,
  Context,
  generalize,
  instantiate,
  Poly,
} from "./unify";

export type UnifyErrorType = "type-mismatch" | "occurs-check";
export type TypeError = SpanMeta &
  (
    | {
        type: "unbound-variable";
        ident: string;
      }
    | {
        type: "unbound-type";
        name: string;
        arity: number;
      }
    | {
        type: "unbound-type-param";
        id: string;
      }
    | {
        type: "invalid-catchall";
      }
    | {
        type: "type-param-shadowing";
        id: string;
      }
    | {
        type: "arity-mismatch";
        expected: number;
        got: number;
      }
    | {
        type: UnifyErrorType;
        left: Type;
        right: Type;
      }
  );

export type TypeMeta = { $: TVar };

function checkUnboundTypeError<T extends SpanMeta>(
  { span }: T,
  t: Type<Poly>,
  tCtx: TypesPool,
): TypeError | undefined {
  if (t.type !== "named") {
    return undefined;
  }

  const arity = tCtx[t.name];
  const expectedArity = t.args.length;
  if (arity !== undefined && arity === expectedArity) {
    return undefined;
  }

  return {
    type: "unbound-type",
    name: t.name,
    arity: expectedArity,
    span,
  };
}

function castType(
  ast: TypeAst,
  args: {
    errors: TypeError[];
    typesContext: TypesPool;
    params: string[];
  },
): Type<Poly> {
  const { errors, typesContext, params } = args;

  function recur(ast: TypeAst): Type<Poly> {
    switch (ast.type) {
      case "named": {
        const t: Type<Poly> = {
          type: "named",
          name: ast.name,
          args: ast.args.map(recur),
        };
        const e = checkUnboundTypeError(ast, t, typesContext);
        if (e !== undefined) {
          errors.push(e);
        }
        return t;
      }

      case "fn":
        return {
          type: "fn",
          args: ast.args.map(recur),
          return: recur(ast.return),
        };

      case "var": {
        const id = ast.ident;
        if (!params.includes(id)) {
          errors.push({
            type: "unbound-type-param",
            id,
            span: ast.span,
          });
        }
        return { type: "quantified", id };
      }

      case "any":
        errors.push({ type: "invalid-catchall", span: ast.span });
        return { type: "var", var: TVar.fresh() };
    }
  }

  return recur(ast);
}

export function typecheck<T extends SpanMeta>(
  ast: Program<T>,
  initialContext: Context = prelude,
  typesContext: TypesPool = {},
): [Program<T & TypeMeta>, TypeError[]] {
  TVar.resetId();
  const errors: TypeError[] = [];
  let context: Context = { ...initialContext };

  const typedProgram = annotateProgram(ast);
  for (const typeDecl of typedProgram.typeDeclarations) {
    typesContext[typeDecl.name] = typeDecl.params.length;
    const params: string[] = [];

    for (const param of typeDecl.params) {
      if (params.includes(param.name)) {
        errors.push({
          type: "type-param-shadowing",
          id: param.name,
          span: param.span,
        });
      }
      params.push(param.name);
    }

    const ret: Type<Poly> = {
      type: "named",
      name: typeDecl.name,
      args: params.map((id) => ({ type: "quantified", id })),
    };

    if (typeDecl.type === "adt") {
      for (const variant of typeDecl.variants) {
        if (variant.args.length === 0) {
          context[variant.name] = ret;
        } else {
          context[variant.name] = {
            type: "fn",
            args: variant.args.map((arg) =>
              castType(arg, {
                errors,
                typesContext,
                params,
              }),
            ),
            return: ret,
          };
        }
      }
    }
  }

  for (const decl of typedProgram.declarations) {
    errors.push(...typecheckDecl(decl, typesContext, context));
  }

  return [typedProgram, errors];
}

function* typecheckAnnotatedExpr<T extends SpanMeta>(
  ast: Expr<T & TypeMeta>,
  context: Context,
): Generator<TypeError> {
  switch (ast.type) {
    case "constant": {
      const t = inferConstant(ast.value);
      yield* unifyYieldErr(ast, ast.$.asType(), t);
      return;
    }

    case "identifier": {
      const lookup = context[ast.name];
      if (lookup === undefined) {
        yield {
          type: "unbound-variable",
          ident: ast.name,
          span: ast.span,
        };
        return;
      }
      yield* unifyYieldErr(ast, ast.$.asType(), instantiate(lookup));
      return;
    }

    case "fn":
      yield* unifyYieldErr(ast, ast.$.asType(), {
        type: "fn",
        args: ast.params.map((p) => p.$.asType()),
        return: ast.body.$.asType(),
      });
      yield* typecheckAnnotatedExpr(ast.body, {
        ...context,
        ...Object.fromEntries(ast.params.map((p) => [p.name, p.$.asType()])),
      });
      return;

    case "application":
      yield* typecheckAnnotatedExpr(ast.caller, context);
      yield* unifyYieldErr(ast, ast.caller.$.asType(), {
        type: "fn",
        args: ast.args.map((arg) => arg.$.asType()),
        return: ast.$.asType(),
      });
      for (const arg of ast.args) {
        yield* typecheckAnnotatedExpr(arg, context);
      }
      return;

    case "let":
      yield* unifyYieldErr(ast, ast.binding.$.asType(), ast.value.$.asType());
      yield* unifyYieldErr(ast, ast.$.asType(), ast.body.$.asType());
      yield* typecheckAnnotatedExpr(ast.value, {
        ...context,
        [ast.binding.name]: ast.value.$.asType(),
      });
      yield* typecheckAnnotatedExpr(ast.body, {
        ...context,
        [ast.binding.name]: ast.value.$.asType(),
      });
      return;

    case "if":
      yield* unifyYieldErr(ast, ast.condition.$.asType(), {
        type: "named",
        name: "Bool",
        args: [],
      });
      yield* unifyYieldErr(ast, ast.$.asType(), ast.then.$.asType());
      yield* unifyYieldErr(ast, ast.$.asType(), ast.else.$.asType());
      yield* typecheckAnnotatedExpr(ast.condition, context);
      yield* typecheckAnnotatedExpr(ast.then, context);
      yield* typecheckAnnotatedExpr(ast.else, context);
      return;

    case "match":
      yield* typecheckAnnotatedExpr(ast.expr, context);
      for (const [binding, expr] of ast.clauses) {
        yield* unifyYieldErr(ast, binding.$.asType(), ast.expr.$.asType());
        const newContext = yield* typecheckBinding(binding, context);
        yield* unifyYieldErr(ast, ast.$.asType(), expr.$.asType());
        yield* typecheckAnnotatedExpr(expr, newContext);
      }
  }
}

function* typecheckBinding<T>(
  binding: MatchExpr<T & SpanMeta & TypeMeta>,
  context: Context,
): Generator<TypeError, Context> {
  switch (binding.type) {
    case "ident":
      return { ...context, [binding.ident]: binding.$.asType() };

    case "constructor": {
      const lookup_ = context[binding.name];
      if (lookup_ === undefined) {
        // TODO better err
        yield {
          type: "unbound-variable",
          ident: binding.name,
          span: binding.span,
        };
        return context;
      }

      const lookup = instantiate(lookup_);

      if (lookup.type === "named") {
        yield* unifyYieldErrGeneric(
          binding,
          { type: "named", name: lookup.name, args: lookup.args },
          binding.$.asType(),
        );
      }

      if (lookup.type === "fn") {
        yield* unifyYieldErrGeneric(
          binding,
          {
            type: "fn",
            args: lookup.args,
            return: binding.$.asType(),
          },
          lookup,
        );

        for (let i = 0; i < lookup.args.length; i++) {
          yield* unifyYieldErrGeneric(
            binding,
            binding.args[i]!.$.asType(),
            lookup.args[i]!,
          );

          const updatedContext = yield* typecheckBinding(
            binding.args[i]!,
            context,
          );

          context = { ...context, ...updatedContext };
        }

        if (lookup.args.length !== binding.args.length) {
          yield {
            type: "arity-mismatch",
            expected: lookup.args.length,
            got: binding.args.length,
            span: binding.span,
          };
          return context;
        }
      }

      return context;
    }
  }
}

function annotateMatchExpr<T>(ast: MatchExpr<T>): MatchExpr<T & TypeMeta> {
  switch (ast.type) {
    case "ident":
      return {
        ...ast,
        $: TVar.fresh(),
      };
    case "constructor":
      return {
        ...ast,
        args: ast.args.map(annotateMatchExpr),
        $: TVar.fresh(),
      };
  }
}

function annotateExpr<T>(ast: Expr<T>): Expr<T & TypeMeta> {
  switch (ast.type) {
    case "constant":
    case "identifier":
      return { ...ast, $: TVar.fresh() };

    case "fn":
      return {
        ...ast,
        $: TVar.fresh(),
        body: annotateExpr(ast.body),
        params: ast.params.map((p) => ({
          ...p,
          $: TVar.fresh(),
        })),
      };
    case "application":
      return {
        ...ast,
        $: TVar.fresh(),
        caller: annotateExpr(ast.caller),
        args: ast.args.map(annotateExpr),
      };

    case "if":
      return {
        ...ast,
        $: TVar.fresh(),
        condition: annotateExpr(ast.condition),
        then: annotateExpr(ast.then),
        else: annotateExpr(ast.else),
      };

    case "let":
      return {
        ...ast,
        $: TVar.fresh(),
        binding: { ...ast.binding, $: TVar.fresh() },
        value: annotateExpr(ast.value),
        body: annotateExpr(ast.body),
      };
    case "match": {
      return {
        ...ast,
        $: TVar.fresh(),
        expr: annotateExpr(ast.expr),
        clauses: ast.clauses.map(([binding, expr]) => [
          annotateMatchExpr(binding),
          annotateExpr(expr),
        ]),
      };
    }
  }
}

function annotateProgram<T>(program: Program<T>): Program<T & TypeMeta> {
  return {
    ...program,
    declarations: program.declarations.map((decl) => {
      const valueMeta = decl.extern
        ? ({
            extern: true,
            typeHint: decl.typeHint,
          } as const)
        : ({
            extern: false,
            typeHint: decl.typeHint,
            value: annotateExpr(decl.value),
          } as const);

      return {
        ...decl,
        ...valueMeta,
        binding: {
          ...decl.binding,
          $: TVar.fresh(),
        },
      };
    }),
  };
}

function* unifyYieldErr(ast: Expr, t1: Type, t2: Type): Generator<TypeError> {
  const e = unify(t1, t2);
  if (e === undefined) {
    return;
  }

  if (
    e.left.type === "fn" &&
    e.right.type === "fn" &&
    e.left.args.length !== e.right.args.length
  ) {
    if (ast.type === "application" && e.left.args.length < ast.args.length) {
      const [start] = ast.args[e.left.args.length]!.span;
      const [, end] = ast.args.at(-1)!.span;

      yield {
        type: "arity-mismatch",
        expected: e.left.args.length,
        got: e.right.args.length,
        span: [start, end],
      };
      return;
    }

    if (ast.type === "fn" && e.left.args.length < ast.params.length) {
      const [start] = ast.params[e.left.args.length]!.span;
      const [, end] = ast.params.at(-1)!.span;

      yield {
        type: "arity-mismatch",
        expected: e.left.args.length,
        got: e.right.args.length,
        span: [start, end],
      };

      return;
    }

    yield {
      type: "arity-mismatch",
      expected: e.left.args.length,
      got: e.right.args.length,
      span: ast.span,
    };
  }

  yield {
    type: e.type,
    left: e.left,
    right: e.right,
    span: ast.span,
  };
}

function* unifyYieldErrGeneric(
  ast: SpanMeta,
  t1: Type,
  t2: Type,
): Generator<TypeError> {
  const e = unify(t1, t2);
  if (e === undefined) {
    return;
  }
  yield {
    type: e.type,
    left: e.left,
    right: e.right,
    span: ast.span,
  };
}

function inferConstant(x: ConstLiteral): Type {
  switch (x.type) {
    case "int":
      return { type: "named", name: "Int", args: [] };

    case "float":
      return { type: "named", name: "Float", args: [] };

    case "string":
      return { type: "named", name: "String", args: [] };
  }
}

function* typecheckDecl(
  decl: Declaration<TypeMeta>,
  typesPool: TypesPool,
  /* mut */ context: Context,
): Generator<TypeError> {
  if (decl.extern) {
    throw new Error("[TODO] handle extern");
  }

  let typeHint: Type<Poly> | undefined;
  if (decl.typeHint !== undefined) {
    const th = yield* inferTypeHint(decl.typeHint, typesPool);
    // TODO this should be moved above
    // This way is not pointing to the right node
    const e = checkUnboundTypeError(decl.typeHint, th, typesPool);
    if (e !== undefined) {
      yield e;
    }

    yield* unifyYieldErrGeneric(
      decl.typeHint,
      instantiate(th),
      decl.binding.$.asType(),
    );

    const err = checkUnboundTypeError<SpanMeta>(
      decl.typeHint,
      decl.binding.$.asType(),
      typesPool,
    );
    if (err !== undefined) {
      yield err;
    }
  }

  yield* typecheckAnnotatedExpr(decl.value, {
    ...context,
    [decl.binding.name]: decl.value.$.asType(),
  });

  yield* unifyYieldErr(
    decl.value,
    decl.binding.$.asType(),
    decl.value.$.asType(),
  );

  context[decl.binding.name] =
    typeHint ?? generalize(decl.value.$.asType(), context);
}

function* inferTypeHint(
  hint: TypeAst,
  typesPool: TypesPool,
): Generator<TypeError, Type<Poly>> {
  switch (hint.type) {
    case "any":
      return {
        type: "var",
        var: TVar.fresh(),
      };

    case "var": {
      return { type: "quantified", id: hint.ident };
    }

    case "fn": {
      const args: Array<Type<Poly>> = [];
      for (const arg of hint.args) {
        args.push(yield* inferTypeHint(arg, typesPool));
      }

      return {
        type: "fn",
        args,
        return: yield* inferTypeHint(hint.return, typesPool),
      };
    }

    case "named":
      const args: Array<Type<Poly>> = [];
      for (const arg of hint.args) {
        args.push(yield* inferTypeHint(arg, typesPool));
      }

      return {
        type: "named",
        name: hint.name,
        args,
      };
  }
}
