import {
  TypedDeclaration,
  TypedExpr,
  TypedMatchPattern,
  TypedModule,
  TypedTypeDeclaration,
  TypedTypeVariant,
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

const TAG_FIELD: t.Identifier = { type: "Identifier", name: "$" };

class Compiler {
  private statementsBuf: t.Statement[] = [];
  private frames: Frame[] = [];
  private bindingsJsName = new WeakMap<Binding, t.Expression>();

  constructor(private ns: string) {}

  private getCurrentFrame(): Frame {
    const frame = this.frames.at(-1);
    if (frame === undefined) {
      throw new Error("empty frames stack");
    }
    return frame;
  }

  private makeFreshIdent(): t.Identifier {
    const curFrame = this.getCurrentFrame();
    const name = this.makeJsLetPathName(curFrame.genFreshId());
    return { type: "Identifier", name };
  }

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

          const infixLogicalName = toJsInfixLogical(src.caller.name);
          if (infixLogicalName !== undefined) {
            return {
              type: "LogicalExpression",
              operator: infixLogicalName,
              left: this.compileExpr(src.args[0]!),
              right: this.compileExpr(src.args[1]!),
            };
          }

          const prefixName = toJsPrefix(src.caller.name);
          if (prefixName !== undefined) {
            return {
              type: "UnaryExpression",
              operator: prefixName,
              argument: this.compileExpr(src.args[0]!),
              prefix: true,
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
            if (
              src.resolution.declaration.name === "Bool" &&
              src.resolution.namespace === "Bool"
            ) {
              switch (src.resolution.variant.name) {
                case "True":
                  return { type: "BooleanLiteral", value: true };
                case "False":
                  return { type: "BooleanLiteral", value: false };

                default:
                  throw new Error("[unreachable] invalid boolean constructor");
              }
            }
            return makeGlobalIdentifier(
              src.resolution.namespace,
              src.resolution.variant.name,
            );

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
        const curFrame = this.getCurrentFrame();
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
            (param): t.Identifier => this.compilePattern(param),
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
        const ident = this.makeFreshIdent();

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
        return src.values.reduceRight<t.Expression>(
          (prev, src): t.Expression => {
            const compiledExpr = this.compileExpr(src);
            return {
              type: "CallExpression",
              callee: { type: "Identifier", name: "List$Cons" },
              arguments: [compiledExpr, prev],
            };
          },
          { type: "Identifier", name: "List$Nil" },
        );

      case "match": {
        // TODO no need for gen when matched is ident
        // TODO same for if expr
        const matchedExpr = this.makeFreshIdent();

        const e = this.compileExpr(src.expr);

        const checks: [condition: t.Expression, ret: t.Expression][] = [];
        for (const [pattern, retExpr] of src.clauses) {
          const exprs = this.compilePattern_(pattern, matchedExpr);
          const ifCondition: t.Expression =
            // TODO if if(true) is encountered, we could just return retExpr
            exprs.length === 0
              ? { type: "BooleanLiteral", value: true }
              : exprs.reduce((left, right) => ({
                  type: "LogicalExpression",
                  operator: "&&",
                  left,
                  right,
                }));

          // TODO wrap statements
          checks.push([ifCondition, this.compileExpr(retExpr)]);
        }

        const retValueIdentifier = this.makeFreshIdent();
        this.statementsBuf.push(
          {
            type: "VariableDeclaration",
            kind: "const",
            declarations: [
              {
                type: "VariableDeclarator",
                id: matchedExpr,
                init: e,
              },
            ],
          },
          {
            type: "VariableDeclaration",
            kind: "let",
            declarations: [
              {
                type: "VariableDeclarator",
                id: retValueIdentifier,
              },
            ],
          },
        );
        const helper = (index: number): t.Statement => {
          if (index >= checks.length) {
            return {
              type: "BlockStatement",
              directives: [],
              body: [
                {
                  type: "ThrowStatement",
                  argument: {
                    type: "NewExpression",
                    callee: { type: "Identifier", name: "Error" },
                    arguments: [
                      {
                        type: "StringLiteral",
                        value: "[non exhaustive match]",
                      },
                    ],
                  },
                },
              ],
            };
          }

          const [condition, ret] = checks[index]!;
          return {
            type: "IfStatement",
            test: condition,
            consequent: {
              type: "BlockStatement",
              directives: [],
              body: [
                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "AssignmentExpression",
                    operator: "=",
                    left: retValueIdentifier,
                    right: ret,
                  },
                },
              ],
            },
            alternate: helper(index + 1),
          };
        };

        this.statementsBuf.push(helper(0));

        return retValueIdentifier;
      }

      case "struct-literal":
      case "field-access":
        throw new Error("TODO handle expr: " + src.type);
    }
  }

  /**
   * compile a pattern to a list of conditions used to test if `matchedExpr` matches the pattern
   * */
  private compilePattern_(
    pattern: TypedMatchPattern,
    matchedExpr: t.Expression,
  ): t.Expression[] {
    switch (pattern.type) {
      case "identifier": {
        if (pattern.name === "_") {
          return [];
        }
        // const name = frame.registerLocal(pattern.name);
        // const identifier: t.Identifier = { type: "Identifier", name };
        this.bindingsJsName.set(pattern, matchedExpr);
        return [];
      }

      case "constructor": {
        if (
          pattern.resolution === undefined ||
          pattern.resolution.type !== "constructor"
        ) {
          throw new Error("[unreachable] invalid pattern resolution");
        }

        if (
          pattern.resolution.namespace === "Bool" &&
          pattern.resolution.declaration.name === "Bool"
        ) {
          return [
            pattern.resolution.variant.name === "True"
              ? matchedExpr
              : {
                  type: "UnaryExpression",
                  prefix: false,
                  operator: "!",
                  argument: matchedExpr,
                },
          ];
        }

        const variantName = pattern.resolution.variant.name;
        const index = pattern.resolution.declaration.variants.findIndex(
          (variant) => variant.name === variantName,
        );
        if (index === -1) {
          throw new Error("[unreachable] variant not found in declaration");
        }

        return [
          {
            type: "BinaryExpression",
            operator: "===",
            left: {
              type: "MemberExpression",
              object: matchedExpr,
              property: TAG_FIELD,
              computed: false,
            },
            right: { type: "NumericLiteral", value: index },
          },
          ...pattern.args.flatMap((arg, index) =>
            this.compilePattern_(arg, {
              type: "MemberExpression",
              object: matchedExpr,
              property: { type: "Identifier", name: `_${index}` },
              computed: false,
            }),
          ),
        ];
      }

      case "lit":
        switch (pattern.literal.type) {
          // As of now, literals are always checked via the === operator
          // keep the switch to enforce match on future variants
          case "string":
          case "int":
          case "float":
          case "char":
            return [
              {
                type: "BinaryExpression",
                operator: "===",
                left: matchedExpr,
                right: compileConst(pattern.literal),
              },
            ];
        }
    }
  }

  private compilePattern(pattern: TypedMatchPattern): t.Identifier {
    const frame = this.getCurrentFrame();

    switch (pattern.type) {
      case "identifier": {
        const name = frame.registerLocal(pattern.name);
        const identifier: t.Identifier = { type: "Identifier", name };
        this.bindingsJsName.set(pattern, identifier);
        return identifier;
      }

      case "constructor":
      case "lit":
        throw new Error("TODO match lit");
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

  private compileVariant(
    variant: TypedTypeVariant,
    index: number,
  ): t.Statement {
    return {
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: makeGlobalIdentifier(this.ns, variant.name),
          init: makeVariantBody(index, variant.args.length),
        },
      ],
    };
  }

  private compileAdt(
    decl: TypedTypeDeclaration & { type: "adt" },
  ): t.Statement[] {
    return decl.variants.map((d, index) => this.compileVariant(d, index));
  }

  compile(src: TypedModule): string {
    const body: t.Statement[] = [];

    for (const decl of src.typeDeclarations) {
      if (decl.type === "adt") {
        body.push(...this.compileAdt(decl));
      }
    }

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

function toJsPrefix(
  kestrelCaller: string,
): t.UnaryExpression["operator"] | undefined {
  switch (kestrelCaller) {
    case "!":
      return kestrelCaller;

    default:
      return undefined;
  }
}

function toJsInfix(
  kestrelCaller: string,
): BinaryExpression["operator"] | undefined {
  switch (kestrelCaller) {
    case "+":
    case "*":
      return kestrelCaller;

    case "++":
      return "+";

    case "==":
      return "===";

    default:
      return undefined;
  }
}

function toJsInfixLogical(
  kestrelCaller: string,
): t.LogicalExpression["operator"] | undefined {
  switch (kestrelCaller) {
    case "&&":
    case "||":
      return kestrelCaller;

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

function makeVariantBody(index: number, argsNumber: number): t.Expression {
  const params = Array.from(
    { length: argsNumber },
    (_, i): t.Identifier => ({
      type: "Identifier",
      name: `_${i}`,
    }),
  );

  const ret: t.Expression = {
    type: "ObjectExpression",
    properties: [
      {
        type: "ObjectProperty",
        key: TAG_FIELD,
        value: { type: "NumericLiteral", value: index },
        computed: false,
        shorthand: false,
      },
      ...params.map(
        (p): t.ObjectProperty => ({
          type: "ObjectProperty",
          key: p,
          value: p,
          computed: false,
          shorthand: true,
        }),
      ),
    ],
  };

  if (argsNumber === 0) {
    return ret;
  }

  return {
    type: "ArrowFunctionExpression",
    params,
    async: false,
    expression: true,
    body: ret,
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
