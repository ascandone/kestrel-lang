import { expect, test } from "vitest";
import { unsafeParse } from "../parser";
import { typecheck } from "./typecheck";
import { typePPrint } from "./pretty-printer";
import { Context } from "./unify";

test("infer int", () => {
  const [types, errors] = tc(`
    let x = 42
  `);

  expect(errors).toEqual([]);
  expect(types).toEqual({
    x: "Int",
  });
});

test("infer float", () => {
  const [types, errors] = tc(`
    let x = 42.2
  `);

  expect(errors).toEqual([]);
  expect(types).toEqual({
    x: "Float",
  });
});

test("infer a variable present in the context", () => {
  const [types, errors] = tc(
    `
    let x = y
  `,
    { y: { type: "named", name: "Y", args: [] } },
  );

  expect(errors).toEqual([]);
  expect(types).toEqual({
    x: "Y",
  });
});

function tc(src: string, context: Context = {}) {
  const parsedProgram = unsafeParse(src);
  const [typed, errors] = typecheck(parsedProgram, context);

  const kvs = typed.statements.map((decl) => [
    decl.binding.name,
    typePPrint(decl.value.$.asType()),
  ]);

  return [Object.fromEntries(kvs), errors];
}