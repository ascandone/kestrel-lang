// TODO remove references to parser
import { ConstLiteral, MatchPattern, StructField } from "../parser";

export type Ident =
  | { type: "constructor"; tag: number }
  | { type: "global"; package: string; module: string; name: string }
  | { type: "local"; name: string; unique: number };

export type Expr =
  | {
      type: "struct-literal";
      struct: { name: string };
      fields: StructField[];
      spread: Expr | undefined;
    }
  | {
      type: "constant";
      value: ConstLiteral;
    }
  | {
      type: "identifier";
      namespace: string;
      name: string;
    }
  | {
      type: "fn";
      traits: string[];
      bindings: string[];
      body: Expr;
    }
  | {
      type: "application";
      caller: Expr;
      traits: string[];
      args: Expr[];
    }
  | {
      type: "field-access";
      struct: Expr;
      field: {
        name: string;
        structName?: string;
      };
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
    };
