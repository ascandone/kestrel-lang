import { describe, test, expect, beforeEach } from "vitest";
import { getInlayHints, InlayHint, PositionedDocument } from "./inlayHint";
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
      let identity = |x| { x }
      let to_str = |_| { "ab" }

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

  test("no inlay hints are emitted on pipelines that do not span multiple lines", () => {
    const src = `
      let identity = |x| { x }

      let x = 42 |> identity() |> identity()
    `;

    const hints = getInlayHintsOf(src);

    expect(hints).toEqual<InlayHint[]>([]);
  });

  test("no inlay hints are emitted on pipelines that do not span multiple lines (1)", () => {
    const src = `
      let identity = |x| { x }

      let x = 42 |> identity()
        |> identity()
    `;

    const hints = getInlayHintsOf(src);

    expect(hints).toEqual<InlayHint[]>([
      {
        label: "Int",
        offset: spanOf(src, "|> identity()", 2)[1],
        paddingLeft: true,
      },
    ]);
  });

  test.todo(
    "no inlay hints are emitted on pipelines that do not span multiple lines (2)",
    () => {
      const src = `
      let identity = |x| { x }

      let x = 42
        |> identity() |> identity()
    `;

      const hints = getInlayHintsOf(src);

      expect(hints).toEqual<InlayHint[]>([
        {
          label: "Int",
          paddingLeft: true,
          offset: spanOf(src, "42")[1],
        },
        {
          label: "Int",
          paddingLeft: true,
          offset: spanOf(src, "|> identity()", 2)[1],
        },
      ]);
    },
  );

  test("pipe wrapped in fn, let, let#, and list lit", () => {
    const src = `
      let identity = |x| { x }
      let x = || {
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
      let identity = |x| { x }
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
    let identity = |x| { x }
    let x = identity(42)
  `;

    const hints = getInlayHintsOf(src);
    expect(hints).toEqual<InlayHint[]>([]);
  });

  test("inlay hints honor the type schemes in the toplevel statement", () => {
    const src = `
      let identity = |x| { x }
      let x = |_arg1, arg2| {
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

  return getInlayHints(typed, srcToPositionedDoc(src));
}

beforeEach(() => {
  resetTraitsRegistry();
});

function srcToPositionedDoc(src: string): PositionedDocument {
  const lines = src.split("\n").map((s) => s.length + 1);

  return {
    positionAt(offset) {
      let line = 0;

      for (; line <= lines.length; line++) {
        const charsNumber = lines[line]!;

        if (offset < charsNumber) {
          return { line };
        }

        offset -= charsNumber;
      }

      return { line };
    },
  };
}

test("mocked positionedDocument", () => {
  const doc = srcToPositionedDoc(`012
45
789`);

  expect(doc.positionAt(0)).toEqual({ line: 0 });
  expect(doc.positionAt(1)).toEqual({ line: 0 });
  expect(doc.positionAt(2)).toEqual({ line: 0 });
  expect(doc.positionAt(3)).toEqual({ line: 0 });
  expect(doc.positionAt(4)).toEqual({ line: 1 });
  expect(doc.positionAt(5)).toEqual({ line: 1 });
  expect(doc.positionAt(7)).toEqual({ line: 2 });
  expect(doc.positionAt(8)).toEqual({ line: 2 });
  expect(doc.positionAt(9)).toEqual({ line: 2 });
});
