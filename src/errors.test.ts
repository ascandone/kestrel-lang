import { describe, expect, test } from "vitest";
import { errorInfoToString } from "./errors";
import { unsafeParse } from "./parser";
import { typecheck } from "./typecheck";

describe(errorInfoToString.name, () => {
  test("unbound variable", () => {
    const src = "pub let x = unbound_var";
    snapshotErr(src);
  });
});

function snapshotErr(src: string) {
  const module = "Main";
  const parsed = unsafeParse(src);
  const [, errors] = typecheck(module, parsed, {}, []);

  expect(errors).toHaveLength(1);
  const error = errors[0]!;
  const out = errorInfoToString(src, error);

  expect(out).toMatchSnapshot();
}
