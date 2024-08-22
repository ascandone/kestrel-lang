import { test, expect } from "vitest";
import { Analysis } from "./analyse";
import { typeToString } from "./type";
import {
  DuplicateDeclaration,
  ErrorInfo,
  InvalidPipe,
  TypeMismatch,
  UnboundVariable,
} from "../errors";
import { spanOf } from "./typedAst/__test__/utils";

test("infer int", () => {
  const a = new Analysis("Main", `pub let x = 42`);
  expect(a.errors).toEqual([]);

  expect(getTypes(a)).toEqual({
    x: "Int",
  });
});

test("infer float", () => {
  const a = new Analysis(
    "Main",
    `
      pub let x = 42.2
    `,
  );

  expect(a.errors).toEqual([]);
  expect(getTypes(a)).toEqual({
    x: "Float",
  });
});

test("infer string", () => {
  const a = new Analysis(
    "Main",
    `
        pub let x = "abc"
      `,
  );

  expect(a.errors).toEqual([]);
  expect(getTypes(a)).toEqual({
    x: "String",
  });
});

test("infer char", () => {
  const a = new Analysis(
    "Main",
    `
          pub let x = 'a'
        `,
  );

  expect(a.errors).toEqual([]);
  expect(getTypes(a)).toEqual({
    x: "Char",
  });
});

test("infer a variable present in the context", () => {
  const a = new Analysis(
    "Main",
    `
      let x = 42
      pub let y = x
    `,
  );

  expect(a.errors).toEqual([]);
  expect(getTypes(a)).toEqual({
    y: "Int",
  });
});

test("infer a variable not present in the context", () => {
  const a = new Analysis(
    "Main",
    `
      pub let x = unbound_var
    `,
  );

  expect(a.errors).toEqual<ErrorInfo[]>([
    {
      span: spanOf(a.source, "unbound_var"),
      description: new UnboundVariable("unbound_var"),
    },
  ]);
  expect(getTypes(a)).toEqual({
    x: "a",
  });
});

test.todo("forbid duplicate identifiers", () => {
  const a = new Analysis(
    "Main",
    `
      let x = 42
      let x = "override"
  
      pub let y = x
    `,
  );

  expect(a.errors).toEqual<ErrorInfo[]>([
    {
      description: new DuplicateDeclaration("x"),
      span: spanOf(a.source, "x", 1),
    },
  ]);

  expect(getTypes(a)).toEqual({
    y: "Int",
  });
});

test("fn returning a constant", () => {
  const a = new Analysis(
    "Main",
    `
      pub let f = fn { 42 }
    `,
  );

  expect(a.errors).toEqual<ErrorInfo[]>([]);
  expect(getTypes(a)).toEqual({
    f: "Fn() -> Int",
  });
});

test("types of externs", () => {
  const a = new Analysis(
    "Main",
    `
    extern type Int
    extern pub let x: Int
    `,
  );

  expect(a.errors).toEqual<ErrorInfo[]>([]);
  expect(getTypes(a)).toEqual({
    x: "Int",
  });
});

test("application return type", () => {
  const a = new Analysis(
    "Main",
    `
      extern type Bool
      extern let cmp: Fn(a, a) -> Bool
      pub let x = cmp(1, 2)
    `,
  );

  expect(a.errors).toEqual([]);
  expect(getTypes(a)).toEqual({
    x: "Bool",
  });
});

test("application args should be typechecked", () => {
  const a = new Analysis(
    "Main",
    `
        extern type Ret
        extern type T
        extern let c: T

        extern let f: Fn(T, T) -> Ret

        pub let x = f(42, c)
    `,
  );

  expect(a.errors).toEqual<ErrorInfo[]>([
    {
      description: new TypeMismatch(
        {
          type: "named",
          args: [],
          moduleName: "Main",
          name: "T",
        },
        {
          type: "named",
          moduleName: "Int",
          name: "Int",
          args: [],
        },
      ),
      span: spanOf(a.source, "42"),
    },
  ]);
});

test.todo("infer pipe operator left side and right side");

test("pipe operator", () => {
  const a = new Analysis(
    "Main",
    `
    extern type T
    extern let t: T

    extern type T1
    extern let t1: T1
    
    extern type Ret

    extern let f: Fn(T, T1) -> Ret
    pub let x = t |> f(t1)
    // let x = f(t, t1)
  `,
  );

  expect(a.errors).toEqual([]);
  expect(getTypes(a)).toEqual({
    x: "Ret",
  });
});

test("invalid pipe operator", () => {
  const a = new Analysis(
    "Main",
    `
    pub let x = 0 |> 1
  `,
  );

  expect(a.errors).toHaveLength(1);
  expect(a.errors[0]?.description).toBeInstanceOf(InvalidPipe);
});

function getTypes(a: Analysis): Record<string, string> {
  const kvs = [...a.getPublicDeclarations()].map((decl) => {
    return [decl.binding.name, typeToString(a.getType(decl.binding))];
  });
  return Object.fromEntries(kvs);
}
