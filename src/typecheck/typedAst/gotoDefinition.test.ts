import { test, expect } from "vitest";
import { goToDefinitionOf, Location } from "../typedAst";
import { unsafeParse } from "../../parser";
import { typecheck } from "../typecheck";
import { indexOf, spanOf } from "./__test__/utils";

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

test("type ast", () => {
  const src = `
      type X {}
      type Box<a> {}
      extern let x: Box<Fn() -> X>
    `;
  const location = parseGotoDef(src, "X", 2);
  expect(location?.span).toEqual(spanOf(src, "type X {}", 1));
});

test("do not leak bindings", () => {
  const src = `
  pub let glb = fn loc_var {
    let _ = fn loc_var { 0 };
    loc_var
  }
  `;

  const location = parseGotoDef(src, "loc_var", 3);
  expect(location?.span).toEqual(spanOf(src, "loc_var", 1));
});

test("type ast in constructors", () => {
  const src = `
      type X {}
      type Box<a> {}

      type Custom {
        CustomConstr(Box<X>)
      }
    `;
  const location = parseGotoDef(src, "X", 2);
  expect(location?.span).toEqual(spanOf(src, "type X {}", 1));
});

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
