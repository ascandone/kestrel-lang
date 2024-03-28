import { expect, test, describe } from "vitest";
import { showErrorLine } from "./showErrorLine";

describe("showErrorLine", () => {
  test("when it spans over a single line", () => {
    // first line: 13 chars (+1)

    const code = `const xa = 0;
const xb = 1;
const xc = 2;
  `;

    const out = showErrorLine(code, [14 + 6, 14 + 8]);

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

    const lineC = "const xa = 0;";
    const startIndex = code.indexOf(lineC);

    expect(
      showErrorLine(code, [startIndex + 6, startIndex + 6 + 2]),
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

    expect(showErrorLine(code, [14 + 11, 14 + 14 + 3])).toMatchInlineSnapshot(
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

    expect(showErrorLine(src, [19, 20])).toMatchInlineSnapshot(
      `
      "2|   if a
       | [31m     ~[0m"
    `,
    );
  });
});
