import { compile } from "./compiler";
import { expect, test } from "vitest";
import { typecheck } from "./typecheck/typecheck";
import { unsafeParse } from "./parser";

test("compile int constants", () => {
  const out = compileSrc(`let x = 42`);
  expect(out).toMatchSnapshot();
});

test("compile float constants", () => {
  const out = compileSrc(`let x = "abc"`);
  expect(out).toMatchSnapshot();
});

test("compile + of ints", () => {
  const out = compileSrc(`let x = 1 + 2`);
  expect(out).toMatchSnapshot();
});

test("compile * of ints", () => {
  const out = compileSrc(`let x = 1 * 2`);
  expect(out).toMatchSnapshot();
});

test("precedence between * and +", () => {
  const out = compileSrc(`let x = (1 + 2) * 3`);
  expect(out).toMatchSnapshot();
});

test("precedence between * and + (2)", () => {
  const out = compileSrc(`let x = 1 + 2 * 3`);
  expect(out).toMatchSnapshot();
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
  expect(out).toMatchSnapshot();
});

test("function calls with no args", () => {
  const out = compileSrc(`
    let f = 0
    let y = f()
  `);
  expect(out).toMatchSnapshot();
});

test("function calls with args", () => {
  const out = compileSrc(`
    let f = 0
    let y = f(1, 2)
  `);
  expect(out).toMatchSnapshot();
});

test("let expressions", () => {
  const out = compileSrc(`
    let x = {
      let local = 0;
      local + 1
    }
  `);

  /* Should compile as:
  const x$local = 0;  
  const x = x$local + 1
  */

  expect(out).toMatchSnapshot();
});

test("let expressions with multiple vars", () => {
  const out = compileSrc(`
    let x = {
      let local1 = 0;
      let local2 = 1;
      local1 + local2
    }
  `);

  /* Should compile as:
  const x$local1 = 0;
  const x$local2 = 1;
  const x = x$local1 + x$local2;
  */

  expect(out).toMatchSnapshot();
});

function compileSrc(src: string) {
  const parsed = unsafeParse(src);
  const [program] = typecheck(parsed);
  const out = compile(program);
  return out;
}
