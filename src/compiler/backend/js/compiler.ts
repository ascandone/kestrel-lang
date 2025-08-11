import * as t from "@babel/types";
import generate from "@babel/generator";

import * as ir from "../../ir";
import { ConstLiteral } from "../../../parser";
import { CORE_PACKAGE } from "../../../typecheck";
import { CompilationError } from "../../lower";

export type CompileOptions = {
  allowDeriving?: string[] | undefined;
};

export function compile(
  package_: string,
  ns: string,
  ast: ir.Program,
  options: CompileOptions = {},
): string {
  return new Compiler(package_, ns, options).compile(ast);
}

type CompilationMode =
  | {
      type: "assign_var";
      ident: t.Identifier;
      declare: boolean;
      // dictParams: t.Identifier[];
    }
  | { type: "return" };

class Compiler {
  constructor(
    // TODO add "private" and use the pkg to compile (or remove them)
    readonly package_: string,
    readonly ns: string,

    // TODO add "private"
    readonly options: CompileOptions,
  ) {}

  private statementsBuf: t.Statement[] = [];

  compile(src: ir.Program): string {
    const body: t.Statement[] = [];

    for (const decl of src.values) {
      const out = this.compileDeclaration(decl);
      body.push(...out);
    }

    return generate({
      type: "Program",
      body,
      directives: [],
      sourceType: "script",
    }).code;
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

        // TODO we probably want to detect that in the IR

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

      case "if":
        //   {
        //     if (as.type === "assign_var" && as.declare) {
        //       this.statementsBuf.push({
        //         type: "VariableDeclaration",
        //         kind: "let",
        //         declarations: [{ type: "VariableDeclarator", id: as.ident }],
        //       });
        //     }
        //     const test = this.compileExprAsJsExpr(src.condition, undefined);
        //     const [, thenBranchStmts] = this.wrapStatements(() =>
        //       this.compileExprAsJsStms(src.then, tailPosCaller, doNotDeclare(as)),
        //     );
        //     const [, elseBranchStmts] = this.wrapStatements(() =>
        //       this.compileExprAsJsStms(src.else, tailPosCaller, doNotDeclare(as)),
        //     );
        //     this.statementsBuf.push({
        //       type: "IfStatement",
        //       test: test,
        //       consequent: {
        //         type: "BlockStatement",
        //         directives: [],
        //         body: thenBranchStmts,
        //       },
        //       alternate: {
        //         type: "BlockStatement",
        //         directives: [],
        //         body: elseBranchStmts,
        //       },
        //     });
        //     return;
        //   }

        throw new Error("TODO implement (stm) : " + src.type);

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

    // switch (src.type) {

    //   case "block":
    //     if (src.statements.length === 0) {
    //       return this.compileExprAsJsStms(src.returning, tailPosCaller, as);
    //     }
    //     break;
    //   case "application":

    //     break;
    //   // Attention: fallthrough to the next branch for application
    //   case "constant":
    //   case "list-literal":
    //   case "struct-literal":
    //   case "identifier":
    //   case "fn":
    //   case "field-access":
    //   default:
    //     src as never;
    // }
  }

  private compileExprAsJsExpr(src: ir.Expr): t.Expression {
    switch (src.type) {
      case "constant":
        return compileConst(src.value);

      case "application":
        return this.compileApplicationAsExpr(src);

      case "let":
        return this.compileLetAsExpr(src);

      case "identifier":
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
          }
        }

      case "fn":
      case "if":
      case "match":
      case "field-access":
      case "struct-literal":
        throw new Error("TODO implement (expr) : " + src.type);
    }

    // switch (src.type) {
    //   // The following branches rely on statement mode compilation
    //   case "match":
    //   case "if": {
    //     const ident = this.makeFreshIdent();
    //     this.compileExprAsJsStms(src, undefined, {
    //       type: "assign_var",
    //       ident,
    //       declare: true,
    //       dictParams: [],
    //     });
    //     return ident;
    //   }

    //   case "identifier": {
    //     if (src.$resolution === undefined) {
    //       throw new Error("[unreachable] undefined resolution");
    //     }
    //     switch (src.$resolution.type) {
    //       case "constructor":
    //         if (
    //           src.$resolution.declaration.name === "Bool" &&
    //           src.$resolution.namespace === "Bool"
    //         ) {
    //           switch (src.$resolution.variant.name) {
    //             case "True":
    //               return { type: "BooleanLiteral", value: true };
    //             case "False":
    //               return { type: "BooleanLiteral", value: false };
    //             default:
    //               throw new Error("[unreachable] invalid boolean constructor");
    //           }
    //         }
    //         return makeGlobalIdentifier(
    //           src.$resolution.namespace,
    //           src.$resolution.variant.name,
    //         );
    //       case "local-variable": {
    //         const res = this.bindingsJsName.get(src.$resolution.binding);
    //         if (res === undefined) {
    //           throw new Error(
    //             "[unreachable] undefined resolution for: " +
    //               src.$resolution.binding.name,
    //           );
    //         }
    //         return res;
    //       }
    //       case "global-variable": {
    //         let ident: t.Identifier;
    //         if (src.$resolution.declaration.binding.name === "==") {
    //           ident = EQ_IDENTIFIER;
    //         } else {
    //           ident = makeGlobalIdentifier(
    //             src.$resolution.namespace,
    //             src.$resolution.declaration.binding.name,
    //           );
    //         }
    //         // TODO what about let exprs?
    //         const traitArgs = resolvePassedDicts(
    //           src.$resolution.declaration.binding.$type,
    //           src.$type,
    //         );
    //         if (traitArgs.length === 0) {
    //           return ident;
    //         }
    //         return {
    //           type: "CallExpression",
    //           callee: ident,
    //           arguments: traitArgs,
    //         };
    //       }
    //     }
    //   }
    //   case "block": {
    //     for (const stm of src.statements) {
    //       if (stm.type === "let#") {
    //         throw new Error("TODO implement let#");
    //       }
    //       let jsPatternName: string;
    //       if (stm.pattern.type === "identifier") {
    //         jsPatternName = this.getCurrentFrame().registerLocal(
    //           stm.pattern.name,
    //         );
    //       } else {
    //         jsPatternName = this.genFreshId();
    //       }
    //       this.frames.push(
    //         new Frame({
    //           type: "let",
    //           jsPatternName,
    //           binding:
    //             stm.pattern.type === "identifier" ? stm.pattern : undefined,
    //         }),
    //       );
    //       const freshIdent: t.Identifier = {
    //         type: "Identifier",
    //         name: this.makeJsLetPathName(),
    //       };
    //       if (stm.pattern.type === "identifier") {
    //         this.bindingsJsName.set(stm.pattern, freshIdent);
    //       }
    //       const value = this.compileExprAsJsExpr(stm.value, undefined);
    //       this.statementsBuf.push({
    //         type: "VariableDeclaration",
    //         kind: "const",
    //         declarations: [
    //           {
    //             type: "VariableDeclarator",
    //             id: freshIdent,
    //             init: value,
    //           },
    //         ],
    //       });
    //       this.compileCheckPatternConditions(stm.pattern, freshIdent);
    //       this.frames.pop();
    //     }
    //     return this.compileExprAsJsExpr(src.returning, tailPosCaller);
    //     // we could call this.bindingsJsName.delete(src.pattern) here
    //   }
    //   case "fn": {
    //     const callerBinding = (() => {
    //       const curFrame = this.getCurrentFrame();
    //       if (curFrame.data.type !== "let") {
    //         return undefined;
    //       }
    //       return curFrame.data.binding;
    //     })();
    //     const wasTailCall = this.tailCallIdent;
    //     this.tailCallIdent = undefined;
    //     this.frames.push(new Frame({ type: "fn" }));
    //     const cleanup = () => {
    //       this.frames.pop();
    //       this.tailCallIdent = wasTailCall;
    //     };
    //     const [{ params }, stms] = this.wrapStatements(() => {
    //       const params = src.params.map((param): t.Identifier => {
    //         if (param.type === "identifier") {
    //           const name = this.getCurrentFrame().registerLocal(param.name);
    //           const ident: t.Identifier = {
    //             type: "Identifier",
    //             name,
    //           };
    //           this.bindingsJsName.set(param, ident);
    //           return ident;
    //         }
    //         const freshId = this.genFreshId();
    //         const ident: t.Identifier = {
    //           type: "Identifier",
    //           name: freshId,
    //         };
    //         this.compileCheckPatternConditions(param, ident);
    //         return ident;
    //       });
    //       this.compileExprAsJsStms(src.body, callerBinding, {
    //         type: "return",
    //       });
    //       return { params };
    //     });
    //     const bodyStms: t.Expression | t.BlockStatement = (() => {
    //       if (this.tailCallIdent !== undefined) {
    //         return {
    //           type: "BlockStatement",
    //           directives: [],
    //           body: [
    //             {
    //               type: "WhileStatement",
    //               test: { type: "BooleanLiteral", value: true },
    //               body: {
    //                 type: "BlockStatement",
    //                 directives: [],
    //                 body: [
    //                   ...params.map(
    //                     (id, index): t.Statement => ({
    //                       type: "VariableDeclaration",
    //                       kind: "const",
    //                       declarations: [
    //                         {
    //                           type: "VariableDeclarator",
    //                           id,
    //                           init: {
    //                             type: "Identifier",
    //                             name: `GEN_TC__${index}`,
    //                           },
    //                         },
    //                       ],
    //                     }),
    //                   ),
    //                   ...stms,
    //                 ],
    //               },
    //             },
    //           ],
    //         };
    //       }
    //       if (stms.length === 1 && stms[0]!.type === "ReturnStatement") {
    //         return stms[0].argument!;
    //       }
    //       return {
    //         type: "BlockStatement",
    //         directives: [],
    //         body: stms,
    //       };
    //     })();
    //     const params_ =
    //       this.tailCallIdent === undefined
    //         ? params
    //         : params.map(
    //             (_, i): t.Identifier => ({
    //               type: "Identifier",
    //               name: `GEN_TC__${i}`,
    //             }),
    //           );
    //     cleanup();
    //     return {
    //       type: "ArrowFunctionExpression",
    //       async: false,
    //       expression: true,
    //       params: params_,
    //       body: bodyStms,
    //     };
    //   }
    //   case "list-literal":
    //     return src.values.reduceRight<t.Expression>(
    //       (prev, src): t.Expression => {
    //         const compiledExpr = this.compileExprAsJsExpr(src, undefined);
    //         return {
    //           type: "CallExpression",
    //           callee: { type: "Identifier", name: "List$Cons" },
    //           arguments: [compiledExpr, prev],
    //         };
    //       },
    //       { type: "Identifier", name: "List$Nil" },
    //     );
    //   case "struct-literal": {
    //     const resolution = src.struct.$resolution;
    //     if (resolution === undefined) {
    //       throw new Error(
    //         "[unreachable] undefined resolution for struct declaration",
    //       );
    //     }
    //     const properties: t.ObjectProperty[] = [];
    //     let spreadIdentifier: t.Identifier | undefined;
    //     for (const declarationField of resolution.declaration.fields) {
    //       const structLitField = src.fields.find(
    //         (f) => f.field.name === declarationField.name,
    //       );
    //       if (structLitField !== undefined) {
    //         properties.push({
    //           type: "ObjectProperty",
    //           key: { type: "Identifier", name: structLitField.field.name },
    //           value: this.compileExprAsJsExpr(structLitField.value, undefined),
    //           shorthand: true,
    //           computed: false,
    //         });
    //       } else if (src.spread === undefined) {
    //         throw new Error("[unreachable] missing fields");
    //       } else {
    //         if (spreadIdentifier === undefined) {
    //           spreadIdentifier = this.precomputeValue(src.spread);
    //         }
    //         properties.push({
    //           type: "ObjectProperty",
    //           key: { type: "Identifier", name: declarationField.name },
    //           value: {
    //             type: "MemberExpression",
    //             object: spreadIdentifier,
    //             property: { type: "Identifier", name: declarationField.name },
    //             computed: false,
    //           },
    //           shorthand: true,
    //           computed: false,
    //         });
    //       }
    //     }
    //     return { type: "ObjectExpression", properties };
    //   }
    //   case "field-access":
    //     return {
    //       type: "MemberExpression",
    //       object: this.compileExprAsJsExpr(src.struct, undefined),
    //       property: { type: "Identifier", name: src.field.name },
    //       computed: false,
    //     };
    // }
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
        return this.makeBinaryMath("+", src.args);
      case "Int.*":
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
      case "String.++":
        return this.makeBinaryMath("+", src.args);
      case "Bool.!":
        return this.makeUnary("!", src.args);
      case "Bool.&&":
        return this.makeBinaryLogical("&&", src.args);
      case "Bool.||":
        return this.makeBinaryLogical("||", src.args);

      case "Bool.==":
        throw new Error("TODO monomorphic equality");

      default:
        return;
    }
  }

  private compileApplicationAsExpr(
    src: ir.Expr & { type: "application" },
  ): t.Expression {
    const inlined = this.tryCompileIntrinsic(src);
    if (inlined !== undefined) {
      return inlined;
    }

    if (src.caller.type === "identifier") {
      return {
        type: "CallExpression",
        callee: this.compileExprAsJsExpr(src.caller),
        arguments: src.args.map((arg) => this.compileExprAsJsExpr(arg)),
      };
    }

    throw new Error("TODO complex appli");
  }

  private compileLetAsExpr(src: ir.Expr & { type: "let" }): t.Expression {
    const id = compileLocalIdent(src.binding);
    const value = this.compileExprAsJsExpr(src.value);

    this.statementsBuf.push({
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: id,
          init: value,
        },
      ],
    });

    // this.compileCheckPatternConditions(src.pattern, freshIdent);

    return this.compileExprAsJsExpr(src.body);
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

// function toJsInfix(
//   kestrelCaller: string,
// ): t.BinaryExpression["operator"] | undefined {
//   switch (kestrelCaller) {
//     case "+":
//     case "+.":
//     case "++":
//       return "+";

//     case "*":
//     case "*.":
//       return "*";

//     case "-":
//     case "-.":
//       return "-";

//     case "/":
//     case "/.":
//       return "/";

//     case "<=":
//     case "<":
//     case ">=":
//     case ">":
//     case "%":
//       return kestrelCaller;

//     default:
//       return undefined;
//   }
// }

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
  const santizedNs = qualified.namespace.replace(/\//g, "$");
  return `${santizedNs}$${qualified.name}`;
}
