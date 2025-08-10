import { expect, test } from "vitest";
import { formatSexpr, sym } from "./sexpr";

test("string", () => {
  expect(formatSexpr([{ type: "string", value: "abc" }])).toEqual(`"abc"`);
});

test("int", () => {
  expect(formatSexpr([{ type: "int", value: 42 }])).toEqual(`42`);
});

test("float", () => {
  expect(formatSexpr([{ type: "float", value: 42 }])).toEqual(`42.0`);
  expect(formatSexpr([{ type: "float", value: 42.1 }])).toEqual(`42.1`);
});

test("symbol", () => {
  expect(formatSexpr([{ type: "symbol", value: "def" }])).toEqual(`def`);
  expect(formatSexpr([{ type: "symbol", value: ":def" }])).toEqual(`:def`);
  expect(formatSexpr([{ type: "symbol", value: "def#0" }])).toEqual(`def#0`);
});

test("many sexprs", () => {
  expect(formatSexpr([sym`a`, sym`b`, sym`c`])).toMatchInlineSnapshot(`
    "a

    b

    c"
  `);
});

test("list of two", () => {
  expect(
    formatSexpr([
      [
        { type: "symbol", value: "if" },
        { type: "symbol", value: "cond" },
        { type: "symbol", value: "a" },
        { type: "symbol", value: "b" },
      ],
    ]),
  ).toEqual(`(if cond a b)`);
});

test("test nesting", () => {
  expect(
    formatSexpr([
      [
        { type: "symbol", value: "super-long-symbol-that-wraps" },
        { type: "symbol", value: "another-super-long-symbol" },
        { type: "symbol", value: "lets-see-if-it-can-wrap" },
        { type: "symbol", value: "even-longer-identifier-here" },
      ],
    ]),
  ).toEqual(`(super-long-symbol-that-wraps
    another-super-long-symbol
    lets-see-if-it-can-wrap
    even-longer-identifier-here)`);
});

test("test nested nesting", () => {
  expect(
    formatSexpr([
      [
        { type: "symbol", value: "super-long-symbol-that-wraps" },
        { type: "symbol", value: "another-super-long-symbol" },
        [
          { type: "symbol", value: "super-long-symbol-that-wraps" },
          { type: "symbol", value: "another-super-long-symbol" },
          { type: "symbol", value: "lets-see-if-it-can-wrap" },
          { type: "symbol", value: "even-longer-identifier-here" },
        ],
        { type: "symbol", value: "even-longer-identifier-here" },
      ],
    ]),
  ).toMatchInlineSnapshot(`
    "(super-long-symbol-that-wraps
        another-super-long-symbol
        (super-long-symbol-that-wraps
            another-super-long-symbol
            lets-see-if-it-can-wrap
            even-longer-identifier-here)
        even-longer-identifier-here)"
  `);
});

test("do not nest if not needed", () => {
  expect(
    formatSexpr([
      [
        { type: "symbol", value: "super-long-symbol-that-wraps" },
        { type: "symbol", value: "another-super-long-symbol" },
        [
          { type: "symbol", value: "+" },
          { type: "int", value: 1 },
          { type: "int", value: 2 },
        ],
        { type: "symbol", value: "even-longer-identifier-here" },
      ],
    ]),
  ).toMatchInlineSnapshot(`
    "(super-long-symbol-that-wraps
        another-super-long-symbol
        (+ 1 2)
        even-longer-identifier-here)"
  `);
});

test("do not wrap special symbols", () => {
  expect(
    formatSexpr(
      [
        [
          { type: "symbol", value: ":if" },
          { type: "symbol", value: "super-long-symbol-condition-that-wraps" },
          {
            type: "symbol",
            value: "another-super-long-symbol-here-that-for-sure-wraps",
          },
          {
            type: "symbol",
            value: "even-longer-identifier-here-which-will-overflow-the-line",
          },
        ],
      ],
      {
        indents: {
          ":if": 1,
        },
      },
    ),
  ).toMatchInlineSnapshot(`
    "(:if super-long-symbol-condition-that-wraps
        another-super-long-symbol-here-that-for-sure-wraps
        even-longer-identifier-here-which-will-overflow-the-line)"
  `);
});

test("do not wrap special symbols (idents=2)", () => {
  expect(
    formatSexpr(
      [
        [
          { type: "symbol", value: ":defn" },
          {
            type: "symbol",
            value: "my-function",
          },
          [
            { type: "symbol", value: "p1" },
            { type: "symbol", value: "p2" },
          ],
          {
            type: "symbol",
            value:
              "another-super-long-symbol-here-that-for-sure-wraps-because-is-a-super-long-body",
          },
        ],
      ],
      {
        indents: {
          ":defn": 2,
        },
      },
    ),
  ).toMatchInlineSnapshot(`
    "(:defn my-function (p1 p2)
        another-super-long-symbol-here-that-for-sure-wraps-because-is-a-super-long-body)"
  `);
});

test("always break after indents", () => {
  expect(
    formatSexpr(
      [
        [
          sym`:struct`,
          sym`Person`,
          [sym`name`, { type: "string", value: "John Doe" }],
          [sym`age`, { type: "int", value: 42 }],
          [sym`:rest`, sym`my_person`],
        ],
      ],
      {
        indents: {
          ":struct": 1,
        },
      },
    ),
  ).toMatchInlineSnapshot(
    `
    "(:struct Person
        (name "John Doe")
        (age 42)
        (:rest my_person))"
  `,
  );
});
