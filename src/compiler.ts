import { ConstLiteral, Expr, Program } from "./ast";
import { TypeMeta } from "./typecheck/typecheck";

type CompileExprResult = [statements: string[], expr: string];

type Scope = Record<string, string>;

const IDENT_CHAR = "  ";

type CompilationMode =
  | { type: "declare_var"; name: string }
  | { type: "return" };

class Frame {
  constructor(
    public readonly data: { type: "let"; name: string } | { type: "fn" },
  ) {}

  private usedVars = new Map<string, number>();

  preventShadow(name: string): string {
    const timesUsed = this.usedVars.get(name);
    if (timesUsed === undefined) {
      this.usedVars.set(name, 1);
      return name;
    }
    this.usedVars.set(name, timesUsed + 1);
    return `${name}$${timesUsed}`;
  }

  private nextId = 0;
  getUniqueName(ns: string) {
    return `${ns}$GEN__${this.nextId++}`;
  }
}

class Compiler {
  private frames: Frame[] = [];

  private getBlockNs(): string {
    let ns: string[] = [];
    for (let i = this.frames.length - 1; i >= 0; i--) {
      const frame = this.frames[i]!;

      if (frame.data.type === "fn") {
        break;
      }

      ns.push(frame.data.name);
    }

    ns.reverse();
    return ns.join("$");
  }

  compileAsExpr(
    src: Expr<TypeMeta>,
    as: CompilationMode,
    scope: Scope,
  ): CompileExprResult {
    switch (src.type) {
      case "constant":
        return [[], constToString(src.value)];

      case "identifier": {
        const lookup = scope[src.name];
        if (lookup === undefined) {
          throw new Error(`[unreachable] undefined identifier (${src.name})`);
        }
        return [[], lookup];
      }

      case "application": {
        if (src.caller.type === "identifier" && src.caller.name in precTable) {
          const prec = precTable[src.caller.name]!;
          const [l, r] = src.args;
          const [lStatements, lExpr] = this.compileAsExpr(l!, as, scope);
          const [rStatements, rExpr] = this.compileAsExpr(r!, as, scope);

          if (lStatements.length !== 0 || rStatements.length !== 0) {
            throw new Error(
              "[TODO] complex values of infix expressions are not handled yet",
            );
          }

          const precLeft = getInfixPrec(l!) ?? Infinity;
          const lCWithParens = precLeft < prec ? `(${lExpr})` : lExpr;

          return [[], `${lCWithParens} ${src.caller.name} ${rExpr}`];
        }

        if (src.caller.type !== "identifier") {
          throw new Error(
            `[TODO] ${src.type} as a caller is not supported yet`,
          );
        }

        const [callerStatemens, callerExpr] = this.compileAsExpr(
          src.caller,
          as,
          scope,
        );
        if (callerStatemens.length !== 0) {
          throw new Error("[TODO] complex caller not handled yet");
        }

        const statements: string[] = [];
        const args: string[] = [];
        for (const arg of src.args) {
          const [argStatements, argExpr] = this.compileAsExpr(arg, as, scope);
          args.push(argExpr);
          statements.push(...argStatements);
        }
        return [statements, `${callerExpr}(${args.join(", ")})`];
      }

      case "let": {
        const currentFrame = this.frames.at(-1);
        if (currentFrame === undefined) {
          throw new Error("[unreachable] empty frames stack");
        }

        const name = currentFrame.preventShadow(src.binding.name);

        this.frames.push(new Frame({ type: "let", name }));
        const scopedBinding = this.getBlockNs();
        const valueC = this.compileAsStatements(
          src.value,
          { type: "declare_var", name: scopedBinding },
          scope,
        );
        this.frames.pop();

        const [bodyStatements, bodyExpr] = this.compileAsExpr(src.body, as, {
          ...scope,
          [src.binding.name]: scopedBinding,
        });

        return [[...valueC, ...bodyStatements], bodyExpr];
      }

      case "fn":
        const currentFrame = this.frames.at(-1);
        if (currentFrame === undefined) {
          throw new Error("[unreachable] empty frames stack");
        }

        const name = currentFrame.getUniqueName(this.getBlockNs());
        const statements = this.compileFn(name, src);
        return [statements, name];

      case "if":
      case "match":
      default:
        throw new Error("TODO not hanlding: " + src.type);
    }
  }

  compileAsStatements(
    src: Expr<TypeMeta>,
    as: CompilationMode,
    scope: Scope,
  ): string[] {
    switch (src.type) {
      case "application":
      case "identifier":
      case "let":
      case "constant": {
        const [statements, expr] = this.compileAsExpr(src, as, scope);
        switch (as.type) {
          case "declare_var":
            return [...statements, `const ${as.name} = ${expr};`];

          case "return":
            return [...statements, `return ${expr};`];
        }
      }

      case "fn": {
        const name = this.getBlockNs();
        return this.compileFn(name, src);
      }

      case "if": {
        const identationLevel = 1;

        const [conditionStatements, conditionExpr] = this.compileAsExpr(
          src.condition,
          as,
          scope,
        );

        switch (as.type) {
          case "return": {
            const thenBlock = this.compileAsStatements(
              src.then,
              { type: "return" },
              scope,
            );

            const elseBlock = this.compileAsStatements(
              src.else,
              { type: "return" },
              scope,
            );

            return [
              ...conditionStatements,
              `if (${conditionExpr}) {`,
              ...indentBlock(identationLevel, thenBlock),
              `} else {`,
              ...indentBlock(identationLevel, elseBlock),
              `}`,
            ];
          }

          case "declare_var": {
            const [thenStatements, thenExpr] = this.compileAsExpr(
              src.then,
              as,
              scope,
            );
            const [elseStatements, elseExpr] = this.compileAsExpr(
              src.else,
              as,
              scope,
            );

            return [
              ...conditionStatements,
              `let ${as.name};`,
              `if (${conditionExpr}) {`,
              ...indentBlock(identationLevel, [
                ...thenStatements,
                `${as.name} = ${thenExpr};`,
              ]),
              `} else {`,
              ...indentBlock(identationLevel, [
                ...elseStatements,
                `${as.name} = ${elseExpr};`,
              ]),
              `}`,
            ];
          }
        }
      }

      case "match":
        throw new Error("TODO handle: " + src.type);
    }
  }

  private compileFn(
    name: string,
    src: Expr<TypeMeta> & { type: "fn" },
  ): string[] {
    this.frames.push(new Frame({ type: "fn" }));

    const params = src.params.map((p) => p.name).join(", ");
    const paramsScope = Object.fromEntries(
      src.params.map((p) => [p.name, p.name]),
    );

    // TODO outer scope
    const ret = this.compileAsStatements(
      src.body,
      { type: "return" },
      {
        ...paramsScope,
      },
    );

    const identationLevel = 1;
    const fnBody = indentBlock(identationLevel, ret);

    this.frames.pop();
    return [`function ${name}(${params}) {`, ...fnBody, `}`];
  }

  compile(src: Program<TypeMeta>): string {
    const scope: Scope = {};
    const decls: string[] = [];
    for (const decl of src.declarations) {
      this.frames.push(new Frame({ type: "let", name: decl.binding.name }));

      const statements = this.compileAsStatements(
        decl.value,
        { type: "declare_var", name: decl.binding.name },
        scope,
      );

      decls.push(...statements, "");
      scope[decl.binding.name] = decl.binding.name;
      this.frames.pop();
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

function indent(level: number, s: string): string {
  const ident = Array.from({ length: level }, () => IDENT_CHAR);
  ident.push(s);
  return ident.join("");
}

function indentBlock(level: number, lines: string[]): string[] {
  return lines.map((line) => indent(level, line));
}
