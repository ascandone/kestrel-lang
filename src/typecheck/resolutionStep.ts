import {
  MatchPattern,
  Range,
  RangeMeta,
  TypeAst,
  Expr,
  Import,
  UntypedModule,
  TypeDeclaration,
  Declaration,
} from "../parser";
import {
  FieldResolution,
  IdentifierResolution,
  ModuleInterface,
  StructResolution,
  TypeResolution,
  TypedBinding,
  TypedDeclaration,
  TypedExposedValue,
  TypedExpr,
  TypedImport,
  TypedMatchPattern,
  TypedModule,
  TypedStructDeclarationField,
  TypedStructField,
  TypedTypeAst,
  TypedTypeDeclaration,
} from "./typedAst";
import { defaultImports } from "./defaultImports";
import { TVar } from "./type";
import { ErrorInfo } from "../errors";
import * as err from "../errors";
import { FramesStack } from "./frame";
import { Annotator } from "./Annotator";
import { Visitor } from "./visitor";

// Record from namespace (e.g. "A.B.C" ) to the module
export type Deps = Record<string, ModuleInterface>;

export function castAst(
  ns: string,
  module: UntypedModule,
  deps: Deps = {},
  implicitImports: Import[] = defaultImports,
): [TypedModule, ErrorInfo[]] {
  return new ResolutionStep__refactor(ns, deps).run(module, implicitImports);
}

class LocalFrames {
  // TODO remove stack, use single map instead

  /** The previous values */
  private readonly stack: Array<Map<string, IdentifierResolution | undefined>> =
    [];

  constructor(
    private readonly valuesResolution: Map<string, IdentifierResolution>,
  ) {}

  public enter() {
    const previous = new Map<string, IdentifierResolution>();
    this.stack.push(previous);

    return () => {
      for (const [key, previousValue] of previous.entries()) {
        if (previousValue === undefined) {
          this.valuesResolution.delete(key);
        } else {
          this.valuesResolution.set(key, previousValue);
        }
      }
    };
  }

  public register(binding: TypedBinding) {
    const currentScope = this.stack.at(-1);
    if (currentScope === undefined) {
      throw new Error("[unreachable] empty stack");
    }

    const previousValue = this.valuesResolution.get(binding.name);
    currentScope.set(binding.name, previousValue);

    this.valuesResolution.set(binding.name, {
      type: "local-variable",
      binding,
    });
  }
}

// TODO remove this err
class UnimplementedErr extends Error {}

class ResolutionStep__refactor extends Visitor {
  private errors: ErrorInfo[] = [];

  // scope
  private importedTypes = new Map<string, TypeResolution>();
  private moduleTypes = new Map<string, TypeResolution>();

  private importedValues = new Map<
    string,
    IdentifierResolution & { type: "constructor" | "global-variable" }
  >();
  private moduleValues = new Map<
    string,
    IdentifierResolution & { type: "constructor" | "global-variable" }
  >();
  private localValues = new Map<string, IdentifierResolution>();
  private localFrames = new LocalFrames(this.localValues);

  // unused checks
  private unusedLocals = new Set<TypedBinding>();
  private unusedGlobals = new Set<TypedDeclaration>();
  // private unusedImports = new Set<TypedImport>();
  // private unusedExposing = new Set<TypedExposedValue>();

  constructor(
    private readonly ns: string,
    private readonly deps: Deps,
  ) {
    super();
  }

  private loadOpenTypeDeclaration(
    typeDeclaration: TypedTypeDeclaration,
    namespace: string,
  ) {
    switch (typeDeclaration.type) {
      case "adt":
        for (const variant of typeDeclaration.variants) {
          this.importedValues.set(variant.name, {
            type: "constructor",
            declaration: typeDeclaration,
            variant: variant,
            namespace,
          });
        }
        break;

      case "struct":
        throw new UnimplementedErr("impl resolve struct");
        break;
    }
  }

  private loadTypeImport(
    moduleInterface: ModuleInterface,
    exposing: TypedExposedValue & { type: "type" },
  ) {
    const typeDeclaration = moduleInterface.publicTypes[exposing.name];
    if (typeDeclaration === undefined) {
      throw new UnimplementedErr("imported type not found");
    }

    exposing.$resolution = typeDeclaration;

    if (this.importedTypes.has(typeDeclaration.name)) {
      throw new UnimplementedErr("duplicate name import");
    }
    this.importedTypes.set(typeDeclaration.name, {
      declaration: typeDeclaration,
      namespace: moduleInterface.ns,
    });

    // -- Open import
    if (!exposing.exposeImpl) {
      return;
    }

    if (typeDeclaration.pub !== "..") {
      throw new UnimplementedErr("bad exposing (private constructors)");
    }

    // TODO add to unused exports

    this.loadOpenTypeDeclaration(typeDeclaration, moduleInterface.ns);
  }

  private loadValueImport(
    moduleInterface: ModuleInterface,
    exposing: TypedExposedValue & { type: "value" },
  ) {
    const declaration = moduleInterface.publicValues[exposing.name];
    if (declaration === undefined) {
      throw new UnimplementedErr("bad exposing (private value)");
    }

    if (this.importedValues.has(declaration.binding.name)) {
      throw new UnimplementedErr("duplicate name value import");
    }
    this.importedValues.set(exposing.name, {
      type: "global-variable",
      declaration,
      namespace: moduleInterface.ns,
    });

    // TODO add to unused exports
  }

  /** resolve and add implicit imports to scope */
  private loadImplicitImports(imports: Import[]) {
    for (const _import_ of imports) {
      throw new UnimplementedErr("load implicit imports");
    }
  }

  /** add imports to scope and mark them as unused */
  private loadImports(imports: TypedImport[]) {
    for (const import_ of imports) {
      const dep = this.deps[import_.ns];
      if (dep === undefined) {
        throw new UnimplementedErr("module not found");
      }

      // TODO add to unused imports

      for (const exposing of import_.exposing) {
        switch (exposing.type) {
          case "type":
            this.loadTypeImport(dep, exposing);
            break;

          case "value":
            this.loadValueImport(dep, exposing);
            break;
        }
      }
    }
  }

  /** add global type declarations (and constructors and fields) to scope and mark them as unused */
  private loadTypeDeclarations(typeDeclarations: TypedTypeDeclaration[]) {
    for (const declaration of typeDeclarations) {
      if (this.importedTypes.has(declaration.name)) {
        throw new UnimplementedErr("duplicate type");
        continue;
      }

      if (this.moduleTypes.has(declaration.name)) {
        throw new UnimplementedErr("duplicate type");
        continue;
      }

      this.moduleTypes.set(declaration.name, {
        declaration,
        namespace: this.ns,
      });

      // TODO add to unused types

      this.loadOpenTypeDeclaration(declaration, this.ns);
    }
  }

  /**
   * add global declarations to scope and mark them as unused
   * runs type ast resolution (but no expressions resolution yet)
   */
  private loadDeclarations(declarations: TypedDeclaration[]) {
    for (const declaration of declarations) {
      if (this.moduleValues.has(declaration.binding.name)) {
        this.errors.push({
          description: new err.DuplicateDeclaration(declaration.binding.name),
          range: declaration.binding.range,
        });
        continue;
      }

      this.moduleValues.set(declaration.binding.name, {
        type: "global-variable",
        declaration,
        namespace: this.ns,
      });

      if (declaration.typeHint !== undefined) {
        this.resolveTypeAst(declaration.typeHint.mono);
      }

      if (!declaration.pub) {
        this.unusedGlobals.add(declaration);
      }
    }
  }

  // TODO we might want to move this to Visitor
  private resolveTypeAst(ast: TypedTypeAst) {
    switch (ast.type) {
      case "var":
      case "any":
        // TODO any has to be handled
        return;

      case "fn":
        for (const arg of ast.args) {
          this.resolveTypeAst(arg);
        }
        this.resolveTypeAst(ast.return);
        return;

      case "named": {
        if (ast.namespace !== undefined) {
          throw new UnimplementedErr("unqualified type");
        }

        ast.$resolution =
          this.importedTypes.get(ast.name) ?? this.moduleTypes.get(ast.name);

        if (ast.$resolution === undefined) {
          this.errors.push({
            description: new err.UnboundType(ast.name),
            range: ast.range,
          });
        }

        for (const arg of ast.args) {
          this.resolveTypeAst(arg);
        }
        return;
      }
    }
  }

  private emitUnusedLocalsErrors() {
    for (const declaration of this.unusedLocals) {
      this.errors.push({
        range: declaration.range,
        description: new err.UnusedVariable(declaration.name, "local"),
      });
    }

    this.unusedLocals = new Set();
  }

  private emitUnusedGlobalsErrors() {
    for (const declaration of this.unusedGlobals) {
      this.errors.push({
        range: declaration.binding.range,
        description: new err.UnusedVariable(declaration.binding.name, "global"),
      });
    }
    this.unusedGlobals = new Set();
  }

  protected override onMatchClause() {
    const onExit = this.localFrames.enter();

    return () => {
      onExit();
    };
  }

  protected override onFn(_expr: TypedExpr & { type: "fn" }) {
    const onExit = this.localFrames.enter();

    return () => {
      onExit();
    };
  }

  protected override onLet(_expr: TypedExpr & { type: "let" }) {
    const onExit = this.localFrames.enter();

    return () => {
      onExit();
    };
  }

  protected override onPatternConstructor() {
    throw new UnimplementedErr("resolve pattern constructor");
  }

  protected override onPatternIdentifier(
    ident: TypedExpr & { type: "identifier" },
  ) {
    this.localFrames.register(ident);
    if (!validUnusedBinding(ident)) {
      this.unusedLocals.add(ident);
    }
  }

  protected override onIdentifier(
    expr: TypedExpr & { type: "identifier" },
  ): void {
    if (expr.namespace === undefined) {
      expr.$resolution =
        this.localValues.get(expr.name) ??
        this.moduleValues.get(expr.name) ??
        this.importedValues.get(expr.name);
    } else {
      expr.$resolution = this.moduleValues.get(expr.name);
    }

    if (expr.$resolution === undefined) {
      this.errors.push({
        description: new err.UnboundVariable(expr.name),
        range: expr.range,
      });
    } else {
      switch (expr.$resolution.type) {
        case "constructor":
          // TODO unused constructors
          break;

        case "local-variable":
          this.unusedLocals.delete(expr.$resolution.binding);
          break;

        case "global-variable":
          this.unusedGlobals.delete(expr.$resolution.declaration);
          break;
      }
    }
  }

  run(
    module: UntypedModule,
    implicitImports: Import[] = defaultImports,
  ): [TypedModule, ErrorInfo[]] {
    TVar.resetId();

    const annotator = new Annotator(this.errors);
    const annotatedModule = annotator.annotateModule(module);

    /**
     * We global values into scope
     * Make sure the order of "load*" calls isn't changed
     * */
    this.loadImplicitImports(implicitImports);
    this.loadImports(annotatedModule.imports);
    this.loadTypeDeclarations(annotatedModule.typeDeclarations);
    this.loadDeclarations(annotatedModule.declarations);

    // Now that global vars are into scope, we visit each (non-extern) declaration
    for (const decl of annotatedModule.declarations) {
      if (!decl.extern) {
        this.visitExpr(decl.value);
      }

      this.emitUnusedLocalsErrors();
    }

    this.emitUnusedGlobalsErrors();

    const typedModule: TypedModule = {
      ...annotatedModule,

      moduleInterface: makeInterface(
        this.ns,
        annotatedModule.typeDeclarations,
        annotatedModule.declarations,
      ),
    };

    return [typedModule, this.errors];
  }
}

class ResolutionStep {
  private readonly typeResolutionHoles = new Map<
    string,
    Array<TypedTypeAst & { type: "named" }>
  >();

  private errors: ErrorInfo[] = [];
  private imports: TypedImport[] = [];
  private framesStack = new FramesStack<TypedBinding, TypedDeclaration>();
  private patternBindings: TypedBinding[] = [];

  // fast lookups
  private importedConstructors = new Map<
    string,
    IdentifierResolution & { type: "constructor" }
  >();
  private localConstructors = new Map<
    string,
    IdentifierResolution & { type: "constructor" }
  >();
  private localTypeDeclarations = new Map<string, TypedTypeDeclaration>();

  // unused checks
  private unusedVariables = new WeakSet<TypedBinding>();
  private unusedImports = new WeakSet<TypedImport>();
  private unusedExposing = new WeakSet<TypedExposedValue>();

  constructor(
    private readonly ns: string,
    private readonly deps: Deps,
  ) {}

  run(
    module: UntypedModule,
    implicitImports: Import[] = defaultImports,
  ): [TypedModule, ErrorInfo[]] {
    TVar.resetId();

    const annotatedImplicitImports = this.annotateImports(
      implicitImports,
      false,
    );
    const annotatedImports = this.annotateImports(module.imports, true);

    this.imports = [...annotatedImports, ...annotatedImplicitImports];
    const typedTypeDeclarations = this.resolveTypeDeclarations(
      module.typeDeclarations,
    );

    const annotatedDeclrs = this.annotateDeclarations(module.declarations);
    for (const decl of annotatedDeclrs) {
      if (this.unusedVariables.has(decl.binding)) {
        this.errors.push({
          range: decl.binding.range,
          description: new err.UnusedVariable(decl.binding.name, "global"),
        });
      }
    }

    this.detectUnusedImports(annotatedImports);

    const typedModule: TypedModule = {
      imports: this.imports,
      declarations: annotatedDeclrs,
      typeDeclarations: typedTypeDeclarations,
      moduleDoc: module.moduleDoc,

      moduleInterface: makeInterface(
        this.ns,
        typedTypeDeclarations,
        annotatedDeclrs,
      ),
    };

    return [typedModule, this.errors];
  }

  /**
   * Fill all the holes, and then looked for ones that aren't filled yet, and emit UnboundType errors for them.
   * This must be called after each type declaration is resolved
   * */
  private resolveTypeDeclarations(typeDeclarations: TypeDeclaration[]) {
    const annotatedTypeDeclarationsDeclarations: TypedTypeDeclaration[] = [];

    for (const typeDeclaration of typeDeclarations) {
      const typedDeclaration = this.annotateTypeDeclaration(typeDeclaration);

      // TODO check imports as well
      if (this.localTypeDeclarations.has(typedDeclaration.name)) {
        this.errors.push({
          range: typeDeclaration.range,
          description: new err.DuplicateTypeDeclaration(typedDeclaration.name),
        });
      } else {
        this.localTypeDeclarations.set(typedDeclaration.name, typedDeclaration);
        annotatedTypeDeclarationsDeclarations.push(typedDeclaration);
      }
    }

    // First, we fill the holes (if any) by registering a named type in this same module
    for (const decl of annotatedTypeDeclarationsDeclarations) {
      const holes = this.typeResolutionHoles.get(decl.name) ?? [];
      for (const hole of holes) {
        hole.$resolution = {
          namespace: this.ns,
          declaration: decl,
        };
      }
      this.typeResolutionHoles.delete(decl.name);
    }

    // Then we look for the holes left
    for (const holes of this.typeResolutionHoles.values()) {
      for (const decl of holes) {
        this.errors.push({
          range: decl.range,
          description: new err.UnboundType(decl.name),
        });
      }
    }

    // Lastly, we register the local constructors so that we can have a O(1) lookup
    for (const typedTypeDecl of annotatedTypeDeclarationsDeclarations) {
      if (typedTypeDecl.type !== "adt") {
        continue;
      }

      for (const variant of typedTypeDecl.variants) {
        if (this.localConstructors.has(variant.name)) {
          this.errors.push({
            range: variant.range,
            description: new err.DuplicateConstructor(variant.name),
          });
        } else if (this.importedConstructors.has(variant.name)) {
          this.errors.push({
            range: variant.range,
            description: new err.ShadowingImport(variant.name),
          });
        } else {
          this.localConstructors.set(variant.name, {
            type: "constructor",
            variant,
            namespace: this.ns,
            declaration: typedTypeDecl,
          });
        }
      }
    }

    return annotatedTypeDeclarationsDeclarations;
  }

  private annotateDeclarations(declrs: Declaration[]): TypedDeclaration[] {
    return declrs.map<TypedDeclaration>((decl) => {
      const binding: TypedBinding = {
        ...decl.binding,
        $type: TVar.fresh(),
      };

      let tDecl: TypedDeclaration;
      if (decl.extern) {
        tDecl = {
          ...decl,
          $scheme: {},
          binding,
          typeHint: undefined!,
        };
      } else {
        tDecl = {
          ...decl,
          $scheme: {},
          binding,
          typeHint: undefined!,
          value: undefined!,
        };

        this.framesStack.defineRecursiveLabel({
          type: "global",
          declaration: tDecl,
          namespace: this.ns,
        });

        tDecl.value = this.annotateExpr(decl.value);
      }

      if (decl.typeHint !== undefined) {
        tDecl.typeHint = {
          mono: this.annotateTypeAst(decl.typeHint.mono, false),
          range: decl.typeHint.range,
          where: decl.typeHint.where,
        };
      }

      if (!decl.pub) {
        this.unusedVariables.add(tDecl.binding);
      }

      const ok = this.framesStack.defineGlobal(tDecl, this.ns);
      if (!ok) {
        this.errors.push({
          range: decl.binding.range,
          description: new err.DuplicateDeclaration(decl.binding.name),
        });
      }
      return tDecl;
    });
  }

  /**
   * Resolves a type and emits the corresponding errors (or registers the hole)
   * */
  private resolveType(
    ast: TypedTypeAst & { type: "named" },
    allowHoles: boolean,
  ): TypeResolution | undefined {
    // TODO handle ast.namespace === this.ns
    if (ast.namespace !== undefined) {
      const import_ = this.imports.find(
        (import_) => import_.ns === ast.namespace,
      );

      if (import_ === undefined) {
        return undefined;
      }

      this.unusedImports.delete(import_);

      const dep = this.deps[import_.ns];
      if (dep === undefined) {
        throw new Error("TODO handle dependency not found");
      }

      const typeDecl = dep.publicTypes[ast.name];
      if (typeDecl !== undefined) {
        return {
          namespace: ast.namespace,
          declaration: typeDecl,
        };
      }

      this.errors.push({
        range: ast.range,
        description: new err.UnboundType(ast.name),
      });
      return undefined;
    }

    // Here we should look for local typeDeclarations
    // however, we won't yet: we'll pretend no such local declaration exists, and fill holes later on,
    // as we process local types
    const typeDecl = this.localTypeDeclarations.get(ast.name);
    if (typeDecl !== undefined) {
      return {
        declaration: typeDecl,
        namespace: this.ns,
      };
    }

    for (const import_ of this.imports) {
      for (const exposed of import_.exposing) {
        if (exposed.type === "type" && exposed.$resolution?.name === ast.name) {
          this.unusedExposing.delete(exposed);
          return {
            declaration: exposed.$resolution,
            namespace: import_.ns,
          };
        }
      }
    }

    if (allowHoles) {
      // Register the hole:
      defaultMapPush(this.typeResolutionHoles, ast.name, ast);
    } else {
      this.errors.push({
        range: ast.range,
        description: new err.UnboundType(ast.name),
      });
    }

    return undefined;
  }

  private annotateTypeAst(ast: TypeAst, allowHoles: boolean): TypedTypeAst {
    switch (ast.type) {
      case "var":
      case "any":
        return ast;

      case "fn":
        return {
          ...ast,
          args: ast.args.map((a) => this.annotateTypeAst(a, allowHoles)),
          return: this.annotateTypeAst(ast.return, allowHoles),
        };

      case "named": {
        const typedAst: TypedTypeAst & { type: "named" } = {
          ...ast,
          args: ast.args.map((a) => this.annotateTypeAst(a, allowHoles)),
          $resolution: undefined,
        };
        typedAst.$resolution = this.resolveType(typedAst, allowHoles);
        return typedAst;
      }
    }
  }

  private annotateTypeDeclaration(
    typeDecl: TypeDeclaration,
  ): TypedTypeDeclaration {
    const usedParams = new Set();
    for (const param of typeDecl.params) {
      if (usedParams.has(param.name)) {
        this.errors.push({
          range: param.range,
          description: new err.TypeParamShadowing(param.name),
        });
      }
      usedParams.add(param.name);
    }

    switch (typeDecl.type) {
      case "extern":
        return typeDecl;

      case "adt":
        return {
          ...typeDecl,
          variants: typeDecl.variants.map((variant) => ({
            ...variant,
            $scheme: {},
            $type: TVar.fresh(),
            args: variant.args.map((arg) => this.annotateTypeAst(arg, true)),
          })),
        };

      case "struct":
        return {
          ...typeDecl,

          $scheme: {},
          $type: TVar.fresh(),

          fields: typeDecl.fields.map(
            (untypedField): TypedStructDeclarationField => ({
              ...untypedField,
              $type: TVar.fresh(),
              $scheme: {},
              typeAst: this.annotateTypeAst(untypedField.typeAst, true),
            }),
          ),
        };
    }
  }

  private detectUnusedImports(annotatedImports: TypedImport[]) {
    for (const import_ of annotatedImports) {
      if (this.unusedImports.has(import_)) {
        this.errors.push({
          description: new err.UnusedImport(import_.ns),
          range: import_.range,
        });
      }

      for (const exposing of import_.exposing) {
        if (this.unusedExposing.has(exposing)) {
          this.errors.push({
            description: new err.UnusedExposing(exposing.name),
            range: exposing.range,
          });
        }
      }
    }
  }

  private annotateImports(
    imports: Import[],
    markUnused: boolean,
  ): TypedImport[] {
    return imports.flatMap((import_) => {
      const importedModule = this.deps[import_.ns];
      if (importedModule === undefined) {
        this.errors.push({
          range: import_.range,
          description: new err.UnboundModule(import_.ns),
        });
        return [];
      }

      const annotatedImport = this.annotateImport(import_, importedModule);

      if (markUnused) {
        // Track imported values so that we can tell which of them are
        if (annotatedImport.exposing.length === 0) {
          this.unusedImports.add(annotatedImport);
        }
        for (const exposing of annotatedImport.exposing) {
          if (exposing.type === "value" && exposing.$resolution !== undefined) {
            this.unusedExposing.add(exposing);
          } else if (
            exposing.type === "type" &&
            !exposing.exposeImpl &&
            exposing.$resolution !== undefined
          ) {
            this.unusedExposing.add(exposing);
          }
        }
      }

      return [annotatedImport];
    });
  }

  private resolveExternalIdentifier(ast: {
    name: string;
    namespace: string;
    range: Range;
  }): IdentifierResolution | undefined {
    const import_ = this.imports.find(
      (import_) => import_.ns === ast.namespace,
    );
    if (import_ === undefined) {
      this.errors.push({
        range: ast.range,
        description: new err.UnimportedModule(ast.namespace),
      });
      return undefined;
    }

    this.unusedImports.delete(import_);

    const dep = this.deps[import_.ns];
    if (dep === undefined) {
      return undefined;
    }

    const declaration = dep.publicValues[ast.name];
    if (declaration !== undefined) {
      return {
        type: "global-variable",
        declaration,
        namespace: ast.namespace,
      };
    }

    const tDecl = dep.publicConstructors[ast.name];
    if (tDecl !== undefined) {
      return {
        type: "constructor",
        variant: tDecl.variant,
        declaration: tDecl.declaration,
        namespace: ast.namespace,
      };
    }

    for (const exposed of import_.exposing) {
      if (exposed.name === ast.name) {
        // Found!
        switch (exposed.type) {
          case "value":
            if (exposed.$resolution === undefined) {
              return;
            }

            return {
              type: "global-variable",
              namespace: ast.namespace,
              declaration: exposed.$resolution,
            };

          case "type":
            break;
        }
      }
    }

    this.errors.push({
      range: ast.range,
      description: new err.NonExistingImport(ast.name),
    });

    return;
  }

  private *exportedStructs(): Generator<
    [TypedTypeDeclaration & { type: "struct" }, TypedImport, TypedExposedValue]
  > {
    for (const import_ of this.imports) {
      for (const exposed of import_.exposing) {
        if (
          exposed.type !== "type" ||
          exposed.$resolution === undefined ||
          exposed.$resolution.type !== "struct"
        ) {
          continue;
        }

        yield [exposed.$resolution, import_, exposed];
      }
    }
  }

  private resolveField(
    ast: { name: string; structName?: string } & RangeMeta,
  ): FieldResolution | undefined {
    const { name: fieldName, structName: qualifiedStructName } = ast;

    if (qualifiedStructName !== undefined) {
      const typeDecl = this.localTypeDeclarations.get(qualifiedStructName);
      if (typeDecl !== undefined) {
        const fieldLookup = findFieldInTypeDecl(typeDecl, fieldName, this.ns);

        if (fieldLookup === undefined) {
          this.errors.push({
            description: new err.InvalidField(typeDecl.name, fieldName),
            range: ast.range,
          });
        }

        return fieldLookup;
      }

      const localFieldLookup = findFieldInModule(
        this.localTypeDeclarations,
        fieldName,
        this.ns,
      );
      if (localFieldLookup !== undefined) {
        return localFieldLookup;
      }

      for (const [struct, import_, exposing] of this.exportedStructs()) {
        if (struct.name !== qualifiedStructName) {
          continue;
        }

        const fieldLookup = findFieldInTypeDecl(struct, fieldName, import_.ns);

        if (fieldLookup === undefined || fieldLookup.declaration.pub !== "..") {
          // TODO emit err: invalid qualifier

          this.errors.push({
            description: new err.InvalidField(qualifiedStructName, fieldName),
            range: ast.range,
          });
        }

        this.unusedExposing.delete(exposing);

        return fieldLookup;
      }

      this.errors.push({
        description: new err.UnboundType(qualifiedStructName),
        range: ast.range,
      });

      return undefined;
    }

    // First check locally
    const lookup = findFieldInModule(
      this.localTypeDeclarations,
      fieldName,
      this.ns,
    );
    if (lookup !== undefined) {
      return lookup;
    }

    // check in import with exposed fields
    for (const import_ of this.imports) {
      for (const exposed of import_.exposing) {
        if (
          exposed.type !== "type" ||
          exposed.$resolution === undefined ||
          exposed.$resolution.type !== "struct" ||
          !exposed.exposeImpl
        ) {
          continue;
        }

        const lookup = findFieldInTypeDecl(
          exposed.$resolution,
          fieldName,
          import_.ns,
        );

        if (lookup !== undefined) {
          return lookup;
        }
      }
    }

    // TODO handle qualified fields
    return undefined;
  }

  private resolveIdentifier(ast: {
    name: string;
    namespace?: string;
    range: Range;
  }): IdentifierResolution | undefined {
    if (ast.namespace !== undefined && ast.namespace !== this.ns) {
      return this.resolveExternalIdentifier({
        name: ast.name,
        namespace: ast.namespace,
        range: ast.range,
      });
    }

    const resolved = this.framesStack.resolve(ast.name);
    if (resolved !== undefined) {
      switch (resolved.type) {
        case "global": {
          this.unusedVariables.delete(resolved.declaration.binding);

          const import_ = this.imports.find(
            (import_) => import_.ns === resolved.namespace,
          );
          const exposing = import_?.exposing.find((e) => e.name === ast.name);
          if (exposing !== undefined) {
            this.unusedExposing.delete(exposing);
          }

          return {
            type: "global-variable",
            declaration: resolved.declaration,
            namespace: resolved.namespace,
          };
        }

        case "local":
          this.unusedVariables.delete(resolved.binding);
          return {
            type: "local-variable",
            binding: resolved.binding,
          };
      }
    }

    let constructor = this.localConstructors.get(ast.name);
    if (constructor === undefined && ast.namespace === undefined) {
      constructor = this.importedConstructors.get(ast.name);
    }
    if (constructor !== undefined) {
      return constructor;
    }

    this.errors.push({
      range: ast.range,
      description: new err.UnboundVariable(ast.name),
    });

    return;
  }

  private matchPatternBindings(pattern: TypedMatchPattern): TypedBinding[] {
    switch (pattern.type) {
      case "identifier":
        return [pattern];
      case "constructor":
        return pattern.args.flatMap((pattern) =>
          this.matchPatternBindings(pattern),
        );
      case "lit":
        return [];
    }
  }

  private annotateExpr(ast: Expr): TypedExpr {
    switch (ast.type) {
      // syntax sugar
      case "block":
        return this.annotateExpr(ast.inner);

      case "pipe":
        if (ast.right.type !== "application") {
          this.errors.push({
            range: ast.right.range,
            description: new err.InvalidPipe(),
          });
          return this.annotateExpr(ast.left);
        }

        return this.annotateExpr({
          type: "application",
          isPipe: true,
          range: ast.range,
          caller: ast.right.caller,
          args: [ast.left, ...ast.right.args],
        });

      case "let#":
        return this.annotateExpr({
          type: "application",
          caller: {
            type: "identifier",
            namespace: ast.mapper.namespace,
            name: ast.mapper.name,
            range: ast.mapper.range,
          },
          args: [
            ast.value,
            {
              type: "fn",
              params: [ast.pattern],
              body: ast.body,
              range: ast.range,
            },
          ],
          range: ast.range,
        });

      // Actual ast

      case "syntax-err":
      case "constant":
        return { ...ast, $type: TVar.fresh() };

      case "struct-literal": {
        const typeDecl = this.resolveStruct(ast.struct.name);

        return {
          ...ast,
          fields: ast.fields.map((field): TypedStructField => {
            const fieldResolution =
              typeDecl === undefined
                ? undefined
                : findFieldInTypeDecl(
                    typeDecl.declaration,
                    field.field.name,
                    this.ns,
                  );

            if (typeDecl !== undefined && fieldResolution === undefined) {
              // TODO move the error back to typecheck step?
              // it has access to the inferred type
              this.errors.push({
                range: field.range,
                description: new err.InvalidField(
                  makeStructName(typeDecl.declaration),
                  field.field.name,
                ),
              });
            }

            return {
              ...field,
              field: {
                ...field.field,
                $resolution: fieldResolution,
              },
              value: this.annotateExpr(field.value),
            };
          }),
          struct: {
            ...ast.struct,
            $resolution: typeDecl,
          },
          spread:
            ast.spread === undefined
              ? undefined
              : this.annotateExpr(ast.spread),
          $type: TVar.fresh(),
        };
      }

      case "list-literal": {
        return {
          ...ast,
          values: ast.values.map((v) => this.annotateExpr(v)),
          $type: TVar.fresh(),
        };
      }

      case "identifier":
        return {
          ...ast,
          $resolution: this.resolveIdentifier(ast),
          $type: TVar.fresh(),
        };

      case "fn": {
        const params = ast.params.map((p) =>
          this.annotateMatchPattern(p, false),
        );

        const idents = params.flatMap((p) => this.matchPatternBindings(p));

        this.framesStack.pushFrame(idents);
        // TODO frame name
        for (const param of idents) {
          if (!param.name.startsWith("_")) {
            this.unusedVariables.add(param);
          }
        }

        const body: TypedExpr = this.annotateExpr(ast.body);

        for (const param of idents) {
          if (this.unusedVariables.has(param)) {
            this.errors.push({
              range: param.range,
              description: new err.UnusedVariable(param.name, "local"),
            });
          }
        }

        this.framesStack.popFrame();

        return {
          ...ast,
          $type: TVar.fresh(),
          body,
          params,
        };
      }

      case "infix":
        return this.annotateExpr({
          type: "application",
          caller: { type: "identifier", name: ast.operator, range: ast.range },
          args: [ast.left, ast.right],
          range: ast.range,
        });

      case "application":
        return {
          ...ast,
          $type: TVar.fresh(),
          caller: this.annotateExpr(ast.caller),
          args: ast.args.map((arg) => this.annotateExpr(arg)),
        };

      case "field-access":
        return {
          ...ast,
          struct: this.annotateExpr(ast.struct),
          $resolution: this.resolveField(ast.field),
          $type: TVar.fresh(),
        };

      case "if":
        return {
          ...ast,
          $type: TVar.fresh(),
          condition: this.annotateExpr(ast.condition),
          then: this.annotateExpr(ast.then),
          else: this.annotateExpr(ast.else),
        };

      case "let": {
        let pattern: TypedMatchPattern;
        let bindings: TypedBinding[];
        if (ast.pattern.type === "identifier") {
          const binding: TypedMatchPattern = {
            ...ast.pattern,
            $type: TVar.fresh(),
          };
          pattern = binding;

          this.framesStack.defineRecursiveLabel({
            type: "local",
            binding,
          });

          bindings = [binding];
        } else {
          pattern = this.annotateMatchPattern(ast.pattern, false);
          bindings = this.matchPatternBindings(pattern);
        }

        for (const binding of bindings) {
          if (!binding.name.startsWith("_")) {
            this.unusedVariables.add(binding);
          }
        }

        const value = this.annotateExpr(ast.value);

        for (const binding of bindings) {
          this.framesStack.defineLocal(binding);
        }

        const body = this.annotateExpr(ast.body);
        this.framesStack.exitLocal();

        const node: TypedExpr = {
          ...ast,
          $type: TVar.fresh(),
          pattern,
          value,
          body,
        };

        for (const binding of bindings) {
          if (this.unusedVariables.has(binding)) {
            this.errors.push({
              range: binding.range,
              description: new err.UnusedVariable(binding.name, "local"),
            });
          }
        }

        return node;
      }
      case "match": {
        return {
          ...ast,
          $type: TVar.fresh(),
          expr: this.annotateExpr(ast.expr),
          clauses: ast.clauses.map(([pattern, expr]) => {
            this.patternBindings = [];
            const annotatedPattern = this.annotateMatchPattern(pattern);
            const annotatedExpr = this.annotateExpr(expr);

            for (const binding of this.patternBindings) {
              this.framesStack.exitLocal();

              if (this.unusedVariables.has(binding)) {
                this.errors.push({
                  description: new err.UnusedVariable(binding.name, "local"),
                  range: binding.range,
                });
              }
            }

            return [annotatedPattern, annotatedExpr];
          }),
        };
      }
    }
  }

  private resolveStruct(structName: string): StructResolution | undefined {
    // TODO handle external ns
    const typeDecl = this.localTypeDeclarations.get(structName);
    if (typeDecl !== undefined && typeDecl.type === "struct") {
      return {
        declaration: typeDecl,
        namespace: this.ns,
      };
    }

    for (const import_ of this.imports) {
      for (const exposed of import_.exposing) {
        if (
          exposed.type === "type" &&
          exposed.$resolution !== undefined &&
          exposed.$resolution.name === structName &&
          exposed.$resolution.type === "struct"
        ) {
          return {
            declaration: exposed.$resolution,
            namespace: import_.ns,
          };
        }
      }
    }

    return undefined;
  }

  private annotateImport(
    import_: Import,
    importedModule: ModuleInterface,
  ): TypedImport {
    return {
      ...import_,
      exposing: import_.exposing.map((exposing): TypedExposedValue => {
        switch (exposing.type) {
          case "type": {
            const resolved = importedModule.publicTypes[exposing.name];
            if (resolved === undefined || !resolved.pub) {
              this.errors.push({
                range: exposing.range,
                description: new err.NonExistingImport(exposing.name),
              });

              return {
                ...exposing,
                $resolution: undefined,
              };
            }

            if (exposing.exposeImpl) {
              switch (resolved.type) {
                case "extern":
                  this.errors.push({
                    range: exposing.range,
                    description: new err.BadImport(),
                  });
                  break;
                case "adt":
                  if (resolved.pub !== "..") {
                    this.errors.push({
                      range: exposing.range,
                      description: new err.BadImport(),
                    });
                    break;
                  } else {
                    for (const variant of resolved.variants) {
                      if (this.importedConstructors.has(variant.name)) {
                        this.errors.push({
                          range: variant.range,
                          description: new err.ShadowingImport(variant.name),
                        });
                      } else {
                        this.importedConstructors.set(variant.name, {
                          type: "constructor",
                          variant,
                          declaration: resolved,
                          namespace: import_.ns,
                        });
                      }
                    }
                  }
              }
            }

            return {
              ...exposing,
              $resolution: resolved,
            };
          }

          case "value": {
            const declaration = importedModule.publicValues[exposing.name];
            if (declaration === undefined || !declaration.pub) {
              this.errors.push({
                range: exposing.range,
                description: new err.NonExistingImport(exposing.name),
              });
            } else {
              this.framesStack.defineGlobal(declaration, import_.ns);
            }

            return {
              ...exposing,
              $resolution: declaration,
            } as TypedExposedValue;
          }
        }
      }),
    };
  }

  private annotateMatchPattern(
    ast: MatchPattern,
    defineLocal = true,
  ): TypedMatchPattern {
    switch (ast.type) {
      case "lit":
        return {
          ...ast,
          $type: TVar.fresh(),
        };

      case "identifier": {
        const typedBinding = {
          ...ast,
          $type: TVar.fresh(),
        };
        if (!ast.name.startsWith("_")) {
          if (defineLocal) {
            this.framesStack.defineLocal(typedBinding);
            this.patternBindings.push(typedBinding);
          }

          this.unusedVariables.add(typedBinding);
        }
        return typedBinding;
      }

      case "constructor": {
        const resolution = this.resolveConstructor(
          ast.namespace,
          ast.name,
          ast.range,
        );
        return {
          ...ast,
          $resolution: resolution,
          args: ast.args.map((arg) =>
            this.annotateMatchPattern(arg, defineLocal),
          ),
          $type: TVar.fresh(),
        };
      }
    }
  }

  private resolveConstructor(
    namespace_: string | undefined,
    name: string,
    range: Range,
  ): IdentifierResolution | undefined {
    // TODO ugly code, simplify a bit
    const namespace = namespace_ ?? this.ns;

    if (namespace === this.ns) {
      let constructor = this.localConstructors.get(name);
      if (constructor === undefined && namespace_ === undefined) {
        constructor = this.importedConstructors.get(name);
      }

      if (constructor === undefined) {
        this.errors.push({
          description: new err.UnboundVariable(name),
          range,
        });
        return undefined;
      }
      return constructor;
    }

    const module = this.deps[namespace];
    if (module === undefined) {
      this.errors.push({
        description: new err.UnimportedModule(namespace),
        range,
      });
      return undefined;
    }

    const variant = module.publicConstructors[name];
    if (variant !== undefined) {
      return {
        type: "constructor",
        variant: variant.variant,
        declaration: variant.declaration,
        namespace: namespace,
      };
    }

    this.errors.push({
      description: new err.UnboundVariable(name),
      range,
    });

    return undefined;
  }
}

export function findFieldInModule(
  typeDeclarations: ResolutionStep["localTypeDeclarations"],
  fieldName: string,
  namespace: string,
): FieldResolution | undefined {
  for (const typeDecl of typeDeclarations.values()) {
    const lookup = findFieldInTypeDecl(typeDecl, fieldName, namespace);
    if (lookup !== undefined) {
      return lookup;
    }
  }

  return undefined;
}

export function findFieldInTypeDecl(
  declaration: TypedTypeDeclaration,
  fieldName: string,
  namespace: string,
): FieldResolution | undefined {
  if (declaration.type !== "struct") {
    return undefined;
  }

  for (const field of declaration.fields) {
    if (field.name !== fieldName) {
      continue;
    }

    return { declaration, field, namespace };
  }

  return undefined;
}

function makeStructName(
  structDeclaration: TypedTypeDeclaration & { type: "struct" },
): string {
  if (structDeclaration.params.length === 0) {
    return structDeclaration.name;
  }

  const params = structDeclaration.params.map(() => "_").join(", ");

  return `${structDeclaration.name}<${params}>`;
}

function defaultMapPush<T>(m: Map<string, T[]>, key: string, value: T) {
  const previous = m.get(key);
  if (previous === undefined) {
    m.set(key, [value]);
  } else {
    previous.push(value);
  }
}

// TODO make this lazy
function makeInterface(
  ns: string,
  typeDeclarations: TypedModule["typeDeclarations"],
  declarations: TypedModule["declarations"],
): ModuleInterface {
  const publicFields: ModuleInterface["publicFields"] = {};
  const publicConstructors: ModuleInterface["publicConstructors"] = {};
  const publicTypes: ModuleInterface["publicTypes"] = {};
  for (const typeDeclaration of typeDeclarations) {
    if (typeDeclaration.pub === false) {
      continue;
    }

    publicTypes[typeDeclaration.name] = typeDeclaration;
    if (typeDeclaration.pub === ".." && typeDeclaration.type === "adt") {
      for (const ctor of typeDeclaration.variants) {
        publicConstructors[ctor.name] = {
          type: "constructor",
          variant: ctor,
          declaration: typeDeclaration,
          namespace: ns,
        };
      }
    }

    if (typeDeclaration.pub === ".." && typeDeclaration.type === "struct") {
      for (const field of typeDeclaration.fields) {
        publicFields[field.name] = {
          declaration: typeDeclaration,
          field: field,
          namespace: ns,
        };
      }
    }
  }

  const publicValues: ModuleInterface["publicValues"] = {};
  for (const d of declarations) {
    if (!d.pub) {
      continue;
    }
    publicValues[d.binding.name] = d;
  }

  return {
    ns,
    publicConstructors,
    publicTypes,
    publicValues,
    publicFields,
  };
}

function validUnusedBinding(b: TypedBinding) {
  return b.name.startsWith("_");
}
