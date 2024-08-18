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

export function compile(ns: string, ast: TypedModule): string {
  return new Compiler(ns).compile(ast);
}

class Compiler {
  private statementsBuf: t.Statement[] = [];
  private frames: Frame[] = [];
  private bindingsJsName = new WeakMap<Binding, t.Identifier>();

  constructor(private ns: string) {}

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
        const [{ params, body }, stms] = this.wrapStatements(() => {
          const params = src.params.map(
            (param): t.Identifier => this.compilePattern(frame, param),
          );
          const body = this.compileExpr(src.body);
          return { params, body };
        });

        const bodyStm: t.BlockStatement | t.Expression =
          stms.length === 0
            ? body
            : {
                type: "BlockStatement",
                directives: [],
                body: [...stms, { type: "ReturnStatement", argument: body }],
              };

        return {
          type: "ArrowFunctionExpression",
          async: false,
          expression: true,
          params,
          body: bodyStm,
        };
      }

      case "if": {
        const curFrame = this.frames.at(-1);
        if (curFrame === undefined) {
          throw new Error("empty frames stack");
        }

        const identName = this.makeJsLetPathName(curFrame.genFreshId());

        const ident: t.Identifier = {
          type: "Identifier",
          name: identName,
        };

        const test = this.compileExpr(src.condition);
        const [thenBranchExpr, thenBranchStmts] = this.wrapStatements(() =>
          this.compileExpr(src.then),
        );

        const [elseBranchExpr, elseBranchStmts] = this.wrapStatements(() =>
          this.compileExpr(src.else),
        );

        this.statementsBuf.push(
          {
            type: "VariableDeclaration",
            kind: "let",
            declarations: [{ type: "VariableDeclarator", id: ident }],
          },
          {
            type: "IfStatement",
            test: test,
            consequent: {
              type: "BlockStatement",
              directives: [],
              body: [
                ...thenBranchStmts,

                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "AssignmentExpression",
                    operator: "=",
                    left: ident,
                    right: thenBranchExpr,
                  },
                },
              ],
            },
            alternate: {
              type: "BlockStatement",
              directives: [],
              body: [
                ...elseBranchStmts,
                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "AssignmentExpression",
                    operator: "=",
                    left: ident,
                    right: elseBranchExpr,
                  },
                },
              ],
            },
          },
        );

        return ident;
      }

      case "list-literal":
      case "struct-literal":
      case "field-access":
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

  private wrapStatements<T>(f: () => T): [T, t.Statement[]] {
    const buf = this.statementsBuf;
    this.statementsBuf = [];
    const e = f();
    const stms = this.statementsBuf;
    this.statementsBuf = buf;
    return [e, stms];
  }

  private makeJsLetPathName(trailing?: string): string {
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

    buf.reverse();
    if (trailing !== undefined) {
      buf.push(trailing);
    }
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

  compile(src: TypedModule): string {
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
  private nextId = 0;

  registerLocal(name: string): string {
    const timesUsed = this.usedVars.get(name) ?? 0;
    this.usedVars.set(name, timesUsed + 1);

    return timesUsed === 0 ? name : `${name}$${timesUsed}`;
  }

  genFreshId(): string {
    return `GEN__${this.nextId++}`;
  }
}

function* reversed<T>(xs: T[]): Generator<T> {
  for (let i = xs.length - 1; i >= 0; i--) {
    yield xs[i]!;
  }
}
