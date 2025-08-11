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
        if (stmt.pattern.type !== "identifier") {
          throw new Error("TODO pattern matching in let");
        }

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

      case "let": {
        if (stmt.pattern.type !== "identifier") {
          throw new Error("TODO pattern matching in let");
        }

        const ident = this.mkIdent(stmt.pattern);

        return {
          type: "let",
          binding: ident,
          value: this.lowerExpr(stmt.value),
          body: this.lowerBlock(statementsLeft, returning),
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
          resolution.variant.name,
        );

        return {
          type: "constructor",
          args: expr.args.map((arg) => this.lowerPattern(arg)),
          name: qualifiedIdent,
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
        const bindings = expr.params.map((param) => {
          if (param.type !== "identifier") {
            throw new Error("TODO complex pattern identifiers");
          }

          return this.mkIdent(param);
        });

        return {
          type: "fn",
          bindings,
          body: this.lowerExpr(expr.body),
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
          name: new ir.QualifiedIdentifier(
            resolution.package_,
            resolution.namespace,
            resolution.variant.name,
          ),
          // typeName: resolution.declaration.name,
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
  return {
    namespace: module.moduleInterface.ns,
    package_: module.moduleInterface.package_,
    values: module.declarations.flatMap((decl): ir.Value[] => {
      if (decl.extern) {
        return [];
      }

      const currentDecl = new ir.QualifiedIdentifier(
        module.moduleInterface.package_,
        module.moduleInterface.ns,
        decl.binding.name,
      );

      const emitter = new ExprEmitter(currentDecl);

      return [
        {
          name: decl.binding.name,
          value: emitter.lowerExpr(decl.value),
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

const NIL: ir.Expr = {
  type: "identifier",
  ident: {
    type: "constructor",
    // typeName: "List",
    name: new ir.QualifiedIdentifier(typed.CORE_PACKAGE, "List", "Nil"),
  },
};

const CONS = (hd: ir.Expr, tl: ir.Expr): ir.Expr => ({
  type: "application",
  args: [hd, tl],
  caller: {
    type: "identifier",
    ident: {
      type: "constructor",
      // typeName: "List",
      name: new ir.QualifiedIdentifier(typed.CORE_PACKAGE, "List", "Cons"),
    },
  },
});
