import { ConstLiteral, Declaration, Expr, Program } from "./ast";
import { TypeMeta } from "./typecheck/typecheck";

class Compiler {
  compileExpr(expr: Expr<TypeMeta>): string {
    switch (expr.type) {
      case "constant":
        return constToString(expr.value);

      case "application": {
        infixAppl: if (expr.caller.type === "identifier") {
          const prec = precTable[expr.caller.name];
          if (prec === undefined) {
            break infixAppl;
          }

          const [l, r] = expr.args;
          const lC = this.compileExpr(l!);
          const rC = this.compileExpr(r!);

          const precLeft = getInfixPrec(l!) ?? Infinity;
          const lCWithParens = precLeft < prec ? `(${lC})` : lC;
          return `${lCWithParens} ${expr.caller.name} ${rC}`;
        }

        if (expr.caller.type === "identifier") {
          const args = expr.args.map((arg) => this.compileExpr(arg)).join(", ");
          return `${expr.caller.name}(${args})`;
        }

        throw new Error("TODO handle: " + expr.type);
      }

      case "identifier":
        return expr.name;

      case "fn":
      case "let":
      case "if":
      case "match":
      default:
        throw new Error("TODO handle: " + expr.type);
    }
  }

  compileDecl(decl: Declaration<TypeMeta>): string {
    return `const ${decl.binding.name} = ${this.compileExpr(decl.value)};`;
  }

  compile(src: Program<TypeMeta>): string {
    const decls: string[] = [];
    for (const decl of src.declarations) {
      const cDecl = this.compileDecl(decl);
      decls.push(cDecl);
    }
    return decls.join("\n\n");
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
