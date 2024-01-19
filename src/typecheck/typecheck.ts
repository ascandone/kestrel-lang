import { ConstLiteral, Expr, Program, Statement } from "../ast";
import { Span, SpanMeta } from "../parser";
import { TVar, Type, unify, Context, generalize, instantiate } from "./unify";

export type UnifyErrorType = "type-mismatch" | "occurs-check";
export type TypeError<Meta> =
  | {
      type: "unbound-variable";
      ident: string;
      node: Expr<Meta>;
    }
  | {
      type: UnifyErrorType;
      node: Expr<Meta>;
      left: Type;
      right: Type;
    };

export type TypeMeta = { $: TVar };

export function typecheck<T extends SpanMeta>(
  ast: Program<T>,
  initialContext: Context = {},
): [Program<T & TypeMeta>, TypeError<T & TypeMeta>[]] {
  TVar.resetId();
  const errors: TypeError<T & TypeMeta & SpanMeta>[] = [];
  let context: Context = { ...initialContext };

  const typedStatements = ast.statements.map<Statement<T & TypeMeta>>(
    (decl) => {
      const annotated = annotateExpr(decl.value);
      errors.push(
        ...typecheckAnnotatedExpr(annotated, {
          ...context,
          [decl.binding.name]: annotated.$.asType(),
        }),
      );
      context[decl.binding.name] = generalize(annotated.$.asType(), context);
      return {
        ...decl,
        binding: { ...decl.binding, $: annotated.$ },
        value: annotated,
        $: annotated.$,
      };
    },
  );

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

  return [{ statements: typedStatements }, mappedErrs];
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
  }
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
