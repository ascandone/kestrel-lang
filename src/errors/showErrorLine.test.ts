import { expect, test, describe } from "vitest";
import { showErrorLine } from "./showErrorLine";

describe("showErrorLine", () => {
  test("when it spans over a single line", () => {
    // first line: 13 chars (+1)

    const code = `const xa = 0;
const xb = 1;
const xc = 2;
  `;

    const out = showErrorLine(code, {
      start: { line: 1, character: 6 },
      end: { line: 1, character: 8 },
    });

    expect(out).toMatchInlineSnapshot(
      `
      "2| const xb = 1;
       | [31m      ~~[0m"
    `,
    );
  });

  test("works with file that have lines with many digits", () => {
    // first line: 13 chars (+1)

    const code = `










const xa = 0;
`;

    expect(
      showErrorLine(
        code,

        {
          start: { line: 11, character: 6 },
          end: { line: 11, character: 8 },
        },
      ),
    ).toMatchInlineSnapshot(
      `
      "12| const xa = 0;
        | [31m      ~~[0m"
    `,
    );
  });

  test("when it spans over two lines", () => {
    // first line: 13 chars (+1)
    // second line: 13 chars (+1)

    const code = `const xa = 0;
const xb = 1;
const xc = 2;
  `;

    expect(
      showErrorLine(code, {
        start: { line: 1, character: 11 },
        end: { line: 2, character: 3 },
      }),
    ).toMatchInlineSnapshot(
      `
      "2| const xb = 1;
       | [31m           ~~[0m
      3| const xc = 2;
       | [31m~~~[0m"
    `,
    );
  });

  test("example", () => {
    const src = `let apply f =
  if a
  then 0
  else 0
in 0
  `;

    expect(
      showErrorLine(src, {
        // [19, 20]
        start: { line: 1, character: 5 },
        end: { line: 1, character: 6 },
      }),
    ).toMatchInlineSnapshot(
      `
      "2|   if a
       | [31m     ~[0m"
    `,
    );
  });
});
