import { ConstLiteral } from "../parser/ast";
export { ConstLiteral } from "../parser/ast";

export class QualifiedIdentifier {
  constructor(
    public readonly package_: string,
    public readonly namespace: string,
    public readonly name: string,
  ) {}

  public toJSON() {
    return `${this.package_}:${this.namespace}:${this.name}`;
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
  // TODO can we use match instead of let?
  | {
      type: "let";
      binding: Ident & { type: "local" };
      value: Expr;
      body: Expr;
    }
  // TODO remove if and use match instead
  | {
      type: "if";
      condition: Expr;
      then: Expr;
      else: Expr;
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

export type Value = {
  name: QualifiedIdentifier;
  value: Expr;
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

export type Program = {
  package_: string;
  namespace: string;

  adts: Adt[];
  // structs: Record<string, Adt>;

  values: Value[];
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
