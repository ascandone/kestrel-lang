import { expect, test } from "vitest";
import { Span, SpanMeta, unsafeParse } from "./parser";
import { Program, Statement } from "./ast";

test("parsing a declaration", () => {
  const src = "let x = 0";
  expect(unsafeParse(src)).toEqual<Program<SpanMeta>>({
    statements: [
      {
        type: "let",
        binding: "x",
        value: {
          type: "constant",
          value: {
            type: "int",
            value: 0,
          },
          span: spanOf(src, "0"),
        },
        span: spanOf(src, src),
      },
    ],
  });
});

test("parsing two declarations", () => {
  const src = `let x = 0\nlet y = 1`;
  expect(unsafeParse(src)).toEqual<Program<SpanMeta>>({
    statements: [
      {
        type: "let",
        binding: "x",
        value: {
          type: "constant",
          value: {
            type: "int",
            value: 0,
          },
          span: spanOf(src, "0"),
        },
        span: spanOf(src, "let x = 0"),
      },
      {
        type: "let",
        binding: "y",
        value: {
          type: "constant",
          value: {
            type: "int",
            value: 1,
          },
          span: spanOf(src, "1"),
        },
        span: spanOf(src, "let y = 1"),
      },
    ],
  });
});

test("parse float", () => {
  const src = "let _ = 1.23";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse + expr", () => {
  const src = "let _ = 1 + 2";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse - expr", () => {
  const src = "let _ = 1 - 2";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse * expr", () => {
  const src = "let _ = 1 * 2";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse + and * prec", () => {
  const src = "let _ = 1 - 2 * 3";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse + and * prec with parens", () => {
  const src = "let _ = (1 - 2) * 3";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse ident", () => {
  const src = "let _ = x";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse appl with no args", () => {
  const src = "let _ = f()";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse appl with 1 arg", () => {
  const src = "let _ = f(x)";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse appl with 3 args", () => {
  const src = "let _ = f(x, y, z)";
  expect(unsafeParse(src)).toMatchSnapshot();
});

function spanOf(src: string, substr: string = src): Span {
  const index = src.indexOf(substr);
  return [index, index + substr.length];
}
