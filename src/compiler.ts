import { ConstLiteral, Declaration, Expr, Program } from "./ast";
import { TypeMeta } from "./typecheck/typecheck";

type CompileExprResult = {
  return: string;
  statements: string[];
};

type Scope = Record<string, string>;

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
        infixAppl: if (expr.caller.type === "identifier") {
          const prec = precTable[expr.caller.name];
          if (prec === undefined) {
            break infixAppl;
          }

          const [l, r] = expr.args;
          const lC = this.compileExpr(l!, scope).return;
          const rC = this.compileExpr(r!, scope).return;

          const precLeft = getInfixPrec(l!) ?? Infinity;
          const lCWithParens = precLeft < prec ? `(${lC})` : lC;
          return {
            statements: [],
            return: `${lCWithParens} ${expr.caller.name} ${rC}`,
          };
        }

        if (expr.caller.type === "identifier") {
          const args = expr.args
            .map((arg) => this.compileExpr(arg, scope).return)
            .join(", ");
          return {
            statements: [],
            return: `${expr.caller.name}(${args})`,
          };
        }

        throw new Error("TODO handle: " + expr.type);
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

      case "fn":
      case "if":
      case "match":
      default:
        throw new Error("TODO handle: " + expr.type);
    }
  }

  compile(src: Program<TypeMeta>): string {
    const scope: Scope = {};
    const decls: string[] = [];
    for (const decl of src.declarations) {
      this.enterScope(decl.binding.name);
      const compiledValue = this.compileExpr(decl.value, scope);

      decls.push(
        ...compiledValue.statements,
        `const ${decl.binding.name} = ${compiledValue.return};\n`,
      );
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
