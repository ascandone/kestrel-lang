import * as t from "@babel/types";
import generate from "@babel/generator";

import * as ir from "../../ir";
import { CORE_PACKAGE } from "../../../typecheck";
import { CompilationError } from "../../lower";

export type CompileOptions = {
  allowDeriving?: string[] | undefined;
};

export function compile(ast: ir.Program, options: CompileOptions = {}): string {
  const compiler = new Compiler(options);
  compiler.compile(ast);
  return compiler.generate();
}

type CompilationMode =
  | {
      type: "assign_var";
      ident: t.Identifier;
      declare: boolean;
      // dictParams: t.Identifier[];
    }
  | { type: "return" };

export class Compiler {
  private statementsBuf: t.Statement[] = [];

  /**
   * the id used to generate the private _compiler_123 fresh identifiers
   *
   * TODO make sure this doesn't break project compilation
   */
  private currentCompilerId = 0;

  constructor(readonly options: CompileOptions = {}) {}

  /**
   * Maps an adt's qualified name to its ir.
   * Must be kept cross-modules.
   * TODO Not sure it's a good idea to mix data related to the compilation unit and cross-module/cross-project data
   */
  private knownAdts = new Map<string, ir.Adt>();

  /**
   * Maps an structs's qualified name to its ir.
   * same caveats of `knownAdts`
   */
  private knownStructs = new Map<string, ir.Struct>();

  /**
   * It feels like I'll regret having a compiler class which is not dependency-aware
   *
   * we'll have to refactor this in order to implement project watch (we want to keep the inverse dependency graph
   * so that we know which module(s) to invalidate, and we'll want a single compilation unit per module)
   * */
  public generate(): string {
    const buf = this.statementsBuf;
    this.statementsBuf = [];
    return generate({
      type: "Program",
      body: buf,
      directives: [],
      sourceType: "script",
    }).code;
  }

  public compile(program: ir.Program) {
    for (const adt of program.adts) {
      this.knownAdts.set(adt.name.toString(), adt);
      const out = compileAdt(adt);
      this.statementsBuf.push(...out);
    }

    for (const struct of program.structs) {
      this.knownStructs.set(struct.name.toString(), struct);
    }

    for (const decl of program.values) {
      const out = this.compileDeclaration(decl);
      this.statementsBuf.push(...out);
    }
  }

  private compileDeclaration(decl: ir.Value): t.Statement[] {
    this.compileExprAsJsStms(decl.value, {
      type: "assign_var",
      declare: true,
      ident: compileGlobalIdent(decl.name),
      // dictParams: findDeclarationDictsParams(decl.binding.$type.asType()),
    });

    const stms = this.statementsBuf;
    this.statementsBuf = [];
    return stms;
  }

  private castExprToStmt(src: ir.Expr, as: CompilationMode): void {
    const expr = this.compileExprAsJsExpr(src);
    switch (as.type) {
      case "assign_var":
        if (as.declare) {
          const exprsWithDictParams: t.Expression =
            // as.dictParams.length === 0
            expr;

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

  // TODO explicitly pass the statements buffer, instead of having that in the class, so that it can it's easier to backtrack
  private compileExprAsJsStms(src: ir.Expr, as: CompilationMode): void {
    switch (src.type) {
      case "application": {
        const isTailcall = false; // TODO
        if (!isTailcall) {
          break;
        }
        //     if (this.isTailCall(src, tailPosCaller)) {
        //       const tailCallIdent = this.makeFreshIdent();
        //       this.tailCallIdent = tailCallIdent;
        //       for (let i = 0; i < src.args.length; i++) {
        //         const expr = this.compileExprAsJsExpr(src.args[i]!, tailPosCaller);
        //         this.statementsBuf.push({
        //           type: "ExpressionStatement",
        //           expression: {
        //             type: "AssignmentExpression",
        //             operator: "=",
        //             left: { type: "Identifier", name: `GEN_TC__${i}` },
        //             right: expr,
        //           },
        //         });
        //       }
        //       return;
        //     }
        throw new Error("TODO compile tailcall");
      }

      case "match":
        //   {
        //     if (as.type === "assign_var" && as.declare) {
        //       this.statementsBuf.push({
        //         type: "VariableDeclaration",
        //         kind: "let",
        //         declarations: [{ type: "VariableDeclarator", id: as.ident }],
        //       });
        //     }
        //     const matchedExpr = this.precomputeValue(src.expr);
        //     const checks: [
        //       condition: t.Expression | undefined,
        //       statements: t.Statement[],
        //     ][] = [];
        //     for (const [pattern, retExpr] of src.clauses) {
        //       const exprs = this.compileCheckPatternConditions(
        //         pattern,
        //         matchedExpr,
        //       );
        //       const [, stms] = this.wrapStatements(() => {
        //         this.compileExprAsJsStms(retExpr, tailPosCaller, doNotDeclare(as));
        //       });
        //       if (exprs.length === 0) {
        //         checks.push([undefined, stms]);
        //         break;
        //       }
        //       checks.push([joinAndExprs(exprs), stms]);
        //     }
        //     const helper = (index: number): t.Statement[] => {
        //       if (index >= checks.length) {
        //         return [
        //           {
        //             type: "ThrowStatement",
        //             argument: {
        //               type: "NewExpression",
        //               callee: { type: "Identifier", name: "Error" },
        //               arguments: [
        //                 {
        //                   type: "StringLiteral",
        //                   value: "[non exhaustive match]",
        //                 },
        //               ],
        //             },
        //           },
        //         ];
        //       }
        //       const [condition, stms] = checks[index]!;
        //       if (condition === undefined) {
        //         return stms;
        //       }
        //       const next = helper(index + 1);
        //       const isIfElse = next.length === 1 && next[0]!.type === "IfStatement";
        //       return [
        //         {
        //           type: "IfStatement",
        //           test: condition,
        //           consequent: {
        //             type: "BlockStatement",
        //             directives: [],
        //             body: stms,
        //           },
        //           alternate: isIfElse
        //             ? next[0]!
        //             : {
        //                 type: "BlockStatement",
        //                 directives: [],
        //                 body: next,
        //               },
        //         },
        //       ];
        //     };
        //     this.statementsBuf.push(...helper(0));
        //     return;
        //   }
        throw new Error("TODO implement (stm) : " + src.type);

      case "if": {
        if (as.type === "assign_var" && as.declare) {
          this.statementsBuf.push({
            type: "VariableDeclaration",
            kind: "let",
            declarations: [{ type: "VariableDeclarator", id: as.ident }],
          });
        }
        const test = this.compileExprAsJsExpr(src.condition);
        const [, thenBranchStmts] = this.wrapStatements(() =>
          this.compileExprAsJsStms(src.then, doNotDeclare(as)),
        );
        const [, elseBranchStmts] = this.wrapStatements(() =>
          this.compileExprAsJsStms(src.else, doNotDeclare(as)),
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

      /*
        the following nodes can always be compiled as expression, thus we
        cast them as expression and them emit the corresponding statement,
        like `const x = <expr>`
        (note the return after the switch case)
       */
      case "let":
      case "constant":
      case "struct-literal":
      case "identifier":
      case "fn":
      case "field-access":
        break;

      default:
        src as never;
    }

    return this.castExprToStmt(src, as);
  }

  private compileExprAsJsExpr(src: ir.Expr): t.Expression {
    switch (src.type) {
      case "constant":
        return compileConst(src.value);

      case "identifier":
        return this.compileIdentifierAsExpr(src);

      case "application":
        return this.compileApplicationAsExpr(src);

      case "let":
        return this.compileLetAsExpr(src);

      case "fn":
        return this.compileFnAsExpr(src);

      case "if":
        return this.compileIfAsExpr(src);

      case "struct-literal":
        return this.compileStructLiteralAsExpr(src);

      case "field-access":
        return this.compileFieldAccessAsExpr(src);

      case "match":
        throw new Error("TODO implement (expr) : " + src.type);
    }
  }

  private makeUnary(
    operator: t.UnaryExpression["operator"],
    args: ir.Expr[],
  ): t.Expression {
    // TODO validate args and throw
    const arg = args[0]!;

    return {
      type: "UnaryExpression",
      prefix: false,
      operator,
      argument: this.compileExprAsJsExpr(arg),
    };
  }

  private makeBinaryLogical(
    operator: t.LogicalExpression["operator"],
    args: ir.Expr[],
  ): t.Expression {
    // TODO validate args and throw
    const left = args[0]!;
    const right = args[1]!;
    return {
      type: "LogicalExpression",
      operator: operator,
      left: this.compileExprAsJsExpr(left!),
      right: this.compileExprAsJsExpr(right!),
    };
  }

  private makeBinaryMath(
    operator: t.BinaryExpression["operator"],
    args: ir.Expr[],
  ): t.Expression {
    // TODO validate args and throw
    const left = args[0]!;
    const right = args[1]!;

    return {
      type: "BinaryExpression",
      operator,
      left: this.compileExprAsJsExpr(left),
      right: this.compileExprAsJsExpr(right),
    };
  }

  private tryCompileIntrinsic(
    src: ir.Expr & { type: "application" },
  ): t.Expression | undefined {
    if (src.caller.type !== "identifier") {
      return;
    }

    // TODO we can probably inline constructors as well
    if (src.caller.ident.type !== "global") {
      return;
    }

    const qualifiedName = src.caller.ident.name;
    if (qualifiedName.package_ !== CORE_PACKAGE) {
      return;
    }

    // TODO(nitpick) maybe make this a dict?
    switch (`${qualifiedName.namespace}.${qualifiedName.name}`) {
      // TODO! add other intrinsics
      case "Int.+":
      case "Float.+.":
      case "String.++":
        return this.makeBinaryMath("+", src.args);

      case "Int.-":
      case "Float.-.":
        return this.makeBinaryMath("-", src.args);

      case "Int.*":
      case "Float.*.":
        return this.makeBinaryMath("*", src.args);

      case "Int.%":
        return this.makeBinaryMath("%", src.args);

      case "Int./":
        return {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            object: { type: "Identifier", name: "Math" },
            computed: false,
            property: { type: "Identifier", name: "floor" },
          },
          arguments: [this.makeBinaryMath("/", src.args)],
        };

      case "Float./.":
        this.makeBinaryMath("/", src.args);

      case "Bool.!":
        return this.makeUnary("!", src.args);
      case "Bool.&&":
        return this.makeBinaryLogical("&&", src.args);
      case "Bool.||":
        return this.makeBinaryLogical("||", src.args);

      case "Bool.==":
      case "Bool.!=":
      case "Bool.<=":
      case "Bool.<":
      case "Bool.>=":
      case "Bool.>":
        throw new Error("TODO monomorphic comparision");

      default:
        return;
    }
  }

  private compileFieldAccessAsExpr(
    src: ir.Expr & { type: "field-access" },
  ): t.Expression {
    return {
      type: "MemberExpression",
      object: this.compileExprAsJsExpr(src.struct),
      property: { type: "Identifier", name: src.field.name },
      computed: false,
    };
  }

  private compileIdentifierAsExpr(
    src: ir.Expr & { type: "identifier" },
  ): t.Expression {
    switch (src.ident.type) {
      case "global":
        return compileGlobalIdent(src.ident.name);

      case "local":
        return compileLocalIdent(src.ident);

      case "constructor": {
        const qualifiedTypeName = src.ident.typeName;
        if (
          qualifiedTypeName.package_ === CORE_PACKAGE &&
          qualifiedTypeName.name === "Bool"
        ) {
          switch (src.ident.name) {
            case "True":
              return { type: "BooleanLiteral", value: true };
            case "False":
              return { type: "BooleanLiteral", value: false };
            default:
              throw new CompilationError("Invalid constructor");
          }
        }

        return compileGlobalIdent(
          new ir.QualifiedIdentifier(
            src.ident.typeName.package_,
            src.ident.typeName.namespace,
            src.ident.name,
          ),
        );
      }
    }
  }

  private compileApplicationAsExpr(
    src: ir.Expr & { type: "application" },
  ): t.Expression {
    const inlined = this.tryCompileIntrinsic(src);
    if (inlined !== undefined) {
      return inlined;
    }

    if (
      src.caller.type === "identifier" &&
      src.caller.ident.type === "constructor"
    ) {
      return this.compileInlinedCtor(src.caller.ident, src.args);
    }

    return {
      type: "CallExpression",
      callee: this.compileExprAsJsExpr(src.caller),
      arguments: src.args.map((arg) => this.compileExprAsJsExpr(arg)),
    };
  }

  private compileInlinedCtor(
    ctor: ir.Ident & { type: "constructor" },
    args: ir.Expr[],
  ): t.Expression {
    const adtDef = this.knownAdts.get(ctor.typeName.toString());
    if (adtDef === undefined) {
      throw new CompilationError("Can't find adt repr");
    }
    const repr = getAdtReprType(adtDef);

    const tagIndex = adtDef.constructors.findIndex(
      (c) => c.name.name === ctor.name,
    );

    switch (repr) {
      // this is actually unreachable by enum repr
      // if there are only singletons, it can never be an application
      case "enum":
      case "default":
        return buildCtorCall(
          tagIndex,
          args.map((arg) => this.compileExprAsJsExpr(arg)),
        );

      case "unboxed":
        return this.compileExprAsJsExpr(args[0]!);
    }
  }

  private genCompilerIdent(): t.Identifier {
    return {
      type: "Identifier",
      name: `$${this.currentCompilerId++}`,
    };
  }

  private compileIfAsExpr(src: ir.Expr & { type: "if" }): t.Expression {
    const ident = this.genCompilerIdent();

    this.compileExprAsJsStms(src, {
      type: "assign_var",
      ident,
      declare: true,
      // dictParams: [],
    });

    return ident;
  }

  private compileFnAsExpr(src: ir.Expr & { type: "fn" }): t.Expression {
    // TODO TCO
    // TODO would it be possible to have a simplier repr for fn params? it probably shoudn't involve the IR lowering
    // maybe by keeping a scope with the locals defined as params? and converting to simple names
    const [{ params }, stms] = this.wrapStatements(() => {
      const params = src.bindings.map(
        (param): t.Identifier => compileLocalIdent(param),
      );
      this.compileExprAsJsStms(src.body, {
        type: "return",
      });
      return { params };
    });
    const bodyStms: t.Expression | t.BlockStatement = (() => {
      if (stms.length === 1 && stms[0]!.type === "ReturnStatement") {
        return stms[0].argument!;
      }
      return {
        type: "BlockStatement",
        directives: [],
        body: stms,
      };
    })();

    return {
      type: "ArrowFunctionExpression",
      async: false,
      expression: true,
      params,
      body: bodyStms,
    };
  }

  private compileLetAsExpr(src: ir.Expr & { type: "let" }): t.Expression {
    this.statementsBuf.push({
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: compileLocalIdent(src.binding),
          init: this.compileExprAsJsExpr(src.value),
        },
      ],
    });
    return this.compileExprAsJsExpr(src.body);
  }

  private compileStructLiteralAsExpr(
    src: ir.Expr & { type: "struct-literal" },
  ): t.Expression {
    const struct = this.knownStructs.get(src.struct.toString());
    if (struct === undefined) {
      throw new CompilationError("struct repr not found");
    }

    const properties: t.ObjectProperty[] = [];
    let spreadIdentifier: t.Identifier | undefined;
    for (const declarationField of struct.fields) {
      const structLitField = src.fields.find(
        (f) => f.name === declarationField,
      );
      if (structLitField !== undefined) {
        properties.push({
          type: "ObjectProperty",
          key: { type: "Identifier", name: structLitField.name },
          value: this.compileExprAsJsExpr(structLitField.expr),
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
          key: { type: "Identifier", name: declarationField },
          value: {
            type: "MemberExpression",
            object: spreadIdentifier,
            property: { type: "Identifier", name: declarationField },
            computed: false,
          },
          shorthand: true,
          computed: false,
        });
      }
    }
    return { type: "ObjectExpression", properties };
  }

  private precomputeValue(
    expr: ir.Expr,
    makeIdent = () => this.genCompilerIdent(),
  ): t.Identifier {
    const jsExpr = this.compileExprAsJsExpr(expr);
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

  private wrapStatements<T>(f: () => T): [T, t.Statement[]] {
    const buf = this.statementsBuf;
    this.statementsBuf = [];
    const e = f();
    const stms = this.statementsBuf;
    this.statementsBuf = buf;
    return [e, stms];
  }
}

function compileConst(ast: ir.ConstLiteral): t.Expression {
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

/**
 * compile a local identifier as `pkg$My$Nested$Mod$glb`
 *
 * TODO package scope is not added yet
 */
function compileGlobalIdent(qualified: ir.QualifiedIdentifier): t.Identifier {
  // TODO add binding.declaration.package_ prefix
  return {
    type: "Identifier",
    name: mkGlbIdent(qualified),
  };
}

/**
 * compile a local identifier as `pkg$My$Nested$Mod$glb$name$42`
 * the unique id is omitted when zero
 *
 * TODO package scope is not added yet
 */
function compileLocalIdent(
  binding: ir.Ident & { type: "local" },
): t.Identifier {
  const unique = binding.unique === 0 ? "" : `$${binding.unique}`;

  // TODO add binding.declaration.package_ prefix
  return {
    type: "Identifier",
    name: `${mkGlbIdent(binding.declaration)}$${binding.name}${unique}`,
  };
}

function mkGlbIdent(qualified: ir.QualifiedIdentifier): string {
  const sanitized = qualified.namespace.replace(/\//g, "$");
  return `${sanitized}$${qualified.name}`;
}

function doNotDeclare(as: CompilationMode): CompilationMode {
  return as.type === "assign_var" ? { ...as, declare: false } : as;
}

function compileAdt(decl: ir.Adt): t.Statement[] {
  const buf: t.Statement[] = [];

  const skipRepresentation =
    decl.name.package_ === CORE_PACKAGE && decl.name.name === "Bool";

  if (!skipRepresentation) {
    const repr = getAdtReprType(decl);
    decl.constructors.forEach((ctor, index) => {
      const out = compileConstructor(ctor, index, repr);
      buf.push(out);
    });
  }

  return buf;
}

function compileConstructor(
  variant: ir.AdtConstructor,
  index: number,
  repr: AdtReprType,
): t.Statement {
  return {
    type: "VariableDeclaration",
    kind: "const",
    declarations: [
      {
        type: "VariableDeclarator",
        id: compileGlobalIdent(variant.name),
        init: makeVariantBody(index, variant.arity, repr),
      },
    ],
  };
}

export const TAG_FIELD: t.Identifier = { type: "Identifier", name: "$" };

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
    repr === "unboxed" ? params[0]! : buildCtorCall(index, params);

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

type AdtReprType = "default" | "enum" | "unboxed";
// TODO(perf) cache this using weakmap
function getAdtReprType(decl: ir.Adt): AdtReprType {
  if (decl.constructors.length === 1 && decl.constructors[0]!.arity === 1) {
    return "unboxed";
  }

  const isEnum = decl.constructors.every((v) => v.arity === 0);
  if (isEnum) {
    return "enum";
  }

  return "default";
}

function buildCtorCall(tagIndex: number, args: t.Expression[]): t.Expression {
  return {
    type: "ObjectExpression",
    properties: [
      {
        type: "ObjectProperty",
        key: TAG_FIELD,
        value: { type: "NumericLiteral", value: tagIndex },
        computed: false,
        shorthand: false,
      },
      ...args.map(
        (p, index): t.ObjectProperty => ({
          type: "ObjectProperty",
          key: { type: "Identifier", name: `_${index}` },
          value: p,
          computed: false,
          shorthand: true,
        }),
      ),
    ],
  };
}
