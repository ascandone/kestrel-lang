import { TypedDeclaration, TypedExpr, TypedModule } from "../typecheck";
import { ConcreteType } from "../typecheck/type";
import * as t from "@babel/types";
import generate from "@babel/generator";
import { Binding, ConstLiteral } from "../parser";
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
  private frames: Frame[] = [];
  private currentDeclaration: Binding | undefined = undefined;

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
        if (src.resolution === undefined) {
          throw new Error("[unreachable] undefined resolution");
        }

        switch (src.resolution.type) {
          case "constructor":
            throw new Error("TODO handle constructor");

          case "local-variable":
            for (const frame of this.frames) {
              if (
                frame.data.type === "let" &&
                frame.data.binding === src.resolution.binding
              ) {
                return {
                  type: "Identifier",
                  name: frame.data.jsName,
                };
              }
            }
            throw new Error("[unrechable] binding not found");

          case "global-variable":
            return makeGlobalIdentifier(
              src.resolution.namespace,
              src.resolution.declaration.binding.name,
            );
        }
      }

      case "let": {
        if (src.pattern.type !== "identifier") {
          throw new Error("p match in ident");
        }

        const name = `${sanitizeNamespace(this.ns)}$${this.currentDeclaration!.name}$${src.pattern.name}`;
        this.frames.push(
          new Frame({
            type: "let",
            jsName: name,
            binding: src.pattern,
          }),
        );
        this.statementsBuf.push({
          type: "VariableDeclaration",
          kind: "const",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name },
              init: this.compileExpr(src.value),
            },
          ],
        });

        return this.compileExpr(src.body);
      }

      case "list-literal":
      case "struct-literal":
      case "fn":
      case "field-access":
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
      this.currentDeclaration = decl.binding;
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

class Frame {
  constructor(
    public readonly data:
      | { type: "let"; jsName: string; binding: Binding<unknown> }
      | { type: "fn" },
    // private compiler: Compiler,
  ) {}

  //   private usedVars = new Map<string, number>();

  //   preventShadow(name: string): string {
  //     const timesUsed = this.usedVars.get(name);
  //     if (timesUsed === undefined) {
  //       this.usedVars.set(name, 1);
  //       return name;
  //     }
  //     this.usedVars.set(name, timesUsed + 1);
  //     return `${name}$${timesUsed}`;
  //   }

  //   getUniqueName(ns?: string) {
  //     const namespace = ns === undefined ? "" : `${ns}$`;
  //     return `${namespace}GEN__${this.compiler.getNextId()}`;
  //   }
}
