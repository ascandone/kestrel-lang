import { defaultMapGet } from "../data/defaultMap";

export type Type =
  | { tag: "Named"; name: string; args: Type[] }
  | { tag: "Fn"; args: Type[]; return: Type }
  | { tag: "Var"; id: number };

export class TypeMismatchError extends Error {}
export class OccursCheckError extends Error {}

export class Unifier {
  private nextId = 0;
  private substitutions = new Map<number, Type>();

  freshVar(): Type & { tag: "Var" } {
    return {
      tag: "Var",
      id: this.nextId++,
    };
  }

  resolve(t: Type): Type {
    t = this.resolveOnce(t);

    if (t.tag === "Var") {
      return t;
    }

    return {
      ...t,
      args: t.args.map((arg) => this.resolve(arg)),
    };
  }

  private resolveOnce(t: Type): Type {
    switch (t.tag) {
      case "Named":
      case "Fn":
        return t;

      case "Var": {
        const substitution = this.substitutions.get(t.id);
        if (substitution === undefined) {
          return t;
        }
        return this.resolveOnce(substitution);
      }
    }
  }

  /** Pre: id is the resolved's var id */
  private occursCheck(id: number, t: Type) {
    t = this.resolveOnce(t);

    switch (t.tag) {
      case "Var":
        if (t.id === id) {
          throw new OccursCheckError();
        }
        return;

      case "Named":
        for (const arg of t.args) {
          this.occursCheck(id, arg);
        }
        return;

      case "Fn":
        for (const arg of t.args) {
          this.occursCheck(id, arg);
        }
        this.occursCheck(id, t.return);
        return;
    }
  }

  unify(t1: Type, t2: Type) {
    t1 = this.resolveOnce(t1);
    t2 = this.resolveOnce(t2);

    if (
      (t1.tag === "Named" && t2.tag === "Fn") ||
      (t1.tag === "Fn" && t2.tag === "Named")
    ) {
      throw new TypeMismatchError();
    } else if (t1.tag === "Named" && t2.tag === "Named") {
      if (t1.name !== t2.name || t1.args.length !== t2.args.length) {
        throw new TypeMismatchError();
      }
      for (let i = 0; i < t1.args.length; i++) {
        this.unify(t1.args[i]!, t2.args[i]!);
      }
    } else if (t1.tag === "Fn" && t2.tag === "Fn") {
      if (t1.args.length !== t2.args.length) {
        throw new TypeMismatchError();
      }
      for (let i = 0; i < t1.args.length; i++) {
        this.unify(t1.args[i]!, t2.args[i]!);
      }
      this.unify(t1.return, t2.return);
    } else if (t1.tag === "Var" && t2.tag !== "Var") {
      this.occursCheck(t1.id, t2);
      this.substitutions.set(t1.id, t2);
    } else if (t1.tag !== "Var" && t2.tag === "Var") {
      this.unify(t2, t1);
    } else if (t1.tag === "Var" && t2.tag === "Var") {
      if (t1.id === t2.id) {
        return;
      }
      this.substitutions.set(t2.id, t1);
    } else {
      throw new Error("[unreachable]");
    }
  }

  instantiate(t: Type, resolve: boolean = true): Type {
    if (resolve) {
      t = this.resolve(t);
    }

    const instantiated = new Map<number, Type>();

    const helper = (t: Type): Type => {
      switch (t.tag) {
        case "Named":
          return {
            tag: "Named",
            name: t.name,
            args: t.args.map(helper),
          };

        case "Fn":
          return {
            tag: "Fn",
            args: t.args.map(helper),
            return: helper(t.return),
          };

        case "Var":
          return defaultMapGet(instantiated, t.id, () => this.freshVar());
      }
    };

    return helper(t);
  }
}

/** Pre: type is already resolved */
export function normalizeResolved(t: Type): Type {
  return new Unifier().instantiate(t);
}
