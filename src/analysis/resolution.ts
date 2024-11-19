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
} from "../errors";
import {
  Binding,
  TypeAst,
  UntypedDeclaration,
  UntypedExpr,
  UntypedMatchPattern,
  UntypedModule,
  UntypedTypeDeclaration,
  UntypedTypeVariant,
} from "../parser";

type LocalScope = Record<string, Binding>;

export type TypeResolution = {
  declaration: UntypedTypeDeclaration;
  ns: string;
};

export type IdentifierResolution =
  | {
      type: "local-variable";
      binding: Binding;
    }
  | {
      type: "global-variable";
      declaration: UntypedDeclaration;
      namespace: string;
    }
  | {
      type: "constructor";
      variant: UntypedTypeVariant;
      declaration: UntypedTypeDeclaration & { type: "adt" };
      namespace: string;
    };

export type ResolvableNode =
  | (UntypedExpr & { type: "identifier" })
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

  private unusedBindings = new WeakSet<Binding>();
  private identifiersResolutions = new WeakMap<
    ResolvableNode,
    IdentifierResolution
  >();

  private typesResolutions = new WeakMap<
    TypeAst & { type: "named" },
    TypeResolution
  >();

  constructor(
    private ns: string,
    private module: UntypedModule,
    private emitError: (error: ErrorInfo) => void,
  ) {
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
          throw new Error("TODO handle struct");
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
    for (const letDecl of this.module.declarations) {
      if (letDecl.extern) {
        continue;
      }

      this.currentDeclaration = letDecl;
      this.runValuesResolution(letDecl.value, {});
    }
  }

  private runNamedTypeResolution(typeAst: TypeAst & { type: "named" }) {
    const localT = this.locallyDefinedTypes.get(typeAst.name);
    if (localT !== undefined) {
      this.typesResolutions.set(typeAst, {
        declaration: localT,
        ns: this.ns,
      });
      return;
    }

    this.emitError({
      description: new UnboundType(typeAst.name),
      range: typeAst.range,
    });

    // TODO check imported and check if is qualified
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

  private runValuesResolution(
    expr: UntypedExpr,
    localScope: LocalScope,
  ): undefined {
    switch (expr.type) {
      case "syntax-err":
      case "constant":
        return;

      case "identifier": {
        const res = this.evaluateResolution(expr, localScope);
        if (res === undefined) {
          this.emitError({
            range: expr.range,
            description: new UnboundVariable(expr.name),
          });
          return;
        }

        this.identifiersResolutions.set(expr, res);
        switch (res.type) {
          case "local-variable":
            this.unusedBindings.delete(res.binding);
            break;

          case "global-variable":
          case "constructor":
            break;
        }

        return;
      }

      case "fn": {
        for (const arg of expr.params) {
          this.runPatternResolution(arg, localScope);
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
        ).map((p) => [p.name, p] as const);
        for (const [_, binding] of bindingsEntries) {
          this.unusedBindings.add(binding);
        }

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
          this.runPatternResolution(pattern, localScope);
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

      case "let#":
      case "infix":
      case "struct-literal":
      case "field-access":
        throw new Error("TODO resolution on: " + expr.type);
    }
  }

  private runPatternResolution(
    pattern: UntypedMatchPattern,
    scope: LocalScope,
  ) {
    switch (pattern.type) {
      case "lit":
        return;

      case "identifier":
        return;

      case "constructor": {
        const res = this.evaluateResolution(pattern);
        if (res === undefined) {
          this.emitError({
            range: pattern.range,
            description: new UnboundVariable(pattern.name),
          });
          return;
        }
        this.identifiersResolutions.set(pattern, res);

        for (const arg of pattern.args) {
          this.runPatternResolution(arg, scope);
        }
        return;
      }
    }
  }

  private evaluateResolution(
    identifier: ResolvableNode,
    localScope: LocalScope = {},
  ): IdentifierResolution | undefined {
    const currentDeclaration = this.currentDeclaration;
    if (currentDeclaration === undefined) {
      throw new Error(
        "[unrechable] this.currentDeclaration should never be empty",
      );
    }

    // Search locals first
    if (identifier.type === "identifier") {
      const localLookup = localScope[identifier.name];
      if (localLookup !== undefined) {
        return { type: "local-variable", binding: localLookup };
      }
    }

    // search variants
    const variantLookup = this.locallyDefinedVariants.get(identifier.name);
    if (variantLookup !== undefined) {
      const [declaration, variant] = variantLookup;

      return {
        type: "constructor",
        namespace: this.ns,
        declaration,
        variant,
      };
    }

    // TODO search locallyDefinedDeclarations instead
    for (const declaration of this.module.declarations) {
      if (declaration.binding.name === identifier.name) {
        defaultMapGet(this.callGraph, currentDeclaration, () => []).push(
          declaration,
        );
        if (!this.isThunk) {
          defaultMapGet(
            this.directCallGraph,
            currentDeclaration,
            () => [],
          ).push(declaration);
        }

        return {
          type: "global-variable",
          declaration,
          namespace: this.ns,
        };
      }
    }
    return undefined;
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
}