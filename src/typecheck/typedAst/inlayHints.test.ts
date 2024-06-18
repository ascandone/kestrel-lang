import { describe, test, expect, beforeEach } from "vitest";
import { getInlayHints, InlayHint } from "./inlayHint";
import { unsafeParse } from "../../parser";
import { resetTraitsRegistry, typecheck } from "../typecheck";
import { spanOf } from "./__test__/utils";

test("no inlay hints on empty program", () => {
  const src = ``;
  const hints = getInlayHintsOf(src);
  expect(hints).toEqual([]);
});

describe("pipe inlay hints", () => {
  test("inlay hints in pipe", () => {
    const src = `
      let identity = fn x { x }
      let to_str = fn _ { "ab" }

      let x = 42
        |> identity()
        |> to_str()
    `;

    const hints = getInlayHintsOf(src);
    expect(hints).toHaveLength(3);
    expect(hints).toEqual<InlayHint[]>(
      expect.arrayContaining([
        {
          label: "Int",
          offset: spanOf(src, "let x = 42")[1],
          paddingLeft: true,
        },
        {
          label: "Int",
          offset: spanOf(src, "|> identity()")[1],
          paddingLeft: true,
        },
        {
          label: "String",
          offset: spanOf(src, "|> to_str()")[1],
          paddingLeft: true,
        },
      ]),
    );
  });

  test("pipe wrapped in fn, let, let#, and list lit", () => {
    const src = `
      let identity = fn x { x }
      let x = fn {
        let _ = 0;
        let#f _ = 0;
        [
          42
          |> identity(),
        ]
    }
    `;

    const hints = getInlayHintsOf(src);
    expect(hints).toHaveLength(2);
    expect(hints).toEqual<InlayHint[]>(
      expect.arrayContaining([
        {
          label: "Int",
          offset: spanOf(src, "42")[1],
          paddingLeft: true,
        },
        {
          label: "Int",
          offset: spanOf(src, "|> identity()")[1],
          paddingLeft: true,
        },
      ]),
    );
  });

  test("pipe wrapped in pattern match and if", () => {
    const src = `
      let identity = fn x { x }
      let x = match 0 {
        _ => if a {
          42
          |> identity()
        } else {
         0
        }
      }
    `;

    const hints = getInlayHintsOf(src);
    expect(hints).toHaveLength(2);
    expect(hints).toEqual<InlayHint[]>(
      expect.arrayContaining([
        {
          label: "Int",
          offset: spanOf(src, "42")[1],
          paddingLeft: true,
        },
        {
          label: "Int",
          offset: spanOf(src, "|> identity()")[1],
          paddingLeft: true,
        },
      ]),
    );
  });

  test("no inlay hints when application is not piped", () => {
    const src = `
    let identity = fn x { x }
    let x = identity(42)
  `;

    const hints = getInlayHintsOf(src);
    expect(hints).toEqual<InlayHint[]>([]);
  });

  test("inlay hints honor the type schemes in the toplevel statement", () => {
    const src = `
      let identity = fn x { x }
      let x = fn _arg1, arg2 {
          arg2
          |> identity()
      }
  `;

    const hints = getInlayHintsOf(src);
    expect(hints).toHaveLength(2);
    expect(hints).toEqual<InlayHint[]>([
      {
        label: "b",
        offset: spanOf(src, "arg2", 2)[1],
        paddingLeft: true,
      },
      {
        label: "b",
        offset: spanOf(src, "|> identity()")[1],
        paddingLeft: true,
      },
    ]);
  });
});

function getInlayHintsOf(src: string): InlayHint[] {
  const parsed = unsafeParse(src);
  const [typed, _] = typecheck("Main", parsed);
  return getInlayHints(typed);
}

beforeEach(() => {
  resetTraitsRegistry();
});
