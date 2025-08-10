// -- Common

export type PolyTypeAst = {
  mono: TypeAst;
  where: TraitDef[];
};

export type TypeAst = RangeMeta &
  (
    | {
        type: "var";
        ident: string;
      }
    | {
        type: "fn";
        args: TypeAst[];
        return: TypeAst;
      }
    | {
        type: "named";
        namespace?: string;
        name: string;
        args: TypeAst[];
      }
    // This should only be used for type annotations, not type declarations
    | {
        type: "any";
      }
  );

export type MatchPattern = RangeMeta &
  (
    | {
        type: "identifier";
        name: string;
      }
    | {
        type: "lit";
        literal: ConstLiteral;
      }
    | {
        type: "constructor";
        name: string;
        args: MatchPattern[];
        namespace?: string;
      }
  );

export type Binding = { name: string } & RangeMeta;

export type BlockStatement = RangeMeta &
  (
    | {
        type: "let";
        pattern: MatchPattern;
        value: Expr;
      }
    | {
        type: "let#";
        mapper: RangeMeta & { namespace?: string; name: string };
        pattern: MatchPattern;
        value: Expr;
      }
  );

export type StructField = RangeMeta & {
  field: RangeMeta & {
    name: string;
  };
  value: Expr;
};

export type StructDeclarationField = RangeMeta & {
  name: string;
  typeAst: TypeAst;
};

export type Expr = RangeMeta &
  (
    | SyntaxSugar
    | {
        type: "syntax-err";
      }
    | {
        type: "list-literal";
        values: Expr[];
      }
    | {
        type: "struct-literal";
        struct: RangeMeta & {
          name: string;
        };
        fields: StructField[];
        spread: Expr | undefined;
      }
    | {
        type: "constant";
        value: ConstLiteral;
      }
    | {
        type: "identifier";
        namespace?: string;
        name: string;
      }
    | {
        type: "fn";
        params: MatchPattern[];
        body: Expr;
      }
    | {
        type: "application";
        caller: Expr;
        args: Expr[];
        isPipe?: boolean;
      }
    | {
        type: "field-access";
        struct: Expr;
        field: RangeMeta & {
          name: string;
          structName?: string;
        };
      }
    | {
        type: "block*";
        statements: BlockStatement[];
        returning: Expr;
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
  );

export type ExposedValue = RangeMeta &
  (
    | {
        type: "type";
        name: string;
        exposeImpl: boolean;
      }
    | {
        type: "value";
        name: string;
      }
  );

export type Import = RangeMeta & {
  ns: string;
  exposing: ExposedValue[];
};

export type TypeVariant = RangeMeta & {
  name: string;
  args: TypeAst[];
};

export type Declaration = RangeMeta & {
  pub: boolean;
  binding: Binding;
  docComment?: string;
} & (
    | {
        inline: boolean;
        extern: false;
        typeHint?: PolyTypeAst & RangeMeta;
        value: Expr;
      }
    | {
        extern: true;
        typeHint: PolyTypeAst & RangeMeta;
      }
  );

export type TypeDeclaration = RangeMeta & {
  name: string;
  params: Array<{ name: string } & RangeMeta>;
  docComment?: string;
} & (
    | {
        type: "adt";
        variants: TypeVariant[];
        pub: boolean | "..";
      }
    | {
        type: "struct";
        fields: StructDeclarationField[];
        pub: boolean | "..";
      }
    | {
        type: "extern";
        pub: boolean;
      }
  );

export type UntypedModule = {
  moduleDoc?: string;
  imports: Import[];
  typeDeclarations: TypeDeclaration[];
  declarations: Declaration[];
  lineComments?: LineComment[];
};

// -- specific

export type LineComment = { comment: string } & RangeMeta;
export type Position = {
  line: number;
  character: number;
};
export type Range = {
  start: Position;
  end: Position;
};

export type ConstLiteral =
  | { type: "int"; value: number }
  | { type: "float"; value: number }
  | { type: "char"; value: string }
  | { type: "string"; value: string };

export type TraitDef = {
  typeVar: string;
  traits: string[];
};

export type SyntaxSugar =
  | {
      type: "pipe";
      left: Expr;
      right: Expr;
    }
  | {
      type: "infix";
      operator: string;
      left: Expr;
      right: Expr;
    };

export type RangeMeta = { range: Range };

export function gtEqPos(p1: Position, p2: Position): boolean {
  if (p1.line === p2.line) {
    return p1.character >= p2.character;
  }
  return p1.line > p2.line;
}

export function contains({ range }: RangeMeta, position: Position) {
  return gtEqPos(position, range.start) && gtEqPos(range.end, position);
}
