import {
  TypedDeclaration,
  TypedExpr,
  TypedMatchPattern,
  TypedModule,
} from "../typecheck";
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
  private bindingsJsName = new WeakMap<Binding, t.Identifier>();

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
            return this.bindingsJsName.get(src.resolution.binding)!;

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
        const curFrame = this.frames.at(-1);
        if (curFrame === undefined) {
          throw new Error("[unrechable] empty frames stack");
        }

        this.frames.push(
          new Frame({
            type: "let",
            jsPatternName: curFrame.registerLocal(src.pattern.name),
          }),
        );

        const ident: t.Identifier = {
          type: "Identifier",
          name: this.makeJsLetPathName(),
        };
        this.bindingsJsName.set(src.pattern, ident);
        this.statementsBuf.push({
          type: "VariableDeclaration",
          kind: "const",
          declarations: [
            {
              type: "VariableDeclarator",
              id: ident,
              init: this.compileExpr(src.value),
            },
          ],
        });
        this.frames.pop();

        return this.compileExpr(src.body);

        // we could call this.bindingsJsName.delete(src.pattern) here
      }

      case "fn": {
        const frame = new Frame({ type: "fn" });
        this.frames.push(frame);
        return this.withBlock((): t.Expression => {
          const params = src.params.map(
            (param): t.Identifier => this.compilePattern(frame, param),
          );
          const body = this.compileExpr(src.body);
          // TODO return value with no block if no statements

          return {
            type: "ArrowFunctionExpression",
            async: false,
            expression: true,
            params,
            body: {
              type: "BlockStatement",
              directives: [],
              body: [
                ...this.statementsBuf,
                { type: "ReturnStatement", argument: body },
              ],
            },
          };
        });
      }

      case "list-literal":
      case "struct-literal":
      case "field-access":
      case "if":
      case "match":
        throw new Error("TODO handle expr: " + src.type);
    }
  }

  private compilePattern(
    frame: Frame,
    pattern: TypedMatchPattern,
  ): t.Identifier {
    switch (pattern.type) {
      case "identifier": {
        const name = frame.registerLocal(pattern.name);
        const identifier: t.Identifier = { type: "Identifier", name };
        this.bindingsJsName.set(pattern, identifier);
        return identifier;
      }

      case "lit":
      case "constructor":
        throw new Error("TODO ");
    }
  }

  private withBlock<T>(f: () => T): T {
    const buf = this.statementsBuf;
    this.statementsBuf = [];
    const e = f();
    this.statementsBuf = buf;
    return e;
  }

  private makeJsLetPathName(): string {
    const buf: string[] = [];
    let isFn = false;
    for (const frame of reversed(this.frames)) {
      if (frame.data.type === "fn") {
        isFn = true;
        break;
      }

      buf.push(frame.data.jsPatternName);
    }

    if (!isFn) {
      buf.push(sanitizeNamespace(this.ns));
    }

    if (buf.length === 0) {
      throw new Error("empty buf");
    }

    buf.reverse();
    return buf.join("$");
  }

  private compileDeclaration(decl: TypedDeclaration): t.Statement[] {
    if (decl.extern) {
      return [];
    }

    this.frames.push(
      new Frame({
        type: "let",
        jsPatternName: decl.binding.name,
      }),
    );

    const out = this.compileExpr(decl.value);
    this.frames.pop();

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

class Frame {
  constructor(
    public readonly data:
      | { type: "let"; jsPatternName: string }
      | { type: "fn" },
  ) {}

  private usedVars = new Map<string, number>();

  registerLocal(name: string): string {
    const timesUsed = this.usedVars.get(name) ?? 0;
    this.usedVars.set(name, timesUsed + 1);

    return timesUsed === 0 ? name : `${name}$${timesUsed}`;
  }

  //   getUniqueName(ns?: string) {
  //     const namespace = ns === undefined ? "" : `${ns}$`;
  //     return `${namespace}GEN__${this.compiler.getNextId()}`;
  //   }
}

function* reversed<T>(xs: T[]): Generator<T> {
  for (let i = xs.length - 1; i >= 0; i--) {
    yield xs[i]!;
  }
}
