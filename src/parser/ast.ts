export type ConstLiteral =
  | { type: "int"; value: number }
  | { type: "float"; value: number }
  | { type: "string"; value: string };

export type TypeAst = SpanMeta &
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
    | { type: "any" }
  );

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
      } & IdentifierResolutionMeta)
  );

export type Binding<TypeMeta = unknown> = { name: string } & TypeMeta &
  SpanMeta;

export type UntypedExpr = Expr<unknown, unknown>;

export type Expr<TypeMeta, IdentifierResolutionMeta> = (TypeMeta & SpanMeta) &
  (
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
        params: Binding<TypeMeta>[];
        body: Expr<TypeMeta, IdentifierResolutionMeta>;
      }
    | {
        type: "application";
        caller: Expr<TypeMeta, IdentifierResolutionMeta>;
        args: Expr<TypeMeta, IdentifierResolutionMeta>[];
      }
    | {
        type: "let";
        binding: Binding<TypeMeta>;
        value: Expr<TypeMeta, IdentifierResolutionMeta>;
        body: Expr<TypeMeta, IdentifierResolutionMeta>;
      }
    | {
        type: "if";
        condition: Expr<TypeMeta, IdentifierResolutionMeta>;
        then: Expr<TypeMeta, IdentifierResolutionMeta>;
        else: Expr<TypeMeta, IdentifierResolutionMeta>;
      }
    | {
        type: "match";
        expr: Expr<TypeMeta, IdentifierResolutionMeta>;
        clauses: Array<
          [
            MatchPattern<TypeMeta, IdentifierResolutionMeta>,
            Expr<TypeMeta, IdentifierResolutionMeta>,
          ]
        >;
      }
  );

export type UntypedDeclaration = Declaration<unknown, unknown>;
export type Declaration<TypeMeta, IdentifierResolutionMeta> = SpanMeta & {
  pub: boolean;
  binding: Binding<TypeMeta>;
} & (
    | {
        extern: false;
        typeHint?: TypeAst & SpanMeta;
        value: Expr<TypeMeta, IdentifierResolutionMeta>;
      }
    | {
        extern: true;
        typeHint: TypeAst & SpanMeta;
      }
  );

export type TypeVariant<TypeMeta> = (TypeMeta & SpanMeta) & {
  name: string;
  args: TypeAst[];
};

export type UntypedTypeVariant = TypeVariant<unknown>;
export type UntypedTypeDeclaration = TypeDeclaration<unknown>;
export type TypeDeclaration<TypeMeta> = SpanMeta & {
  name: string;
  params: Array<{ name: string } & SpanMeta>;
} & (
    | { type: "adt"; variants: TypeVariant<TypeMeta>[]; pub: boolean | ".." }
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
  imports: UntypedImport[];
  typeDeclarations: UntypedTypeDeclaration[];
  declarations: UntypedDeclaration[];
};

export type Span = [startIdx: number, endIdx: number];
export type SpanMeta = { span: Span };
