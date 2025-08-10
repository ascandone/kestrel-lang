import * as typed from "../typecheck";
import * as ir from "./ir";

function lowerIdent(resolution: typed.IdentifierResolution): ir.Ident {
  switch (resolution.type) {
    case "local-variable":
      return {
        type: "local",
        name: resolution.binding.name,
        // TODO pkg, module
        declaration: new ir.QualifiedIdentifier(
          "pkg",
          "Main",
          resolution.binding.name,
        ),
        unique: 0,
      };

    case "constructor":
      return {
        type: "constructor",
        // TODO pkg
        name: new ir.QualifiedIdentifier(
          "pkg",
          resolution.namespace,
          resolution.variant.name,
        ),
        typeName: resolution.declaration.name,
      };

    case "global-variable":
      return {
        type: "global",
        // TODO pkg
        name: new ir.QualifiedIdentifier(
          "pkg",
          resolution.namespace,
          resolution.declaration.binding.name,
        ),
      };
  }
}

function lowerExpr(expr: typed.TypedExpr): ir.Expr {
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
        ident: lowerIdent(getResolution(expr)),
      };
    }

    case "list-literal":
    case "struct-literal":
    case "fn":
    case "application":
    case "field-access":
    case "block":
    case "if":
    case "match":
      throw new Error("TODO impl");
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

      return [
        {
          name: decl.binding.name,
          value: lowerExpr(decl.value),
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
