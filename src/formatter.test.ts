import { test, expect } from "vitest";
import { unsafeParse } from "./parser";
import { format } from "./formatter";

test("int lit", () => {
  assertFormatted(`let x = 42\n`);
});

test("float lit", () => {
  assertFormatted(`let x = 1.2\n`);
});

test("string lit", () => {
  assertFormatted(`let x = "abc"\n`);
});

test("identifier", () => {
  assertFormatted(`let x = y\n`);
});

test("namespaced identifier", () => {
  assertFormatted(`let x = A/B/C.y\n`);
});

test("application with no args", () => {
  assertFormatted(`let x = f()\n`);
});

test("application with one arg", () => {
  assertFormatted(`let x = f(0)\n`);
});

test("application with many args", () => {
  assertFormatted(`let x = f(0, 1, 2)\n`);
});

test("multiple declrs", () => {
  assertFormatted(`let x = 0

let y = 1\n`);
});

test("if expr", () => {
  assertFormatted(`let _ = if cond {
  0
} else {
  1
}
`);
});

test("fn with no params", () => {
  assertFormatted(`let f = fn {
  x
}
`);
});

test("fn with params", () => {
  assertFormatted(`let f = fn a, b, c {
  x
}
`);
});

test("fn inside function call", () => {
  assertFormatted(`let x = f(0, 1, fn a {
  x
})
`);
});

test("if inside fn", () => {
  assertFormatted(`let f = fn {
  if cond {
    x
  } else {
    y
  }
}
`);
});

test("toplevel let expr", () => {
  assertFormatted(`let f = {
  let x = value;
  body
}
`);
});

test("toplevel nested let expr", () => {
  assertFormatted(`let f = {
  let x = value;
  let y = value2;
  let z = value3;
  body
}
`);
});

test("let inside fn", () => {
  assertFormatted(`let f = fn {
  let x = value;
  body
}
`);
});

test("let inside if body", () => {
  assertFormatted(`let f = if cond {
  let x = value;
  let y = value2;
  body1
} else {
  let x = value;
  let y = value2;
  body2
}
`);
});

function assertFormatted(src: string) {
  const ast = unsafeParse(src);
  expect(format(ast)).toBe(src);
}
