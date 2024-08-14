import { test, expect } from "vitest";
import { Analysis } from "./analyse";
import { typeToString } from "./type";

test("infer int", () => {
  const a = new Analysis("Main", `pub let x = 42`);
  expect(a.errors).toEqual([]);

  expect(getTypes(a)).toEqual({
    x: "Int",
  });
});

function getTypes(a: Analysis): Record<string, string> {
  const kvs = [...a.getPublicDeclarations()].map((decl) => {
    return [decl.binding.name, typeToString(a.getType(decl.binding))];
  });
  return Object.fromEntries(kvs);
}
