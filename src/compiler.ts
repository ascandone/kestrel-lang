import { ConstLiteral, Expr, Program } from "./ast";
import { TypeMeta } from "./typecheck/typecheck";

const UNREACHABLE = "<UNREACHABLE>";

type CompileExprResult = {
  return: string;
  statements: string[];
};

type Scope = Record<string, string>;

const IDENT_CHAR = "  ";

type Action =
  | { type: "declare_var"; name: string }
  | { type: "return" }
  | { type: "expr" };

function wrapExpr(e: string, action: Action, statements: string[] = []) {
  switch (action.type) {
    case "declare_var":
      return {
        statements: [...statements, `const ${action.name} = ${e};`],
        return: UNREACHABLE,
      };

    case "return":
      return {
        statements: [...statements, `return ${e};`],
        return: UNREACHABLE,
      };

    case "expr":
      return {
        statements,
        return: e,
      };
  }
}

class Compiler {
  private genId = 0;
  private getUniqueId() {
    return `$temp__${this.genId++}`;
  }
  private scope: string[] = [];
  private enterScope(ns: string) {
    this.scope.push(ns);
  }
  private exitScope() {
    this.scope.pop();
  }
  private scopedVar(name: string) {
    return [...this.scope, name].join("$");
  }

  private caller() {
    return [...this.scope].join("$");
  }

  compileExpr(
    expr: Expr<TypeMeta>,
    action: Action,
    scope: Scope,
  ): CompileExprResult {
    switch (expr.type) {
      case "constant": {
        const s = constToString(expr.value);
        return wrapExpr(s, action);
      }

      case "application": {
        if (
          expr.caller.type === "identifier" &&
          expr.caller.name in precTable
        ) {
          const prec = precTable[expr.caller.name]!;
          const [l, r] = expr.args;
          const lC = this.compileExpr(l!, { type: "expr" }, scope);
          const rC = this.compileExpr(r!, { type: "expr" }, scope);

          if (lC.statements.length !== 0 || rC.statements.length !== 0) {
            throw new Error(
              "[TODO] complex values of infix expressions are not handled yet",
            );
          }

          const precLeft = getInfixPrec(l!) ?? Infinity;
          const lCWithParens = precLeft < prec ? `(${lC.return})` : lC.return;

          return wrapExpr(
            `${lCWithParens} ${expr.caller.name} ${rC.return}`,
            action,
          );
        }

        if (expr.caller.type !== "identifier") {
          throw new Error(
            `[TODO] ${expr.type} as a caller is not supported yet`,
          );
        }

        const caller = this.compileExpr(expr.caller, { type: "expr" }, scope);
        if (caller.statements.length !== 0) {
          throw new Error("[TODO] complex caller not handled yet");
        }

        const argsC = expr.args.map((arg) =>
          this.compileExpr(arg, { type: "expr" }, scope),
        );
        const args = argsC.map((a) => a.return).join(", ");
        return wrapExpr(
          `${caller.return}(${args})`,
          action,
          argsC.flatMap((a) => a.statements),
        );
      }

      case "identifier":
        const lookup = scope[expr.name];
        if (lookup === undefined) {
          throw new Error(`[unreachable] undefined identifier (${expr.name})`);
        }
        return wrapExpr(lookup, action);

      case "let": {
        const scopedBinding = this.scopedVar(expr.binding.name);

        this.enterScope(expr.binding.name);
        const valueC = this.compileExpr(
          expr.value,
          { type: "declare_var", name: scopedBinding },
          scope,
        );
        this.exitScope();

        const bodyC = this.compileExpr(expr.body, action, {
          ...scope,
          [expr.binding.name]: scopedBinding,
        });

        return {
          statements: [...valueC.statements, ...bodyC.statements],
          return: scopedBinding,
        };
      }

      case "fn": {
        const backupScope = this.scope;
        const name = this.caller();
        this.scope = [];

        const params = expr.params.map((p) => p.name).join(", ");
        const paramsScope = Object.fromEntries(
          expr.params.map((p) => [p.name, p.name]),
        );

        // TODO outer scope
        const ret = this.compileExpr(
          expr.body,
          { type: "return" },
          {
            ...paramsScope,
          },
        );

        const identationLevel = 1;
        const fnBody = indentBlock(identationLevel, [...ret.statements]);

        this.scope = backupScope;
        return {
          statements: [`function ${name}(${params}) {`, ...fnBody, `}`],
          return: "",
        };
      }

      case "if": {
        const identationLevel = 1;

        const condition = this.compileExpr(
          expr.condition,
          { type: "expr" },
          scope,
        );

        switch (action.type) {
          case "expr": {
            const tempIdent = this.getUniqueId();
            throw new Error("[TODO] not yet supported: expr if");
          }

          case "return": {
            const thenBlock = this.compileExpr(
              expr.then,
              { type: "return" },
              scope,
            );

            const elseBlock = this.compileExpr(
              expr.else,
              { type: "return" },
              scope,
            );

            return {
              statements: [
                `if (${condition.return}) {`,
                ...indentBlock(identationLevel, thenBlock.statements),
                `} else {`,
                ...indentBlock(identationLevel, elseBlock.statements),
                `}`,
              ],
              return: "",
            };
          }

          case "declare_var": {
            const thenBlock = this.compileExpr(
              expr.then,
              { type: "expr" },
              scope,
            );
            const elseBlock = this.compileExpr(
              expr.else,
              { type: "expr" },
              scope,
            );

            return {
              statements: [
                `let ${action.name};`,
                `if (${condition.return}) {`,
                ...indentBlock(identationLevel, [
                  ...thenBlock.statements,
                  `${action.name} = ${thenBlock.return};`,
                ]),
                `} else {`,
                ...indentBlock(identationLevel, [
                  ...elseBlock.statements,
                  `${action.name} = ${elseBlock.return};`,
                ]),
                `}`,
              ],
              return: "",
            };
          }
        }
      }

      case "match":
        throw new Error("TODO handle: " + expr.type);
    }
  }

  compile(src: Program<TypeMeta>): string {
    const scope: Scope = {};
    const decls: string[] = [];
    for (const decl of src.declarations) {
      this.enterScope(decl.binding.name);
      const compiledValue = this.compileExpr(
        decl.value,
        { type: "declare_var", name: decl.binding.name },
        scope,
      );

      decls.push(...compiledValue.statements, "");
      scope[decl.binding.name] = decl.binding.name;
      this.exitScope();
    }

    return decls.join("\n");
  }
}

export function compile(ast: Program<TypeMeta>): string {
  return new Compiler().compile(ast);
}

function constToString(k: ConstLiteral): string {
  switch (k.type) {
    case "int":
    case "float":
      return k.value.toString();
    case "string":
      return `"${k.value}"`;
  }
}

// left-to-right operators
const precTable: Record<string, number> = {
  "||": 3,
  "&&": 4,
  "==": 8,
  "!=": 8,
  "<": 10,
  "<=": 10,
  ">": 10,
  ">=": 10,
  "+": 11,
  "-": 11,
  "*": 12,
  "/": 12,
  "%": 12,
};

function getInfixPrec(expr: Expr<unknown>): number | undefined {
  if (expr.type !== "application" || expr.caller.type !== "identifier") {
    return;
  }

  return precTable[expr.caller.name];
}

function makeIndentation(level: number): string {
  return Array.from({ length: level }, () => IDENT_CHAR).join("");
}

function indent(level: number, s: string): string {
  const ident = Array.from({ length: level }, () => IDENT_CHAR);
  ident.push(s);
  return ident.join("");
}

function indentBlock(level: number, lines: string[]): string[] {
  return lines.map((line) => indent(level, line));
}
