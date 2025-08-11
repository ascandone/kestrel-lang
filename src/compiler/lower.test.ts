import { describe, expect, test } from "vitest";
import { unsafeParse } from "../parser";
import { typecheck } from "../typecheck";
import { lowerProgram } from "./lower";
import { formatIR } from "./__test__/ir-to-sexpr";

test("module (raw)", () => {
  const ir = getIR(`
    type Example<a, b, c> {
      Singleton,
      Unary(a),
      Three(a, c, a),
    }
    pub let x = 0
  `);
  expect(ir).toMatchInlineSnapshot(`
    {
      "adts": [
        {
          "constructors": [
            {
              "arity": 0,
              "name": "pkg:Main:Singleton",
            },
            {
              "arity": 1,
              "name": "pkg:Main:Unary",
            },
            {
              "arity": 3,
              "name": "pkg:Main:Three",
            },
          ],
          "name": "pkg:Main:Example",
        },
      ],
      "namespace": "Main",
      "package_": "pkg",
      "values": [
        {
          "name": "pkg:Main:x",
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
        "name": "pkg:Main:x",
        "value": {
          "type": "constant",
          "value": {
            "type": "int",
            "value": 0,
          },
        },
      },
      {
        "name": "pkg:Main:y",
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

test("intrinsics", () => {
  const ir = toSexpr(`
    extern type Int
    extern let (+): Fn(Int, Int) -> Int

    pub let y = fn a, b {
      a + b
    }
  `);
  expect(ir).toMatchInlineSnapshot(`
    "(:def y
        (:fn (a#0 b#0)
            (+ a#0 b#0)))"
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

test("local value count resets on new declrs", () => {
  const ir = toSexpr(`
    pub let glb1 = {
      let loc = 0;
      loc
    }

    pub let glb2 = {
      let loc = 0;
      loc
    }
  `);
  expect(ir).toMatchInlineSnapshot(`
    "(:def glb1
        (:let (loc#0 0)
            loc#0))

    (:def glb2
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

test("constructor", () => {
  const ir = toSexpr(`
    type Option<a> {
      None,
      Some(a),
    }

    pub let none = None
    pub let some = Some(0)
  `);

  expect(ir).toMatchInlineSnapshot(`
    "(:def none
        None)

    (:def some
        (Some 0))"
  `);
});

test("list literal", () => {
  const ir = toSexpr(`
    pub let lst = [1, 2, 3]
  `);

  expect(ir).toMatchInlineSnapshot(`
    "(:def lst
        (kestrel_core:List.Cons
            1
            (kestrel_core:List.Cons
                2
                (kestrel_core:List.Cons 3 kestrel_core:List.Nil))))"
  `);
});

describe("pattern matching", () => {
  test("toplevel", () => {
    const ir = toSexpr(`
    type Option<a> {
      None,
      Some(a),
    }
    
    pub let m = fn x, f {
      match f(x) {
        None => 0,
        Some(0) => x,
        Some(x) => x,
      }
    }
  `);

    expect(ir).toMatchInlineSnapshot(`
      "(:def m
          (:fn (x#0 f#0)
              (:match (f#0 x#0)
                  ((None) 0)
                  ((Some 0) x#0)
                  ((Some x#1) x#1))))"
    `);
  });

  test("nested", () => {
    const ir = toSexpr(`
    type Option<a> {
      None,
      Some(a),
    }
    
    let opt = Some(Some(0))

    pub let m = 
      match opt {
        Some(Some(x)) => x,
        _ => 0,
      }

  `);

    expect(ir).toMatchInlineSnapshot(`
      "(:def opt
          (Some (Some 0)))

      (:def m
          (:match opt
              ((Some (Some x#0)) x#0)
              (_#0 0)))"
    `);
  });

  test("pattern matching in let", () => {
    const ir = toSexpr(`
    type Box<a> {
      Box(a),
    }

    pub let m = {
      let Box(x) = Box(42);
      x
    }
  `);

    expect(ir).toMatchInlineSnapshot(`
    "(:def m
        (:let (#0 (Box 42))
            (:match #0
                ((Box x#0) x#0))))"
  `);
  });

  test("pattern matching in let#", () => {
    const ir = toSexpr(`
    type Box<a> {
      Box(a),
    }

    pub let m = fn mapper {
      let#mapper Box(x) = 0;
      x
    }
  `);

    expect(ir).toMatchInlineSnapshot(`
    "(:def m
        (:fn (mapper#0)
            (mapper#0
                0
                (:fn (#0)
                    (:match #0
                        ((Box x#0) x#0))))))"
  `);
  });

  test("pattern matching in fn", () => {
    const ir = toSexpr(`
    type Box<a> {
      Box(a),
    }
    
    pub let m = fn Box(x) {
      x
    }
  `);

    expect(ir).toMatchInlineSnapshot(`
    "(:def m
        (:fn (#0)
            (:match #0
                ((Box x#0) x#0))))"
  `);
  });

  test("pattern matching in fn with many args", () => {
    const ir = toSexpr(`
    type Box<a> {
      Box(a),
    }
    
    pub let m = fn Box(x), z, Box(y) {
      y
    }
  `);

    expect(ir).toMatchInlineSnapshot(`
    "(:def m
        (:fn (#0 z#0 #1)
            (:match #0
                ((Box x#0)
                    (:match #1
                        ((Box y#0) y#0))))))"
  `);
  });
});

function getIR(src: string) {
  const untypedMod = unsafeParse(src);
  const [tc, errors] = typecheck("pkg", "Main", untypedMod, {}, []);
  expect(errors.filter((e) => e.description.severity === "error")).toEqual([]);
  return lowerProgram(tc);
}

function toSexpr(src: string) {
  const ir = getIR(src);
  return formatIR(ir);
}
