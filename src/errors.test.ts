import { describe, expect, test } from "vitest";
import { errorInfoToString } from "./errors";
import { unsafeParse } from "./parser";
import { typecheck } from "./typecheck";

describe(errorInfoToString.name, () => {
  test("unbound variable", () => {
    const src = "pub let x = unbound_var";
    snapshotErr(src);
  });

  test("arity mismatch (too many args)", () => {
    const src = `
      pub let f = |x| { x }
      pub let x = f(0, 1)
    `;
    snapshotErr(src);
  });

  test("arity mismatch (too few args)", () => {
    const src = `
      pub let f = |x, _y| { x }
      pub let x = f(0)
    `;
    snapshotErr(src);
  });

  test("type error", () => {
    const src = `
      type Custom {}
      pub let x: Custom = "abc"
    `;
    snapshotErr(src);
  });
});

function snapshotErr(src: string, opts: { DEBUG_LOG?: boolean } = {}) {
  const module = "Main";
  const parsed = unsafeParse(src);
  const [, errors] = typecheck(module, parsed, {}, []);

  if (errors.length !== 1) {
    console.log(errors);
  }
  expect(errors).toHaveLength(1);

  const error = errors[0]!;
  const out = errorInfoToString(src, error);

  if (opts.DEBUG_LOG) {
    console.log(out);
  }

  expect(out).toMatchSnapshot();
}
