import { exit } from "process";
import { ConstLiteral, MatchPattern, TypeVariant } from "../parser";
import { TypedExpr, TypedModule } from "../typecheck";
import { ConcreteType } from "../typecheck/type";
import { col } from "../utils/colors";

const builtinValues: Scope = {
  True: "true",
  False: "false",
  Unit: "null",
};

type CompileExprResult = [statements: string[], expr: string];

type Scope = Record<string, string>;

type CompilationMode =
  | { type: "assign_var"; name: string; declare: boolean }
  | { type: "return" };

class Frame {
  constructor(
    public readonly data: { type: "let"; name: string } | { type: "fn" },
    private compiler: Compiler,
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

  getUniqueName(ns?: string) {
    const namespace = ns === undefined ? "" : `${ns}$`;
    return `${namespace}GEN__${this.compiler.getNextId()}`;
  }
}

type TailPositionData = {
  ident: string;
};

function isStructuralEq(caller: TypedExpr, args: TypedExpr[]): boolean {
  if (caller.type !== "identifier" || caller.name !== "==") {
    return false;
  }

  const resolvedType = args[0]!.$.resolve();

  if (resolvedType.type === "unbound") {
    return true;
  }

  if (resolvedType.value.type === "fn") {
    return false;
  }

  if (
    resolvedType.value.name === "Int" &&
    resolvedType.value.moduleName === "Basics"
  ) {
    return false;
  }

  if (
    resolvedType.value.name === "Float" &&
    resolvedType.value.moduleName === "Basics"
  ) {
    return false;
  }

  if (
    resolvedType.value.name === "String" &&
    resolvedType.value.moduleName === "String"
  ) {
    return false;
  }

  return true;
}
export class Compiler {
  private frames: Frame[] = [];
  private tailCall = false;

  private nextId = 0;
  getNextId() {
    return this.nextId++;
  }

  private getUniqueName() {
    return this.getCurrentFrame().getUniqueName(this.getBlockNs());
  }

  private globalScope: Scope = {};

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
    src: TypedExpr & { type: "let" },
    scope: Scope,
  ): { value: string[]; scopedBinding: string } {
    const name = this.getCurrentFrame().preventShadow(src.binding.name);
    this.frames.push(new Frame({ type: "let", name }, this));
    const scopedBinding = this.getBlockNs();
    if (scopedBinding === undefined) {
      throw new Error("[unreachable] empty ns stack");
    }

    const updatedScope =
      src.value.type === "fn"
        ? { ...scope, [src.binding.name]: scopedBinding }
        : scope;

    const value = this.compileAsStatements(
      src.value,
      { type: "assign_var", name: scopedBinding, declare: true },
      updatedScope,
      undefined,
    );
    this.frames.pop();
    return { value, scopedBinding };
  }

  private compileAsExpr(
    src: TypedExpr,
    scope: Scope,
    tailPosData: TailPositionData | undefined,
  ): CompileExprResult {
    switch (src.type) {
      case "constant":
        return [[], constToString(src.value)];

      case "identifier": {
        if (src.namespace !== undefined) {
          return [[], `${sanitizeNamespace(src.namespace)}$${src.name}`];
        }

        const lookup = builtinValues[src.name] ?? scope[src.name];
        if (lookup === undefined) {
          throw new Error(`[unreachable] undefined identifier (${src.name})`);
        }
        return [[], lookup];
      }

      case "application": {
        const isStructuralEq_ = isStructuralEq(src.caller, src.args);

        const infix = getInfixPrecAndName(src);

        if (!isStructuralEq_ && infix !== undefined) {
          const [l, r] = src.args;
          const [lStatements, lExpr] = this.compileAsExpr(l!, scope, undefined);
          const [rStatements, rExpr] = this.compileAsExpr(r!, scope, undefined);

          const infixLeft = getInfixPrecAndName(l!);
          const lCWithParens =
            (infixLeft?.prec ?? Infinity) < infix.prec ? `(${lExpr})` : lExpr;

          return [
            [...lStatements, ...rStatements],
            `${lCWithParens} ${infix.jsName} ${rExpr}`,
          ];
        }

        const [callerStatemens, callerExpr] = isStructuralEq_
          ? [[], "Basics$_eq"]
          : this.compileAsExpr(src.caller, scope, undefined);

        const statements: string[] = [...callerStatemens];
        const args: string[] = [];
        for (const arg of src.args) {
          const [argStatements, argExpr] = this.compileAsExpr(
            arg,
            scope,
            undefined,
          );
          args.push(argExpr);
          statements.push(...argStatements);
        }
        return [statements, `${callerExpr}(${args.join(", ")})`];
      }

      case "let": {
        const { value, scopedBinding } = this.compileLetValue(src, scope);
        const [bodyStatements, bodyExpr] = this.compileAsExpr(
          src.body,
          {
            ...scope,
            [src.binding.name]: scopedBinding,
          },
          tailPosData,
        );
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
          undefined,
        );
        return [statements, name];
      }
    }
  }

  private compileAsStatements(
    src: TypedExpr,
    as: CompilationMode,
    scope: Scope,
    tailPosData: TailPositionData | undefined,
  ): string[] {
    switch (src.type) {
      case "application":
        if (
          src.caller.type === "identifier" &&
          tailPosData !== undefined &&
          tailPosData.ident === src.caller.name
        ) {
          this.tailCall = true;
          const ret: string[] = [];
          let i = 0;
          for (const arg of src.args) {
            const [statements, expr] = this.compileAsExpr(
              arg,
              scope,
              undefined,
            );
            ret.push(...statements);
            // TODO is it safe to rely on this?
            ret.push(`GEN__${i} = ${expr};`);
            i++;
          }
          return ret;
        }

      case "identifier":
      case "constant": {
        const [statements, expr] = this.compileAsExpr(src, scope, tailPosData);
        return [...statements, wrapJsExpr(expr, as)];
      }

      case "let": {
        const { value, scopedBinding } = this.compileLetValue(src, scope);
        const bodyStatements = this.compileAsStatements(
          src.body,
          as,
          {
            ...scope,
            [src.binding.name]: scopedBinding,
          },
          tailPosData,
        );
        return [...value, ...bodyStatements];
      }

      case "fn": {
        const name =
          as.type === "assign_var" && as.declare
            ? as.name
            : this.getUniqueName();

        this.frames.push(new Frame({ type: "fn" }, this));
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
          { ident: name },
        );

        const isTailRec = this.tailCall;
        this.tailCall = false;
        const params = isTailRec
          ? src.params.map(() => this.getUniqueName())
          : src.params.map((p) => p.name);

        this.frames.pop();

        const wrappedFnBody = isTailRec
          ? [
              "while (true) {",
              ...indentBlock([
                ...params.map((p, i) => `const ${src.params[i]!.name} = ${p};`),
                ...fnBody,
              ]),
              "}",
            ]
          : fnBody;

        return [
          //
          `function ${name}(${params.join(", ")}) {`,
          ...indentBlock(wrappedFnBody),
          `}`,
          ...(as.type === "assign_var" && as.declare
            ? []
            : [wrapJsExpr(name, as)]),
        ];
      }

      case "if": {
        const [conditionStatements, conditionExpr] = this.compileAsExpr(
          src.condition,
          scope,
          undefined,
        );

        const thenBlock = this.compileAsStatements(
          src.then,
          doNotDeclare(as),
          scope,
          tailPosData,
        );

        const elseBlock = this.compileAsStatements(
          src.else,
          doNotDeclare(as),
          scope,
          tailPosData,
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
          undefined,
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
            tailPosData,
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

  compile(src: TypedModule, ns: string | undefined): string {
    const decls: string[] = [];

    for (const import_ of src.imports) {
      for (const exposed of import_.exposing) {
        switch (exposed.type) {
          case "type":
            if (
              exposed.resolved !== undefined &&
              exposed.resolved.type === "adt" &&
              exposed.exposeImpl
            ) {
              for (const variant of exposed.resolved.variants) {
                this.globalScope[variant.name] = moduleNamespacedBinding(
                  variant.name,
                  import_.ns,
                );
              }
            }

            break;
          case "value":
            this.globalScope[exposed.name] = moduleNamespacedBinding(
              exposed.name,
              import_.ns,
            );
            break;
        }
      }
    }

    for (const typeDecl of src.typeDeclarations) {
      if (typeDecl.type === "extern") {
        continue;
      }

      for (const variant of typeDecl.variants) {
        if (variant.name in builtinValues) {
          break;
        }
        const def = getVariantImpl(variant, ns);
        decls.push(def);
        this.globalScope[variant.name] = moduleNamespacedBinding(
          variant.name,
          ns,
        );
      }
    }

    for (const decl of src.declarations) {
      const nameSpacedBinding = moduleNamespacedBinding(decl.binding.name, ns);
      if (decl.extern) {
        // skip the infix operators
        // as they are already handled by the compiler
        if (!isInfix(decl.binding.name)) {
          this.globalScope[decl.binding.name] = nameSpacedBinding;
        }

        continue;
      }

      this.frames.push(
        new Frame(
          {
            type: "let",
            name: moduleNamespacedBinding(decl.binding.name, ns),
          },
          this,
        ),
      );

      this.globalScope[decl.binding.name] = nameSpacedBinding;

      const statements = this.compileAsStatements(
        decl.value,
        { type: "assign_var", name: nameSpacedBinding, declare: true },
        this.globalScope,
        undefined,
      );

      decls.push(...statements, "");
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
  pattern: MatchPattern,
): CompiledPatternResult {
  switch (pattern.type) {
    case "lit":
      return {
        conditions: [`${matchSubject} === ${constToString(pattern.literal)}`],
        newScope: {},
      };
    case "identifier":
      return {
        conditions: [],
        newScope: { [pattern.name]: matchSubject },
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
  expr: TypedExpr,
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
  return lines.map((line) => `  ${line}`);
}

function getVariantImpl(
  { name, args }: TypeVariant<unknown>,
  ns: string | undefined,
): string {
  const nsName = moduleNamespacedBinding(name, ns);

  if (args.length === 0) {
    return `const ${nsName} = { type: "${name}" };
`;
  } else {
    const argsList = args.map((_t, i) => `a${i}`).join(", ");
    return `function ${nsName}(${argsList}) {
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

    case "Unit":
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

function moduleNamespacedBinding(name: string, ns: string | undefined): string {
  const ns_ = ns === undefined ? ns : sanitizeNamespace(ns);
  return ns_ === undefined ? name : `${ns_}$${name}`;
}

export type CompileOptions = {
  externs?: Record<string, string>;
  entrypoint?: {
    module: string;
    type: ConcreteType;
  };
};

export const defaultEntryPoint: NonNullable<CompileOptions["entrypoint"]> = {
  module: "Main",
  type: {
    type: "named",
    moduleName: "Task",
    name: "Task",
    args: [{ type: "named", name: "Unit", moduleName: "Basics", args: [] }],
  },
};

export function compileProject(
  typedProject: Record<string, TypedModule>,
  { entrypoint = defaultEntryPoint, externs = {} }: CompileOptions = {},
): string {
  const entry = typedProject[entrypoint.module]!;
  const mainDecl = entry.declarations.find(
    (d) => d.binding.name === "main" && d.pub,
  );
  if (mainDecl === undefined) {
    throw new Error("Entrypoint needs a value called `main`.");
  }

  const compiler = new Compiler();
  const visited = new Set<string>();

  const buf: string[] = [];

  function visit(ns: string) {
    if (visited.has(ns)) {
      return;
    }

    visited.add(ns);
    const module = typedProject[ns];
    if (module === undefined) {
      console.error(col.red.tag`Error:`, `Could not find module '${ns}'`);
      exit(1);
    }

    for (const import_ of module.imports) {
      visit(import_.ns);
    }

    const extern = externs[ns];
    if (extern !== undefined) {
      buf.push(extern);
    }

    const out = compiler.compile(module, ns);
    buf.push(out);
  }

  visit(entrypoint.module);

  const entryPointMod = sanitizeNamespace(entrypoint.module);
  buf.push(`${entryPointMod}$main.run(() => {});\n`);

  return buf.join("\n\n");
}

function sanitizeNamespace(ns: string): string {
  return ns?.replace(/\//g, "$");
}
