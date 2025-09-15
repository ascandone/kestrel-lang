import { DecisionTree, DecisionTreeBinding } from "../exhaustiveness";
import { TypedMatchPattern } from "../typedAst";

function patToString(pat: TypedMatchPattern): string {
  switch (pat.type) {
    case "identifier":
      return pat.name;

    case "constant":
      return pat.value.value.toString();

    case "constructor":
      if (pat.args.length === 0) {
        return pat.name;
      }
      return `${pat.name}(${pat.args.map(patToString).join(", ")})`;
  }
}

// we duplicate this code so that we don't have to export the private type
type PatternMatrix = {
  patterns: TypedMatchPattern[];
  action: number;
}[];

export function dbgMatrix(matrix: PatternMatrix) {
  console.log("<matrix>");
  for (const clause of matrix) {
    const str = clause.patterns.map(patToString).join(", ");
    console.log(`[${str}] -> ${clause.action}`);
  }
  console.log("</matrix>\n");
}

export function dbgTree(tree: DecisionTree, level: number = 0) {
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
      console.info(`${ident}<leaf>`, tree.action, "</leaf>");
      break;

    case "switch":
      console.info(`${ident}<match subject=${argPatToString(tree.subject)}>`);

      for (const [pat, sub] of tree.clauses) {
        switch (pat.type) {
          case "constructor": {
            const ctorArgs =
              pat.args.length === 0
                ? ""
                : "(" + pat.args.map(argPatToString).join(", ") + ")";

            console.info(
              `${ident}${IDENT_SYM}<ctor pattern=${pat.resolution.declaration.name}::${pat.resolution.variant.name}${ctorArgs}>`,
            );
            dbgTree(sub, level + 2);
            console.info(`${ident}${IDENT_SYM}</ctor>`);
            break;
          }
          case "constant":
            console.info(
              `${ident}${IDENT_SYM}<const value=${pat.value.value.toString()}>`,
            );
            dbgTree(sub, level + 2);
            console.info(`${ident}${IDENT_SYM}</const>`);
            break;
        }
      }

      if (tree.default !== undefined) {
        const [pat, subTree] = tree.default;
        console.info(
          `${ident}${IDENT_SYM}<default binding=${argPatToString(pat)}>`,
        );

        dbgTree(subTree, level + 2);
        console.info(`${ident}${IDENT_SYM}</default>`);
      }

      console.info(ident + "</match>");
      break;
  }
}
