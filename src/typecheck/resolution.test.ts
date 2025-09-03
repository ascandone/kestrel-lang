import { describe, expect, test } from "vitest";
import * as resolution from "./resolution";
import { unsafeParse } from "../parser";
import { TypedValueDeclaration } from "./typedAst";

describe("order of the strongly connected components", () => {
  test("empty program", () => {
    const [{ mutuallyRecursiveDeclrs }] = resolve(``);

    expect(mutuallyRecursiveDeclrs).toEqual([]);
  });

  test("separatated components", () => {
    const [{ mutuallyRecursiveDeclrs }] = resolve(`
      let a = 0
      let b = 1
    `);

    expect(getBindings(mutuallyRecursiveDeclrs)).toEqual([["a"], ["b"]]);
  });

  test("reference without recursion", () => {
    const [{ mutuallyRecursiveDeclrs }] = resolve(`
      let a = 0
      let b = a
    `);

    expect(getBindings(mutuallyRecursiveDeclrs)).toEqual([["a"], ["b"]]);
  });

  test("reference without recursion (inverse order)", () => {
    const [{ mutuallyRecursiveDeclrs }] = resolve(`
      let a = b
      let b = 0
    `);

    expect(getBindings(mutuallyRecursiveDeclrs)).toEqual([["b"], ["a"]]);
  });

  test("mutual recursion", () => {
    const [{ mutuallyRecursiveDeclrs }] = resolve(`
      let a = fn { b }
      let b = fn { a }
    `);

    expect(getBindings(mutuallyRecursiveDeclrs)).toEqual([["a", "b"]]);
  });

  test("mutual recursion (3 steps)", () => {
    const [{ mutuallyRecursiveDeclrs }] = resolve(`
      let a = b
      let b = c
      let c = fn { a }
    `);

    expect(getBindings(mutuallyRecursiveDeclrs)).toEqual([["a", "c", "b"]]);
  });
});

function getBindings(arr: TypedValueDeclaration[][]) {
  return arr.map((decls) => decls.map((decl) => decl.binding.name));
}

function resolve(src: string) {
  const parsed = unsafeParse(src);
  return resolution.resolve(
    "pkg",
    "Main",
    () => ({ type: "ERR", error: { type: "UNBOUND_MODULE" } }),
    parsed,
    [],
  );
}
