import { Span, UntypedImport, UntypedModule } from "./ast";
import { topologicalSort } from "./utils/topsort";

const dummySpan: Span = [0, 0];
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

export const defaultImports: UntypedImport[] = [
  {
    span: dummySpan,
    ns: "Basics",
    exposing: [
      // Int
      { type: "type", name: "Int", exposeImpl: false, span: dummySpan },
      { type: "value", name: "+", span: dummySpan },
      { type: "value", name: "-", span: dummySpan },
      { type: "value", name: "*", span: dummySpan },
      { type: "value", name: "/", span: dummySpan },
      { type: "value", name: "^", span: dummySpan },
      { type: "value", name: "&", span: dummySpan },

      // Float
      { type: "type", name: "Float", exposeImpl: false, span: dummySpan },
      { type: "value", name: "+.", span: dummySpan },
      { type: "value", name: "-.", span: dummySpan },
      { type: "value", name: "*.", span: dummySpan },
      { type: "value", name: "/.", span: dummySpan },

      // Bool
      { type: "type", name: "Bool", exposeImpl: true, span: dummySpan },
      { type: "value", name: "&&", span: dummySpan },
      { type: "value", name: "||", span: dummySpan },
      { type: "value", name: "!", span: dummySpan },

      // Comp
      { type: "value", name: "==", span: dummySpan },
      { type: "value", name: "!=", span: dummySpan },
      { type: "value", name: ">", span: dummySpan },
      { type: "value", name: "<", span: dummySpan },
      { type: "value", name: ">=", span: dummySpan },
      { type: "value", name: "<=", span: dummySpan },

      // Unit
      { type: "type", name: "Unit", exposeImpl: true, span: dummySpan },
    ],
  },
  {
    span: dummySpan,
    ns: "String",
    exposing: [
      { type: "type", name: "String", exposeImpl: false, span: dummySpan },
      { type: "value", name: "<>", span: dummySpan },
    ],
  },
  {
    span: dummySpan,
    ns: "Maybe",
    exposing: [
      { type: "type", name: "Maybe", exposeImpl: true, span: dummySpan },
    ],
  },
  {
    span: dummySpan,
    ns: "Result",
    exposing: [
      { type: "type", name: "Result", exposeImpl: true, span: dummySpan },
    ],
  },
  {
    span: dummySpan,
    ns: "Tuple",
    exposing: [
      { type: "type", name: "Tuple2", exposeImpl: true, span: dummySpan },
      { type: "type", name: "Tuple3", exposeImpl: true, span: dummySpan },
      { type: "type", name: "Tuple4", exposeImpl: true, span: dummySpan },
    ],
  },
  {
    span: dummySpan,
    ns: "List",
    exposing: [
      { type: "type", name: "List", exposeImpl: true, span: dummySpan },
    ],
  },
  {
    span: dummySpan,
    ns: "Task",
    exposing: [
      { type: "type", name: "Task", exposeImpl: false, span: dummySpan },
    ],
  },
];

export function topSortedModules(
  project: Record<string, UntypedModule>,
  implicitImports: UntypedImport[] = defaultImports,
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

function getDependencies(program: UntypedModule): string[] {
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
