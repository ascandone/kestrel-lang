import { Type, generalize } from "./unify";
import { TypeError } from "./typecheck";

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

export function typeErrorPPrint(e: TypeError<unknown>) {
  switch (e.type) {
    case "unbound-variable":
      return `Unbound variable: "${e.ident}"`;

    case "occurs-check":
      return "Cannot construct the infinite type";
    case "type-mismatch":
      return `Type mismatch

Expected:  ${typePPrint(e.left)}
     Got:  ${typePPrint(e.right)}
`;
  }
}
