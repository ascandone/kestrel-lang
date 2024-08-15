/* eslint-disable require-yield */
import {
  ErrorInfo,
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
  UntypedModule,
  UntypedTypeDeclaration,
  UntypedTypeVariant,
  parse,
} from "../parser";
import { char, float, int, string, task, unit } from "./core";
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
        const resolution = this.resolveIdentifier(expr);
        if (resolution === undefined) {
          this.errors.push({
            description: new UnboundVariable(expr.name),
            span: expr.span,
          });
          return;
        }

        switch (resolution.type) {
          case "global-variable":
            // TODO instantiate
            // TODO check order
            this.unifyNodes(expr, resolution.declaration.binding);
            return;

          case "constructor":
          case "local-variable":
            throw new Error("TODO handle");
        }
      }

      case "fn":
        this.unifyNode(expr, {
          type: "fn",
          args: expr.params.map((_pattern) => {
            // this.typecheckPattern(p, true);
            // return p.$.asType();

            throw new Error("TODO pattern type");
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

      case "pipe":
      case "let#":
      case "infix":
      case "list-literal":
      case "struct-literal":
      case "field-access":
      case "let":
      case "if":
      case "match":
        return undefined;
    }
  }

  private getTVar(node: TypedNode): TVar {
    const lookup = this.typeAnnotations.get(node);
    if (lookup === undefined) {
      // initialize node
      const tvar = TVar.fresh();
      this.typeAnnotations.set(node, tvar);
      return tvar;
    }
    return lookup;
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
    return this.getTVar(node).asType();
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

export const DEFAULT_MAIN_TYPE = task(unit);
