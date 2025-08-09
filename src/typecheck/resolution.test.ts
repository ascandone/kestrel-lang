import { describe, expect, test } from "vitest";
import * as resolution from "./resolution";
import { unsafeParse } from "../parser";
import { TypedDeclaration } from "./typedAst";

describe("order of the strongly connected components", () => {
  test("empty program", () => {
    const { mutuallyRecursiveBindings } = resolve(``);

    expect(mutuallyRecursiveBindings).toEqual([]);
  });

  test("separatated components", () => {
    const { mutuallyRecursiveBindings } = resolve(`
      let a = 0
      let b = 1
    `);

    expect(getBindings(mutuallyRecursiveBindings)).toEqual([["a"], ["b"]]);
  });

  test("reference without recursion", () => {
    const { mutuallyRecursiveBindings } = resolve(`
      let a = 0
      let b = a
    `);

    expect(getBindings(mutuallyRecursiveBindings)).toEqual([["a"], ["b"]]);
  });

  test("reference without recursion (inverse order)", () => {
    const { mutuallyRecursiveBindings } = resolve(`
      let a = b
      let b = 0
    `);

    expect(getBindings(mutuallyRecursiveBindings)).toEqual([["b"], ["a"]]);
  });

  test("mutual recursion", () => {
    const { mutuallyRecursiveBindings } = resolve(`
      let a = fn { b }
      let b = fn { a }
    `);

    expect(getBindings(mutuallyRecursiveBindings)).toEqual([["a", "b"]]);
  });

  test("mutual recursion (3 steps)", () => {
    const { mutuallyRecursiveBindings } = resolve(`
      let a = b
      let b = c
      let c = fn { a }
    `);

    expect(getBindings(mutuallyRecursiveBindings)).toEqual([["a", "c", "b"]]);
  });
});

function getBindings(arr: TypedDeclaration[][]) {
  return arr.map((decls) => decls.map((decl) => decl.binding.name));
}

function resolve(src: string) {
  const parsed = unsafeParse(src);
  return resolution.resolve("Main", {}, parsed, []);
}
