export type ConcreteType =
  | {
      type: "fn";
      args: Type[];
      return: Type;
    }
  | {
      type: "named";
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
  | { type: "unbound"; id: number }
  | { type: "bound"; value: ConcreteType }
  | { type: "quantified"; id: number };

export type UnifyError = {
  type: UnifyErrorType;
  left: Type;
  right: Type;
};

export class TVar {
  private constructor(
    private value: TVarResolution | { type: "linked"; to: TVar },
  ) {}

  static fresh(): TVar {
    return new TVar({ type: "unbound", id: TVar.unboundId++ });
  }

  static quantified(id: number): TVar {
    return new TVar({ type: "quantified", id });
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

  asType(): Type {
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
      if (t1.name !== t2.name || t1.args.length !== t2.args.length) {
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
  if (resolvedV.type === "quantified") {
    throw new Error("[unreachable] 0");
  }

  if (resolvedV.type === "bound") {
    return false;
  }

  const resolvedX = x.var.resolve();
  if (resolvedX.type === "quantified") {
    throw new Error("[unreachable] 2");
  }

  if (resolvedX.type === "bound") {
    return false;
  }

  if (resolvedV.id === resolvedX.id) {
    return true;
  }

  return false;
}
export type Context = Record<string, Type>;

function* getTypeFreeVars(t: Type): Generator<number> {
  if (t.type === "var") {
    const resolved = t.var.resolve();
    if (resolved.type === "unbound") {
      yield resolved.id;
    }
    return;
  }

  if (t.type === "named") {
    for (const arg of t.args) {
      yield* getTypeFreeVars(arg);
    }
    return;
  }

  if (t.type === "fn") {
    for (const arg of t.args) {
      yield* getTypeFreeVars(arg);
    }
    yield* getTypeFreeVars(t.return);
    return;
  }
}

/** Returns the set of ids of free vars in a context  */
function getContextFreeVars(context: Context): Set<number> {
  const s = new Set<number>();
  for (const t of Object.values(context)) {
    for (const id of getTypeFreeVars(t)) {
      s.add(id);
    }
  }
  return s;
}

export function generalize(t: Type, context: Context = {}): Type {
  const ctxFreeVars = getContextFreeVars(context);
  let nextId = 0;
  const bound = new Map<number, number>();

  function recur(t: Type): Type {
    if (t.type === "named") {
      return {
        type: "named",
        name: t.name,
        args: t.args.map(recur),
      };
    }

    if (t.type === "fn") {
      return {
        type: "fn",
        args: t.args.map(recur),
        return: recur(t.return),
      };
    }

    const resolvedT = t.var.resolve();
    switch (resolvedT.type) {
      case "quantified":
        throw new Error("[unreachable] cannot generalize polytype");
      case "bound":
        return recur(resolvedT.value);
      case "unbound": {
        if (ctxFreeVars.has(resolvedT.id)) {
          return t;
        }

        const thisId = bound.get(resolvedT.id) ?? nextId++;
        bound.set(resolvedT.id, thisId);
        return TVar.quantified(thisId).asType();
      }
    }
  }

  return recur(t);
}

export function instantiate(t: Type): Type {
  const instantiated = new Map<number, TVar>();

  function recur(t: Type): Type {
    if (t.type === "named") {
      return {
        type: "named",
        name: t.name,
        args: t.args.map(recur),
      };
    }

    if (t.type === "fn") {
      return {
        type: "fn",
        args: t.args.map(recur),
        return: recur(t.return),
      };
    }

    const resolvedT = t.var.resolve();
    switch (resolvedT.type) {
      case "bound":
      case "unbound":
        return t;
      case "quantified": {
        const lookup = instantiated.get(resolvedT.id);
        if (lookup === undefined) {
          const fresh = TVar.fresh();
          instantiated.set(resolvedT.id, fresh);
          return fresh.asType();
        }
        return lookup.asType();
      }
    }
  }

  return recur(t);
}
