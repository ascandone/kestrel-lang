import { UntypedImport, UntypedModule } from "../ast";
import { topologicalSort } from "../utils/topsort";
import { CORE_MODULES, defaultImports } from "./defaultImports";

export function topSortedModules(
  project: Record<string, UntypedModule>,
  implicitImports: UntypedImport[] = defaultImports,
): string[] {
  const implNsImports = implicitImports.map((i) => i.ns);

  const dependencyGraph: Record<string, string[]> = {};
  for (const [ns, program] of Object.entries(project)) {
    const deps = CORE_MODULES.includes(ns)
      ? getDependencies(program)
      : [...implNsImports, ...getDependencies(program)];

    dependencyGraph[ns] = deps;
  }

  return topologicalSort(dependencyGraph);
}

function getDependencies(program: UntypedModule): string[] {
  return program.imports.map((i) => i.ns);
}
