import { Poly, Type, generalize } from "./unify";

function pprintHelper(t: Type<Poly>): string {
  switch (t.type) {
    case "quantified":
      return t.id;

    case "var": {
      const resolved = t.var.resolve();
      switch (resolved.type) {
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

      if (t.name === "Tuple2") {
        return `(${pprintHelper(t.args[0]!)}, ${pprintHelper(t.args[1]!)})`;
      }

      const args = t.args.map(pprintHelper).join(", ");
      return `${t.name}<${args}>`;
    }
  }
}

export function typePPrint(t: Type<never>): string {
  return pprintHelper(generalize(t));
}
