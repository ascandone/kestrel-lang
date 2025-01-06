import { Position, Range, UntypedImport } from "../parser";
import { TraitImplDependency } from "./type";

const dummyPosition: Position = { character: 0, line: 0 };
export const dummyRange: Range = { start: dummyPosition, end: dummyPosition };

export const defaultImports: UntypedImport[] = [
  {
    range: dummyRange,
    ns: "Int",
    exposing: [
      { type: "type", name: "Int", exposeImpl: false, range: dummyRange },
      { type: "value", name: "+", range: dummyRange },
      { type: "value", name: "-", range: dummyRange },
      { type: "value", name: "*", range: dummyRange },
      { type: "value", name: "/", range: dummyRange },
      { type: "value", name: "^", range: dummyRange },
      { type: "value", name: "%", range: dummyRange },
    ],
  },
  {
    range: dummyRange,
    ns: "Float",
    exposing: [
      { type: "type", name: "Float", exposeImpl: false, range: dummyRange },
      { type: "value", name: "+.", range: dummyRange },
      { type: "value", name: "-.", range: dummyRange },
      { type: "value", name: "*.", range: dummyRange },
      { type: "value", name: "/.", range: dummyRange },
    ],
  },
  {
    range: dummyRange,
    ns: "Bool",
    exposing: [
      { type: "type", name: "Bool", exposeImpl: true, range: dummyRange },
      { type: "value", name: "&&", range: dummyRange },
      { type: "value", name: "||", range: dummyRange },
      { type: "value", name: "!", range: dummyRange },

      // Comparasion operators
      { type: "value", name: "==", range: dummyRange },
      { type: "value", name: "!=", range: dummyRange },
      { type: "value", name: ">", range: dummyRange },
      { type: "value", name: "<", range: dummyRange },
      { type: "value", name: ">=", range: dummyRange },
      { type: "value", name: "<=", range: dummyRange },
    ],
  },
  {
    range: dummyRange,
    ns: "Char",
    exposing: [
      { type: "type", name: "Char", exposeImpl: false, range: dummyRange },
    ],
  },
  {
    range: dummyRange,
    ns: "String",
    exposing: [
      { type: "type", name: "String", exposeImpl: false, range: dummyRange },
      { type: "value", name: "++", range: dummyRange },
    ],
  },
  {
    range: dummyRange,
    ns: "Option",
    exposing: [
      { type: "type", name: "Option", exposeImpl: true, range: dummyRange },
    ],
  },
  {
    range: dummyRange,
    ns: "Result",
    exposing: [
      { type: "type", name: "Result", exposeImpl: true, range: dummyRange },
    ],
  },
  {
    range: dummyRange,
    ns: "Tuple",
    exposing: [
      { type: "type", name: "Unit", exposeImpl: true, range: dummyRange },
      { type: "type", name: "Tuple2", exposeImpl: true, range: dummyRange },
      { type: "type", name: "Tuple3", exposeImpl: true, range: dummyRange },
      { type: "type", name: "Tuple4", exposeImpl: true, range: dummyRange },
    ],
  },
  {
    range: dummyRange,
    ns: "List",
    exposing: [
      { type: "type", name: "List", exposeImpl: true, range: dummyRange },
    ],
  },
  {
    range: dummyRange,
    ns: "Task",
    exposing: [
      { type: "type", name: "Task", exposeImpl: false, range: dummyRange },
    ],
  },
];

export type TraitImpl = {
  packageName: string;
  moduleName: string;
  typeName: string;
  trait: string;
  deps?: TraitImplDependency[];
};

const Eq = "Eq",
  Ord = "Ord",
  Show = "Show";

export const defaultTraitImpls: TraitImpl[] = [
  // Extern types
  { moduleName: "Char", typeName: "Char", trait: Eq },
  { moduleName: "Char", typeName: "Char", trait: Ord },
  { moduleName: "Char", typeName: "Char", trait: Show },

  { moduleName: "String", typeName: "String", trait: Eq },
  { moduleName: "String", typeName: "String", trait: Ord },
  { moduleName: "String", typeName: "String", trait: Show },

  { moduleName: "Int", typeName: "Int", trait: Eq },
  { moduleName: "Int", typeName: "Int", trait: Ord },
  { moduleName: "Int", typeName: "Int", trait: Show },

  { moduleName: "Float", typeName: "Float", trait: Eq },
  { moduleName: "Float", typeName: "Float", trait: Ord },
  { moduleName: "Float", typeName: "Float", trait: Show },
].map((o) => ({ ...o, packageName: "kestrel_core" }));
