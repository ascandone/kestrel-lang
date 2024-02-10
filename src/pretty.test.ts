import { test, expect } from "vitest";
import { lines, concat, pprint, nest, text } from "./pretty";

test("renders plain text", () => {
  expect(pprint(text("Hello"))).toBe(`Hello`);
});

test("renders seq of text", () => {
  expect(
    pprint(
      //
      text("abc", "cde"),
    ),
  ).toBe(`abccde`);
});

test("renders break", () => {
  expect(
    pprint(
      concat(
        //
        text("ab"),
        lines(),
        text("cd"),
      ),
    ),
  ).toBe(`ab\ncd`);
});

test("renders break of many lines", () => {
  expect(
    pprint(
      concat(
        //
        text("ab"),
        lines(2),
        text("cd"),
      ),
    ),
  ).toBe(`ab\n\n\ncd`);
});

test("nesting has no effect when there aren't breaks", () => {
  expect(
    pprint(
      concat(
        //
        text("ab"),
        nest(text("cd")),
      ),
    ),
  ).toBe(`abcd`);
});

test("nesting idents the wrapped doc after a break", () => {
  expect(
    pprint(
      concat(
        //
        text("ab"),
        nest(lines(), text("cd")),
        lines(),
        text("ef"),
      ),
    ),
  ).toBe(`ab\n  cd\nef`);
});
