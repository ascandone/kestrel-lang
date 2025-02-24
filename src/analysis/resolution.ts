import { defaultMapGet } from "../data/defaultMap";
import {
  DirectedGraph,
  detectCycles,
  findStronglyConnectedComponents,
} from "../data/graph";
import {
  CyclicDefinition,
  DuplicateDeclaration,
  DuplicateTypeDeclaration,
  ErrorInfo,
  UnboundType,
  UnboundVariable,
  UnusedVariable,
} from "./errors";
import {
  Binding,
  TypeAst,
  UntypedDeclaration,
  UntypedExposedValue,
  UntypedExpr,
  UntypedImport,
  UntypedMatchPattern,
  UntypedModule,
  UntypedTypeDeclaration,
  UntypedTypeVariant,
} from "../parser";
import type { Analysis } from "./analyse";

type LocalScope = Record<string, Binding>;

export type TypeResolution = {
  declaration: UntypedTypeDeclaration;
  ns: string;
  package: string;
};

export type NamespaceResolution =
  | { type: "self" }
  | { type: "imported"; analysis: Analysis };

export type IdentifierResolution =
  | {
      type: "local-variable";
      binding: Binding;
    }
  | {
      type: "global-variable";
      declaration: UntypedDeclaration;
      namespace: NamespaceResolution;
    }
  | {
      type: "constructor";
      variant: UntypedTypeVariant;
      declaration: UntypedTypeDeclaration & { type: "adt" };
      namespace: NamespaceResolution;
    };

export type ResolvableNode =
  | (UntypedExpr & { type: "identifier" })
  | (UntypedExpr & { type: "infix" })
  | (UntypedMatchPattern & { type: "constructor" });

export class ResolutionAnalysis {
  public readonly sortedDeclarations: Array<Array<UntypedDeclaration>>;
  private readonly callGraph = new WeakMap<
    UntypedDeclaration,
    UntypedDeclaration[]
  >();
  private readonly directCallGraph = new WeakMap<
    UntypedDeclaration,
    UntypedDeclaration[]
  >();
  private currentDeclaration: UntypedDeclaration | undefined = undefined;
  private isThunk = false;
  private enterThunk(): VoidFunction {
    const oldValue = this.isThunk;
    this.isThunk = true;
    return () => {
      this.isThunk = oldValue;
    };
  }

  /** record of types declared in this module */
  private locallyDefinedTypes = new Map<string, UntypedTypeDeclaration>();
  /** record of variants declared in this module */
  private locallyDefinedVariants = new Map<
    string,
    [UntypedTypeDeclaration & { type: "adt" }, UntypedTypeVariant]
  >();

  private readonly locallyDefinedDeclarations = new Map<
    string,
    UntypedDeclaration
  >();

  private importedValues = new Map<string, IdentifierResolution>();
  private importedTypes = new Map<
    string,
    [resolution: ResolutionAnalysis, typeDeclaration: UntypedTypeDeclaration]
  >();

  private unusedBindings = new WeakSet<Binding>();
  private identifiersResolutions = new WeakMap<
    ResolvableNode,
    IdentifierResolution
  >();

  private typesResolutions = new WeakMap<
    TypeAst & { type: "named" },
    TypeResolution
  >();

  private readonly importedModules = new Map<string, Analysis>();

  constructor(
    private readonly package_: string,
    private readonly ns: string,
    private readonly module: UntypedModule,
    private readonly emitError: (error: ErrorInfo) => void,
    getDependency: (namespace: string) => Analysis | undefined = () =>
      undefined,
    private readonly implicitImports: UntypedImport[] = [],
  ) {
    this.initImportsResolution(getDependency);
    this.initTypesResolution();
    this.initDeclarationsResolution();

    const directCallGraph = this.buildCallGraph(this.directCallGraph);
    const cycle = detectCycles(directCallGraph);

    if (cycle !== undefined) {
      this.emitError({
        range: cycle[0]!.range,
        description: new CyclicDefinition(cycle.map((d) => d.binding.name)),
      });
    }

    const callGraph = this.buildCallGraph(this.callGraph);
    this.sortedDeclarations = findStronglyConnectedComponents(callGraph);
  }

  public resolveIdentifier(
    identifier: ResolvableNode,
  ): IdentifierResolution | undefined {
    return this.identifiersResolutions.get(identifier);
  }

  public resolveType(
    typeAst: TypeAst & { type: "named" },
  ): TypeResolution | undefined {
    return this.typesResolutions.get(typeAst);
  }

  private initImportsResolution(
    getDependency: (namespace: string) => Analysis | undefined,
  ) {
    for (const import_ of [...this.implicitImports, ...this.module.imports]) {
      const analysis = getDependency(import_.ns);
      if (analysis === undefined) {
        continue;
        throw new Error("TODO dependency not found: " + import_.ns);
      }
      this.importedModules.set(import_.ns, analysis);

      for (const exposedValue of import_.exposing) {
        this.registerExposedValue(analysis, exposedValue);
      }
    }
  }

  private getDependencyByNs(
    namespace: NamespaceResolution,
  ): ResolutionAnalysis {
    switch (namespace.type) {
      case "self":
        return this;
      case "imported":
        return namespace.analysis.resolution;
    }
  }

  private registerExposedValue(
    analysis: Analysis,
    exposedValue: UntypedExposedValue,
  ) {
    switch (exposedValue.type) {
      case "value": {
        const declarationLookup =
          analysis.resolution.locallyDefinedDeclarations.get(exposedValue.name);
        if (declarationLookup === undefined || !declarationLookup.pub) {
          throw new Error("TODO imported value not found");
        }

        this.importedValues.set(exposedValue.name, {
          type: "global-variable",
          declaration: declarationLookup,
          namespace: { type: "imported", analysis },
        });
        break;
      }

      case "type": {
        const declarationLookup = analysis.resolution.locallyDefinedTypes.get(
          exposedValue.name,
        );
        if (
          declarationLookup === undefined ||
          declarationLookup.pub === false
        ) {
          throw new Error("TODO imported value not found");
        }

        this.importedTypes.set(declarationLookup.name, [
          analysis.resolution,
          declarationLookup,
        ]);

        if (
          declarationLookup.type === "adt" &&
          declarationLookup.pub === ".."
        ) {
          for (const exposedVariant of declarationLookup.variants) {
            this.importedValues.set(exposedVariant.name, {
              type: "constructor",
              declaration: declarationLookup,
              variant: exposedVariant,
              namespace: { type: "imported", analysis },
            });
          }
        }

        break;
      }

      default:
        return exposedValue satisfies void;
    }
  }

  private initTypesResolution() {
    // 1. register all the types
    for (const typeDecl of this.module.typeDeclarations) {
      if (this.locallyDefinedTypes.has(typeDecl.name)) {
        this.emitError({
          description: new DuplicateTypeDeclaration(typeDecl.name),
          range: typeDecl.range,
        });
      } else {
        this.locallyDefinedTypes.set(typeDecl.name, typeDecl);
      }
    }

    // 2. register and resolve constructors and fields
    for (const typeDecl of this.module.typeDeclarations) {
      switch (typeDecl.type) {
        case "adt":
          for (const variant of typeDecl.variants) {
            if (this.locallyDefinedVariants.has(variant.name)) {
              this.emitError({
                description: new DuplicateDeclaration(variant.name),
                range: variant.range,
              });
            } else {
              this.locallyDefinedVariants.set(variant.name, [
                typeDecl,
                variant,
              ]);
            }
            for (const arg of variant.args) {
              this.runTypeAstResolution(arg);
            }
          }
          break;

        case "struct":
          for (const field of typeDecl.fields) {
            this.runTypeAstResolution(field.type_);
          }
          break;

        case "extern":
          break;
      }
    }

    // 3. resolve type hints
    for (const decl of this.module.declarations) {
      if (decl.typeHint !== undefined) {
        this.runTypeAstResolution(decl.typeHint.mono);
      }
    }
  }

  private initDeclarationsResolution() {
    // Add declarations to unused bindings and check for duplicates
    for (const letDecl of this.module.declarations) {
      this.unusedBindings.add(letDecl.binding);
      if (this.locallyDefinedDeclarations.has(letDecl.binding.name)) {
        this.emitError({
          range: letDecl.binding.range,
          description: new DuplicateDeclaration(letDecl.binding.name),
        });
      } else {
        this.locallyDefinedDeclarations.set(letDecl.binding.name, letDecl);
      }
    }

    // Run resolution in each declaration's value
    for (const letDecl of this.module.declarations) {
      if (letDecl.extern) {
        continue;
      }

      this.currentDeclaration = letDecl;
      this.runValuesResolution(letDecl.value, {});
    }

    // Iterate declarations again to check for unused bindings
    for (const letDecl of this.module.declarations) {
      if (!letDecl.pub && this.unusedBindings.has(letDecl.binding)) {
        this.emitError({
          range: letDecl.binding.range,
          description: new UnusedVariable(letDecl.binding.name, "global"),
        });
      }
    }
  }

  private getImportedModule(
    namespace: string | undefined,
  ): NamespaceResolution {
    switch (namespace) {
      case this.ns:
      case undefined:
        return { type: "self" };

      default: {
        const analysis = this.importedModules.get(namespace);
        if (analysis === undefined) {
          throw new Error("TODO unimported ns");
        }
        return {
          type: "imported",
          analysis,
        };
      }
    }
  }

  private runNamedTypeResolution(typeAst: TypeAst & { type: "named" }) {
    if (typeAst.namespace === undefined) {
      const importedType = this.importedTypes.get(typeAst.name);

      if (importedType !== undefined) {
        const [resolution, declaration] = importedType;
        this.typesResolutions.set(typeAst, {
          declaration,
          ns: resolution.ns,
          package: resolution.package_,
        });
        return;
      }
    }

    const namespaceResolution = this.getImportedModule(typeAst.namespace);

    const resolution = this.getDependencyByNs(namespaceResolution);

    const localTypeLookup = resolution.locallyDefinedTypes.get(typeAst.name);
    localTypeLookup: if (localTypeLookup !== undefined) {
      if (resolution.ns !== this.ns && localTypeLookup.pub === false) {
        break localTypeLookup;
      }

      this.typesResolutions.set(typeAst, {
        declaration: localTypeLookup,
        ns: this.ns,
        package: this.package_,
      });
      return;
    }

    this.emitError({
      description: new UnboundType(typeAst.name),
      range: typeAst.range,
    });
  }

  private runTypeAstResolution(typeAst: TypeAst) {
    switch (typeAst.type) {
      case "named": {
        // TODO emit
        for (const arg of typeAst.args) {
          this.runTypeAstResolution(arg);
        }

        return this.runNamedTypeResolution(typeAst);
      }

      case "fn": {
        for (const arg of typeAst.args) {
          this.runTypeAstResolution(arg);
        }
        this.runTypeAstResolution(typeAst.return);
        return;
      }

      case "var":
      case "any":
        return;
    }
  }

  private runIdentifierResolution(
    expr: ResolvableNode,
    localScope: LocalScope,
  ) {
    const name = (() => {
      switch (expr.type) {
        case "identifier":
        case "constructor":
          return expr.name;
        case "infix":
          return expr.operator;
      }
    })();

    const resolution = this.evaluateResolution(name, expr, localScope);
    if (resolution === undefined) {
      this.emitError({
        range: expr.range,
        description: new UnboundVariable(name),
      });
      return;
    }

    this.identifiersResolutions.set(expr, resolution);
    switch (resolution.type) {
      case "local-variable":
        this.unusedBindings.delete(resolution.binding);
        break;

      case "global-variable":
        this.unusedBindings.delete(resolution.declaration.binding);
        break;
      case "constructor":
        break;
    }
  }

  private runValuesResolution(
    expr: UntypedExpr,
    localScope: LocalScope,
  ): undefined {
    switch (expr.type) {
      case "syntax-err":
      case "constant":
        return;

      case "block":
        this.runValuesResolution(expr.inner, localScope);
        return;

      case "identifier":
        this.runIdentifierResolution(expr, localScope);
        return;

      case "infix":
        this.runIdentifierResolution(expr, localScope);
        this.runValuesResolution(expr.left, localScope);
        this.runValuesResolution(expr.right, localScope);
        return;

      case "fn": {
        for (const arg of expr.params) {
          this.runPatternResolution(arg);
        }

        const paramsBindings = expr.params
          .flatMap((p) => this.extractPatternIdentifiers(p))
          .map((p) => [p.name, p]);

        const onExit = this.enterThunk();
        this.runValuesResolution(expr.body, {
          ...localScope,
          ...Object.fromEntries(paramsBindings),
        });
        onExit();
        return;
      }

      case "application": {
        this.runValuesResolution(expr.caller, localScope);
        for (const arg of expr.args) {
          this.runValuesResolution(arg, localScope);
        }

        return;
      }

      case "pipe": {
        this.runValuesResolution(expr.right, localScope);
        this.runValuesResolution(expr.left, localScope);
        return;
      }

      case "if": {
        this.runValuesResolution(expr.condition, localScope);
        this.runValuesResolution(expr.then, localScope);
        this.runValuesResolution(expr.else, localScope);
        return;
      }

      case "let": {
        // TODO handle recursive bindings
        this.runValuesResolution(expr.value, localScope);

        const bindingsEntries = this.extractPatternIdentifiers(
          expr.pattern,
        ).map((b) => {
          this.unusedBindings.add(b);
          return [b.name, b] as const;
        });

        this.runPatternResolution(expr.pattern);
        this.runValuesResolution(expr.body, {
          ...localScope,
          ...Object.fromEntries(bindingsEntries),
        });

        for (const [_, binding] of bindingsEntries) {
          this.checkUnusedVars(binding);
        }
        return;
      }

      case "let#": {
        this.runValuesResolution(expr.mapper, localScope);
        this.runValuesResolution(expr.value, localScope);

        const bindingsEntries = this.extractPatternIdentifiers(
          expr.pattern,
        ).map((b) => {
          this.unusedBindings.add(b);
          return [b.name, b] as const;
        });

        this.runPatternResolution(expr.pattern);
        this.runValuesResolution(expr.body, {
          ...localScope,
          ...Object.fromEntries(bindingsEntries),
        });

        for (const [_, binding] of bindingsEntries) {
          this.checkUnusedVars(binding);
        }
        return;
      }

      case "list-literal": {
        for (const value of expr.values) {
          this.runValuesResolution(value, localScope);
        }
        return;
      }

      case "match":
        this.runValuesResolution(expr.expr, localScope);
        for (const [pattern, subExpr] of expr.clauses) {
          this.runPatternResolution(pattern);
          const bindings = this.extractPatternIdentifiers(pattern);

          const newBindings: LocalScope = Object.fromEntries(
            bindings.map((b) => [b.name, b]),
          );
          this.runValuesResolution(subExpr, {
            ...localScope,
            ...newBindings,
          });
        }
        return;

      case "struct-literal":
      case "field-access":
        throw new Error("TODO resolution on: " + expr.type);
    }
  }

  private runPatternResolution(pattern: UntypedMatchPattern) {
    switch (pattern.type) {
      case "lit":
        return;

      case "identifier":
        return;

      case "constructor": {
        const res = this.evaluateResolution(pattern.name, pattern);
        if (res === undefined) {
          this.emitError({
            range: pattern.range,
            description: new UnboundVariable(pattern.name),
          });
          return;
        }
        this.identifiersResolutions.set(pattern, res);

        for (const arg of pattern.args) {
          this.runPatternResolution(arg);
        }
        return;
      }
    }
  }

  private evaluateResolution(
    name: string,
    identifier: ResolvableNode,
    localScope: LocalScope = {},
  ): IdentifierResolution | undefined {
    if (this.currentDeclaration === undefined) {
      throw new Error(
        "[unreachable] this.currentDeclaration should never be empty",
      );
    }

    if (identifier.type !== "infix" && identifier.namespace !== undefined) {
      const namespaceResolution = this.getImportedModule(identifier.namespace);
      return this.identifierResolution(name, namespaceResolution);
    }

    // search imported values
    const importedValueLookup = this.importedValues.get(name);
    if (importedValueLookup !== undefined) {
      return importedValueLookup;
    }

    if (identifier.type === "identifier") {
      const localLookup = localScope[name];
      if (localLookup !== undefined) {
        return { type: "local-variable", binding: localLookup };
      }
    }

    const resolution = this.identifierResolution(name, { type: "self" });

    if (
      resolution !== undefined &&
      resolution.type === "global-variable" &&
      resolution.namespace.type === "self"
    ) {
      defaultMapGet(this.callGraph, this.currentDeclaration, () => []).push(
        resolution.declaration,
      );
      if (!this.isThunk) {
        defaultMapGet(
          this.directCallGraph,
          this.currentDeclaration,
          () => [],
        ).push(resolution.declaration);
      }
    }

    return resolution;
  }

  private extractPatternIdentifiers(pattern: UntypedMatchPattern): Binding[] {
    switch (pattern.type) {
      case "identifier":
        return [pattern];

      case "lit":
        return [];

      case "constructor":
        return pattern.args.flatMap((arg) =>
          this.extractPatternIdentifiers(arg),
        );
    }
  }

  private checkUnusedVars(expr: Binding) {
    const isIgnored = expr.name.startsWith("_");
    if (isIgnored) {
      return;
    }

    if (this.unusedBindings.has(expr)) {
      this.emitError({
        range: expr.range,
        description: new UnusedVariable(expr.name, "local"),
      });
    }
  }

  private buildCallGraph(
    repr: WeakMap<UntypedDeclaration, UntypedDeclaration[]>,
  ): DirectedGraph<UntypedDeclaration> {
    return {
      toKey(node) {
        return node.binding.name;
      },
      getNeighbours(node) {
        return repr.get(node) ?? [];
      },
      getNodes: () => this.module.declarations,
    };
  }

  private identifierResolution(
    name: string,
    namespaceResolution: NamespaceResolution,
  ): IdentifierResolution | undefined {
    const analysis = this.getDependencyByNs(namespaceResolution);

    const variantLookup = analysis.locallyDefinedVariants.get(name);
    if (variantLookup !== undefined) {
      const [declaration, variant] = variantLookup;
      return {
        type: "constructor",
        namespace: namespaceResolution,
        declaration,
        variant,
      };
    }

    const globalDeclarationLookup =
      analysis.locallyDefinedDeclarations.get(name);
    if (globalDeclarationLookup !== undefined) {
      return {
        type: "global-variable",
        declaration: globalDeclarationLookup,
        namespace: namespaceResolution,
      };
    }

    return undefined;
  }
}
