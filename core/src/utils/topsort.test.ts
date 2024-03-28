import { expect, test } from "vitest";
import { DepsMap, topologicalSort, CyclicDepError } from "./topsort";

test("returns an empty list if there are no items", () => {
  const deps: DepsMap = {};
  expect(topologicalSort(deps)).toEqual([]);
});

test("returns a singleton if there are no deps", () => {
  const deps: DepsMap = { x: [] };
  expect(topologicalSort(deps)).toEqual(["x"]);
});

test("chain dep", () => {
  const deps: DepsMap = { z: [], y: ["z"], x: ["y"] };
  const res = topologicalSort(deps);

  expect(res).toEqual(["z", "y", "x"]);
});

test("two deps", () => {
  const deps: DepsMap = { x: ["y", "z"], y: [], z: [] };
  const res = topologicalSort(deps);
  expect(res[2]).toEqual("x");
});

test("does not visit twice", () => {
  const deps: DepsMap = { x: ["y", "z"], y: ["z"], z: [] };
  const res = topologicalSort(deps);

  expect(res).toEqual([..."zyx"]);
});

test("throws on cyclic deps", () => {
  const deps: DepsMap = { x: ["y"], y: ["z"], z: ["x"] };

  expect(() => topologicalSort(deps)).toThrow(CyclicDepError);
});
