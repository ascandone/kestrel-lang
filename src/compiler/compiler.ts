import { exit } from "process";
import { Binding, ConstLiteral, MatchPattern, TypeVariant } from "../parser";
import { TypedExpr, TypedModule } from "../typecheck";
import { ConcreteType } from "../typecheck/type";
import { col } from "../utils/colors";
import { optimizeModule } from "./optimize";

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
    public readonly data:
      | { type: "let"; name: string; binding: Binding<unknown> }
      | { type: "fn" },
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
  private bindingsStack: Binding<unknown>[] = [];
  private frames: Frame[] = [];
  private tailCall = false;

  private ns: string | undefined;

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

  // <Binding> => ns map
  private localBindings = new WeakMap<Binding<unknown>, string>();

  private compileLetValue(
    src: TypedExpr & { type: "let" },
    scope: Scope,
  ): { value: string[]; scopedBinding: string } {
    const name = this.getCurrentFrame().preventShadow(src.binding.name);
    this.frames.push(
      new Frame({ type: "let", name, binding: src.binding }, this),
    );
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

    this.localBindings.set(src.binding, scopedBinding);

    this.frames.pop();
    this.bindingsStack.pop();
    return { value, scopedBinding };
  }

  private compileAsExpr(src: TypedExpr, scope: Scope): CompileExprResult {
    switch (src.type) {
      case "constant":
        return [[], constToString(src.value)];

      case "identifier": {
        if (src.resolution === undefined) {
          throw new Error("[unreachable] unresolved var: " + src.name);
        }

        switch (src.resolution.type) {
          case "global-variable": {
            const ns = src.resolution.namespace ?? this.ns;
            if (ns === undefined) {
              return [[], src.name];
            }

            return [[], `${sanitizeNamespace(ns)}$${src.name}`];
          }

          case "constructor": {
            if (src.resolution.namespace) {
              const builtinLookup = builtinValues[src.name];
              if (builtinLookup !== undefined) {
                return [[], builtinLookup];
              }
            }

            const ns = src.resolution.namespace ?? this.ns;
            if (ns === undefined) {
              return [[], src.name];
            }

            return [[], `${sanitizeNamespace(ns)}$${src.name}`];
          }

          case "local-variable": {
            const lookup = this.localBindings.get(src.resolution.binding);
            if (lookup === undefined) {
              break;
            }
            if (lookup === undefined) {
              throw new Error(
                `[unreachable] undefined identifier (${src.name})`,
              );
            }
            return [[], lookup];
          }
        }

        const lookup = scope[src.name];
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

        const [callerStatemens, callerExpr] = isStructuralEq_
          ? [[], "Basics$_eq"]
          : this.compileAsExpr(src.caller, scope);

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
          undefined,
        );
        return [statements, name];
      }
    }
  }

  private isTailCall(
    src: TypedExpr & { type: "application" },
    tailPosBinding: Binding<unknown> | undefined,
  ): boolean {
    if (tailPosBinding === undefined) {
      return false;
    }

    if (src.caller.type !== "identifier") {
      return false;
    }

    if (src.caller.resolution === undefined) {
      throw new Error("[unreachable] undefined resolution");
    }

    switch (src.caller.resolution.type) {
      case "local-variable":
        return src.caller.resolution.binding === tailPosBinding;
      case "global-variable":
        return src.caller.resolution.declaration.binding === tailPosBinding;
      case "constructor":
        return false;
    }
  }

  private compileAsStatements(
    src: TypedExpr,
    as: CompilationMode,
    scope: Scope,
    tailPosCaller: Binding<unknown> | undefined,
  ): string[] {
    switch (src.type) {
      case "application": {
        if (this.isTailCall(src, tailPosCaller)) {
          this.tailCall = true;
          const ret: string[] = [];
          let i = 0;
          for (const arg of src.args) {
            const [statements, expr] = this.compileAsExpr(arg, scope);
            ret.push(...statements);
            ret.push(`GEN_TC__${i} = ${expr};`);
            i++;
          }
          return ret;
        }
      }

      case "identifier":
      case "constant": {
        const [statements, expr] = this.compileAsExpr(src, scope);
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
          tailPosCaller,
        );
        return [...value, ...bodyStatements];
      }

      case "fn": {
        const name =
          as.type === "assign_var" && as.declare
            ? as.name
            : this.getUniqueName();

        const frame = this.frames.at(-1);
        const callerBinding =
          frame?.data.type === "let" ? frame.data.binding : undefined;

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
          callerBinding,
        );

        const isTailRec = this.tailCall;
        this.tailCall = false;
        const params = isTailRec
          ? src.params.map((_, index) => `GEN_TC__${index}`)
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
        );

        const thenBlock = this.compileAsStatements(
          src.then,
          doNotDeclare(as),
          scope,
          tailPosCaller,
        );

        const elseBlock = this.compileAsStatements(
          src.else,
          doNotDeclare(as),
          scope,
          tailPosCaller,
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
            tailPosCaller,
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
    this.ns = ns;
    const decls: string[] = [];

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
      }
    }

    for (const decl of src.declarations) {
      const nameSpacedBinding = moduleNamespacedBinding(decl.binding.name, ns);
      if (decl.extern) {
        continue;
      }

      this.frames.push(
        new Frame(
          {
            type: "let",
            name: moduleNamespacedBinding(decl.binding.name, ns),
            binding: decl.binding,
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
  optimize?: boolean;
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
  {
    entrypoint = defaultEntryPoint,
    externs = {},
    optimize = false,
  }: CompileOptions = {},
): string {
  const entry = typedProject[entrypoint.module];
  if (entry === undefined) {
    throw new Error(`Entrypoint not found: ${entry}`);
  }
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

    const out = compiler.compile(
      optimize ? optimizeModule(module) : module,
      ns,
    );

    buf.push(out);
  }

  visit(entrypoint.module);

  const entryPointMod = sanitizeNamespace(entrypoint.module);
  buf.push(`${entryPointMod}$main.exec();\n`);

  return buf.join("\n\n");
}

function sanitizeNamespace(ns: string): string {
  return ns?.replace(/\//g, "$");
}
