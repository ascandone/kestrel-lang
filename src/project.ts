import { Import, Program } from "./ast";
import { topologicalSort } from "./utils/topsort";

/*
// Prelude imports:

import Int.{Int, (+), (-)} // ecc
import Float.{Float}
import Bool.{Bool(..), (&&), (||), (!)}
import Unit.{Unit}
import String.{String, (<>)}
import List.{List, Cons}
import Maybe.{Maybe(..)}
import Result.{Result(..)}
import Tuple.{Tuple2(..)}
*/

export const defaultImports: Import[] = [
  {
    ns: "Basics",
    exposing: [
      // Int
      { type: "type", name: "Int", exposeImpl: false },
      { type: "value", name: "+" },
      { type: "value", name: "-" },
      { type: "value", name: "*" },
      { type: "value", name: "/" },
      { type: "value", name: "^" },
      { type: "value", name: "&" },

      // Float
      { type: "type", name: "Float", exposeImpl: false },
      { type: "value", name: "+." },
      { type: "value", name: "-." },
      { type: "value", name: "*." },
      { type: "value", name: "/." },

      // Bool
      { type: "type", name: "Bool", exposeImpl: true },
      { type: "value", name: "&&" },
      { type: "value", name: "||" },
      { type: "value", name: "!" },

      // Comp
      { type: "value", name: "==" },
      { type: "value", name: "!=" },
      { type: "value", name: ">" },
      { type: "value", name: "<" },
      { type: "value", name: ">=" },
      { type: "value", name: "<=" },

      // Unit
      { type: "type", name: "Unit", exposeImpl: true },
    ],
  },
  {
    ns: "String",
    exposing: [
      { type: "type", name: "String", exposeImpl: false },
      { type: "value", name: "<>" },
    ],
  },
  {
    ns: "Maybe",
    exposing: [{ type: "type", name: "Maybe", exposeImpl: true }],
  },
  {
    ns: "Tuple",
    exposing: [
      { type: "type", name: "Tuple2", exposeImpl: true },
      { type: "type", name: "Tuple3", exposeImpl: true },
      { type: "type", name: "Tuple4", exposeImpl: true },
    ],
  },
  {
    ns: "List",
    exposing: [{ type: "type", name: "List", exposeImpl: true }],
  },
  {
    ns: "Task",
    exposing: [{ type: "type", name: "Task", exposeImpl: false }],
  },
];

export function topSortedModules<T>(
  project: Record<string, Program<T>>,
  implicitImports: Import[] = defaultImports,
): string[] {
  const implNsImports = implicitImports.map((i) => i.ns);

  const dependencyGraph: Record<string, string[]> = {};
  for (const [ns, program] of Object.entries(project)) {
    const deps = CORE_MODULES.includes(ns)
      ? getDependencies(program)
      : [...implNsImports, ...getDependencies(program)];

    dependencyGraph[ns] = deps;
  }

  return topologicalSort(dependencyGraph);
}

function getDependencies(program: Program): string[] {
  return program.imports.map((i) => i.ns);
}

const CORE_MODULES = [
  "Basics",
  "List",
  "Maybe",
  "Result",
  "String",
  "Task",
  "Tuple",
];