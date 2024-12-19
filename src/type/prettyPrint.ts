import { type Type } from "./type";

export function typePPrint(
  t: Type,
  getTraits: (id: number) => string[] = () => [],
): string {
  const traitsMap = new Map<string, string[]>();
  const str = typePPrintHelper(t, (id, name) => {
    const traits = getTraits(id);
    traitsMap.set(name, traits);
  });

  return `${str}${showTraits(traitsMap)}`;
}

function showTraits(traitsMap: Map<string, string[]>): string {
  const values = [...traitsMap.entries()]
    .filter(([, traits]) => traits.length !== 0)
    .sort(([id1], [id2]) => (id1 < id2 ? -1 : 1))
    .map(([k, [...traits]]) => {
      const sortedTraits = traits.sort().join(" + ");
      return `${k}: ${sortedTraits}`;
    });

  if (values.length === 0) {
    return "";
  }

  return ` where ${values.join(", ")}`;
}

function typePPrintHelper(
  t: Type,
  onFoundVar: (id: number, name: string) => void,
): string {
  switch (t.tag) {
    case "Var": {
      const id = idToString(t.id);
      onFoundVar(t.id, id);
      return id;
    }

    case "Named": {
      if (t.args.length === 0) {
        return t.name;
      }

      const args = t.args
        .map((t) => typePPrintHelper(t, onFoundVar))
        .join(", ");
      if (isTuple(t)) {
        return `(${args})`;
      }

      return `${t.name}<${args}>`;
    }

    case "Fn": {
      const args = t.args
        .map((t) => typePPrintHelper(t, onFoundVar))
        .join(", ");
      const ret = typePPrintHelper(t.return, onFoundVar);

      return `Fn(${args}) -> ${ret}`;
    }
  }
}

function idToString(id: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const index = id % chars.length;
  const ch = chars[index]!;

  const rem = Math.floor(id / chars.length);

  if (rem === 0) {
    return ch;
  }

  return `${ch}${rem - 1}`;
}

function isTuple(t: Type & { tag: "Named" }): boolean {
  return /Tuple/.test(t.name);
}
