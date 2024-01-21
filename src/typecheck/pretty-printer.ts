import { Poly, Type, generalize } from "./unify";
import { TypeError } from "./typecheck";

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
      const args = t.args.map(pprintHelper).join(", ");
      return `${t.name}<${args}>`;
    }
  }
}

export function typePPrint(t: Type<never>): string {
  return pprintHelper(generalize(t));
}

export function typeErrorPPrint(e: TypeError<unknown>): string {
  switch (e.type) {
    case "unbound-variable":
      return `Unbound variable: "${e.ident}"\n`;
    case "occurs-check":
      return "Cannot construct the infinite type\n";
    case "unbound-type":
      return `Unbound type: ${e.name}/${e.arity}\n`;
    case "type-mismatch":
      if (
        e.left.type === "fn" &&
        e.right.type === "fn" &&
        e.left.args.length !== e.right.args.length
      ) {
        return `Expected ${e.left.args.length} arguments, but got ${e.right.args.length}.\n`;
      }

      return `Type mismatch

Expected:  ${typePPrint(e.left)}
     Got:  ${typePPrint(e.right)}
`;
  }
}
