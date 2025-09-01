import * as parser from "../../parser";
import { typecheck, type Deps } from "../../typecheck";
import { CORE_PACKAGE } from "../../typecheck/core_package";
import { TraitImpl } from "../../typecheck/defaultImports";

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

const Float = typecheckSourceRaw(
  CORE_PACKAGE,
  "Float",
  `
    extern pub type Float
    extern pub let (+.): Fn(Int, Int) -> Int
    extern pub let (-.): Fn(Int, Int) -> Int
    extern pub let (*.): Fn(Int, Int) -> Int
    extern pub let (/.): Fn(Int, Int) -> Int
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
  Float,
};

function typecheckSourceRaw(
  package_: string,
  ns: string,
  src: string,
  deps: Deps = {},
  implicitImports: parser.Import[] = [],
  traitImpls: TraitImpl[] = [],
) {
  const parsed = parser.unsafeParse(src);
  const [program] = typecheck(package_, ns, parsed, {
    implicitImports,
    traitImpls,
    getDependency: (ns) => deps[ns],
  });

  return program;
}

export function typecheckSource_(
  package_: string,
  ns: string,
  src: string,
  deps: Deps = {},
  traitImpls: TraitImpl[] = [],
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
    traitImpls,
  );
}

export function typecheckSource(
  package_: string,
  ns: string,
  src: string,
  deps: Deps = {},
) {
  return typecheckSource_(package_, ns, src, deps).moduleInterface;
}
