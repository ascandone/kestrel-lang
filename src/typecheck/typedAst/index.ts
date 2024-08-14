import { TypedModule } from "../typedAst";

// TODO find a decent name
export type DependenciesProvider = {
  getModuleByNs(ns: string): TypedModule | undefined;
};

export function makeObjectDepedenciesProvider(
  o: Record<string, TypedModule>,
): DependenciesProvider {
  return {
    getModuleByNs(ns) {
      return o[ns];
    },
  };
}
