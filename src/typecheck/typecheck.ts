import {
  ConstLiteral,
  SpanMeta,
  UntypedImport,
  UntypedModule,
  UntypedTypeDeclaration,
  UntypedTypeVariant,
} from "../parser";
import {
  FieldResolution,
  IdentifierResolution,
  StructResolution,
  TypedDeclaration,
  TypedExpr,
  TypedMatchPattern,
  TypedModule,
  TypedTypeAst,
  TypedTypeDeclaration,
} from "./typedAst";
import { TraitImpl, defaultImports, defaultTraitImpls } from "./defaultImports";
import {
  TVar,
  Type,
  unify,
  UnifyError,
  generalizeAsScheme,
  instantiateFromScheme,
  TypeScheme,
  PolyType,
  TraitImplDependency,
  TVarResolution,
  Instantiator,
  typeToString,
  findUnboundTypeVars,
} from "./type";
import {
  ArityMismatch,
  AmbiguousTypeVar,
  ErrorInfo,
  InvalidCatchall,
  InvalidField,
  InvalidTypeArity,
  MissingRequiredFields,
  NonExhaustiveMatch,
  OccursCheck,
  TraitNotSatified,
  TypeMismatch,
  UnboundTypeParam,
} from "../errors";
import { castAst, findFieldInModule } from "./resolutionStep";
import { topologicalSort } from "../utils/topsort";

export type TypeMeta = { $: TVar };

// Record from namespace (e.g. "A.B.C" ) to the module

export type Deps = Record<string, TypedModule>;

export function resetTraitsRegistry(
  traitImpls: TraitImpl[] = defaultTraitImpls,
) {
  TVar.resetTraitImpls();
  for (const impl of traitImpls) {
    TVar.registerTraitImpl(
      impl.moduleName,
      impl.typeName,
      impl.trait,
      impl.deps ?? [],
    );
  }
}

export function typecheck(
  ns: string,
  module: UntypedModule,
  deps: Deps = {},
  implicitImports: UntypedImport[] = defaultImports,
  mainType = DEFAULT_MAIN_TYPE,
): [TypedModule, ErrorInfo[]] {
  return new Typechecker(ns, mainType).run(module, deps, implicitImports);
}

type ScheduledAmbiguousVarCheck = {
  bindingsStack: Type[];
  instantiatedVarNode: { name: string } & TypeMeta & SpanMeta;
};

class Typechecker {
  private errors: ErrorInfo[] = [];
  private scheduledFieldResolutions: (TypedExpr & { type: "field-access" })[] =
    [];

  /** ids of the fresh variables created due to typechecking error */
  private errorNodesTypeVarIds = new Set<number>();

  private ambiguousTypeVarErrorsEmitted = new Set<number>();
  private bindingsTypesStack: Type[] = [];

  private scheduledAmbiguousVarChecks: ScheduledAmbiguousVarCheck[] = [];

  constructor(
    private ns: string,
    private mainType: Type,
  ) {}

  private pushErrorNode(ast: TypeMeta) {
    const resolved = ast.$.resolve();
    if (resolved.type === "unbound") {
      this.errorNodesTypeVarIds.add(resolved.id);
    }
  }

  private derive(
    trait: string,
    typeDecl: TypedTypeDeclaration & { type: "adt" },
  ) {
    const deps: TraitImplDependency[] = [];

    const depParams = new Set<string>();

    // Register recursive type
    TVar.registerTraitImpl(
      this.ns,
      typeDecl.name,
      trait,
      typeDecl.params.map((_) => undefined),
    );

    for (const variant of typeDecl.variants) {
      const resolved = variant.$.resolve();
      if (resolved.type === "unbound") {
        throw new Error("[unreachable]");
      }
      const { value: concreteType } = resolved;

      if (concreteType.type === "fn") {
        for (const arg of concreteType.args) {
          const impl = TVar.typeImplementsTrait(arg, trait);
          if (impl === undefined) {
            TVar.removeTraitImpl(this.ns, typeDecl.name, trait);
            return;
          }
          for (const { id } of impl) {
            const name = variant.scheme[id];
            if (name !== undefined) {
              depParams.add(name);
            }
          }
        }
      }

      // Singleton always derive any trait
    }

    for (const param of typeDecl.params) {
      if (depParams.has(param.name)) {
        deps.push([trait]);
      } else {
        deps.push(undefined);
      }
    }

    TVar.removeTraitImpl(this.ns, typeDecl.name, trait);
    TVar.registerTraitImpl(this.ns, typeDecl.name, trait, deps);
  }

  run(
    module: UntypedModule,
    deps: Deps,
    implicitImports: UntypedImport[] = defaultImports,
  ): [TypedModule, ErrorInfo[]] {
    TVar.resetId();

    const [typedAst, errors] = castAst(this.ns, module, deps, implicitImports);

    this.errors = [...errors];

    for (const typeDecl of typedAst.typeDeclarations) {
      if (typeDecl.type === "adt") {
        for (const variant of typeDecl.variants) {
          const [scheme, mono] = this.makeVariantType(typeDecl, variant);
          variant.scheme = scheme;
          const err = unify(variant.$.asType(), mono);
          if (err !== undefined) {
            throw new Error("[unreachable] adt type should be fresh initially");
          }
        }

        this.derive("Eq", typeDecl);
        this.derive("Show", typeDecl);
      } else if (typeDecl.type === "struct") {
        this.makeStructType(typeDecl);
      }
    }

    for (const decl of typedAst.declarations) {
      this.bindingsTypesStack.push(decl.binding.$.asType());
      this.typecheckAnnotatedDecl(decl);
      this.bindingsTypesStack.pop();

      for (const check of this.scheduledAmbiguousVarChecks) {
        this.checkInstantiatedVars(decl.scheme, check);
      }
      this.scheduledAmbiguousVarChecks = [];
    }

    for (const fieldAccessAst of this.scheduledFieldResolutions) {
      this.doubleCheckFieldAccess(
        fieldAccessAst,
        fieldAccessAst.left.$.resolve(),
        deps,
      );
    }

    return [typedAst, this.errors];
  }

  private makeStructType(typeDecl: TypedTypeDeclaration & { type: "struct" }) {
    // TODO dedup from makeVariantType
    const generics: [string, TVar, number][] = typeDecl.params.map((param) => [
      param.name,
      ...TVar.freshWithId(),
    ]);

    const scheme: TypeScheme = Object.fromEntries(
      generics.map(([param, , id]) => [id, param]),
    );

    const mono: Type = {
      type: "named",
      moduleName: this.ns,
      name: typeDecl.name,
      args: generics.map(([, tvar]) => tvar.asType()),
    };

    unify(typeDecl.$.asType(), mono);

    typeDecl.scheme = scheme;

    for (const field of typeDecl.fields) {
      const bound: Record<string, TVar> = Object.fromEntries(
        generics.map(([p, t]) => [p, t]),
      );

      const fieldType = this.typeAstToType(
        field.type_,
        { type: "constructor-arg", params: typeDecl.params.map((p) => p.name) }, // TODO params
        bound,
        {}, // TODO traits
      );

      unify(fieldType, field.$.asType()); // Do not change args order

      field.scheme = scheme;
    }
  }

  private makeVariantType(
    typeDecl: UntypedTypeDeclaration & { type: "adt" },
    variant: UntypedTypeVariant,
  ): PolyType {
    const generics: [string, TVar, number][] = typeDecl.params.map((param) => [
      param.name,
      ...TVar.freshWithId(),
    ]);

    const scheme: TypeScheme = Object.fromEntries(
      generics.map(([param, , id]) => [id, param]),
    );

    const ret: Type = {
      type: "named",
      moduleName: this.ns,
      name: typeDecl.name,
      args: generics.map((g) => g[1].asType()),
    };

    const params = typeDecl.params.map((p) => p.name);

    if (variant.args.length === 0) {
      return [scheme, ret];
    } else {
      return [
        scheme,
        {
          type: "fn",
          args: variant.args.map((arg) => {
            const mono = this.typeAstToType(
              arg,
              {
                type: "constructor-arg",
                params,
              },
              Object.fromEntries(generics.map(([p, t]) => [p, t])),
              {},
            );

            return mono;
          }),
          return: ret,
        },
      ];
    }
  }

  private unifyExpr(ast: TypedExpr, t1: Type, t2: Type) {
    const e = unify(t1, t2);
    if (e === undefined) {
      return;
    }

    if (
      e.type === "type-mismatch" &&
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

      return;
    }

    this.pushErrorNode(ast);
    this.errors.push(unifyErr(ast, e));
  }

  /**
   * Used to parse args of ADT constructors
   */
  private typeAstToType(
    ast: TypedTypeAst,
    opts: TypeAstConversionType,
    /* mut */ bound: Record<string, TVar>,
    traitDefs: Record<string, string[]>,
  ): Type {
    switch (ast.type) {
      case "named": {
        if (ast.resolution === undefined) {
          return TVar.fresh().asType();
        }

        const expectedArity = ast.resolution.declaration.params.length,
          actualArity = ast.args.length;

        if (expectedArity !== actualArity) {
          this.errors.push({
            span: ast.span,
            description: new InvalidTypeArity(
              ast.name,
              expectedArity,
              actualArity,
            ),
          });
        }

        return {
          type: "named",
          moduleName: ast.resolution.namespace,
          name: ast.name,
          args: ast.args.map((arg) =>
            this.typeAstToType(arg, opts, bound, traitDefs),
          ),
        };
      }

      case "fn": {
        return {
          type: "fn",
          args: ast.args.map((arg) =>
            this.typeAstToType(arg, opts, bound, traitDefs),
          ),
          return: this.typeAstToType(ast.return, opts, bound, traitDefs),
        };
      }

      case "var": {
        if (
          opts.type === "constructor-arg" &&
          !opts.params.includes(ast.ident)
        ) {
          this.errors.push({
            span: ast.span,
            description: new UnboundTypeParam(ast.ident),
          });
        }

        const bound_ = bound[ast.ident];
        if (bound_ === undefined) {
          const traits = traitDefs[ast.ident] ?? [];
          const $ = TVar.fresh(traits);
          bound[ast.ident] = $;
          return $.asType();
        }

        return bound_.asType();
      }

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
      const bound: Record<string, TVar> = {};
      const traitDefs = decl.typeHint.where.map((d) => [d.typeVar, d.traits]);
      const th = this.typeAstToType(
        decl.typeHint.mono,
        { type: "type-hint" },
        bound,
        Object.fromEntries(traitDefs),
      );

      const scheme: TypeScheme = {};
      for (const [name, $] of Object.entries(bound)) {
        const resolved = $.resolve();
        if (resolved.type !== "unbound") {
          continue;
        }
        scheme[resolved.id] = name;
      }

      decl.scheme = scheme;
      this.unifyNode(
        decl.typeHint,
        instantiateFromScheme(th, {}),
        decl.binding.$.asType(),
      );
    }

    if (decl.binding.name === "main") {
      this.unifyNode(decl.binding, decl.binding.$.asType(), this.mainType);
    }

    if (decl.extern) {
      return;
    }

    this.typecheckAnnotatedExpr(decl.value);
    this.unifyExpr(decl.value, decl.binding.$.asType(), decl.value.$.asType());

    decl.scheme = generalizeAsScheme(decl.value.$.asType());
  }

  private typecheckPattern(
    pattern: TypedMatchPattern,
    forceExhaustive = false,
  ) {
    switch (pattern.type) {
      case "lit": {
        if (forceExhaustive) {
          this.errors.push({
            description: new NonExhaustiveMatch(),
            span: pattern.span,
          });
        }
        const t = inferConstant(pattern.literal);
        this.unifyNode(pattern, pattern.$.asType(), t);
      }

      case "identifier":
        break;

      case "constructor": {
        if (pattern.resolution === undefined) {
          return;
        }

        if (pattern.resolution.type !== "constructor") {
          throw new Error("[unreachable] invalid resolution for constructor");
        }

        if (
          forceExhaustive &&
          pattern.resolution.declaration.variants.length > 1
        ) {
          this.errors.push({
            span: pattern.span,
            description: new NonExhaustiveMatch(),
          });
        }

        const t = instantiateFromScheme(
          pattern.resolution.variant.$.asType(),
          pattern.resolution.variant.scheme,
        );

        if (t.type === "named") {
          this.unifyNode(pattern, t, pattern.$.asType());
        }

        if (t.type === "fn") {
          this.unifyNode(
            pattern,
            {
              type: "fn",
              args: t.args,
              return: pattern.$.asType(),
            },
            t,
          );

          for (let i = 0; i < pattern.args.length && i < t.args.length; i++) {
            this.unifyNode(pattern, pattern.args[i]!.$.asType(), t.args[i]!);
            this.typecheckPattern(pattern.args[i]!, forceExhaustive);
          }

          if (t.args.length !== pattern.args.length) {
            this.errors.push({
              span: pattern.span,
              description: new ArityMismatch(
                t.args.length,
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

  private checkInstantiatedVars(
    scheme: TypeScheme,
    { instantiatedVarNode, bindingsStack }: ScheduledAmbiguousVarCheck,
  ) {
    if (bindingsStack.length === 0) {
      throw new Error("[unreachable] empty bindings stack");
    }

    const bindingUnboundTypes = new Set<number>(
      bindingsStack
        .flatMap((binding) => findUnboundTypeVars(binding))
        .map((v) => v.id),
    );

    const instantiatedVarUnboundTypes = findUnboundTypeVars(
      instantiatedVarNode.$.asType(),
    ).filter((v) => v.traits.length !== 0);

    for (const instantiatedVarType of instantiatedVarUnboundTypes) {
      const areVarsInBindings = bindingUnboundTypes.has(instantiatedVarType.id);
      if (areVarsInBindings) {
        continue;
      }

      const wasErrorNode = this.errorNodesTypeVarIds.has(
        instantiatedVarType.id,
      );
      if (wasErrorNode) {
        continue;
      }

      const wasErrorAlreadyEmitted = this.ambiguousTypeVarErrorsEmitted.has(
        instantiatedVarType.id,
      );
      if (wasErrorAlreadyEmitted) {
        continue;
      }

      this.ambiguousTypeVarErrorsEmitted.add(instantiatedVarType.id);
      this.errors.push({
        span: instantiatedVarNode.span,
        description: new AmbiguousTypeVar(
          instantiatedVarType.traits[0]!,
          typeToString(instantiatedVarNode.$.asType(), scheme),
        ),
      });

      // TODO do I have to break the loop here? double check
      return;
    }
  }

  private typecheckAnnotatedExpr(ast: TypedExpr) {
    switch (ast.type) {
      case "constant": {
        const t = inferConstant(ast.value);
        this.unifyExpr(ast, ast.$.asType(), t);
        return;
      }

      case "list-literal": {
        const valueType = TVar.fresh().asType();
        this.unifyExpr(ast, ast.$.asType(), List(valueType));
        for (const value of ast.values) {
          this.unifyExpr(value, value.$.asType(), valueType);
          this.typecheckAnnotatedExpr(value);
        }
        return;
      }

      case "struct-literal": {
        if (ast.struct.resolution === undefined) {
          // TODO handle err
          return;
        }

        const instantiator = new Instantiator();
        const type_ = instantiator.instantiatePoly(
          ast.struct.resolution.declaration,
        );

        for (const field of ast.fields) {
          if (field.field.resolution === undefined) {
            // The error was already emitted during resolution
            continue;
          }

          const fieldType = instantiator.instantiatePoly(
            field.field.resolution.field,
          );

          this.unifyExpr(field.value, field.value.$.asType(), fieldType);
          this.typecheckAnnotatedExpr(field.value);
        }

        this.checkMissingStructFields(ast, ast.struct.resolution, type_);
        this.unifyExpr(ast, ast.$.asType(), type_);
        return;
      }

      case "identifier": {
        if (ast.resolution === undefined) {
          // Error was already emitted
          // Do not narrow the identifier's type
          this.pushErrorNode(ast);
          return;
        }

        this.unifyExpr(ast, ast.$.asType(), resolutionToType(ast.resolution));

        if (ast.resolution.type !== "local-variable") {
          this.scheduledAmbiguousVarChecks.push({
            instantiatedVarNode: ast,
            bindingsStack: [...this.bindingsTypesStack],
          });
        }

        return;
      }

      case "fn":
        this.unifyExpr(ast, ast.$.asType(), {
          type: "fn",
          args: ast.params.map((p) => {
            this.typecheckPattern(p, true);
            return p.$.asType();
          }),
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

      case "field-access": {
        this.typecheckAnnotatedExpr(ast.left);
        if (ast.resolution === undefined) {
          this.scheduledFieldResolutions.push(ast);
          return;
        }

        // TODO use resolution's namespace
        this.unifyFieldAccess(ast, ast.resolution);

        return;
      }

      case "let":
        this.typecheckPattern(ast.pattern, true);
        this.unifyExpr(ast, ast.pattern.$.asType(), ast.value.$.asType());
        this.unifyExpr(ast, ast.$.asType(), ast.body.$.asType());

        this.bindingsTypesStack.push(ast.pattern.$.asType());
        this.typecheckAnnotatedExpr(ast.value);
        this.bindingsTypesStack.pop();

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

  private unifyFieldAccess(
    ast: TypedExpr & { type: "field-access" },
    resolution: FieldResolution,
  ) {
    const instantiator = new Instantiator();

    const structType: Type = instantiator.instantiatePoly(
      resolution.declaration,
    );
    this.unifyExpr(ast.left, ast.left.$.asType(), structType);
    const fieldType = instantiator.instantiatePoly(resolution.field);
    this.unifyExpr(ast, ast.$.asType(), fieldType);
  }

  private checkMissingStructFields(
    ast: TypedExpr & { type: "struct-literal" },
    resolution: StructResolution,
    type: Type,
  ) {
    // Check for missing fields
    const missingFields = resolution.declaration.fields
      .filter((defField) => {
        return !ast.fields.some((structField) => {
          return structField.field.name === defField.name;
        });
      })
      .map((f) => f.name);

    if (missingFields.length !== 0) {
      this.errors.push({
        description: new MissingRequiredFields(
          typeToString(type),
          missingFields,
        ),
        span: ast.struct.span,
      });
    }
  }

  private doubleCheckFieldAccess(
    fieldAccessAst: TypedExpr & { type: "field-access" },
    resolved: TVarResolution,
    deps: Deps,
  ) {
    const emitErr = () => {
      this.errors.push({
        span: fieldAccessAst.field.span,
        description: new InvalidField(
          typeToString(fieldAccessAst.left.$.asType()),
          fieldAccessAst.field.name,
        ),
      });
    };

    switch (resolved.type) {
      case "bound": {
        if (resolved.value.type !== "named") {
          // TODO emit err
          throw new Error("TODO handle field access to fn");
        }

        if (resolved.value.moduleName === this.ns) {
          // we already looked up the fields in this module's structs
          emitErr();
          return;
        }

        const mod = deps[resolved.value.moduleName];
        if (mod === undefined) {
          throw new Error("TODO handle invalid mod");
        }

        const fieldLookup = findFieldInModule(
          mod.typeDeclarations,
          fieldAccessAst.field.name,
          resolved.value.moduleName,
        );

        if (fieldLookup !== undefined && fieldLookup.declaration.pub === "..") {
          // Found the field. Re-run unification
          this.unifyFieldAccess(fieldAccessAst, fieldLookup);
          return;
        }

        // we already know this field does not exist in this module
        emitErr();
        return;
      }

      case "unbound":
        emitErr();
        return;
    }
  }
}

function inferConstant(x: ConstLiteral): Type {
  // Keep this in sync with core
  switch (x.type) {
    case "int":
      return Int;

    case "float":
      return Float;

    case "string":
      return String;

    case "char":
      return Char;
  }
}

type TypeAstConversionType =
  | { type: "type-hint" }
  | {
      type: "constructor-arg";
      params: string[];
    };

const CORE_PACKAGE = "kestrel_core";

function topSortedModules(
  project: UntypedProject,
  implicitImports: UntypedImport[] = defaultImports,
): string[] {
  const implNsImports = implicitImports.map((i) => i.ns);

  const dependencyGraph: Record<string, string[]> = {};
  for (const [ns, { package: package_, module }] of Object.entries(project)) {
    const deps =
      package_ === CORE_PACKAGE
        ? getDependencies(module)
        : [...implNsImports, ...getDependencies(module)];

    dependencyGraph[ns] = deps;
  }

  return topologicalSort(dependencyGraph);
}

function getDependencies(program: UntypedModule): string[] {
  return program.imports.map((i) => i.ns);
}

export type UntypedProject = Record<
  string,
  {
    package: string;
    module: UntypedModule;
  }
>;

export function typecheckProject(
  project: UntypedProject,
  implicitImports: UntypedImport[] = defaultImports,
  mainType = DEFAULT_MAIN_TYPE,
): ProjectTypeCheckResult {
  resetTraitsRegistry();

  const sortedModules = topSortedModules(project, implicitImports);

  const projectResult: ProjectTypeCheckResult = {};
  const deps: Deps = {};
  for (const ns of sortedModules) {
    const m = project[ns];
    if (m === undefined) {
      // A module might import a module that do not exist
      continue;
    }
    const [typedModule, errors] = typecheck(
      ns,
      m.module,
      deps,
      m.package === CORE_PACKAGE ? [] : implicitImports,
      mainType,
    );
    projectResult[ns] = { typedModule, errors, package: m.package };
    deps[ns] = typedModule;
  }

  return projectResult;
}

export type TypecheckedModule = {
  package: string;
  typedModule: TypedModule;
  errors: ErrorInfo[];
};

export type ProjectTypeCheckResult = Record<string, TypecheckedModule>;

function unifyErr(node: SpanMeta, e: UnifyError): ErrorInfo {
  switch (e.type) {
    case "missing-trait":
      return {
        span: node.span,
        description: new TraitNotSatified(e.type_, e.trait),
      };

    case "type-mismatch":
      return {
        span: node.span,
        description: new TypeMismatch(e.left, e.right),
      };
    case "occurs-check":
      return { span: node.span, description: new OccursCheck() };
  }
}

function resolutionToType(resolution: IdentifierResolution): Type {
  switch (resolution.type) {
    case "local-variable":
      return resolution.binding.$.asType();

    case "global-variable":
      return instantiateFromScheme(
        resolution.declaration.binding.$.asType(),
        resolution.declaration.scheme,
      );

    case "constructor":
      return instantiateFromScheme(
        resolution.variant.$.asType(),
        resolution.variant.scheme,
      );

    // TODO should struct go here?
  }
}

// Keep this in sync with core
const Bool: Type = {
  type: "named",
  moduleName: "Bool",
  name: "Bool",
  args: [],
};

const Int: Type = {
  moduleName: "Int",
  type: "named",
  name: "Int",
  args: [],
};

const Float: Type = {
  moduleName: "Float",
  type: "named",
  name: "Float",
  args: [],
};

const String: Type = {
  moduleName: "String",
  type: "named",
  name: "String",
  args: [],
};

const Char: Type = {
  moduleName: "Char",
  type: "named",
  name: "Char",
  args: [],
};

const Unit: Type = {
  type: "named",
  moduleName: "Tuple",
  name: "Unit",
  args: [],
};

const List = (a: Type): Type => ({
  type: "named",
  moduleName: "List",
  name: "List",
  args: [a],
});

function Task(arg: Type): Type {
  return {
    type: "named",
    moduleName: "Task",
    name: "Task",
    args: [arg],
  };
}

export const DEFAULT_MAIN_TYPE = Task(Unit);
