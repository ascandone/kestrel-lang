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

type CompilationMode = {
  type: "expr";
  expr: t.Expression;
  statements: t.Statement[];
};

export class Compiler {
  private ns = "";

  private compileExpr(src: TypedExpr): CompilationMode {
    switch (src.type) {
      case "syntax-err":
        throw new Error("[unreachable]");

      case "constant":
        return { type: "expr", expr: compileConst(src.value), statements: [] };

      case "application": {
        if (src.caller.type === "identifier") {
          const infixName = toJsInfix(src.caller.name);
          if (infixName !== undefined) {
            const l = this.compileExpr(src.args[0]!);
            const r = this.compileExpr(src.args[1]!);
            return {
              type: "expr",
              statements: [...l.statements, ...r.statements],
              expr: {
                type: "BinaryExpression",
                operator: infixName,
                left: l.expr,
                right: r.expr,
              },
            };
          }
        }
      }

      case "list-literal":
      case "struct-literal":
      case "identifier":
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
    switch (out.type) {
      case "expr": {
        const ident = `${sanitizeNamespace(this.ns)}$${decl.binding.name}`;
        return [
          ...out.statements,
          {
            type: "VariableDeclaration",
            declarations: [
              {
                type: "VariableDeclarator",
                id: { type: "Identifier", name: ident },
                init: out.expr,
              },
            ],
            kind: "const",
          },
        ];
      }
    }
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

function sanitizeNamespace(ns: string): string {
  return ns?.replace(/\//g, "$");
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
