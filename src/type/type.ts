import { DefaultMap } from "../data/defaultMap";

export type ConcreteType =
  | {
      type: "rigid-var";
      name: string;
    }
  | {
      type: "fn";
      args: Type[];
      return: Type;
    }
  | {
      type: "named";
      package_: string;
      module: string;
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
  traits: Set<string>;
};

export type TypeResolution = ConcreteType | UnboundType;

export function resolveType(t: Type): TypeResolution {
  switch (t.type) {
    case "fn":
    case "named":
    case "rigid-var":
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
  | { type: "unbound"; id: number; traits: Set<string> }
  | { type: "bound"; value: ConcreteType };

export type UnifyError =
  | { type: "type-mismatch"; left: Type; right: Type }
  | { type: "occurs-check"; left: Type; right: Type }
  | { type: "missing-trait"; type_: Type; trait: string };

export type TraitsStore = {
  /**
   * e.g.
   *
   * `Result<a, b> impl Ord where b: Ord`
   *
   * is represented as:
   *
   * `[Set(), Set(["Ord"])]`
   *
   */
  getNamedTypeDependencies: (
    type_: {
      package_: string;
      module: string;
      name: string;
    },
    trait: string,
  ) => undefined | Set<string>[];

  getRigidVarImpl?(trait: string): boolean;
};

export class TVar {
  private constructor(
    private value: TVarResolution | { type: "linked"; to: TVar },
  ) {}

  static fresh(traits: string[] = []): TVar {
    const id = TVar.unboundId++;
    return new TVar({ type: "unbound", id, traits: new Set(traits) });
  }

  static freshType(traits: string[] = []): Type & { type: "var" } {
    return TVar.fresh(traits).asType();
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

  static unify(t1: Type, t2: Type, store: TraitsStore): UnifyError | undefined {
    // (Var, Var)
    if (t1.type === "var" && t2.type === "var") {
      return t1.var.unifyWith(t2.var, store);
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
          return TVar.unify(t1.var.value.value, t2, store);
        case "unbound":
          for (const trait of t1.var.value.traits) {
            const succeed = unifyTypeWithTraits(t2, trait, store);

            if (!succeed) {
              return {
                type: "missing-trait",
                type_: t2,
                trait,
              };
            }
          }

          t1.var.value = { type: "bound", value: t2 };
          return;
        case "linked":
          return TVar.unify(t1.var.value.to.asType(), t2, store);
        default:
          t1.var.value satisfies never;
      }
    }

    // (_, Var)
    if (t2.type === "var") {
      return TVar.unify(t2, t1, store);
    }

    // (Named, Named)
    if (t1.type === "named" && t2.type === "named") {
      if (
        t1.name !== t2.name ||
        t1.module !== t2.module ||
        t1.package_ !== t2.package_ ||
        t1.args.length !== t2.args.length
      ) {
        return { type: "type-mismatch", left: t1, right: t2 };
      }

      for (let i = 0; i < t1.args.length; i++) {
        const res = TVar.unify(t1.args[i]!, t2.args[i]!, store);
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
        const res = TVar.unify(t1.args[i]!, t2.args[i]!, store);
        if (res !== undefined) {
          return res;
        }
      }

      return TVar.unify(t1.return, t2.return, store);
    }

    if (
      t1.type === "rigid-var" &&
      t2.type === "rigid-var" &&
      t1.name === t2.name
    ) {
      return;
    }

    // (_, _)
    return { type: "type-mismatch", left: t1, right: t2 };
  }

  private unifyWith(other: TVar, store: TraitsStore): UnifyError | undefined {
    const r1 = this.resolve();
    if (r1.type === "bound") {
      return TVar.unify(other.asType(), r1.value, store);
    }

    const r2 = other.resolve();
    if (r2.type === "bound") {
      return TVar.unify(this.asType(), r2.value, store);
    }

    if (other.value.type === "linked") {
      return TVar.unify(other.value.to.asType(), this.asType(), store);
    }

    if (r1.type === "unbound" && r2.type === "unbound" && r1.id === r2.id) {
      // TVars are already linked
      return;
    }

    // Unify traits
    for (const t of r2.traits) {
      r1.traits.add(t);
    }

    other.value = { type: "linked", to: this };
    return undefined;
  }
}

export const unify = TVar.unify;

// Occurs check on monotypes
function occursCheck(v: TVar, x: Type): boolean {
  if (x.type === "rigid-var") {
    return false;
  }

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

const FIRST_CHAR = "a".charCodeAt(0);
const LAST_CHAR = "z".charCodeAt(0);
const TOTAL_CHARS = LAST_CHAR - FIRST_CHAR + 1;

function counterToTypeName(count: number): string {
  const letter = String.fromCharCode(FIRST_CHAR + (count % TOTAL_CHARS));
  const rem = Math.floor(count / TOTAL_CHARS);

  if (rem === 0) {
    return letter;
  }

  return `${letter}${rem}`;
}

export function instantiate(mono: Type, rigidVarsCtx: RigidVarsCtx) {
  return new Instantiator(rigidVarsCtx).instantiate(mono);
}

// TODO make this class private
export class Instantiator {
  constructor(private readonly rigidVarsCtx: RigidVarsCtx = {}) {}

  public readonly instantiatedRigid = new DefaultMap<string, Type>((name) =>
    TVar.fresh([...(this.rigidVarsCtx[name] ?? new Set())]).asType(),
  );
  public readonly instantiatedFlex = new DefaultMap<number, Type>(() =>
    TVar.freshType(),
  );

  public instantiate(mono_: Type): Type {
    const mono = resolveType(mono_);

    switch (mono.type) {
      case "rigid-var":
        return this.instantiatedRigid.get(mono.name);

      case "named":
        return {
          ...mono,
          args: mono.args.map((a) => this.instantiate(a)),
        };

      case "fn":
        return {
          type: "fn",
          args: mono.args.map((a) => this.instantiate(a)),
          return: this.instantiate(mono.return),
        };

      case "unbound":
        // TODO double check
        return this.instantiatedFlex.get(mono.id);
    }
  }
}

/**
 * The rigid variables present in the currently enclosing declaration.
 * They are used to avoid showing the same tvar name for a flex var and a rigid var with the same name
 * */
export type RigidVarsCtx = {
  [flexVar: string]: Set<string>;
};

function fillRigidVars(type: Type, /* &mut */ ctx: RigidVarsCtx) {
  const resolved = resolveType(type);
  switch (resolved.type) {
    case "unbound":
      break;

    case "rigid-var":
      if (!(resolved.name in ctx)) {
        ctx[resolved.name] = new Set();
      }
      break;

    case "fn":
      for (const arg of resolved.args) {
        fillRigidVars(arg, ctx);
      }
      fillRigidVars(resolved.return, ctx);
      break;

    case "named":
      for (const arg of resolved.args) {
        fillRigidVars(arg, ctx);
      }
      break;

    default:
      return resolved satisfies never;
  }
}

export function typeToString(
  type: Type,
  ctx: RigidVarsCtx = {},
  declarationType?: Type,
): string {
  ctx = { ...ctx };

  if (declarationType !== undefined) {
    fillRigidVars(declarationType, ctx);
  }

  return new TypePrinter(ctx).printWithTraits(type);
}

class TypePrinter {
  private flexVarNames = new Map<number, string>();
  private currentFlexId = 0;

  constructor(private ctx: RigidVarsCtx) {}

  public printWithTraits(type: Type): string {
    const type_ = this.typeToString(type);
    const where = this.getWhereClause();

    if (where.length === 0) {
      return type_;
    }

    return `${type_} where ${where.join(", ")}`;
  }

  private getWhereClause(): string[] {
    return Object.entries(this.ctx)
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([k, v]) => {
        if (v.size === 0) {
          return [];
        }

        const sortedTraits = [...v].sort().join(" + ");

        return [`${k}: ${sortedTraits}`];
      });
  }

  private getFlexName(): string {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const id = this.currentFlexId++;
      const name = counterToTypeName(id);
      if (!(name in this.ctx)) {
        return name;
      }
    }
  }

  private typeToString(type: Type): string {
    const t = resolveType(type);
    switch (t.type) {
      case "rigid-var":
        return t.name;

      case "unbound": {
        const v = this.flexVarNames.get(t.id);
        if (v !== undefined) {
          return v;
        }

        const name = this.getFlexName();
        this.ctx[name] = new Set(t.traits);
        this.flexVarNames.set(t.id, name);
        return name;
      }

      case "fn": {
        const args = t.args.map((arg) => this.typeToString(arg)).join(", ");
        return `Fn(${args}) -> ${this.typeToString(t.return)}`;
      }

      case "named": {
        if (t.args.length === 0) {
          return t.name;
        }

        if (t.module === "Tuple" && /Tuple[0-9]+/.test(t.name)) {
          const inner = t.args.map((arg) => this.typeToString(arg)).join(", ");
          return `(${inner})`;
        }

        const args = t.args.map((arg) => this.typeToString(arg)).join(", ");
        return `${t.name}<${args}>`;
      }
    }
  }
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

/**
 * Add a trait constraint to a type. Fail if any dependency fails.
 * E.g.
 * ```
 * unifyTypeWithTraits("List<a> where a: Ord", "Ord") //=> ok (no changes)
 * unifyTypeWithTraits("List<'t0>", "Ord") //=> ok (unifies 't0 with "Ord")
 * unifyTypeWithTraits("NotOrd<'t0>", "Ord") //=> fails
 * ```
 * */
function unifyTypeWithTraits(
  type: Type,
  trait: string,
  store: TraitsStore,
): boolean {
  const resolved = resolveType(type);
  switch (resolved.type) {
    case "fn":
      return false;

    case "named": {
      const deps = store.getNamedTypeDependencies(resolved, trait);
      if (deps === undefined) {
        return false;
      }

      let succeed = true;
      for (let index = 0; index < resolved.args.length; index++) {
        // we assume deps correctly match with type's args
        const arg = resolved.args[index]!;
        const neededTraits = deps[index]!;

        for (const neededTrait of neededTraits) {
          // we avoid exiting early to make fault tolerant unification more precise
          succeed &&= unifyTypeWithTraits(arg, neededTrait, store);
        }
      }

      return succeed;
    }

    case "rigid-var":
      return store.getRigidVarImpl?.(trait) ?? false;

    case "unbound":
      resolved.traits.add(trait);
      return true;
  }
}

export const DUMMY_STORE: TraitsStore = {
  getRigidVarImpl() {
    return false;
  },
  getNamedTypeDependencies() {
    return undefined;
  },
};
