import { expect, test } from "vitest";
import { unsafeParse } from "../parser";
import { typecheck, TypeError } from "./typecheck";
import { typePPrint } from "./pretty-printer";
import { ConcreteType, Context } from "./unify";

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

test("infer a variable not present in the context", () => {
  const [types, errors] = tc(
    `
    let x = unbound_var
  `,
    {},
  );

  expect(errors).toEqual<TypeError<unknown>[]>([
    expect.objectContaining({
      type: "unbound-variable",
      ident: "unbound_var",
    }),
  ]);
  expect(types).toEqual({
    x: "t0",
  });
});

test("typechecking previously defined vars", () => {
  const [types, errors] = tc(`
    let x = 42
    let y = x
  `);

  expect(errors).toEqual([]);
  expect(types).toEqual({
    x: "Int",
    y: "Int",
  });
});

test("fn returning a constant", () => {
  const [types, errors] = tc(`
    let f = fn { 42 }
  `);

  expect(errors).toEqual([]);
  expect(types).toEqual({
    f: "Fn() -> Int",
  });
});

test("application return type", () => {
  const [types, errors] = tc(
    `
    let x = 1 > 2
  `,
    {
      ">": {
        type: "fn",
        args: [Int, Int],
        return: Bool,
      },
    },
  );

  expect(errors).toEqual([]);
  expect(types).toEqual({
    x: "Bool",
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

const Int: ConcreteType = { type: "named", name: "Int", args: [] };
const Bool: ConcreteType = { type: "named", name: "Bool", args: [] };
