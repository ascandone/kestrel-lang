import * as typed from "../typecheck";
import * as ir from "./ir";

class ExprEmitter {
  constructor(private readonly currentDecl: ir.QualifiedIdentifier) {}

  private readonly uniques = new Map<string, number>();
  public getFreshUnique(name: string) {
    const unique = this.uniques.get(name) ?? 0;
    this.uniques.set(name, unique + 1);
    return unique;
  }

  private readonly loweredIdents = new Map<
    typed.TypedBinding,
    ir.Ident & { type: "local" }
  >();

  private mkIdent(pattern: typed.TypedBinding) {
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
      case "let#":
        throw new Error("TODO let#");

      case "let":
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

      case "list-literal":
      case "struct-literal":
      case "field-access":
      case "match":
        throw new Error("TODO impl");
    }
  }

  private resolutionToIdent(resolution: typed.IdentifierResolution): ir.Ident {
    switch (resolution.type) {
      case "local-variable": {
        const lookup = this.loweredIdents.get(resolution.binding);
        if (lookup === undefined) {
          throw new CompilationError("can't find binding");
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
          typeName: resolution.declaration.name,
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
