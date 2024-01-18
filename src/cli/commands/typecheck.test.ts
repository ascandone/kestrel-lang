import { expect, test, describe } from "vitest";
import { showErrorLine } from "./typecheck";

describe("showErrorLine", () => {
  test("when it spans over a single line", () => {
    // first line: 13 chars (+1)

    const code = `const xa = 0;
const xb = 1;
const xc = 2;
  `;

    const lineC = "const xb = 1;";
    const lineE = "      ~~";
    expect(showErrorLine(code, [14 + 6, 14 + 8])).toBe(
      `\x1b[47m\x1b[30m2\x1b[0m ${lineC}
\x1b[47m \x1b[0m \x1b[31m${lineE}\x1b[0m`,
    );
  });

  test("when it spans over two lines", () => {
    // first line: 13 chars (+1)
    // second line: 13 chars (+1)

    const code = `const xa = 0;
const xb = 1;
const xc = 2;
  `;

    const lineC1 = "const xb = 1;";
    const lineE1 = "           ~~";
    const lineC2 = "const xc = 2;";
    const lineE2 = "~~~";

    expect(showErrorLine(code, [14 + 11, 14 + 14 + 3])).toBe(
      `\x1b[47m\x1b[30m2\x1b[0m ${lineC1}
\x1b[47m \x1b[0m \x1b[31m${lineE1}\x1b[0m
\x1b[47m\x1b[30m3\x1b[0m ${lineC2}
\x1b[47m \x1b[0m \x1b[31m${lineE2}\x1b[0m`,
    );
  });

  test("example", () => {
    const src = `let apply f =
  if a
  then 0
  else 0
in 0
  `;

    const span = [19, 20];

    const l1 = "  if a";
    const e1 = "     ~";

    expect(showErrorLine(src, [19, 20])).toBe(
      `\x1b[47m\x1b[30m2\x1b[0m ${l1}
\x1b[47m \x1b[0m \x1b[31m${e1}\x1b[0m`,
    );
  });
});
