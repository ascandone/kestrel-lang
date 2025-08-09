import * as ast from "../parser";
import { TVar, TypeScheme } from "../type";
export * from "./typedAst/findReferences";
export * from "./typedAst/gotoDefinition";
export * from "./typedAst/inlayHint";
export * from "./typedAst/hoverOn";
export * from "./typedAst/signatureHint";
export { foldTree } from "./typedAst/common";

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
        $resolution: TypeResolution | undefined;
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
        $resolution: IdentifierResolution | undefined;
      }
  );

assertSubtype<ast.Binding, TypedBinding>;
export type TypedBinding = { name: string } & TypeMeta & ast.RangeMeta;

assertSubtype<ast.StructField, TypedStructField>;
export type TypedStructField = ast.RangeMeta & {
  field: ast.RangeMeta & {
    name: string;
    $resolution: FieldResolution | undefined;
  };
  value: TypedExpr;
};

assertSubtype<ast.StructDeclarationField, TypedStructDeclarationField>;
export type TypedStructDeclarationField = (PolyTypeMeta & ast.RangeMeta) & {
  name: string;
  typeAst: TypedTypeAst;
};

assertSubtype<ast.Expr, TypedExpr>;
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
          $resolution: StructResolution | undefined;
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
        $resolution: IdentifierResolution | undefined;
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
    | {
        type: "field-access";
        struct: TypedExpr;
        field: ast.RangeMeta & {
          name: string;
          structName?: string;
        };
        $resolution: FieldResolution | undefined;
      }
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

assertSubtype<ast.ExposedValue, TypedExposedValue>;
export type TypedExposedValue = ast.RangeMeta &
  (
    | {
        type: "type";
        name: string;
        exposeImpl: boolean;
        $resolution: TypedTypeDeclaration | undefined;
      }
    | {
        type: "value";
        name: string;
        $resolution: TypedDeclaration | undefined;
      }
  );

assertSubtype<ast.Import, TypedImport>;
export type TypedImport = ast.RangeMeta & {
  ns: string;
  exposing: TypedExposedValue[];
};

assertSubtype<ast.TypeVariant, TypedTypeVariant>;
export type TypedTypeVariant = (PolyTypeMeta & ast.RangeMeta) & {
  name: string;
  args: TypedTypeAst[];
};

assertSubtype<ast.Declaration, TypedDeclaration>;
export type TypedDeclaration = ast.RangeMeta & {
  pub: boolean;
  binding: TypedBinding;
  docComment?: string;
  $scheme: TypeScheme;
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

assertSubtype<ast.TypeDeclaration, TypedTypeDeclaration>;
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

export type TypedModule = {
  moduleDoc?: string;
  imports: TypedImport[];
  typeDeclarations: TypedTypeDeclaration[];
  declarations: TypedDeclaration[];

  // TODO move it outside of this struct
  moduleInterface: ModuleInterface;
};

// -- specific

export type ModuleInterface = {
  ns: string;

  publicTypes: Record<string, TypedTypeDeclaration>;
  publicConstructors: Record<
    string,
    IdentifierResolution & { type: "constructor" }
  >;
  publicValues: Record<string, TypedDeclaration>;
  publicFields: Record<string, FieldResolution>;
};

function assertSubtype<T1, _T2 extends T1>() {}
export type Identifier = TypedExpr & { type: "identifier" };
export type PolyTypeMeta = { $scheme: TypeScheme } & TypeMeta;

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

export type TypeMeta = { $type: TVar };

export type FieldResolution = StructResolution & {
  field: TypedStructDeclarationField;
};

export type FieldResolutionMeta = {
  resolution: FieldResolution | undefined;
};
