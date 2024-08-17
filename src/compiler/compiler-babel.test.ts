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

test("compile == of ints", () => {
  const out = compileSrc(`pub let x = 1 == 2`);
  expect(out).toMatchInlineSnapshot(`"const Main$x = 1 === 2;"`);
});

test("precedence between * and +", () => {
  const out = compileSrc(`pub let x = (1 + 2) * 3`);
  expect(out).toMatchInlineSnapshot(`"const Main$x = (1 + 2) * 3;"`);
});

test("precedence between * and + (2)", () => {
  const out = compileSrc(`pub let x = 1 + 2 * 3`);
  expect(out).toMatchInlineSnapshot(`"const Main$x = 1 + 2 * 3;"`);
});

test("math expr should have same semantics as js", () => {
  const expr = "2 * 3 + 4";
  const compiled = compileSrc(`pub let x = ${expr}`);

  const evaluated = new Function(`${compiled}; return Main$x`);
  expect(evaluated()).toEqual(2 * 3 + 4);
});

test("refer to previously defined idents", () => {
  const out = compileSrc(`
      let x = 0
      let y = x
    `);
  expect(out).toMatchInlineSnapshot(`
      "const Main$x = 0;
      const Main$y = Main$x;"
    `);
});

test("function calls with no args", () => {
  const out = compileSrc(`
      extern let f: Fn() -> a
      let y = f()
    `);
  expect(out).toMatchInlineSnapshot(`"const Main$y = Main$f();"`);
});

test("function calls with args", () => {
  const out = compileSrc(`
      extern let f: Fn(a, a) -> a
      let y = f(1, 2)
    `);

  expect(out).toMatchInlineSnapshot(`"const Main$y = Main$f(1, 2);"`);
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
