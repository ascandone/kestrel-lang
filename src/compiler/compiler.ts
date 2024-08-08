import { exit } from "process";
import { Binding, ConstLiteral, MatchPattern, TypeVariant } from "../parser";
import { TypedExpr, TypedModule } from "../typecheck";
import { ConcreteType, TVar, Type, resolveType } from "../typecheck/type";
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
  | {
      type: "assign_var";
      name: string;
      declare: boolean;
      dictParams: string;
    }
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

  private compileLetValue(src: TypedExpr & { type: "let" }): string[] {
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
      {
        type: "assign_var",
        name: scopedBinding,
        declare: true,
        dictParams: "", // <- TODO check
      },

      undefined,
    );

    this.frames.pop();
    return value;
  }

  private compileJsApplication(jsCall: JsApplicationType): [string[], string] {
    switch (jsCall.type) {
      case "infix": {
        const [lStatements, lExpr] = this.compileAsExpr(jsCall.left);
        const [rStatements, rExpr] = this.compileAsExpr(jsCall.right);
        const needsParens_ = needsParens(jsCall, jsCall.left);
        const lCWithParens = needsParens_ ? `(${lExpr})` : lExpr;

        return [
          [...lStatements, ...rStatements],
          `${lCWithParens} ${jsCall.operator} ${rExpr}`,
        ];
      }

      case "prefix": {
        const [lStatements, compiledExpr] = this.compileAsExpr(jsCall.expr);
        const needsParens_ = needsParens(jsCall, jsCall.expr);
        const compiledWithParens = needsParens_
          ? `(${compiledExpr})`
          : compiledExpr;

        return [lStatements, `!${compiledWithParens}`];
      }

      case "structural-eq":
        return this.compileJsApplicationHelper([], "Bool$_eq", [
          jsCall.left,
          jsCall.right,
        ]);

      case "call":
        return this.compileJsApplicationHelper(
          ...this.compileAsExpr(jsCall.caller),
          jsCall.args,
        );
    }
  }

  private compileJsApplicationHelper(
    callerStatemens: string[],
    callerExpr: string,
    srcArgs: TypedExpr[],
  ): [string[], string] {
    const statements: string[] = [...callerStatemens];
    const args: string[] = [];
    for (const arg of srcArgs) {
      const [argStatements, argExpr] = this.compileAsExpr(arg);
      args.push(argExpr);
      statements.push(...argStatements);
    }
    return [statements, `${callerExpr}(${args.join(", ")})`];
  }

  private compileAsExpr(src: TypedExpr): CompileExprResult {
    switch (src.type) {
      case "syntax-err":
        throw new Error("[unreachable]");

      case "constant":
        return [[], constToString(src.value)];

      case "list-literal": {
        const buf: string[] = [];
        const ret = src.values.reduceRight((acc, x) => {
          const [sts, expr] = this.compileAsExpr(x);
          buf.push(...sts);
          return `List$Cons(${expr}, ${acc})`;
        }, "List$Nil");
        return [buf, ret];
      }

      case "identifier": {
        if (src.resolution === undefined) {
          throw new Error("[unreachable] unresolved var: " + src.name);
        }

        switch (src.resolution.type) {
          case "global-variable": {
            // TODO what about let exprs?
            const traitArgs = resolvePassedDicts(
              src.resolution.declaration.binding.$,
              src.$,
            );

            const ns = src.resolution.namespace ?? this.ns;
            if (ns === undefined) {
              return [[], src.name + traitArgs];
            }

            return [[], `${sanitizeNamespace(ns)}$${src.name}${traitArgs}`];
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
              throw new Error(
                `[unreachable] undefined identifier (${src.name})`,
              );
            }
            return [[], lookup];
          }
        }
      }

      case "application": {
        const appType = toApplicationType(src);
        return this.compileJsApplication(appType);
      }

      case "let": {
        const value = this.compileLetValue(src);
        const [bodyStatements, bodyExpr] = this.compileAsExpr(src.body);
        return [[...value, ...bodyStatements], bodyExpr];
      }

      case "fn":
      case "if":
      case "match": {
        const name = this.getUniqueName();
        const statements = this.compileAsStatements(
          src,
          {
            type: "assign_var",
            name,
            declare: true,
            dictParams: "", // <- TODO check
          },
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
    tailPosCaller: Binding<unknown> | undefined,
  ): string[] {
    switch (src.type) {
      case "syntax-err":
        throw new Error("[unreachable]");

      case "application": {
        if (this.isTailCall(src, tailPosCaller)) {
          this.tailCall = true;
          const ret: string[] = [];
          let i = 0;
          for (const arg of src.args) {
            const [statements, expr] = this.compileAsExpr(arg);
            ret.push(...statements);
            ret.push(`GEN_TC__${i} = ${expr};`);
            i++;
          }
          return ret;
        }
      }

      case "list-literal":
      case "identifier":
      case "constant": {
        const [statements, expr] = this.compileAsExpr(src);
        return [...statements, wrapJsExpr(expr, as)];
      }

      case "let": {
        const value = this.compileLetValue(src);
        const bodyStatements = this.compileAsStatements(
          src.body,
          as,
          tailPosCaller,
        );
        return [...value, ...bodyStatements];
      }

      case "fn": {
        const wasTailCall = this.tailCall;
        this.tailCall = false;

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

        const fnBody = this.compileAsStatements(
          src.body,
          { type: "return" },
          callerBinding,
        );

        this.frames.pop();

        const wrappedFnBody = this.tailCall
          ? [
              "while (true) {",
              ...indentBlock([
                ...params.map((p, i) => `const ${p} = GEN_TC__${i};`),
                ...fnBody,
              ]),
              "}",
            ]
          : fnBody;

        const tcParams = this.tailCall
          ? src.params.map((_, index) => `GEN_TC__${index}`)
          : params;

        this.tailCall = wasTailCall;
        const dictParams = as.type === "assign_var" ? as.dictParams : "";

        return [
          //
          `const ${name} = ${dictParams}(${tcParams.join(", ")}) => {`,
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
        );

        const thenBlock = this.compileAsStatements(
          src.then,
          doNotDeclare(as),

          tailPosCaller,
        );

        const elseBlock = this.compileAsStatements(
          src.else,
          doNotDeclare(as),

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
          {
            type: "assign_var",
            name: matched,
            declare: true,
            dictParams: "", // <- TODO check
          },

          undefined,
        );

        const compiledMatchExpr: string[] = [
          ...statements,
          ...declarationStatements(as),
        ];

        let first = true;
        for (const [pattern, ret] of src.clauses) {
          const compiled = this.compilePattern(matched, pattern);

          const retStatements = this.compileAsStatements(
            ret,
            doNotDeclare(as),

            tailPosCaller,
          );

          const condition =
            compiled.length === 0 ? "true" : compiled.join(" && ");

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

      const dictParams = findDeclarationDictsParams(decl.binding.$.asType());

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

      const statements = this.compileAsStatements(
        decl.value,
        {
          type: "assign_var",
          name: nameSpacedBinding,
          declare: true,
          dictParams,
        },
        undefined,
      );

      decls.push(...statements, "");
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
        if (pattern.literal.type === "char") {
          return [`${matchSubject}.toString() === "${pattern.literal.value}"`];
        }

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

function findDeclarationDictsParams(type: Type): string {
  const buf: string[] = [];

  function helper(type: Type) {
    switch (type.type) {
      case "fn":
        // TODO traverse return type
        for (const arg of type.args) {
          helper(arg);
        }
        return;

      case "named":
        // throw new Error("TODO traverse named type");
        return;

      case "var": {
        const resolved = type.var.resolve();
        switch (resolved.type) {
          case "bound":
            helper(resolved.value);
            return;
          case "unbound":
            for (const trait of resolved.traits) {
              const name = `${trait}_${resolved.id}`;
              if (!buf.includes(name)) {
                buf.push(name);
              }
            }
            return;
        }
      }
    }
  }

  helper(type);

  if (buf.length !== 0) {
    return `(${buf.join(", ")}) => `;
  }

  return "";
}

function traitParamName(t: Type) {
  switch (t.type) {
    case "var": {
      const resolved = t.var.resolve();
      switch (resolved.type) {
        case "unbound":
          throw new Error("TODO trait name for unbound var");
        case "bound":
          return traitParamName(resolved.value);
      }
    }

    case "named":
      if (t.args.length != 0) {
        throw new Error("TODO handle named type args");
      }
      return t.name;

    case "fn":
      throw new Error("TODO trait name for fn");
  }
}

function resolvePassedDicts(genExpr: TVar, instantiatedExpr: TVar): string {
  const buf: string[] = [];

  // e.g. { 0 => Set("Show", "Debug") }
  const alreadyVisitedVarsIds: Map<number, Set<string>> = new Map();

  function checkedPush(genExprId: number, trait: string, traitId: string) {
    const name = `${trait}_${traitId}`;

    let lookup = alreadyVisitedVarsIds.get(genExprId);
    if (lookup === undefined) {
      lookup = new Set();
      alreadyVisitedVarsIds.set(genExprId, lookup);
    }

    if (lookup.has(trait)) {
      // Do not add again
      return;
    }

    lookup.add(trait);
    buf.push(name);
  }

  function helper(genExpr: Type, instantiatedExpr: Type) {
    switch (genExpr.type) {
      case "fn": {
        const i = resolveType(instantiatedExpr);
        if (i.type !== "bound") {
          throw new Error("[unreachable] unexpected unbound type");
        }

        if (i.value.type !== "fn") {
          throw new Error(
            "[unreachable] unexpected value of kind: " + i.value.type,
          );
        }

        const instantiatedFn = i.value;

        // TODO handle return types
        for (let i = 0; i < genExpr.args.length; i++) {
          const genArg = genExpr.args[i]!,
            instArg = instantiatedFn.args[i]!;

          helper(genArg, instArg);
        }
        return;
      }

      case "named":
        // TODO handle
        // throw new Error("TODO named: " + genExpr.name);
        return;

      case "var": {
        const resolvedGenExpr = genExpr.var.resolve();
        switch (resolvedGenExpr.type) {
          case "bound":
            return helper(resolvedGenExpr.value, instantiatedExpr);

          case "unbound": {
            const traits = resolvedGenExpr.traits;
            for (const trait of traits) {
              const impl = TVar.typeImplementsTrait(instantiatedExpr, trait);
              if (impl === undefined || impl.length === 0) {
                // Concrete type implements the type. The instantiated variables should receive the Trait_Type arg
                checkedPush(
                  resolvedGenExpr.id,
                  trait,
                  traitParamName(instantiatedExpr),
                );
              } else {
                for (const i of impl) {
                  for (const trait of i.traits) {
                    checkedPush(resolvedGenExpr.id, trait, i.id.toString());
                  }
                }
              }
            }
            return;
          }
        }
      }
    }
  }

  helper(genExpr.asType(), instantiatedExpr.asType());
  if (buf.length === 0) {
    return "";
  }
  return `(${buf.join(", ")})`;
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
      return `${constModifier}${as.name} = ${as.dictParams}${expr};`;
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
