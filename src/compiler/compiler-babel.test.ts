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

test("let expressions", () => {
  const out = compileSrc(`
    let x = {
        let local = 0;
        local + 1
    }
    `);

  expect(out).toMatchInlineSnapshot(`
        "const Main$x$local = 0;
        const Main$x = Main$x$local + 1;"
    `);
});

test("let expressions with multiple vars", () => {
  const out = compileSrc(`
      let x = {
        let local1 = 0;
        let local2 = 1;
        local1 + local2
      }
    `);

  expect(out).toMatchInlineSnapshot(`
      "const Main$x$local1 = 0;
      const Main$x$local2 = 1;
      const Main$x = Main$x$local1 + Main$x$local2;"
    `);
});

test("nested let exprs", () => {
  const out = compileSrc(`
      let x = {
        let local = {
          let nested = 0;
          nested + 1
        };
        local + 2
      }
    `);

  expect(out).toMatchInlineSnapshot(`
      "const Main$x$local$nested = 0;
      const Main$x$local = Main$x$local$nested + 1;
      const Main$x = Main$x$local + 2;"
    `);
});

test("shadowed let exprs", () => {
  const out = compileSrc(`
      let x = {
        let a = 0;
        let a = a;
        a
      }
    `);

  expect(out).toMatchInlineSnapshot(`
        "const Main$x$a = 0;
        const Main$x$a$1 = Main$x$a;
        const Main$x = Main$x$a$1;"
      `);
});

test("two let as fn args, shadowing", () => {
  const out = compileSrc(`
    extern let f: Fn(a, a) -> a
    let x = f(
      { let a = 0; a },
      { let a = 1; a },
    )
`);

  expect(out).toMatchInlineSnapshot(`
    "const Main$x$a = 0;
    const Main$x$a$1 = 1;
    const Main$x = Main$f(Main$x$a, Main$x$a$1);"
  `);
});

test("toplevel fn without params", () => {
  const out = compileSrc(`
  let f = fn { 42 }
`);

  expect(out).toMatchInlineSnapshot(`
    "const Main$f = () => {
      return 42;
    };"
  `);
});

test("toplevel fn with params", () => {
  const out = compileSrc(`
  let f = fn x, y { y }
`);

  expect(out).toMatchInlineSnapshot(`
    "const Main$f = (x, y) => {
      return y;
    };"
  `);
});

test("shadowing fn params", () => {
  const out = compileSrc(`
    let f = fn a, a { a }
  `);

  expect(out).toMatchInlineSnapshot(`
    "const Main$f = (a, a$1) => {
      return a$1;
    };"
  `);
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
