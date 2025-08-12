import { ConstLiteral } from "../parser/ast";
export { ConstLiteral } from "../parser/ast";

export class QualifiedIdentifier {
  constructor(
    public readonly package_: string,
    public readonly namespace: string,
    public readonly name: string,
  ) {}

  public toString() {
    return `${this.package_}:${this.namespace}:${this.name}`;
  }

  public toJSON() {
    return this.toString();
  }

  public equals(other: QualifiedIdentifier) {
    return (
      this.name === other.name &&
      this.namespace === other.namespace &&
      this.package_ === other.package_
    );
  }
}

export type Ident =
  | {
      type: "global";
      name: QualifiedIdentifier;
    }
  | {
      type: "local";
      declaration: QualifiedIdentifier;
      name: string;
      unique: number;
    }
  | {
      type: "constructor";
      name: string; // TODO consider  using a QualifiedIdentifier instead
      typeName: QualifiedIdentifier;
    };

export type Expr =
  | {
      type: "constant";
      value: ConstLiteral;
    }
  | {
      type: "identifier";
      ident: Ident;
    }
  | {
      type: "fn";
      // traits: string[];
      bindings: (Ident & { type: "local" })[];
      body: Expr;
    }
  | {
      type: "application";
      caller: Expr;
      // TODO traits
      // traits: string[];
      args: Expr[];
    }
  | {
      type: "match";
      expr: Expr;
      clauses: Array<[MatchPattern, Expr]>;
    }
  | {
      type: "field-access";
      struct: Expr;
      field: {
        name: string;
        struct: QualifiedIdentifier;
      };
    }
  | {
      type: "struct-literal";
      struct: QualifiedIdentifier;
      fields: { name: string; expr: Expr }[];
      spread: Expr | undefined;
    };

export type ValueDeclaration = {
  name: QualifiedIdentifier;
  value: Expr;

  inline: boolean;
};

export type AdtConstructor = {
  name: QualifiedIdentifier;
  /**
   * Just storing the arity instead of the type is a bit simplistic and won't be enough
   * for e.g. a wasm backend. But as we long as we only have a js backend, that'll be just fine
   */
  arity: number;
};
export type Adt = {
  name: QualifiedIdentifier;
  constructors: AdtConstructor[];
};

export type Struct = {
  name: QualifiedIdentifier;
  fields: string[];
};
export type Program = {
  package_: string;
  namespace: string;

  adts: Adt[];
  structs: Struct[];

  values: ValueDeclaration[];
};

export type MatchPattern =
  | {
      type: "identifier";
      ident: Ident & { type: "local" }; // TODO simplify
    }
  | {
      // TODO we should call this "constant"
      type: "lit";
      literal: ConstLiteral;
    }
  | {
      type: "constructor";
      name: string;
      typeName: QualifiedIdentifier;
      // TODO we want the pattern to be already compiled in the decision tree
      args: MatchPattern[];
    };

// Helpers
export function localIdentEq(
  x: Ident & { type: "local" },
  y: Ident & { type: "local" },
) {
  return (
    x.name === y.name &&
    x.unique === y.unique &&
    x.declaration.equals(y.declaration)
  );
}

export type LetSugar = {
  binding: Ident & { type: "local" };
  value: Expr;
  body: Expr;
};
export function desugarLet(let_: LetSugar): Expr {
  return {
    type: "match",
    expr: let_.value,
    clauses: [[{ type: "identifier", ident: let_.binding }, let_.body]],
  };
}
export function mkLetSugar(expr: Expr): LetSugar | undefined {
  if (expr.type !== "match" || expr.clauses.length !== 1) {
    return undefined;
  }
  const [pat, body] = expr.clauses[0]!;
  if (pat.type !== "identifier") {
    return undefined;
  }

  return {
    binding: pat.ident,
    value: expr.expr,
    body,
  };
}
