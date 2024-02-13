import { test, expect, describe } from "vitest";
import { Hovered, hoverOn } from "./typedAst";
import { Span, unsafeParse } from "../parser";
import { typecheck } from "./typecheck";

describe("hoverOn", () => {
  test("hover a declaration's binding", () => {
    const src = `let x = 42`;
    const hoverable = parseHover(src, "x");
    expect(hoverable).toEqual<Hovered>({
      span: spanOf(src, "x"),
      hovered: expect.objectContaining({
        type: "global-variable",
        declaration: expect.objectContaining({
          binding: expect.objectContaining({
            name: "x",
          }),
        }),
      }),
    });
  });

  test("hover a declaration's binding (2d occurrence)", () => {
    const src = `let x = 42\nlet y = 100`;
    const hoverable = parseHover(src, "y");
    expect(hoverable).toEqual<Hovered>({
      span: spanOf(src, "y"),
      hovered: expect.objectContaining({
        type: "global-variable",
        declaration: expect.objectContaining({
          binding: expect.objectContaining({
            name: "y",
          }),
        }),
      }),
    });
  });

  test("hover a reference to a global binding", () => {
    const src = `
        let x = 42
        let y = x
    `;
    const hoverable = parseHover(src, "x", 2);
    expect(hoverable).toEqual<Hovered>({
      span: spanOf(src, "x", 2),
      hovered: expect.objectContaining({
        type: "global-variable",
        declaration: expect.objectContaining({
          binding: expect.objectContaining({
            name: "x",
          }),
        }),
      }),
    });
  });

  test("hover a reference to a global binding inside a fn, application, if, let", () => {
    const src = `
        let x = 42
        let y = fn {
            if true {
                let y = 0;
                f(0, x)
            } else {
                0
            }
        }
    `;
    const hoverable = parseHover(src, "x", 2);
    expect(hoverable).toEqual<Hovered>({
      span: spanOf(src, "x", 2),
      hovered: expect.objectContaining({
        type: "global-variable",
        declaration: expect.objectContaining({
          binding: expect.objectContaining({
            name: "x",
          }),
        }),
      }),
    });
  });

  test("hover a reference to a local binding in a match expr", () => {
    const src = `
        let m = match something {
            0 => 0,
            Constr(x) => x,
        }
    `;
    const hoverable = parseHover(src, "x", 2);
    expect(hoverable).toEqual<Hovered>({
      span: spanOf(src, "x", 2),
      hovered: expect.objectContaining({
        type: "local-variable",
        binding: expect.objectContaining({
          name: "x",
        }),
      }),
    });
  });

  test("hover a constructor", () => {
    const src = `
        type T { Constr(Int) }
        let t = Constr(42)
    `;
    const hoverable = parseHover(src, "Constr", 2);
    expect(hoverable).toEqual<Hovered>({
      span: spanOf(src, "Constr", 2),
      hovered: expect.objectContaining({
        type: "constructor",
      }),
    });
  });
});

function parseHover(
  src: string,
  hovering: string,
  occurrenceNumber = 1,
): Hovered | undefined {
  const offset = indexOf(src, hovering, occurrenceNumber);

  if (offset === undefined) {
    throw new Error("Invalid offset");
  }

  const parsed = unsafeParse(src);
  const [typed, _] = typecheck("Main", parsed);
  return hoverOn(typed, offset);
}

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

function indexOf(
  src: string,
  subStr: string = src,
  occurrenceNumber: number = 1,
): number | undefined {
  let lastOccurrenceIndex = -1;
  for (let i = 0; i < occurrenceNumber; i++) {
    lastOccurrenceIndex = src.indexOf(subStr, lastOccurrenceIndex + 1);
    if (lastOccurrenceIndex === -1) {
      return undefined;
    }
  }
  return lastOccurrenceIndex;
}

function spanOf(
  src: string,
  subStr: string = src,
  occurrenceNumber: number = 1,
): Span {
  const index = indexOf(src, subStr, occurrenceNumber);
  if (index === undefined) {
    throw new Error("Invalid index");
  }

  return [index, index + subStr.length];
}
