/* eslint-disable no-constant-condition */
export type DepsMap = Record<string, string[]>;

export class CyclicDepError extends Error {
  constructor(
    public sorted: string[],
    public deps: string[],
  ) {
    super("Cyclic deps detected");
  }
}

export function topologicalSort(
  dependencies: Record<string, string[]>,
): string[] {
  const sources = new Set(Object.keys(dependencies));
  for (const deps of Object.values(dependencies)) {
    for (const dep of deps) {
      sources.delete(dep);
    }
  }

  // Now `sources` only contains nodes without deps

  const visited = new Set<string>();
  const sorted: string[] = [];

  function visit(node: string) {
    visited.add(node);
    const adjs = dependencies[node] ?? [];
    for (const adj of adjs) {
      if (!visited.has(adj)) {
        visit(adj);
      }
    }
    sorted.push(node);
  }

  for (const source of sources) {
    visit(source);
  }

  if (sorted.length < Object.keys(dependencies).length) {
    throw new CyclicDepError(sorted, Object.keys(dependencies));
  }

  return sorted;
}
