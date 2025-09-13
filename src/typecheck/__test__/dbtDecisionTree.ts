import { DecisionTree, DecisionTreeBinding } from "../exhaustiveness";

export function dbgTree(tree: DecisionTree, level: number) {
  const IDENT_SYM = "  ";
  const ident = Array.from({ length: level }).fill(IDENT_SYM).join("");

  function argPatToString(arg: DecisionTreeBinding): string {
    switch (arg.type) {
      case "generated":
        return `$${arg.id}`;

      case "identifier":
        return arg.binding.name;
    }
  }

  switch (tree.type) {
    case "leaf":
      console.info(ident, "<leaf>", tree.action, "</leaf>");
      break;

    case "switch":
      console.info(ident, `<match subject=${argPatToString(tree.subject)}>`);

      for (const [pat, sub] of tree.clauses) {
        switch (pat.type) {
          case "constructor": {
            const ctorArgs =
              pat.args.length === 0
                ? ""
                : "(" + pat.args.map(argPatToString).join(", ") + ")";

            console.info(
              ident + IDENT_SYM,
              `<ctor name=${pat.resolution.declaration.name}::${pat.resolution.variant.name}${ctorArgs}>`,
            );
            dbgTree(sub, level + 2);
            console.info(ident + IDENT_SYM, "</ctor>");
            break;
          }
          case "constant":
            console.info(
              ident + IDENT_SYM,
              `<const value=${pat.value.value.toString()}>`,
            );
            dbgTree(sub, level + 2);
            console.info(ident + IDENT_SYM, "</const>");
            break;
        }
      }

      if (tree.default !== undefined) {
        console.info(ident + IDENT_SYM, "<default>");
        dbgTree(tree.default, level + 2);
        console.info(ident + IDENT_SYM, "</default>");
      }

      console.info(ident, "</match>");
      break;
  }
}
