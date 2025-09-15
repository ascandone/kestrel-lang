import * as t from "@babel/types";
import generate from "@babel/generator";

import * as ir from "../../ir";
import { CompilationError, ProjectLowering } from "../../lower";
import * as common from "./common";
import * as deriving from "./deriving";
import { CORE_PACKAGE } from "../../../typecheck/core_package";
import { TypedProject } from "../../../typecheck/project";
import { nestedMapGetOrPutDefault } from "../../../common/defaultMap";

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
      dictParams: t.Identifier[];

      isGlobal: boolean;
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
  private currentDecl?: ir.QualifiedIdentifier;
  private tailCalls?: Set<ir.Expr & { type: "application" }>;

  constructor(readonly options: CompileOptions = {}) {}

  /**
   * Maps an adt's qualified name to its ir.
   * Must be kept cross-modules.
   * TODO Not sure it's a good idea to mix data related to the compilation unit and cross-module/cross-project data
   */
  private knownAdts = new Map<string, ir.Adt>();
  private getAdt(ident: ir.QualifiedIdentifier) {
    const adt = this.knownAdts.get(ident.toString());
    if (adt === undefined) {
      throw new CompilationError("unknown adt: " + ident);
    }
    return adt;
  }

  /**
   * substitution from a local ns to a compiled identifier
   *
   * TODO will probably want to remove this when pat match exhaustiveness is impl
   */
  private substitutedIdents = new Map<string, t.Expression>();

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
      this.compileAdt(adt);
    }

    for (const struct of program.structs) {
      this.knownStructs.set(struct.name.toString(), struct);
      this.statementsBuf.push(
        ...deriving.deriveStruct(struct, this.options.allowDeriving),
      );
    }

    for (const decl of program.values) {
      const out = this.compileDeclaration(decl);
      this.statementsBuf.push(...out);
    }
  }

  private compileDeclaration(decl: ir.ValueDeclaration): t.Statement[] {
    this.currentDecl = decl.name;
    this.compileExprAsJsStms(decl.value, {
      type: "assign_var",
      declare: true,
      ident: compileGlobalIdent(decl.name),
      dictParams: decl.implicitTraitParams.map(makeImplicitParamVarIdent),
      isGlobal: true,
    });

    const stms = this.statementsBuf;
    this.statementsBuf = [];
    return stms;
  }

  /**
   * Either assign the statement to a constant or create a return statement with it
   * (depending on the CompilationMode)
   */
  private castExprToStmt(expr: t.Expression, as: CompilationMode): void {
    switch (as.type) {
      case "assign_var":
        if (as.declare) {
          if (!as.isGlobal && isSimpleJsExpr(expr)) {
            this.substitutedIdents.set(as.ident.name, expr);
            return;
          }

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

  // TODO explicitly pass the statements buffer, instead of having that in the class, so that it can it's easier to backtrack
  private compileExprAsJsStms(src: ir.Expr, as: CompilationMode): void {
    switch (src.type) {
      case "application": {
        const isTailcall = this.tailCalls?.has(src) ?? false;
        if (isTailcall) {
          this.compileTailcall(src);
          return;
        }
        break;
      }

      case "match":
        return this.compileMatchAsStmt(src, as);

      /*
        the following nodes can always be compiled as expression, thus we
        cast them as expression and them emit the corresponding statement,
        like `const x = <expr>`
        (note the return after the switch case)
       */
      case "constant":
      case "struct-literal":
      case "identifier":
      case "fn":
      case "field-access":
        break;

      default:
        src as never;
    }

    const expr = this.compileExprAsJsExpr(src);
    return this.castExprToStmt(expr, as);
  }

  private compileTailcall(src: ir.Expr & { type: "application" }) {
    for (let i = 0; i < src.args.length; i++) {
      const expr = this.compileExprAsJsExpr(src.args[i]!);
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
  }

  private compileExprAsJsExpr(src: ir.Expr): t.Expression {
    switch (src.type) {
      case "constant":
        return compileConst(src.value);

      case "identifier":
        return this.compileIdentifierAsExpr(src);

      case "application":
        // Careful: TCO doesn't apply here
        return this.compileApplicationAsExpr(src);

      case "fn":
        return this.compileFnAsExpr(src);

      case "struct-literal":
        return this.compileStructLiteralAsExpr(src);

      case "field-access":
        return this.compileFieldAccessAsExpr(src);

      case "match":
        return this.compileMatchAsExpr(src);

      default:
        return src satisfies never;
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

  private tryCompileInlinedIntrinsic(
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

      case "Bool.==": {
        const isMonomorphicEq = src.caller.ident.implicitly.some((i) => {
          // TODO(nitpicky) remove Eq magic constant
          if (
            i.type !== "resolved" ||
            i.trait !== "Eq" ||
            i.typeName.package_ !== CORE_PACKAGE
          ) {
            return false;
          }

          // TODO(perf) also for unboxed constructors whose value supports ===
          // TODO(perf) also for enum-like constructors
          switch (i.typeName.name) {
            case "Int":
            case "Bool":
            case "Float":
            case "Char":
            case "String":
              return true;

            default:
              return false;
          }
        });

        if (isMonomorphicEq) {
          return this.makeBinaryMath("===", src.args);
        }

        return;
      }

      case "Bool.!=":
        throw new Error("TODO inequality");

      case "Bool.<=":
        return this.makeBinaryMath("<=", src.args);
      case "Bool.<":
        return this.makeBinaryMath("<", src.args);
      case "Bool.>=":
        return this.makeBinaryMath(">=", src.args);
      case "Bool.>":
        return this.makeBinaryMath(">", src.args);

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
      case "global": {
        const ident = compileGlobalIdent(src.ident.name);
        if (src.ident.implicitly.length !== 0) {
          return {
            type: "CallExpression",
            callee: ident,
            arguments: src.ident.implicitly.map(makeImplicitParamIdentifier),
          };
        }
        return ident;
      }

      case "local": {
        const ident = compileLocalIdent(src.ident);
        return this.substitutedIdents.get(ident.name) ?? ident;
      }

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
    const inlined = this.tryCompileInlinedIntrinsic(src);
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
    const adtDef = this.getAdt(ctor.typeName);
    const repr = common.getAdtReprType(adtDef);

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
      name: `_GEN_${this.currentCompilerId++}`,
    };
  }

  private compileMatchAsExpr(src: ir.Expr & { type: "match" }): t.Expression {
    const letSugar = isMatchLetLike(src);
    if (letSugar === undefined) {
      return this.compileAsDeclaration(src);
    }
    return this.compileLetAsExpr(letSugar);
  }

  private compileMatchAsIf(
    condition: ir.Expr,
    as: CompilationMode,
    then_: ir.Expr,
    else_: ir.Expr,
  ) {
    if (as.type === "assign_var" && as.declare) {
      this.statementsBuf.push({
        type: "VariableDeclaration",
        kind: "let",
        declarations: [{ type: "VariableDeclarator", id: as.ident }],
      });
    }

    const [_ret1, thenStms] = this.wrapStatements(() => {
      this.compileExprAsJsStms(then_, doNotDeclare(as));
    });

    const [_ret2, elseStms] = this.wrapStatements(() => {
      this.compileExprAsJsStms(else_, doNotDeclare(as));
    });

    this.statementsBuf.push({
      type: "IfStatement",
      test: this.compileExprAsJsExpr(condition),
      consequent: {
        type: "BlockStatement",
        directives: [],
        body: thenStms,
      },
      alternate: {
        type: "BlockStatement",
        directives: [],
        body: elseStms,
      },
    });
  }

  private compileMatchAsSwitch(
    discriminant: t.Expression,
    as: CompilationMode,
    clauses: Array<[t.Expression | undefined, ir.Expr]>,
  ) {
    // TODO dedup this
    if (as.type === "assign_var" && as.declare) {
      this.statementsBuf.push({
        type: "VariableDeclaration",
        kind: "let",
        declarations: [{ type: "VariableDeclarator", id: as.ident }],
      });
    }

    this.statementsBuf.push({
      type: "SwitchStatement",
      discriminant,
      cases: clauses.map(([test, cons]): t.SwitchCase => {
        const [_, consequent] = this.wrapStatements(() => {
          this.compileExprAsJsStms(cons, doNotDeclare(as));
        });
        return {
          type: "SwitchCase",
          test,
          consequent: [
            ...consequent,
            {
              type: "BreakStatement",
            },
          ],
        };
      }),
    });
  }

  private compileMatchAsStmt(
    src: ir.Expr & { type: "match" },
    as: CompilationMode,
  ): void {
    // ---  let-like match
    const letSugar = isMatchLetLike(src);
    if (letSugar !== undefined) {
      this.compileLetAsStmts(letSugar, as);
      return;
    }

    //  --- if-like match
    const ifSugar = isMatchIfLike(src);
    if (ifSugar !== undefined) {
      this.compileMatchAsIf(src.expr, as, ifSugar.then, ifSugar.else);
      return;
    }

    const [firstPat, firstReturning] = src.clauses[0]!;

    //  --- switch-like match (lit)
    if (firstPat.type === "constant") {
      this.compileMatchAsSwitch(this.compileExprAsJsExpr(src.expr), as, [
        ...src.clauses.map(
          ([pat, returning]): [t.Expression | undefined, ir.Expr] => {
            if (pat.type !== "constant") {
              throw new CompilationError("unexpected mixed ctors in pattern");
            }
            return [compileConst(pat.value), returning];
          },
        ),

        [undefined, src.default![1]],
      ]);
      return;
    }

    // -- unwrapping single ctor
    if (
      src.clauses.length === 1 &&
      firstPat.type === "constructor" &&
      src.default === undefined
    ) {
      // TODO handle unboxed repr
      // TODO dedup
      const precomputed = this.precomputeValue(src.expr);
      firstPat.args.forEach((arg, index) => {
        const ident = compileLocalIdent(arg);
        this.substitutedIdents.set(ident.name, {
          type: "MemberExpression",
          computed: false,
          object: precomputed,
          property: { type: "Identifier", name: `_${index}` },
        });
      });
      this.compileExprAsJsStms(firstReturning, as);

      return;
    }

    // --- switch-like match (enum adt)
    const adtDef = this.getAdt(firstPat.typeName);
    const repr = common.getAdtReprType(adtDef);
    if (repr === "enum") {
      const clauses = src.clauses.map(
        ([pat, returning]): [t.Expression | undefined, ir.Expr] => {
          if (pat.type !== "constructor") {
            throw new CompilationError("unexpected mixed ctors in pattern");
          }

          const index = adtDef.constructors.findIndex(
            (ctor) => ctor.name.name === pat.name,
          );
          if (index === -1) {
            throw new CompilationError("invalid ctor index");
          }

          return [{ type: "NumericLiteral", value: index }, returning];
        },
      );

      if (src.default !== undefined) {
        clauses.push([undefined, src.default[1]]);
      }

      this.compileMatchAsSwitch(
        this.compileExprAsJsExpr(src.expr),
        as,
        clauses,
      );
      return;
    }

    const precomputed = this.precomputeValue(src.expr);
    const clauses = src.clauses.map(
      ([pat, returning]): [t.Expression | undefined, ir.Expr] => {
        if (pat.type !== "constructor") {
          throw new CompilationError("unexpected mixed ctors in pattern");
        }

        const index = adtDef.constructors.findIndex(
          (ctor) => ctor.name.name === pat.name,
        );
        if (index === -1) {
          throw new CompilationError("invalid ctor index");
        }

        pat.args.forEach((arg, index) => {
          const ident = compileLocalIdent(arg);
          this.substitutedIdents.set(ident.name, {
            type: "MemberExpression",
            computed: false,
            object: precomputed,
            property: { type: "Identifier", name: `_${index}` },
          });
        });

        return [{ type: "NumericLiteral", value: index }, returning];
      },
    );

    if (src.default !== undefined) {
      clauses.push([undefined, src.default[1]]);
    }

    this.compileMatchAsSwitch(
      {
        type: "MemberExpression",
        computed: false,
        object: precomputed,
        property: common.TAG_FIELD,
      },
      as,
      clauses,
    );
  }

  private compileAsDeclaration(src: ir.Expr): t.Expression {
    const ident = this.genCompilerIdent();
    this.compileExprAsJsStms(src, {
      type: "assign_var",
      ident,
      declare: true,
      dictParams: [],
      isGlobal: false,
    });
    return ident;
  }

  private compileFnAsExpr(src: ir.Expr & { type: "fn" }): t.Expression {
    const tailCalls = tcIdents(this.currentDecl!, src.body);
    this.tailCalls = tailCalls;

    // TODO would it be possible to have a simplier repr for fn params? it probably shoudn't involve the IR lowering
    // maybe by keeping a scope with the locals defined as params? and converting to simple names
    const [{ params }, stms] = this.wrapStatements(() => {
      const params = src.bindings.map(compileLocalIdent);
      this.compileExprAsJsStms(src.body, {
        type: "return",
      });
      return { params };
    });

    const bodyStms: t.Expression | t.BlockStatement = (() => {
      if (
        tailCalls.size === 0 &&
        stms.length === 1 &&
        stms[0]!.type === "ReturnStatement"
      ) {
        return stms[0].argument!;
      }
      return {
        type: "BlockStatement",
        directives: [],
        body:
          tailCalls.size === 0
            ? stms
            : [
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
    })();

    return {
      type: "ArrowFunctionExpression",
      async: false,
      expression: true,
      params:
        tailCalls.size === 0
          ? params
          : params.map(
              (_, i): t.Identifier => ({
                type: "Identifier",
                name: `GEN_TC__${i}`,
              }),
            ),
      body: bodyStms,
    };
  }

  private compileLetAsStmts(src: ir.LetSugar, as: CompilationMode): void {
    this.compileExprAsJsStms(src.value, {
      type: "assign_var",
      declare: true,
      ident: compileLocalIdent(src.binding),
      dictParams: [],
      isGlobal: false,
    });

    this.compileExprAsJsStms(src.body, as);
  }

  private compileLetAsExpr(src: ir.LetSugar): t.Expression {
    this.compileExprAsJsStms(src.value, {
      type: "assign_var",
      declare: true,
      ident: compileLocalIdent(src.binding),
      dictParams: [],
      isGlobal: false,
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
    // TODO maybe we should avoid this inlining?
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

  private compileAdt(decl: ir.Adt) {
    const skipRepresentation =
      decl.name.package_ === CORE_PACKAGE && decl.name.name === "Bool";

    if (!skipRepresentation) {
      const repr = common.getAdtReprType(decl);
      decl.constructors.forEach((ctor, index) => {
        const out = compileConstructor(ctor, index, repr);
        this.statementsBuf.push(out);
      });
    }

    this.statementsBuf.push(
      ...deriving.deriveAdt(decl, this.options.allowDeriving),
    );
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
  if (qualified.name === "==") {
    return { type: "Identifier", name: "_eq" };
  }

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
): t.Identifier & { type: "Identifier" } {
  const unique = binding.unique === 0 ? "" : `$${binding.unique}`;
  const name = binding.name === "" ? "_IR_GEN" : binding.name;

  // TODO add binding.declaration.package_ prefix
  return {
    type: "Identifier",
    name: `${mkGlbIdent(binding.declaration)}$${name}${unique}`,
  };
}

function mkGlbIdent(qualified: ir.QualifiedIdentifier): string {
  const sanitized = common.sanitizeNamespace(qualified.namespace);
  return `${sanitized}$${qualified.name}`;
}

function doNotDeclare(as: CompilationMode): CompilationMode {
  return as.type === "assign_var" ? { ...as, declare: false } : as;
}

function compileConstructor(
  variant: ir.AdtConstructor,
  index: number,
  repr: common.AdtReprType,
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

function makeVariantBody(
  index: number,
  argsNumber: number,
  repr: common.AdtReprType,
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

function buildCtorCall(tagIndex: number, args: t.Expression[]): t.Expression {
  return {
    type: "ObjectExpression",
    properties: [
      {
        type: "ObjectProperty",
        key: common.TAG_FIELD,
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

type IfSugar = {
  condition: ir.Expr;
  then: ir.Expr;
  else: ir.Expr;
};

function isMatchIfLike(src: ir.Expr & { type: "match" }): IfSugar | undefined {
  if (src.clauses.length === 0) {
    return undefined;
  }

  const [firstPat] = src.clauses[0]!;

  const isBool =
    firstPat.type === "constructor" &&
    firstPat.typeName.package_ === CORE_PACKAGE &&
    firstPat.typeName.name === "Bool";
  if (!isBool) {
    return undefined;
  }

  const findExpr = (name: string): ir.Expr =>
    src.clauses.find(
      (c) => c[0].type === "constructor" && c[0].name === name,
    )?.[1] ?? src.default![1]!;

  const then_: ir.Expr = findExpr("True");
  const else_: ir.Expr = findExpr("False");

  return {
    condition: src.expr,
    then: then_,
    else: else_,
  };
}

function isMatchLetLike(
  src: ir.Expr & { type: "match" },
): ir.LetSugar | undefined {
  // -- unboxed repr
  if (src.clauses.length === 1 && src.default === undefined) {
    const [firstPat, returning] = src.clauses[0]!;
    if (firstPat.type === "constructor" && firstPat.args.length === 1) {
      return {
        binding: firstPat.args[0]!,
        body: returning,
        value: src.expr,
      };
    }
  }

  if (src.clauses.length !== 0) {
    return undefined;
  }

  const [binding, body] = src.default!;

  return {
    binding,
    body,
    value: src.expr,
  };
}

function makeImplicitParamVarIdent(
  arg: ir.ImplicitTraitArg & { type: "var" },
): t.Identifier {
  return {
    type: "Identifier",
    name: `${arg.trait}_${arg.id}`,
  };
}

function makeImplicitParamIdentifier(arg: ir.ImplicitTraitArg): t.Expression {
  switch (arg.type) {
    case "resolved": {
      const ident: t.Identifier = {
        type: "Identifier",
        name: `${arg.trait}_${arg.typeName.namespace}$${arg.typeName.name}`,
      };

      if (arg.args.length === 0) {
        return ident;
      }

      return {
        type: "CallExpression",
        callee: ident,
        arguments: arg.args.map(makeImplicitParamIdentifier),
      };
    }

    case "var":
      return makeImplicitParamVarIdent(arg);
  }
}

// Project compilation

export const defaultEntryPoint = "Main";

export type CompileProjectOptions = {
  externs?: Record<string, string>;
  entrypoint?: string;
};

export function compileProject(
  package_: string,
  typedProject: TypedProject,
  { entrypoint = defaultEntryPoint, externs = {} }: CompileProjectOptions = {},
): string {
  const entry = nestedMapGetOrPutDefault(typedProject, entrypoint).get(
    package_,
  );

  if (entry === undefined) {
    throw new Error(`Entrypoint not found: '${entrypoint}'`);
  }

  const mainDecl = entry[0].declarations.find(
    (d) => d.binding.name === "main" && d.pub,
  );
  if (mainDecl === undefined) {
    throw new Error("Entrypoint needs a value called `main`.");
  }

  const proj = new ProjectLowering(typedProject);
  proj.visit(package_, entrypoint);

  const compiler = new Compiler();

  const buf: string[] = [];

  for (const irProgram of proj.sortedVisited) {
    const extern = externs[irProgram.namespace];
    if (extern !== undefined) {
      buf.push(extern);
    }

    compiler.compile(irProgram);
    const out = compiler.generate();
    buf.push(out);
  }

  const entryPointMod = common.sanitizeNamespace(entrypoint);
  buf.push(`${entryPointMod}$main.exec();\n`);

  return buf.join("\n\n");
}

function tcIdents(binding: ir.QualifiedIdentifier, expr: ir.Expr) {
  const tailCalls = new Set<ir.Expr & { type: "application" }>();

  function helper(expr: ir.Expr) {
    switch (expr.type) {
      case "application": {
        if (
          expr.caller.type !== "identifier" ||
          expr.caller.ident.type !== "global" ||
          !expr.caller.ident.name.equals(binding)
        ) {
          return;
        }

        tailCalls.add(expr);
        return;
      }

      case "match":
        for (const [, clause] of expr.clauses) {
          helper(clause);
        }
        if (expr.default !== undefined) {
          helper(expr.default[1]);
        }
        return;

      case "identifier":
      case "constant":
      case "fn":
      case "field-access":
      case "struct-literal":
        return;

      default:
        expr satisfies never;
    }
  }

  helper(expr);

  return tailCalls;
}

function isSimpleJsExpr(expr: t.Expression) {
  switch (expr.type) {
    case "Identifier":
      return true;

    default:
      return false;
  }
}
