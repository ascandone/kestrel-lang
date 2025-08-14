import {
  ConstLiteral,
  RangeMeta,
  Import,
  UntypedModule,
  TypeDeclaration,
} from "../parser";
import {
  FieldResolution,
  IdentifierResolution,
  StructResolution,
  TypeMeta,
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
  generalizeAsScheme,
  instantiateFromScheme,
  TypeScheme,
  PolyType,
  TraitImplDependency,
  TVarResolution,
  Instantiator,
  typeToString,
  findUnboundTypeVars,
  ConcreteType,
} from "../type";
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
} from "./errors";
import * as err from "./errors";
import { Deps, resolve } from "./resolution";
import { topologicalSort } from "../utils/topsort";
export { Deps } from "./resolution";

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
  package_: string,
  ns: string,
  module: UntypedModule,
  deps: Deps = {},
  implicitImports: Import[] = defaultImports,
  mainType = DEFAULT_MAIN_TYPE,
): [TypedModule, ErrorInfo[]] {
  return new Typechecker(package_, ns, mainType).run(
    module,
    deps,
    implicitImports,
  );
}

type ScheduledAmbiguousVarCheck = {
  currentDeclaration: Type;
  instantiatedVarNode: { name: string } & TypeMeta & RangeMeta;
};

class Typechecker {
  private errors: ErrorInfo[] = [];
  private scheduledFieldResolutions: (TypedExpr & { type: "field-access" })[] =
    [];

  /** ids of the fresh variables created due to typechecking error */
  private errorNodesTypeVarIds = new Set<number>();

  private ambiguousTypeVarErrorsEmitted = new Set<number>();

  private currentDeclaration: Type | undefined;

  private scheduledAmbiguousVarChecks: ScheduledAmbiguousVarCheck[] = [];

  constructor(
    private readonly package_: string,
    private ns: string,
    private mainType: Type,
  ) {}

  private pushErrorNode(ast: TypeMeta) {
    const resolved = ast.$type.resolve();
    if (resolved.type === "unbound") {
      this.errorNodesTypeVarIds.add(resolved.id);
    }
  }

  private adtDerive(
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
      const resolved = variant.$type.resolve();
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
            const name = variant.$scheme[id];
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

  private structDerive(
    trait: string,
    typeDecl: TypedTypeDeclaration & { type: "struct" },
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

    for (const field of typeDecl.fields) {
      const impl = TVar.typeImplementsTrait(field.$type.asType(), trait);
      if (impl === undefined) {
        TVar.removeTraitImpl(this.ns, typeDecl.name, trait);
        return;
      }

      for (const { id } of impl) {
        const name = field.$scheme[id];
        if (name !== undefined) {
          depParams.add(name);
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
    implicitImports: Import[] = defaultImports,
  ): [TypedModule, ErrorInfo[]] {
    TVar.resetId();

    const { typedModule, errors, mutuallyRecursiveBindings } = resolve(
      this.package_,
      this.ns,
      deps,
      module,
      implicitImports,
    );

    this.errors = errors;

    for (const typeDecl of typedModule.typeDeclarations) {
      if (typeDecl.type === "adt") {
        for (const variant of typeDecl.variants) {
          const [scheme, mono] = this.makeVariantType(typeDecl, variant);
          variant.$scheme = scheme;
          const err = unify(variant.$type.asType(), mono);
          if (err !== undefined) {
            throw new Error("[unreachable] adt type should be fresh initially");
          }
        }

        this.adtDerive("Eq", typeDecl);
        this.adtDerive("Show", typeDecl);
      } else if (typeDecl.type === "struct") {
        this.makeStructType(typeDecl);
        this.structDerive("Eq", typeDecl);
        this.structDerive("Show", typeDecl);
      }
    }

    for (const group of mutuallyRecursiveBindings) {
      // TODO something's not right here (we should generalize the whole group after the typecheck pass)
      for (const decl of group) {
        this.currentDeclaration = decl.binding.$type.asType();
        this.typecheckAnnotatedDecl(decl);

        for (const check of this.scheduledAmbiguousVarChecks) {
          this.checkInstantiatedVars(decl.$scheme, check);
        }
        this.scheduledAmbiguousVarChecks = [];
      }
    }

    for (const fieldAccessAst of this.scheduledFieldResolutions) {
      this.doubleCheckFieldAccess(
        fieldAccessAst,
        fieldAccessAst.struct.$type.resolve(),
        deps,
      );
    }

    return [typedModule, this.errors];
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
      package_: this.package_,
      module: this.ns,
      name: typeDecl.name,
      args: generics.map(([, tvar]) => tvar.asType()),
    };

    unify(typeDecl.$type.asType(), mono);

    typeDecl.$scheme = scheme;

    for (const field of typeDecl.fields) {
      const bound: Record<string, TVar> = Object.fromEntries(
        generics.map(([p, t]) => [p, t]),
      );

      const fieldType = this.typeAstToType(
        field.typeAst,
        { type: "constructor-arg", params: typeDecl.params.map((p) => p.name) }, // TODO params
        bound,
        {}, // TODO traits
      );

      unify(fieldType, field.$type.asType()); // Do not change args order

      field.$scheme = scheme;
    }
  }

  private makeVariantType(
    typeDecl: TypeDeclaration & { type: "adt" },
    variant: TypedTypeVariant,
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
      package_: this.package_,
      module: this.ns,
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
        const { start } = ast.args[e.left.args.length]!.range;
        const { end } = ast.args.at(-1)!.range;

        this.errors.push({
          range: { start, end },
          description: new ArityMismatch(
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
          description: new ArityMismatch(
            e.left.args.length,
            e.right.args.length,
          ),
        });

        return;
      }

      this.errors.push({
        range: ast.range,
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
        if (ast.$resolution === undefined) {
          return TVar.fresh().asType();
        }

        const expectedArity = ast.$resolution.declaration.params.length,
          actualArity = ast.args.length;

        if (expectedArity !== actualArity) {
          this.errors.push({
            range: ast.range,
            description: new InvalidTypeArity(
              ast.name,
              expectedArity,
              actualArity,
            ),
          });
        }

        return {
          type: "named",
          package_: ast.$resolution.package_,
          module: ast.$resolution.namespace,
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
            range: ast.range,
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
            range: ast.range,
            description: new InvalidCatchall(),
          });
        }
        return { type: "var", var: TVar.fresh() };
    }
  }

  private typecheckAnnotatedDecl(decl: TypedDeclaration) {
    if (decl.typeHint !== undefined) {
      const hint = this.hydrateType(decl.typeHint.mono);
      this.unifyNode(decl, decl.binding.$type.asType(), hint);
    }

    if (decl.binding.name === "main") {
      this.unifyNode(decl.binding, decl.binding.$type.asType(), this.mainType);
    }

    if (decl.extern) {
      return;
    }

    this.typecheckAnnotatedExpr(decl.value);
    this.unifyExpr(
      decl.value,
      decl.binding.$type.asType(),
      decl.value.$type.asType(),
    );

    decl.$scheme = generalizeAsScheme(decl.value.$type.asType());
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
            range: pattern.range,
          });
        }
        const t = inferConstant(pattern.literal);
        this.unifyNode(pattern, pattern.$type.asType(), t);
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

        if (
          forceExhaustive &&
          pattern.$resolution.declaration.variants.length > 1
        ) {
          this.errors.push({
            range: pattern.range,
            description: new NonExhaustiveMatch(),
          });
        }

        const t = instantiateFromScheme(
          pattern.$resolution.variant.$type.asType(),
          pattern.$resolution.variant.$scheme,
        );

        if (t.type === "named") {
          this.unifyNode(pattern, t, pattern.$type.asType());
        }

        if (t.type === "fn") {
          this.unifyNode(
            pattern,
            {
              type: "fn",
              args: t.args,
              return: pattern.$type.asType(),
            },
            t,
          );

          for (let i = 0; i < pattern.args.length && i < t.args.length; i++) {
            this.unifyNode(
              pattern,
              pattern.args[i]!.$type.asType(),
              t.args[i]!,
            );
            this.typecheckPattern(pattern.args[i]!, forceExhaustive);
          }

          if (t.args.length !== pattern.args.length) {
            this.errors.push({
              range: pattern.range,
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
    { instantiatedVarNode, currentDeclaration }: ScheduledAmbiguousVarCheck,
  ) {
    const bindingUnboundTypes = new Set<number>(
      findUnboundTypeVars(currentDeclaration).map((v) => v.id),
    );

    const instantiatedVarUnboundTypes = findUnboundTypeVars(
      instantiatedVarNode.$type.asType(),
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
        range: instantiatedVarNode.range,
        description: new AmbiguousTypeVar(
          instantiatedVarType.traits[0]!,
          typeToString(instantiatedVarNode.$type.asType(), scheme),
        ),
      });

      // TODO do I have to break the loop here? double check
      return;
    }
  }

  private typecheckAnnotatedBlockStatement(
    stm: TypedBlockStatement,
    bodyType: Type,
  ) {
    switch (stm.type) {
      case "let":
        this.typecheckPattern(stm.pattern, true);
        this.unifyNode(stm, stm.$type.asType(), bodyType);
        this.unifyNode(
          stm,
          stm.pattern.$type.asType(),
          stm.value.$type.asType(),
        );
        this.typecheckAnnotatedExpr(stm.value);
        break;

      case "let#":
        this.unifyNode(stm, stm.mapper.$type.asType(), {
          type: "fn",
          args: [
            stm.value.$type.asType(),
            {
              type: "fn",
              args: [stm.pattern.$type.asType()],
              return: bodyType,
            },
          ],
          return: stm.$type.asType(),
        });
        this.typecheckAnnotatedExpr(stm.mapper);
        this.typecheckAnnotatedExpr(stm.value);
        this.typecheckPattern(stm.pattern, true);
        break;

      default:
        stm satisfies never;
    }
  }

  private typecheckAnnotatedExpr(ast: TypedExpr): void {
    switch (ast.type) {
      case "syntax-err":
        return;

      case "constant": {
        const t = inferConstant(ast.value);
        this.unifyExpr(ast, ast.$type.asType(), t);
        return;
      }

      case "list-literal": {
        const valueType = TVar.fresh().asType();
        this.unifyExpr(ast, ast.$type.asType(), List(valueType));
        for (const value of ast.values) {
          this.unifyExpr(value, value.$type.asType(), valueType);
          this.typecheckAnnotatedExpr(value);
        }
        return;
      }

      case "struct-literal": {
        if (ast.struct.$resolution === undefined) {
          // TODO handle err
          return;
        }

        const instantiator = new Instantiator();
        const type_ = instantiator.instantiatePoly(
          ast.struct.$resolution.declaration,
        );

        for (const field of ast.fields) {
          if (field.field.$resolution === undefined) {
            // The error was already emitted during resolution
            continue;
          }

          const fieldType = instantiator.instantiatePoly(
            field.field.$resolution.field,
          );

          this.unifyExpr(field.value, field.value.$type.asType(), fieldType);
          this.typecheckAnnotatedExpr(field.value);
        }

        this.checkMissingStructFields(ast, ast.struct.$resolution, type_);
        this.unifyExpr(ast, ast.$type.asType(), type_);

        if (ast.spread !== undefined) {
          this.typecheckAnnotatedExpr(ast.spread);
          this.unifyExpr(
            ast.spread,
            ast.spread.$type.asType(),
            ast.$type.asType(),
          );
        }

        return;
      }

      case "identifier": {
        if (ast.$resolution === undefined) {
          // Error was already emitted
          // Do not narrow the identifier's type
          this.pushErrorNode(ast);
          return;
        }

        this.unifyExpr(
          ast,
          ast.$type.asType(),
          resolutionToType(ast, ast.$resolution),
        );

        if (this.currentDeclaration === undefined) {
          throw new Error("[unreachable] no current declaration");
        }
        this.scheduledAmbiguousVarChecks.push({
          instantiatedVarNode: ast,
          currentDeclaration: this.currentDeclaration,
        });

        return;
      }

      case "fn":
        this.unifyExpr(ast, ast.$type.asType(), {
          type: "fn",
          args: ast.params.map((p) => {
            this.typecheckPattern(p, true);
            return p.$type.asType();
          }),
          return: ast.body.$type.asType(),
        });

        this.typecheckAnnotatedExpr(ast.body);
        return;

      case "application":
        this.typecheckAnnotatedExpr(ast.caller);
        this.unifyExpr(ast, ast.caller.$type.asType(), {
          type: "fn",
          args: ast.args.map((arg) => arg.$type.asType()),
          return: ast.$type.asType(),
        });
        for (const arg of ast.args) {
          this.typecheckAnnotatedExpr(arg);
        }
        return;

      case "field-access": {
        this.typecheckAnnotatedExpr(ast.struct);
        if (ast.$resolution === undefined) {
          this.scheduledFieldResolutions.push(ast);
          return;
        }

        // TODO use resolution's namespace
        this.unifyFieldAccess(ast, ast.$resolution);

        return;
      }

      case "if":
        this.unifyExpr(ast, ast.condition.$type.asType(), Bool);
        this.unifyExpr(ast, ast.$type.asType(), ast.then.$type.asType());
        this.unifyExpr(ast, ast.$type.asType(), ast.else.$type.asType());
        this.typecheckAnnotatedExpr(ast.condition);
        this.typecheckAnnotatedExpr(ast.then);
        this.typecheckAnnotatedExpr(ast.else);
        return;

      case "match":
        this.typecheckAnnotatedExpr(ast.expr);
        for (const [pattern, expr] of ast.clauses) {
          this.unifyExpr(ast, pattern.$type.asType(), ast.expr.$type.asType());
          this.typecheckPattern(pattern);
          this.unifyExpr(ast, ast.$type.asType(), expr.$type.asType());
          this.typecheckAnnotatedExpr(expr);
        }
        return;

      case "block": {
        // TODO(nitpick) it feels like I made it more complex than it'd need to

        const firstStatement = ast.statements[0];
        if (firstStatement === undefined) {
          this.unifyExpr(ast, ast.$type.asType(), ast.returning.$type.asType());
          this.typecheckAnnotatedExpr(ast.returning);
          return;
        }

        ast.statements.forEach((stm, index) => {
          const nextType =
            ast.statements[index + 1]?.$type.asType() ??
            ast.returning.$type.asType();
          this.typecheckAnnotatedBlockStatement(stm, nextType);
        });

        this.typecheckAnnotatedExpr(ast.returning);
        this.unifyExpr(ast, ast.$type.asType(), firstStatement.$type.asType());
        return;
      }

      default:
        return ast satisfies never;
    }
  }

  private unifyNode(ast: RangeMeta, t1: Type, t2: Type) {
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
    this.unifyExpr(ast.struct, ast.struct.$type.asType(), structType);
    const fieldType = instantiator.instantiatePoly(resolution.field);
    this.unifyExpr(ast, ast.$type.asType(), fieldType);
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
        description: new MissingRequiredFields(
          typeToString(type),
          missingFields,
        ),
        range: ast.struct.range,
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
        range: fieldAccessAst.field.range,
        description: new InvalidField(
          typeToString(fieldAccessAst.struct.$type.asType()),
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

        if (resolved.value.module === this.ns) {
          // we already looked up the fields in this module's structs
          emitErr();
          return;
        }

        const mod = deps[resolved.value.module];
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
    }
  }

  private hydrateType(ast: TypedTypeAst): Type {
    switch (ast.type) {
      case "any":
        return TVar.fresh().asType();
      case "var":
        return { type: "rigid-var", name: ast.ident };
      case "fn":
        return {
          type: "fn",
          args: ast.args.map((a) => this.hydrateType(a)),
          return: this.hydrateType(ast.return),
        };
      case "named": {
        const resolution = ast.$resolution;
        if (resolution === undefined) {
          return TVar.fresh().asType();
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
          args: ast.args.map((a) => this.hydrateType(a)),
        };
      }
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

export const CORE_PACKAGE = "kestrel_core";

function topSortedModules(
  project: UntypedProject,
  implicitImports: Import[] = defaultImports,
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
  implicitImports: Import[] = defaultImports,
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
      m.package,
      ns,
      m.module,
      deps,
      m.package === CORE_PACKAGE ? [] : implicitImports,
      mainType,
    );
    projectResult[ns] = { typedModule, errors, package: m.package };
    deps[ns] = typedModule.moduleInterface;
  }

  return projectResult;
}

export type TypecheckedModule = {
  package: string;
  typedModule: TypedModule;
  errors: ErrorInfo[];
};

export type ProjectTypeCheckResult = Record<string, TypecheckedModule>;

function unifyErr(node: RangeMeta, e: UnifyError): ErrorInfo {
  switch (e.type) {
    case "missing-trait":
      return {
        range: node.range,
        description: new TraitNotSatified(e.type_, e.trait),
      };

    case "type-mismatch":
      return {
        range: node.range,
        description: new TypeMismatch(e.left, e.right),
      };
    case "occurs-check":
      return { range: node.range, description: new OccursCheck() };
  }
}

function resolutionToType(
  ast: TypedExpr & { type: "identifier" },
  resolution: IdentifierResolution,
): Type {
  switch (resolution.type) {
    case "local-variable":
      return resolution.binding.$type.asType();

    case "global-variable": {
      const instantiator = new Instantiator();

      const type = instantiator.instantiateFromScheme(
        resolution.declaration.binding.$type.asType(),
        resolution.declaration.$scheme,
      );

      // TODO we should schedule here the ambiguous check
      ast.$instantiated = instantiator.instantiated;

      return type;
    }

    case "constructor":
      return instantiateFromScheme(
        resolution.variant.$type.asType(),
        resolution.variant.$scheme,
      );

    // TODO should struct go here?
  }
}

// Keep this in sync with core
const Bool: ConcreteType = {
  type: "named",
  package_: CORE_PACKAGE,
  module: "Bool",
  name: "Bool",
  args: [],
};

const Int: ConcreteType = {
  type: "named",
  package_: CORE_PACKAGE,
  module: "Int",
  name: "Int",
  args: [],
};

const Float: ConcreteType = {
  type: "named",
  package_: CORE_PACKAGE,
  module: "Float",
  name: "Float",
  args: [],
};

const String: ConcreteType = {
  type: "named",
  package_: CORE_PACKAGE,
  module: "String",
  name: "String",
  args: [],
};

const Char: ConcreteType = {
  type: "named",
  package_: CORE_PACKAGE,
  module: "Char",
  name: "Char",
  args: [],
};

const Unit: ConcreteType = {
  type: "named",
  package_: CORE_PACKAGE,
  module: "Tuple",
  name: "Unit",
  args: [],
};

const List = (a: Type): ConcreteType => ({
  type: "named",
  package_: CORE_PACKAGE,
  module: "List",
  name: "List",
  args: [a],
});

function Task(arg: Type): ConcreteType {
  return {
    type: "named",
    package_: CORE_PACKAGE,
    module: "Task",
    name: "Task",
    args: [arg],
  };
}

export const DEFAULT_MAIN_TYPE = Task(Unit);
