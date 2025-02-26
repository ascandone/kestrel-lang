import {
  ArityMismatch,
  ErrorInfo,
  InvalidPipe,
  ParsingError,
  OccursCheck,
  TraitNotSatified_REWRITE,
  TypeMismatch_REWRITE,
  NonExhaustiveMatch,
} from "./errors";
import {
  Binding,
  ConstLiteral,
  UntypedDeclaration,
  UntypedExpr,
  UntypedImport,
  UntypedMatchPattern,
  UntypedModule,
  Range,
  parse,
} from "../parser";
import {
  IdentifierResolution,
  NamespaceResolution,
  ResolutionAnalysis,
} from "./resolution";
import {
  Type,
  Instantiator,
  Unifier,
  TypeMismatchError,
  OccursCheckError,
  MissingTraitError,
  TraitsMap,
  typePPrint,
} from "../type";
import { bool, char, float, int, list, string } from "./coreTypes";
import { TypeAstsHydration } from "./typesHydration";
import { defaultMapGet } from "../data/defaultMap";
import { TraitRegistry } from "../type/traitsRegistry";

export type AnalyseOptions = {
  baseTraitsRegistry?: TraitRegistry;
  getDependency?: (namespace: string) => Analysis | undefined;
  implicitImports?: UntypedImport[];
  mainType?: Type;
};

// | UntypedDeclaration // TODO do we also need UntypedDeclaration too instead of just Binding?
export type TypedNode = Binding | UntypedExpr | UntypedMatchPattern;

export class Analysis {
  public readonly errors: ErrorInfo[] = [];
  public readonly module: UntypedModule;

  private readonly typeAnnotations = new WeakMap<TypedNode, Type>();
  /** Only meant for top level declarations */
  private readonly traitMapAnnotations = new WeakMap<
    Binding<unknown>,
    TraitsMap
  >();

  public readonly resolution: ResolutionAnalysis;
  private readonly typesHydration: TypeAstsHydration;
  private currentDeclarationGroup: UntypedDeclaration[] = [];

  private readonly unifier: Unifier;
  public readonly traitsRegistry: TraitRegistry;

  constructor(
    public readonly package_: string,
    public readonly ns: string,
    public readonly source: string,
    public readonly options: AnalyseOptions = {},
  ) {
    const [module, parseErrors] = parse(source);

    for (const err of parseErrors) {
      this.errors.push({
        description: new ParsingError(err.description),
        range: err.range,
      });
    }

    this.module = module;
    const emitError = this.errors.push.bind(this.errors);

    this.traitsRegistry = new TraitRegistry(options.baseTraitsRegistry);

    this.unifier = new Unifier(this.traitsRegistry);

    this.resolution = new ResolutionAnalysis(
      this.package_,
      ns,
      module,
      emitError,
      options.getDependency,
      options.implicitImports,
    );
    this.typesHydration = new TypeAstsHydration(
      this.package_,
      ns,
      module,
      this.resolution,
      this.traitsRegistry,
      emitError,
    );

    // Typecheck each declaration
    for (const declGroup of this.resolution.sortedDeclarations) {
      this.currentDeclarationGroup = declGroup;
      for (const letDecl of declGroup) {
        const [mono, traitsMap] = this.typecheckLetDeclaration(letDecl);
        this.typeAnnotations.set(letDecl.binding, mono);
        this.traitMapAnnotations.set(letDecl.binding, traitsMap);
      }
    }
  }

  private typecheckLetDeclaration(decl: UntypedDeclaration): [Type, TraitsMap] {
    if (decl.extern) {
      const [typeHintType, traitsMap] = this.typesHydration.getAstPolytype(
        decl.typeHint,
      );

      return [typeHintType, traitsMap];
    }

    // TODO properly apply hint
    if (decl.typeHint) {
      const typeHintType = this.typesHydration.getPolyType(decl.typeHint);
      this.unifyNode(decl.value, this.unifier.instantiate(typeHintType));
    }

    this.typecheckExpr(decl.value);

    // ↓ Needed for self-recursive bindings
    this.unifyNodes(decl.value, decl.binding);

    const mono = this.getType(decl.value);
    const traitsMap = extractTraitsMap(mono, (id) =>
      this.getResolvedTypeTraits(id),
    );

    return [mono, traitsMap];

    // const valueType = this.getType(decl.value);
    // TODO traverse typeHint and compare with polyType
    // const typeHintType = this.typesHydration.getType(decl.typeHint);
    // const err = applyHint(valueType, typeHintType);
    // if (err !== undefined) {
    //   // TODO better position
    //   this.errors.push(unifyErrToErrorInfo(decl.value, err));
    // }
  }

  private typecheckResolvedIdentifier(resolution: IdentifierResolution): Type {
    switch (resolution.type) {
      case "global-variable": {
        const isRecursive = this.currentDeclarationGroup.includes(
          resolution.declaration,
        );
        if (isRecursive) {
          return this.getRawType(resolution.declaration.binding);
        }

        const analysis = this.getDependencyByNs(resolution.namespace);

        const traitsMap = analysis.traitMapAnnotations.get(
          resolution.declaration.binding,
        );

        const poly = analysis.getRawType(resolution.declaration.binding);

        return this.unifier.instantiate(poly, traitsMap);
      }

      case "local-variable":
        return this.getRawType(resolution.binding);

      case "constructor": {
        const analysis = this.getDependencyByNs(resolution.namespace);

        const declarationType = analysis.typesHydration.getPolyType(
          resolution.declaration,
        );

        const constructorType: Type =
          resolution.variant.args.length === 0
            ? declarationType
            : {
                tag: "Fn",
                args: resolution.variant.args.map((arg) =>
                  analysis.typesHydration.getPolyType(arg),
                ),
                return: declarationType,
              };

        return this.unifier.instantiate(constructorType);
      }
    }
  }

  private typecheckExpr(expr: UntypedExpr): undefined {
    switch (expr.type) {
      case "syntax-err":
        return;

      case "block":
        this.unifyNodes(expr, expr.inner);
        this.typecheckExpr(expr.inner);
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

        const mono = this.typecheckResolvedIdentifier(resolution);
        this.unifyNode(expr, mono);
        return;
      }

      case "fn":
        this.unifyNode(expr, {
          tag: "Fn",
          args: expr.params.map((pattern) => {
            this.typecheckPattern(pattern, true);
            return this.getRawType(pattern);
          }),
          return: this.getRawType(expr.body),
        });
        this.typecheckExpr(expr.body);
        return;

      case "application":
        this.typecheckExpr(expr.caller);
        this.unifyNode(expr.caller, {
          tag: "Fn",
          args: expr.args.map((arg) => this.getRawType(arg)),
          return: this.getRawType(expr),
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
        this.typecheckExpr(expr.value);
        this.typecheckExpr(expr.body);
        this.typecheckPattern(expr.pattern, true);

        this.unifyNodes(expr, expr.body);
        this.unifyNodes(expr.pattern, expr.value);
        return;

      case "let#":
        this.unifyNode(expr.mapper, {
          tag: "Fn",
          args: [
            this.getRawType(expr.value),
            {
              tag: "Fn",
              args: [this.getRawType(expr.pattern)],
              return: this.getRawType(expr.body),
            },
          ],
          return: this.getRawType(expr),
        });

        this.typecheckExpr(expr.mapper);
        this.typecheckExpr(expr.value);
        this.typecheckExpr(expr.body);
        this.typecheckPattern(expr.pattern, true);
        return;

      case "list-literal": {
        const listType = this.unifier.freshVar();
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
          tag: "Fn",
          args: [
            this.getRawType(expr.left),
            ...expr.right.args.map((arg) => this.getRawType(arg)),
          ],
          return: this.getRawType(expr),
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

      case "infix": {
        this.typecheckExpr(expr.left);
        this.typecheckExpr(expr.right);

        const resolution = this.resolution.resolveIdentifier(expr);
        if (resolution === undefined) {
          // error was already emitted during resolution
          return;
        }

        this.unify(
          this.typecheckResolvedIdentifier(resolution),
          {
            tag: "Fn",
            args: [this.getRawType(expr.left), this.getRawType(expr.right)],
            return: this.getRawType(expr),
          },
          expr.range,
        );

        return;
      }

      case "field-access": {
        this.typecheckExpr(expr.struct);
        const structType = this.getType(expr.struct);

        if (structType.tag !== "Named") {
          throw new Error(
            "TODO handle struct with type: " + typePPrint(structType),
          );
        }

        // TODO this should include package as well
        const analysis =
          structType.module === this.ns
            ? this
            : this.options.getDependency?.(structType.module);
        if (analysis === undefined) {
          throw new Error("TODO handle undefinde dep: " + structType.module);
          return;
        }

        const fieldDeclaration = analysis.resolution.resolveField(
          structType.name,
          expr.field,
          this.ns,
          (e) => this.errors.push(e),
        );
        if (fieldDeclaration === undefined) {
          return;
        }

        const mono = analysis.typesHydration.getPolyType(
          fieldDeclaration.type_,
        );
        this.unifyNode(expr, mono);

        return;
      }

      case "struct-literal":
        throw new Error("TODO handle typecheck of: " + expr.type);
    }
  }

  private typecheckPattern(
    pattern: UntypedMatchPattern,
    forceExhaustive = false,
  ): undefined {
    switch (pattern.type) {
      case "identifier":
        return;

      case "lit":
        this.unifyNode(pattern, getConstantType(pattern.literal));
        if (forceExhaustive) {
          this.errors.push({
            description: new NonExhaustiveMatch(),
            range: pattern.range,
          });
        }
        return;

      case "constructor": {
        const resolution = this.resolution.resolveIdentifier(pattern);
        if (resolution === undefined || resolution.type !== "constructor") {
          return;
        }

        if (forceExhaustive && resolution.declaration.variants.length > 1) {
          this.errors.push({
            range: pattern.range,
            description: new NonExhaustiveMatch(),
          });
        }

        const analysis = this.getDependencyByNs(resolution.namespace);

        const declarationType = analysis.typesHydration.getPolyType(
          resolution.declaration,
        );

        const instantiator = new Instantiator(this.unifier);
        const t = instantiator.instantiate(declarationType);
        this.unifyNode(pattern, t);

        if (resolution.variant.args.length !== pattern.args.length) {
          this.errors.push({
            range: pattern.range,
            description: new ArityMismatch(
              resolution.variant.args.length,
              pattern.args.length,
            ),
          });
          return;
        }
        // TODO check resolution.variant.args.lenght=

        for (let i = 0; i < pattern.args.length; i++) {
          const nestedPattern = pattern.args[i]!,
            arg = resolution.variant.args[i]!;

          this.unifyNode(
            nestedPattern,
            instantiator.instantiate(this.typesHydration.getPolyType(arg)),
          );
          this.typecheckPattern(nestedPattern, forceExhaustive);
        }
        return;
      }
    }
  }

  private getDependencyByNs(namespace: NamespaceResolution): Analysis {
    switch (namespace.type) {
      case "self":
        return this;
      case "imported":
        return namespace.analysis;
    }
  }

  // Unify wrappers

  private unify(expected: Type, got: Type, range: Range) {
    try {
      this.unifier.unify(expected, got);
    } catch (error) {
      expected = this.unifier.resolve(expected);
      got = this.unifier.resolve(got);

      if (error instanceof TypeMismatchError) {
        this.errors.push({
          range,
          description: new TypeMismatch_REWRITE(expected, got),
        });
        return;
      }

      if (error instanceof OccursCheckError) {
        this.errors.push({
          range,
          description: new OccursCheck(),
        });
        return;
      }

      if (error instanceof MissingTraitError) {
        this.errors.push({
          range,
          description: new TraitNotSatified_REWRITE(got, error.trait),
        });
        return;
      }

      throw error;
    }
  }

  private unifyNode(node: TypedNode, type: Type) {
    this.unify(this.getRawType(node), type, node.range);
  }

  private unifyNodes(left: TypedNode, right: TypedNode) {
    this.unifyNode(left, this.getRawType(right));
  }

  /** Get the type without resolving it - or create it as fresh instead */
  private getRawType(node: TypedNode): Type {
    return defaultMapGet(this.typeAnnotations, node, () =>
      this.unifier.freshVar(),
    );
  }

  // --- Public interface

  /**
   * Get a resolved type
   */
  getType(node: TypedNode): Type {
    const type = this.getRawType(node);
    return this.unifier.resolve(type);
  }

  getPolyType(binding: Binding): [Type, (id: number) => string[]] {
    const traitMap = this.traitMapAnnotations.get(binding) ?? {};

    const unifier = new Unifier();
    const mono = unifier.instantiate(this.getRawType(binding), traitMap);

    return [mono, unifier.getResolvedTypeTraits.bind(unifier)];
  }

  getResolvedTypeTraits(id: number) {
    return this.unifier.getResolvedTypeTraits(id);
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

  *getDependencies(): Generator<UntypedImport> {
    for (const import_ of this.options.implicitImports ?? []) {
      yield import_;
    }

    for (const import_ of this.module.imports) {
      yield import_;
    }
  }
}

// Keep this in sync with core
function getConstantType(lit: ConstLiteral): Type {
  switch (lit.type) {
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

// TODO move to type
// function applyHint(
//   valueType: Type,
//   [scheme, hintMono]: PolyType,
// ): UnifyError | undefined {
//   const resT = resolveType(valueType),
//     resHint = resolveType(hintMono);

//   switch (resHint.type) {
//     case "named":
//       if (resT.type === "named") {
//         if (resT.name !== resHint.name) {
//           return { type: "type-mismatch", left: resT, right: resHint };
//         }

//         for (let i = 0; i < resHint.args.length; i++) {
//           const err = applyHint(resT.args[i]!, [scheme, resHint.args[i]!]);
//           if (err !== undefined) {
//             return err;
//           }
//         }
//       }
//       return unify(valueType, resHint);

//     case "fn":
//       if (resT.type === "fn") {
//         // TODO mismatched number of args
//         for (let i = 0; i < resHint.args.length; i++) {
//           const err = unify(resT.args[i]!, resHint.args[i]!);
//           if (err !== undefined) {
//             return err;
//           }
//         }

//         const err = applyHint(resT.return, [scheme, resHint.return]);
//         if (err !== undefined) {
//           return err;
//         }

//         return;
//       }

//       return unify(valueType, resHint);

//     case "unbound": {
//       const bound = scheme[resHint.id];
//       if (bound === undefined) {
//         return unify(valueType, hintMono);
//       } else {
//         unify(valueType, TVar.fresh().asType());

//         return {
//           type: "type-mismatch",
//           left: valueType,
//           right: hintMono,
//         };
//       }
//     }
//   }
// }

function extractTraitsMap(t: Type, getTraits: (id: number) => string[]) {
  const traitsMap: TraitsMap = {};
  function helper(t: Type) {
    switch (t.tag) {
      case "Fn":
        helper(t.return);
      case "Named":
        for (const arg of t.args) {
          helper(arg);
        }
        return;

      case "Var": {
        if (t.id in traitsMap) {
          return;
        }
        const traits = getTraits(t.id);
        traitsMap[t.id] = traits;
      }
    }
  }
  helper(t);
  return traitsMap;
}
