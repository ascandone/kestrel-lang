import { test, expect } from "vitest";
import { break_, concat, pprint, nest, text } from "./pretty";

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
        break_(),
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
        break_(3),
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
        nest(break_(), text("cd")),
        break_(),
        text("ef"),
      ),
    ),
  ).toBe(`ab\n  cd\nef`);
});
