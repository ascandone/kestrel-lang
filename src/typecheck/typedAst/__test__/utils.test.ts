import { test, expect } from "vitest";
import { indexOf } from "./utils";

test("indexOf test utility", () => {
  expect(indexOf("a-a-a", "a")).toBe(0);
  expect(indexOf("a-a-a", "a", 2)).toBe(2);
  expect(indexOf("a-a-a", "a", 3)).toBe(4);
  expect(indexOf("a-a-a", "a", 4)).toBe(undefined);

  expect(indexOf("a-a-a", "not-found")).toBe(undefined);
  expect(indexOf("a-a-a", "not-found", 1)).toBe(undefined);

  expect(indexOf("ab-ab-ab", "ab")).toBe(0);
  expect(indexOf("ab-ab-ab", "ab", 2)).toBe(3);
  expect(indexOf("ab-ab-ab", "ab", 3)).toBe(6);

  expect(indexOf("let x =\n x + 1", "x", 2)).toBe(9);
});
