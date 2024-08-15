/* eslint-disable require-yield */
import { ErrorInfo, UnboundVariable } from "../errors";
import {
  Binding,
  ConstLiteral,
  UntypedDeclaration,
  UntypedExpr,
  UntypedImport,
  UntypedModule,
  UntypedTypeDeclaration,
  UntypedTypeVariant,
  parse,
} from "../parser";
import { Deps } from "./resolutionStep";
import { TVar, Type, unify } from "./type";

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
    private options: AnalyseOptions = {},
  ) {
    const parseResult = parse(source);
    // TODO push parsing/lexer errs in errs

    this.module = parseResult.parsed;

    this.initAnalysis();
  }

  private initAnalysis() {
    for (const letDecl of this.module.declarations) {
      this.analyzeLetDeclaration(letDecl);
    }
  }

  private analyzeLetDeclaration(decl: UntypedDeclaration) {
    if (decl.extern) {
      // TODO
      return;
    }

    this.analyzeExpr(decl.value);
    this.unifyNodes(decl.binding, decl.value);
  }

  private unifyNode(node: TypedNode, type: Type) {
    unify(this.getType(node), type);
    // TODO push err when not undef
  }

  private unifyNodes(left: TypedNode, right: TypedNode) {
    this.unifyNode(left, this.getType(right));
  }

  private analyzeExpr(expr: UntypedExpr): undefined {
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

      case "pipe":
      case "let#":
      case "infix":
      case "list-literal":
      case "struct-literal":
      case "fn":
      case "application":
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

// Keep this in sync with core
function getConstantType(x: ConstLiteral): Type {
  // Keep this in sync with core
  switch (x.type) {
    case "int":
      return Int;

    case "float":
      return Float;

    case "string":
      return String;

    case "char":
      return Char;
  }
}

const Bool: Type = {
  type: "named",
  moduleName: "Bool",
  name: "Bool",
  args: [],
};

const Int: Type = {
  moduleName: "Int",
  type: "named",
  name: "Int",
  args: [],
};

const Float: Type = {
  moduleName: "Float",
  type: "named",
  name: "Float",
  args: [],
};

const String: Type = {
  moduleName: "String",
  type: "named",
  name: "String",
  args: [],
};

const Char: Type = {
  moduleName: "Char",
  type: "named",
  name: "Char",
  args: [],
};

const Unit: Type = {
  type: "named",
  moduleName: "Tuple",
  name: "Unit",
  args: [],
};

const List = (a: Type): Type => ({
  type: "named",
  moduleName: "List",
  name: "List",
  args: [a],
});

function Task(arg: Type): Type {
  return {
    type: "named",
    moduleName: "Task",
    name: "Task",
    args: [arg],
  };
}

export const DEFAULT_MAIN_TYPE = Task(Unit);
