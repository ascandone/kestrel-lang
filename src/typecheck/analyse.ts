/* eslint-disable require-yield */
import {
  DuplicateDeclaration,
  DuplicateTypeDeclaration,
  ErrorInfo,
  InvalidCatchall,
  InvalidPipe,
  InvalidTypeArity,
  OccursCheck,
  TraitNotSatified,
  TypeMismatch,
  TypeParamShadowing,
  UnboundType,
  UnboundTypeParam,
  UnboundVariable,
  UnusedVariable,
} from "../errors";
import {
  Binding,
  ConstLiteral,
  PolyTypeAst,
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
  TypeScheme,
  UnifyError,
  generalizeAsScheme,
  instantiate,
  resolveType,
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

export type TypedNode = Binding | UntypedExpr | UntypedMatchPattern;

export type ResolvableNode =
  | (UntypedExpr & { type: "identifier" })
  | (UntypedMatchPattern & { type: "constructor" });
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

      case "match":
        this.runValuesResolution(expr.expr, localScope);
        for (const [pattern, subExpr] of expr.clauses) {
          this.runValuesResolution(subExpr, localScope);
          this.runPatternResolution(pattern);
        }
        return;

      case "let#":
      case "infix":
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
          this.runPatternResolution(arg);
        }
        return;
      }
    }
  }

  private evaluateResolution(
    identifier: ResolvableNode,
    localScope: LocalScope = {},
  ): IdentifierResolution | undefined {
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

export type PolytypeNode = UntypedTypeDeclaration | PolyTypeAst | TypeAst;

class TypeAstsHydration {
  private polyTypes = new WeakMap<PolytypeNode, PolyType>();
  public getPolytype(node: PolytypeNode): PolyType {
    const t = this.polyTypes.get(node);
    if (t === undefined) {
      throw new Error("[unreachable] unbounde polytype");
    }
    return t;
  }

  constructor(
    private ns: string,
    private module: UntypedModule,
    private resolution: ResolutionAnalysis,
    private emitError: (error: ErrorInfo) => void,
  ) {
    this.initHydrateTypes();
  }

  private initHydrateTypes() {
    for (const declaration of this.module.typeDeclarations) {
      this.initHydrateTypeDeclaration(declaration);
    }

    for (const declaration of this.module.declarations) {
      if (declaration.typeHint !== undefined) {
        const poly = this.typeAstToPoly(declaration.typeHint.mono, {}, false);
        this.polyTypes.set(declaration.typeHint, poly);
      }
    }
  }

  private initHydrateTypeDeclaration(declaration: UntypedTypeDeclaration) {
    const bound: Record<string, Type> = {};
    const args = declaration.params.map((p): Type => {
      if (bound[p.name] !== undefined) {
        this.emitError({
          description: new TypeParamShadowing(p.name),
          range: p.range,
        });
      }

      const fresh = TVar.fresh().asType();
      bound[p.name] = fresh;
      return fresh;
    });

    const type: Type = {
      type: "named",
      name: declaration.name,
      moduleName: this.ns,
      args,
    };

    const scheme = generalizeAsScheme(type);
    this.polyTypes.set(declaration, [scheme, type]);
    switch (declaration.type) {
      case "adt":
        for (const variant of declaration.variants) {
          for (const arg of variant.args) {
            const p = this.typeAstToPoly(arg, bound, true);
            this.polyTypes.set(arg, p);
          }
        }
        return;

      case "struct":
        throw new Error("handle struct types hydration");

      case "extern":
        return;
    }
  }

  private typeAstToPoly(
    t: TypeAst,
    boundTypes: Record<string, Type>,
    forbidUnbound: boolean,
  ): PolyType {
    const scheme: TypeScheme = {};
    const recur = (t: TypeAst): Type => {
      switch (t.type) {
        case "any":
          if (forbidUnbound) {
            this.emitError({
              description: new InvalidCatchall(),
              range: t.range,
            });
          }
          return TVar.fresh().asType();

        case "var": {
          return getOrWriteDefault(boundTypes, t.ident, (): Type => {
            if (forbidUnbound) {
              this.emitError({
                description: new UnboundTypeParam(t.ident),
                range: t.range,
              });
            }

            const [tvar, id] = TVar.freshWithId();
            scheme[id] = t.ident;
            return tvar.asType();
          });
        }

        case "named": {
          const resolved = this.resolution.resolveType(t);
          if (resolved === undefined) {
            return TVar.fresh().asType();
          }

          if (resolved.declaration.params.length !== t.args.length) {
            this.emitError({
              description: new InvalidTypeArity(
                resolved.declaration.name,
                resolved.declaration.params.length,
                t.args.length,
              ),
              range: t.range,
            });
          }

          return {
            type: "named",
            args: t.args.map((arg) => recur(arg)),
            moduleName: resolved.ns,
            name: resolved.declaration.name,
          };
        }

        case "fn":
          return {
            type: "fn",
            args: t.args.map((arg) => recur(arg)),
            return: recur(t.return),
          };
      }
    };

    return [scheme, recur(t)];
  }
}

export class Analysis {
  errors: ErrorInfo[] = [];

  private typeDeclarationsAnnotations = new WeakMap<
    UntypedDeclaration,
    PolyType
  >();
  private typeAnnotations = new WeakMap<TypedNode, TVar>();
  private module: UntypedModule;

  private resolution: ResolutionAnalysis;
  private typesHydration: TypeAstsHydration;

  constructor(
    public readonly ns: string,
    public readonly source: string,
    public options: AnalyseOptions = {},
  ) {
    const parseResult = parse(source);
    const emitError = this.errors.push.bind(this.errors);

    // TODO push parsing/lexer errs in errs

    this.module = parseResult.parsed;
    this.resolution = new ResolutionAnalysis(ns, this.module, emitError);
    this.typesHydration = new TypeAstsHydration(
      ns,
      this.module,
      this.resolution,
      emitError,
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
      const typeHintType = this.typesHydration.getPolytype(decl.typeHint);
      this.typeDeclarationsAnnotations.set(decl, typeHintType);
    }

    if (decl.extern) {
      return;
    }

    this.typecheckExpr(decl.value);

    const valueType = this.getType(decl.value);

    if (decl.typeHint !== undefined) {
      // TODO traverse typeHint and compare with polyType
      const typeHintType = this.typesHydration.getPolytype(decl.typeHint);
      const err = applyHint(valueType, typeHintType);
      if (err !== undefined) {
        // TODO better position
        this.errors.push(unifyErrToErrorInfo(decl.value, err));
      }
    } else {
      const scheme = generalizeAsScheme(valueType);
      this.typeDeclarationsAnnotations.set(decl, [scheme, valueType]);
    }
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
          case "global-variable": {
            // TODO instantiate
            // TODO check order

            // TODO handle external ns
            const poly = this.typeDeclarationsAnnotations.get(
              resolution.declaration,
            );
            if (poly === undefined) {
              throw new Error(
                "TODO handle unresolved type for: " +
                  resolution.declaration.binding.name,
              );
            }

            this.unifyNode(expr, instantiate(poly));
            return;
          }

          case "local-variable":
            this.unifyNodes(expr, resolution.binding);
            return;

          case "constructor": {
            const [scheme, declarationType] = this.typesHydration.getPolytype(
              resolution.declaration,
            );

            const constructorType = ((): Type => {
              if (resolution.variant.args.length === 0) {
                return declarationType;
              } else {
                return {
                  type: "fn",
                  args: resolution.variant.args.map(
                    (arg) => this.typesHydration.getPolytype(arg)[1],
                  ),
                  return: declarationType,
                };
              }
            })();

            const mono = instantiate([scheme, constructorType]);
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

      case "match":
        this.typecheckExpr(expr.expr);
        for (const [pattern, subExpr] of expr.clauses) {
          this.unifyNodes(subExpr, expr);
          this.unifyNodes(expr.expr, pattern);
          this.typecheckExpr(subExpr);
          this.typecheckPattern(pattern);
        }
        return;

      case "let#":
      case "infix":
      case "struct-literal":
      case "field-access":
        throw new Error("TODO handle typecheck of: " + expr.type);
    }
  }

  private typecheckPattern(p: UntypedMatchPattern): undefined {
    switch (p.type) {
      case "lit":
        this.unifyNode(p, getConstantType(p.literal));
        return;

      case "constructor": {
        const resolution = this.resolution.resolveIdentifier(p);
        if (resolution === undefined || resolution.type !== "constructor") {
          throw new Error("TODO tc pattern of type:  " + p.type);
          return;
        }

        const declarationType = this.typesHydration.getPolytype(
          resolution.declaration,
        );

        const t = instantiate(declarationType);
        this.unifyNode(p, t);

        return;
      }

      case "identifier":
        return;
    }
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

  getDeclarationType(node: UntypedDeclaration): PolyType {
    const t = this.typeDeclarationsAnnotations.get(node);
    if (t === undefined) {
      throw new Error("[unrechable] undefined decl");
    }

    return t;
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

function getOrWriteDefault<T, K extends string | number = string>(
  r: Record<K, T>,
  k: K,
  onDefault: () => T,
): T {
  const lookup = r[k];
  if (lookup !== undefined) {
    return lookup;
  }
  const defaultValue = onDefault();
  r[k] = defaultValue;
  return defaultValue;
}

function applyHint(
  valueType: Type,
  [scheme, hintMono]: PolyType,
): UnifyError | undefined {
  const resT = resolveType(valueType),
    resHint = resolveType(hintMono);

  switch (resHint.type) {
    case "named":
      if (resT.type === "named") {
        if (resT.name !== resHint.name) {
          return { type: "type-mismatch", left: resT, right: resHint };
        }

        for (let i = 0; i < resHint.args.length; i++) {
          const err = applyHint(resT.args[i]!, [scheme, resHint.args[i]!]);
          if (err !== undefined) {
            return err;
          }
        }
      }
      return unify(valueType, resHint);

    case "fn":
      if (resT.type === "fn") {
        // TODO mismatched number of args
        for (let i = 0; i < resHint.args.length; i++) {
          const err = unify(resT.args[i]!, resHint.args[i]!);
          if (err !== undefined) {
            return err;
          }
        }

        const err = applyHint(resT.return, [scheme, resHint.return]);
        if (err !== undefined) {
          return err;
        }

        return;
      }

      return unify(valueType, resHint);

    case "unbound": {
      const bound = scheme[resHint.id];
      if (bound === undefined) {
        return unify(valueType, hintMono);
      } else {
        unify(valueType, TVar.fresh().asType());

        return {
          type: "type-mismatch",
          left: valueType,
          right: hintMono,
        };
      }
    }
  }
}
