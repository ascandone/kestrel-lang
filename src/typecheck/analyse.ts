import {
  ErrorInfo,
  InvalidCatchall,
  InvalidPipe,
  InvalidTypeArity,
  OccursCheck,
  TraitNotSatified,
  TypeMismatch,
  TypeParamShadowing,
  UnboundTypeParam,
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
  parse,
} from "../parser";
import { bool, char, float, int, list, string } from "./core";
import { TraitImpl, defaultTraitImpls } from "./defaultImports";
import { ResolutionAnalysis } from "./resolution";
import {
  Instantiator,
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
            const [_scheme, mono] = this.typeAstToPoly(arg, bound, true);
            this.polyTypes.set(arg, [scheme, mono]);
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
            this.typecheckPattern(pattern);

            // if (pattern.type !== "identifier") {

            //   throw new Error("handle pattern != ident");
            // }
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

  private typecheckPattern(pattern: UntypedMatchPattern): undefined {
    switch (pattern.type) {
      case "identifier":
        return;

      case "lit":
        this.unifyNode(pattern, getConstantType(pattern.literal));
        return;

      case "constructor": {
        const resolution = this.resolution.resolveIdentifier(pattern);
        if (resolution === undefined || resolution.type !== "constructor") {
          return;
        }

        const declarationType = this.typesHydration.getPolytype(
          resolution.declaration,
        );

        const instantiator = new Instantiator();
        const t = instantiator.instantiate(declarationType);
        this.unifyNode(pattern, t);

        if (resolution.variant.args.length !== pattern.args.length) {
          throw new Error("TODO handle differnt args");
        }
        // TODO check resolution.variant.args.lenght=

        for (let i = 0; i < pattern.args.length; i++) {
          const nestedPattern = pattern.args[i]!,
            arg = resolution.variant.args[i]!;

          this.unifyNode(
            nestedPattern,
            instantiator.instantiate(this.typesHydration.getPolytype(arg)),
          );
          this.typecheckPattern(nestedPattern);
        }
        return;
      }
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
