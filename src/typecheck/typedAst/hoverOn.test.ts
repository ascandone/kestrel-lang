import { test, expect, beforeEach } from "vitest";
import { Hovered, hoverOn, hoverToMarkdown } from "../typedAst";
import { unsafeParse } from "../../parser";
import { resetTraitsRegistry, typecheck } from "../typecheck";
import { TypeScheme } from "../type";
import { indexOf, spanOf } from "./__test__/utils";

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

test("hover within a list", () => {
  const src = `
  let hovered_number = 42
  let expr = [hovered_number]
`;
  const [, hoverable] = parseHover(src, "hovered_number", 2)!;
  expect(hoverable).toEqual<Hovered>({
    span: spanOf(src, "hovered_number", 2),
    hovered: expect.objectContaining({
      type: "global-variable",
    }),
  });
});

test("hover within a pipe call", () => {
  const src = `
        let id = fn x { x }
        let hovered_number = 42
        let expr =
          hovered_number
          |> id()
          |> id()
    `;
  const [, hoverable] = parseHover(src, "hovered_number", 2)!;
  expect(hoverable).toEqual<Hovered>({
    span: spanOf(src, "hovered_number", 2),
    hovered: expect.objectContaining({
      type: "global-variable",
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

test("hover a type def", () => {
  const src = `
      type T { }
    `;
  const [, hoverable] = parseHover(src, "T", 1)!;
  expect(hoverable).toEqual<Hovered>({
    span: spanOf(src, "type T { }", 1),
    hovered: expect.objectContaining({
      type: "type",
    }),
  });
});

test("hover a type ast", () => {
  const src = `
        type T { }
        type Box<a> { }
        extern let t: Fn() -> Box<T>
    `;
  const [, hoverable] = parseHover(src, "T", 2)!;
  expect(hoverable).toEqual<Hovered>({
    span: spanOf(src, "T", 2),
    hovered: expect.objectContaining({
      type: "type",
    }),
  });
});

test("hover a type ast in constructor", () => {
  const src = `
      type X { }
      type T { Constr(X) }
    `;
  const [, hoverable] = parseHover(src, "X", 2)!;
  expect(hoverable).toEqual<Hovered>({
    span: spanOf(src, "X", 2),
    hovered: expect.objectContaining({
      type: "type",
      typeDecl: expect.objectContaining({
        name: "X",
      }),
    }),
  });
});

test("hover on a field (instantiated)", () => {
  const src = `
      type X<gen> struct { some_field: gen }
      let x = X { some_field: 42 }

      pub let hov = x.some_field
    `;
  const [, hoverable] = parseHover(src, "some_field", 3)!;

  expect(hoverable.hovered).toEqual({
    type: "field",
    type_: "Int",
  });
});

test("hover on a field (tvar)", () => {
  const src = `
      type X<gen> struct { some_field: gen }
      pub let hov = fn x { x.some_field }
    `;
  const [, hoverable] = parseHover(src, "some_field", 2)!;

  expect(hoverable.hovered).toEqual({
    type: "field",
    type_: "a",
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
  const ret = hoverOn("Ns", typed, offset);
  if (ret === undefined) {
    throw new Error("Undefined hover");
  }
  return ret;
}

beforeEach(() => {
  resetTraitsRegistry();
});
