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
  const context: Context = { ...initialContext };

  const typedStatements = ast.statements.map<Statement<T & TypeMeta>>(
    (decl) => {
      const annotated = annotateExpr(decl.value);
      errors.push(...typecheckAnnotatedExpr(annotated, context));
      // TODO save bindings in context
      return {
        ...decl,
        binding: { ...decl.binding, $: annotated.$ },
        value: annotated,
        $: annotated.$,
      };
    },
  );

  return [{ statements: typedStatements }, []];
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
        throw new Error("TODO undefined lookup");
      }
      yield* unifyYieldErr(ast, ast.$.asType(), lookup);
      return;
    }

    case "fn":
    case "application":
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
    case "application":
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
