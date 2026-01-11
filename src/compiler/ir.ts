import { ConstLiteral } from "../parser/ast";
import { TypedTypeAst, TypedTypeDeclaration } from "../typecheck";
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
      implicitly: ImplicitTraitArg[];
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

export type ImplicitParam = ImplicitTraitArg & { type: "var" };
export type ImplicitTraitArg = {
  trait: string;
} & (
  | {
      type: "resolved";
      typeName: QualifiedIdentifier;
      args: ImplicitTraitArg[];
    }
  | {
      type: "var";
      id: string;
    }
);

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
      bindings: (Ident & { type: "local" })[];
      body: Expr;
    }
  | {
      type: "application";
      caller: Expr;
      args: Expr[];
    }
  | {
      type: "match";
      expr: Expr;
      clauses: Array<[MatchPattern, Expr]>;
      default?: [Ident & { type: "local" }, Expr];
    }
  | {
      // TODO We'll want to remove this node and represent it as pattern matching instead, when we'll have the struct match pattern
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
  implicitTraitParams: (ImplicitTraitArg & { type: "var" })[];
  inline: boolean;
};

export type AdtConstructor = {
  name: QualifiedIdentifier;
  /**
   * Just storing the arity instead of the type is a bit simplistic and won't be enough
   * for e.g. a wasm backend. But as we long as we only have a js backend, that'll be just fine
   */
  // TODO remove
  arity: number;

  args: TypedTypeAst[];
};
export type Adt = {
  name: QualifiedIdentifier;
  constructors: AdtConstructor[];
  params: string[];

  traits: Map<string, Set<string>[]>;
};

export type Struct = {
  name: QualifiedIdentifier;
  fields: string[];
  declaration: TypedTypeDeclaration & { type: "struct" };
  params: string[];
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
      type: "constant";
      value: ConstLiteral;
    }
  | {
      type: "constructor";
      name: string;
      typeName: QualifiedIdentifier;
      args: (Ident & { type: "local" })[];
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
    clauses: [],
    default: [let_.binding, let_.body],
  };
}
export function mkLetSugar(expr: Expr): LetSugar | undefined {
  if (expr.type !== "match" || expr.clauses.length !== 0) {
    return undefined;
  }
  const [binding, body] = expr.default!;

  return {
    binding,
    value: expr.expr,
    body,
  };
}
