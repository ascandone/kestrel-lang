import { ConstLiteral, Expr, MatchExpr, Program, TypeVariant } from "./ast";
import { TypeMeta } from "./typecheck/typecheck";

type CompileExprResult = [statements: string[], expr: string];

type Scope = Record<string, string>;

const IDENT_CHAR = "  ";

type CompilationMode =
  | { type: "assign_var"; name: string; declare: boolean }
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

  getUniqueName(ns?: string) {
    const namespace = ns === undefined ? "" : `${ns}$`;
    return `${namespace}GEN__${this.nextId++}`;
  }
}

export class Compiler {
  private frames: Frame[] = [];

  private getUniqueName() {
    return this.getCurrentFrame().getUniqueName(this.getBlockNs());
  }

  private globalScope: Scope = {
    True: "true",
    False: "false",
    Nil: "null",
  };

  private getBlockNs(): string | undefined {
    const ns: string[] = [];
    for (let i = this.frames.length - 1; i >= 0; i--) {
      const frame = this.frames[i]!;

      if (frame.data.type === "fn") {
        break;
      }

      ns.push(frame.data.name);
    }

    if (ns.length === 0) {
      return undefined;
    }

    ns.reverse();
    return ns.join("$");
  }

  private getCurrentFrame(): Frame {
    const currentFrame = this.frames.at(-1);
    if (currentFrame === undefined) {
      throw new Error("[unreachable] empty frames stack");
    }
    return currentFrame;
  }

  private compileLetValue(
    src: Expr<TypeMeta> & { type: "let" },
    scope: Scope,
  ): { value: string[]; scopedBinding: string } {
    const name = this.getCurrentFrame().preventShadow(src.binding.name);
    this.frames.push(new Frame({ type: "let", name }));
    const scopedBinding = this.getBlockNs();
    if (scopedBinding === undefined) {
      throw new Error("[unreachable] empty ns stack");
    }

    const value = this.compileAsStatements(
      src.value,
      { type: "assign_var", name: scopedBinding, declare: true },
      scope,
    );
    this.frames.pop();
    return { value, scopedBinding };
  }

  private compileAsExpr(src: Expr<TypeMeta>, scope: Scope): CompileExprResult {
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
        const infix = getInfixPrecAndName(src);
        if (infix !== undefined) {
          const [l, r] = src.args;
          const [lStatements, lExpr] = this.compileAsExpr(l!, scope);
          const [rStatements, rExpr] = this.compileAsExpr(r!, scope);

          const infixLeft = getInfixPrecAndName(l!);
          const lCWithParens =
            (infixLeft?.prec ?? Infinity) < infix.prec ? `(${lExpr})` : lExpr;

          return [
            [...lStatements, ...rStatements],
            `${lCWithParens} ${infix.jsName} ${rExpr}`,
          ];
        }

        const [callerStatemens, callerExpr] = this.compileAsExpr(
          src.caller,
          scope,
        );

        const statements: string[] = [...callerStatemens];
        const args: string[] = [];
        for (const arg of src.args) {
          const [argStatements, argExpr] = this.compileAsExpr(arg, scope);
          args.push(argExpr);
          statements.push(...argStatements);
        }
        return [statements, `${callerExpr}(${args.join(", ")})`];
      }

      case "let": {
        const { value, scopedBinding } = this.compileLetValue(src, scope);
        const [bodyStatements, bodyExpr] = this.compileAsExpr(src.body, {
          ...scope,
          [src.binding.name]: scopedBinding,
        });
        return [[...value, ...bodyStatements], bodyExpr];
      }

      case "fn":
      case "if":
      case "match": {
        const name = this.getUniqueName();
        const statements = this.compileAsStatements(
          src,
          { type: "assign_var", name, declare: true },
          scope,
        );
        return [statements, name];
      }
    }
  }

  private compileAsStatements(
    src: Expr<TypeMeta>,
    as: CompilationMode,
    scope: Scope,
  ): string[] {
    switch (src.type) {
      case "application":
      case "identifier":
      case "constant": {
        const [statements, expr] = this.compileAsExpr(src, scope);
        return [...statements, wrapJsExpr(expr, as)];
      }

      case "let": {
        const { value, scopedBinding } = this.compileLetValue(src, scope);
        const bodyStatements = this.compileAsStatements(src.body, as, {
          ...scope,
          [src.binding.name]: scopedBinding,
        });
        return [...value, ...bodyStatements];
      }

      case "fn": {
        if (as.type === "assign_var" && !as.declare) {
          throw new Error("TODO anonymous function");
        }

        const name = as.type === "return" ? this.getUniqueName() : as.name;

        this.frames.push(new Frame({ type: "fn" }));

        const params = src.params.map((p) => p.name).join(", ");
        const paramsScope = Object.fromEntries(
          src.params.map((p) => [p.name, p.name]),
        );

        const fnBody = this.compileAsStatements(
          src.body,
          { type: "return" },
          {
            ...scope,
            ...paramsScope,
          },
        );

        this.frames.pop();

        return [
          //
          `function ${name}(${params}) {`,
          ...indentBlock(fnBody),
          `}`,
          ...(as.type === "return" ? [wrapJsExpr(name, as)] : []),
        ];
      }

      case "if": {
        const [conditionStatements, conditionExpr] = this.compileAsExpr(
          src.condition,
          scope,
        );

        const thenBlock = this.compileAsStatements(
          src.then,
          doNotDeclare(as),
          scope,
        );

        const elseBlock = this.compileAsStatements(
          src.else,
          doNotDeclare(as),
          scope,
        );

        return [
          ...conditionStatements,
          ...declarationStatements(as),
          `if (${conditionExpr}) {`,
          ...indentBlock(thenBlock),
          `} else {`,
          ...indentBlock(elseBlock),
          `}`,
        ];
      }

      case "match": {
        const matched = this.getUniqueName();
        const statements = this.compileAsStatements(
          src.expr,
          { type: "assign_var", name: matched, declare: true },
          scope,
        );

        const compiledMatchExpr: string[] = [
          ...statements,
          ...declarationStatements(as),
        ];

        let first = true;
        for (const [pattern, ret] of src.clauses) {
          const compiled = compilePattern(matched, pattern);

          const retStatements = this.compileAsStatements(
            ret,
            doNotDeclare(as),
            {
              ...scope,
              ...compiled.newScope,
            },
          );

          const condition =
            compiled.conditions.length === 0
              ? "true"
              : compiled.conditions.join(" && ");

          compiledMatchExpr.push(
            first ? `if (${condition}) {` : `} else if (${condition}) {`,
            ...indentBlock(retStatements),
          );
          first = false;
        }

        compiledMatchExpr.push(
          `} else {`,
          ...indentBlock([`throw new Error("[non exhaustive match]")`]),
          `}`,
        );

        return compiledMatchExpr;
      }
    }
  }

  compile(src: Program<TypeMeta>): string {
    const decls: string[] = [];
    for (const typeDecl of src.typeDeclarations) {
      if (typeDecl.type === "extern") {
        continue;
      }

      for (const variant of typeDecl.variants) {
        const def = getVariantImpl(variant);
        decls.push(def);
        this.globalScope[variant.name] = variant.name;
      }
    }

    for (const decl of src.declarations) {
      if (decl.extern) {
        // skip the infix operators
        // as they are already handled by the compiler
        if (!isInfix(decl.binding.name)) {
          this.globalScope[decl.binding.name] = decl.binding.name;
        }

        continue;
      }

      this.frames.push(new Frame({ type: "let", name: decl.binding.name }));

      const statements = this.compileAsStatements(
        decl.value,
        { type: "assign_var", name: decl.binding.name, declare: true },
        {
          ...this.globalScope,
          [decl.binding.name]: decl.binding.name,
        },
      );

      decls.push(...statements, "");
      this.globalScope[decl.binding.name] = decl.binding.name;
      this.frames.pop();
    }

    return decls.join("\n");
  }
}

type CompiledPatternResult = {
  conditions: string[];
  newScope: Scope;
};

function compilePattern(
  matchSubject: string,
  pattern: MatchExpr,
): CompiledPatternResult {
  // TODO move static?

  switch (pattern.type) {
    case "ident":
      return {
        conditions: [],
        newScope: { [pattern.ident]: matchSubject },
      };
    case "constructor": {
      const conditions: string[] = [matchCondition(matchSubject, pattern.name)];
      let newScope: Scope = {};

      let i = 0;
      for (const nested of pattern.args) {
        const index = i++;
        const compiled = compilePattern(`${matchSubject}.a${index}`, nested);
        conditions.push(...compiled.conditions);
        newScope = { ...newScope, ...compiled.newScope };
      }

      return { conditions, newScope };
    }
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

const mapToJsInfix: Record<string, string> = {
  "<>": "+",
  "+.": "+",
  "-.": "-",
  "*.": "*",
  "/.": "/",
  "^": "**",
};

// left-to-right operators
const infixPrecTable: Record<string, number> = {
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
  // TODO this is right associative
  // compilation might be wrong
  "**": 13,
};

// TODO fix compilation
const prefixPrecTable: Record<string, number> = {
  "!": 14,
};

function isInfix(name: string) {
  return (
    name in infixPrecTable || name in prefixPrecTable || name in mapToJsInfix
  );
}

function getInfixPrecAndName(
  expr: Expr<unknown>,
): { prec: number; jsName: string } | undefined {
  if (expr.type !== "application" || expr.caller.type !== "identifier") {
    return;
  }
  return getInfixPrecAndNameByOp(expr.caller.name);
}

function getInfixPrecAndNameByOp(
  op: string,
): { prec: number; jsName: string } | undefined {
  const lookup = infixPrecTable[op];
  if (lookup !== undefined) {
    return {
      prec: lookup,
      jsName: op,
    };
  }

  const mapped = mapToJsInfix[op];
  if (mapped === undefined) {
    return undefined;
  }

  return getInfixPrecAndNameByOp(mapped);
}

function indentBlock(lines: string[]): string[] {
  return lines.map((line) => `${IDENT_CHAR}${line}`);
}

function getVariantImpl({ name, args }: TypeVariant): string {
  if (args.length === 0) {
    return `const ${name} = { type: "${name}" };
`;
  } else {
    const argsList = args.map((_t, i) => `a${i}`).join(", ");
    return `function ${name}(${argsList}) {
  return { type: "${name}", ${argsList} };
}`;
  }
}

function matchCondition(matchingIdent: string, patternName: string): string {
  switch (patternName) {
    case "True":
      return `${matchingIdent}`;

    case "False":
      return `!${matchingIdent}`;

    case "Nil":
      return "true";

    default:
      return `${matchingIdent}.type === "${patternName}"`;
  }
}

function doNotDeclare(as: CompilationMode): CompilationMode {
  return as.type === "assign_var" ? { ...as, declare: false } : as;
}

function declarationStatements(as: CompilationMode): string[] {
  return as.type === "assign_var" && as.declare ? [`let ${as.name};`] : [];
}

function wrapJsExpr(expr: string, as: CompilationMode) {
  switch (as.type) {
    case "assign_var": {
      const constModifier = as.declare ? "const " : "";
      return `${constModifier}${as.name} = ${expr};`;
    }

    case "return":
      return `return ${expr};`;
  }
}
