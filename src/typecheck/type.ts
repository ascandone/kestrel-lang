export type ConcreteType =
  | {
      type: "fn";
      args: Type[];
      return: Type;
    }
  | {
      type: "named";
      moduleName: string;
      name: string;
      args: Type[];
    };

export type Type =
  | ConcreteType
  | {
      type: "var";
      var: TVar;
    };

export type TVarResolution =
  | { type: "unbound"; id: number; traits: string[] }
  | { type: "bound"; value: ConcreteType };

export type UnifyError = {
  type: UnifyErrorType;
  left: Type;
  right: Type;
};

function getNamedTypeTraitId(
  moduleName: string,
  typeName: string,
  trait: string,
): string {
  return `${moduleName}.${typeName}:${trait}`;
}

export type TraitImplDependency = string[] | undefined;
export class TVar {
  private constructor(
    private value: TVarResolution | { type: "linked"; to: TVar },
  ) {}

  /**
   * Example:
   * { "Json/Encode.Json:eq": null }
   */
  private static namedTypesTraitImpls = new Map<
    string,
    TraitImplDependency[]
  >();

  /**
   * E.g.
   * // impl eq for Int
   * registerTraitImpl("Basics", "Int", "eq")
   *
   * // impl eq for Result<a, b> where a: eq, b: eq
   * registerTraitImpl("Basics", "Result", "eq", [["eq"], ["eq"]])
   */
  static registerTraitImpl(
    moduleName: string,
    typeName: string,
    trait: string,
    dependencies: TraitImplDependency[],
  ) {
    const id = getNamedTypeTraitId(moduleName, typeName, trait);
    if (TVar.namedTypesTraitImpls.has(id)) {
      throw new Error("Cannot register trait twice for the same type");
    }

    TVar.namedTypesTraitImpls.set(id, dependencies);
  }

  private static concreteTypeImplementsTrait(
    t: ConcreteType,
    trait: string,
  ): boolean {
    if (t.type === "fn") {
      return false;
    }

    const id = getNamedTypeTraitId(t.moduleName, t.name, trait);

    const lookup = TVar.namedTypesTraitImpls.get(id);
    if (lookup === undefined) {
      return false;
    }

    if (lookup.length !== t.args.length) {
      throw new Error("[unreachable] invalid number of args or deps");
    }

    for (let i = 0; i < lookup.length; i++) {
      const deps = lookup[i];
      if (deps === undefined) {
        continue;
      }

      const arg = t.args[i]!;

      // TODO unify var
      if (arg.type === "var") {
        return true;
      }

      const argImplTrait = TVar.concreteTypeImplementsTrait(arg, trait);
      if (!argImplTrait) {
        return false;
      }
    }

    return true;
  }

  static resetTraitImpls() {
    TVar.namedTypesTraitImpls = new Map();
  }

  static fresh(traits: string[] = []): TVar {
    return new TVar({ type: "unbound", id: TVar.unboundId++, traits });
  }

  resolve(): TVarResolution {
    if (this.value.type === "linked") {
      return this.value.to.resolve();
    }

    return this.value;
  }

  private static unboundId = 0;
  static resetId() {
    TVar.unboundId = 0;
  }

  asType(): Type & { type: "var" } {
    return { type: "var", var: this };
  }

  static unify(t1: Type, t2: Type): UnifyError | undefined {
    // (Var, Var)
    if (t1.type === "var" && t2.type === "var") {
      return TVar.unifyVars(t1.var, t2.var);
    }

    // (Var, _)
    if (t1.type === "var" && t2.type !== "var") {
      const occurs = occursCheck(t1.var, t2);
      if (occurs) {
        return {
          type: "occurs-check",
          left: t1.var.asType(),
          right: t2,
        };
      }

      switch (t1.var.value.type) {
        case "bound":
          return TVar.unify(t1.var.value.value, t2);
        case "unbound":
          for (const trait of t1.var.value.traits) {
            const impl = TVar.concreteTypeImplementsTrait(t2, trait);
            // TODO better err
            if (!impl) {
              return {
                type: "type-mismatch",
                left: t1,
                right: t2,
              };
            }
          }
          t1.var.value = { type: "bound", value: t2 };
          return;
        case "linked":
          return TVar.unify(t1.var.value.to.asType(), t2);
        default:
          throw new Error("[unreachable]");
      }
    }

    // (_, Var)
    if (t2.type === "var") {
      return TVar.unify(t2, t1);
    }

    // (Named, Named)
    if (t1.type === "named" && t2.type === "named") {
      if (
        t1.name !== t2.name ||
        t1.moduleName !== t2.moduleName ||
        t1.args.length !== t2.args.length
      ) {
        return { type: "type-mismatch", left: t1, right: t2 };
      }

      for (let i = 0; i < t1.args.length; i++) {
        const res = TVar.unify(t1.args[i]!, t2.args[i]!);
        if (res !== undefined) {
          return res;
        }
      }

      return;
    }

    // (Fn, Fn)
    if (t1.type === "fn" && t2.type === "fn") {
      if (t1.args.length !== t2.args.length) {
        return { type: "type-mismatch", left: t1, right: t2 };
      }

      for (let i = 0; i < t1.args.length; i++) {
        const res = TVar.unify(t1.args[i]!, t2.args[i]!);
        if (res !== undefined) {
          return res;
        }
      }

      return TVar.unify(t1.return, t2.return);
    }

    // (_, _)
    return { type: "type-mismatch", left: t1, right: t2 };
  }

  private static unifyVars($1: TVar, $2: TVar): UnifyError | undefined {
    const r1 = $1.resolve();
    if (r1.type === "bound") {
      return TVar.unify($2.asType(), r1.value);
    }

    const r2 = $2.resolve();
    if (r2.type === "bound") {
      return TVar.unify($1.asType(), r2.value);
    }

    if ($2.value.type === "linked") {
      return TVar.unify($2.value.to.asType(), $1.asType());
    }

    if (r1.type === "unbound" && r2.type === "unbound" && r1.id === r2.id) {
      // TVars are already linked
      return;
    }

    // Unify traits
    for (const t of r2.traits) {
      if (!r1.traits.includes(t)) {
        r1.traits.push(t);
      }
    }

    $2.value = { type: "linked", to: $1 };
    return undefined;
  }
}

export type UnifyErrorType = "type-mismatch" | "occurs-check";

export const unify = TVar.unify;

// Occurs check on monotypes
function occursCheck(v: TVar, x: Type): boolean {
  if (x.type === "named") {
    return x.args.some((a) => occursCheck(v, a));
  }

  if (x.type === "fn") {
    return x.args.some((a) => occursCheck(v, a)) || occursCheck(v, x.return);
  }

  const resolvedV = v.resolve();
  if (resolvedV.type === "bound") {
    return false;
  }

  const resolvedX = x.var.resolve();
  if (resolvedX.type === "bound") {
    return occursCheck(v, resolvedX.value);
  }

  if (resolvedV.id === resolvedX.id) {
    return true;
  }

  return false;
}

export type Context = Record<string, Type>;

const FIRST_CHAR = "a".charCodeAt(0);
const LAST_CHAR = "z".charCodeAt(0);
const TOTAL_CHARS = LAST_CHAR - FIRST_CHAR + 1;

function generalizedName(count: number): string {
  const letter = String.fromCharCode(FIRST_CHAR + (count % TOTAL_CHARS));
  const rem = Math.floor(count / TOTAL_CHARS);

  if (rem === 0) {
    return letter;
  }

  return `${letter}${rem}`;
}

export type TypeScheme = Record<number, string>;

export type PolyType = [TypeScheme, Type];

export function generalizeAsScheme(
  mono: Type,
  initialScheme: TypeScheme = {},
): TypeScheme {
  const usedNames = new Set(Object.values(initialScheme));
  let nextId = 0;
  const scheme: TypeScheme = { ...initialScheme };

  function recur(mono: Type) {
    switch (mono.type) {
      case "var": {
        const res = mono.var.resolve();
        switch (res.type) {
          case "unbound": {
            if (res.id in scheme) {
              return;
            }

            // eslint-disable-next-line no-constant-condition
            while (true) {
              const name = generalizedName(nextId++);
              if (!usedNames.has(name)) {
                scheme[res.id] = name;
                break;
              }
            }

            return;
          }
          case "bound":
            recur(res.value);
            return;
        }
      }

      case "named":
        for (const arg of mono.args) {
          recur(arg);
        }
        return;

      case "fn":
        for (const arg of mono.args) {
          recur(arg);
        }
        recur(mono.return);
        return;
    }
  }

  recur(mono);
  return scheme;
}

export function instantiateFromScheme(mono: Type, scheme: TypeScheme): Type {
  const instantiated = new Map<string, TVar>();

  function recur(mono: Type): Type {
    switch (mono.type) {
      case "named":
        return {
          ...mono,
          args: mono.args.map(recur),
        };
      case "fn":
        if (mono.type !== "fn") {
          throw new Error("Invalid type");
        }

        return {
          type: "fn",
          args: mono.args.map(recur),
          return: recur(mono.return),
        };

      case "var": {
        const resolved = mono.var.resolve();
        switch (resolved.type) {
          case "unbound": {
            const boundId = scheme[resolved.id];
            if (boundId === undefined) {
              return mono;
            }

            const i = instantiated.get(boundId);
            if (i !== undefined) {
              return i.asType();
            }

            const t = TVar.fresh();
            instantiated.set(boundId, t);
            return t.asType();
          }
          case "bound":
            return recur(resolved.value);
        }
      }
    }
  }

  return recur(mono);
}

function typeToStringHelper(t: Type, scheme: TypeScheme): string {
  switch (t.type) {
    case "var": {
      const resolved = t.var.resolve();
      switch (resolved.type) {
        case "bound":
          return typeToStringHelper(resolved.value, scheme);
        case "unbound": {
          const id = scheme[resolved.id];
          if (id === undefined) {
            throw new Error("[unreachable] var not found: " + resolved.id);
          }
          return id;
        }
      }
    }

    case "fn": {
      const args = t.args
        .map((arg) => typeToStringHelper(arg, scheme))
        .join(", ");
      return `Fn(${args}) -> ${typeToStringHelper(t.return, scheme)}`;
    }

    case "named": {
      if (t.args.length === 0) {
        return t.name;
      }

      if (t.name === "Tuple2") {
        return `(${typeToStringHelper(t.args[0]!, scheme)}, ${typeToStringHelper(t.args[1]!, scheme)})`;
      }

      const args = t.args
        .map((arg) => typeToStringHelper(arg, scheme))
        .join(", ");
      return `${t.name}<${args}>`;
    }
  }
}

export function typeToString(t: Type, scheme?: TypeScheme): string {
  scheme = generalizeAsScheme(t, scheme);
  return typeToStringHelper(t, scheme);
}
