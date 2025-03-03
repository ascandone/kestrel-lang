import * as coreTypes from "../analysis/coreTypes";
import { Type } from "../type";
import * as t from "@babel/types";
import generate from "@babel/generator";
import {
  Binding,
  ConstLiteral,
  UntypedDeclaration,
  UntypedExpr,
  UntypedMatchPattern,
  UntypedModule,
  UntypedTypeDeclaration,
  UntypedTypeVariant,
} from "../parser";
import { BinaryExpression } from "@babel/types";
import { exit } from "node:process";
import { col } from "../utils/colors";
import {
  AdtReprType,
  TAG_FIELD,
  getAdtReprType_REWRITE,
  joinAndExprs,
  sanitizeNamespace,
} from "./utils";
import {
  deriveEqAdt,
  deriveEqStruct,
  deriveShowAdt,
  deriveShowStruct,
} from "./derive-rewrite";
import { Analysis, IDocument } from "../analysis";
import { NamespaceResolution } from "../analysis/resolution";
import { TraitRegistry } from "../type/traitsRegistry";

export type CompileOptions = {
  allowDeriving?: string[] | undefined;
};

export function compile<Doc extends IDocument>(
  analysis: Analysis<Doc>,
  options: CompileOptions = {
    allowDeriving: ["Eq", "Show"],
  },
): string {
  return new Compiler(analysis, options).compile(analysis.module);
}

const EQ_IDENTIFIER: t.Identifier = { type: "Identifier", name: "_eq" };

type CompilationMode =
  | {
      type: "assign_var";
      ident: t.Identifier;
      declare: boolean;
      dictParams: t.Identifier[];
    }
  | { type: "return" };

class Compiler<Doc extends IDocument> {
  private statementsBuf: t.Statement[] = [];
  private frames: Frame[] = [];
  private bindingsJsName = new WeakMap<Binding, t.Expression>();

  private tailCallIdent: t.Identifier | undefined;

  private isTailCall(
    src: UntypedExpr & { type: "application" },
    tailPosBinding: Binding<unknown> | undefined,
  ): boolean {
    if (tailPosBinding === undefined) {
      return false;
    }

    if (src.caller.type !== "identifier") {
      return false;
    }

    const resolution = this.analysis.resolution.resolveIdentifier(src.caller);

    if (resolution === undefined) {
      // This should be unreachable
      return false;
    }

    switch (resolution.type) {
      case "local-variable":
        return resolution.binding === tailPosBinding;
      case "global-variable":
        return resolution.declaration.binding === tailPosBinding;
      case "constructor":
        return false;
    }
  }

  private nextId = 0;
  genFreshId(): string {
    return `GEN__${this.nextId++}`;
  }

  constructor(
    private readonly analysis: Analysis<Doc>,
    private readonly options: CompileOptions,
  ) {}

  private getCurrentFrame(): Frame {
    const frame = this.frames.at(-1);
    if (frame === undefined) {
      throw new Error("empty frames stack");
    }
    return frame;
  }

  private precomputeValue(
    expr: UntypedExpr,
    makeIdent = () => this.makeFreshIdent(),
  ): t.Identifier {
    const jsExpr = this.compileExprAsJsExpr(expr, undefined);
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

  private compileExprAsJsStms(
    src: UntypedExpr,
    tailPosCaller: Binding<unknown> | undefined,
    as: CompilationMode,
  ): void {
    switch (src.type) {
      case "syntax-err":
        throw new Error("[unreachable]");

      case "block":
        return this.compileExprAsJsStms(src.inner, tailPosCaller, as);

      case "if": {
        if (as.type === "assign_var" && as.declare) {
          this.statementsBuf.push({
            type: "VariableDeclaration",
            kind: "let",
            declarations: [{ type: "VariableDeclarator", id: as.ident }],
          });
        }

        const test = this.compileExprAsJsExpr(src.condition, undefined);
        const [, thenBranchStmts] = this.wrapStatements(() =>
          this.compileExprAsJsStms(src.then, tailPosCaller, doNotDeclare(as)),
        );

        const [, elseBranchStmts] = this.wrapStatements(() =>
          this.compileExprAsJsStms(src.else, tailPosCaller, doNotDeclare(as)),
        );

        this.statementsBuf.push({
          type: "IfStatement",
          test: test,
          consequent: {
            type: "BlockStatement",
            directives: [],
            body: thenBranchStmts,
          },
          alternate: {
            type: "BlockStatement",
            directives: [],
            body: elseBranchStmts,
          },
        });

        return;
      }

      case "match": {
        if (as.type === "assign_var" && as.declare) {
          this.statementsBuf.push({
            type: "VariableDeclaration",
            kind: "let",
            declarations: [{ type: "VariableDeclarator", id: as.ident }],
          });
        }

        const matchedExpr = this.precomputeValue(src.expr);

        const checks: [
          condition: t.Expression | undefined,
          statements: t.Statement[],
        ][] = [];

        for (const [pattern, retExpr] of src.clauses) {
          const exprs = this.compileCheckPatternConditions(
            pattern,
            matchedExpr,
          );

          const [, stms] = this.wrapStatements(() => {
            this.compileExprAsJsStms(retExpr, tailPosCaller, doNotDeclare(as));
          });

          if (exprs.length === 0) {
            checks.push([undefined, stms]);
            break;
          }

          checks.push([joinAndExprs(exprs), stms]);
        }

        const helper = (index: number): t.Statement[] => {
          if (index >= checks.length) {
            return [
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
            ];
          }

          const [condition, stms] = checks[index]!;
          if (condition === undefined) {
            return stms;
          }

          const next = helper(index + 1);
          const isIfElse = next.length === 1 && next[0]!.type === "IfStatement";
          return [
            {
              type: "IfStatement",
              test: condition,
              consequent: {
                type: "BlockStatement",
                directives: [],
                body: stms,
              },
              alternate: isIfElse
                ? next[0]!
                : {
                    type: "BlockStatement",
                    directives: [],
                    body: next,
                  },
            },
          ];
        };

        this.statementsBuf.push(...helper(0));
        return;
      }

      case "application":
        if (this.isTailCall(src, tailPosCaller)) {
          const tailCallIdent = this.makeFreshIdent();
          this.tailCallIdent = tailCallIdent;

          for (let i = 0; i < src.args.length; i++) {
            const expr = this.compileExprAsJsExpr(src.args[i]!, tailPosCaller);
            this.statementsBuf.push({
              type: "ExpressionStatement",
              expression: {
                type: "AssignmentExpression",
                operator: "=",
                left: { type: "Identifier", name: `GEN_TC__${i}` },
                right: expr,
              },
            });
          }
          return;
        }
      // Attention: fallthrough to the next branch for application

      case "pipe": // TODO handle tailcall with pipe
      case "let#": // TODO handle tailcall with let# (the bind operator might be tc)
      case "constant":
      case "list-literal":
      case "struct-literal":
      case "identifier":
      case "fn":
      case "field-access":
      case "let":
      default: {
        const expr = this.compileExprAsJsExpr(src, tailPosCaller);
        switch (as.type) {
          case "assign_var":
            if (as.declare) {
              const exprsWithDictParams: t.Expression =
                as.dictParams.length === 0
                  ? expr
                  : {
                      type: "ArrowFunctionExpression",
                      async: false,
                      params: as.dictParams,
                      body: expr,
                      expression: true,
                    };

              this.statementsBuf.push({
                type: "VariableDeclaration",
                kind: "const",
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: as.ident,
                    init: exprsWithDictParams,
                  },
                ],
              });
            } else {
              this.statementsBuf.push({
                type: "ExpressionStatement",
                expression: {
                  type: "AssignmentExpression",
                  operator: "=",
                  left: as.ident,
                  right: expr,
                },
              });
            }
            break;

          case "return":
            this.statementsBuf.push({
              type: "ReturnStatement",
              argument: expr,
            });
            break;
        }
      }
    }
  }

  private compileFnAsExpr(
    fnParams: UntypedMatchPattern[],
    body: UntypedExpr,
  ): t.Expression {
    const callerBinding = (() => {
      const curFrame = this.getCurrentFrame();
      if (curFrame.data.type !== "let") {
        return undefined;
      }
      return curFrame.data.binding;
    })();

    const wasTailCall = this.tailCallIdent;
    this.tailCallIdent = undefined;

    this.frames.push(new Frame({ type: "fn" }));
    const cleanup = () => {
      this.frames.pop();
      this.tailCallIdent = wasTailCall;
    };

    const [{ params }, stms] = this.wrapStatements(() => {
      const params = fnParams.map((param): t.Identifier => {
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
      this.compileExprAsJsStms(body, callerBinding, {
        type: "return",
      });
      return { params };
    });

    const bodyStms: t.Expression | t.BlockStatement = (() => {
      if (this.tailCallIdent !== undefined) {
        return {
          type: "BlockStatement",
          directives: [],
          body: [
            {
              type: "WhileStatement",
              test: { type: "BooleanLiteral", value: true },
              body: {
                type: "BlockStatement",
                directives: [],
                body: [
                  ...params.map(
                    (id, index): t.Statement => ({
                      type: "VariableDeclaration",
                      kind: "const",
                      declarations: [
                        {
                          type: "VariableDeclarator",
                          id,
                          init: {
                            type: "Identifier",
                            name: `GEN_TC__${index}`,
                          },
                        },
                      ],
                    }),
                  ),
                  ...stms,
                ],
              },
            },
          ],
        };
      }

      if (stms.length === 1 && stms[0]!.type === "ReturnStatement") {
        return stms[0].argument!;
      }

      return {
        type: "BlockStatement",
        directives: [],
        body: stms,
      };
    })();

    const params_ =
      this.tailCallIdent === undefined
        ? params
        : params.map(
            (_, i): t.Identifier => ({
              type: "Identifier",
              name: `GEN_TC__${i}`,
            }),
          );

    cleanup();
    return {
      type: "ArrowFunctionExpression",
      async: false,
      expression: true,
      params: params_,
      body: bodyStms,
    };
  }

  private compileApplicationAsExpr(
    caller: UntypedExpr,
    evaluatedArgs: t.Expression[],
  ): t.Expression {
    return {
      type: "CallExpression",
      callee: this.compileExprAsJsExpr(caller, undefined),
      arguments: evaluatedArgs,
    };
  }

  private compileExprAsJsExpr(
    src: UntypedExpr,
    tailPosCaller: Binding<unknown> | undefined,
  ): t.Expression {
    switch (src.type) {
      case "syntax-err":
        throw new Error("[unreachable]");

      case "let#":
        return this.compileApplicationAsExpr(src.mapper, [
          this.compileExprAsJsExpr(src.value, undefined),
          this.compileFnAsExpr([src.pattern], src.body),
        ]);

      case "pipe":
        // static checks guarantee right side is a function call
        // TODO we might want to enforce this in the AST
        if (src.right.type !== "application") {
          throw new Error("[unreachable] invalid pipe");
        }

        return this.compileApplicationAsExpr(src.right.caller, [
          this.compileExprAsJsExpr(src.left, undefined),
          ...src.right.args.map((arg) =>
            this.compileExprAsJsExpr(arg, undefined),
          ),
        ]);

      case "block":
        return this.compileExprAsJsExpr(src.inner, tailPosCaller);

      case "constant":
        return compileConst(src.value);

      // The following branches rely on statement mode compilation
      case "match":
      case "if": {
        const ident = this.makeFreshIdent();
        this.compileExprAsJsStms(src, undefined, {
          type: "assign_var",
          ident,
          declare: true,
          dictParams: [],
        });
        return ident;
      }

      case "infix": {
        const leftArgType = this.analysis.getType(src.left);

        if (src.operator === "==" && isPrimitiveEq(leftArgType)) {
          return {
            type: "BinaryExpression",
            operator: "===",
            left: this.compileExprAsJsExpr(src.left, undefined),
            right: this.compileExprAsJsExpr(src.right, undefined),
          };
        }

        const infixName = toJsInfix(src.operator);
        if (infixName !== undefined) {
          const infixExpr: t.Expression = {
            type: "BinaryExpression",
            operator: infixName,
            left: this.compileExprAsJsExpr(src.left, undefined),
            right: this.compileExprAsJsExpr(src.right, undefined),
          };

          if (infixName === "/") {
            return {
              type: "CallExpression",
              callee: {
                type: "MemberExpression",
                object: { type: "Identifier", name: "Math" },
                computed: false,
                property: { type: "Identifier", name: "floor" },
              },
              arguments: [infixExpr],
            };
          }

          return infixExpr;
        }

        const infixLogicalName = toJsInfixLogical(src.operator);
        if (infixLogicalName !== undefined) {
          return {
            type: "LogicalExpression",
            operator: infixLogicalName,
            left: this.compileExprAsJsExpr(src.left, undefined),
            right: this.compileExprAsJsExpr(src.right, undefined),
          };
        }

        throw new Error("Invalid infix: " + src.operator);
      }

      case "application":
        if (src.caller.type === "identifier") {
          const prefixName = toJsPrefix(src.caller.name);
          if (prefixName !== undefined) {
            return {
              type: "UnaryExpression",
              operator: prefixName,
              argument: this.compileExprAsJsExpr(src.args[0]!, undefined),
              prefix: true,
            };
          }
        }

        return this.compileApplicationAsExpr(
          src.caller,
          src.args.map((arg) => this.compileExprAsJsExpr(arg, undefined)),
        );

      case "identifier": {
        const resolution = this.analysis.resolution.resolveIdentifier(src);

        if (resolution === undefined) {
          throw new Error("[unreachable] undefined resolution");
        }

        switch (resolution.type) {
          case "constructor": {
            if (
              resolution.declaration.name === "Bool" &&
              resolution.namespace.type === "imported" &&
              resolution.namespace.analysis.ns === "Bool"
            ) {
              switch (resolution.variant.name) {
                case "True":
                  return { type: "BooleanLiteral", value: true };
                case "False":
                  return { type: "BooleanLiteral", value: false };

                default:
                  throw new Error("[unreachable] invalid boolean constructor");
              }
            }

            return makeGlobalIdentifier(
              this.namespaceToString(resolution.namespace),
              resolution.variant.name,
            );
          }

          case "local-variable": {
            const res = this.bindingsJsName.get(resolution.binding);
            if (res === undefined) {
              throw new Error(
                "[unreachable] undefined resolution for: " +
                  resolution.binding.name,
              );
            }
            return res;
          }

          case "global-variable": {
            let ident: t.Identifier;
            if (resolution.declaration.binding.name === "==") {
              ident = EQ_IDENTIFIER;
            } else {
              ident = makeGlobalIdentifier(
                this.namespaceToString(resolution.namespace),
                resolution.declaration.binding.name,
              );
            }

            // TODO what about let exprs?
            const traitArgs = resolvePassedDicts(
              this.analysis.traitsRegistry,
              this.analysis.getPolyType(resolution.declaration.binding),
              this.analysis.getType(src),
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
            binding:
              src.pattern.type === "identifier" ? src.pattern : undefined,
          }),
        );

        const freshIdent: t.Identifier = {
          type: "Identifier",
          name: this.makeJsLetPathName(),
        };
        if (src.pattern.type === "identifier") {
          this.bindingsJsName.set(src.pattern, freshIdent);
        }
        const value = this.compileExprAsJsExpr(src.value, undefined);
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

        return this.compileExprAsJsExpr(src.body, tailPosCaller);

        // we could call this.bindingsJsName.delete(src.pattern) here
      }

      case "fn":
        return this.compileFnAsExpr(src.params, src.body);

      case "list-literal":
        return src.values.reduceRight<t.Expression>(
          (prev, src): t.Expression => {
            const compiledExpr = this.compileExprAsJsExpr(src, undefined);
            return {
              type: "CallExpression",
              callee: { type: "Identifier", name: "List$Cons" },
              arguments: [compiledExpr, prev],
            };
          },
          { type: "Identifier", name: "List$Nil" },
        );

      case "struct-literal": {
        // TODO handle external structs
        const structResolution = this.analysis.resolution.resolveStruct(
          src.struct.name,
          false,
        );

        if (structResolution === undefined) {
          throw new Error(
            "[unreachable] undefined resolution for struct declaration",
          );
        }

        const properties: t.ObjectProperty[] = [];

        let spreadIdentifier: t.Identifier | undefined;
        for (const declarationField of structResolution.fields) {
          const structLitField = src.fields.find(
            (f) => f.field.name === declarationField.name,
          );

          if (structLitField !== undefined) {
            properties.push({
              type: "ObjectProperty",
              key: { type: "Identifier", name: structLitField.field.name },
              value: this.compileExprAsJsExpr(structLitField.value, undefined),
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
          object: this.compileExprAsJsExpr(src.struct, undefined),
          property: { type: "Identifier", name: src.field.name },
          computed: false,
        };
    }
  }

  private namespaceToString(resolution: NamespaceResolution): string {
    switch (resolution.type) {
      case "self":
        return this.analysis.ns;
      case "imported":
        return resolution.analysis.ns;
    }
  }

  /**
   * compile a pattern to a list of conditions used to test if `matchedExpr` matches the pattern
   * */
  private compileCheckPatternConditions(
    pattern: UntypedMatchPattern,
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
        const resolution = this.analysis.resolution.resolveIdentifier(pattern);

        if (resolution === undefined || resolution.type !== "constructor") {
          throw new Error("[unreachable] invalid pattern resolution");
        }

        const namespace = this.namespaceToString(resolution.namespace);

        if (namespace === "Bool" && resolution.declaration.name === "Bool") {
          return [
            resolution.variant.name === "True"
              ? matchedExpr
              : {
                  type: "UnaryExpression",
                  prefix: false,
                  operator: "!",
                  argument: matchedExpr,
                },
          ];
        }

        const variantName = resolution.variant.name;
        const index = resolution.declaration.variants.findIndex(
          (variant) => variant.name === variantName,
        );
        if (index === -1) {
          throw new Error("[unreachable] variant not found in declaration");
        }

        const repr = getAdtReprType_REWRITE(resolution.declaration);
        const eqLeftSide: t.Expression = (() => {
          switch (repr) {
            case "enum":
              return matchedExpr;

            case "unboxed":
            case "default":
              return {
                type: "MemberExpression",
                object: matchedExpr,
                property: TAG_FIELD,
                computed: false,
              };
          }
        })();

        const singleVariantDeclaration =
          resolution.declaration.variants.length === 1;

        return [
          ...(singleVariantDeclaration
            ? []
            : [
                {
                  type: "BinaryExpression",
                  operator: "===",
                  left: eqLeftSide,
                  right: { type: "NumericLiteral", value: index },
                } as t.Expression,
              ]),
          ...pattern.args.flatMap((arg, index) =>
            this.compileCheckPatternConditions(
              arg,
              repr === "unboxed"
                ? matchedExpr
                : {
                    type: "MemberExpression",
                    object: matchedExpr,
                    property: { type: "Identifier", name: `_${index}` },
                    computed: false,
                  },
            ),
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
      buf.push(sanitizeNamespace(this.analysis.ns));
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

  private compileDeclaration(decl: UntypedDeclaration): t.Statement[] {
    if (decl.extern) {
      return [];
    }

    this.frames.push(
      new Frame({
        type: "let",
        jsPatternName: decl.binding.name,
        binding: decl.binding,
      }),
    );

    this.compileExprAsJsStms(decl.value, undefined, {
      type: "assign_var",
      declare: true,
      ident: makeGlobalIdentifier(this.analysis.ns, decl.binding.name),
      dictParams: findDeclarationDictsParams(
        this.analysis.getType(decl.binding),
        (id) => this.analysis.getResolvedTypeTraits(id),
      ),
    });
    this.frames.pop();

    const stms = this.statementsBuf;
    this.statementsBuf = [];
    return stms;
  }

  private compileVariant(
    variant: UntypedTypeVariant,
    index: number,
    repr: AdtReprType,
  ): t.Statement {
    return {
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: makeGlobalIdentifier(this.analysis.ns, variant.name),
          init: makeVariantBody(index, variant.args.length, repr),
        },
      ],
    };
  }

  private compileAdt(
    decl: UntypedTypeDeclaration & { type: "adt" },
  ): t.Statement[] {
    const buf: t.Statement[] = [];

    if (this.analysis.ns !== "Bool" && decl.name !== "Bool") {
      buf.push(
        ...decl.variants.map(
          (d, index): t.Statement =>
            this.compileVariant(d, index, getAdtReprType_REWRITE(decl)),
        ),
      );
    }

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
              name: `Eq_${sanitizeNamespace(this.analysis.ns)}$${decl.name}`,
            },
            init: deriveEqAdt(this.analysis.resolution, decl),
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
              name: `Show_${sanitizeNamespace(this.analysis.ns)}$${decl.name}`,
            },
            init: deriveShowAdt(this.analysis.resolution, decl),
          },
        ],
      });
    }

    return buf;
  }

  private shouldDeriveTrait(
    trait: string,
    typedDeclaration: UntypedTypeDeclaration,
  ): boolean {
    if (
      this.options.allowDeriving !== undefined &&
      !this.options.allowDeriving.includes(trait)
    ) {
      return false;
    }

    const deps = this.analysis.traitsRegistry.getTraitDepsFor(trait, {
      tag: "Named",
      name: typedDeclaration.name,
      module: this.analysis.ns,
      package: this.analysis.package_,
      args: typedDeclaration.params.map((_, id) => ({
        tag: "Var",
        id,
      })),
    });

    return deps !== undefined;
  }

  private compileStruct(
    decl: UntypedTypeDeclaration & { type: "struct" },
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
              name: `Eq_${sanitizeNamespace(this.analysis.ns)}$${decl.name}`,
            },
            init: deriveEqStruct(this.analysis.resolution, decl),
          },
        ],
      });
    }

    if (this.shouldDeriveTrait("Show", decl)) {
      buf.push({
        type: "VariableDeclaration",
        kind: "const",
        declarations: [
          {
            type: "VariableDeclarator",
            id: {
              type: "Identifier",
              name: `Show_${sanitizeNamespace(this.analysis.ns)}$${decl.name}`,
            },
            init: deriveShowStruct(this.analysis.resolution, decl),
          },
        ],
      });
    }

    return buf;
  }

  public compile(src: UntypedModule): string {
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
    case "%":
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

function makeVariantBody(
  index: number,
  argsNumber: number,
  repr: AdtReprType,
): t.Expression {
  if (repr === "enum") {
    return { type: "NumericLiteral", value: index };
  }

  const params = Array.from(
    { length: argsNumber },
    (_, i): t.Identifier => ({
      type: "Identifier",
      name: `_${i}`,
    }),
  );

  const ret: t.Expression =
    repr === "unboxed"
      ? params[0]!
      : {
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
      | {
          type: "let";
          jsPatternName: string;
          binding: Binding | undefined;
        }
      | { type: "fn" },
  ) {}

  private usedVars = new Map<string, number>();

  registerLocal(name: string): string {
    const timesUsed = this.usedVars.get(name) ?? 0;
    this.usedVars.set(name, timesUsed + 1);

    return timesUsed === 0 ? name : `${name}$${timesUsed}`;
  }
}

function findDeclarationDictsParams(
  type: Type,
  getIdTraits: (id: number) => string[],
): t.Identifier[] {
  const buf: string[] = [];

  function helper(type: Type) {
    switch (type.tag) {
      case "Fn":
        for (const arg of type.args) {
          helper(arg);
        }
        helper(type.return);
        return;

      case "Named": {
        for (const arg of type.args) {
          helper(arg);
        }
        return;
      }

      case "Var": {
        for (const trait of getIdTraits(type.id)) {
          const name = `${trait}_${type.id}`;
          if (!buf.includes(name)) {
            buf.push(name);
          }
        }
        return;
      }
    }
  }

  helper(type);

  return buf.map((name) => ({ type: "Identifier", name }));
}

function applyTraitToType(
  traitsRegistry: TraitRegistry,
  type: Type,
  trait: string,
): string | undefined {
  const deps = traitsRegistry.getTraitDepsFor(trait, type) ?? new Set();

  function recur(type: Type): string | undefined {
    switch (type.tag) {
      case "Fn":
        throw new Error("TODO bound fn");

      case "RigidVar":
        throw new Error("TODO RigidVar");
        return;

      case "Var":
        if (!deps.has(type.id)) {
          return undefined;
        }

        return `${trait}_${type.id}`;

      case "Named": {
        const args = type.args
          .map((arg) => recur(arg))
          .flatMap((x) => (x === undefined ? [] : [x]));

        const appliedArgs = args.length === 0 ? "" : `(${args.join(", ")})`;

        return `${trait}_${sanitizeNamespace(type.module)}$${type.name}${appliedArgs}`;
      }
    }
  }

  return recur(type);
}

function resolvePassedDicts(
  traitsRegistry: TraitRegistry,
  [genExpr, genExprTraits]: [Type, (id: number) => string[]],
  instantiatedExpr: Type,
): t.Identifier[] {
  const buf: t.Identifier[] = [];

  // e.g. { 0 => Set("Show", "Debug") }
  const alreadyVisitedVarsIds: Map<number, Set<string>> = new Map();

  function helper(genExpr: Type, instantiatedExpr: Type) {
    switch (genExpr.tag) {
      case "Var": {
        for (const trait of genExprTraits(genExpr.id)) {
          let lookup = alreadyVisitedVarsIds.get(genExpr.id);
          if (lookup === undefined) {
            lookup = new Set();
            alreadyVisitedVarsIds.set(genExpr.id, lookup);
          }

          // Do not add again
          if (!lookup.has(trait)) {
            lookup.add(trait);

            buf.push({
              type: "Identifier",
              // TODO fix type err
              // Maybe the rest can be simplified?
              name: applyTraitToType(traitsRegistry, instantiatedExpr, trait)!,
            });
          }
        }
        break;
      }

      case "Fn": {
        if (instantiatedExpr.tag !== "Fn") {
          throw new Error(
            "[unreachable] unexpected value of kind: " + instantiatedExpr.tag,
          );
        }
        for (let i = 0; i < genExpr.args.length; i++) {
          helper(genExpr.args[i]!, instantiatedExpr.args[i]!);
        }
        helper(genExpr.return, instantiatedExpr.return);
        break;
      }

      case "Named": {
        if (instantiatedExpr.tag !== "Named") {
          throw new Error(
            "[unreachable] unexpected value of kind: " + instantiatedExpr.tag,
          );
        }
        for (let i = 0; i < genExpr.args.length; i++) {
          helper(genExpr.args[i]!, instantiatedExpr.args[i]!);
        }
        break;
      }
    }
  }

  helper(genExpr, instantiatedExpr);

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
  type: coreTypes.task(coreTypes.unit),
};

export type CompileProjectOptions = {
  externs?: Record<string, string>;
  optimize?: boolean;
  entrypoint?: {
    module: string;
    type: Type;
  };
};

export function compileProject<Doc extends IDocument>(
  typedProject: Record<string, Analysis<Doc>>,
  {
    entrypoint = defaultEntryPoint,
    externs = {},
    // optimize = false,
  }: CompileProjectOptions = {},
): string {
  const entry = typedProject[entrypoint.module];
  if (entry === undefined) {
    throw new Error(`Entrypoint not found: '${entrypoint.module}'`);
  }

  const mainDecl = [...entry.getDeclarations()].find(
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

    for (const import_ of module.getDependencies()) {
      visit(import_.ns);
    }

    const extern = externs[ns];
    if (extern !== undefined) {
      buf.push(extern);
    }

    // TODO handle optimize
    const out = compile(module);

    buf.push(out);
  }

  visit(entrypoint.module);

  const entryPointMod = sanitizeNamespace(entrypoint.module);
  buf.push(`${entryPointMod}$main.exec();\n`);

  return buf.join("\n\n");
}

function doNotDeclare(as: CompilationMode): CompilationMode {
  return as.type === "assign_var" ? { ...as, declare: false } : as;
}

const KESTREL_CORE = "kestrel_core";

function isPrimitiveEq(leftArgType: Type): boolean {
  if (
    leftArgType.tag === "Var" ||
    leftArgType.tag === "RigidVar" ||
    leftArgType.tag === "Fn" ||
    leftArgType.package !== KESTREL_CORE
  ) {
    return false;
  }

  if (leftArgType.name === "Int" && leftArgType.module === "Int") {
    return true;
  }

  if (leftArgType.name === "Float" && leftArgType.module === "Float") {
    return true;
  }

  if (leftArgType.name === "String" && leftArgType.module === "String") {
    return true;
  }

  if (leftArgType.name === "Char" && leftArgType.module === "Char") {
    return true;
  }

  return false;
}
