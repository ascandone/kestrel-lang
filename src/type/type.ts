import { defaultMapGet } from "../data/defaultMap";

export type Type =
  | {
      tag: "Named";
      name: string;
      args: Type[];
      module: string;
      package: string;
    }
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

    switch (t.tag) {
      case "Var":
        return t;

      case "Named":
        return {
          tag: "Named",
          module: t.module,
          name: t.name,
          package: t.package,
          args: t.args.map((arg) => this.resolve(arg)),
        };

      case "Fn":
        return {
          tag: "Fn",
          args: t.args.map((arg) => this.resolve(arg)),
          return: this.resolve(t.return),
        };
    }
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
        const resolution = this.resolveOnce(substitution);
        this.substitutions.set(t.id, resolution);
        return resolution;
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

    // case (Var id, Var id1) where id == id1
    if (t1.tag === "Var" && t2.tag === "Var" && t1.id === t2.id) {
      return;
    }

    // case (Var id, Var id1)
    if (t1.tag === "Var" && t2.tag === "Var") {
      this.substitutions.set(t2.id, t1);
      return;
    }

    // case (Named name mod _, Named name1 mod _) where arity, name, mod, package is eq
    if (
      t1.tag === "Named" &&
      t2.tag === "Named" &&
      t1.name === t2.name &&
      t1.module === t2.module &&
      t1.package === t2.package &&
      t1.args.length === t2.args.length
    ) {
      for (let i = 0; i < t1.args.length; i++) {
        this.unify(t1.args[i]!, t2.args[i]!);
      }
      return;
    }

    // case (Named _ , Named _)
    if (t1.tag === "Named" && t2.tag === "Named") {
      throw new TypeMismatchError();
    }

    // case (Fn _ _, Fn _ _) where arity is eq
    if (
      t1.tag === "Fn" &&
      t2.tag === "Fn" &&
      t1.args.length === t2.args.length
    ) {
      for (let i = 0; i < t1.args.length; i++) {
        this.unify(t1.args[i]!, t2.args[i]!);
      }
      this.unify(t1.return, t2.return);
      return;
    }

    // case (Fn _ _, Fn _ _)
    if (t1.tag === "Fn" && t2.tag === "Fn") {
      throw new TypeMismatchError();
    }

    // case (Var _, _)
    if (t1.tag === "Var") {
      this.occursCheck(t1.id, t2);
      this.substitutions.set(t1.id, t2);
      return;
    }

    // case (_, Var _)
    if (t2.tag === "Var") {
      this.unify(t2, t1);
      return;
    }

    // case (_, _)
    throw new TypeMismatchError();
  }

  instantiate(t: Type, resolve: boolean): Type {
    if (resolve) {
      t = this.resolve(t);
    }

    return new Instantiator(this).instantiate(t);
  }
}

/** Pre: type is already resolved */
export function normalizeResolved(t: Type): Type {
  return new Unifier().instantiate(t, false);
}

export class Instantiator {
  constructor(private unifier: Unifier) {}

  private readonly instantiated = new Map<number, Type>();

  public instantiate(t: Type): Type {
    switch (t.tag) {
      case "Named":
        return {
          tag: "Named",
          name: t.name,
          args: t.args.map((t) => this.instantiate(t)),
          module: t.module,
          package: t.package,
        };

      case "Fn":
        return {
          tag: "Fn",
          args: t.args.map((t) => this.instantiate(t)),
          return: this.instantiate(t.return),
        };

      case "Var":
        return defaultMapGet(this.instantiated, t.id, () =>
          this.unifier.freshVar(),
        );
    }
  }
}
