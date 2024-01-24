import { ConstLiteral, Expr, Program } from "./ast";
import { TypeMeta } from "./typecheck/typecheck";

const UNREACHABLE = "<UNREACHABLE>";

type CompileExprResult = {
  return: string;
  statements: string[];
};

type Scope = Record<string, string>;

const IDENT_CHAR = "  ";

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
          throw new Error(`[unreachable] undefined identifier (${expr.name})`);
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

          const fnBody = indentBlock(identationLevel, [
            ...ret.statements,
            `return ${ret.return};`,
          ]);

          this.scope = backupScope;
          return {
            statements: [`function ${name}(${params}) {`, ...fnBody, `}`],
            return: UNREACHABLE,
          };
        }

        throw new Error("[TODO] handle fns that are not top level");
      }

      case "if": {
        const tempIdent = this.getUniqueId();
        const condition = this.compileExpr(expr.condition, scope);

        const thenBlock = this.compileExpr(expr.then, scope);
        const elseBlock = this.compileExpr(expr.else, scope);

        const identationLevel = 1;

        return {
          statements: [
            `let ${tempIdent};`,
            `if ${condition.return} {`,
            ...indentBlock(identationLevel, [
              ...thenBlock.statements,
              `${tempIdent} = ${thenBlock.return};`,
            ]),
            `} else {`,
            ...indentBlock(identationLevel, [
              ...elseBlock.statements,
              `${tempIdent} = ${elseBlock.return};`,
            ]),
            `}`,
          ],
          return: tempIdent,
        };
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
      const compiledValue = this.compileExpr(decl.value, scope);

      const expr =
        decl.value.type === "fn"
          ? ""
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
