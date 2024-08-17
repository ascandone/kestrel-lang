import { test, expect } from "vitest";
import { unsafeParse } from "../parser";
import { resetTraitsRegistry, typecheck } from "../typecheck";
import { CompileOptions, Compiler } from "./compiler-babel";
import { TraitImpl } from "../typecheck/defaultImports";

test("compile int constants", () => {
  const out = compileSrc(`pub let x = 42`);
  expect(out).toMatchInlineSnapshot(`"const Main$x = 42;"`);
});

test("compile float constants", () => {
  const out = compileSrc(`pub let x = 42.42`);
  expect(out).toMatchInlineSnapshot(`"const Main$x = 42.42;"`);
});

test("compile string constants", () => {
  const out = compileSrc(`pub let x = "abc"`);
  expect(out).toMatchInlineSnapshot(`"const Main$x = "abc";"`);
});

test("compile char constants", () => {
  const out = compileSrc(`pub let x = 'a'`);
  expect(out).toMatchInlineSnapshot(`"const Main$x = "a";"`);
});

test("nested namespaces", () => {
  const out = compileSrc(`pub let x = 42`, { ns: "Json/Encode" });
  expect(out).toMatchInlineSnapshot(`"const Json$Encode$x = 42;"`);
});

test("compile string constants with newlines", () => {
  const out = compileSrc(`pub let x = "ab\nc"`);
  expect(out).toMatchInlineSnapshot(`"const Main$x = "ab\\nc";"`);
});

test("compile + of ints", () => {
  const out = compileSrc(`pub let x = 1 + 2`);
  expect(out).toMatchInlineSnapshot(`"const Main$x = 1 + 2;"`);
});

test("compile * of ints", () => {
  const out = compileSrc(`pub let x = 1 * 2`);
  expect(out).toMatchInlineSnapshot(`"const Main$x = 1 * 2;"`);
});

const testEntryPoint: NonNullable<CompileOptions["entrypoint"]> = {
  module: "Main",
  type: {
    type: "named",
    name: "String",
    moduleName: "String",
    args: [],
  },
};

type CompileSrcOpts = {
  ns?: string;
  traitImpl?: TraitImpl[];
  allowDeriving?: string[] | undefined;
};

function compileSrc(
  src: string,
  { ns = "Main", traitImpl = [] }: CompileSrcOpts = {},
) {
  const parsed = unsafeParse(src);
  resetTraitsRegistry(traitImpl);
  const [program] = typecheck(ns, parsed, {}, [], testEntryPoint.type);
  const compiler = new Compiler();
  //   compiler.allowDeriving = allowDeriving;
  const out = compiler.compile(program, ns);
  return out;
}
