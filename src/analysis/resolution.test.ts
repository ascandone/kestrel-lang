import { test, expect, vi } from "vitest";
import { ResolutionAnalysis } from "./resolution";
import { unsafeParse } from "../parser";
import { CyclicDefinition } from "../errors";

test("allow declarations in swapped order", () => {
  const src = unsafeParse(`
    let x = y
    let y = 0
  `);

  const ra = new ResolutionAnalysis("Main", src, noErrors);

  expect(getSortedBindings(ra)).toEqual([["y"], ["x"]]);
});

test("allow dependency cycles in functions", () => {
  const src = unsafeParse(`
    let x = fn { y() }
    let y = x
  `);

  const ra = new ResolutionAnalysis("Main", src, noErrors);

  expect(getSortedBindings(ra)).toEqual([["x", "y"]]);
});

test.todo("forbid dependency cycles outside functions", () => {
  const emitError = vi.fn();
  const src = unsafeParse(`
    let x = y
    let y = x
  `);

  new ResolutionAnalysis("Main", src, emitError);
  expect(emitError).toHaveBeenCalledWith(new CyclicDefinition(["x", "y"]));
});

function getSortedBindings(res: ResolutionAnalysis) {
  return res.sortedDeclarations.map((ds) => ds.map((d) => d.binding.name));
}

function noErrors() {
  throw new Error("No errors allowed");
}
