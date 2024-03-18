import { test, expect, describe } from "vitest";
import {
  Hovered,
  goToDefinitionOf,
  hoverOn,
  hoverToMarkdown,
  Location,
} from "./typedAst";
import { Span, unsafeParse } from "../parser";
import { typecheck } from "./typecheck";
import { TypeScheme } from "./type";

describe("hoverOn", () => {
  test("hover a declaration's binding", () => {
    const src = `let x = 42`;
    const [, hoverable] = parseHover(src, "x")!;
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
    const [, hoverable] = parseHover(src, "y")!;
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

  test("hover fn param", () => {
    const src = `let f = fn x { 0 }`;
    const [, hoverable] = parseHover(src, "x")!;
    expect(hoverable).toEqual<Hovered>({
      span: spanOf(src, "x"),
      hovered: expect.objectContaining({
        type: "local-variable",
        binding: expect.objectContaining({
          name: "x",
        }),
      }),
    });
  });

  test("hover let expr binding", () => {
    const src = `let f = {
      let x = 42;
      0
    }`;
    const [, hoverable] = parseHover(src, "x")!;
    expect(hoverable).toEqual<Hovered>({
      span: spanOf(src, "x"),
      hovered: expect.objectContaining({
        type: "local-variable",
        binding: expect.objectContaining({
          name: "x",
        }),
      }),
    });
  });

  test("hovering with scheme", () => {
    const src = `let f = fn x, y { y }`;
    const [scheme, hoverable] = parseHover(src, "y", 2)!;
    if (hoverable.hovered.type !== "local-variable") {
      throw new Error("fail");
    }
    const resolved = hoverable.hovered.binding.$.resolve();
    if (resolved.type !== "unbound") {
      throw new Error("fail");
    }
    expect(scheme).toEqual(
      expect.objectContaining({
        [resolved.id]: "b",
      }),
    );
  });

  test("hover a reference to a global binding", () => {
    const src = `
        let x = 42
        let y = x
    `;
    const [, hoverable] = parseHover(src, "x", 2)!;
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
    const [, hoverable] = parseHover(src, "x", 2)!;
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

  test("hover a local binding in a match expr", () => {
    const src = `
        let m = match something {
          Constr(Nested(_, loc_var)) => 0,
        }
    `;
    const [, hoverable] = parseHover(src, "loc_var")!;
    expect(hoverable).toEqual<Hovered>(
      expect.objectContaining({
        span: spanOf(src, "loc_var"),
      }),
    );
  });

  test("hover a reference to a local binding in a match expr", () => {
    const src = `
        let m = match something {
            0 => 0,
            Constr(x) => x,
        }
    `;
    const [, hoverable] = parseHover(src, "x", 2)!;
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

  test("hover a reference to a local binding in a match expr subject", () => {
    const src = `
      let something = 42
      let m = match something { }
    `;

    const [, hoverable] = parseHover(src, "something", 2)!;
    expect(hoverable).toEqual<Hovered>(
      expect.objectContaining({
        span: spanOf(src, "something", 2),
      }),
    );
  });

  test("hover a constructor", () => {
    const src = `
        type T { Constr(Int) }
        let t = Constr(42)
    `;
    const [, hoverable] = parseHover(src, "Constr", 2)!;
    expect(hoverable).toEqual<Hovered>({
      span: spanOf(src, "Constr", 2),
      hovered: expect.objectContaining({
        type: "constructor",
      }),
    });
  });

  test("snapshot when hovering on global fn", () => {
    const src = `let glb = fn x, y { y }`;
    const [scheme, hoverable] = parseHover(src, "glb")!;
    expect(hoverToMarkdown(scheme, hoverable)).toMatchSnapshot();
  });

  test("snapshot when hovering on an extern type", () => {
    const src = `extern let glb: Fn(x) -> x`;
    const [scheme, hoverable] = parseHover(src, "glb")!;
    expect(hoverToMarkdown(scheme, hoverable)).toMatchSnapshot();
  });

  test("snapshot when hovering on an extern type reference", () => {
    const src = `
      extern let glb: Fn(x) -> x
      let v = glb
    `;
    const [scheme, hoverable] = parseHover(src, "glb", 2)!;
    expect(hoverToMarkdown(scheme, hoverable)).toMatchSnapshot();
  });

  test("snapshot when hovering on a local fn", () => {
    const src = `
      let glb = fn a {
        let closure = fn x { a };
        0
      }
    `;
    const [scheme, hoverable] = parseHover(src, "closure")!;
    expect(hoverToMarkdown(scheme, hoverable)).toMatchSnapshot();
  });

  test("snapshot when hovering on a constructor", () => {
    const src = `
      type T<content> { X, Constr(content) }
    `;
    const [scheme, hoverable] = parseHover(src, "Constr")!;
    expect(hoverToMarkdown(scheme, hoverable)).toMatchSnapshot();
  });

  test("snapshot when hovering on a constructor reference", () => {
    const src = `
      type T<content> { Constr(content) }

      pub let c = Constr(42)
    `;
    const [scheme, hoverable] = parseHover(src, "Constr", 2)!;
    expect(hoverToMarkdown(scheme, hoverable)).toMatchSnapshot();
  });
});

describe("goToDefinition", () => {
  test("glb decl", () => {
    const src = `
      let glb = 42
      let _ = glb
    `;
    const location = parseGotoDef(src, "glb", 2);
    expect(location?.span).toEqual(spanOf(src, "glb"));
  });

  test("let decl", () => {
    const src = `let _ = { let x = 42; 1 + x }`;
    const location = parseGotoDef(src, "x", 2);
    expect(location?.span).toEqual(spanOf(src, "x", 1));
  });

  test("fn par", () => {
    const src = `let _ = fn x { x }`;
    const location = parseGotoDef(src, "x", 2);
    expect(location?.span).toEqual(spanOf(src, "x", 1));
  });

  test("wrapped in an if and appl", () => {
    const src = `let _ = fn a, loc_var {
      if True {
        0
      } else {
        f(loc_var)
      }
    }`;
    const location = parseGotoDef(src, "loc_var", 2);
    expect(location?.span).toEqual(spanOf(src, "loc_var", 1));
  });

  test("pattern ident", () => {
    const src = `
      type Box<a> { Box(a) }
      let _ = match Box(Box(42)) {
        _ => 0,
        Box(Box(local_var)) => local_var,
      }
    `;
    const location = parseGotoDef(src, "local_var", 2);
    expect(location?.span).toEqual(spanOf(src, "local_var", 1));
  });

  test("valid recursive let bindings", () => {
    const src = `
      let x = f(fn { x })
    `;
    const location = parseGotoDef(src, "x", 2);
    expect(location?.span).toEqual(spanOf(src, "x", 1));
  });

  test("invalid recursive let bindings", () => {
    const src = `
      let x = x
    `;
    const location = parseGotoDef(src, "x", 2);
    expect(location?.span).toEqual(undefined);
  });

  test("shadowed let", () => {
    const src = `
      let x = {
        let a = 0;
        let a = a;
        42
      }
    `;
    const location = parseGotoDef(src, "a", 3);
    expect(location?.span).toEqual(spanOf(src, "a", 1));
  });
});

function parseHover(
  src: string,
  hovering: string,
  occurrenceNumber = 1,
): [TypeScheme, Hovered] | undefined {
  const offset = indexOf(src, hovering, occurrenceNumber);

  if (offset === undefined) {
    throw new Error("Invalid offset");
  }

  const parsed = unsafeParse(src);
  const [typed, _] = typecheck("Main", parsed);
  return hoverOn("Ns", typed, offset);
}

function parseGotoDef(
  src: string,
  hovering: string,
  occurrenceNumber = 1,
): Location | undefined {
  const offset = indexOf(src, hovering, occurrenceNumber);

  if (offset === undefined) {
    throw new Error("Invalid offset");
  }

  const parsed = unsafeParse(src);
  const [typed, _] = typecheck("Main", parsed);
  return goToDefinitionOf(typed, offset);
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
