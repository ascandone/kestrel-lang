import * as ast from "../parser";
import { TVar, TypeScheme } from "./type";
export * from "./typedAst/findReferences";
export * from "./typedAst/gotoDefinition";
export * from "./typedAst/inlayHint";
export * from "./typedAst/hoverOn";
export * from "./typedAst/signatureHint";
export { foldTree } from "./typedAst/common";

function assertSubtype<T1, _T2 extends T1>() {}

export type TypeResolution = {
  declaration: TypedTypeDeclaration;
  namespace: string;
};

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

export type StructResolution = {
  declaration: TypedTypeDeclaration & { type: "struct" };
  namespace: string;
};

export type TypeMeta = { $: TVar };

// -- Common

assertSubtype<ast.PolyTypeAst, TypedPolyTypeAst>;
export type TypedPolyTypeAst = {
  mono: TypedTypeAst;
  where: ast.TraitDef[];
};

assertSubtype<ast.TypeAst, TypedTypeAst>;
export type TypedTypeAst = ast.RangeMeta &
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
    | {
        type: "named";
        namespace?: string;
        name: string;
        args: TypedTypeAst[];

        // typedAst
        resolution: TypeResolution | undefined;
      }
    | {
        type: "any";
      }
  );

assertSubtype<ast.MatchPattern, TypedMatchPattern>;
export type TypedMatchPattern = (TypeMeta & ast.RangeMeta) &
  (
    | {
        type: "identifier";
        name: string;
      }
    | {
        type: "lit";
        literal: ast.ConstLiteral;
      }
    | {
        type: "constructor";
        name: string;
        args: TypedMatchPattern[];
        namespace?: string;

        // typedAst
        resolution?: IdentifierResolution;
      }
  );

assertSubtype<ast.Binding, TypedBinding>;
export type TypedBinding = { name: string } & TypeMeta & ast.RangeMeta;

assertSubtype<ast.StructField, TypedStructField>;
export type TypedStructField = ast.RangeMeta & {
  field: { name: string } & ast.RangeMeta & FieldResolutionMeta;
  value: TypedExpr;
};

export type TypedStructDeclarationField = (PolyTypeMeta & ast.RangeMeta) & {
  name: string;
  type_: TypedTypeAst;
};

export type FieldResolution = StructResolution & {
  field: TypedStructDeclarationField;
};

export type FieldResolutionMeta = {
  resolution: FieldResolution | undefined;
};

export type TypedExpr = (TypeMeta & ast.RangeMeta) &
  (
    | {
        type: "syntax-err";
      }
    | {
        type: "list-literal";
        values: TypedExpr[];
      }
    | {
        type: "struct-literal";
        struct: ast.RangeMeta & {
          name: string;

          // typedAst
          resolution: StructResolution | undefined;
        };
        fields: TypedStructField[];
        spread: TypedExpr | undefined;
      }
    | {
        type: "constant";
        value: ast.ConstLiteral;
      }
    | {
        type: "identifier";
        namespace?: string;
        name: string;

        // typedAst
        resolution: IdentifierResolution | undefined;
      }
    | {
        type: "fn";
        params: TypedMatchPattern[];
        body: TypedExpr;
      }
    | {
        type: "application";
        caller: TypedExpr;
        args: TypedExpr[];
        isPipe?: boolean;
      }
    | ({
        type: "field-access";
        struct: TypedExpr;
        field: { name: string; structName?: string } & ast.RangeMeta;
      } & FieldResolutionMeta)
    | {
        type: "let";
        pattern: TypedMatchPattern;
        value: TypedExpr;
        body: TypedExpr;
      }
    | {
        type: "if";
        condition: TypedExpr;
        then: TypedExpr;
        else: TypedExpr;
      }
    | {
        type: "match";
        expr: TypedExpr;
        clauses: Array<[TypedMatchPattern, TypedExpr]>;
      }
  );

type ResolvedTypeMeta = { resolved?: TypedTypeDeclaration };
type ResolvedValueMeta = { declaration?: TypedDeclaration };
export type TypedExposedValue = ast.RangeMeta &
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

export type TypedImport = ast.RangeMeta & {
  ns: string;
  exposing: TypedExposedValue[];
};

export type PolyTypeMeta = { scheme: TypeScheme } & TypeMeta;

export type TypedTypeVariant = (PolyTypeMeta & ast.RangeMeta) & {
  name: string;
  args: TypedTypeAst[];
};

export type TypedTypeDeclaration = ast.RangeMeta & {
  name: string;
  params: Array<{ name: string } & ast.RangeMeta>;
  docComment?: string;
} & (
    | {
        type: "adt";
        variants: TypedTypeVariant[];
        pub: boolean | "..";
      }
    | ({
        type: "struct";
        fields: TypedStructDeclarationField[];
        pub: boolean | "..";
      } & PolyTypeMeta)
    | {
        type: "extern";
        pub: boolean;
      }
  );

export type TypedDeclaration = {
  scheme: TypeScheme;
} & ast.RangeMeta & {
    pub: boolean;
    binding: TypedBinding;
    docComment?: string;
  } & (
    | {
        inline: boolean;
        extern: false;
        typeHint?: TypedPolyTypeAst & ast.RangeMeta;
        value: TypedExpr;
      }
    | {
        extern: true;
        typeHint: TypedPolyTypeAst & ast.RangeMeta;
      }
  );

export type TypedModule = {
  moduleDoc?: string;
  imports: TypedImport[];
  typeDeclarations: TypedTypeDeclaration[];
  declarations: TypedDeclaration[];
};

export type Node = TypeMeta & ast.RangeMeta;

export type Identifier = TypedExpr & { type: "identifier" };
