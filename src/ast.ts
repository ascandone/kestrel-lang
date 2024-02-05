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
        name: string;
        args: TypeAst[];
      }
    // This should only be used for type annotations, not type declarations
    | { type: "any" }
  );

export type MatchPattern<TypeMeta = unknown> = (TypeMeta & SpanMeta) &
  (
    | {
        type: "ident";
        ident: string;
      }
    | {
        type: "lit";
        literal: ConstLiteral;
      }
    | {
        type: "constructor";
        name: string;
        args: MatchPattern<TypeMeta>[];
      }
  );

export type Binding<TypeMeta = unknown> = { name: string } & TypeMeta &
  SpanMeta;

export type Expr<TypeMeta = unknown> = (TypeMeta & SpanMeta) &
  (
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
        params: Binding<TypeMeta>[];
        body: Expr<TypeMeta>;
      }
    | {
        type: "application";
        caller: Expr<TypeMeta>;
        args: Expr<TypeMeta>[];
      }
    | {
        type: "let";
        binding: Binding<TypeMeta>;
        value: Expr<TypeMeta>;
        body: Expr<TypeMeta>;
      }
    | {
        type: "if";
        condition: Expr<TypeMeta>;
        then: Expr<TypeMeta>;
        else: Expr<TypeMeta>;
      }
    | {
        type: "match";
        expr: Expr<TypeMeta>;
        clauses: Array<[MatchPattern<TypeMeta>, Expr<TypeMeta>]>;
      }
  );

export type UntypedDeclaration = Declaration<unknown>;
export type Declaration<TypeMeta> = SpanMeta & {
  pub: boolean;
  binding: Binding<TypeMeta>;
} & (
    | {
        extern: false;
        typeHint?: TypeAst & SpanMeta;
        value: Expr<TypeMeta>;
      }
    | {
        extern: true;
        typeHint: TypeAst & SpanMeta;
      }
  );

export type TypeVariant<TypeMeta> = TypeMeta & {
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
export type ExposedValue<ResolvedTypeMeta, ResolvedValueMeta> =
  | ({
      type: "type";
      name: string;
      exposeImpl: boolean;
    } & ResolvedTypeMeta)
  | ({
      type: "value";
      name: string;
    } & ResolvedValueMeta);

export type UntypedImport = Import<UntypedExposedValue>;
export type Import<Exposing> = {
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
