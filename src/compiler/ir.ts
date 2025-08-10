import { ConstLiteral } from "../parser/ast";

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
      name: QualifiedIdentifier;
      typeName: string;
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
  // TODO recur() for TCO
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
  name: string;
  value: Expr;
};

export type Program = {
  package_: string;
  namespace: string;

  // adts: Record<string, Adt>;
  // structs: Record<string, Adt>;

  values: Value[];
};

export type MatchPattern =
  | {
      type: "identifier";
      ident: Ident & { type: "local" }; // TODO simplify
    }
  | {
      type: "lit";
      literal: ConstLiteral;
    }
  | {
      type: "constructor";
      name: QualifiedIdentifier;
      args: MatchPattern[];
    };
