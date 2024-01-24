import { ConstLiteral, Expr, Program } from "./ast";
import { TypeMeta } from "./typecheck/typecheck";

type CompileExprResult = {
  return: string;
  statements: string[];
};

type Scope = Record<string, string>;

const IDENT_CHAR = "  ";

class Compiler {
  scope: string[] = [];
  enterScope(ns: string) {
    this.scope.push(ns);
  }
  exitScope() {
    this.scope.pop();
  }
  scopedVar(name: string) {
    return [...this.scope, name].join("$");
  }

  compileExpr(expr: Expr<TypeMeta>, scope: Scope): CompileExprResult {
    switch (expr.type) {
      case "constant":
        return {
          statements: [],
          return: constToString(expr.value),
        };

      case "application": {
        if (
          expr.caller.type === "identifier" &&
          expr.caller.name in precTable
        ) {
          const prec = precTable[expr.caller.name]!;
          const [l, r] = expr.args;
          const lC = this.compileExpr(l!, scope);
          const rC = this.compileExpr(r!, scope);

          if (lC.statements.length !== 0 || rC.statements.length !== 0) {
            throw new Error(
              "[TODO] complex values of infix expressions are not handled yet",
            );
          }

          const precLeft = getInfixPrec(l!) ?? Infinity;
          const lCWithParens = precLeft < prec ? `(${lC.return})` : lC.return;
          return {
            statements: [],
            return: `${lCWithParens} ${expr.caller.name} ${rC.return}`,
          };
        }

        if (expr.caller.type !== "identifier") {
          throw new Error(
            `[TODO] ${expr.type} as a caller is not supported yet`,
          );
        }

        const caller = this.compileExpr(expr.caller, scope);
        if (caller.statements.length !== 0) {
          throw new Error("[TODO] complex caller not handled yet");
        }

        const argsC = expr.args.map((arg) => this.compileExpr(arg, scope));
        const args = argsC.map((a) => a.return).join(", ");
        return {
          statements: argsC.flatMap((a) => a.statements),
          return: `${caller.return}(${args})`,
        };
      }

      case "identifier":
        const lookup = scope[expr.name];
        if (lookup === undefined) {
          throw new Error("[unreachable] undefined identifier");
        }
        return {
          statements: [],
          return: lookup,
        };

      case "let": {
        const scopedBinding = this.scopedVar(expr.binding.name);

        this.enterScope(expr.binding.name);
        const valueC = this.compileExpr(expr.value, scope);
        this.exitScope();

        const bodyC = this.compileExpr(expr.body, {
          ...scope,
          [expr.binding.name]: scopedBinding,
        });

        return {
          statements: [
            ...valueC.statements,
            `const ${scopedBinding} = ${valueC.return};`,
            ...bodyC.statements,
          ],
          return: bodyC.return,
        };
      }

      case "fn": {
        const backupScope = this.scope;
        const isTopLevel = this.scope.length === 1;
        const [name] = this.scope;

        this.scope = [];
        if (isTopLevel) {
          const params = expr.params.map((p) => p.name).join(", ");

          const paramsScope = Object.fromEntries(
            expr.params.map((p) => [p.name, p.name]),
          );

          // TODO outer scope
          const ret = this.compileExpr(expr.body, {
            ...paramsScope,
          });

          const identationLevel = 1;
          const indentation = Array.from(
            { length: identationLevel },
            () => IDENT_CHAR,
          );

          const fnBody = [...ret.statements, `return ${ret.return};`]
            .map((st) => {
              return `${indentation}${st}`;
            })
            .join("\n");

          return {
            statements: [],
            return: `function ${name}(${params}) {
${fnBody}
}`,
          };
        }

        this.scope = backupScope;
      }

      case "if":
      case "match":
        throw new Error("TODO handle: " + expr.type);
    }
  }

  compile(src: Program<TypeMeta>): string {
    const scope: Scope = {};
    const decls: string[] = [];
    for (const decl of src.declarations) {
      this.enterScope(decl.binding.name);
      const compiledValue = this.compileExpr(decl.value, scope);

      const expr =
        decl.value.type === "fn"
          ? compiledValue.return
          : `const ${decl.binding.name} = ${compiledValue.return};\n`;

      decls.push(...compiledValue.statements, expr);
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
  "+": 11,
  "*": 12,
};

function getInfixPrec(expr: Expr<unknown>): number | undefined {
  if (expr.type !== "application" || expr.caller.type !== "identifier") {
    return;
  }

  return precTable[expr.caller.name];
}
