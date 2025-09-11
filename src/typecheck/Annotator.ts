import {
  ValueDeclaration,
  Expr,
  Import,
  MatchPattern,
  TypeAst,
  TypeDeclaration,
  UntypedModule,
  ValueDeclarationAttribute,
} from "../parser";
import { TVar } from "../type";
import {
  TypedBlockStatement,
  TypedValueDeclaration,
  TypedExposedValue,
  TypedExpr,
  TypedImport,
  TypedMatchPattern,
  TypedModule,
  TypedStructDeclarationField,
  TypedStructField,
  TypedTypeAst,
  TypedTypeDeclaration,
  TypedValueDeclarationAttribute,
} from "./typedAst";

// TODO instead of traversing tree, mark fields as optional in the raw tree and use structuredClone to mutate freely

export class Annotator {
  public annotateModule(
    module: UntypedModule,
  ): Omit<TypedModule, "moduleInterface" | "mutuallyRecursiveDeclrs"> {
    return {
      moduleDoc: module.moduleDoc,
      declarations: module.declarations.map((d) => this.annotateDeclaration(d)),
      imports: module.imports.map((i) => this.annotateImport(i)),
      typeDeclarations: module.typeDeclarations.map((td) =>
        this.annotateTypeDeclaration(td),
      ),
    };
  }

  private annotateTypeDeclaration(
    typeDecl: TypeDeclaration,
  ): TypedTypeDeclaration {
    switch (typeDecl.type) {
      case "extern":
        return {
          $type: TVar.freshType(),
          $traits: new Map(),
          ...typeDecl,
        };

      case "adt":
        return {
          ...typeDecl,
          $type: TVar.freshType(),
          $traits: new Map(),
          variants: typeDecl.variants.map((variant) => ({
            ...variant,
            $scheme: {},
            $type: TVar.freshType(),
            args: variant.args.map((arg) => ({
              $type: TVar.freshType(),
              ast: this.annotateTypeAst(arg.ast),
            })),
          })),
        };

      case "struct":
        return {
          ...typeDecl,
          $traits: new Map(),
          $type: TVar.freshType(),
          fields: typeDecl.fields.map(
            (untypedField): TypedStructDeclarationField => ({
              ...untypedField,
              $type: TVar.freshType(),
              typeAst: this.annotateTypeAst(untypedField.typeAst),
            }),
          ),
        };
    }
  }

  private annotateTypeAst(ast: TypeAst): TypedTypeAst {
    switch (ast.type) {
      case "var":
      case "any":
        return ast;

      case "fn":
        return {
          ...ast,
          args: ast.args.map((a) => this.annotateTypeAst(a)),
          return: this.annotateTypeAst(ast.return),
        };

      case "named":
        return {
          ...ast,
          args: ast.args.map((a) => this.annotateTypeAst(a)),
          $resolution: undefined,
        };
    }
  }

  public annotateImport(import_: Import): TypedImport {
    return {
      ...import_,
      exposing: import_.exposing.map(
        (exposing): TypedExposedValue => ({
          ...exposing,
          $resolution: undefined,
        }),
      ),
    };
  }

  private annotateAttribute(
    attr: ValueDeclarationAttribute,
  ): TypedValueDeclarationAttribute {
    switch (attr.type) {
      case "@type":
        return {
          ...attr,
          polytype: {
            ...attr.polytype,
            mono: this.annotateTypeAst(attr.polytype.mono),
          },
        };

      case "@inline":
      case "@extern":
        return attr;
    }
  }

  private annotateDeclaration(decl: ValueDeclaration): TypedValueDeclaration {
    return {
      ...decl,

      attributes: decl.attributes.map((a) => this.annotateAttribute(a)),
      binding: {
        ...decl.binding,
        $type: TVar.freshType(),
      },
      value:
        decl.value === undefined ? undefined : this.annotateExpr(decl.value),
      $traitsConstraints: {},
    };
  }

  private annotateMatchPattern(ast: MatchPattern): TypedMatchPattern {
    switch (ast.type) {
      case "lit":
      case "identifier":
        return {
          ...ast,
          $type: TVar.freshType(),
        };

      case "constructor":
        return {
          ...ast,
          args: ast.args.map((arg) => this.annotateMatchPattern(arg)),
          $resolution: undefined,
          $type: TVar.freshType(),
        };
    }
  }

  private annotateExpr(ast: Expr): TypedExpr {
    switch (ast.type) {
      // Syntax sugar
      case "infix":
        return this.annotateExpr({
          type: "application",
          caller: { type: "identifier", name: ast.operator, range: ast.range },
          args: [ast.left, ast.right],
          range: ast.range,
        });

      // Actual AST
      case "pipe":
        return {
          ...ast,
          $type: TVar.freshType(),
          left: this.annotateExpr(ast.left),
          right: this.annotateExpr(ast.right),
        };

      case "syntax-err":
      case "constant":
        return { ...ast, $type: TVar.freshType() };

      case "block":
        return {
          ...ast,
          returning: this.annotateExpr(ast.returning),
          statements: ast.statements.map((st): TypedBlockStatement => {
            switch (st.type) {
              case "let":
                return {
                  ...st,
                  $type: TVar.freshType(),
                  pattern: this.annotateMatchPattern(st.pattern),
                  value: this.annotateExpr(st.value),
                };

              case "let#":
                return {
                  ...st,
                  mapper: {
                    ...st.mapper,
                    $instantiated: new Map(),
                    $resolution: undefined,
                    $type: TVar.freshType(),
                  },
                  $type: TVar.freshType(),
                  pattern: this.annotateMatchPattern(st.pattern),
                  value: this.annotateExpr(st.value),
                };
            }
          }),
          $type: TVar.freshType(),
        };

      case "struct-literal":
        return {
          ...ast,
          fields: ast.fields.map(
            (field): TypedStructField => ({
              ...field,
              field: {
                ...field.field,
                $resolution: undefined,
              },
              value: this.annotateExpr(field.value),
            }),
          ),
          struct: {
            ...ast.struct,
            $resolution: undefined,
          },
          spread:
            ast.spread === undefined
              ? undefined
              : this.annotateExpr(ast.spread),
          $type: TVar.freshType(),
        };

      case "list-literal":
        return {
          ...ast,
          values: ast.values.map((v) => this.annotateExpr(v)),
          $type: TVar.freshType(),
          tail:
            ast.tail === undefined ? undefined : this.annotateExpr(ast.tail),
        };

      case "identifier":
        return {
          ...ast,
          $resolution: undefined,
          $type: TVar.freshType(),
          $instantiated: new Map(),
        };

      case "fn":
        return {
          ...ast,
          $type: TVar.freshType(),
          body: this.annotateExpr(ast.body),
          params: ast.params.map((p) => this.annotateMatchPattern(p)),
        };

      case "application":
        return {
          ...ast,
          $type: TVar.freshType(),
          caller: this.annotateExpr(ast.caller),
          args: ast.args.map((arg) => this.annotateExpr(arg)),
        };

      case "field-access":
        return {
          ...ast,
          struct: this.annotateExpr(ast.struct),
          $resolution: undefined,
          $type: TVar.freshType(),
        };

      case "if":
        return {
          ...ast,
          condition: this.annotateExpr(ast.condition),
          then: this.annotateExpr(ast.then),
          else: this.annotateExpr(ast.else),
          $type: TVar.freshType(),
        };

      case "match":
        return {
          ...ast,
          $type: TVar.freshType(),
          expr: this.annotateExpr(ast.expr),
          clauses: ast.clauses.map(([pattern, expr]) => {
            const annotatedPattern = this.annotateMatchPattern(pattern);
            const annotatedExpr = this.annotateExpr(expr);
            return [annotatedPattern, annotatedExpr];
          }),
        };
    }
  }
}
