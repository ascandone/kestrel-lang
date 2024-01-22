import { ConstLiteral, Expr, Program, SpanMeta, TypeAst } from "../ast";
import { TypesPool, defaultTypesPool, prelude } from "./prelude";
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
export type TypeError<Meta = {}> =
  | {
      type: "unbound-variable";
      ident: string;
      node: Expr<Meta>;
    }
  | {
      type: "unbound-type";
      name: string;
      arity: number;
      node: SpanMeta;
    }
  | {
      type: "unbound-type-param";
      id: string;
      node: SpanMeta;
    }
  | {
      type: "invalid-catchall";
      node: SpanMeta;
    }
  | {
      type: "type-param-shadowing";
      id: string;
      node: SpanMeta;
    }
  | {
      type: UnifyErrorType;
      node: Expr<Meta>;
      left: Type;
      right: Type;
    };

export type TypeMeta = { $: TVar };

function unboundTypeError<T extends SpanMeta>(
  node: T,
  t: Type<Poly>,
  tCtx: TypesPool,
): TypeError<T> | undefined {
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
    node,
  };
}

function castType(
  ast: TypeAst,
  args: {
    errors: TypeError<SpanMeta>[];
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
        const e = unboundTypeError(ast, t, typesContext);
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
            node: ast,
          });
        }
        return { type: "quantified", id };
      }

      case "any":
        errors.push({ type: "invalid-catchall", node: ast });
        return { type: "var", var: TVar.fresh() };
    }
  }

  return recur(ast);
}

export function typecheck<T extends SpanMeta>(
  ast: Program<T>,
  initialContext: Context = prelude,
  typesContext: TypesPool = defaultTypesPool,
): [Program<T & TypeMeta>, TypeError<SpanMeta>[]] {
  TVar.resetId();
  const errors: TypeError<SpanMeta>[] = [];
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
          node: param,
        });
      }
      params.push(param.name);
    }

    const ret: Type<Poly> = {
      type: "named",
      name: typeDecl.name,
      args: params.map((id) => ({ type: "quantified", id })),
    };

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

  for (const decl of typedProgram.declarations) {
    let typeHint: Type<Poly> | undefined;
    if (decl.typeHint !== undefined) {
      typeHint = inferTypeHint(decl.typeHint);
      const err = unboundTypeError<SpanMeta>(
        decl.typeHint,
        decl.binding.$.asType(),
        typesContext,
      );
      if (err !== undefined) {
        errors.push(err);
      }
    }

    errors.push(
      ...typecheckAnnotatedExpr(decl.value, {
        ...context,
        [decl.binding.name]: decl.value.$.asType(),
      }),
    );

    errors.push(
      ...unifyYieldErr(
        decl.value,
        decl.binding.$.asType(),
        decl.value.$.asType(),
      ),
    );

    context[decl.binding.name] =
      typeHint ?? generalize(decl.value.$.asType(), context);
  }

  const mappedErrs: typeof errors = errors.map((e) => {
    if (e.type !== "type-mismatch") {
      return e;
    }

    if (
      e.left.type === "fn" &&
      e.right.type === "fn" &&
      e.left.args.length < e.right.args.length &&
      e.node.type === "application"
    ) {
      const [start] = e.node.args[e.left.args.length]!.span;
      const [, end] = e.node.args.at(-1)!.span;
      return { ...e, node: { ...e.node, span: [start, end] } };
    }

    return e;
  });

  return [typedProgram, mappedErrs];
}

function* typecheckAnnotatedExpr<T>(
  ast: Expr<T & TypeMeta>,
  context: Context,
): Generator<TypeError<T & TypeMeta>> {
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
          node: ast,
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
        // TODO annotate clauses
        clauses: [],
      };
    }
  }
}

function annotateProgram<T>(program: Program<T>): Program<T & TypeMeta> {
  return {
    ...program,
    declarations: program.declarations.map((decl) => ({
      ...decl,
      binding: { ...decl.binding, $: TVar.fresh() },
      value: annotateExpr(decl.value),
      $: TVar.fresh(),
    })),
  };
}

function* unifyYieldErr<T>(
  ast: Expr<T & TypeMeta>,
  t1: Type,
  t2: Type,
): Generator<TypeError<T & TypeMeta>> {
  const e = unify(t1, t2);
  if (e !== undefined) {
    yield { type: e.type, left: e.left, right: e.right, node: ast };
  }
}

function inferConstant(x: ConstLiteral): Type {
  switch (x.type) {
    case "int":
      return { type: "named", name: "Int", args: [] };

    case "float":
      return { type: "named", name: "Float", args: [] };

    case "string":
      throw new Error("TODO inferConst with type: " + x.type);
  }
}

function inferTypeHint(hint: TypeAst): Type<Poly> {
  switch (hint.type) {
    case "any":
      return {
        type: "var",
        var: TVar.fresh(),
      };

    case "var": {
      return { type: "quantified", id: hint.ident };
    }

    case "fn":
      return {
        type: "fn",
        args: hint.args.map(inferTypeHint),
        return: inferTypeHint(hint.return),
      };

    case "named":
      return {
        type: "named",
        name: hint.name,
        args: hint.args.map(inferTypeHint),
      };
  }
}
