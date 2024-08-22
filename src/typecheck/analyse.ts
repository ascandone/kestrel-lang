/* eslint-disable require-yield */
import {
  ErrorInfo,
  InvalidPipe,
  OccursCheck,
  TraitNotSatified,
  TypeMismatch,
  UnboundVariable,
} from "../errors";
import {
  Binding,
  ConstLiteral,
  SpanMeta,
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
import { bool, char, float, int, string } from "./core";
import { Deps } from "./resolutionStep";
import { TVar, Type, UnifyError, unify } from "./type";

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

  private identifiersResolutions = new WeakMap<
    UntypedExpr & { type: "identifier" },
    IdentifierResolution
  >();
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

    this.initAnalysis();
  }

  private initAnalysis() {
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

    this.runResolution(decl.value, {});
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

  private runResolution(expr: UntypedExpr, localScope: LocalScope): undefined {
    switch (expr.type) {
      case "syntax-err":
      case "constant":
        return;

      case "identifier": {
        const res = this.evaluateResolution(expr, localScope);
        if (res === undefined) {
          this.errors.push({
            span: expr.span,
            description: new UnboundVariable(expr.name),
          });
        } else {
          this.identifiersResolutions.set(expr, res);
        }
        return;
      }

      case "fn": {
        const paramsBindings = expr.params
          .flatMap((p) => this.extractPatternIdentifiers(p))
          .map((p) => [p.name, p]);

        this.runResolution(expr.body, {
          ...localScope,
          ...Object.fromEntries(paramsBindings),
        });
        return;
      }

      case "application": {
        this.runResolution(expr.caller, localScope);
        for (const arg of expr.args) {
          this.runResolution(arg, localScope);
        }

        return;
      }

      case "pipe": {
        this.runResolution(expr.right, localScope);
        this.runResolution(expr.left, localScope);
        return;
      }

      case "if": {
        this.runResolution(expr.condition, localScope);
        this.runResolution(expr.then, localScope);
        this.runResolution(expr.else, localScope);
        return;
      }

      case "let": {
        // TODO handle recursive bindings
        this.runResolution(expr.value, localScope);

        const bindingsEntries = this.extractPatternIdentifiers(
          expr.pattern,
        ).map((p) => [p.name, p]);

        this.runResolution(expr.body, {
          ...localScope,
          ...Object.fromEntries(bindingsEntries),
        });
        return;
      }

      case "let#":
      case "infix":
      case "list-literal":
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

          case "constructor":
            throw new Error("TODO handle constructor");
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

      case "pipe": {
        if (expr.right.type !== "application") {
          this.errors.push({
            span: expr.right.span,
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
      case "list-literal":
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
            args: [],
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
          throw new Error("TODO typeAstToType handle type: " + t.type);
      }
    };

    return helper(t);
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

  resolveIdentifier(
    expr: UntypedExpr & { type: "identifier" },
  ): IdentifierResolution | undefined {
    if (this.identifiersResolutions.has(expr)) {
      return this.identifiersResolutions.get(expr);
    }

    // resolve ident

    for (const declaration of this.getDeclarations()) {
      if (declaration.binding.name === expr.name) {
        return {
          type: "global-variable",
          declaration,
          namespace: this.ns,
        };
      }
    }

    return undefined;
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

function unifyErrToErrorInfo(node: SpanMeta, e: UnifyError): ErrorInfo {
  switch (e.type) {
    case "missing-trait":
      return {
        span: node.span,
        description: new TraitNotSatified(e.type_, e.trait),
      };

    case "type-mismatch":
      return {
        span: node.span,
        description: new TypeMismatch(e.left, e.right),
      };

    case "occurs-check":
      return { span: node.span, description: new OccursCheck() };
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
