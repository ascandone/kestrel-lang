import { PolyTypeMeta } from "../typecheck/typedAst";

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

export type UnboundType = {
  type: "unbound";
  id: number;
  traits: string[];
};

export type TypeResolution = ConcreteType | UnboundType;

export function resolveType(t: Type): TypeResolution {
  switch (t.type) {
    case "fn":
    case "named":
      return t;

    case "var": {
      const resolved = t.var.resolve();
      switch (resolved.type) {
        case "bound":
          return resolveType(resolved.value);

        case "unbound":
          return resolved;
      }
    }
  }
}

export type TVarResolution =
  | { type: "unbound"; id: number; traits: string[] }
  | { type: "bound"; value: ConcreteType };

export type UnifyError =
  | { type: "type-mismatch"; left: Type; right: Type }
  | { type: "occurs-check"; left: Type; right: Type }
  | { type: "missing-trait"; type_: Type; trait: string };

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
    TVar.namedTypesTraitImpls.set(id, dependencies);
  }

  static removeTraitImpl(moduleName: string, typeName: string, trait: string) {
    const id = getNamedTypeTraitId(moduleName, typeName, trait);
    TVar.namedTypesTraitImpls.delete(id);
  }

  static typeImplementsTrait(
    t: Type,
    trait: string,
  ): Array<{ id: number; traits: string[] }> | undefined {
    if (t.type === "var") {
      const resolved = t.var.resolve();
      if (resolved.type === "unbound") {
        return [resolved];
      }

      return this.typeImplementsTrait(resolved.value, trait);
    }

    if (t.type === "fn") {
      return undefined;
    }

    const id = getNamedTypeTraitId(t.moduleName, t.name, trait);

    const lookup = TVar.namedTypesTraitImpls.get(id);
    if (lookup === undefined) {
      return undefined;
    }

    if (lookup.length !== t.args.length) {
      // this error has been emitted somewhere else
      return undefined;
      // throw new Error(
      //   `[unreachable] invalid number of args or deps (lookup: ${lookup.length}, args: ${t.args.length})`,
      // );
    }

    const r: Array<{ id: number; traits: string[] }> = [];
    for (let i = 0; i < lookup.length; i++) {
      const deps = lookup[i];
      if (deps === undefined) {
        continue;
      }

      const arg = t.args[i]!;

      const argImplTrait = TVar.typeImplementsTrait(arg, trait);
      if (argImplTrait === undefined) {
        return undefined;
      }

      r.push(...argImplTrait);
    }

    return r;
  }

  static resetTraitImpls() {
    TVar.namedTypesTraitImpls = new Map();
  }

  static fresh(traits: string[] = []): TVar {
    const [tvar] = TVar.freshWithId(traits);
    return tvar;
  }

  static freshWithId(traits: string[] = []): [TVar, number] {
    const id = TVar.unboundId++;
    return [new TVar({ type: "unbound", id, traits }), id];
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
            const deps = TVar.typeImplementsTrait(t2, trait);
            // TODO better err: should narrow this error to missing constraint source
            if (deps === undefined) {
              return {
                type: "missing-trait",
                type_: t2,
                trait,
              };
            }

            for (const dep of deps) {
              if (!dep.traits.includes(trait)) {
                dep.traits.push(trait);
              }
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

export function instantiatePoly(poly: PolyTypeMeta): Type {
  return instantiateFromScheme(poly.$type.asType(), poly.$scheme);
}

export class Instantiator {
  private instantiated = new Map<string, TVar>();

  instantiateFromScheme(mono: Type, scheme: TypeScheme): Type {
    switch (mono.type) {
      case "named":
        return {
          ...mono,
          args: mono.args.map((a) => this.instantiateFromScheme(a, scheme)),
        };
      case "fn":
        if (mono.type !== "fn") {
          throw new Error("Invalid type");
        }

        return {
          type: "fn",
          args: mono.args.map((a) => this.instantiateFromScheme(a, scheme)),
          return: this.instantiateFromScheme(mono.return, scheme),
        };

      case "var": {
        const resolved = mono.var.resolve();
        switch (resolved.type) {
          case "unbound": {
            const boundId = scheme[resolved.id];
            if (boundId === undefined) {
              return mono;
            }

            const i = this.instantiated.get(boundId);
            if (i !== undefined) {
              return i.asType();
            }

            const t = TVar.fresh([...resolved.traits]);
            this.instantiated.set(boundId, t);
            return t.asType();
          }
          case "bound":
            return this.instantiateFromScheme(resolved.value, scheme);
        }
      }
    }
  }

  instantiatePoly(poly: PolyTypeMeta) {
    return this.instantiateFromScheme(poly.$type.asType(), poly.$scheme);
  }
}

export function instantiateFromScheme(mono: Type, scheme: TypeScheme): Type {
  return new Instantiator().instantiateFromScheme(mono, scheme);
}

function typeToStringHelper(
  t: Type,
  scheme: TypeScheme,
  collectTraits: Record<string, Set<string>>,
): string {
  switch (t.type) {
    case "var": {
      const resolved = t.var.resolve();
      switch (resolved.type) {
        case "bound":
          return typeToStringHelper(resolved.value, scheme, collectTraits);
        case "unbound": {
          const id = scheme[resolved.id];
          if (id === undefined) {
            throw new Error("[unreachable] var not found: " + resolved.id);
          }
          if (collectTraits !== undefined) {
            if (!(id in collectTraits)) {
              collectTraits[id] = new Set();
            }
            const lookup = collectTraits[id]!;
            for (const trait of resolved.traits) {
              lookup.add(trait);
            }

            resolved.traits;
          }

          return id;
        }
      }
    }

    case "fn": {
      const args = t.args
        .map((arg) => typeToStringHelper(arg, scheme, collectTraits))
        .join(", ");
      return `Fn(${args}) -> ${typeToStringHelper(t.return, scheme, collectTraits)}`;
    }

    case "named": {
      if (t.args.length === 0) {
        return t.name;
      }

      if (t.moduleName === "Tuple" && /Tuple[0-9]+/.test(t.name)) {
        const inner = t.args
          .map((arg) => typeToStringHelper(arg, scheme, collectTraits))
          .join(", ");
        return `(${inner})`;
      }

      const args = t.args
        .map((arg) => typeToStringHelper(arg, scheme, collectTraits))
        .join(", ");
      return `${t.name}<${args}>`;
    }
  }
}

export function typeToString(t: Type, scheme?: TypeScheme): string {
  scheme = generalizeAsScheme(t, scheme);
  const traits: Record<string, Set<string>> = {};
  const ret = typeToStringHelper(t, scheme, traits);

  const isThereAtLeastATrait = Object.values(traits).some((t) => t.size !== 0);
  if (!isThereAtLeastATrait) {
    return ret;
  }

  const sortedTraits = Object.entries(traits)
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([k, v]) => {
      if (v.size === 0) {
        return [];
      }

      const sortedTraits = [...v].sort().join(" + ");

      return [`${k}: ${sortedTraits}`];
    });

  if (sortedTraits.length === 0) {
    return ret;
  }

  return `${ret} where ${sortedTraits.join(", ")}`;
}

export function findUnboundTypeVars(t: Type): UnboundType[] {
  const vars: UnboundType[] = [];

  function helper(t: Type) {
    const resolved = resolveType(t);

    switch (resolved.type) {
      case "fn":
        for (const arg of resolved.args) {
          helper(arg);
        }
        helper(resolved.return);
        return;

      case "named":
        for (const arg of resolved.args) {
          helper(arg);
        }
        return;

      case "unbound":
        vars.push(resolved);
        return;
    }
  }

  helper(t);

  return vars;
}
