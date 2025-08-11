import * as typed from "../typecheck";
import * as ir from "./ir";

class ExprEmitter {
  constructor(private readonly currentDecl: ir.QualifiedIdentifier) {}

  private readonly uniques = new Map<string, number>();
  private getFreshUnique(name: string) {
    const unique = this.uniques.get(name) ?? 0;
    this.uniques.set(name, unique + 1);
    return unique;
  }

  private readonly loweredIdents = new Map<
    typed.TypedBinding,
    ir.Ident & { type: "local" }
  >();

  private genIdent(): ir.Ident & { type: "local" } {
    const name = "";

    return {
      type: "local",
      name,
      declaration: this.currentDecl,
      unique: this.getFreshUnique(name),
    };
  }

  private mkIdent(pattern: typed.TypedBinding): ir.Ident & { type: "local" } {
    const ident: ir.Ident & { type: "local" } = {
      type: "local",
      name: pattern.name,
      declaration: this.currentDecl,
      unique: this.getFreshUnique(pattern.name),
    };

    this.loweredIdents.set(pattern, ident);

    return ident;
  }

  private lowerBlock(
    statements: typed.TypedBlockStatement[],
    returning: typed.TypedExpr,
  ): ir.Expr {
    // TODO make this more efficient with loops
    const [stmt, ...statementsLeft] = statements;
    if (stmt === undefined) {
      return this.lowerExpr(returning);
    }

    switch (stmt.type) {
      case "let#": {
        if (stmt.pattern.type === "identifier") {
          const ident = this.mkIdent(stmt.pattern);

          return {
            type: "application",
            caller: this.lowerExpr(stmt.mapper),
            args: [
              this.lowerExpr(stmt.value),
              {
                type: "fn",
                bindings: [ident],
                body: this.lowerBlock(statementsLeft, returning),
              },
            ],
          };
        }

        const ident = this.genIdent();

        return {
          type: "application",
          caller: this.lowerExpr(stmt.mapper),
          args: [
            this.lowerExpr(stmt.value),
            {
              type: "fn",
              bindings: [ident],
              body: {
                type: "match",
                expr: { type: "identifier", ident },
                clauses: [
                  [
                    this.lowerPattern(stmt.pattern),
                    this.lowerBlock(statementsLeft, returning),
                  ],
                ],
              },
            },
          ],
        };
      }

      case "let": {
        if (stmt.pattern.type === "identifier") {
          return {
            type: "let",
            binding: this.mkIdent(stmt.pattern),
            value: this.lowerExpr(stmt.value),
            body: this.lowerBlock(statementsLeft, returning),
          };
        }

        const ident = this.genIdent();

        return {
          type: "let",
          binding: ident,
          value: this.lowerExpr(stmt.value),
          body: {
            type: "match",
            expr: { type: "identifier", ident },
            clauses: [
              [
                this.lowerPattern(stmt.pattern),
                this.lowerBlock(statementsLeft, returning),
              ],
            ],
          },
        };
      }
    }
  }

  private lowerPattern(expr: typed.TypedMatchPattern): ir.MatchPattern {
    switch (expr.type) {
      case "lit":
        return {
          type: "lit",
          literal: expr.literal,
        };

      case "identifier":
        return {
          type: "identifier",
          ident: this.mkIdent(expr),
        };

      case "constructor": {
        const resolution = getResolution(expr);
        if (resolution.type !== "constructor") {
          throw new CompilationError("wrong resolution for constructor");
        }

        const qualifiedIdent = new ir.QualifiedIdentifier(
          resolution.package_,
          resolution.namespace,
          resolution.declaration.name,
        );

        return {
          type: "constructor",
          args: expr.args.map((arg) => this.lowerPattern(arg)),
          name: resolution.variant.name,
          typeName: qualifiedIdent,
        };
      }
    }
  }

  public lowerExpr(expr: typed.TypedExpr): ir.Expr {
    switch (expr.type) {
      case "syntax-err":
        throw new CompilationError("syntax error");

      case "constant":
        return {
          type: "constant",
          value: expr.value,
        };

      case "identifier": {
        return {
          type: "identifier",
          ident: this.resolutionToIdent(getResolution(expr)),
        };
      }

      case "block":
        return this.lowerBlock(expr.statements, expr.returning);

      case "fn": {
        type BindingType = {
          param: typed.TypedMatchPattern;
          ident: ir.Ident & { type: "local" };
        };

        const bindings = expr.params.map(
          (param): BindingType => ({
            param,
            ident:
              param.type === "identifier"
                ? this.mkIdent(param)
                : this.genIdent(),
          }),
        );

        const getBody = bindings
          .filter((b) => b.ident.name === "")
          .reduceRight(
            (getExpr, { ident, param }) =>
              (): ir.Expr => ({
                type: "match",
                expr: { type: "identifier", ident },
                clauses: [[this.lowerPattern(param), getExpr()]],
              }),
            () => this.lowerExpr(expr.body),
          );

        return {
          type: "fn",
          bindings: bindings.map((b) => b.ident),
          body: getBody(),
        };
      }

      case "application":
        return {
          type: "application",
          caller: this.lowerExpr(expr.caller),
          args: expr.args.map((arg) => this.lowerExpr(arg)),
        };

      case "if":
        return {
          type: "if",
          condition: this.lowerExpr(expr.condition),
          then: this.lowerExpr(expr.then),
          else: this.lowerExpr(expr.else),
        };

      case "struct-literal": {
        const resolution = getResolution(expr.struct);

        const qualifiedIdent = new ir.QualifiedIdentifier(
          resolution.package_,
          resolution.namespace,
          resolution.declaration.name,
        );

        // TODO enumerate fields in the same order they appear in the struct
        return {
          type: "struct-literal",
          fields: expr.fields.map((field) => ({
            name: field.field.name,
            expr: this.lowerExpr(field.value),
          })),
          struct: qualifiedIdent,
          spread:
            expr.spread === undefined ? undefined : this.lowerExpr(expr.spread),
        };
      }

      case "field-access": {
        const resolution = getResolution(expr);

        const qualifiedIdent = new ir.QualifiedIdentifier(
          resolution.package_,
          resolution.namespace,
          resolution.declaration.name,
        );

        return {
          type: "field-access",
          field: {
            name: expr.field.name,
            struct: qualifiedIdent,
          },
          struct: this.lowerExpr(expr.struct),
        };
      }

      case "list-literal":
        return expr.values.reduceRight(
          (acc, expr): ir.Expr => CONS(this.lowerExpr(expr), acc),
          NIL,
        );

      case "match":
        return {
          type: "match",
          expr: this.lowerExpr(expr.expr),
          clauses: expr.clauses.map(
            ([pat, then_]) =>
              [this.lowerPattern(pat), this.lowerExpr(then_)] as const,
          ),
        };
    }
  }

  private resolutionToIdent(resolution: typed.IdentifierResolution): ir.Ident {
    switch (resolution.type) {
      case "local-variable": {
        const lookup = this.loweredIdents.get(resolution.binding);
        if (lookup === undefined) {
          throw new CompilationError(
            "can't find binding for: " + resolution.binding.name,
          );
        }

        return lookup;
      }

      case "constructor":
        return {
          type: "constructor",
          typeName: new ir.QualifiedIdentifier(
            resolution.package_,
            resolution.namespace,
            resolution.declaration.name,
          ),
          name: resolution.variant.name,
        };

      case "global-variable":
        return {
          type: "global",
          name: new ir.QualifiedIdentifier(
            resolution.package_,
            resolution.namespace,
            resolution.declaration.binding.name,
          ),
        };
    }
  }
}

// TODO we need to know the strongly connected components
export function lowerProgram(module: typed.TypedModule): ir.Program {
  const namespace = module.moduleInterface.ns;
  const package_ = module.moduleInterface.package_;

  const mkIdent = (name: string) =>
    new ir.QualifiedIdentifier(package_, namespace, name);

  return {
    namespace,
    package_,
    adts: module.typeDeclarations.flatMap((decl): ir.Adt[] => {
      if (decl.type !== "adt") {
        return [];
      }

      return [
        {
          name: mkIdent(decl.name),
          constructors: decl.variants.map(
            (ctor): ir.AdtConstructor => ({
              name: mkIdent(ctor.name),
              arity: ctor.args.length,
            }),
          ),
        },
      ];
    }),

    structs: module.typeDeclarations.flatMap((decl): ir.Struct[] => {
      if (decl.type !== "struct") {
        return [];
      }

      return [
        {
          name: mkIdent(decl.name),
          fields: decl.fields.map((f) => f.name),
        },
      ];
    }),

    values: module.declarations.flatMap((decl): ir.ValueDeclaration[] => {
      if (decl.extern) {
        return [];
      }

      const currentDecl = mkIdent(decl.binding.name);
      const emitter = new ExprEmitter(currentDecl);

      return [
        {
          name: mkIdent(decl.binding.name),
          value: emitter.lowerExpr(decl.value),
          inline: decl.inline,
        },
      ];
    }),
  };
}

export class CompilationError extends Error {}

function getResolution<T>(node: { $resolution?: T | undefined }): T {
  if (node.$resolution === undefined) {
    throw new CompilationError("Undefined resolution");
  }
  return node.$resolution;
}

const listQualifiedName = new ir.QualifiedIdentifier(
  typed.CORE_PACKAGE,
  "List",
  "List",
);

const NIL: ir.Expr = {
  type: "identifier",
  ident: {
    type: "constructor",
    typeName: listQualifiedName,
    name: "Nil",
  },
};

const CONS = (hd: ir.Expr, tl: ir.Expr): ir.Expr => ({
  type: "application",
  args: [hd, tl],
  caller: {
    type: "identifier",
    ident: {
      type: "constructor",
      name: "Cons",
      typeName: listQualifiedName,
    },
  },
});
