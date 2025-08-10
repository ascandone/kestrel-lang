import { ErrorInfo } from "./errors";
import {
  Declaration,
  Expr,
  Import,
  MatchPattern,
  TypeAst,
  TypeDeclaration,
  UntypedModule,
} from "../parser";
import { TVar } from "../type";
import {
  TypedBinding,
  TypedDeclaration,
  TypedExposedValue,
  TypedExpr,
  TypedImport,
  TypedMatchPattern,
  TypedModule,
  TypedStructDeclarationField,
  TypedStructField,
  TypedTypeAst,
  TypedTypeDeclaration,
} from "./typedAst";
import * as err from "./errors";

// TODO instead of traversing tree, mark fields as optional in the raw tree and use structuredClone to mutate freely

export class Annotator {
  constructor(private readonly errors: ErrorInfo[]) {}

  public annotateModule(
    module: UntypedModule,
  ): Omit<TypedModule, "moduleInterface"> {
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
        return typeDecl;

      case "adt":
        return {
          ...typeDecl,
          variants: typeDecl.variants.map((variant) => ({
            ...variant,
            $scheme: {},
            $type: TVar.fresh(),
            args: variant.args.map((arg) => this.annotateTypeAst(arg)),
          })),
        };

      case "struct":
        return {
          ...typeDecl,
          $scheme: {},
          $type: TVar.fresh(),
          fields: typeDecl.fields.map(
            (untypedField): TypedStructDeclarationField => ({
              ...untypedField,
              $type: TVar.fresh(),
              $scheme: {},
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

  private annotateDeclaration(decl: Declaration): TypedDeclaration {
    const binding: TypedBinding = {
      ...decl.binding,
      $type: TVar.fresh(),
    };

    let tDecl: TypedDeclaration;
    if (decl.extern) {
      tDecl = {
        ...decl,
        $scheme: {},
        binding,
        typeHint: undefined!,
      };
    } else {
      tDecl = {
        ...decl,
        $scheme: {},
        binding,
        typeHint: undefined!,
        value: this.annotateExpr(decl.value),
      };
    }

    if (decl.typeHint !== undefined) {
      tDecl.typeHint = {
        mono: this.annotateTypeAst(decl.typeHint.mono),
        range: decl.typeHint.range,
        where: decl.typeHint.where,
      };
    }

    return tDecl;
  }

  private annotateMatchPattern(ast: MatchPattern): TypedMatchPattern {
    switch (ast.type) {
      case "lit":
      case "identifier":
        return {
          ...ast,
          $type: TVar.fresh(),
        };

      case "constructor":
        return {
          ...ast,
          args: ast.args.map((arg) => this.annotateMatchPattern(arg)),
          $resolution: undefined,
          $type: TVar.fresh(),
        };
    }
  }

  private annotateExpr(ast: Expr): TypedExpr {
    switch (ast.type) {
      // Syntax sugar
      case "pipe":
        if (ast.right.type !== "application") {
          this.errors.push({
            range: ast.right.range,
            description: new err.InvalidPipe(),
          });
          return this.annotateExpr(ast.left);
        }

        return this.annotateExpr({
          type: "application",
          isPipe: true,
          range: ast.range,
          caller: ast.right.caller,
          args: [ast.left, ...ast.right.args],
        });

      case "infix":
        return this.annotateExpr({
          type: "application",
          caller: { type: "identifier", name: ast.operator, range: ast.range },
          args: [ast.left, ast.right],
          range: ast.range,
        });

      // Actual AST
      case "syntax-err":
      case "constant":
        return { ...ast, $type: TVar.fresh() };

      case "block":
        return {
          ...ast,
          returning: this.annotateExpr(ast.returning),
          statements: ast.statements.map((st) => {
            switch (st.type) {
              case "let":
                return {
                  ...st,
                  $type: TVar.fresh(),
                  pattern: this.annotateMatchPattern(st.pattern),
                  value: this.annotateExpr(st.value),
                };

              case "let#":
                return {
                  ...st,
                  mapper: {
                    ...st.mapper,
                    $resolution: undefined,
                    $type: TVar.fresh(),
                  },
                  $type: TVar.fresh(),
                  pattern: this.annotateMatchPattern(st.pattern),
                  value: this.annotateExpr(st.value),
                };
            }
          }),
          $type: TVar.fresh(),
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
          $type: TVar.fresh(),
        };

      case "list-literal":
        return {
          ...ast,
          values: ast.values.map((v) => this.annotateExpr(v)),
          $type: TVar.fresh(),
        };

      case "identifier":
        return {
          ...ast,
          $resolution: undefined,
          $type: TVar.fresh(),
        };

      case "fn":
        return {
          ...ast,
          $type: TVar.fresh(),
          body: this.annotateExpr(ast.body),
          params: ast.params.map((p) => this.annotateMatchPattern(p)),
        };

      case "application":
        return {
          ...ast,
          $type: TVar.fresh(),
          caller: this.annotateExpr(ast.caller),
          args: ast.args.map((arg) => this.annotateExpr(arg)),
        };

      case "field-access":
        return {
          ...ast,
          struct: this.annotateExpr(ast.struct),
          $resolution: undefined,
          $type: TVar.fresh(),
        };

      case "if":
        return {
          ...ast,
          condition: this.annotateExpr(ast.condition),
          then: this.annotateExpr(ast.then),
          else: this.annotateExpr(ast.else),
          $type: TVar.fresh(),
        };

      case "match":
        return {
          ...ast,
          $type: TVar.fresh(),
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
