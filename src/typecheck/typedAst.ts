import {
  ConstLiteral,
  Declaration,
  Expr,
  MatchPattern,
  RangeMeta,
  StructDeclarationField,
  StructField,
} from "../parser";
import { TVar, TypeScheme } from "./type";
export * from "./typedAst/findReferences";
export * from "./typedAst/gotoDefinition";
export * from "./typedAst/inlayHint";
export * from "./typedAst/hoverOn";
export * from "./typedAst/signatureHint";
export { foldTree } from "./typedAst/common";

export type TypeMeta = { $: TVar };

export type IdentifierResolution =
  | {
      type: "local-variable";
      binding: TypedBinding;
    }
  | {
      type: "global-variable";
      declaration: TypedDeclaration;
      namespace: string;
    }
  | {
      type: "constructor";
      variant: TypedTypeVariant;
      declaration: TypedTypeDeclaration & { type: "adt" };
      namespace: string;
    };

export type TypedBinding = { name: string } & TypeMeta & RangeMeta;

export type TypeResolution = {
  declaration: TypedTypeDeclaration;
  namespace: string;
};

export type IdentifierResolutionMeta = {
  resolution: IdentifierResolution | undefined;
};
export type TypeResolutionMeta = {
  resolution: TypeResolution | undefined;
};

export type StructResolution = {
  declaration: TypedTypeDeclaration & { type: "struct" };
  namespace: string;
};

export type TypedStructField = StructField<
  TypeMeta,
  IdentifierResolutionMeta,
  StructResolutionMeta,
  FieldResolutionMeta,
  never
>;

export type FieldResolution = StructResolution & {
  field: StructDeclarationField<PolyTypeMeta>;
};

export type StructResolutionMeta = {
  resolution: StructResolution | undefined;
};

export type FieldResolutionMeta = {
  resolution: FieldResolution | undefined;
};

export type TypedMatchPattern = (TypeMeta & RangeMeta) &
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

export type TypedExpr = Expr<
  TypeMeta,
  IdentifierResolutionMeta,
  StructResolutionMeta,
  FieldResolutionMeta,
  never
>;

type ResolvedTypeMeta = { resolved?: TypedTypeDeclaration };
type ResolvedValueMeta = { declaration?: TypedDeclaration };
export type TypedExposedValue = RangeMeta &
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

export type TypedImport = RangeMeta & {
  ns: string;
  exposing: TypedExposedValue[];
};

export type PolyTypeMeta = { scheme: TypeScheme } & TypeMeta;

export type TypedTypeVariant = (PolyTypeMeta & RangeMeta) & {
  name: string;
  args: TypedTypeAst[];
};

export type TypedTypeDeclaration = RangeMeta & {
  name: string;
  params: Array<{ name: string } & RangeMeta>;
  docComment?: string;
} & (
    | {
        type: "adt";
        variants: TypedTypeVariant[];
        pub: boolean | "..";
      }
    | ({
        type: "struct";
        fields: StructDeclarationField<PolyTypeMeta>[];
        pub: boolean | "..";
      } & PolyTypeMeta)
    | {
        type: "extern";
        pub: boolean;
      }
  );

export type TypedTypeAst = RangeMeta &
  (
    | {
        type: "var";
        ident: string;
      }
    | {
        type: "fn";
        args: TypedTypeAst[];
        return: TypedTypeAst;
      }
    | ({
        type: "named";
        namespace?: string;
        name: string;
        args: TypedTypeAst[];
      } & TypeResolutionMeta)
    | { type: "any" }
  );

export type TypedDeclaration = { scheme: TypeScheme } & Declaration<
  TypeMeta,
  IdentifierResolutionMeta,
  TypeResolutionMeta,
  StructResolutionMeta,
  FieldResolutionMeta,
  never
>;

export type TypedModule = {
  moduleDoc?: string;
  imports: TypedImport[];
  typeDeclarations: TypedTypeDeclaration[];
  declarations: TypedDeclaration[];
};

export type Node = TypeMeta & RangeMeta;

export type Identifier = TypedExpr & { type: "identifier" };
