import { type Type } from "./type";

export function typePPrint(t: Type): string {
  switch (t.tag) {
    case "Var":
      return idToString(t.id);

    case "Named": {
      if (t.args.length === 0) {
        return t.name;
      }

      const args = t.args.map(typePPrint).join(", ");
      if (isTuple(t)) {
        return `(${args})`;
      }

      return `${t.name}<${args}>`;
    }

    case "Fn": {
      const args = t.args.map(typePPrint).join(", ");
      const ret = typePPrint(t.return);

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
