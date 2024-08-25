/* eslint-disable require-yield */
import {
  ErrorInfo,
  InvalidPipe,
  OccursCheck,
  TraitNotSatified,
  TypeMismatch,
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
import { Deps } from "./resolutionStep";
import { PolyType, TVar, Type, UnifyError, instantiate, unify } from "./type";

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

type LocalScope = Record<string, Binding>;

export class Analysis {
  errors: ErrorInfo[] = [];

  /** record of types declared in this module */
  private locallyDefinedTypes = new Map<string, UntypedTypeDeclaration>();

  /** record of variants declared in this module */
  private locallyDefinedVariants = new Map<
    string,
    [UntypedTypeDeclaration & { type: "adt" }, UntypedTypeVariant]
  >();

  private identifiersResolutions = new WeakMap<
    UntypedExpr & { type: "identifier" },
    IdentifierResolution
  >();
  private unusedBindings = new WeakSet<Binding>();

  private typeAnnotations = new WeakMap<TypedNode, TVar>();
  private module: UntypedModule;

  constructor(
    public readonly ns: string,
    public readonly source: string,
    // private options: AnalyseOptions = {},
  ) {
    const parseResult = parse(source);
    // TODO push parsing/lexer errs in errs

    this.module = parseResult.parsed;

    this.initTypesResolution();
    this.initDeclarationsResolution();

    this.initDeclarationsTypecheck();
  }

  private initTypesResolution() {
    // 1. register all the types
    for (const typeDecl of this.module.typeDeclarations) {
      this.locallyDefinedTypes.set(typeDecl.name, typeDecl);
    }

    // 2. register constructors and fields
    for (const typeDecl of this.module.typeDeclarations) {
      switch (typeDecl.type) {
        case "adt":
          for (const variant of typeDecl.variants) {
            this.locallyDefinedVariants.set(variant.name, [typeDecl, variant]);
          }
          break;
        case "struct":
          throw new Error("TODO handle struct");
        case "extern":
          break;
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

  private initDeclarationsTypecheck() {
    for (const letDecl of this.module.declarations) {
      this.typecheckLetDeclaration(letDecl);
    }
  }

  private typecheckLetDeclaration(decl: UntypedDeclaration) {
    if (decl.typeHint !== undefined) {
      const typeHintType = this.typeAstToType(decl.typeHint.mono);
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
    for (const declaration of this.getDeclarations()) {
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
      this.errors.push({
        range: expr.range,
        description: new UnusedVariable(expr.name, "local"),
      });
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
          this.errors.push({
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

  private typecheckExpr(expr: UntypedExpr): undefined {
    switch (expr.type) {
      case "syntax-err":
        return;

      case "constant":
        this.unifyNode(expr, getConstantType(expr.value));
        return;

      case "identifier": {
        const resolution = this.identifiersResolutions.get(expr);
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

  private typeAstToType(t: TypeAst): Type {
    const helper = (t: TypeAst): Type => {
      switch (t.type) {
        case "named":
          // TODO actually resolve type
          return {
            type: "named",
            args: t.args.map((arg) => helper(arg)),
            moduleName: this.ns,
            name: t.name,
          };

        case "fn":
          return {
            type: "fn",
            args: t.args.map((arg) => helper(arg)),
            return: helper(t.return),
          };

        case "var":
          // TODO
          return TVar.fresh().asType();

        case "any":
          return TVar.fresh().asType();
      }
    };

    return helper(t);
  }

  private getVariantType(
    variant: UntypedTypeVariant,
    declaration: UntypedTypeDeclaration & { type: "adt" },
  ): PolyType {
    // TODO cache and generalize

    const ret: Type = {
      type: "named",
      args: [],
      moduleName: this.ns,
      name: declaration.name,
    };

    if (variant.args.length === 0) {
      return [{}, ret];
    }

    return [
      {},
      {
        type: "fn",
        args: variant.args.map((arg) => this.typeAstToType(arg)),
        return: ret,
      },
    ];
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
