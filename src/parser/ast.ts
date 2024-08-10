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

export type TypeAst<TypeResolutionMeta = unknown> = SpanMeta &
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
> = (TypeMeta & SpanMeta) &
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
  SpanMeta;

export type SyntaxSugar =
  | {
      type: "pipe";
      left: UntypedExpr;
      right: UntypedExpr;
    }
  | {
      type: "let#";
      mapper: SpanMeta & { namespace?: string; name: string };
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

export type UntypedExpr = Expr<unknown, unknown, SyntaxSugar>;

export type Expr<TypeMeta, IdentifierResolutionMeta, SyntaxSugar> = (
  | SyntaxSugar
  | {
      type: "syntax-err";
    }
  | {
      type: "list-literal";
      values: Expr<TypeMeta, IdentifierResolutionMeta, SyntaxSugar>[];
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
      body: Expr<TypeMeta, IdentifierResolutionMeta, SyntaxSugar>;
    }
  | {
      type: "application";
      caller: Expr<TypeMeta, IdentifierResolutionMeta, SyntaxSugar>;
      args: Expr<TypeMeta, IdentifierResolutionMeta, SyntaxSugar>[];
      isPipe?: boolean;
    }
  | {
      type: "let";
      pattern: MatchPattern<TypeMeta, IdentifierResolutionMeta>;
      value: Expr<TypeMeta, IdentifierResolutionMeta, SyntaxSugar>;
      body: Expr<TypeMeta, IdentifierResolutionMeta, SyntaxSugar>;
    }
  | {
      type: "if";
      condition: Expr<TypeMeta, IdentifierResolutionMeta, SyntaxSugar>;
      then: Expr<TypeMeta, IdentifierResolutionMeta, SyntaxSugar>;
      else: Expr<TypeMeta, IdentifierResolutionMeta, SyntaxSugar>;
    }
  | {
      type: "match";
      expr: Expr<TypeMeta, IdentifierResolutionMeta, SyntaxSugar>;
      clauses: Array<
        [
          MatchPattern<TypeMeta, IdentifierResolutionMeta>,
          Expr<TypeMeta, IdentifierResolutionMeta, SyntaxSugar>,
        ]
      >;
    }
) &
  TypeMeta &
  SpanMeta;

export type UntypedDeclaration = Declaration<
  unknown,
  unknown,
  unknown,
  SyntaxSugar
>;
export type Declaration<
  TypeMeta,
  IdentifierResolutionMeta,
  TypeResolutionMeta,
  SyntaxSugar,
> = SpanMeta & {
  pub: boolean;
  binding: Binding<TypeMeta>;
  docComment?: string;
} & (
    | {
        inline: boolean;
        extern: false;
        typeHint?: PolyTypeAst<TypeResolutionMeta> & SpanMeta;
        value: Expr<TypeMeta, IdentifierResolutionMeta, SyntaxSugar>;
      }
    | {
        extern: true;
        typeHint: PolyTypeAst<TypeResolutionMeta> & SpanMeta;
      }
  );

export type TypeVariant<TypeMeta> = (TypeMeta & SpanMeta) & {
  name: string;
  args: TypeAst[];
};

export type StructField<TypeMeta> = (TypeMeta & SpanMeta) & {
  name: string;
  type_: TypeAst;
};

export type UntypedTypeVariant = TypeVariant<unknown>;
export type UntypedTypeDeclaration = TypeDeclaration<unknown>;
export type TypeDeclaration<TypeMeta> = SpanMeta & {
  name: string;
  params: Array<{ name: string } & SpanMeta>;
  docComment?: string;
} & (
    | { type: "adt"; variants: TypeVariant<TypeMeta>[]; pub: boolean | ".." }
    | { type: "struct"; fields: StructField<TypeMeta>[]; pub: boolean | ".." }
    | { type: "extern"; pub: boolean }
  );

export type UntypedExposedValue = ExposedValue<unknown, unknown>;
export type ExposedValue<ResolvedTypeMeta, ResolvedValueMeta> = SpanMeta &
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
export type Import<Exposing> = SpanMeta & {
  ns: string;
  exposing: Exposing[];
};

export type UntypedModule = {
  moduleDoc?: string;
  imports: UntypedImport[];
  typeDeclarations: UntypedTypeDeclaration[];
  declarations: UntypedDeclaration[];
};

export type Span = [startIdx: number, endIdx: number];
export type SpanMeta = { span: Span };
