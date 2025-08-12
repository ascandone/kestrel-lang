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
      type: "let";
      binding: Ident & { type: "local" };
      value: Expr;
      body: Expr;
    }
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
