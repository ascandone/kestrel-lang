import { Type, TypeScheme, generalizeAsScheme } from "./unify";

function pprintHelper(t: Type, scheme: TypeScheme): string {
  switch (t.type) {
    case "var": {
      const resolved = t.var.resolve();
      switch (resolved.type) {
        case "bound":
          return pprintHelper(resolved.value, scheme);
        case "unbound": {
          const id = scheme[resolved.id];
          if (id === undefined) {
            throw new Error("[unreachable] var not found: " + resolved.id);
          }
          return id;
        }
      }
    }

    case "fn": {
      const args = t.args.map((arg) => pprintHelper(arg, scheme)).join(", ");
      return `Fn(${args}) -> ${pprintHelper(t.return, scheme)}`;
    }

    case "named": {
      if (t.args.length === 0) {
        return t.name;
      }

      if (t.name === "Tuple2") {
        return `(${pprintHelper(t.args[0]!, scheme)}, ${pprintHelper(t.args[1]!, scheme)})`;
      }

      const args = t.args.map((arg) => pprintHelper(arg, scheme)).join(", ");
      return `${t.name}<${args}>`;
    }
  }
}

export function typePPrint(t: Type, scheme?: TypeScheme): string {
  scheme = generalizeAsScheme(t, scheme);
  return pprintHelper(t, scheme);
}
