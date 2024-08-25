import { TypeResolutionMeta } from "../typecheck";

export type ConstLiteral =
  | { type: "int"; value: number }
  | { type: "float"; value: number }
  | { type: "char"; value: string }
  | { type: "string"; value: string };

export type TraitDef = {
  typeVar: string;
  traits: string[];
};

export type PolyTypeAst<TypeResolutionMeta = unknown> = {
  mono: TypeAst<TypeResolutionMeta>;
  where: TraitDef[];
};

export type TypeAst<TypeResolutionMeta = unknown> = RangeMeta &
  (
    | {
        type: "var";
        ident: string;
      }
    | {
        type: "fn";
        args: TypeAst<TypeResolutionMeta>[];
        return: TypeAst<TypeResolutionMeta>;
      }
    | ({
        type: "named";
        namespace?: string;
        name: string;
        args: TypeAst<TypeResolutionMeta>[];
      } & TypeResolutionMeta)
    // This should only be used for type annotations, not type declarations
    | { type: "any" }
  );

export type UntypedMatchPattern = MatchPattern;

export type MatchPattern<
  TypeMeta = unknown,
  IdentifierResolutionMeta = unknown,
> = (TypeMeta & RangeMeta) &
  (
    | {
        type: "identifier";
        name: string;
      }
    | {
        type: "lit";
        literal: ConstLiteral;
      }
    | ({
        type: "constructor";
        name: string;
        args: MatchPattern<TypeMeta, IdentifierResolutionMeta>[];
        namespace?: string;
      } & IdentifierResolutionMeta)
  );

export type Binding<TypeMeta = unknown> = { name: string } & TypeMeta &
  RangeMeta;

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
    };

export type UntypedExpr = Expr<unknown, unknown, unknown, unknown, SyntaxSugar>;

export type StructField<
  TypeMeta,
  IdentifierResolutionMeta,
  StructResolutionMeta,
  FieldResolutionMeta,
  SyntaxSugar,
> = RangeMeta & {
  field: { name: string } & RangeMeta & FieldResolutionMeta;
  value: Expr<
    TypeMeta,
    IdentifierResolutionMeta,
    StructResolutionMeta,
    FieldResolutionMeta,
    SyntaxSugar
  >;
};

export type Expr<
  TypeMeta,
  IdentifierResolutionMeta,
  StructResolutionMeta,
  FieldResolutionMeta,
  SyntaxSugar,
> = (
  | SyntaxSugar
  | {
      type: "syntax-err";
    }
  | {
      type: "list-literal";
      values: Expr<
        TypeMeta,
        IdentifierResolutionMeta,
        StructResolutionMeta,
        FieldResolutionMeta,
        SyntaxSugar
      >[];
    }
  | {
      type: "struct-literal";
      struct: { name: string } & RangeMeta & StructResolutionMeta;
      fields: StructField<
        TypeMeta,
        IdentifierResolutionMeta,
        StructResolutionMeta,
        FieldResolutionMeta,
        SyntaxSugar
      >[];
      spread:
        | Expr<
            TypeMeta,
            IdentifierResolutionMeta,
            StructResolutionMeta,
            FieldResolutionMeta,
            SyntaxSugar
          >
        | undefined;
    }
  | {
      type: "constant";
      value: ConstLiteral;
    }
  | ({
      type: "identifier";
      namespace?: string;
      name: string;
    } & IdentifierResolutionMeta)
  | {
      type: "fn";
      params: MatchPattern<TypeMeta, IdentifierResolutionMeta>[];
      body: Expr<
        TypeMeta,
        IdentifierResolutionMeta,
        StructResolutionMeta,
        FieldResolutionMeta,
        SyntaxSugar
      >;
    }
  | {
      type: "application";
      caller: Expr<
        TypeMeta,
        IdentifierResolutionMeta,
        StructResolutionMeta,
        FieldResolutionMeta,
        SyntaxSugar
      >;
      args: Expr<
        TypeMeta,
        IdentifierResolutionMeta,
        StructResolutionMeta,
        FieldResolutionMeta,
        SyntaxSugar
      >[];
      isPipe?: boolean;
    }
  | ({
      type: "field-access";
      struct: Expr<
        TypeMeta,
        IdentifierResolutionMeta,
        StructResolutionMeta,
        FieldResolutionMeta,
        SyntaxSugar
      >;
      field: { name: string; structName?: string } & RangeMeta;
    } & FieldResolutionMeta)
  | {
      type: "let";
      pattern: MatchPattern<TypeMeta, IdentifierResolutionMeta>;
      value: Expr<
        TypeMeta,
        IdentifierResolutionMeta,
        StructResolutionMeta,
        FieldResolutionMeta,
        SyntaxSugar
      >;
      body: Expr<
        TypeMeta,
        IdentifierResolutionMeta,
        StructResolutionMeta,
        FieldResolutionMeta,
        SyntaxSugar
      >;
    }
  | {
      type: "if";
      condition: Expr<
        TypeMeta,
        IdentifierResolutionMeta,
        StructResolutionMeta,
        FieldResolutionMeta,
        SyntaxSugar
      >;
      then: Expr<
        TypeMeta,
        IdentifierResolutionMeta,
        StructResolutionMeta,
        FieldResolutionMeta,
        SyntaxSugar
      >;
      else: Expr<
        TypeMeta,
        IdentifierResolutionMeta,
        StructResolutionMeta,
        FieldResolutionMeta,
        SyntaxSugar
      >;
    }
  | {
      type: "match";
      expr: Expr<
        TypeMeta,
        IdentifierResolutionMeta,
        StructResolutionMeta,
        FieldResolutionMeta,
        SyntaxSugar
      >;
      clauses: Array<
        [
          MatchPattern<TypeMeta, IdentifierResolutionMeta>,
          Expr<
            TypeMeta,
            IdentifierResolutionMeta,
            StructResolutionMeta,
            FieldResolutionMeta,
            SyntaxSugar
          >,
        ]
      >;
    }
) &
  TypeMeta &
  RangeMeta;

export type UntypedDeclaration = Declaration<
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  SyntaxSugar
>;
export type Declaration<
  TypeMeta,
  IdentifierResolutionMeta,
  TypeResolutionMeta,
  StructResolutionMeta,
  FieldResolutionMeta,
  SyntaxSugar,
> = RangeMeta & {
  pub: boolean;
  binding: Binding<TypeMeta>;
  docComment?: string;
} & (
    | {
        inline: boolean;
        extern: false;
        typeHint?: PolyTypeAst<TypeResolutionMeta> & RangeMeta;
        value: Expr<
          TypeMeta,
          IdentifierResolutionMeta,
          StructResolutionMeta,
          FieldResolutionMeta,
          SyntaxSugar
        >;
      }
    | {
        extern: true;
        typeHint: PolyTypeAst<TypeResolutionMeta> & RangeMeta;
      }
  );

export type TypeVariant<TypeMeta, TypeResolutionMeta = unknown> = (TypeMeta &
  RangeMeta) & {
  name: string;
  args: TypeAst<TypeResolutionMeta>[];
};

export type StructDeclarationField<TypeMeta> = (TypeMeta & RangeMeta) & {
  name: string;
  type_: TypeAst<TypeResolutionMeta>;
};

export type UntypedTypeVariant = TypeVariant<unknown>;
export type UntypedTypeDeclaration = TypeDeclaration<unknown>;
export type TypeDeclaration<TypeMeta> = RangeMeta & {
  name: string;
  params: Array<{ name: string } & RangeMeta>;
  docComment?: string;
} & (
    | { type: "adt"; variants: TypeVariant<TypeMeta>[]; pub: boolean | ".." }
    | ({
        type: "struct";
        fields: StructDeclarationField<TypeMeta>[];
        pub: boolean | "..";
      } & TypeMeta)
    | { type: "extern"; pub: boolean }
  );

export type UntypedExposedValue = ExposedValue<unknown, unknown>;
export type ExposedValue<ResolvedTypeMeta, ResolvedValueMeta> = RangeMeta &
  (
    | ({
        type: "type";
        name: string;
        exposeImpl: boolean;
      } & ResolvedTypeMeta)
    | ({
        type: "value";
        name: string;
      } & ResolvedValueMeta)
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
