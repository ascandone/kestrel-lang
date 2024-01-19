import { expect, test } from "vitest";
import { unsafeParse } from "../parser";
import { typecheck, TypeError } from "./typecheck";
import { typePPrint } from "./pretty-printer";
import { Context } from "./unify";
import { Int, Bool } from "./prelude";

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

test("application args should be typechecked", () => {
  const [, errors] = tc(
    `
    let x = 1.1 > 2
  `,
    {
      ">": {
        type: "fn",
        args: [Int, Int],
        return: Bool,
      },
    },
  );

  expect(errors).not.toEqual([]);
});

test("typecheck fn args", () => {
  const [types] = tc(
    `
    let f = fn x, y { x > y }
  `,
    {
      ">": {
        type: "fn",
        args: [Int, Int],
        return: Bool,
      },
    },
  );

  expect(types).toEqual({
    f: "Fn(Int, Int) -> Bool",
  });
});

test("typecheck if ret value", () => {
  const [types] = tc(
    `
    let f =
      if True {
        0
      } else {
        1
      }
  `,
    {
      True: Bool,
    },
  );

  expect(types).toEqual({
    f: "Int",
  });
});

test("unify if clauses", () => {
  const [types] = tc(
    `
    let f = fn x {
      if True {
        0
      } else {
        x
      }
    }
  `,
    {
      True: Bool,
    },
  );

  expect(types).toEqual({
    f: "Fn(Int) -> Int",
  });
});

test("typecheck if condition", () => {
  const [types] = tc(
    `
    let f = fn x {
      if x {
        0
      } else {
        0
      }
    }
  `,
  );

  expect(types).toEqual({
    f: "Fn(Bool) -> Int",
  });
});

test("typecheck let expr", () => {
  const [types, errs] = tc(
    `
    let x = {
      let y = 42;
      y
    }
  `,
  );

  expect(errs).toEqual([]);
  expect(types).toEqual({
    x: "Int",
  });
});

test("typecheck generic values", () => {
  const [types, errs] = tc(
    `
    let id = fn x { x }
  `,
  );

  expect(errs).toEqual([]);
  expect(types).toEqual({
    id: "Fn(t0) -> t0",
  });
});

test("generalize values", () => {
  const [types, errs] = tc(
    `
    let id = fn x { x }
    let _ = id(42)
  `,
  );

  expect(errs).toEqual([]);
  expect(types).toEqual({
    id: "Fn(t0) -> t0",
    _: "Int",
  });
});

test("recursive let exprs", () => {
  const [types, errs] = tc(
    `
    let f = {
      let g = fn _ { g(1) };
      g
  }
  `,
  );

  expect(errs).toEqual([]);
  expect(types).toEqual({
    f: "Fn(Int) -> t0",
  });
});

test("recursive let declarations", () => {
  const [types, errs] = tc(
    `
    let f = fn _ { f(42) }
  `,
  );

  expect(errs).toEqual([]);
  expect(types).toEqual({
    f: "Fn(Int) -> t0",
  });
});

test("type hints are used by typechecker", () => {
  const [types, errs] = tc("let x: Int = 1.1");
  expect(errs).not.toEqual([]);
  expect(types).toEqual({
    x: "Int",
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
