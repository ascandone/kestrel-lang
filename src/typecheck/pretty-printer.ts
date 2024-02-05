import { Poly, Type, generalize } from "./unify";
import { TypecheckError } from "./typecheck";

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

export function typeErrorPPrint(e: TypecheckError): string {
  switch (e.type) {
    case "unbound-variable":
      return `Unbound variable: "${e.ident}"\n`;
    case "occurs-check":
      return "Cannot construct the infinite type\n";
    case "unbound-type":
      return `Unbound type: ${e.name}/${e.arity}\n`;
    case "unbound-type-param":
      return `Unbound type parameter: ${e.id}\n`;
    case "invalid-catchall":
      return "Invalid use of the catchall type";
    case "type-param-shadowing":
      return `Cannot re-declare type parameter ${e.id}`;
    case "arity-mismatch":
      return `Expected ${e.expected} arguments, but got ${e.got}.\n`;
    case "type-mismatch":
      return `Type mismatch

Expected:  ${typePPrint(e.left)}
     Got:  ${typePPrint(e.right)}
`;
  }
}
