import {
  ConstLiteral,
  Declaration,
  Expr,
  MatchPattern,
  SpanMeta,
  TypeAst,
  UntypedDeclaration,
  UntypedImport,
  UntypedModule,
  UntypedTypeDeclaration,
  UntypedTypeVariant,
} from "../ast";
import { defaultImports, topSortedModules } from "../project";
import {
  TypedDeclaration,
  TypedExposing,
  TypedImport,
  TypedModule,
  TypedTypeDeclaration,
} from "../typedAst";
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

// Record from namespace (e.g. "A.B.C" ) to the module

export type Deps = Record<string, TypedModule>;

export function typecheck(
  module: UntypedModule,
  deps: Deps = {},
  implicitImports: UntypedImport[] = defaultImports,
): [TypedModule, TypeError[]] {
  return new Typechecker(deps).run(module, implicitImports);
}

class Typechecker {
  // TODO remove globals and lookup import/declrs directly
  private globals: Context = {};

  private errors: TypeError[] = [];
  private imports: TypedImport[] = [];
  private typeDeclarations: TypedTypeDeclaration[] = [];

  constructor(private deps: Deps) {}

  run(
    module: UntypedModule,
    implicitImports: UntypedImport[] = defaultImports,
  ): [TypedModule, TypeError[]] {
    TVar.resetId();
    // ----- Collect imports into scope
    this.imports = [
      ...this.annotateImports(implicitImports),
      ...this.annotateImports(module.imports),
    ];

    // TODo remove
    for (const import_ of [...implicitImports, ...module.imports]) {
      this.runImports(import_);
    }

    // ---- Typecheck this module

    for (const typeDeclaration of module.typeDeclarations) {
      // Warning: do not use Array.map, as we need to seed results asap
      const annotated = this.annotateTypeDeclaration(typeDeclaration);
      this.typeDeclarations.push(annotated);
    }

    const annotatedDeclrs = annotateDeclarations(module.declarations);

    for (const decl of annotatedDeclrs) {
      this.typecheckAnnotatedDecl(decl);
    }

    return [
      {
        imports: this.imports,
        declarations: annotatedDeclrs,
        typeDeclarations: this.typeDeclarations,
      },
      this.errors,
    ];
  }

  private annotateImports(imports: UntypedImport[]): TypedImport[] {
    return imports.flatMap((import_) => {
      const importedModule = this.deps[import_.ns];
      if (importedModule === undefined) {
        // TODO proper error
        // throw new Error("TODO handle unbound import: " + import_.ns);
        return [];
      }

      return [this.annotateImport(import_, importedModule)];
    });
  }

  private annotateImport(
    import_: UntypedImport,
    importedModule: TypedModule,
  ): TypedImport {
    return {
      ...import_,
      exposing: import_.exposing.map((exposing) => {
        switch (exposing.type) {
          case "type": {
            const resolved = importedModule.typeDeclarations.find(
              (decl) => decl.name === exposing.name,
            );

            if (resolved === undefined) {
              // TODO proper error
              throw new Error("TODO handle unbound import type");
            }

            return {
              ...exposing,
              resolved,
            } as TypedExposing;
          }

          case "value": {
            const decl = importedModule.declarations.find(
              (decl) => decl.binding.name === exposing.name,
            );

            if (decl === undefined) {
              // TODO proper error
              throw new Error("TODO handle unbound import value");
            }

            return {
              ...exposing,
              poly: decl.binding.$.asType(),
            } as TypedExposing;
          }
        }
      }),
    };
  }

  private runImports(import_: UntypedImport) {
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

          if (typeDecl.type === "adt" && exposed.exposeImpl) {
            for (const variant of typeDecl.variants) {
              this.globals[variant.name] = variant.polyType;
            }
          }
          break;
        }
      }
    }
  }

  private makeVariantType(
    typeDecl: UntypedTypeDeclaration & { type: "adt" },
    variant: UntypedTypeVariant,
  ): Type<Poly> {
    const ret: Type<Poly> = {
      type: "named",
      name: typeDecl.name,
      args: typeDecl.params.map((param) => ({
        type: "quantified",
        id: param.name,
      })),
    };

    const params = typeDecl.params.map((p) => p.name);

    if (variant.args.length === 0) {
      return ret;
    } else {
      return {
        type: "fn",
        args: variant.args.map((arg) =>
          this.typeAstToType(arg, {
            type: "constructor-arg",
            params,
            returning: ret,
          }),
        ),
        return: ret,
      };
    }
  }

  private unifyExpr(ast: Expr, t1: Type, t2: Type) {
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

        this.errors.push({
          type: "arity-mismatch",
          expected: e.left.args.length,
          got: e.right.args.length,
          span: [start, end],
        });
        return;
      }

      if (ast.type === "fn" && e.left.args.length < ast.params.length) {
        const [start] = ast.params[e.left.args.length]!.span;
        const [, end] = ast.params.at(-1)!.span;

        this.errors.push({
          type: "arity-mismatch",
          expected: e.left.args.length,
          got: e.right.args.length,
          span: [start, end],
        });

        return;
      }

      this.errors.push({
        type: "arity-mismatch",
        expected: e.left.args.length,
        got: e.right.args.length,
        span: ast.span,
      });
    }

    this.errors.push({
      type: e.type,
      left: e.left,
      right: e.right,
      span: ast.span,
    });
  }

  /**
   * Used to parse args of ADT constructors
   */
  private typeAstToType(ast: TypeAst, opts: TypeAstConversionType): Type<Poly> {
    switch (ast.type) {
      case "named": {
        const expectedArity = ast.args.length;
        const isSelfRec =
          opts.type === "constructor-arg" &&
          opts.returning.name === ast.name &&
          opts.returning.args.length === expectedArity;

        const resolved = this.resolveType(ast.name);
        if (
          !isSelfRec &&
          (resolved === undefined || resolved.arity !== expectedArity)
        ) {
          // TODO better error for wrong arity
          this.errors.push({
            type: "unbound-type",
            name: ast.name,
            arity: expectedArity,
            span: ast.span,
          });
        }

        return {
          type: "named",
          name: ast.name,
          args: ast.args.map((arg) => this.typeAstToType(arg, opts)),
        };
      }

      case "fn":
        return {
          type: "fn",
          args: ast.args.map((arg) => this.typeAstToType(arg, opts)),
          return: this.typeAstToType(ast.return, opts),
        };

      case "var":
        if (
          opts.type === "constructor-arg" &&
          !opts.params.includes(ast.ident)
        ) {
          this.errors.push({
            type: "unbound-type-param",
            id: ast.ident,
            span: ast.span,
          });
        }
        return { type: "quantified", id: ast.ident };

      case "any":
        if (opts.type === "constructor-arg") {
          this.errors.push({ type: "invalid-catchall", span: ast.span });
        }
        return { type: "var", var: TVar.fresh() };
    }
  }

  private typecheckAnnotatedDecl(decl: Declaration<TypeMeta>) {
    if (decl.typeHint !== undefined) {
      const th = this.typeAstToType(decl.typeHint, { type: "type-hint" });
      this.unifyNode(decl.typeHint, instantiate(th), decl.binding.$.asType());

      if (decl.extern) {
        this.globals[decl.binding.name] = th;
      }
    }

    if (decl.extern) {
      return;
    }

    this.typecheckAnnotatedExpr(decl.value, {
      ...this.globals,
      [decl.binding.name]: decl.value.$.asType(),
    });

    this.unifyExpr(decl.value, decl.binding.$.asType(), decl.value.$.asType());

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
      const decl = this.deps[ns]?.declarations
        .find((decl) => decl.binding.name === name)
        ?.binding.$.asType();

      if (decl !== undefined) {
        return generalize(decl);
      }

      for (const tDecl of this.deps[ns]?.typeDeclarations ?? []) {
        if (tDecl.type === "adt") {
          for (const variant of tDecl.variants) {
            if (variant.name === name) {
              return variant.polyType;
            }
          }
        }
      }
    } else {
      for (const import_ of this.imports) {
        for (const exposing of import_.exposing) {
          switch (exposing.type) {
            case "type": {
              // TODO error when using (..) on extern types
              if (exposing.exposeImpl && exposing.resolved.type === "adt") {
                for (const variant of exposing.resolved.variants) {
                  if (exposing.name === name) {
                    return variant.polyType;
                  }
                }
              }
              break;
            }

            case "value":
              if (exposing.name === name) {
                return exposing.poly;
              }
              break;
          }
        }
      }

      return scope[name];
    }
  }

  private typecheckPattern<T>(
    pattern: MatchPattern<T & SpanMeta & TypeMeta>,
    context: Context,
  ): Context {
    switch (pattern.type) {
      case "lit": {
        const t = inferConstant(pattern.literal);
        this.unifyNode(pattern, pattern.$.asType(), t);
        return context;
      }

      case "ident":
        return { ...context, [pattern.ident]: pattern.$.asType() };

      case "constructor": {
        const lookup_ = context[pattern.name];
        if (lookup_ === undefined) {
          // TODO better err
          this.errors.push({
            type: "unbound-variable",
            ident: pattern.name,
            span: pattern.span,
          });
          return context;
        }

        const lookup = instantiate(lookup_);

        if (lookup.type === "named") {
          this.unifyNode(
            pattern,
            { type: "named", name: lookup.name, args: lookup.args },
            pattern.$.asType(),
          );
        }

        if (lookup.type === "fn") {
          this.unifyNode(
            pattern,
            {
              type: "fn",
              args: lookup.args,
              return: pattern.$.asType(),
            },
            lookup,
          );

          for (let i = 0; i < lookup.args.length; i++) {
            this.unifyNode(
              pattern,
              pattern.args[i]!.$.asType(),
              lookup.args[i]!,
            );

            const updatedContext = this.typecheckPattern(
              pattern.args[i]!,
              context,
            );

            context = { ...context, ...updatedContext };
          }

          if (lookup.args.length !== pattern.args.length) {
            this.errors.push({
              type: "arity-mismatch",
              expected: lookup.args.length,
              got: pattern.args.length,
              span: pattern.span,
            });
            return context;
          }
        }

        return context;
      }
    }
  }

  private typecheckAnnotatedExpr<T extends SpanMeta>(
    ast: Expr<T & TypeMeta>,
    scope: Context,
  ) {
    switch (ast.type) {
      case "constant": {
        const t = inferConstant(ast.value);
        this.unifyExpr(ast, ast.$.asType(), t);
        return;
      }

      case "identifier": {
        const lookup = this.lookupIdent(ast.namespace, ast.name, scope);
        if (lookup === undefined) {
          this.errors.push({
            type: "unbound-variable",
            ident: ast.name,
            span: ast.span,
          });
          return;
        }
        this.unifyExpr(ast, ast.$.asType(), instantiate(lookup));
        return;
      }

      case "fn":
        this.unifyExpr(ast, ast.$.asType(), {
          type: "fn",
          args: ast.params.map((p) => p.$.asType()),
          return: ast.body.$.asType(),
        });

        this.typecheckAnnotatedExpr(ast.body, {
          ...scope,
          ...Object.fromEntries(ast.params.map((p) => [p.name, p.$.asType()])),
        });
        return;

      case "application":
        this.typecheckAnnotatedExpr(ast.caller, scope);
        this.unifyExpr(ast, ast.caller.$.asType(), {
          type: "fn",
          args: ast.args.map((arg) => arg.$.asType()),
          return: ast.$.asType(),
        });
        for (const arg of ast.args) {
          this.typecheckAnnotatedExpr(arg, scope);
        }
        return;

      case "let":
        this.unifyExpr(ast, ast.binding.$.asType(), ast.value.$.asType());
        this.unifyExpr(ast, ast.$.asType(), ast.body.$.asType());
        this.typecheckAnnotatedExpr(ast.value, {
          ...scope,
          [ast.binding.name]: ast.value.$.asType(),
        });
        this.typecheckAnnotatedExpr(ast.body, {
          ...scope,
          [ast.binding.name]: ast.value.$.asType(),
        });
        return;

      case "if":
        this.unifyExpr(ast, ast.condition.$.asType(), {
          type: "named",
          name: "Bool",
          args: [],
        });
        this.unifyExpr(ast, ast.$.asType(), ast.then.$.asType());
        this.unifyExpr(ast, ast.$.asType(), ast.else.$.asType());
        this.typecheckAnnotatedExpr(ast.condition, scope);
        this.typecheckAnnotatedExpr(ast.then, scope);
        this.typecheckAnnotatedExpr(ast.else, scope);
        return;

      case "match":
        this.typecheckAnnotatedExpr(ast.expr, scope);
        for (const [pattern, expr] of ast.clauses) {
          this.unifyExpr(ast, pattern.$.asType(), ast.expr.$.asType());
          const newContext = this.typecheckPattern(pattern, scope);
          this.unifyExpr(ast, ast.$.asType(), expr.$.asType());
          this.typecheckAnnotatedExpr(expr, newContext);
        }
    }
  }

  private unifyNode(ast: SpanMeta, t1: Type, t2: Type) {
    const e = unify(t1, t2);
    if (e === undefined) {
      return;
    }
    this.errors.push({
      type: e.type,
      left: e.left,
      right: e.right,
      span: ast.span,
    });
  }

  private annotateTypeDeclaration(
    typeDecl: UntypedTypeDeclaration,
  ): TypedTypeDeclaration {
    const usedParams = new Set();
    for (const param of typeDecl.params) {
      if (usedParams.has(param.name)) {
        this.errors.push({
          type: "type-param-shadowing",
          id: param.name,
          span: param.span,
        });
      }
      usedParams.add(param.name);
    }

    switch (typeDecl.type) {
      case "extern": {
        return typeDecl;
      }
      case "adt": {
        return {
          ...typeDecl,
          variants: typeDecl.variants.map((variant) => {
            const t = this.makeVariantType(typeDecl, variant);
            this.globals[variant.name] = t;
            return {
              ...variant,
              polyType: t,
            };
          }),
        } as TypedTypeDeclaration;
      }
    }
  }

  // TODO handle ns
  private resolveType(typeName: string): TypeResolutionData | undefined {
    for (const typeDecl of this.typeDeclarations) {
      if (typeDecl.name === typeName) {
        return { arity: typeDecl.params.length };
      }
    }
    for (const import_ of this.imports) {
      for (const exposed of import_.exposing) {
        if (exposed.type === "type" && exposed.resolved.name === typeName) {
          return { arity: exposed.resolved.params.length };
        }
      }
    }
    return undefined;
  }
}

type TypeResolutionData = {
  arity: number;
};

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

function annotateDeclarations(
  declrs: UntypedDeclaration[],
): TypedDeclaration[] {
  return declrs.map<TypedDeclaration>((decl) => {
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
  });
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

type TypeAstConversionType =
  | { type: "type-hint" }
  | {
      type: "constructor-arg";
      params: string[];
      returning: Type<Poly> & { type: "named" };
    };

export function typecheckProject(
  project: Record<string, UntypedModule>,
  implicitImports: UntypedImport[] = defaultImports,
): ProjectTypeCheckResult {
  const sortedModules = topSortedModules(project, implicitImports);

  const projectResult: ProjectTypeCheckResult = {};
  const deps: Deps = {};
  for (const ns of sortedModules) {
    const module = project[ns]!;
    const tc = typecheck(module, deps, implicitImports);
    projectResult[ns] = tc;
    deps[ns] = tc[0];
  }

  return projectResult;
}

export type ProjectTypeCheckResult = Record<string, [TypedModule, TypeError[]]>;
