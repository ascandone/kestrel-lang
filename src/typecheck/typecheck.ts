import {
  ConstLiteral,
  Declaration,
  Expr,
  MatchPattern,
  Program,
  SpanMeta,
  TypeAst,
  Import,
  TypeVariant,
  TypeDeclaration,
} from "../ast";
import { defaultImports, topSortedModules } from "../project";
import {
  TVar,
  Type,
  unify,
  Context,
  generalize,
  instantiate,
  Poly,
} from "./unify";

export type TypesPool = Record<string, number>;

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

function* castType(
  ast: TypeAst,
  args: {
    typesScope: TypesPool;
    params: string[];
  },
): Generator<TypeError, Type<Poly>> {
  const { params, typesScope } = args;

  function* recur(ast: TypeAst): Generator<TypeError, Type<Poly>> {
    switch (ast.type) {
      case "named": {
        const args: Array<Type<Poly>> = [];
        for (const arg of ast.args) {
          args.push(yield* recur(arg));
        }

        const t: Type<Poly> = {
          type: "named",
          name: ast.name,
          args,
        };

        const e = checkUnboundTypeError(ast, t, typesScope);
        if (e !== undefined) {
          yield e;
        }
        return t;
      }

      case "fn": {
        const args: Array<Type<Poly>> = [];
        for (const arg of ast.args) {
          args.push(yield* recur(arg));
        }
        return {
          type: "fn",
          args,
          return: yield* recur(ast.return),
        };
      }

      case "var": {
        const id = ast.ident;
        if (!params.includes(id)) {
          yield {
            type: "unbound-type-param",
            id,
            span: ast.span,
          };
        }
        return { type: "quantified", id };
      }

      case "any":
        yield { type: "invalid-catchall", span: ast.span };
        return { type: "var", var: TVar.fresh() };
    }
  }

  return yield* recur(ast);
}

// Record from namespace (e.g. "A.B.C" ) to the module

export type Deps = Record<string, Program<TypeMeta>>;

export function typecheck<T>(
  ast: Program<T>,
  deps: Deps = {},
  implicitImports: Import[] = defaultImports,
): [Program<T & TypeMeta>, TypeError[]] {
  return new Typechecker(deps).run(ast, implicitImports);
}

class Typechecker {
  private globals: Context = {};
  private types: TypesPool = {};

  constructor(private deps: Deps) {}

  run<T>(
    program: Program<T>,
    implicitImports: Import[] = defaultImports,
  ): [Program<T & TypeMeta>, TypeError[]] {
    TVar.resetId();
    // ----- Collect imports into scope
    const imports = [...implicitImports, ...program.imports];
    for (const import_ of imports) {
      this.runImports(import_);
    }

    // ---- Typecheck this module
    const typedProgram = annotateProgram(program);

    const errors: TypeError[] = [];
    for (const typeDecl of typedProgram.typeDeclarations) {
      errors.push(...this.typecheckTypeDeclarations(typeDecl));
    }
    for (const decl of typedProgram.declarations) {
      errors.push(...this.typecheckAnnotatedDecl(decl));
    }
    return [typedProgram, errors];
  }

  private runImports(import_: Import) {
    const dep = this.deps[import_.ns];

    if (dep === undefined) {
      // TODO emit err
      return;
    }

    for (const exposed of import_.exposing) {
      switch (exposed.type) {
        case "value": {
          const lookup = dep.declarations.find(
            (dec) => dec.binding.name === exposed.name,
          );

          if (lookup === undefined) {
            // TODO emit err
            continue;
          }

          this.globals[exposed.name] = lookup.binding.$.asType();
          break;
        }

        case "type": {
          const typeDecl = dep.typeDeclarations.find(
            (t) => t.name === exposed.name,
          );

          if (typeDecl === undefined) {
            // TODO emit err
            continue;
          }

          this.types[typeDecl.name] = typeDecl.params.length;
          if (typeDecl.type === "adt" && exposed.exposeImpl) {
            for (const variant of typeDecl.variants) {
              // ignoring errs
              [...this.addVariantTypesToScope(typeDecl, variant)];
            }
          }
          break;
        }
      }
    }
  }

  private *typecheckTypeDeclarations(
    typeDecl: TypeDeclaration,
  ): Generator<TypeError> {
    this.types[typeDecl.name] = typeDecl.params.length;
    const params: string[] = [];
    for (const param of typeDecl.params) {
      if (params.includes(param.name)) {
        yield {
          type: "type-param-shadowing",
          id: param.name,
          span: param.span,
        };
      }
      params.push(param.name);
    }

    if (typeDecl.type === "adt") {
      for (const variant of typeDecl.variants) {
        yield* this.addVariantTypesToScope(typeDecl, variant);
      }
    }
  }

  private *addVariantTypesToScope(
    typeDecl: TypeDeclaration & { type: "adt" },
    variant: TypeVariant,
  ): Generator<TypeError> {
    const ret: Type<Poly> = {
      type: "named",
      name: typeDecl.name,
      args: typeDecl.params.map((param) => ({
        type: "quantified",
        id: param.name,
      })),
    };

    if (variant.args.length === 0) {
      this.globals[variant.name] = ret;
    } else {
      const args: Type<Poly>[] = [];
      for (const arg of variant.args) {
        const a = yield* castType(arg, {
          typesScope: this.types,
          params: typeDecl.params.map((p) => p.name),
        });
        args.push(a);
      }

      this.globals[variant.name] = {
        type: "fn",
        args,
        return: ret,
      };
    }
  }

  private *typecheckAnnotatedDecl(
    decl: Declaration<TypeMeta>,
  ): Generator<TypeError> {
    if (decl.typeHint !== undefined) {
      const th = yield* inferTypeHint(decl.typeHint, this.types);
      // TODO this should be moved above
      // This way is not pointing to the right node
      const e = checkUnboundTypeError(decl.typeHint, th, this.types);
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
        this.types,
      );
      if (err !== undefined) {
        yield err;
      }

      if (decl.extern) {
        this.globals[decl.binding.name] = th;
      }
    }

    if (decl.extern) {
      return;
    }

    yield* this.typecheckAnnotatedExpr(decl.value, {
      ...this.globals,
      [decl.binding.name]: decl.value.$.asType(),
    });

    yield* unifyYieldErr(
      decl.value,
      decl.binding.$.asType(),
      decl.value.$.asType(),
    );

    this.globals[decl.binding.name] = generalize(
      decl.value.$.asType(),
      this.globals,
    );
  }

  private lookupIdent(
    ns: string | undefined,
    name: string,
    scope: Context,
  ): Type<Poly> | undefined {
    if (ns !== undefined) {
      return this.deps[ns]?.declarations
        .find((decl) => decl.binding.name === name)
        ?.binding.$.asType();
    }

    return scope[name];
  }

  private *typecheckAnnotatedExpr<T extends SpanMeta>(
    ast: Expr<T & TypeMeta>,
    scope: Context,
  ): Generator<TypeError> {
    switch (ast.type) {
      case "constant": {
        const t = inferConstant(ast.value);
        yield* unifyYieldErr(ast, ast.$.asType(), t);
        return;
      }

      case "identifier": {
        const lookup = this.lookupIdent(ast.namespace, ast.name, scope);
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
        yield* this.typecheckAnnotatedExpr(ast.body, {
          ...scope,
          ...Object.fromEntries(ast.params.map((p) => [p.name, p.$.asType()])),
        });
        return;

      case "application":
        yield* this.typecheckAnnotatedExpr(ast.caller, scope);
        yield* unifyYieldErr(ast, ast.caller.$.asType(), {
          type: "fn",
          args: ast.args.map((arg) => arg.$.asType()),
          return: ast.$.asType(),
        });
        for (const arg of ast.args) {
          yield* this.typecheckAnnotatedExpr(arg, scope);
        }
        return;

      case "let":
        yield* unifyYieldErr(ast, ast.binding.$.asType(), ast.value.$.asType());
        yield* unifyYieldErr(ast, ast.$.asType(), ast.body.$.asType());
        yield* this.typecheckAnnotatedExpr(ast.value, {
          ...scope,
          [ast.binding.name]: ast.value.$.asType(),
        });
        yield* this.typecheckAnnotatedExpr(ast.body, {
          ...scope,
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
        yield* this.typecheckAnnotatedExpr(ast.condition, scope);
        yield* this.typecheckAnnotatedExpr(ast.then, scope);
        yield* this.typecheckAnnotatedExpr(ast.else, scope);
        return;

      case "match":
        yield* this.typecheckAnnotatedExpr(ast.expr, scope);
        for (const [pattern, expr] of ast.clauses) {
          yield* unifyYieldErr(ast, pattern.$.asType(), ast.expr.$.asType());
          const newContext = yield* typecheckPattern(pattern, scope);
          yield* unifyYieldErr(ast, ast.$.asType(), expr.$.asType());
          yield* this.typecheckAnnotatedExpr(expr, newContext);
        }
    }
  }
}

function* typecheckPattern<T>(
  pattern: MatchPattern<T & SpanMeta & TypeMeta>,
  context: Context,
): Generator<TypeError, Context> {
  switch (pattern.type) {
    case "lit": {
      const t = inferConstant(pattern.literal);
      yield* unifyYieldErrGeneric(pattern, pattern.$.asType(), t);
      return context;
    }

    case "ident":
      return { ...context, [pattern.ident]: pattern.$.asType() };

    case "constructor": {
      const lookup_ = context[pattern.name];
      if (lookup_ === undefined) {
        // TODO better err
        yield {
          type: "unbound-variable",
          ident: pattern.name,
          span: pattern.span,
        };
        return context;
      }

      const lookup = instantiate(lookup_);

      if (lookup.type === "named") {
        yield* unifyYieldErrGeneric(
          pattern,
          { type: "named", name: lookup.name, args: lookup.args },
          pattern.$.asType(),
        );
      }

      if (lookup.type === "fn") {
        yield* unifyYieldErrGeneric(
          pattern,
          {
            type: "fn",
            args: lookup.args,
            return: pattern.$.asType(),
          },
          lookup,
        );

        for (let i = 0; i < lookup.args.length; i++) {
          yield* unifyYieldErrGeneric(
            pattern,
            pattern.args[i]!.$.asType(),
            lookup.args[i]!,
          );

          const updatedContext = yield* typecheckPattern(
            pattern.args[i]!,
            context,
          );

          context = { ...context, ...updatedContext };
        }

        if (lookup.args.length !== pattern.args.length) {
          yield {
            type: "arity-mismatch",
            expected: lookup.args.length,
            got: pattern.args.length,
            span: pattern.span,
          };
          return context;
        }
      }

      return context;
    }
  }
}

function annotateMatchExpr<T>(
  ast: MatchPattern<T>,
): MatchPattern<T & TypeMeta> {
  switch (ast.type) {
    case "lit":
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

    case "named": {
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
}

export function typecheckProject<T>(
  project: Record<string, Program<T>>,
  implicitImports: Import[] = defaultImports,
): ProjectTypeCheckResult<T> {
  const sortedPrograms = topSortedModules(project, implicitImports);

  const projectResult: ProjectTypeCheckResult<T> = {};
  const deps: Deps = {};
  for (const ns of sortedPrograms) {
    const program = project[ns]!;
    const tc = typecheck(program, deps, implicitImports);
    projectResult[ns] = tc;
    deps[ns] = tc[0];
  }

  return projectResult;
}

export type ProjectTypeCheckResult<T> = Record<
  string,
  [Program<T & TypeMeta>, TypeError[]]
>;
