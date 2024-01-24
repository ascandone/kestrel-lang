import { compile } from "./compiler";
import { expect, test } from "vitest";
import { typecheck } from "./typecheck/typecheck";
import { unsafeParse } from "./parser";

test("compile int constants", () => {
  const out = compileSrc(`let x = 42`);
  expect(out).toEqual(`const x = 42;
`);
});

test("compile float constants", () => {
  const out = compileSrc(`let x = "abc"`);
  expect(out).toEqual(`const x = "abc";
`);
});

test("compile + of ints", () => {
  const out = compileSrc(`let x = 1 + 2`);
  expect(out).toEqual(`const x = 1 + 2;
`);
});

test("compile * of ints", () => {
  const out = compileSrc(`let x = 1 * 2`);
  expect(out).toEqual(`const x = 1 * 2;
`);
});

test("precedence between * and +", () => {
  const out = compileSrc(`let x = (1 + 2) * 3`);
  expect(out).toEqual(`const x = (1 + 2) * 3;
`);
});

test("precedence between * and + (2)", () => {
  const out = compileSrc(`let x = 1 + 2 * 3`);
  expect(out).toEqual(`const x = 1 + 2 * 3;
`);
});

test("math expr should have same semantics as js", () => {
  const expr = "2 * 3 + 4";
  const compiled = compileSrc(`let x = ${expr}`);

  const evaluated = new Function(`${compiled}; return x`);
  expect(evaluated()).toEqual(2 * 3 + 4);
});

test("refer to previously defined idents", () => {
  const out = compileSrc(`
    let x = 0
    let y = x
  `);
  expect(out).toEqual(`const x = 0;

const y = x;
`);
});

test("function calls with no args", () => {
  const out = compileSrc(`
    let f = 0
    let y = f()
  `);
  expect(out).toEqual(`const f = 0;

const y = f();
`);
});

test("function calls with args", () => {
  const out = compileSrc(`
    let f = 0
    let y = f(1, 2)
  `);

  expect(out).toEqual(`const f = 0;

const y = f(1, 2);
`);
});

test("let expressions", () => {
  const out = compileSrc(`
    let x = {
      let local = 0;
      local + 1
    }
  `);

  expect(out).toEqual(`const x$local = 0;
const x = x$local + 1;
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

  expect(out).toEqual(`const x$local1 = 0;
const x$local2 = 1;
const x = x$local1 + x$local2;
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

  expect(out).toEqual(`const x$local$nested = 0;
const x$local = x$local$nested + 1;
const x = x$local + 2;
`);
});

test.todo("shadowed let exprs", () => {
  const out = compileSrc(`
    let x = {
      let a = 0;
      let a = 1;
      a
    }
  `);

  expect(out).toEqual(`const x$a = 0;
const x$a$0 = 1;
const x = x$a$0;
`);
});

test("toplevel fn without params", () => {
  const out = compileSrc(`
  let f = fn { 42 }
`);

  expect(out).toEqual(`function f() {
  return 42;
}
`);
});

test("toplevel fn with params", () => {
  const out = compileSrc(`
  let f = fn x, y { y }
`);

  expect(out).toEqual(`function f(x, y) {
  return y;
}
`);
});

test("let inside scope", () => {
  const out = compileSrc(`
  let f = fn {
    let x = 0;
    let y = 1;
    x
  }
`);

  expect(out).toEqual(`function f() {
  const x = 0;
  const y = 1;
  return x;
}
`);
});

test("let inside arg of a function", () => {
  const out = compileSrc(`
  let f = 0
  let a = f({
    let x = 0;
    x
  })
`);

  expect(out).toEqual(`const f = 0;

const a$x = 0;
const a = f(a$x);
`);
});

test("function with a scoped identified as caller", () => {
  const out = compileSrc(`
  let x = {
    let f = 0;
    f()
  }
`);

  expect(out).toEqual(`const x$f = 0;
const x = x$f();
`);
});

test("if expression", () => {
  const out = compileSrc(`
  let x =
    if 0 {
      1
    } else {
      2
    }
`);

  expect(out).toEqual(`let $temp__0;
if 0 {
  $temp__0 = 1;
} else {
  $temp__0 = 2;
}
const x = $temp__0;
`);
});

function compileSrc(src: string) {
  const parsed = unsafeParse(src);
  const [program] = typecheck(parsed);
  const out = compile(program);
  return out;
}
