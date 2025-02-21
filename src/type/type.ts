import { defaultMapGet } from "../data/defaultMap";
import { TraitImpl } from "../typecheck/defaultImports";

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
export class MissingTraitError extends Error {
  constructor(public trait: string) {
    super();
  }
}

export class Unifier {
  private nextId = 0;
  private readonly substitutions = new Map<number, Type>();
  private readonly traits = new Map<number, Set<string>>();
  private static namedTypesTraitImpls = new Map<ImpKey, boolean[]>();

  freshVar(traits: Iterable<string> = []): Type & { tag: "Var" } {
    const id = this.nextId++;
    this.traits.set(id, new Set(traits));
    return {
      tag: "Var",
      id,
    };
  }

  public getResolvedTypeTraitsMut(id: number): Set<string> {
    return defaultMapGet(this.traits, id, () => new Set());
  }

  getResolvedTypeTraits(id: number) {
    const values = [...this.getResolvedTypeTraitsMut(id).values()];
    values.sort();
    return values;
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
      this.link(t1.id, t2);
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

  instantiate(t: Type, traitsMap: TraitsMap = {}): Type {
    return new Instantiator(this).instantiate(t, traitsMap);
  }

  private assocTraits(type: Type, traits: Set<string>) {
    switch (type.tag) {
      case "Var": {
        const newPointerTraits = this.getResolvedTypeTraitsMut(type.id);

        for (const trait of traits) {
          newPointerTraits.add(trait);
        }

        break;
      }

      case "Named": {
        for (const trait of traits) {
          const key = getNamedTypeTraitId({
            packageName: type.package,
            moduleName: type.module,
            typeName: type.name,
            trait,
          });
          const deps = Unifier.namedTypesTraitImpls.get(key);

          if (deps === undefined) {
            throw new MissingTraitError(trait);
          }

          if (deps.length !== type.args.length) {
            throw new Error(
              "[unrechable] invalidy arity for trait declaration",
            );
          }

          for (let i = 0; i < deps.length; i++) {
            const isArgumentADepedency = deps[i]!,
              arg = type.args[i]!;

            if (isArgumentADepedency) {
              this.assocTraits(arg, new Set([trait]));
            }
          }
        }
        break;
      }

      case "Fn":
        for (const trait of traits) {
          throw new MissingTraitError(trait);
        }
        break;
    }
  }

  private link(id: number, type: Type) {
    this.assocTraits(type, this.getResolvedTypeTraitsMut(id));
    this.substitutions.set(id, type);
  }

  public static resetTraitImpls() {
    Unifier.namedTypesTraitImpls = new Map();
  }

  /**
   * E.g.
   * // impl Eq for Int
   * registerTraitImpl("Basics", "Int", "Eq")
   *
   * // impl Eq for Result<a, b> where a: Eq, b: Eq
   * registerTraitImpl("Basics", "Result", "Eq", [true, true])
   */

  public static registerTraitImpl(traitImpl: TraitImpl, register = true) {
    const key = getNamedTypeTraitId(traitImpl);
    if (Unifier.namedTypesTraitImpls.has(key)) {
      throw new Error(
        `[unreachable] cannot register a trait twice (while declaring ${key})`,
      );
    }
    if (register) {
      Unifier.namedTypesTraitImpls.set(key, traitImpl.deps ?? []);
    } else {
      Unifier.namedTypesTraitImpls.delete(key);
    }
  }
}

/** Pre: type is already resolved */
export function normalizeResolved(t: Type): Type {
  return new Unifier().instantiate(t);
}

export type TraitsMap = Record<number, string[]>;
export class Instantiator {
  constructor(private unifier: Unifier) {}

  private readonly instantiated = new Map<number, Type>();

  public instantiate(t: Type, traitsMap: TraitsMap = {}): Type {
    switch (t.tag) {
      case "Named":
        return {
          tag: "Named",
          name: t.name,
          args: t.args.map((t) => this.instantiate(t, traitsMap)),
          module: t.module,
          package: t.package,
        };

      case "Fn":
        return {
          tag: "Fn",
          args: t.args.map((t) => this.instantiate(t, traitsMap)),
          return: this.instantiate(t.return, traitsMap),
        };

      case "Var":
        return defaultMapGet(this.instantiated, t.id, () => {
          const traits = traitsMap[t.id] ?? [];
          traits.push(...this.unifier.getResolvedTypeTraits(t.id));

          const fv = this.unifier.freshVar(traits);

          return fv;
        });
    }
  }
}

type ImpKey = string;

function getNamedTypeTraitId({
  packageName,
  moduleName,
  typeName,
  trait,
}: TraitImpl): ImpKey {
  return `${packageName}:${moduleName}.${typeName}:${trait}`;
}
