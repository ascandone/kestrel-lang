import {
  Binding,
  ConstLiteral,
  Expr,
  MatchPattern,
  Span,
  SpanMeta,
  TypeAst,
  UntypedDeclaration,
  UntypedImport,
  UntypedModule,
  UntypedTypeDeclaration,
  UntypedTypeVariant,
} from "../parser";
import {
  IdentifierResolution,
  TypedDeclaration,
  TypedExposing,
  TypedExpr,
  TypedImport,
  TypedMatchPattern,
  TypedModule,
  TypedTypeDeclaration,
  TypedTypeVariant,
} from "./typedAst";
import { CORE_MODULES, defaultImports } from "./defaultImports";
import { topSortedModules } from "./project";
import {
  TVar,
  Type,
  unify,
  generalize,
  instantiate,
  Poly,
  UnifyError,
} from "./unify";
import {
  ArityMismatch,
  BadImport,
  ErrorInfo,
  InvalidCatchall,
  NonExistingImport,
  OccursCheck,
  TypeMismatch,
  TypeParamShadowing,
  UnboundModule,
  UnboundType,
  UnboundTypeParam,
  UnboundVariable,
  UnimportedModule,
} from "../errors";

export type TypeMeta = { $: TVar };

// Record from namespace (e.g. "A.B.C" ) to the module

export type Deps = Record<string, TypedModule>;

export function typecheck(
  ns: string,
  module: UntypedModule,
  deps: Deps = {},
  implicitImports: UntypedImport[] = defaultImports,
): [TypedModule, ErrorInfo[]] {
  return new Typechecker(ns, deps).run(module, implicitImports);
}

type GlobalScope = Record<string, TypedDeclaration>;
type TypeVariants = Record<string, TypedTypeVariant>;

class Typechecker {
  // TODO remove globals and lookup import/declrs directly
  private variants: TypeVariants = {};
  private globalScope: GlobalScope = {};

  private errors: ErrorInfo[] = [];
  private imports: TypedImport[] = [];
  private typeDeclarations: TypedTypeDeclaration[] = [];

  constructor(
    private ns: string,
    private deps: Deps,
  ) {}

  run(
    module: UntypedModule,
    implicitImports: UntypedImport[] = defaultImports,
  ): [TypedModule, ErrorInfo[]] {
    TVar.resetId();

    this.imports = [
      ...this.annotateImports(implicitImports),
      ...this.annotateImports(module.imports),
    ];

    for (const typeDeclaration of module.typeDeclarations) {
      // Warning: do not use Array.map, as we need to seed results asap
      const annotated = this.annotateTypeDeclaration(typeDeclaration);
      this.typeDeclarations.push(annotated);
    }

    const annotatedDeclrs = this.annotateDeclarations(module.declarations);

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
        this.errors.push({
          span: import_.span,
          description: new UnboundModule(import_.ns),
        });
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

            if (resolved === undefined || !resolved.pub) {
              this.errors.push({
                span: exposing.span,
                description: new NonExistingImport(exposing.name),
              });
            } else if (resolved.type === "extern" && exposing.exposeImpl) {
              this.errors.push({
                span: exposing.span,
                description: new BadImport(),
              });
            } else if (
              resolved.type === "adt" &&
              exposing.exposeImpl &&
              resolved.pub !== ".."
            ) {
              this.errors.push({
                span: exposing.span,
                description: new BadImport(),
              });
            }

            return {
              ...exposing,
              resolved,
            } as TypedExposing;
          }

          case "value": {
            const declaration = importedModule.declarations.find(
              (decl) => decl.binding.name === exposing.name,
            );

            if (declaration === undefined || !declaration.pub) {
              this.errors.push({
                span: exposing.span,
                description: new NonExistingImport(exposing.name),
              });
            }

            return {
              ...exposing,
              declaration: declaration,
            } as TypedExposing;
          }
        }
      }),
    };
  }

  private makeVariantType(
    typeDecl: UntypedTypeDeclaration & { type: "adt" },
    variant: UntypedTypeVariant,
  ): Type<Poly> {
    const ret: Type<Poly> = {
      type: "named",
      moduleName: this.ns,
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
          span: [start, end],
          description: new ArityMismatch(
            e.left.args.length,
            e.right.args.length,
          ),
        });
        return;
      }

      if (ast.type === "fn" && e.left.args.length < ast.params.length) {
        const [start] = ast.params[e.left.args.length]!.span;
        const [, end] = ast.params.at(-1)!.span;

        this.errors.push({
          span: [start, end],
          description: new ArityMismatch(
            e.left.args.length,
            e.right.args.length,
          ),
        });

        return;
      }

      this.errors.push({
        span: ast.span,
        description: new ArityMismatch(e.left.args.length, e.right.args.length),
      });
    }

    this.errors.push(unifyErr(ast, e));
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

        let moduleName: string | undefined = undefined;
        if (isSelfRec) {
          moduleName = opts.returning.moduleName;
        } else {
          const resolution = this.resolveType(ast.namespace, ast.name);
          if (
            resolution !== undefined &&
            resolution.arity === expectedArity &&
            resolution.pub
          ) {
            moduleName = resolution.namespace;
          }
        }

        if (moduleName === undefined) {
          this.errors.push({
            // TODO better error for wrong arity
            span: ast.span,
            description: new UnboundType(ast.name),
          });
          return TVar.fresh().asType();
        }

        return {
          type: "named",
          moduleName,
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
            span: ast.span,
            description: new UnboundTypeParam(ast.ident),
          });
        }
        return { type: "quantified", id: ast.ident };

      case "any":
        if (opts.type === "constructor-arg") {
          this.errors.push({
            span: ast.span,
            description: new InvalidCatchall(),
          });
        }
        return { type: "var", var: TVar.fresh() };
    }
  }

  private typecheckAnnotatedDecl(decl: TypedDeclaration) {
    if (decl.typeHint !== undefined) {
      const th = this.typeAstToType(decl.typeHint, { type: "type-hint" });
      this.unifyNode(decl.typeHint, instantiate(th), decl.binding.$.asType());
    }

    if (decl.extern) {
      return;
    }

    this.typecheckAnnotatedExpr(decl.value);

    this.unifyExpr(decl.value, decl.binding.$.asType(), decl.value.$.asType());
  }

  private resolveIdent(
    ns: string | undefined,
    name: string,
    span: Span,
  ): Type<Poly> | undefined {
    if (ns !== undefined) {
      const import_ = this.imports.find((import_) => import_.ns === ns);
      if (import_ === undefined) {
        this.errors.push({
          span,
          description: new UnimportedModule(ns),
        });
        return TVar.fresh().asType();
      }

      const dep = this.deps[ns];
      if (dep === undefined) {
        return undefined;
      }

      const decl = dep.declarations
        .find((decl) => decl.binding.name === name && decl.pub)
        ?.binding.$.asType();

      if (decl !== undefined) {
        return generalize(decl);
      }

      for (const tDecl of dep.typeDeclarations) {
        if (tDecl.type === "adt" && tDecl.pub === "..") {
          for (const variant of tDecl.variants) {
            if (variant.name === name) {
              return variant.poly;
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
                  if (variant.name === name) {
                    return variant.poly;
                  }
                }
              }
              break;
            }

            case "value":
              if (exposing.name === name) {
                const poly =
                  exposing.declaration === undefined
                    ? TVar.fresh().asType()
                    : generalize(exposing.declaration.binding.$.asType());

                return poly;
              }
              break;
          }
        }
      }

      return;
    }
  }

  private typecheckPattern(pattern: TypedMatchPattern) {
    switch (pattern.type) {
      case "lit": {
        const t = inferConstant(pattern.literal);
        this.unifyNode(pattern, pattern.$.asType(), t);
      }

      case "identifier":
        break;

      case "constructor": {
        let lookup: Type<never>;

        const resolved = pattern.resolution;
        if (resolved !== undefined) {
          if (resolved.type !== "constructor") {
            throw new Error("[unreachable] invalid resolution for constructor");
          }
          lookup = instantiate(resolved.variant.poly);
        } else {
          // TODO handle ns
          const lookup_ = this.resolveIdent(
            undefined,
            pattern.name,
            pattern.span,
          );

          if (lookup_ === undefined) {
            // TODO better err
            this.errors.push({
              span: pattern.span,
              description: new UnboundVariable(pattern.name),
            });
            return;
          }

          lookup = instantiate(lookup_);
        }

        if (lookup.type === "named") {
          this.unifyNode(pattern, lookup, pattern.$.asType());
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

            this.typecheckPattern(pattern.args[i]!);
          }

          if (lookup.args.length !== pattern.args.length) {
            this.errors.push({
              span: pattern.span,
              description: new ArityMismatch(
                lookup.args.length,
                pattern.args.length,
              ),
            });
            return;
          }
        }

        return;
      }
    }
  }

  private typecheckAnnotatedExpr(ast: TypedExpr) {
    switch (ast.type) {
      case "constant": {
        const t = inferConstant(ast.value);
        this.unifyExpr(ast, ast.$.asType(), t);
        return;
      }

      case "identifier": {
        const resolved = ast.resolution;
        if (resolved !== undefined) {
          switch (resolved.type) {
            case "local-variable":
              this.unifyExpr(ast, ast.$.asType(), resolved.binding.$.asType());
              return;
            case "global-variable": {
              const t = generalize(resolved.declaration.binding.$.asType());
              this.unifyExpr(ast, ast.$.asType(), instantiate(t));
              return;
            }
            case "constructor": {
              const t = instantiate(resolved.variant.poly);
              this.unifyExpr(ast, ast.$.asType(), instantiate(t));
              return;
            }
          }
        }

        const lookup = this.resolveIdent(ast.namespace, ast.name, ast.span);
        if (lookup === undefined) {
          this.errors.push(
            ast.namespace === undefined
              ? {
                  span: ast.span,
                  description: new UnboundVariable(ast.name),
                }
              : {
                  span: ast.span,
                  description: new NonExistingImport(ast.name),
                },
          );
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

        this.typecheckAnnotatedExpr(ast.body);
        return;

      case "application":
        this.typecheckAnnotatedExpr(ast.caller);
        this.unifyExpr(ast, ast.caller.$.asType(), {
          type: "fn",
          args: ast.args.map((arg) => arg.$.asType()),
          return: ast.$.asType(),
        });
        for (const arg of ast.args) {
          this.typecheckAnnotatedExpr(arg);
        }
        return;

      case "let":
        this.unifyExpr(ast, ast.binding.$.asType(), ast.value.$.asType());
        this.unifyExpr(ast, ast.$.asType(), ast.body.$.asType());
        this.typecheckAnnotatedExpr(ast.value);
        this.typecheckAnnotatedExpr(ast.body);
        return;

      case "if":
        this.unifyExpr(ast, ast.condition.$.asType(), Bool);
        this.unifyExpr(ast, ast.$.asType(), ast.then.$.asType());
        this.unifyExpr(ast, ast.$.asType(), ast.else.$.asType());
        this.typecheckAnnotatedExpr(ast.condition);
        this.typecheckAnnotatedExpr(ast.then);
        this.typecheckAnnotatedExpr(ast.else);
        return;

      case "match":
        this.typecheckAnnotatedExpr(ast.expr);
        for (const [pattern, expr] of ast.clauses) {
          this.unifyExpr(ast, pattern.$.asType(), ast.expr.$.asType());
          this.typecheckPattern(pattern);
          this.unifyExpr(ast, ast.$.asType(), expr.$.asType());
          this.typecheckAnnotatedExpr(expr);
        }
    }
  }

  private unifyNode(ast: SpanMeta, t1: Type, t2: Type) {
    const e = unify(t1, t2);
    if (e === undefined) {
      return;
    }
    this.errors.push(unifyErr(ast, e));
  }

  private annotateTypeDeclaration(
    typeDecl: UntypedTypeDeclaration,
  ): TypedTypeDeclaration {
    const usedParams = new Set();
    for (const param of typeDecl.params) {
      if (usedParams.has(param.name)) {
        this.errors.push({
          span: param.span,
          description: new TypeParamShadowing(param.name),
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
            const typedVariant = {
              ...variant,
              poly: t,
            };
            this.variants[variant.name] = typedVariant;
            return typedVariant;
          }),
        } as TypedTypeDeclaration;
      }
    }
  }

  // TODO handle ns
  private resolveType(
    ns: string | undefined,
    typeName: string,
  ): TypeResolutionData | undefined {
    if (ns !== undefined) {
      const import_ = this.imports.find((import_) => import_.ns === ns);
      if (import_ === undefined) {
        return undefined;
      }

      const dep = this.deps[import_.ns];
      if (dep === undefined) {
        return undefined;
      }

      for (const typeDecl of dep.typeDeclarations) {
        if (typeDecl.name === typeName) {
          return {
            arity: typeDecl.params.length,
            pub: Boolean(typeDecl.pub),
            namespace: ns,
          };
        }
      }

      return undefined;
    }

    for (const typeDecl of this.typeDeclarations) {
      if (typeDecl.name === typeName) {
        return { arity: typeDecl.params.length, pub: true, namespace: this.ns };
      }
    }
    for (const import_ of this.imports) {
      for (const exposed of import_.exposing) {
        if (exposed.type === "type" && exposed.resolved.name === typeName) {
          // TODO pub=true?
          return {
            arity: exposed.resolved.params.length,
            pub: true,
            namespace: import_.ns,
          };
        }
      }
    }
    return undefined;
  }

  private annotateDeclarations(
    declrs: UntypedDeclaration[],
  ): TypedDeclaration[] {
    return declrs.map<TypedDeclaration>((decl) => {
      const binding: Binding<TypeMeta> = {
        ...decl.binding,
        $: TVar.fresh(),
      };

      let tDecl: TypedDeclaration;
      if (decl.extern) {
        tDecl = {
          ...decl,
          binding,
        };
      } else {
        tDecl = {
          ...decl,
          binding,
          value: this.annotateExpr(decl.value, {
            // This is an hack to prevent the recursive reference to be generalized
            // we probably want a new type of scope for this
            [decl.binding.name]: binding,
          }),
        };
      }

      this.globalScope[decl.binding.name] = tDecl;

      return tDecl;
    });
  }

  private annotateExpr(ast: Expr, lexicalScope: LexicalScope): TypedExpr {
    switch (ast.type) {
      case "constant":
        return { ...ast, $: TVar.fresh() };

      case "identifier":
        return {
          ...ast,
          resolution: this.resolveIdentifier(ast, lexicalScope),
          $: TVar.fresh(),
        };

      case "fn": {
        const params = ast.params.map((p) => ({
          ...p,
          $: TVar.fresh(),
        }));

        for (const param of params) {
          lexicalScope = { ...lexicalScope, [param.name]: param };
        }

        return {
          ...ast,
          $: TVar.fresh(),
          body: this.annotateExpr(ast.body, lexicalScope),
          params,
        };
      }

      case "application":
        return {
          ...ast,
          $: TVar.fresh(),
          caller: this.annotateExpr(ast.caller, lexicalScope),
          args: ast.args.map((arg) => this.annotateExpr(arg, lexicalScope)),
        };

      case "if":
        return {
          ...ast,
          $: TVar.fresh(),
          condition: this.annotateExpr(ast.condition, lexicalScope),
          then: this.annotateExpr(ast.then, lexicalScope),
          else: this.annotateExpr(ast.else, lexicalScope),
        };

      case "let": {
        const binding: Binding<TypeMeta> = {
          ...ast.binding,
          $: TVar.fresh(),
        };

        return {
          ...ast,
          $: TVar.fresh(),
          binding,
          // TODO only pass this if it's a fn
          value: this.annotateExpr(ast.value, {
            ...lexicalScope,
            [ast.binding.name]: binding,
          }),
          body: this.annotateExpr(ast.body, {
            ...lexicalScope,
            [ast.binding.name]: binding,
          }),
        };
      }
      case "match": {
        return {
          ...ast,
          $: TVar.fresh(),
          expr: this.annotateExpr(ast.expr, lexicalScope),
          clauses: ast.clauses.map(([pattern, expr]) => {
            const [annotatedPattern, matchScope] =
              this.annotateMatchPattern(pattern);

            return [
              annotatedPattern,
              this.annotateExpr(expr, { ...lexicalScope, ...matchScope }),
            ];
          }),
        };
      }
    }
  }

  private annotateMatchPattern(
    ast: MatchPattern,
  ): [TypedMatchPattern, LexicalScope] {
    const scope: LexicalScope = {};

    const recur = (ast: MatchPattern): TypedMatchPattern => {
      switch (ast.type) {
        case "lit":
          return {
            ...ast,
            $: TVar.fresh(),
          };

        case "identifier": {
          const typedBinding = {
            ...ast,
            $: TVar.fresh(),
          };
          scope[ast.name] = typedBinding;
          return typedBinding;
        }

        case "constructor": {
          // TODO only resolve if constructor is unqualified
          const variant = this.variants[ast.name];
          const typedPattern: TypedMatchPattern = {
            ...ast,
            resolution:
              variant === undefined
                ? undefined
                : { type: "constructor", variant },
            args: ast.args.map(recur),
            $: TVar.fresh(),
          };
          return typedPattern;
        }
      }
    };

    return [recur(ast), scope];
  }

  private resolveIdentifier(
    ast: { name: string; namespace?: string },
    lexicalScope: LexicalScope,
  ): IdentifierResolution | undefined {
    if (ast.namespace !== undefined) {
      return;
    }

    const variant = this.variants[ast.name];
    if (variant !== undefined) {
      return { type: "constructor", variant };
    }

    const lexical = lexicalScope[ast.name];
    if (lexical !== undefined) {
      return { type: "local-variable", binding: lexical };
    }

    const global = this.globalScope[ast.name];
    if (global !== undefined) {
      return { type: "global-variable", declaration: global };
    }

    return;
  }
}

type TypeResolutionData = {
  arity: number;
  pub: boolean;
  namespace: string;
};

type LexicalScope = Record<string, Binding<TypeMeta>>;

function inferConstant(x: ConstLiteral): Type {
  // Keep this in sync with core
  switch (x.type) {
    case "int":
      return { moduleName: "Basics", type: "named", name: "Int", args: [] };

    case "float":
      return { moduleName: "Basics", type: "named", name: "Float", args: [] };

    case "string":
      return { moduleName: "String", type: "named", name: "String", args: [] };
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
    const module = project[ns];
    if (module === undefined) {
      // A module might import a module that do not exist
      continue;
    }
    const tc = typecheck(
      ns,
      module,
      deps,
      CORE_MODULES.includes(ns) ? [] : implicitImports,
    );
    projectResult[ns] = tc;
    deps[ns] = tc[0];
  }

  return projectResult;
}

export type ProjectTypeCheckResult = Record<string, [TypedModule, ErrorInfo[]]>;

// Keep this in sync with core
const Bool: Type = {
  type: "named",
  moduleName: "Basics",
  name: "Bool",
  args: [],
};

function unifyErr(node: SpanMeta, e: UnifyError): ErrorInfo {
  switch (e.type) {
    case "type-mismatch":
      return {
        span: node.span,
        description: new TypeMismatch(e.left, e.right),
      };
    case "occurs-check":
      return { span: node.span, description: new OccursCheck() };
  }
}
