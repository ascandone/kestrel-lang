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
    "(:def x 0)

    (:def y x)"
  `);
});

function getIR(src: string) {
  const untypedMod = unsafeParse(src);
  const [tc, errors] = typecheck("pkg", "Main", untypedMod, {}, []);
  expect(errors).toEqual([]);
  return lowerProgram(tc);
}

function toSexpr(src: string) {
  const ir = getIR(src);
  const sexpr = programToSexpr(ir);
  return formatSexpr(sexpr);
}
