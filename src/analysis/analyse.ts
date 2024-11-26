import {
  ArityMismatch,
  ErrorInfo,
  InvalidPipe,
  OccursCheck,
  TraitNotSatified_REWRITE,
  TypeMismatch_REWRITE,
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
} from "../parser";
import { IdentifierResolution, ResolutionAnalysis } from "./resolution";
import {
  Type,
  Instantiator,
  Unifier,
  TypeMismatchError,
  OccursCheckError,
  MissingTraitError,
} from "../type";
import { bool, char, float, int, list, string } from "./coreTypes";
import { TypeAstsHydration } from "./typesHydration";
import { defaultMapGet } from "../data/defaultMap";

export type AnalyseOptions = {
  getDependency?: (namespace: string) => Analysis | undefined;
  implicitImports?: UntypedImport[];
  mainType?: Type;
};

// | UntypedDeclaration // TODO do we also need UntypedDeclaration too instead of just Binding?
export type TypedNode = Binding | UntypedExpr | UntypedMatchPattern;

export class Analysis {
  public readonly errors: ErrorInfo[] = [];

  private readonly typeAnnotations = new WeakMap<TypedNode, Type>();

  private readonly resolution: ResolutionAnalysis;
  private readonly typesHydration: TypeAstsHydration;
  private currentDeclarationGroup: UntypedDeclaration[] = [];
  private readonly unifier = new Unifier();

  constructor(
    public readonly package_: string,
    public readonly ns: string,
    public readonly module: UntypedModule,
    public readonly options: AnalyseOptions = {},
  ) {
    const getDependencyResolutionAnalysis = (
      ns: string,
    ): ResolutionAnalysis | undefined => {
      const dep = options.getDependency?.(ns);
      if (dep === undefined) {
        return undefined;
      }
      return dep.resolution;
    };

    const emitError = this.errors.push.bind(this.errors);
    this.resolution = new ResolutionAnalysis(
      this.package_,
      ns,
      module,
      emitError,
      getDependencyResolutionAnalysis,
      options.implicitImports,
    );
    this.typesHydration = new TypeAstsHydration(
      this.package_,
      ns,
      module,
      this.resolution,
      emitError,
    );

    // Typecheck each declaration
    for (const declGroup of this.resolution.sortedDeclarations) {
      this.currentDeclarationGroup = declGroup;
      for (const letDecl of declGroup) {
        this.typecheckLetDeclaration(letDecl);
      }
    }
  }

  private typecheckLetDeclaration(decl: UntypedDeclaration) {
    if (decl.extern) {
      const [typeHintType, traitsMap] = this.typesHydration.getAstPolytype(
        decl.typeHint,
      );
      this.typeAnnotations.set(
        decl.binding,
        this.unifier.instantiate(typeHintType, false, traitsMap),
      );
      return;
    }

    // TODO properly apply hint
    if (decl.typeHint) {
      const typeHintType = this.typesHydration.getPolyType(decl.typeHint);
      this.unifyNode(decl.value, this.unifier.instantiate(typeHintType, false));
    }

    this.typecheckExpr(decl.value);
    this.unifyNodes(decl.value, decl.binding);

    // const valueType = this.getType(decl.value);
    // TODO traverse typeHint and compare with polyType
    // const typeHintType = this.typesHydration.getType(decl.typeHint);
    // const err = applyHint(valueType, typeHintType);
    // if (err !== undefined) {
    //   // TODO better position
    //   this.errors.push(unifyErrToErrorInfo(decl.value, err));
    // }
  }

  private typecheckResolvedIdentifier(
    expr: UntypedExpr,
    resolution: IdentifierResolution,
  ) {
    switch (resolution.type) {
      case "global-variable": {
        const isRecursive = this.currentDeclarationGroup.includes(
          resolution.declaration,
        );
        if (isRecursive) {
          const mono = this.getRawType(resolution.declaration.binding);
          this.unifyNode(expr, mono);
          return;
        }

        const analysis = this.getDependencyByNs(resolution.namespace);

        const poly = analysis.getType(resolution.declaration.binding);
        this.unifyNode(expr, this.unifier.instantiate(poly, false));
        return;
      }

      case "local-variable":
        this.unifyNodes(expr, resolution.binding);
        return;

      case "constructor": {
        const analysis =
          resolution.namespace === this.ns
            ? this
            : this.options.getDependency?.(resolution.namespace);

        if (analysis === undefined) {
          // probably unreachable
          throw new Error("TODO handle");
        }

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

        const mono = this.unifier.instantiate(constructorType, false);

        this.unifyNode(expr, mono);
        return;
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

        this.typecheckResolvedIdentifier(expr, resolution);
        return;
      }

      case "fn":
        this.unifyNode(expr, {
          tag: "Fn",
          args: expr.params.map((pattern) => {
            this.typecheckPattern(pattern);
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
        this.unifyNodes(expr, expr.value);

        this.typecheckExpr(expr.body);
        this.typecheckExpr(expr.value);
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
          this.typecheckPattern(nestedPattern);
        }
        return;
      }
    }
  }

  private getDependencyByNs(namespace: string): Analysis {
    const analysis =
      namespace === this.ns ? this : this.options.getDependency?.(namespace);

    if (analysis === undefined) {
      throw new Error("[unreachable] unbound analaysis");
    }
    return analysis;
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
