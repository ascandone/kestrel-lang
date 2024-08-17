import { TypedDeclaration, TypedExpr, TypedModule } from "../typecheck";
import { ConcreteType } from "../typecheck/type";
import * as t from "@babel/types";
import generate from "@babel/generator";
import { ConstLiteral } from "../parser";
import { BinaryExpression } from "@babel/types";

export type CompileOptions = {
  externs?: Record<string, string>;
  optimize?: boolean;
  entrypoint?: {
    module: string;
    type: ConcreteType;
  };
};

export class Compiler {
  private ns = "";

  private statementsBuf: t.Statement[] = [];

  private compileExpr(src: TypedExpr): t.Expression {
    switch (src.type) {
      case "syntax-err":
        throw new Error("[unreachable]");

      case "constant":
        return compileConst(src.value);

      case "application": {
        if (src.caller.type === "identifier") {
          const infixName = toJsInfix(src.caller.name);
          if (infixName !== undefined) {
            return {
              type: "BinaryExpression",
              operator: infixName,
              left: this.compileExpr(src.args[0]!),
              right: this.compileExpr(src.args[1]!),
            };
          }
        }

        return {
          type: "CallExpression",
          callee: this.compileExpr(src.caller),
          arguments: src.args.map((arg) => this.compileExpr(arg)),
        };
      }

      case "identifier": {
        switch (src.resolution?.type) {
          case "constructor":
          case "local-variable":
            throw new Error("TODO handle ident");
          case "global-variable":
            return makeGlobalIdentifier(
              src.resolution.namespace,
              src.resolution.declaration.binding.name,
            );
        }
      }

      case "list-literal":
      case "struct-literal":
      case "fn":
      case "field-access":
      case "let":
      case "if":
      case "match":
        throw new Error("TODO handle expr: " + src.type);
    }
  }

  private compileDeclaration(decl: TypedDeclaration): t.Statement[] {
    if (decl.extern) {
      return [];
    }

    const out = this.compileExpr(decl.value);
    return [
      ...this.statementsBuf,
      {
        type: "VariableDeclaration",
        declarations: [
          {
            type: "VariableDeclarator",
            id: makeGlobalIdentifier(this.ns, decl.binding.name),
            init: out,
          },
        ],
        kind: "const",
      },
    ];
  }

  compile(src: TypedModule, ns: string): string {
    this.ns = ns;

    const body: t.Statement[] = [];

    for (const decl of src.declarations) {
      const outNode = this.compileDeclaration(decl);
      body.push(...outNode);
    }

    return generate({
      type: "Program",
      body,
      directives: [],
      sourceType: "script",
    }).code;
  }
}

function compileConst(ast: ConstLiteral): t.Expression {
  switch (ast.type) {
    case "int":
    case "float":
      return { type: "NumericLiteral", value: ast.value };

    case "string":
    case "char":
      return { type: "StringLiteral", value: ast.value };
  }
}

function toJsInfix(
  kestrelCaller: string,
): BinaryExpression["operator"] | undefined {
  switch (kestrelCaller) {
    case "+":
    case "*":
      return kestrelCaller;

    case "==":
      return "===";

    default:
      return undefined;
  }
}

function sanitizeNamespace(ns: string): string {
  return ns?.replace(/\//g, "$");
}

function makeGlobalIdentifier(ns: string, bindingName: string): t.Identifier {
  return {
    type: "Identifier",
    name: `${sanitizeNamespace(ns)}$${bindingName}`,
  };
}
