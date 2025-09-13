import { ConstLiteral } from "../parser";
import * as typedAst from "./typedAst";

export class NonExhaustiveMatchHalt extends Error {}

export class MalformedMatrixHalt extends Error {}

type PatternMatrix = {
  patterns: typedAst.TypedMatchPattern[];
  action: number;
}[];

export type DecisionTreeBinding =
  | {
      type: "identifier";
      binding: typedAst.TypedBinding;
    }
  | {
      type: "generated";
      id: number;
    };

export type DecisionTreePattern =
  | {
      type: "constructor";
      resolution: typedAst.IdentifierResolution & { type: "constructor" };
      args: DecisionTreeBinding[];
    }
  | {
      type: "constant";
      value: ConstLiteral;
    };

export type DecisionTree =
  | {
      type: "leaf";
      action: number;
    }
  | {
      type: "switch";
      subject: DecisionTreeBinding;
      clauses: [pattern: DecisionTreePattern, DecisionTree][];
      default?: DecisionTree;
    };

function checkPatternsMatrix(
  fringe: DecisionTreeBinding[],
  matrix: PatternMatrix,
): DecisionTree {
  const firstRow = matrix[0];

  if (firstRow === undefined) {
    throw new NonExhaustiveMatchHalt();
  }

  const nonWildcardColumnIndex = firstRow.patterns.findIndex(
    (col) => col.type !== "identifier",
  );

  if (nonWildcardColumnIndex === -1) {
    // Yield the first action
    return { type: "leaf", action: firstRow.action };
  }

  const col = firstRow.patterns[nonWildcardColumnIndex]!;
  if (col.type === "identifier") {
    throw new Error("[unreachable] unexpected identifier");
  }

  // TODO why does this make the fringe wrong?
  // swap
  // if (nonWildcardColumnIndex !== 0) {
  //   fringe = [...fringe];
  //   [fringe[0], fringe[nonWildcardColumnIndex]] = [
  //     fringe[nonWildcardColumnIndex]!,
  //     fringe[0]!,
  //   ];
  // }

  return specialize(nonWildcardColumnIndex, fringe, matrix);
}

function specialize(
  columnIndex: number,
  fringe: DecisionTreeBinding[],
  matrix: PatternMatrix,
): DecisionTree {
  // TODO do not return undefined

  const ctors = new Map<string, DecisionTreePattern>();

  // first, we gather all the ctors of head patterns of this col

  // TODO can we simply store ctors cardinality?
  let totalCtors: number | undefined;

  for (const clause of matrix) {
    const specializedCol = clause.patterns[columnIndex]!;
    if (specializedCol.type === "identifier") {
      continue;
    }

    const arities = getPatternCtorsArity(specializedCol);

    // Set the number of ctors
    if (totalCtors === undefined) {
      totalCtors = arities.totalCtors;
    } else if (totalCtors !== arities.totalCtors) {
      throw new MalformedMatrixHalt();
    }

    // Set the arity of this ctor
    const key = patToCtorKey(specializedCol);

    if (ctors.has(key)) {
      continue;
    }
    switch (specializedCol.type) {
      case "constant":
        ctors.set(key, {
          type: "constant",
          value: specializedCol.value,
        });
        break;

      case "constructor": {
        if (
          specializedCol.$resolution === undefined ||
          specializedCol.$resolution.type !== "constructor"
        ) {
          throw new MalformedMatrixHalt();
        }

        const matchingCtors: (typedAst.TypedMatchPattern & {
          type: "constructor";
        })[] = matrix.flatMap((clause) => {
          const pat = clause.patterns[columnIndex]!;
          if (
            pat.type === "constructor" &&
            pat.$resolution === specializedCol.$resolution
          ) {
            return [pat];
          } else {
            return [];
          }
        });

        ctors.set(key, {
          type: "constructor",
          resolution: specializedCol.$resolution,
          args: specializedCol.args.map((_, argIndex): DecisionTreeBinding => {
            // TODO remove "!""
            const matchingArgs = matchingCtors.flatMap((ctor) => {
              const arg = ctor.args[argIndex]!;
              if (arg.type === "identifier" && !arg.name.startsWith("_")) {
                return [arg];
              } else {
                return [];
              }
            });

            if (matchingArgs.length === 1) {
              return {
                type: "identifier",
                binding: matchingArgs[0]!,
              };
            }

            return genDecisionTreeBinding();
          }),
        });
        break;
      }
      default:
        specializedCol satisfies never;
    }
  }

  const fringePrefix = fringe.slice(0, columnIndex);
  const fringeCol = fringe[columnIndex]!;
  const fringePostfix = fringe.slice(columnIndex + 1);

  const switchTree: DecisionTree & { type: "switch" } = {
    type: "switch",
    subject: fringeCol,
    clauses: [],
  };

  // now we specialize on each ctor

  for (const [id, ctorPat] of ctors) {
    const ctorArity = (() => {
      switch (ctorPat.type) {
        case "constructor":
          return ctorPat.args;
        case "constant":
          return [];
      }
    })();

    const specializedMatrix = matrix.flatMap(
      (clause): PatternMatrix[number][] => {
        const rowPrefix = clause.patterns.slice(0, columnIndex);
        const specializedCol = clause.patterns[columnIndex]!;
        const rowPostfix = clause.patterns.slice(columnIndex + 1);

        if (specializedCol.type === "identifier") {
          return [
            {
              action: clause.action,
              patterns: [
                ...rowPrefix,
                ...ctorArity.map(() => specializedCol),
                ...rowPostfix,
              ],
            },
          ];
        }

        const key = patToCtorKey(specializedCol);
        if (key !== id) {
          return [];
        }

        switch (specializedCol.type) {
          case "constant":
            return [
              {
                action: clause.action,
                patterns: [...rowPrefix, ...rowPostfix],
              },
            ];

          case "constructor":
            if (ctorArity.length !== specializedCol.args.length) {
              throw new MalformedMatrixHalt();
            }

            if (ctorPat.type !== "constructor") {
              throw new MalformedMatrixHalt();
            }

            return [
              {
                action: clause.action,
                patterns: [...rowPrefix, ...specializedCol.args, ...rowPostfix],
              },
            ];

          default:
            return specializedCol satisfies never;
        }
      },
    );

    switchTree.clauses.push([
      ctorPat,
      checkPatternsMatrix(
        [...fringePrefix, ...ctorArity, ...fringePostfix],
        specializedMatrix,
      ),
    ]);
  }

  if (totalCtors === undefined) {
    throw new MalformedMatrixHalt();
  }

  if (ctors.size < totalCtors) {
    // default pattern
    const specializedMatrix = matrix.filter((clause) => {
      const specializedCol = clause.patterns[columnIndex]!;
      return specializedCol.type === "identifier";
    });

    switchTree.default = checkPatternsMatrix(
      [...fringePrefix, genDecisionTreeBinding(), ...fringePostfix],
      specializedMatrix,
    );
  }

  return switchTree;
}

function getPatternCtorsArity(
  pat: typedAst.TypedMatchPattern & { type: "constant" | "constructor" },
): { totalCtors: number; ctorArgs: number } {
  switch (pat.type) {
    case "constant":
      return {
        ctorArgs: 0,
        totalCtors: Infinity,
      };

    case "constructor": {
      if (
        pat.$resolution === undefined ||
        pat.$resolution.type !== "constructor"
      ) {
        throw new MalformedMatrixHalt();
      }

      return {
        ctorArgs: pat.$resolution.variant.args.length,
        totalCtors: pat.$resolution.declaration.variants.length,
      };
    }

    default:
      return pat satisfies never;
  }
}

function patToCtorKey(pat: typedAst.TypedMatchPattern): string {
  switch (pat.type) {
    case "identifier":
      return "_";
    case "constant":
      return "%" + pat.value.value.toString();
    case "constructor":
      return pat.name;
  }
}

let nextUniqueDecisionTreeId = 0;
function genDecisionTreeBinding(): DecisionTreeBinding {
  return { type: "generated", id: nextUniqueDecisionTreeId++ };
}

export function runExhaustivenessCheck(rows: typedAst.TypedMatchPattern[][]) {
  nextUniqueDecisionTreeId = 0;
  const matrix: PatternMatrix = rows.map((clauses, index) => ({
    patterns: clauses,
    action: index,
  }));

  const fringe =
    matrix[0] === undefined
      ? []
      : matrix[0].patterns.map(() => genDecisionTreeBinding());

  return checkPatternsMatrix(fringe, matrix);
}
