import * as ast from "../parser";
import { TVar, Type, RigidVarsCtx } from "../type";

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
        // TODO can we force this statically to be a constructor?
        $resolution: IdentifierResolution | undefined;
      }
  );

assertSubtype<ast.Binding, TypedBinding>;
export type TypedBinding = { name: string } & TypeMeta & ast.RangeMeta;

assertSubtype<ast.BlockStatement, TypedBlockStatement>;
export type TypedBlockStatement = (TypeMeta & ast.RangeMeta) &
  (
    | {
        type: "let";
        pattern: TypedMatchPattern;
        value: TypedExpr;
      }
    | {
        type: "let#";
        mapper: TypedExpr & { type: "identifier" };
        pattern: TypedMatchPattern;
        value: TypedExpr;
      }
  );

assertSubtype<ast.StructField, TypedStructField>;
export type TypedStructField = ast.RangeMeta & {
  field: ast.RangeMeta & {
    name: string;
    $resolution: FieldResolution | undefined;
  };
  value: TypedExpr;
};

assertSubtype<ast.StructDeclarationField, TypedStructDeclarationField>;
export type TypedStructDeclarationField = ast.RangeMeta & {
  name: string;
  typeAst: TypedTypeAst;

  $type: Type;
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
        $instantiated: Map<string, Type>;
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
      }
    | {
        type: "pipe";
        left: TypedExpr;
        right: TypedExpr;
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
        type: "block";
        statements: TypedBlockStatement[];
        returning: TypedExpr;
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
export type TypedTypeVariant = ast.RangeMeta & {
  name: string;
  args: TypedTypeAst[];

  $type: Type;
};

assertSubtype<ast.Declaration, TypedDeclaration>;
export type TypedDeclaration = ast.RangeMeta & {
  pub: boolean;
  binding: TypedBinding;
  docComment?: string;

  $traitsConstraints: RigidVarsCtx;
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

  $traits: Map<string, Set<string>[]>;
} & (
    | {
        type: "adt";
        variants: TypedTypeVariant[];
        pub: boolean | "..";
      }
    | {
        type: "struct";
        fields: TypedStructDeclarationField[];
        pub: boolean | "..";

        $type: Type;
      }
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
  package_: string;
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

export type TypeResolution = {
  declaration: TypedTypeDeclaration;
  package_: string;
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
      package_: string;
      namespace: string;
    }
  | {
      type: "constructor";
      variant: TypedTypeVariant;
      declaration: TypedTypeDeclaration & { type: "adt" };
      package_: string;
      namespace: string;
    };

export type StructResolution = {
  declaration: TypedTypeDeclaration & { type: "struct" };
  package_: string;
  namespace: string;
};

export type TypeMeta = { $type: TVar };

export type FieldResolution = StructResolution & {
  field: TypedStructDeclarationField;
};

export type FieldResolutionMeta = {
  resolution: FieldResolution | undefined;
};
