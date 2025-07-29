export type ConstLiteral =
  | { type: "int"; value: number }
  | { type: "float"; value: number }
  | { type: "char"; value: string }
  | { type: "string"; value: string };

export type TraitDef = {
  typeVar: string;
  traits: string[];
};

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

export type SyntaxSugar =
  | {
      type: "pipe";
      left: UntypedExpr;
      right: UntypedExpr;
    }
  | {
      type: "let#";
      mapper: RangeMeta & { namespace?: string; name: string };
      pattern: MatchPattern;
      value: UntypedExpr;
      body: UntypedExpr;
    }
  | {
      type: "infix";
      operator: string;
      left: UntypedExpr;
      right: UntypedExpr;
    }
  | {
      type: "block";
      inner: UntypedExpr;
    };

export type UntypedExpr = Expr;

export type StructField = RangeMeta & {
  field: { name: string } & RangeMeta;
  value: Expr;
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
        struct: { name: string } & RangeMeta;
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
        field: { name: string; structName?: string } & RangeMeta;
      }
    | {
        type: "let";
        pattern: MatchPattern;
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
  );

export type UntypedDeclaration = Declaration<SyntaxSugar>;
export type Declaration<_TypeResolutionMeta> = RangeMeta & {
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

export type TypeVariant<TypeMeta, _TypeResolutionMeta = unknown> = (TypeMeta &
  RangeMeta) & {
  name: string;
  args: TypeAst[];
};

export type StructDeclarationField<TypeMeta> = (TypeMeta & RangeMeta) & {
  name: string;
  type_: TypeAst;
};

export type UntypedTypeVariant = TypeVariant<unknown>;
export type UntypedTypeDeclaration = TypeDeclaration<unknown>;
export type TypeDeclaration<TypeMeta> = RangeMeta & {
  name: string;
  params: Array<{ name: string } & RangeMeta>;
  docComment?: string;
} & (
    | {
        type: "adt";
        // TODO remove any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        variants: TypeVariant<TypeMeta, any>[];
        pub: boolean | "..";
      }
    | ({
        type: "struct";
        fields: StructDeclarationField<TypeMeta>[];
        pub: boolean | "..";
      } & TypeMeta)
    | { type: "extern"; pub: boolean }
  );

export type UntypedExposedValue = RangeMeta &
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

export type UntypedImport = Import<UntypedExposedValue>;
export type Import<Exposing> = RangeMeta & {
  ns: string;
  exposing: Exposing[];
};

export type LineComment = { comment: string } & RangeMeta;
export type UntypedModule = {
  moduleDoc?: string;
  imports: UntypedImport[];
  typeDeclarations: UntypedTypeDeclaration[];
  declarations: UntypedDeclaration[];
  lineComments?: LineComment[];
};

export type Position = {
  line: number;
  character: number;
};
export type Range = {
  start: Position;
  end: Position;
};

export type RangeMeta = { range: Range };
