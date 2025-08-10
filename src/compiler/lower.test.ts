import { expect, test } from "vitest";
import { unsafeParse } from "../parser";
import { typecheck } from "../typecheck";
import { lowerProgram } from "./lower";
import { programToSexpr } from "./__test__/ir-to-sexpr";
import { formatSexpr } from "./__test__/sexpr";

test("module (raw)", () => {
  const ir = getIR(`
    pub let x = 0
  `);
  expect(ir).toMatchInlineSnapshot(`
    {
      "namespace": "Main",
      "package_": "pkg",
      "values": [
        {
          "name": "x",
          "value": {
            "type": "constant",
            "value": {
              "type": "int",
              "value": 0,
            },
          },
        },
      ],
    }
  `);
});

test("global value of same module (raw)", () => {
  const ir = getIR(`
    let x = 0
    pub let y = x
  `);
  expect(ir.values).toMatchInlineSnapshot(`
    [
      {
        "name": "x",
        "value": {
          "type": "constant",
          "value": {
            "type": "int",
            "value": 0,
          },
        },
      },
      {
        "name": "y",
        "value": {
          "ident": {
            "name": "pkg:Main:x",
            "type": "global",
          },
          "type": "identifier",
        },
      },
    ]
  `);
});

test("global value of same module", () => {
  const ir = toSexpr(`
    let x = 0
    pub let y = x
  `);
  expect(ir).toMatchInlineSnapshot(`
    "(:def x
        0)

    (:def y
        x)"
  `);
});

test("local value", () => {
  const ir = toSexpr(`
    pub let glb = {
      let loc = 0;
      loc
    }
  `);
  expect(ir).toMatchInlineSnapshot(`
    "(:def glb
        (:let (loc#0 0)
            loc#0))"
  `);
});

test("local value (shadowing)", () => {
  const ir = toSexpr(`
    pub let glb = {
      let loc = 0;
      let mid = loc;
      let loc = mid;
      loc
    }
  `);
  expect(ir).toMatchInlineSnapshot(
    `
    "(:def glb
        (:let (loc#0 0)
            (:let (mid#0 loc#0)
                (:let (loc#1 mid#0)
                    loc#1))))"
  `,
  );
});

test("fn and application", () => {
  const ir = toSexpr(`
    let f = fn a, b { a }

    pub let out = f(1, 2)
  `);
  expect(ir).toMatchInlineSnapshot(
    `
    "(:def f
        (:fn (a#0 b#0)
            a#0))

    (:def out
        (f 1 2))"
  `,
  );
});

test.todo("proper counting", () => {
  const ir = toSexpr(`
    let f = fn a, b { a }

    pub let glb = f(
      { let x = 0; x },
      { let x = 0; x },
    )
  `);
  expect(ir).toMatchInlineSnapshot(
    `
    "(:def glb
        (:let (loc#0 0)
            (:let (mid#0 loc#0)
                (:let (loc#1 mid#0)
                    loc#1))))"
  `,
  );
});

function getIR(src: string) {
  const untypedMod = unsafeParse(src);
  const [tc, errors] = typecheck("pkg", "Main", untypedMod, {}, []);
  expect(errors.filter((e) => e.description.severity === "error")).toEqual([]);
  return lowerProgram(tc);
}

function toSexpr(src: string) {
  const ir = getIR(src);
  const sexpr = programToSexpr(ir);
  return formatSexpr(sexpr, {
    indents: {
      ":def": 1,
      ":let": 1,
      ":fn": 1,
    },
  });
}
