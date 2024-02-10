import { test, expect } from "vitest";
import { lines, concat, pprint, nest, text, break_, group } from "./pretty";

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

test("singleton concat", () => {
  expect(
    pprint(
      //
      { type: "concat", docs: [text("abc")] },
    ),
  ).toBe(`abc`);
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

test("optional line break doesn't wrap when there is enough space", () => {
  expect(
    pprint(
      group(
        //
        text("ab"),
        break_("-"),
        text("cd"),
      ),
      { maxWidth: Infinity },
    ),
  ).toBe(`ab-cd`);
});

test("optional line break wraps when there is not enough space", () => {
  expect(
    pprint(
      group(
        //
        text("abc"),
        break_("-"),
        text("def"),
      ),
      { maxWidth: 2 },
    ),
  ).toBe(`abc\ndef`);
});

test("break respects indentation", () => {
  expect(
    pprint(
      group(
        //
        text("abc"),
        nest(break_("-"), text("def")),
      ),
      { maxWidth: 2 },
    ),
  ).toBe(`abc\n  def`);
});
