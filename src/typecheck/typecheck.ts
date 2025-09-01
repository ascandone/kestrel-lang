import {
  ConstLiteral,
  RangeMeta,
  Import,
  UntypedModule,
  TypeDeclaration,
  Range,
} from "../parser";
import {
  FieldResolution,
  IdentifierResolution,
  ModuleInterface,
  StructResolution,
  TypedBlockStatement,
  TypedDeclaration,
  TypedExpr,
  TypedMatchPattern,
  TypedModule,
  TypedTypeAst,
  TypedTypeDeclaration,
  TypedTypeVariant,
} from "./typedAst";
import { TraitImpl, defaultImports, defaultTraitImpls } from "./defaultImports";
import {
  TVar,
  Type,
  unify,
  UnifyError,
  Instantiator,
  typeToString,
  resolveType,
  instantiate,
  TraitsStore,
  TypeResolution,
  generalize,
  GeneralizeResult,
  RigidVarsCtx,
} from "../type";
import * as err from "./errors";
import { DependencyProvider, resolve } from "./resolution";
import { topologicalSort } from "../utils/topsort";
import { DefaultMap } from "../data/defaultMap";
import * as core from "./core_package";

export const DEFAULT_MAIN_TYPE = core.Task(core.Unit);

export type Deps = Record<string, ModuleInterface>;

export type TypecheckOptions = {
  getDependency: DependencyProvider;
  implicitImports: Import[];
  mainType: Type;
  traitImpls: TraitImpl[];
};

export function typecheck(
  package_: string,
  ns: string,
  module: UntypedModule,
  {
    getDependency = () => undefined,
    implicitImports = defaultImports,
    mainType = DEFAULT_MAIN_TYPE,
    traitImpls = defaultTraitImpls,
  }: Partial<TypecheckOptions> = {},
): [TypedModule, err.ErrorInfo[]] {
  TVar.resetId();

  const [typedModule, errors] = resolve(
    package_,
    ns,
    getDependency,
    module,
    implicitImports,
  );

  const tc = new Typechecker(
    errors,
    package_,
    ns,
    typedModule,
    getDependency,
    mainType,
    traitImpls,
  );

  tc.run();

  return [typedModule, errors];
}

type ScheduledAmbiguousVarCheck = {
  instantiated: Map<string, Type>;
  currentDeclaration: TypedDeclaration;
  instantiatedVarNode: TypedExpr & { type: "identifier" };
};

class Typechecker {
  private scheduledFieldResolutions: (TypedExpr & { type: "field-access" })[] =
    [];

  /** ids of the fresh variables created due to typechecking error */
  private errorNodesTypeVarIds = new Set<number>();

  private ambiguousTypeVarErrorsEmitted = new Set<number>();

  private currentRecGroup = new Set<TypedDeclaration>();
  private currentDeclaration?: TypedDeclaration;

  private scheduledAmbiguousVarChecks: ScheduledAmbiguousVarCheck[] = [];

  /** The `(Type, Trait)` pairs, encoded as `${type}:${trait}`
   */
  private localDerives = new Map<string, Set<string>[]>();

  constructor(
    private readonly errors: err.ErrorInfo[],

    private readonly package_: string,
    private readonly ns: string,
    private readonly typedModule: TypedModule,

    private readonly getDependency: DependencyProvider,
    private readonly mainType: Type,
    private readonly traitImpls: TraitImpl[],
  ) {}

  private pushErrorNode(type: Type) {
    const resolved = resolveType(type);
    switch (resolved.type) {
      case "unbound":
        this.errorNodesTypeVarIds.add(resolved.id);
        return;

      case "rigid-var":
        return;
      case "fn":
        for (const arg of resolved.args) {
          this.pushErrorNode(arg);
        }
        this.pushErrorNode(resolved.return);
        return;
      case "named":
        for (const arg of resolved.args) {
          this.pushErrorNode(arg);
        }
        return;
      default:
        return resolved satisfies never;
    }
  }

  private store: TraitsStore = {
    getRigidVarImpl: (name, trait) => {
      const impls = this.currentDeclaration?.$traitsConstraints[name];
      if (impls === undefined) {
        return false;
      }
      return impls.has(trait);
    },

    getNamedTypeDependencies: (type_, trait) =>
      this.getNamedTypeDependencies(type_, trait),
  };

  private getNamedTypeDependencies: TraitsStore["getNamedTypeDependencies"] = (
    { package_, module, name },
    trait,
  ) => {
    const implicit = this.traitImpls.find(
      (v) =>
        v.moduleName === module && v.typeName === name && v.trait === trait,
    );
    if (implicit !== undefined) {
      return (implicit.deps ?? []).map((dep) => new Set(dep));
    }

    if (module === this.ns) {
      return this.localDerives.get(`${name}:${trait}`);
    }

    const modInt = this.getDependency(module);
    if (modInt === undefined) {
      return undefined;
    }

    if (modInt.package_ !== package_) {
      // TODO handle
      throw new Error("unhandled: deriving from another package");
    }

    return modInt.publicTypes[name]?.$traits.get(trait);
  };

  private adtDerive(
    trait: string,
    typeDecl: TypedTypeDeclaration & { type: "adt" },
  ) {
    const out = new DefaultMap<string, Set<string>>(() => new Set());

    for (const variant of typeDecl.variants) {
      // TODO refactor this so that we have a type per ctor arg

      const resolved = resolveType(variant.$type);

      if (resolved.type === "fn") {
        for (const arg of resolved.args) {
          const ok = mkDepsFor(
            out,
            arg,
            trait,
            {
              // TODO check .bind is needed
              getNamedTypeDependencies:
                this.getNamedTypeDependencies.bind(this),
            },
            resolved.return,
          );

          if (!ok) {
            return;
          }
        }
      }

      // Singleton always derive any trait
    }

    const params = typeDecl.params.map((param) => out.get(param.name));
    typeDecl.$traits.set(trait, params);
    this.localDerives.set(`${typeDecl.name}:${trait}`, params);
  }

  private structDerive(
    trait: string,
    typeDecl: TypedTypeDeclaration & { type: "struct" },
  ) {
    const out = new DefaultMap<string, Set<string>>(() => new Set());

    for (const field of typeDecl.fields) {
      const ok = mkDepsFor(
        out,
        field.$type,
        trait,
        {
          // TODO check .bind is needed
          getNamedTypeDependencies: this.getNamedTypeDependencies.bind(this),
        },
        typeDecl.$type,
      );
      if (!ok) {
        return;
      }

      // Singleton always derive any trait
    }

    const params = typeDecl.params.map((param) => out.get(param.name));
    typeDecl.$traits.set(trait, params);
    this.localDerives.set(`${typeDecl.name}:${trait}`, params);
  }

  run(): [TypedModule, err.ErrorInfo[]] {
    for (const typeDecl of this.typedModule.typeDeclarations) {
      if (typeDecl.type === "adt") {
        for (const variant of typeDecl.variants) {
          variant.$type = this.hydrateVariant(typeDecl, variant);
        }

        this.adtDerive("Eq", typeDecl);
        this.adtDerive("Show", typeDecl);
      } else if (typeDecl.type === "struct") {
        this.hydrateStruct(typeDecl);
        this.structDerive("Eq", typeDecl);
        this.structDerive("Show", typeDecl);
      }
    }

    for (const group of this.typedModule.mutuallyRecursiveDeclrs) {
      this.currentRecGroup = new Set(group);

      for (const decl of group) {
        this.currentDeclaration = decl;
        this.typecheckDeclaration(decl);
      }

      const generalized = new Map<TypedDeclaration, GeneralizeResult>();

      for (const decl of group) {
        const gen = generalize(decl.binding.$type, decl.$traitsConstraints);
        generalized.set(decl, gen);

        decl.binding.$type = gen.polyType;
        decl.$traitsConstraints = gen.ctx;
      }

      for (const check of this.scheduledAmbiguousVarChecks) {
        this.checkInstantiatedVars(
          check,
          generalized.get(check.currentDeclaration),
        );
      }
      this.scheduledAmbiguousVarChecks = [];
    }

    for (const fieldAccessAst of this.scheduledFieldResolutions) {
      this.doubleCheckFieldAccess(
        fieldAccessAst,
        resolveType(fieldAccessAst.struct.$type),
      );
    }

    return [this.typedModule, this.errors];
  }

  private hydrateStruct(typeDecl: TypedTypeDeclaration & { type: "struct" }) {
    const params = typeDecl.params.map((p) => p.name);

    typeDecl.$type = {
      type: "named",
      package_: this.package_,
      module: this.ns,
      name: typeDecl.name,
      args: params.map((name) => ({ type: "rigid-var", name })),
    };

    for (const field of typeDecl.fields) {
      const type = this.hydrateTypeAst(field.typeAst, {
        type: "typedef",
        params,
      });
      field.$type = type;
    }
  }

  private hydrateVariant(
    typeDecl: TypeDeclaration & { type: "adt" },
    variant: TypedTypeVariant,
  ): Type {
    const params = typeDecl.params.map((p) => p.name);

    const returnType: Type = {
      type: "named",
      package_: this.package_,
      module: this.ns,
      name: typeDecl.name,
      args: params.map((name): Type => ({ type: "rigid-var", name })),
    };

    if (variant.args.length === 0) {
      return returnType;
    }

    return {
      type: "fn",
      args: variant.args.map((v) =>
        this.hydrateTypeAst(v, { type: "typedef", params }),
      ),
      return: returnType,
    };
  }

  private unifyExpr(ast: TypedExpr, t1: Type, t2: Type) {
    const e = unify(t1, t2, this.store);
    if (e === undefined) {
      return;
    }

    this.pushErrorNode(t1);
    this.pushErrorNode(t2);

    if (
      e.type === "type-mismatch" &&
      e.left.type === "fn" &&
      e.right.type === "fn" &&
      e.left.args.length !== e.right.args.length
    ) {
      if (ast.type === "application" && e.left.args.length < ast.args.length) {
        const { start } = ast.args[e.left.args.length]!.range;
        const { end } = ast.args.at(-1)!.range;

        this.errors.push({
          range: { start, end },
          description: new err.ArityMismatch(
            e.left.args.length,
            e.right.args.length,
          ),
        });
        return;
      }

      if (ast.type === "fn" && e.left.args.length < ast.params.length) {
        const { start } = ast.params[e.left.args.length]!.range;
        const { end } = ast.params.at(-1)!.range;

        this.errors.push({
          range: { start, end },
          description: new err.ArityMismatch(
            e.left.args.length,
            e.right.args.length,
          ),
        });

        return;
      }

      this.errors.push({
        range: ast.range,
        description: new err.ArityMismatch(
          e.left.args.length,
          e.right.args.length,
        ),
      });

      return;
    }

    this.errors.push(
      castUnifyErr(ast, e, this.currentDeclaration!.$traitsConstraints),
    );
  }

  private typecheckDeclaration(decl: TypedDeclaration) {
    if (decl.typeHint !== undefined) {
      // TODO validate where clause:
      // 1. no duplicate vars
      // 2. no orphan vars
      decl.$traitsConstraints = Object.fromEntries(
        decl.typeHint.where.map(
          (def) => [def.typeVar, new Set(def.traits)] as const,
        ),
      );

      const hint = this.hydrateTypeAst(decl.typeHint.mono, {
        type: "signature",
      });
      this.unifyNode(decl, decl.binding.$type, hint);
    }

    if (decl.binding.name === "main") {
      this.unifyNode(decl.binding, decl.binding.$type, this.mainType);
    }

    if (decl.extern) {
      return;
    }

    this.unifyExpr(decl.value, decl.binding.$type, decl.value.$type);
    this.typecheckExpr(decl.value);
  }

  private typecheckPattern(pattern: TypedMatchPattern) {
    switch (pattern.type) {
      case "lit": {
        const t = inferConstant(pattern.literal);
        this.unifyNode(pattern, pattern.$type, t);
      }

      case "identifier":
        break;

      case "constructor": {
        if (pattern.$resolution === undefined) {
          return;
        }

        if (pattern.$resolution.type !== "constructor") {
          throw new Error("[unreachable] invalid resolution for constructor");
        }

        const t = instantiate(pattern.$resolution.variant.$type, {});

        if (t.type === "named") {
          this.unifyNode(pattern, t, pattern.$type);
        }

        if (t.type === "fn") {
          this.unifyNode(
            pattern,
            {
              type: "fn",
              args: t.args,
              return: pattern.$type,
            },
            t,
          );

          for (let i = 0; i < pattern.args.length && i < t.args.length; i++) {
            this.unifyNode(pattern, pattern.args[i]!.$type, t.args[i]!);
            this.typecheckPattern(pattern.args[i]!);
          }

          if (t.args.length !== pattern.args.length) {
            this.errors.push({
              range: pattern.range,
              description: new err.ArityMismatch(
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

  /**
   * TODO find decent name & descr. This one is completely random
   */
  private getGeneralizedType(
    instantiatedVarNode: ScheduledAmbiguousVarCheck["instantiatedVarNode"],

    type: Type,
    generalized: GeneralizeResult["generalized"],
  ): Type {
    const type_ = resolveType(type);
    switch (type_.type) {
      case "unbound": {
        const [trait] = type_.traits;
        if (
          trait === undefined ||
          this.ambiguousTypeVarErrorsEmitted.has(type_.id) ||
          this.errorNodesTypeVarIds.has(type_.id)
        ) {
          return type;
        }

        const genLookup = generalized.get(type_.id);
        if (genLookup === undefined) {
          this.ambiguousTypeVarErrorsEmitted.add(type_.id);
          this.errors.push({
            description: new err.AmbiguousTypeVar(
              trait,
              typeToString(instantiatedVarNode.$type),
            ),
            range: instantiatedVarNode.range,
          });
          throw new AmbiguousTypeErrHalt();
        }

        // Note that a generalized type doesn't contain flex vars
        return genLookup;
      }

      case "rigid-var":
        return type_;

      case "fn":
        return {
          ...type_,
          args: type_.args.map((arg) =>
            this.getGeneralizedType(instantiatedVarNode, arg, generalized),
          ),
          return: this.getGeneralizedType(
            instantiatedVarNode,
            type_.return,
            generalized,
          ),
        };

      case "named":
        return {
          ...type_,
          args: type_.args.map((arg) =>
            this.getGeneralizedType(instantiatedVarNode, arg, generalized),
          ),
        };

      default:
        return type_ satisfies never;
    }
  }

  private checkInstantiatedVars(
    { instantiated, instantiatedVarNode }: ScheduledAmbiguousVarCheck,
    gen: GeneralizeResult | undefined,
  ) {
    if (gen === undefined) {
      throw new Error("err: gen not found");
    }

    for (const [name, type] of instantiated) {
      try {
        const newType = this.getGeneralizedType(
          instantiatedVarNode,
          type,
          gen.generalized,
        );

        instantiatedVarNode.$instantiated.set(name, newType);
      } catch (error) {
        if (!(error instanceof AmbiguousTypeErrHalt)) {
          throw error;
        }
      }
    }

    return;
  }

  private typecheckBlockStatement(stm: TypedBlockStatement, bodyType: Type) {
    switch (stm.type) {
      case "let":
        this.typecheckPattern(stm.pattern);
        this.unifyNode(stm, stm.$type, bodyType);
        this.unifyNode(stm, stm.pattern.$type, stm.value.$type);
        this.typecheckExpr(stm.value);

        this.checkExhaustiveMatchBinding(stm.pattern);
        break;

      case "let#":
        this.unifyNode(stm, stm.mapper.$type, {
          type: "fn",
          args: [
            stm.value.$type,
            {
              type: "fn",
              args: [stm.pattern.$type],
              return: bodyType,
            },
          ],
          return: stm.$type,
        });
        this.typecheckExpr(stm.mapper);
        this.typecheckExpr(stm.value);
        this.typecheckPattern(stm.pattern);

        this.checkExhaustiveMatchBinding(stm.pattern);
        break;

      default:
        stm satisfies never;
    }
  }

  private typecheckExpr(ast: TypedExpr): void {
    switch (ast.type) {
      case "syntax-err":
        return;

      case "constant": {
        const t = inferConstant(ast.value);
        this.unifyExpr(ast, ast.$type, t);
        return;
      }

      case "list-literal": {
        const valueType = TVar.freshType();
        this.unifyExpr(ast, ast.$type, core.List(valueType));
        for (const value of ast.values) {
          this.unifyExpr(value, value.$type, valueType);
          this.typecheckExpr(value);
        }
        return;
      }

      case "struct-literal": {
        if (ast.struct.$resolution === undefined) {
          // TODO handle err
          return;
        }

        const instantiator = new Instantiator({});
        const type_ = instantiator.instantiate(
          ast.struct.$resolution.declaration.$type,
        );

        for (const field of ast.fields) {
          if (field.field.$resolution === undefined) {
            // The error was already emitted during resolution
            continue;
          }

          const fieldType = instantiator.instantiate(
            field.field.$resolution.field.$type,
          );

          this.unifyExpr(field.value, field.value.$type, fieldType);
          this.typecheckExpr(field.value);
        }

        this.checkMissingStructFields(ast, ast.struct.$resolution, type_);
        this.unifyExpr(ast, ast.$type, type_);

        if (ast.spread !== undefined) {
          this.typecheckExpr(ast.spread);
          this.unifyExpr(ast.spread, ast.spread.$type, ast.$type);
        }

        return;
      }

      case "identifier": {
        if (ast.$resolution === undefined) {
          // Error was already emitted
          // Do not narrow the identifier's type
          this.pushErrorNode(ast.$type);
          return;
        }

        this.unifyExpr(
          ast,
          ast.$type,
          this.resolutionToType(ast, ast.$resolution),
        );

        return;
      }

      case "fn":
        this.unifyExpr(ast, ast.$type, {
          type: "fn",
          args: ast.params.map((p) => {
            this.typecheckPattern(p);
            return p.$type;
          }),
          return: ast.body.$type,
        });

        this.typecheckExpr(ast.body);

        this.checkExhaustiveMatchBindings(ast.range, ast.params);

        return;

      case "application":
        this.typecheckExpr(ast.caller);
        this.unifyExpr(ast, ast.caller.$type, {
          type: "fn",
          args: ast.args.map((arg) => arg.$type),
          return: ast.$type,
        });
        for (const arg of ast.args) {
          this.typecheckExpr(arg);
        }
        return;

      case "pipe":
        this.typecheckExpr(ast.left);
        if (ast.right.type !== "application") {
          this.errors.push({
            range: ast.right.range,
            description: new err.InvalidPipe(),
          });
          return;
        }

        // NOTE: make sure we don't typecheck ast.right - as it would fail
        this.typecheckExpr(ast.right.caller);
        for (const arg of ast.right.args) {
          this.typecheckExpr(arg);
        }

        this.unifyExpr(ast, ast.right.caller.$type, {
          type: "fn",
          args: [ast.left.$type, ...ast.right.args.map((a) => a.$type)],
          return: ast.$type,
        });

        this.unifyNode(ast.right, ast.right.$type, ast.$type);
        return;

      case "field-access": {
        this.typecheckExpr(ast.struct);

        const fieldResolution = this.getFieldResolution(
          ast.field.name,
          ast.struct.$type,
        );

        if (fieldResolution === undefined) {
          this.errors.push({
            description: new err.InvalidField(
              typeToString(ast.struct.$type),
              ast.field.name,
            ),
            range: ast.field.range,
          });
          return;
        }

        ast.$resolution = fieldResolution;

        if (ast.$resolution === undefined) {
          // TODO get rid of this part of the logic
          this.scheduledFieldResolutions.push(ast);
          return;
        }

        // TODO use resolution's namespace
        this.unifyFieldAccess(ast, ast.$resolution);

        return;
      }

      case "if":
        this.unifyExpr(ast, ast.condition.$type, core.Bool);
        this.unifyExpr(ast, ast.$type, ast.then.$type);
        this.unifyExpr(ast, ast.$type, ast.else.$type);
        this.typecheckExpr(ast.condition);
        this.typecheckExpr(ast.then);
        this.typecheckExpr(ast.else);
        return;

      case "match":
        this.typecheckExpr(ast.expr);
        for (const [pattern, expr] of ast.clauses) {
          this.unifyExpr(ast, pattern.$type, ast.expr.$type);
          this.typecheckPattern(pattern);
          this.unifyExpr(ast, ast.$type, expr.$type);
          this.typecheckExpr(expr);
        }
        this.checkExhaustiveMatch(ast);
        return;

      case "block": {
        // TODO(nitpick) it feels like I made it more complex than it'd need to

        const firstStatement = ast.statements[0];
        if (firstStatement === undefined) {
          this.unifyExpr(ast, ast.$type, ast.returning.$type);
          this.typecheckExpr(ast.returning);
          return;
        }

        ast.statements.forEach((stm, index) => {
          const nextType =
            ast.statements[index + 1]?.$type ?? ast.returning.$type;
          this.typecheckBlockStatement(stm, nextType);
        });

        this.typecheckExpr(ast.returning);
        this.unifyExpr(ast, ast.$type, firstStatement.$type);
        return;
      }

      default:
        return ast satisfies never;
    }
  }

  private getFieldResolution(
    fieldName: string,
    type: Type,
  ): FieldResolution | undefined {
    const lookup = this.getTypeDecl(type);

    // definition does not exist (that shouldn't happen)
    if (lookup === undefined) {
      return undefined;
    }

    // definition is not a struct
    if (lookup.declaration.type !== "struct") {
      return undefined;
    }

    // field is private
    if (lookup.module !== this.ns && lookup.declaration.pub !== "..") {
      return undefined;
    }

    const field = lookup.declaration.fields.find(
      (field) => field.name === fieldName,
    );

    if (field === undefined) {
      return undefined;
    }

    return {
      declaration: lookup.declaration,
      field,
      namespace: lookup.module,
      package_: lookup.package_,
    };
  }

  private getTypeDecl(type: Type) {
    const res = resolveType(type);
    if (res.type === "unbound" || res.type !== "named") {
      return;
    }

    const name = res.name;
    const decl =
      res.package_ === this.package_ && res.module === this.ns
        ? this.typedModule.typeDeclarations.find((t) => t.name === name)
        : this.getDependency(res.module)?.publicTypes[name];

    if (decl === undefined) {
      return undefined;
    }

    return {
      declaration: decl,
      package_: res.package_,
      module: res.module,
    };
  }

  private checkPatternsMatrix(rng: Range, cols: PatternMatrix) {
    const [firstCol, ...otherCols] = cols;
    if (firstCol === undefined) {
      return;
    }

    // we specialize on the first
    const lookup = this.getTypeDecl(firstCol.type);
    if (lookup === undefined) {
      // undefined decl: error has alreay beed emitted
      return;
    }

    switch (lookup.declaration.type) {
      case "adt": {
        for (const variantDefinition of lookup.declaration.variants) {
          // TODO attach types directly on type AST
          const argsTypes = getVariantArgs(variantDefinition);
          if (argsTypes === undefined) {
            return;
          }

          const [matchingCtors, usedRows, ok] = getMatchingCtors(
            variantDefinition,
            firstCol.patterns,
          );

          if (!ok) {
            this.errors.push({
              description: new err.NonExhaustiveMatch(),
              range: rng,
            });
          }

          const specializedMatrix: PatternMatrix = [
            ...matchingCtors,
            ...otherCols.map((col) => ({
              type: col.type,
              patterns: col.patterns.filter((_p, index) => usedRows.has(index)),
            })),
          ];

          // we have produced the new matrix specialized on this ctor: we proceed with the check there
          this.checkPatternsMatrix(rng, specializedMatrix);
        }

        return;
      }

      case "extern": {
        // we'll assume it's never possible to do exhaustive pattern matching on any extern value
        // this is not quite accurate: for example, we could indeed pattern match exhaustively a Char.
        // for the sake of simplicity, we won't allow that for now

        const wildCardCols = new Set<number>();
        const groups = new DefaultMap<string, Set<number>>(() => new Set());
        firstCol.patterns.forEach((pat, rowIndex) => {
          if (pat.type === "identifier") {
            wildCardCols.add(rowIndex);
          } else if (pat.type === "lit") {
            const lit = pat.literal.value.toString();
            groups.get(lit).add(rowIndex);
          }
        });

        const hasWildcard = wildCardCols.size !== 0;
        if (!hasWildcard) {
          this.errors.push({
            description: new err.NonExhaustiveMatch(),
            range: rng,
          });
          return;
        }

        for (const usedRows of groups.inner.values()) {
          const specializedMatrix: PatternMatrix = [
            ...otherCols.map((col) => ({
              type: col.type,
              patterns: col.patterns.filter((_p, index) => usedRows.has(index)),
            })),
          ];

          this.checkPatternsMatrix(rng, specializedMatrix);
        }

        const specializedMatrix: PatternMatrix = [
          ...otherCols.map((col) => ({
            type: col.type,
            patterns: col.patterns.filter((_p, index) =>
              wildCardCols.has(index),
            ),
          })),
        ];
        this.checkPatternsMatrix(rng, specializedMatrix);

        return;
      }

      case "struct":
        // we won't check this, as it's not possible yet to perform pattern match on structs
        return;

      default:
        lookup.declaration satisfies never;
    }
  }

  private checkExhaustiveMatch(expr: TypedExpr & { type: "match" }) {
    try {
      this.checkPatternsMatrix(expr.range, [
        {
          type: expr.expr.$type,
          patterns: expr.clauses.map(([pat]) => pat),
        },
      ]);
    } catch (error) {
      if (!(error instanceof MalformedPatternErr)) {
        throw error;
      }
    }
  }

  private checkExhaustiveMatchBinding(expr: TypedMatchPattern) {
    try {
      this.checkPatternsMatrix(expr.range, [
        { type: expr.$type, patterns: [expr] },
      ]);
    } catch (error) {
      if (!(error instanceof MalformedPatternErr)) {
        throw error;
      }
    }
  }

  private checkExhaustiveMatchBindings(
    rng: Range,
    params: TypedMatchPattern[],
  ) {
    try {
      this.checkPatternsMatrix(
        rng,
        params.map((param) => ({
          type: param.$type,
          patterns: [param],
        })),
      );
    } catch (error) {
      if (!(error instanceof MalformedPatternErr)) {
        throw error;
      }
    }
  }

  private unifyNode(ast: RangeMeta, t1: Type, t2: Type) {
    const e = unify(t1, t2, this.store);
    if (e === undefined) {
      return;
    }
    this.pushErrorNode(t1);
    this.pushErrorNode(t2);

    this.errors.push(
      castUnifyErr(ast, e, this.currentDeclaration!.$traitsConstraints),
    );
  }

  private unifyFieldAccess(
    ast: TypedExpr & { type: "field-access" },
    resolution: FieldResolution,
  ) {
    const instantiator = new Instantiator({});

    const structType: Type = instantiator.instantiate(
      resolution.declaration.$type,
    );
    this.unifyExpr(ast.struct, ast.struct.$type, structType);
    const fieldType = instantiator.instantiate(resolution.field.$type);
    this.unifyExpr(ast, ast.$type, fieldType);
  }

  private checkMissingStructFields(
    ast: TypedExpr & { type: "struct-literal" },
    resolution: StructResolution,
    type: Type,
  ) {
    if (ast.spread !== undefined) {
      return;
    }

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
        description: new err.MissingRequiredFields(
          typeToString(type),
          missingFields,
        ),
        range: ast.struct.range,
      });
    }
  }

  private doubleCheckFieldAccess(
    fieldAccessAst: TypedExpr & { type: "field-access" },
    resolved: TypeResolution,
  ) {
    const emitErr = () => {
      this.errors.push({
        range: fieldAccessAst.field.range,
        description: new err.InvalidField(
          typeToString(fieldAccessAst.struct.$type),
          fieldAccessAst.field.name,
        ),
      });
    };

    switch (resolved.type) {
      case "named": {
        if (resolved.module === this.ns) {
          // we already looked up the fields in this module's structs
          emitErr();
          return;
        }

        const mod = this.getDependency(resolved.module);
        if (mod === undefined) {
          throw new Error("TODO handle invalid mod");
        }

        const fieldLookup = mod.publicFields[fieldAccessAst.field.name];
        if (fieldLookup !== undefined) {
          // Found the field. Re-run unification
          this.unifyFieldAccess(fieldAccessAst, fieldLookup);
          return;
        }

        // we already know this field does not exist in this module
        emitErr();
        return;
      }

      case "unbound":
        if (fieldAccessAst.field.structName === undefined) {
          emitErr();
        }

        return;

      case "rigid-var":
      case "fn":
        throw new Error("TODO handle field access to fn");
    }
  }

  private resolutionToType(
    ast: TypedExpr & { type: "identifier" },
    resolution: IdentifierResolution,
  ): Type {
    switch (resolution.type) {
      case "local-variable":
        return resolution.binding.$type;

      case "constructor":
        return instantiate(resolution.variant.$type, {});

      case "global-variable": {
        const instantiator = new Instantiator(
          resolution.declaration.$traitsConstraints,
        );

        if (this.currentRecGroup.has(resolution.declaration)) {
          return resolution.declaration.binding.$type;
        }

        const type = instantiator.instantiate(
          resolution.declaration.binding.$type,
        );

        this.scheduledAmbiguousVarChecks.push({
          instantiated: instantiator.instantiatedRigid.inner,
          instantiatedVarNode: ast,
          currentDeclaration: this.currentDeclaration!,
        });

        return type;
      }

      default:
        return resolution satisfies never;
    }
  }

  private hydrateTypeAst(
    ast: TypedTypeAst,
    ctx: { type: "signature" } | { type: "typedef"; params: string[] },
  ): Type {
    switch (ast.type) {
      case "any":
        if (ctx.type === "typedef") {
          this.errors.push({
            range: ast.range,
            description: new err.InvalidCatchall(),
          });
        }
        return TVar.freshType();
      case "var":
        if (ctx.type === "typedef" && !ctx.params.includes(ast.ident)) {
          this.errors.push({
            range: ast.range,
            description: new err.UnboundTypeParam(ast.ident),
          });
          return TVar.freshType();
        }

        return { type: "rigid-var", name: ast.ident };
      case "fn":
        return {
          type: "fn",
          args: ast.args.map((a) => this.hydrateTypeAst(a, ctx)),
          return: this.hydrateTypeAst(ast.return, ctx),
        };
      case "named": {
        const resolution = ast.$resolution;
        if (resolution === undefined) {
          return TVar.freshType();
        }

        if (resolution.declaration.params.length !== ast.args.length) {
          this.errors.push({
            range: ast.range,
            description: new err.InvalidTypeArity(
              resolution.declaration.name,
              resolution.declaration.params.length,
              ast.args.length,
            ),
          });
        }

        return {
          type: "named",
          module: resolution.namespace,
          package_: resolution.package_,
          name: ast.name,
          args: ast.args.map((a) => this.hydrateTypeAst(a, ctx)),
        };
      }
    }
  }
}

function inferConstant(x: ConstLiteral): Type {
  switch (x.type) {
    case "int":
      return core.Int;

    case "float":
      return core.Float;

    case "string":
      return core.String;

    case "char":
      return core.Char;

    default:
      return x satisfies never;
  }
}

function topSortedModules(
  project: UntypedProject,
  implicitImports: Import[] = defaultImports,
): string[] {
  const implNsImports = implicitImports.map((i) => i.ns);

  const dependencyGraph: Record<string, string[]> = {};
  for (const [ns, { package: package_, module }] of Object.entries(project)) {
    const deps =
      package_ === core.CORE_PACKAGE
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
  implicitImports: Import[] = defaultImports,
  mainType = DEFAULT_MAIN_TYPE,
): ProjectTypeCheckResult {
  const sortedModules = topSortedModules(project, implicitImports);

  const projectResult: ProjectTypeCheckResult = {};
  const deps: Deps = {};
  for (const ns of sortedModules) {
    const m = project[ns];
    if (m === undefined) {
      // A module might import a module that do not exist
      continue;
    }
    const [typedModule, errors] = typecheck(m.package, ns, m.module, {
      mainType,
      getDependency: (ns) => deps[ns],
      implicitImports: m.package === core.CORE_PACKAGE ? [] : implicitImports,
    });
    projectResult[ns] = { typedModule, errors, package: m.package };
    deps[ns] = typedModule.moduleInterface;
  }

  return projectResult;
}

export type TypecheckedModule = {
  package: string;
  typedModule: TypedModule;
  errors: err.ErrorInfo[];
};

export type ProjectTypeCheckResult = Record<string, TypecheckedModule>;

function castUnifyErr(
  node: RangeMeta,
  e: UnifyError,
  rigidVarsCtx: RigidVarsCtx,
): err.ErrorInfo {
  switch (e.type) {
    case "missing-trait":
      return {
        range: node.range,
        description: new err.TraitNotSatified(
          typeToString(e.type_, rigidVarsCtx),
          e.trait,
        ),
      };

    case "type-mismatch":
      return {
        range: node.range,
        description: new err.TypeMismatch(e.left, e.right),
      };
    case "occurs-check":
      return { range: node.range, description: new err.OccursCheck() };
  }
}

type TraitDependencies = {
  rigid: Set<string>;
  flexible: Set<number>;
};

/**
 * e.g.
 * ```kestrel
 * impl Show for T<x, y> where y: Show { .. }
 * ```
 * is represented as the `Set([1])` set (where the elems are the index of type params)
 */
export function getTraitDependencies(
  type: Type,
  namedDependency: (
    package_: string,
    module: string,
    named: string,
  ) => Set<number>,
): TraitDependencies | undefined {
  let deps: TraitDependencies | undefined = {
    flexible: new Set(),
    rigid: new Set(),
  };

  function recur(type: Type) {
    if (deps === undefined) {
      return;
    }

    const resolved = resolveType(type);

    switch (resolved.type) {
      case "named": {
        const deps = namedDependency(
          resolved.package_,
          resolved.module,
          resolved.name,
        );

        for (const paramIndex of deps) {
          const dependency = resolved.args[paramIndex];
          if (dependency === undefined) {
            throw new Error(
              "[unreachable] bad index in dependency representation",
            );
          }

          recur(dependency);
        }

        return;
      }

      case "fn":
        // Fn never derives
        deps = undefined;
        return;

      case "rigid-var":
        deps.rigid.add(resolved.name);
        return;

      case "unbound":
        // TODO maybe we need to check if trait is present here?
        // resolved.traits;
        throw new Error("TODO no idea what this means");
    }
  }

  recur(type);

  return deps;
}

function mkDepsFor(
  /* &mut */ out: DefaultMap<string, Set<string>>,

  type_: Type,
  trait: string,
  store: Pick<TraitsStore, "getNamedTypeDependencies">,

  def: Type,
): boolean {
  switch (type_.type) {
    case "rigid-var":
      out.get(type_.name).add(trait);
      return true;

    case "fn":
      return false;

    case "named": {
      if (
        def.type === "named" &&
        type_.package_ === def.package_ &&
        type_.module === def.module &&
        type_.name === def.name
      ) {
        // recursive def: no deps
        return true;
      }

      const neededArgs = store.getNamedTypeDependencies(type_, trait);
      if (neededArgs === undefined) {
        return false;
      }

      for (let argIndex = 0; argIndex < type_.args.length; argIndex++) {
        const arg = type_.args[argIndex]!;

        const neededArg = neededArgs[argIndex];
        if (neededArg === undefined) {
          continue;
        }
        for (const neededTrait of neededArg) {
          const ok = mkDepsFor(out, arg, neededTrait, store, def);
          if (!ok) {
            return false;
          }
        }
      }

      return true;
    }

    case "var":
      return false;
  }
}

type PatternMatrix = {
  type: Type;
  patterns: TypedMatchPattern[];
}[];

function getVariantArgs(variant: TypedTypeVariant) {
  if (variant.args.length === 0) {
    return [];
  }

  const t = variant.$type;
  if (t.type !== "fn") {
    return undefined;
  }

  return t.args;
}

// TODO remove
/**
 * temporary hack to short-circuit exhaustive pattern detection. Refactor the pattern error code instead
 */
class MalformedPatternErr extends Error {}

/**
 * Given a variant definition, find all the patterns in the first row that are instances of that ctor.
 * Also returns the rowIndex of the original matrix
 * e.g.
 *
 * ```kestrel
 * getMatchingCtors(Just, [Just(a, b), None, Other, Just(1, 2)])
 * //=> [(a, b), (1, 2)]
 * ```
 * */
function getMatchingCtors(
  variantDefinition: TypedTypeVariant,
  col: PatternMatrix[number]["patterns"],
) {
  const keptRows = new Set<number>();

  /** 0-n columns (depending on the number of args) */
  const newColumns: PatternMatrix = variantDefinition.args.map(() => ({
    type: TVar.freshType(),
    patterns: [],
  }));

  const argsTypes = getVariantArgs(variantDefinition);
  if (argsTypes === undefined) {
    return [newColumns, keptRows, true] as const;
  }

  let foundCol = false;

  col.forEach((pattern, index) => {
    // -- wildcard
    if (pattern.type === "identifier") {
      foundCol = true;
      keptRows.add(index);
      newColumns.forEach((newCol) => {
        newCol.patterns.push(pattern);
      });
      return;
    }

    // -- ctor
    const matching =
      pattern.type === "constructor" &&
      pattern.$resolution !== undefined &&
      pattern.$resolution.type === "constructor" &&
      pattern.$resolution.variant.name === variantDefinition.name;
    if (!matching) {
      return;
    }

    foundCol = true;
    keptRows.add(index);
    newColumns.forEach((newCol, newColIndex) => {
      const subPattern = pattern.args[newColIndex];
      if (subPattern === undefined) {
        throw new MalformedPatternErr();
      }

      if (index === 0) {
        newCol.type = subPattern.$type;
      }

      newCol.patterns.push(subPattern);
    });
  });

  return [newColumns, keptRows, foundCol] as const;
}

// Hack to short-circuit
class AmbiguousTypeErrHalt extends Error {}
