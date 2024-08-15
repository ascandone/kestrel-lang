import { test, expect } from "vitest";
import { Analysis } from "./analyse";
import { typeToString } from "./type";
import { ErrorInfo, UnboundVariable } from "../errors";
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

function getTypes(a: Analysis): Record<string, string> {
  const kvs = [...a.getPublicDeclarations()].map((decl) => {
    return [decl.binding.name, typeToString(a.getType(decl.binding))];
  });
  return Object.fromEntries(kvs);
}
