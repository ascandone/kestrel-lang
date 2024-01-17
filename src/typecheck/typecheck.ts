import { ConstLiteral, Expr, Program, Statement } from "../ast";
import { TVar, Type, unify, Context } from "./unify";

export type UnifyErrorType = "type-mismatch" | "occurs-check";
export type TypeError<Node> =
  | {
      type: "unbound-variable";
      ident: string;
      node: Node;
    }
  | {
      type: UnifyErrorType;
      node: Node;
      left: Type;
      right: Type;
    };

export type TypeMeta = { $: TVar };

export function typecheck<T = {}>(
  ast: Program<T>,
  initialContext: Context = {},
): [Program<T & TypeMeta>, TypeError<Expr<T & TypeMeta>>[]] {
  TVar.resetId();
  const errors: TypeError<Expr<T & TypeMeta>>[] = [];
  let context: Context = { ...initialContext };

  const typedStatements = ast.statements.map<Statement<T & TypeMeta>>(
    (decl) => {
      const annotated = annotateExpr(decl.value);
      errors.push(...typecheckAnnotatedExpr(annotated, context));
      context[decl.binding.name] = annotated.$.asType();
      return {
        ...decl,
        binding: { ...decl.binding, $: annotated.$ },
        value: annotated,
        $: annotated.$,
      };
    },
  );

  return [{ statements: typedStatements }, errors];
}

function* typecheckAnnotatedExpr<T>(
  ast: Expr<T & TypeMeta>,
  context: Context,
): Generator<TypeError<Expr<T & TypeMeta>>> {
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

      yield* unifyYieldErr(ast, ast.$.asType(), lookup);
      return;
    }

    case "fn":
      // TODO handle params
      yield* unifyYieldErr(ast, ast.$.asType(), {
        type: "fn",
        args: [],
        return: ast.body.$.asType(),
      });
      yield* typecheckAnnotatedExpr(ast.body, context);
      return;

    case "application":
      yield* unifyYieldErr(ast, ast.caller.$.asType(), {
        type: "fn",
        args: ast.args.map((arg) => arg.$.asType()),
        return: ast.$.asType(),
      });
      // TODO typecheck args
      yield* typecheckAnnotatedExpr(ast.caller, context);

      return;

    case "let":
    case "if":
      throw new Error("TODO typecheckExpr with type: " + ast.type);
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
    case "let":
    case "if":
      throw new Error("TODO annotateExpr of: " + ast.type);
  }
}

function* unifyYieldErr<T>(
  ast: Expr<T & TypeMeta>,
  t1: Type,
  t2: Type,
): Generator<TypeError<Expr<T & TypeMeta>>> {
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
