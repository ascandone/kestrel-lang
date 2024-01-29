/* eslint-disable no-constant-condition */
export type DepsMap = Record<string, string[]>;

export class CyclicDepError extends Error {}

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

  const sorted: string[] = [];
  for (const source of sources) {
    const stack = [source];
    const visited = new Set<string>();

    while (true) {
      const popped = stack.pop();
      if (popped === undefined) {
        break;
      }
      sorted.push(popped);
      visited.add(popped);

      const adjs = dependencies[popped] ?? [];
      for (const dep of adjs) {
        if (!visited.has(dep)) {
          stack.push(dep);
        }
      }
    }
  }

  if (sorted.length !== Object.keys(dependencies).length) {
    throw new CyclicDepError();
  }
  sorted.reverse();
  return sorted;
}
