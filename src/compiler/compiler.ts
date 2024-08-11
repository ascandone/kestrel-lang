import { exit } from "process";
import { Binding, ConstLiteral, MatchPattern, TypeVariant } from "../parser";
import {
  TypedExpr,
  TypedModule,
  TypedTypeAst,
  TypedTypeDeclaration,
  TypedTypeVariant,
} from "../typecheck";
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
  /**
   * Allowlist of trait to derive. Intented for test purposes (to be mutated directly)
   *
   * `undefined == *`
   */
  public allowDeriving: string[] | undefined;

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

      case "field-access": {
        const [sts, structValue] = this.compileAsExpr(src.struct);
        // TODO prec with infix
        return [sts, `${structValue}.${src.field.name}`];
      }

      case "struct-literal": {
        const resolution = src.struct.resolution;
        if (resolution === undefined) {
          throw new Error(
            "[unreachable] undefined resolution for struct declaration",
          );
        }

        const objContent: string[] = [];
        const stsBuf: string[] = [];

        if (src.fields.length === 0) {
          return [[], "null"];
        }

        for (const f of src.fields) {
          const [sts, fieldValue] = this.compileAsExpr(f.value);
          stsBuf.push(...sts);
          objContent.push(`${f.field.name}: ${fieldValue}`);
        }

        if (src.spread !== undefined) {
          const [exprSts, exprExpr] = this.compileAsExpr(src.spread);
          stsBuf.push(...exprSts);

          for (const originalField of resolution.declaration.fields) {
            const alreadyWritten = src.fields.some(
              (writtenField) => writtenField.field.name === originalField.name,
            );
            if (alreadyWritten) {
              continue;
            }

            objContent.push(
              `${originalField.name}: ${exprExpr}.${originalField.name}`,
            );
          }
        }

        return [stsBuf, `{ ${objContent.join(", ")} }`];
      }

      case "identifier": {
        if (src.resolution === undefined) {
          throw new Error("[unreachable] unresolved var: " + src.name);
        }

        switch (src.resolution.type) {
          case "global-variable": {
            if (this.ns === undefined) {
              throw new Error("TODO handle empty ns");
            }

            // TODO what about let exprs?
            const traitArgs = resolvePassedDicts(
              src.resolution.declaration.binding.$,
              src.$,
            );

            const ns = src.resolution.namespace ?? this.ns;
            if (ns === undefined) {
              return [[], src.name + traitArgs];
            }

            const fName = src.name === "==" ? "_eq" : src.name;
            return [[], `${sanitizeNamespace(ns)}$${fName}${traitArgs}`];
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
        // Attention: fallthrough to the next branch
      }

      case "field-access":
      case "struct-literal":
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
      if (typeDecl.type !== "adt") {
        continue;
      }

      for (const variant of typeDecl.variants) {
        if (variant.name in builtinValues) {
          break;
        }
        const def = getVariantImpl(variant, ns);
        decls.push(def);
      }

      if (
        (this.allowDeriving === undefined ||
          this.allowDeriving.includes("Eq")) &&
        // Bool equality is implemented inside core
        typeDecl.name !== "Bool"
      ) {
        const o = this.deriveEq(typeDecl);
        if (o != undefined) {
          decls.push(o);
        }
      }

      if (
        (this.allowDeriving === undefined ||
          this.allowDeriving.includes("Show")) &&
        // Bool and List show are implemented inside core
        typeDecl.name !== "Bool" &&
        typeDecl.name !== "List"
      ) {
        const o = this.deriveShow(typeDecl);
        if (o !== undefined) {
          decls.push(o);
        }
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

      const dictParams = findDeclarationDictsParams(decl.binding.$.asType());

      const statements = this.compileAsStatements(
        decl.value,
        {
          type: "assign_var",
          name: nameSpacedBinding,
          declare: true,
          dictParams:
            dictParams.length === 0 ? "" : `(${dictParams.join(", ")}) => `,
        },
        undefined,
      );

      decls.push(...statements, "");
      this.frames.pop();
    }

    return decls.join("\n");
  }

  // TODO can this be static?
  private deriveEq(
    typedDeclaration: TypedTypeDeclaration & { type: "adt" },
  ): string | undefined {
    if (this.ns === undefined) {
      throw new Error("TODO handle undefined namespace");
    }

    const deps = TVar.typeImplementsTrait(
      {
        type: "named",
        name: typedDeclaration.name,
        moduleName: this.ns,
        args: typedDeclaration.params.map(() => TVar.fresh().asType()),
      },
      "Eq",
    );
    if (deps === undefined) {
      return undefined;
    }

    const usedVars: string[] = [];

    function variantEq(variant: TypedTypeVariant | undefined): string {
      if (variant === undefined || variant.args.length === 0) {
        return `true`;
      }

      return variant.args
        .map((variant, i) => {
          const callEXpr = deriveEqArg(usedVars, variant);
          return `${callEXpr}(x.a${i}, y.a${i})`;
        })
        .join(" && ");
    }

    let body: string;
    if (typedDeclaration.variants.length <= 1) {
      const v = variantEq(typedDeclaration.variants[0]);
      body = `return ${v};`;
    } else {
      const cases = typedDeclaration.variants
        .map((variant) => {
          const v = variantEq(variant);

          return `    case "${variant.name}":
      return ${v};`;
        })
        .join("\n");

      body = `if (x.$ !== y.$) {
    return false;
  }
  switch (x.$) {
${cases}
  }`;
    }

    let dictsArg: string;
    if (usedVars.length === 0) {
      dictsArg = "";
    } else {
      const params = usedVars.map((x) => `Eq_${x}`).join(", ");
      dictsArg = `(${params}) => `;
    }

    return `const Eq_${sanitizeNamespace(this.ns!)}$${typedDeclaration.name} = ${dictsArg}(x, y) => {
  ${body}
}`;
  }

  private deriveShow(
    typedDeclaration: TypedTypeDeclaration & { type: "adt" },
  ): string | undefined {
    if (this.ns === undefined) {
      throw new Error("TODO handle undefined namespace");
    }

    const deps = TVar.typeImplementsTrait(
      {
        type: "named",
        name: typedDeclaration.name,
        moduleName: this.ns,
        args: typedDeclaration.params.map(() => TVar.fresh().asType()),
      },
      "Show",
    );
    if (deps === undefined) {
      return undefined;
    }

    const usedVars: string[] = [];

    const showVariant = (variant: TypedTypeVariant): string => {
      if (variant.args.length === 0) {
        return `"${variant.name}"`;
      }

      const args = variant.args
        .map((arg, i) => `\${${deriveShowArg(usedVars, arg)}(x.a${i})}`)
        .join(", ");

      const isTuple = this.ns === "Tuple" && /Tuple[0-9]+/.test(variant.name);
      if (isTuple) {
        return `\`(${args})\``;
      }

      return `\`${variant.name}(${args})\``;
    };

    let body: string;
    switch (typedDeclaration.variants.length) {
      case 0:
        body = `  return "never";`;
        break;

      case 1: {
        const v = showVariant(typedDeclaration.variants[0]!);
        body = `  return ${v};`;
        break;
      }

      default: {
        const variants = typedDeclaration.variants
          .map((v) => {
            return `    case "${v.name}":
      return ${showVariant(v)};`;
          })
          .join("\n");

        body = `  switch (x.$) {
${variants}
  }`;
        break;
      }
    }

    let dictsArg: string;
    if (usedVars.length === 0) {
      dictsArg = "";
    } else {
      const params = usedVars.map((x) => `Show_${x}`).join(", ");
      dictsArg = `(${params}) => `;
    }

    return `const Show_${sanitizeNamespace(this.ns!)}$${typedDeclaration.name} = ${dictsArg}(x) => {
${body}
}`;
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

function deriveShowArg(usedVars: string[], arg: TypedTypeAst) {
  switch (arg.type) {
    case "any":
      throw new Error("[unreachable] any in constructor args");
    case "fn":
      throw new Error("[unreachable] cannot derive fns");

    case "var":
      if (!usedVars.includes(arg.ident)) {
        usedVars.push(arg.ident);
      }
      return `Show_${arg.ident}`;

    case "named": {
      if (arg.resolution === undefined) {
        throw new Error(
          "[unreachable] undefined resolution for type: " + arg.name,
        );
      }

      const subArgs = arg.args.map((subArg) => deriveShowArg(usedVars, subArg));

      let subCall: string;
      if (subArgs.length === 0) {
        subCall = "";
      } else {
        subCall = `(${subArgs.join(", ")})`;
      }

      return `Show_${arg.resolution.namespace}$${arg.name}${subCall}`;
    }
  }
}

function deriveEqArg(usedVars: string[], arg: TypedTypeAst): string {
  switch (arg.type) {
    case "any":
      throw new Error("[unreachable] any in constructor args");
    case "fn":
      throw new Error("[unreachable] cannot derive fns");

    case "named": {
      if (arg.resolution === undefined) {
        throw new Error(
          "[unreachable] undefined resolution for type: " + arg.name,
        );
      }

      const subArgs = arg.args.map((subArg) => deriveEqArg(usedVars, subArg));

      const ns = sanitizeNamespace(arg.resolution.namespace);
      let subCall: string;
      if (subArgs.length === 0) {
        subCall = "";
      } else {
        subCall = `(${subArgs.join(", ")})`;
      }
      // We assume this type impls the trait
      return `Eq_${ns}$${arg.name}${subCall}`;
    }

    case "var":
      if (!usedVars.includes(arg.ident)) {
        usedVars.push(arg.ident);
      }
      return `Eq_${arg.ident}`;
  }
}

function findDeclarationDictsParams(type: Type): string[] {
  const buf: string[] = [];

  function helper(type: Type) {
    switch (type.type) {
      case "fn":
        for (const arg of type.args) {
          helper(arg);
        }
        helper(type.return);
        return;

      case "named": {
        for (const arg of type.args) {
          helper(arg);
        }
        return;
      }

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

  return buf;
}

function traitDepsForNamedType(
  t: Type & { type: "named" },
  trait: string,
): Type[] {
  const freshArgs = t.args.map((_) => TVar.fresh());

  // TODO simplify this workaround
  const genericType: Type = {
    type: "named",
    moduleName: t.moduleName,
    name: t.name,
    args: freshArgs.map((a) => a.asType()),
  };

  const deps = TVar.typeImplementsTrait(genericType, trait);
  if (deps === undefined) {
    throw new Error("[unreachable] type does not implement given trait");
  }

  const out: Type[] = [];

  for (const dep of deps) {
    const index = freshArgs.findIndex((v) => {
      const r = v.resolve();
      return r.type === "unbound" && r.id === dep.id;
    });

    const a = t.args[index]!;
    out.push(a);
  }

  return out;
}

function applyTraitToType(type: Type, trait: string): string {
  const resolved = resolveType(type);

  switch (resolved.type) {
    case "fn":
      throw new Error("TODO bound fn");

    case "named": {
      let name = `${trait}_${sanitizeNamespace(resolved.moduleName)}$${resolved.name}`;
      const deps = traitDepsForNamedType(resolved, trait).map((dep) =>
        applyTraitToType(dep, trait),
      );

      if (deps.length !== 0) {
        name += `(${deps.join(", ")})`;
      }

      return name;
    }

    case "unbound": {
      if (!resolved.traits.includes(trait)) {
        throw new Error(
          "TODO unbound does not impl needed trait: " +
            JSON.stringify(resolved),
        );
      }

      return `${trait}_${resolved.id}`;
    }
  }
}

function resolvePassedDicts(genExpr: TVar, instantiatedExpr: TVar): string {
  const buf: string[] = [];

  // e.g. { 0 => Set("Show", "Debug") }
  const alreadyVisitedVarsIds: Map<number, Set<string>> = new Map();

  function checkedPush(genExprId: number, trait: string, name: string) {
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
        const resolved = resolveType(instantiatedExpr);

        if (resolved.type !== "fn") {
          throw new Error(
            "[unreachable] unexpected value of kind: " + resolved.type,
          );
        }

        const instantiatedFn = resolved;

        for (let i = 0; i < genExpr.args.length; i++) {
          const genArg = genExpr.args[i]!,
            instArg = instantiatedFn.args[i]!;

          helper(genArg, instArg);
        }

        helper(genExpr.return, instantiatedFn.return);
        return;
      }

      case "named": {
        const resolved = resolveType(instantiatedExpr);
        if (resolved.type !== "named") {
          throw new Error(
            "[unreachable] unexpected value of kind: " + resolved.type,
          );
        }

        const instantiatedConcreteType = resolved;

        for (let i = 0; i < genExpr.args.length; i++) {
          const genArg = genExpr.args[i]!,
            instArg = instantiatedConcreteType.args[i]!;

          helper(genArg, instArg);
        }
        return;
      }

      case "var": {
        const resolvedGenExpr = genExpr.var.resolve();
        switch (resolvedGenExpr.type) {
          case "bound":
            return helper(resolvedGenExpr.value, instantiatedExpr);

          case "unbound": {
            for (const trait of resolvedGenExpr.traits) {
              checkedPush(
                resolvedGenExpr.id,
                trait,
                applyTraitToType(instantiatedExpr, trait),
              );
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
    case "char":
      return `"${k.value}"`;
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
  | { type: "call"; caller: TypedExpr; args: TypedExpr[] };

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
      return 17;
  }
}

function toApplicationType(
  src: TypedExpr & { type: "application" },
): JsApplicationType {
  if (isStructuralEq(src.caller, src.args)) {
    return {
      type: "call",
      caller: src.caller,
      args: src.args,
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
