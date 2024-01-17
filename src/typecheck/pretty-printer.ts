import { Type, generalize } from "./unify";

function pprintHelper(t: Type): string {
  switch (t.type) {
    case "var": {
      const resolved = t.var.resolve();
      switch (resolved.type) {
        case "quantified":
          return `t${resolved.id}`;
        case "bound":
          return pprintHelper(resolved.value);
        case "unbound":
          throw new Error("[unreachable]");
      }
    }

    case "fn": {
      const args = t.args.map(pprintHelper).join(", ");
      return `Fn(${args}) -> ${pprintHelper(t.return)}`;
    }

    case "named": {
      if (t.args.length === 0) {
        return t.name;
      }
      const args = t.args.map(pprintHelper).join(", ");
      return `${t.name}<${args}>`;
    }
  }
}

export function typePPrint(t: Type): string {
  return pprintHelper(generalize(t));
}
