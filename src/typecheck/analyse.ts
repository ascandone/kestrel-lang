/* eslint-disable require-yield */
import {
  ErrorInfo,
  InvalidPipe,
  OccursCheck,
  TraitNotSatified,
  TypeMismatch,
  UnboundType,
  UnboundVariable,
  UnusedVariable,
} from "../errors";
import {
  Binding,
  ConstLiteral,
  RangeMeta,
  TypeAst,
  UntypedDeclaration,
  UntypedExpr,
  UntypedImport,
  UntypedMatchPattern,
  UntypedModule,
  UntypedTypeDeclaration,
  UntypedTypeVariant,
  parse,
} from "../parser";
import { bool, char, float, int, list, string } from "./core";
import { TraitImpl, defaultTraitImpls } from "./defaultImports";
import {
  PolyType,
  TVar,
  Type,
  UnifyError,
  generalizeAsScheme,
  instantiate,
  unify,
} from "./type";

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

export type Deps = Record<string, Analysis>;

export type AnalyseOptions = {
  dependencies?: Deps;
  implicitImports?: UntypedImport[];
  mainType?: Type;
};

export type TypedNode = Binding | UntypedExpr;
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

export type TypeResolution = {
  declaration: UntypedTypeDeclaration;
  ns: string;
};

type LocalScope = Record<string, Binding>;

class ResolutionAnalysis {
  /** record of types declared in this module */
  private locallyDefinedTypes = new Map<string, UntypedTypeDeclaration>();
  /** record of variants declared in this module */
  private locallyDefinedVariants = new Map<
    string,
    [UntypedTypeDeclaration & { type: "adt" }, UntypedTypeVariant]
  >();

  private unusedBindings = new WeakSet<Binding>();
  private identifiersResolutions = new WeakMap<
    UntypedExpr & { type: "identifier" },
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
  }

  public resolveIdentifier(
    identifier: UntypedExpr & { type: "identifier" },
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
      this.locallyDefinedTypes.set(typeDecl.name, typeDecl);
    }

    // 2. register and resolve constructors and fields
    for (const typeDecl of this.module.typeDeclarations) {
      switch (typeDecl.type) {
        case "adt":
          for (const variant of typeDecl.variants) {
            this.locallyDefinedVariants.set(variant.name, [typeDecl, variant]);
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
        const paramsBindings = expr.params
          .flatMap((p) => this.extractPatternIdentifiers(p))
          .map((p) => [p.name, p]);

        this.runValuesResolution(expr.body, {
          ...localScope,
          ...Object.fromEntries(paramsBindings),
        });
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

      case "let#":
      case "infix":
      case "struct-literal":
      case "field-access":
      case "match":
        throw new Error("TODO resolution on: " + expr.type);
    }
  }

  private evaluateResolution(
    identifier: UntypedExpr & { type: "identifier" },
    localScope: LocalScope = {},
  ): IdentifierResolution | undefined {
    // Search locals first
    const localLookup = localScope[identifier.name];
    if (localLookup !== undefined) {
      return { type: "local-variable", binding: localLookup };
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
      case "constructor":
        throw new Error("TODO handle pattern of type: " + pattern.type);
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
}

export class Analysis {
  errors: ErrorInfo[] = [];

  private typeAnnotations = new WeakMap<TypedNode, TVar>();
  private module: UntypedModule;
  private resolution: ResolutionAnalysis;

  constructor(
    public readonly ns: string,
    public readonly source: string,
    public options: AnalyseOptions = {},
  ) {
    const parseResult = parse(source);
    // TODO push parsing/lexer errs in errs

    this.module = parseResult.parsed;
    this.resolution = new ResolutionAnalysis(
      ns,
      this.module,
      this.errors.push.bind(this.errors),
    );

    this.initDeclarationsTypecheck();
  }

  private initDeclarationsTypecheck() {
    for (const letDecl of this.module.declarations) {
      this.typecheckLetDeclaration(letDecl);
    }
  }

  private typecheckLetDeclaration(decl: UntypedDeclaration) {
    if (decl.typeHint !== undefined) {
      const typeHintType = this.typeAstToType(decl.typeHint.mono, {});
      this.unifyNode(decl.binding, typeHintType);
    }
    if (decl.extern) {
      return;
    }

    this.typecheckExpr(decl.value);
    this.unifyNodes(decl.binding, decl.value);
  }

  private unifyNode(node: TypedNode, type: Type) {
    const err = unify(this.getType(node), type);
    if (err !== undefined) {
      this.errors.push(unifyErrToErrorInfo(node, err));
      return;
    }
  }

  private unifyNodes(left: TypedNode, right: TypedNode) {
    this.unifyNode(left, this.getType(right));
  }

  private typecheckExpr(expr: UntypedExpr): undefined {
    switch (expr.type) {
      case "syntax-err":
        return;

      case "constant":
        this.unifyNode(expr, getConstantType(expr.value));
        return;

      case "identifier": {
        const resolution = this.resolution.resolveIdentifier(expr);
        if (resolution === undefined) {
          // error was already emitted during resolution
          return;
        }

        switch (resolution.type) {
          case "global-variable":
            // TODO instantiate
            // TODO check order
            this.unifyNodes(expr, resolution.declaration.binding);
            return;

          case "local-variable":
            this.unifyNodes(expr, resolution.binding);
            return;

          case "constructor": {
            const mono = instantiate(
              this.getVariantType(resolution.variant, resolution.declaration),
            );
            this.unifyNode(expr, mono);
            return;
          }
        }
      }

      case "fn":
        this.unifyNode(expr, {
          type: "fn",
          args: expr.params.map((pattern) => {
            if (pattern.type !== "identifier") {
              throw new Error("handle pattern != ident");
            }
            return this.getType(pattern);
          }),
          return: this.getType(expr.body),
        });
        this.typecheckExpr(expr.body);
        return;

      case "application":
        this.typecheckExpr(expr.caller);
        this.unifyNode(expr.caller, {
          type: "fn",
          args: expr.args.map((arg) => this.getType(arg)),
          return: this.getType(expr),
        });
        for (const arg of expr.args) {
          this.typecheckExpr(arg);
        }
        return;

      case "if":
        this.unifyNode(expr.condition, bool);
        this.unifyNodes(expr, expr.then);
        this.unifyNodes(expr, expr.else);

        this.typecheckExpr(expr.condition);
        this.typecheckExpr(expr.then);
        this.typecheckExpr(expr.else);
        return;

      case "let":
        this.unifyNodes(expr, expr.value);

        this.typecheckExpr(expr.body);
        this.typecheckExpr(expr.value);
        return;

      case "list-literal": {
        const listType = TVar.fresh().asType();
        this.unifyNode(expr, list(listType));
        for (const value of expr.values) {
          this.unifyNode(value, listType);
          this.typecheckExpr(value);
        }
        return;
      }

      case "pipe": {
        if (expr.right.type !== "application") {
          this.errors.push({
            range: expr.right.range,
            description: new InvalidPipe(),
          });
          return;
        }

        // Do not typecheck 'expr.right' recursively: function has wrong number of args
        this.typecheckExpr(expr.right.caller);
        this.typecheckExpr(expr.left);
        this.unifyNode(expr.right.caller, {
          type: "fn",
          args: [
            this.getType(expr.left),
            ...expr.right.args.map((arg) => this.getType(arg)),
          ],
          return: this.getType(expr),
        });
        return;
      }

      case "let#":
      case "infix":
      case "struct-literal":
      case "field-access":
      case "match":
        throw new Error("TODO handle typecheck of: " + expr.type);
    }
  }

  private typeAstToType(t: TypeAst, boundTypes: Record<string, Type>): Type {
    switch (t.type) {
      case "named": {
        const resolved = this.resolution.resolveType(t);
        if (resolved === undefined) {
          throw new Error("TODO handle undefined type: " + t.name);
        }

        return {
          type: "named",
          args: t.args.map((arg) => this.typeAstToType(arg, boundTypes)),
          moduleName: resolved.ns,
          name: resolved.declaration.name,
        };
      }

      case "fn":
        return {
          type: "fn",
          args: t.args.map((arg) => this.typeAstToType(arg, boundTypes)),
          return: this.typeAstToType(t.return, boundTypes),
        };

      case "var": {
        const lookup = boundTypes[t.ident];
        if (lookup === undefined) {
          const fresh = TVar.fresh().asType();
          boundTypes[t.ident] = fresh;
          return fresh;
        }
        return lookup;
      }

      case "any":
        return TVar.fresh().asType();
    }
  }

  private getVariantType(
    variant: UntypedTypeVariant,
    declaration: UntypedTypeDeclaration & { type: "adt" },
  ): PolyType {
    // TODO cache and generalize

    const params = declaration.params.map((p): [string, Type] => [
      p.name,
      TVar.fresh().asType(),
    ]);

    const ret: Type = {
      type: "named",
      name: declaration.name,
      moduleName: this.ns, // TODO handle imported
      args: params.map((p) => p[1]),
    };

    let mono: Type;
    if (variant.args.length === 0) {
      mono = ret;
    } else {
      mono = {
        type: "fn",
        args: variant.args.map((arg) =>
          this.typeAstToType(arg, Object.fromEntries(params)),
        ),
        return: ret,
      };
    }

    return [generalizeAsScheme(mono), mono];
  }

  // --- Public interface
  getType(node: TypedNode): Type {
    const lookup = this.typeAnnotations.get(node);
    if (lookup === undefined) {
      // initialize node
      const tvar = TVar.fresh();
      this.typeAnnotations.set(node, tvar);
      return tvar.asType();
    }
    return lookup.asType();
  }

  *getDeclarations(): Generator<UntypedDeclaration> {
    for (const decl of this.module.declarations) {
      yield decl;
    }
  }

  *getPublicDeclarations(): Generator<UntypedDeclaration> {
    for (const decl of this.getDeclarations()) {
      if (decl.pub) {
        yield decl;
      }
    }
  }
}

function unifyErrToErrorInfo(node: RangeMeta, e: UnifyError): ErrorInfo {
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

// Keep this in sync with core
function getConstantType(x: ConstLiteral): Type {
  // Keep this in sync with core
  switch (x.type) {
    case "int":
      return int;

    case "float":
      return float;

    case "string":
      return string;

    case "char":
      return char;
  }
}
