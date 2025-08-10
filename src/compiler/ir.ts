import { ConstLiteral } from "../parser/ast";

export class QualifiedIdentifier {
  constructor(
    public readonly package_: string,
    public readonly module: string,
    public readonly name: string,
  ) {}

  public toJSON() {
    return `${this.package_}:${this.module}:${this.name}`;
  }
}

export type Ident =
  | { type: "global"; name: QualifiedIdentifier }
  | { type: "local"; declarationName: string; name: string; unique: number }
  | { type: "constructor"; name: QualifiedIdentifier; typeName: string };

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
      traits: string[];
      bindings: string[];
      body: Expr;
    }
  // TODO recur() for TCO
  | {
      type: "application";
      caller: Expr;
      traits: string[];
      args: Expr[];
    }
  | {
      type: "let";
      binding: Expr;
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
      fields: Record<string, Expr>;
      spread?: Expr;
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
