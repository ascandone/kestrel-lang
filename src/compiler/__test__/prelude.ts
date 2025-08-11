import * as parser from "../../parser";
import { CORE_PACKAGE, typecheck, type Deps } from "../../typecheck";

const dummyPosition: parser.Position = { line: 0, character: 0 };
const dummyRange: parser.Range = { start: dummyPosition, end: dummyPosition };
export const DEFAULT_IMPLICIT_IMPORTS: parser.Import[] = [
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
    ns: "String",
    exposing: [
      { type: "type", name: "String", exposeImpl: false, range: dummyRange },
      { type: "value", name: "++", range: dummyRange },
    ],
  },
  // {
  //   range: dummyRange,
  //   ns: "Tuple",
  //   exposing: [
  //     { type: "type", name: "Unit", exposeImpl: true, range: dummyRange },
  //     { type: "type", name: "Tuple2", exposeImpl: true, range: dummyRange },
  //     { type: "type", name: "Tuple3", exposeImpl: true, range: dummyRange },
  //     { type: "type", name: "Tuple4", exposeImpl: true, range: dummyRange },
  //   ],
  // },
  // {
  //   range: dummyRange,
  //   ns: "List",
  //   exposing: [
  //     { type: "type", name: "List", exposeImpl: true, range: dummyRange },
  //   ],
  // },
  // {
  //   range: dummyRange,
  //   ns: "Task",
  //   exposing: [
  //     { type: "type", name: "Task", exposeImpl: false, range: dummyRange },
  //   ],
  // },
];

const Int = typecheckSourceRaw(
  CORE_PACKAGE,
  "Int",
  `
    extern pub type Int
    extern pub let (+): Fn(Int, Int) -> Int
    extern pub let (-): Fn(Int, Int) -> Int
    extern pub let (*): Fn(Int, Int) -> Int
    extern pub let (/): Fn(Int, Int) -> Int
    extern pub let (^): Fn(Int, Int) -> Int
    extern pub let (%): Fn(Int, Int) -> Int
  `,
).moduleInterface;

const String = typecheckSourceRaw(
  CORE_PACKAGE,
  "String",
  `
    extern pub type String
    extern pub let (++): Fn(String, String) -> String
  `,
).moduleInterface;

const Bool = typecheckSourceRaw(
  CORE_PACKAGE,
  "Bool",
  `
    pub(..) type Bool {
      True,
      False,
    }
    extern pub let (&&): Fn(Bool, Bool) -> Bool
    extern pub let (||): Fn(Bool, Bool) -> Bool
    extern pub let (!): Fn(Bool) -> Bool
    extern pub let (==): Fn(a, a) -> Bool where a: Eq
    extern pub let (!=): Fn(a, a) -> Bool where a: Eq
    extern pub let (>): Fn(a, a) -> Bool where a: Ord
    extern pub let (>=): Fn(a, a) -> Bool where a: Ord
    extern pub let (<): Fn(a, a) -> Bool where a: Ord
    extern pub let (<=): Fn(a, a) -> Bool where a: Ord
  `,
).moduleInterface;

const DEFAULT_DEPS: Deps = {
  Int,
  String,
  Bool,
};

function typecheckSourceRaw(
  package_: string,
  ns: string,
  src: string,
  deps: Deps = {},
  implicitImports: parser.Import[] = [],
) {
  const parsed = parser.unsafeParse(src);
  const [program] = typecheck(package_, ns, parsed, deps, implicitImports);
  return program;
}

export function typecheckeSource_(
  package_: string,
  ns: string,
  src: string,
  deps: Deps = {},
) {
  return typecheckSourceRaw(
    package_,
    ns,
    src,
    {
      ...DEFAULT_DEPS,
      ...deps,
    },
    DEFAULT_IMPLICIT_IMPORTS,
  );
}

export function typecheckSource(
  package_: string,
  ns: string,
  src: string,
  deps: Deps = {},
) {
  return typecheckeSource_(package_, ns, src, deps).moduleInterface;
}
