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

type Scope = Record<string, string>;

type CompilationMode =
  | { type: "assign_var"; name: string; declare: boolean }
  | { type: "return" };

class Frame {
  constructor(
    public readonly data:
      | { type: "let"; name: string; binding?: Binding<unknown> }
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
    resolvedType.value.moduleName === "Int"
  ) {
    return false;
  }

  if (
    resolvedType.value.name === "Float" &&
    resolvedType.value.moduleName === "Float"
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

  private ns: string | undefined;

  private nextId = 0;
  getNextId() {
    return this.nextId++;
  }

  private indentation = 0;
  private statementsBuf: string[] = [];
  private pushStatements(...statements: string[]) {
    const indentation = Array.from({ length: this.indentation })
      .fill("  ")
      .join("");

    for (const statement of statements) {
      this.statementsBuf.push(indentation + statement);
    }
  }
  private indented(writer: VoidFunction) {
    this.indentation++;
    writer();
    this.indentation--;
  }

  private scopedBuffer(writer: VoidFunction): string[] {
    const initialBuf = this.statementsBuf;
    this.statementsBuf = [];
    writer();
    const buf = this.statementsBuf;
    this.statementsBuf = initialBuf;
    return buf;
  }

  private getUniqueName() {
    return this.getCurrentFrame().getUniqueName(this.getBlockNs());
  }

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
  private compileLetValue(src: TypedExpr & { type: "let" }): void {
    const name =
      src.pattern.type === "identifier"
        ? this.getCurrentFrame().preventShadow(src.pattern.name)
        : this.getUniqueName();

    this.frames.push(
      new Frame(
        {
          type: "let",
          name,
          binding: src.pattern.type === "identifier" ? src.pattern : undefined,
        },
        this,
      ),
    );

    // Ignore compiled output
    const scopedBinding = this.getBlockNs();

    if (scopedBinding === undefined) {
      throw new Error("[unreachable] empty ns stack");
    }

    if (src.pattern.type === "identifier") {
      this.localBindings.set(src.pattern, scopedBinding);
    } else {
      this.compilePattern(name, src.pattern);
    }

    const value = this.compileAsStatements(
      src.value,
      { type: "assign_var", name: scopedBinding, declare: true },

      undefined,
    );

    this.frames.pop();
    return value;
  }

  private compileJsApplication(jsCall: JsApplicationType): string {
    switch (jsCall.type) {
      case "infix": {
        const lExpr = this.compileAsExpr(jsCall.left);
        const rExpr = this.compileAsExpr(jsCall.right);
        const needsParens_ = needsParens(jsCall, jsCall.left);
        const lCWithParens = needsParens_ ? `(${lExpr})` : lExpr;

        return `${lCWithParens} ${jsCall.operator} ${rExpr}`;
      }

      case "prefix": {
        const compiledExpr = this.compileAsExpr(jsCall.expr);
        const needsParens_ = needsParens(jsCall, jsCall.expr);
        const compiledWithParens = needsParens_
          ? `(${compiledExpr})`
          : compiledExpr;

        return `!${compiledWithParens}`;
      }

      case "structural-eq":
        return this.compileJsApplicationHelper("Bool$_eq", [
          jsCall.left,
          jsCall.right,
        ]);

      case "call": {
        const expr = this.compileAsExpr(jsCall.caller);
        return this.compileJsApplicationHelper(expr, jsCall.args);
      }
    }
  }

  private compileJsApplicationHelper(
    callerExpr: string,
    srcArgs: TypedExpr[],
  ): string {
    const args: string[] = [];
    for (const arg of srcArgs) {
      const argExpr = this.compileAsExpr(arg);
      args.push(argExpr);
    }
    return `${callerExpr}(${args.join(", ")})`;
  }

  private compileAsExpr(src: TypedExpr): string {
    switch (src.type) {
      case "constant":
        return constToString(src.value);

      case "identifier": {
        if (src.resolution === undefined) {
          throw new Error("[unreachable] unresolved var: " + src.name);
        }

        switch (src.resolution.type) {
          case "global-variable": {
            const ns = src.resolution.namespace ?? this.ns;
            if (ns === undefined) {
              return src.name;
            }
            return `${sanitizeNamespace(ns)}$${src.name}`;
          }

          case "constructor": {
            if (src.resolution.namespace) {
              const builtinLookup = builtinValues[src.name];
              if (builtinLookup !== undefined) {
                return builtinLookup;
              }
            }

            const ns = src.resolution.namespace ?? this.ns;
            if (ns === undefined) {
              return src.name;
            }
            return `${sanitizeNamespace(ns)}$${src.name}`;
          }

          case "local-variable": {
            const lookup = this.localBindings.get(src.resolution.binding);
            if (lookup === undefined) {
              throw new Error(
                `[unreachable] undefined identifier (${src.name})`,
              );
            }
            return lookup;
          }
        }
      }

      case "application": {
        const appType = toApplicationType(src);
        return this.compileJsApplication(appType);
      }

      case "let": {
        this.compileLetValue(src);
        return this.compileAsExpr(src.body);
      }

      case "fn":
      case "if":
      case "match": {
        const name = this.getUniqueName();
        this.compileAsStatements(
          src,
          { type: "assign_var", name, declare: true },
          undefined,
        );

        return name;
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
    tailPosCaller: Binding<unknown> | undefined,
  ): void {
    switch (src.type) {
      case "application": {
        if (this.isTailCall(src, tailPosCaller)) {
          this.tailCall = true;
          let i = 0;
          for (const arg of src.args) {
            const expr = this.compileAsExpr(arg);
            this.pushStatements(`GEN_TC__${i} = ${expr};`);
            i++;
          }
          return;
        }
      }

      case "identifier":
      case "constant": {
        const expr = this.compileAsExpr(src);
        this.pushStatements(wrapJsExpr(expr, as));
        return;
      }

      case "let": {
        this.compileLetValue(src);
        this.compileAsStatements(src.body, as, tailPosCaller);
        return;
      }

      case "fn": {
        const name =
          as.type === "assign_var" && as.declare
            ? as.name
            : this.getUniqueName();

        const frame = this.frames.at(-1);
        const callerBinding =
          frame?.data.type === "let" ? frame.data.binding : undefined;

        const newFrame = new Frame({ type: "fn" }, this);
        this.frames.push(newFrame);

        const params = src.params.map((param) => {
          if (param.type !== "identifier") {
            const name = this.getUniqueName();
            this.compilePattern(name, param);
            return name;
          } else {
            const paramName = newFrame.preventShadow(param.name);
            this.localBindings.set(param, paramName);
            return paramName;
          }
        });

        const wasTailCall = this.tailCall;
        this.tailCall = false;
        const fnBody = this.scopedBuffer(() => {
          this.compileAsStatements(src.body, { type: "return" }, callerBinding);
        });
        this.frames.pop();

        const tcParams = this.tailCall
          ? src.params.map((_, index) => `GEN_TC__${index}`)
          : params;
        this.pushStatements(`function ${name}(${tcParams.join(", ")}) {`);
        this.indented(() => {
          if (this.tailCall) {
            this.pushStatements("while (true) {");
            this.indented(() => {
              for (let i = 0; i < params.length; i++) {
                this.pushStatements(`const ${params[i]} = GEN_TC__${i};`);
              }
              this.pushStatements(...fnBody);
            });
            this.pushStatements("}");
          } else {
            this.pushStatements(...fnBody);
          }
        });

        this.pushStatements(`}`);
        if (!(as.type === "assign_var" && as.declare)) {
          this.pushStatements(wrapJsExpr(name, as));
        }

        this.tailCall = wasTailCall;
        return;
      }

      case "if": {
        const conditionExpr = this.compileAsExpr(src.condition);
        this.pushStatements(
          ...declarationStatements(as),
          `if (${conditionExpr}) {`,
        );
        this.indented(() => {
          this.compileAsStatements(src.then, doNotDeclare(as), tailPosCaller);
        });
        this.pushStatements(`} else {`);
        this.indented(() => {
          this.compileAsStatements(src.else, doNotDeclare(as), tailPosCaller);
        });
        this.pushStatements(`}`);
        return;
      }

      case "match": {
        const matched = this.getUniqueName();
        this.compileAsStatements(
          src.expr,
          { type: "assign_var", name: matched, declare: true },
          undefined,
        );

        this.pushStatements(...declarationStatements(as));

        let first = true;
        for (const [pattern, ret] of src.clauses) {
          const compiled = this.compilePattern(matched, pattern);

          const condition =
            compiled.length === 0 ? "true" : compiled.join(" && ");

          this.pushStatements(
            first ? `if (${condition}) {` : `} else if (${condition}) {`,
          );
          this.indented(() => {
            this.compileAsStatements(ret, doNotDeclare(as), tailPosCaller);
          });

          first = false;
        }

        this.pushStatements(
          `} else {`,
          ...indentBlock([`throw new Error("[non exhaustive match]")`]),
          `}`,
        );
        return;
      }
    }
  }

  compile(src: TypedModule, ns: string): string {
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

      this.compileAsStatements(
        decl.value,
        { type: "assign_var", name: nameSpacedBinding, declare: true },
        undefined,
      );
      decls.push(...this.statementsBuf, "");
      this.statementsBuf = [];
      this.frames.pop();
    }

    return decls.join("\n");
  }

  private compilePattern(
    matchSubject: string,
    pattern: MatchPattern,
  ): string[] {
    switch (pattern.type) {
      case "lit":
        return [`${matchSubject} === ${constToString(pattern.literal)}`];
      case "identifier":
        this.localBindings.set(pattern, matchSubject);
        return [];
      case "constructor": {
        const conditions: string[] = [
          matchCondition(matchSubject, pattern.name),
        ];

        let i = 0;
        for (const nested of pattern.args) {
          const index = i++;
          const compiled = this.compilePattern(
            `${matchSubject}.a${index}`,
            nested,
          );
          conditions.push(...compiled);
        }

        return conditions;
      }
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
    case "char":
      return `new String("${k.value}")`;
  }
}

function getJsInfix(srcName: string) {
  switch (srcName) {
    case "++":
      return "+";
    case "+.":
      return "+";
    case "-.":
      return "-";
    case "*.":
      return "*";
    case "/.":
      return "/";
    case "^":
      return "**";

    case "||":
    case "&&":
    case "==":
    case "!=":
    case "<":
    case "<=":
    case ">":
    case ">=":
    case "+":
    case "-":
    case "*":
    case "/":
    case "%":
    case "**":
      return srcName;

    default:
      return undefined;
  }
}

type JsInfix = NonNullable<ReturnType<typeof getJsInfix>>;

function getJsPrefix(srcName: string) {
  switch (srcName) {
    case "!":
      return srcName;

    default:
      return undefined;
  }
}
type JsPrefix = NonNullable<ReturnType<typeof getJsPrefix>>;

type JsApplicationType =
  | { type: "infix"; operator: JsInfix; left: TypedExpr; right: TypedExpr }
  | { type: "prefix"; operator: JsPrefix; expr: TypedExpr }
  | { type: "call"; caller: TypedExpr; args: TypedExpr[] }
  | { type: "structural-eq"; left: TypedExpr; right: TypedExpr };

// left-to-right operators
const infixPrecTable: Record<JsInfix, number> = {
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

const prefixPrecTable: Record<JsPrefix, number> = {
  "!": 14,
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence#table
function precTable(appType: JsApplicationType): number {
  switch (appType.type) {
    case "infix":
      return infixPrecTable[appType.operator];

    case "prefix":
      return prefixPrecTable[appType.operator];

    case "call":
    case "structural-eq":
      return 17;
  }
}

function toApplicationType(
  src: TypedExpr & { type: "application" },
): JsApplicationType {
  if (isStructuralEq(src.caller, src.args)) {
    return {
      type: "structural-eq",
      left: src.args[0]!,
      right: src.args[1]!,
    };
  }

  if (src.caller.type === "identifier") {
    const mappedToInfix = getJsInfix(src.caller.name);
    if (mappedToInfix !== undefined) {
      return {
        type: "infix",
        operator: mappedToInfix,
        left: src.args[0]!,
        right: src.args[1]!,
      };
    }

    const mappedToPrefix = getJsPrefix(src.caller.name);
    if (mappedToPrefix !== undefined) {
      return {
        type: "prefix",
        operator: mappedToPrefix,
        expr: src.args[0]!,
      };
    }
  }

  return {
    type: "call",
    caller: src.caller,
    args: src.args,
  };
}

function needsParens(self: JsApplicationType, innerLeft: TypedExpr): boolean {
  if (innerLeft.type !== "application") {
    return false;
  }

  const inner = toApplicationType(innerLeft);

  const precSelf = precTable(self);
  const precInner = precTable(inner);
  return precInner < precSelf;
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
    return `const ${nsName} = { $: "${name}" };
`;
  } else {
    const argsList = args.map((_t, i) => `a${i}`).join(", ");
    return `function ${nsName}(${argsList}) {
  return { $: "${name}", ${argsList} };
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
      return `${matchingIdent}.$ === "${patternName}"`;
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
    args: [{ type: "named", name: "Unit", moduleName: "Tuple", args: [] }],
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
    throw new Error(`Entrypoint not found: '${entrypoint.module}'`);
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
