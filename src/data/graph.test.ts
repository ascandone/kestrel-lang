import { test, expect, describe } from "vitest";
import {
  createRecordGraph,
  detectCycles,
  findStronglyConnectedComponents,
  reverseGraph,
  topsort,
  toRecordGraph,
} from "./graph";

describe("reverse graph", () => {
  test("simple graph", () => {
    const graph = createRecordGraph({
      x: ["y", "u"],
      y: ["z", "u"],
      u: [],
      z: [],
    });

    expect(toRecordGraph(reverseGraph(graph))).toEqual({
      x: [],
      y: ["x"],
      z: ["y"],
      u: ["x", "y"],
    });
  });
});

describe("topSort", () => {
  test("no cycles", () => {
    const graph = createRecordGraph({
      y: ["x"],
      x: [],
      z: ["y"],
    });

    expect(topsort(graph)).toEqual(["x", "y", "z"]);
  });

  test("with cycles", () => {
    const graph = createRecordGraph({
      y: ["x"],
      x: ["z"],
      z: ["y"],
    });

    expect(topsort(graph)).toEqual(["z", "x", "y"]);
  });
});

describe("findConnectedComponents", () => {
  test("empty graph", () => {
    const graph = createRecordGraph({});
    expect(findStronglyConnectedComponents(graph)).toEqual<string[][]>([]);
  });

  test("no dependencies", () => {
    const graph = createRecordGraph({
      x: [],
      y: [],
    });

    expect(findStronglyConnectedComponents(graph)).toEqual<string[][]>([
      ["x"],
      ["y"],
    ]);
  });

  test("one dependency", () => {
    const graph = createRecordGraph({
      x: ["y"],
      y: [],
    });

    expect(findStronglyConnectedComponents(graph)).toEqual<string[][]>([
      ["y"],
      ["x"],
    ]);
  });

  test("one dependency (reverse order)", () => {
    const graph = createRecordGraph({
      x: [],
      y: ["x"],
    });
    expect(findStronglyConnectedComponents(graph)).toEqual<string[][]>([
      ["x"],
      ["y"],
    ]);
  });

  test("mid graph", () => {
    const graph = createRecordGraph({
      0: ["4"],
      4: ["5"],
      5: ["6"],
      6: ["4"],
    });

    expect(findStronglyConnectedComponents(graph)).toEqual<string[][]>([
      ["4", "6", "5"],
      ["0"],
    ]);
  });

  test("complex graph", () => {
    const graph = createRecordGraph({
      0: ["1"],
      1: ["2"],
      2: ["0", "3"],
      3: ["4"],
      4: ["5"],
      5: ["6"],
      6: ["4", "7"],
      7: [],
    });

    expect(findStronglyConnectedComponents(graph)).toEqual<string[][]>([
      ["7"],
      ["4", "6", "5"],
      ["3"],
      ["0", "2", "1"],
    ]);
  });

  test("repro", () => {
    // ts
    const graph = createRecordGraph({
      y: ["x"],
      x: [],
      z: ["y"],
    });

    expect(findStronglyConnectedComponents(graph)).toEqual([
      ["x"],
      ["y"],
      ["z"],
    ]);
  });
});

describe("detectCycles", () => {
  test("returns undefined when there aren't cycles", () => {
    const graph = createRecordGraph({
      x: ["y", "u"],
      y: ["z", "u"],
      u: [],
      z: [],
    });

    expect(detectCycles(graph)).toEqual(undefined);
  });

  test("returns the cycle path when found one", () => {
    const graph = createRecordGraph({
      x: ["u", "y"],
      y: ["z", "u"],
      z: ["x"],
      u: [],
    });

    expect(detectCycles(graph)).toEqual(["x", "z", "y"]);
  });
});
