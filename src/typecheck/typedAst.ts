import * as ast from "../parser";
import { Type, RigidVarsCtx } from "../type";
import { DecisionTree } from "./exhaustiveness";

// -- Common

assertSubtype<ast.PolyTypeAst, TypedPolyTypeAst>;
export type TypedPolyTypeAst = ast.RangeMeta & {
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
        type: "constant";
        value: ast.ConstLiteral;
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
        tail?: TypedExpr;
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
        $decisionTree?: DecisionTree;
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
        $resolution: TypedValueDeclaration | undefined;
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
  args: {
    ast: TypedTypeAst;
    $type: Type;
  }[];

  $type: Type;
};

assertSubtype<ast.ValueDeclarationAttribute, TypedValueDeclarationAttribute>;
export type TypedValueDeclarationAttribute = ast.RangeMeta &
  (
    | { type: "@type"; polytype: TypedPolyTypeAst }
    | { type: "@inline" }
    | { type: "@extern" }
  );

assertSubtype<ast.ValueDeclaration, TypedValueDeclaration>;
export type TypedValueDeclaration = ast.RangeMeta & {
  pub: boolean;
  binding: TypedBinding;
  docComment?: string;
  attributes: TypedValueDeclarationAttribute[];
  value?: TypedExpr;

  $traitsConstraints: RigidVarsCtx;
};

assertSubtype<ast.TypeDeclaration, TypedTypeDeclaration>;
export type TypedTypeDeclaration = ast.RangeMeta & {
  name: string;
  params: Array<{ name: string } & ast.RangeMeta>;
  docComment?: string;

  $type: Type;
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
  declarations: TypedValueDeclaration[];

  // TODO move it outside of this struct
  moduleInterface: ModuleInterface;
  mutuallyRecursiveDeclrs: TypedValueDeclaration[][];
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
  publicValues: Record<string, TypedValueDeclaration>;
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
      declaration: TypedValueDeclaration;
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

export type TypeMeta = { $type: Type };

export type FieldResolution = StructResolution & {
  field: TypedStructDeclarationField;
};

export type FieldResolutionMeta = {
  resolution: FieldResolution | undefined;
};
