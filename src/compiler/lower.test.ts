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

test("let# sugar", () => {
  // mapper(value, fn x {
  //   g(x)
  // })

  const ir = toSexpr(`
    let f = fn mapper, value, g {
      let#mapper x = value;
      g(x)
    }
  `);

  expect(ir).toMatchInlineSnapshot(
    `
    "(:def f
        (:fn (mapper#0 value#0 g#0)
            (mapper#0
                value#0
                (:fn (x#0)
                    (g#0 x#0)))))"
  `,
  );
});

test("shadowed fn args", () => {
  const ir = toSexpr(`
    let f = {
      let a = 0;
      fn a { a }
    }
  `);
  expect(ir).toMatchInlineSnapshot(
    `
    "(:def f
        (:let (a#0 0)
            (:fn (a#1)
                a#1)))"
  `,
  );
});

test("proper counting", () => {
  const ir = toSexpr(`
    let f = fn a, b { a }

    pub let glb = f(
      { let x = 0; x },
      { let x = 0; x },
    )
  `);
  expect(ir).toMatchInlineSnapshot(
    `
    "(:def f
        (:fn (a#0 b#0)
            a#0))

    (:def glb
        (f
            (:let (x#0 0)
                x#0)
            (:let (x#1 0)
                x#1)))"
  `,
  );
});

test("if expr", () => {
  const ir = toSexpr(`
    let f = fn b, x, y {
      if b {
        x
      } else {
        y
      }
    }
  `);

  expect(ir).toMatchInlineSnapshot(
    `
    "(:def f
        (:fn (b#0 x#0 y#0)
            (:if b#0
                x#0
                y#0)))"
  `,
  );
});

test("struct creation and access", () => {
  const ir = toSexpr(`
    extern type String
    extern let n: String
    type User struct {
      name: String,
      age: String,
    }

    pub let u = User {
      name: n,
      age: n,
    }

    pub let u2 = fn age {
      User {
        age: age,
        ..u
      }
    }

    pub let acc = u.name
  `);

  expect(ir).toMatchInlineSnapshot(`
    "(:def u
        (:struct User
            (name n)
            (age n)))

    (:def u2
        (:fn (age#0)
            (:struct User
                (age age#0)
                (:spread u))))

    (:def acc
        (.name u))"
  `);
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
      ":if": 1,
      ":struct": 1,
    },
  });
}
