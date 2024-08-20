import {
  TypedDeclaration,
  TypedExpr,
  TypedMatchPattern,
  TypedModule,
  TypedTypeDeclaration,
  TypedTypeVariant,
} from "../typecheck";
import { ConcreteType, TVar, Type, resolveType } from "../typecheck/type";
import * as t from "@babel/types";
import generate from "@babel/generator";
import { Binding, ConstLiteral } from "../parser";
import { BinaryExpression } from "@babel/types";
import { optimizeModule } from "./optimize";
import { exit } from "node:process";
import { col } from "../utils/colors";
import { sanitizeNamespace } from "./utils";
import { deriveEqAdt, deriveEqStruct, deriveShowAdt } from "./derive";

export type CompileOptions = {
  allowDeriving?: string[] | undefined;
};

export function compile(
  ns: string,
  ast: TypedModule,
  options: CompileOptions = {},
): string {
  return new Compiler(ns, options).compile(ast);
}

const EQ_IDENTIFIER: t.Identifier = { type: "Identifier", name: "_eq" };
const TAG_FIELD: t.Identifier = { type: "Identifier", name: "$" };

class Compiler {
  private statementsBuf: t.Statement[] = [];
  private frames: Frame[] = [];
  private bindingsJsName = new WeakMap<Binding, t.Expression>();

  private nextId = 0;
  genFreshId(): string {
    return `GEN__${this.nextId++}`;
  }

  constructor(
    private ns: string,
    private options: CompileOptions,
  ) {}

  private getCurrentFrame(): Frame {
    const frame = this.frames.at(-1);
    if (frame === undefined) {
      throw new Error("empty frames stack");
    }
    return frame;
  }

  private precomputeValue(
    expr: TypedExpr,
    makeIdent = () => this.makeFreshIdent(),
  ): t.Identifier {
    const jsExpr = this.compileExpr(expr);
    if (jsExpr.type === "Identifier") {
      return jsExpr;
    }

    const freshIdent = makeIdent();
    this.statementsBuf.push({
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: freshIdent,
          init: jsExpr,
        },
      ],
    });
    return freshIdent;
  }

  private makeFreshIdent(): t.Identifier {
    const name = this.makeJsLetPathName(this.genFreshId());
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
          if (src.caller.name === "==" && isPrimitiveEq(src.args)) {
            return {
              type: "BinaryExpression",
              operator: "===",
              left: this.compileExpr(src.args[0]!),
              right: this.compileExpr(src.args[1]!),
            };
          }

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

          case "local-variable": {
            const res = this.bindingsJsName.get(src.resolution.binding);
            if (res === undefined) {
              throw new Error(
                "[unreachable] undefined resolution for: " +
                  src.resolution.binding.name,
              );
            }
            return res;
          }

          case "global-variable": {
            let ident: t.Identifier;
            if (src.resolution.declaration.binding.name === "==") {
              ident = EQ_IDENTIFIER;
            } else {
              ident = makeGlobalIdentifier(
                src.resolution.namespace,
                src.resolution.declaration.binding.name,
              );
            }

            // TODO what about let exprs?
            const traitArgs = resolvePassedDicts(
              src.resolution.declaration.binding.$,
              src.$,
            );

            if (traitArgs.length === 0) {
              return ident;
            }

            return {
              type: "CallExpression",
              callee: ident,
              arguments: traitArgs,
            };
          }
        }
      }

      case "let": {
        let jsPatternName: string;
        if (src.pattern.type === "identifier") {
          jsPatternName = this.getCurrentFrame().registerLocal(
            src.pattern.name,
          );
        } else {
          jsPatternName = this.genFreshId();
        }
        this.frames.push(
          new Frame({
            type: "let",
            jsPatternName,
          }),
        );

        const freshIdent: t.Identifier = {
          type: "Identifier",
          name: this.makeJsLetPathName(),
        };
        if (src.pattern.type === "identifier") {
          this.bindingsJsName.set(src.pattern, freshIdent);
        }
        const value = this.compileExpr(src.value);
        this.statementsBuf.push({
          type: "VariableDeclaration",
          kind: "const",
          declarations: [
            {
              type: "VariableDeclarator",
              id: freshIdent,
              init: value,
            },
          ],
        });
        this.compileCheckPatternConditions(src.pattern, freshIdent);

        this.frames.pop();

        return this.compileExpr(src.body);

        // we could call this.bindingsJsName.delete(src.pattern) here
      }

      case "fn": {
        const frame = new Frame({ type: "fn" });
        this.frames.push(frame);
        const [{ params, body }, stms] = this.wrapStatements(() => {
          const params = src.params.map((param): t.Identifier => {
            if (param.type === "identifier") {
              const name = this.getCurrentFrame().registerLocal(param.name);
              const ident: t.Identifier = {
                type: "Identifier",
                name,
              };
              this.bindingsJsName.set(param, ident);
              return ident;
            }

            const freshId = this.genFreshId();
            const ident: t.Identifier = {
              type: "Identifier",
              name: freshId,
            };

            this.compileCheckPatternConditions(param, ident);

            return ident;
          });
          const body = this.compileExpr(src.body);
          return { params, body };
        });
        this.frames.pop();

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
        const matchedExpr = this.precomputeValue(src.expr);

        const checks: [
          condition: t.Expression,
          ret: t.Expression,
          statements: t.Statement[],
        ][] = [];
        for (const [pattern, retExpr] of src.clauses) {
          const exprs = this.compileCheckPatternConditions(
            pattern,
            matchedExpr,
          );
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
          checks.push([
            ifCondition,
            ...this.wrapStatements(() => this.compileExpr(retExpr)),
          ]);
        }

        const retValueIdentifier = this.makeFreshIdent();
        this.statementsBuf.push({
          type: "VariableDeclaration",
          kind: "let",
          declarations: [
            {
              type: "VariableDeclarator",
              id: retValueIdentifier,
            },
          ],
        });
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

          const [condition, ret, stms] = checks[index]!;
          return {
            type: "IfStatement",
            test: condition,
            consequent: {
              type: "BlockStatement",
              directives: [],
              body: [
                ...stms,
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

      case "struct-literal": {
        const resolution = src.struct.resolution;
        if (resolution === undefined) {
          throw new Error(
            "[unreachable] undefined resolution for struct declaration",
          );
        }

        const properties: t.ObjectProperty[] = [];

        let spreadIdentifier: t.Identifier | undefined;
        for (const declarationField of resolution.declaration.fields) {
          const structLitField = src.fields.find(
            (f) => f.field.name === declarationField.name,
          );

          if (structLitField !== undefined) {
            properties.push({
              type: "ObjectProperty",
              key: { type: "Identifier", name: structLitField.field.name },
              value: this.compileExpr(structLitField.value),
              shorthand: true,
              computed: false,
            });
          } else if (src.spread === undefined) {
            throw new Error("[unreachable] missing fields");
          } else {
            if (spreadIdentifier === undefined) {
              spreadIdentifier = this.precomputeValue(src.spread);
            }

            properties.push({
              type: "ObjectProperty",
              key: { type: "Identifier", name: declarationField.name },
              value: {
                type: "MemberExpression",
                object: spreadIdentifier,
                property: { type: "Identifier", name: declarationField.name },
                computed: false,
              },
              shorthand: true,
              computed: false,
            });
          }
        }

        return { type: "ObjectExpression", properties };
      }

      case "field-access":
        return {
          type: "MemberExpression",
          object: this.compileExpr(src.struct),
          property: { type: "Identifier", name: src.field.name },
          computed: false,
        };
    }
  }

  /**
   * compile a pattern to a list of conditions used to test if `matchedExpr` matches the pattern
   * */
  private compileCheckPatternConditions(
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
            this.compileCheckPatternConditions(arg, {
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
    if (buf.length === 0) {
      throw new Error("[unreachable] empty stack");
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

    let out = this.compileExpr(decl.value);
    this.frames.pop();

    const dictParams = findDeclarationDictsParams(decl.binding.$.asType());
    if (dictParams.length !== 0) {
      out = {
        type: "ArrowFunctionExpression",
        async: false,
        params: dictParams,
        body: out,
        expression: true,
      };
    }

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
    const buf = decl.variants.map(
      (d, index): t.Statement => this.compileVariant(d, index),
    );

    if (
      // Bool equality is implemented inside core
      decl.name !== "Bool" &&
      this.shouldDeriveTrait("Eq", decl)
    ) {
      buf.push({
        type: "VariableDeclaration",
        kind: "const",
        declarations: [
          {
            type: "VariableDeclarator",
            id: {
              type: "Identifier",
              name: `Eq_${sanitizeNamespace(this.ns)}$${decl.name}`,
            },
            init: deriveEqAdt(decl),
          },
        ],
      });
    }

    if (
      // Bool and List show are implemented inside core
      decl.name !== "Bool" &&
      decl.name !== "List" &&
      this.shouldDeriveTrait("Show", decl)
    ) {
      buf.push({
        type: "VariableDeclaration",
        kind: "const",
        declarations: [
          {
            type: "VariableDeclarator",
            id: {
              type: "Identifier",
              name: `Show_${sanitizeNamespace(this.ns)}$${decl.name}`,
            },
            init: deriveShowAdt(decl),
          },
        ],
      });
    }

    return buf;
  }

  private compileStruct(
    decl: TypedTypeDeclaration & { type: "struct" },
  ): t.Statement[] {
    const buf: t.Statement[] = [];
    if (this.shouldDeriveTrait("Eq", decl)) {
      buf.push({
        type: "VariableDeclaration",
        kind: "const",
        declarations: [
          {
            type: "VariableDeclarator",
            id: {
              type: "Identifier",
              name: `Eq_${sanitizeNamespace(this.ns)}$${decl.name}`,
            },
            init: deriveEqStruct(decl),
          },
        ],
      });
    }
    return buf;
  }

  compile(src: TypedModule): string {
    const body: t.Statement[] = [];

    for (const decl of src.typeDeclarations) {
      switch (decl.type) {
        case "extern":
          break;
        case "adt":
          body.push(...this.compileAdt(decl));
          break;
        case "struct":
          body.push(...this.compileStruct(decl));
          break;
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

  private shouldDeriveTrait(
    trait: string,
    typedDeclaration: TypedTypeDeclaration,
  ): boolean {
    if (
      this.options.allowDeriving !== undefined &&
      !this.options.allowDeriving.includes(trait)
    ) {
      return false;
    }

    const deps = TVar.typeImplementsTrait(
      {
        type: "named",
        name: typedDeclaration.name,
        moduleName: this.ns,
        args: typedDeclaration.params.map(() => TVar.fresh().asType()),
      },
      trait,
    );

    return deps !== undefined;
  }
}

function compileConst(ast: ConstLiteral): t.Expression {
  switch (ast.type) {
    case "int":
    case "float":
      return { type: "NumericLiteral", value: ast.value };

    case "string":
    case "char":
      return {
        type: "TemplateLiteral",
        expressions: [],
        quasis: [
          {
            type: "TemplateElement",
            value: { raw: ast.value, cooked: ast.value },
            tail: true,
          },
        ],
      };
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
    case "+.":
    case "++":
      return "+";

    case "*":
    case "*.":
      return "*";

    case "-":
    case "-.":
      return "-";

    case "/":
    case "/.":
      return "/";

    case "<=":
    case "<":
    case ">=":
    case ">":
      return kestrelCaller;

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

  registerLocal(name: string): string {
    const timesUsed = this.usedVars.get(name) ?? 0;
    this.usedVars.set(name, timesUsed + 1);

    return timesUsed === 0 ? name : `${name}$${timesUsed}`;
  }
}

function findDeclarationDictsParams(type: Type): t.Identifier[] {
  const buf: string[] = [];

  function helper(type: Type) {
    switch (type.type) {
      case "fn":
        for (const arg of type.args) {
          helper(arg);
        }
        helper(type.return);
        return;

      case "named": {
        for (const arg of type.args) {
          helper(arg);
        }
        return;
      }

      case "var": {
        const resolved = type.var.resolve();
        switch (resolved.type) {
          case "bound":
            helper(resolved.value);
            return;
          case "unbound":
            for (const trait of resolved.traits) {
              const name = `${trait}_${resolved.id}`;
              if (!buf.includes(name)) {
                buf.push(name);
              }
            }
            return;
        }
      }
    }
  }

  helper(type);

  return buf.map((name) => ({ type: "Identifier", name }));
}

function traitDepsForNamedType(
  t: Type & { type: "named" },
  trait: string,
): Type[] {
  const freshArgs = t.args.map((_) => TVar.fresh());

  // TODO simplify this workaround
  const genericType: Type = {
    type: "named",
    moduleName: t.moduleName,
    name: t.name,
    args: freshArgs.map((a) => a.asType()),
  };

  const deps = TVar.typeImplementsTrait(genericType, trait);
  if (deps === undefined) {
    throw new Error("[unreachable] type does not implement given trait");
  }

  const out: Type[] = [];

  for (const dep of deps) {
    const index = freshArgs.findIndex((v) => {
      const r = v.resolve();
      return r.type === "unbound" && r.id === dep.id;
    });

    const a = t.args[index]!;
    out.push(a);
  }

  return out;
}

function applyTraitToType(type: Type, trait: string): string {
  const resolved = resolveType(type);

  switch (resolved.type) {
    case "fn":
      throw new Error("TODO bound fn");

    case "named": {
      let name = `${trait}_${sanitizeNamespace(resolved.moduleName)}$${resolved.name}`;
      const deps = traitDepsForNamedType(resolved, trait).map((dep) =>
        applyTraitToType(dep, trait),
      );

      if (deps.length !== 0) {
        name += `(${deps.join(", ")})`;
      }

      return name;
    }

    case "unbound": {
      if (!resolved.traits.includes(trait)) {
        throw new Error(
          "TODO unbound does not impl needed trait: " +
            JSON.stringify(resolved),
        );
      }

      return `${trait}_${resolved.id}`;
    }
  }
}

function resolvePassedDicts(
  genExpr: TVar,
  instantiatedExpr: TVar,
): t.Identifier[] {
  const buf: t.Identifier[] = [];

  // e.g. { 0 => Set("Show", "Debug") }
  const alreadyVisitedVarsIds: Map<number, Set<string>> = new Map();

  function checkedPush(genExprId: number, trait: string, name: string) {
    let lookup = alreadyVisitedVarsIds.get(genExprId);
    if (lookup === undefined) {
      lookup = new Set();
      alreadyVisitedVarsIds.set(genExprId, lookup);
    }

    if (lookup.has(trait)) {
      // Do not add again
      return;
    }

    lookup.add(trait);
    buf.push({ type: "Identifier", name });
  }

  function helper(genExpr: Type, instantiatedExpr: Type) {
    switch (genExpr.type) {
      case "fn": {
        const resolved = resolveType(instantiatedExpr);

        if (resolved.type !== "fn") {
          throw new Error(
            "[unreachable] unexpected value of kind: " + resolved.type,
          );
        }

        const instantiatedFn = resolved;

        for (let i = 0; i < genExpr.args.length; i++) {
          const genArg = genExpr.args[i]!,
            instArg = instantiatedFn.args[i]!;

          helper(genArg, instArg);
        }

        helper(genExpr.return, instantiatedFn.return);
        return;
      }

      case "named": {
        const resolved = resolveType(instantiatedExpr);
        if (resolved.type !== "named") {
          throw new Error(
            "[unreachable] unexpected value of kind: " + resolved.type,
          );
        }

        const instantiatedConcreteType = resolved;

        for (let i = 0; i < genExpr.args.length; i++) {
          const genArg = genExpr.args[i]!,
            instArg = instantiatedConcreteType.args[i]!;

          helper(genArg, instArg);
        }
        return;
      }

      case "var": {
        const resolvedGenExpr = genExpr.var.resolve();
        switch (resolvedGenExpr.type) {
          case "bound":
            return helper(resolvedGenExpr.value, instantiatedExpr);

          case "unbound": {
            for (const trait of resolvedGenExpr.traits) {
              checkedPush(
                resolvedGenExpr.id,
                trait,
                applyTraitToType(instantiatedExpr, trait),
              );
            }

            return;
          }
        }
      }
    }
  }

  helper(genExpr.asType(), instantiatedExpr.asType());
  return buf;
}

function* reversed<T>(xs: T[]): Generator<T> {
  for (let i = xs.length - 1; i >= 0; i--) {
    yield xs[i]!;
  }
}

// Project compilation

export const defaultEntryPoint: NonNullable<
  CompileProjectOptions["entrypoint"]
> = {
  module: "Main",
  type: {
    type: "named",
    moduleName: "Task",
    name: "Task",
    args: [{ type: "named", name: "Unit", moduleName: "Tuple", args: [] }],
  },
};

export type CompileProjectOptions = {
  externs?: Record<string, string>;
  optimize?: boolean;
  entrypoint?: {
    module: string;
    type: ConcreteType;
  };
};

export function compileProject(
  typedProject: Record<string, TypedModule>,
  {
    entrypoint = defaultEntryPoint,
    externs = {},
    optimize = false,
  }: CompileProjectOptions = {},
): string {
  const entry = typedProject[entrypoint.module];
  if (entry === undefined) {
    throw new Error(`Entrypoint not found: '${entrypoint.module}'`);
  }

  const mainDecl = entry.declarations.find(
    (d) => d.binding.name === "main" && d.pub,
  );
  if (mainDecl === undefined) {
    throw new Error("Entrypoint needs a value called `main`.");
  }

  const visited = new Set<string>();

  const buf: string[] = [];

  function visit(ns: string) {
    if (visited.has(ns)) {
      return;
    }

    visited.add(ns);
    const module = typedProject[ns];
    if (module === undefined) {
      console.error(col.red.tag`Error:`, `Could not find module '${ns}'`);
      exit(1);
    }

    for (const import_ of module.imports) {
      visit(import_.ns);
    }

    const extern = externs[ns];
    if (extern !== undefined) {
      buf.push(extern);
    }

    const out = compile(ns, optimize ? optimizeModule(module) : module);

    buf.push(out);
  }

  visit(entrypoint.module);

  const entryPointMod = sanitizeNamespace(entrypoint.module);
  buf.push(`${entryPointMod}$main.exec();\n`);

  return buf.join("\n\n");
}

function isPrimitiveEq(args: TypedExpr[]): boolean {
  const resolvedType = args[0]!.$.resolve();

  if (resolvedType.type === "unbound" || resolvedType.value.type === "fn") {
    return false;
  }

  if (
    resolvedType.value.name === "Int" &&
    resolvedType.value.moduleName === "Int"
  ) {
    return true;
  }

  if (
    resolvedType.value.name === "Float" &&
    resolvedType.value.moduleName === "Float"
  ) {
    return true;
  }

  if (
    resolvedType.value.name === "String" &&
    resolvedType.value.moduleName === "String"
  ) {
    return true;
  }

  if (
    resolvedType.value.name === "Char" &&
    resolvedType.value.moduleName === "Char"
  ) {
    return true;
  }

  return false;
}
