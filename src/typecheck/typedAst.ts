import {
  Binding,
  Declaration,
  ExposedValue,
  Expr,
  Import,
  MatchPattern,
  SpanMeta,
  TypeAst,
  TypeDeclaration,
  TypeVariant,
} from "../parser";
import { TypeMeta } from "./typecheck";
import { Type, TypeScheme } from "./type";
export * from "./typedAst/autocomplete";
export * from "./typedAst/findReferences";
export * from "./typedAst/gotoDefinition";
export * from "./typedAst/hoverOn";
export * from "./typedAst/signatureHint";
export { foldTree } from "./typedAst/common";

export type IdentifierResolution =
  | {
      type: "local-variable";
      binding: Binding<TypeMeta>;
    }
  | {
      type: "global-variable";
      declaration: TypedDeclaration;
      namespace: string;
    }
  | {
      type: "constructor";
      variant: TypedTypeVariant;
      namespace: string;
    };

export type TypedBinding = Binding<TypeMeta>;

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

export type TypedMatchPattern = MatchPattern<
  TypeMeta,
  IdentifierResolutionMeta
>;
export type TypedExpr = Expr<TypeMeta, IdentifierResolutionMeta, never>;

export type TypedExposing = ExposedValue<
  { resolved?: TypedTypeDeclaration },
  { declaration?: TypedDeclaration }
>;

export type TypedImport = Import<TypedExposing>;

export type PolyTypeMeta = { scheme: TypeScheme; mono: Type };
export type TypedTypeVariant = TypeVariant<PolyTypeMeta>;
export type TypedTypeDeclaration = TypeDeclaration<PolyTypeMeta>;

export type TypedTypeAst = TypeAst<TypeResolutionMeta>;
export type TypedDeclaration = { scheme: TypeScheme } & Declaration<
  TypeMeta,
  IdentifierResolutionMeta,
  TypeResolutionMeta,
  never
>;

export type TypedModule = {
  moduleDoc?: string;
  imports: TypedImport[];
  typeDeclarations: TypedTypeDeclaration[];
  declarations: TypedDeclaration[];
};

export type Node = TypeMeta & SpanMeta;

export type Identifier = TypedExpr & { type: "identifier" };
