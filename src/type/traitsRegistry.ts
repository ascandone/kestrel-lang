import { Type } from "../type";

export type TypeId = {
  package: string;
  module: string;
  name: string;
};

export interface ITraitsRegistry {
  getTraitImplDependencies: (
    trait: string,
    type: TypeId,
  ) => boolean[] | undefined;
}

export class TraitRegistry implements ITraitsRegistry {
  private readonly registeredTraits = new Map<string, boolean[]>();
  constructor(private readonly baseRegistry?: TraitRegistry) {}

  static from(
    impls: {
      packageName: string;
      moduleName: string;
      typeName: string;
      trait: string;
      deps?: boolean[];
    }[],
  ) {
    const reg = new TraitRegistry();
    for (const impl of impls) {
      reg.registerTrait(
        impl.trait,
        {
          module: impl.moduleName,
          package: impl.packageName,
          name: impl.typeName,
        },
        impl.deps ?? [],
      );
    }
    return reg;
  }

  private static getNamedTypeTraitId(trait: string, t: TypeId): string {
    return `${t.package}:${t.module}.${t.name}:${trait}`;
  }

  registerTrait(trait: string, type: TypeId, deps: boolean[]) {
    const key = TraitRegistry.getNamedTypeTraitId(trait, type);
    this.registeredTraits.set(key, deps);
  }

  unregisterTrait(trait: string, type: TypeId) {
    const key = TraitRegistry.getNamedTypeTraitId(trait, type);
    this.registeredTraits.delete(key);
  }

  getTraitImplDependencies(trait: string, type: TypeId): boolean[] | undefined {
    const baseLookup = this.baseRegistry?.getTraitImplDependencies(trait, type);
    if (baseLookup !== undefined) {
      return baseLookup;
    }

    const key = TraitRegistry.getNamedTypeTraitId(trait, type);
    return this.registeredTraits.get(key);
  }

  getTraitDepsFor(
    trait: string,
    type: Type,
    initialSet = new Set<number>(),
  ): Set<number> | undefined {
    const neededVars = initialSet;
    class CannotDerive extends Error {}

    const recur = (type: Type) => {
      switch (type.tag) {
        case "Fn":
          throw new CannotDerive();

        case "Var":
          neededVars.add(type.id);
          return;

        case "Named": {
          const deps = this.getTraitImplDependencies(trait, type);
          if (deps === undefined) {
            throw new CannotDerive();
          }

          for (let i = 0; i < deps.length; i++) {
            if (!deps[i]!) {
              continue;
            }
            recur(type.args[i]!);
          }
        }
      }
    };

    try {
      recur(type);
      return neededVars;
    } catch (err) {
      if (!(err instanceof CannotDerive)) {
        throw err;
      }

      return undefined;
    }
  }
}
