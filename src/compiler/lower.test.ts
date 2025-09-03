import { describe, expect, test } from "vitest";
import { unsafeParse } from "../parser";
import { typecheck } from "../typecheck";
import { lowerProgram } from "./lower";
import { formatIR } from "./__test__/format-ir";
import { typecheckSource_ } from "./__test__/prelude";
import { defaultTraitImpls } from "../typecheck/defaultImports";

test("global value of same module", () => {
  const ir = toSexpr(`
    let x = 0
    pub let y = x
  `);
  expect(ir).toMatchInlineSnapshot(`
    "let pkg:Main.x = 0

    let pkg:Main.y = x"
  `);
});

test("intrinsics", () => {
  const ir = toSexpr(`
    extern type Int
    @extern
    @type (Int, Int) -> Int
    let (+)

    pub let y = fn a, b {
      a + b
    }
  `);
  expect(ir).toMatchInlineSnapshot(`
    "let pkg:Main.y = fn a#0, b#0 {
      +(a#0, b#0)
    }"
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
    "let pkg:Main.glb = match 0 {
      loc#0 => loc#0,
    }"
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
    "let pkg:Main.glb1 = match 0 {
      loc#0 => loc#0,
    }

    let pkg:Main.glb2 = match 0 {
      loc#0 => loc#0,
    }"
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
    "let pkg:Main.glb = match 0 {
      loc#0 => match loc#0 {
        mid#0 => match mid#0 {
          loc#1 => loc#1,
        },
      },
    }"
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
    "let pkg:Main.f = fn a#0, b#0 {
      a#0
    }

    let pkg:Main.out = f(1, 2)"
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
    "let pkg:Main.f = fn mapper#0, value#0, g#0 {
      mapper#0(value#0, fn x#0 {
        g#0(x#0)
      })
    }"
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
    "let pkg:Main.f = match 0 {
      a#0 => fn a#1 {
        a#1
      },
    }"
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
    "let pkg:Main.f = fn a#0, b#0 {
      a#0
    }

    let pkg:Main.glb = f(
      match 0 {
        x#0 => x#0,
      },
      match 0 {
        x#1 => x#1,
      },
    )"
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
    "let pkg:Main.f = fn b#0, x#0, y#0 {
      match b#0 {
        True => x#0,
        False => y#0,
      }
    }"
  `,
  );
});

test("struct creation and access", () => {
  const ir = toSexpr(`
    extern type String
    @extern
    @type String
    let n
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
    "let pkg:Main.u = User {
      name: n,
      age: n,
    }

    let pkg:Main.u2 = fn age#0 {
      User {
        age: age#0,
        ..u
      }
    }

    let pkg:Main.acc = u.name"
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
    "let pkg:Main.none = None

    let pkg:Main.some = Some(0)"
  `);
});

test("list literal", () => {
  const ir = toSexpr(`
    pub let lst = [1, 2, 3]
  `);

  expect(ir).toMatchInlineSnapshot(`
    "let pkg:Main.lst = kestrel_core:List.Cons(
      1,
      kestrel_core:List.Cons(2, kestrel_core:List.Cons(3, kestrel_core:List.Nil)),
    )"
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
      "let pkg:Main.m = fn x#0, f#0 {
        match f#0(x#0) {
          None => 0,
          Some(0) => x#0,
          Some(x#1) => x#1,
        }
      }"
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
      "let pkg:Main.opt = Some(Some(0))

      let pkg:Main.m = match opt {
        Some(Some(x#0)) => x#0,
        _#0 => 0,
      }"
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
      "let pkg:Main.m = match Box(42) {
        Box(x#0) => x#0,
      }"
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
      "let pkg:Main.m = fn mapper#0 {
        mapper#0(0, fn #0 {
          match #0 {
            Box(x#0) => x#0,
          }
        })
      }"
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
      "let pkg:Main.m = fn #0 {
        match #0 {
          Box(x#0) => x#0,
        }
      }"
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
      "let pkg:Main.m = fn #0, z#0, #1 {
        match #0 {
          Box(x#0) => match #1 {
            Box(y#0) => y#0,
          },
        }
      }"
    `);
  });
});

describe("traits", () => {
  test("pass traits to value", () => {
    const out = dumpIR(`
      @extern
      @type a where a: Show
      let p

      type Str {}
      @extern
      @type (Str) -> a
      let take_int

      let x = take_int(p)
    `);
    expect(out).toMatchInlineSnapshot(
      `"let pkg:Main.x = take_int(p[Str:Show])"`,
    );
  });

  test("unresolved traits", () => {
    const out = dumpIR(`
      @extern
      @type z where z: Show
      let p

      // inferred as:
      //@type a where a: Show
      let x = p
    `);
    expect(out).toMatchInlineSnapshot(`"let pkg:Main.x[a:Show] = p[a:Show]"`);
  });

  test("pass to fn", () => {
    const out = dumpIR(`
      @extern
      @type (a) -> String where a: Show
      let show
      let f = fn x { show(x) }
    `);
    expect(out).toMatchInlineSnapshot(`
      "let pkg:Main.f[a:Show] = fn x#0 {
        show[a:Show](x#0)
      }"
    `);
  });

  test("handles recursive defs", () => {
    const out = dumpIR(`
      @extern
      @type (a) -> String where a: Show
      let show

      pub let rec_val = fn unresolved, unresolved2 {
        let _ = show(unresolved);
        let _ = show(unresolved2);
        rec_val(unresolved, unresolved2)
      }
    `);
    expect(out).toMatchInlineSnapshot(`
      "let pkg:Main.rec_val[a:Show, b:Show] = fn unresolved#0, unresolved2#0 {
        match show[a:Show](unresolved#0) {
          _#0 => match show[b:Show](unresolved2#0) {
            _#1 => rec_val[a:Show, b:Show](unresolved#0, unresolved2#0),
          },
        }
      }"
    `);
  });

  test("make sure we don't show duplicates", () => {
    const out = dumpIR(`
      @extern
      @type (a) -> a where a: Show
      let show
      let f = fn x { show(x) }
    `);
    expect(out).toMatchInlineSnapshot(`
      "let pkg:Main.f[a:Show] = fn x#0 {
        show[a:Show](x#0)
      }"
    `);
  });

  test("handle multiple traits", () => {
    const out = dumpIR(`
      @extern
      @type (a, a) -> String where a: Eq + Show
      let show
      let f = show
    `);
    expect(out).toMatchInlineSnapshot(
      `"let pkg:Main.f[a:Eq, a:Show] = show[a:Eq, a:Show]"`,
    );
  });

  test("handle multiple traits when applying to concrete args", () => {
    const out = dumpIR(
      `
      @extern
      @type (a, a) -> String where a: Eq + Show
      let show

      
      type S {} // <- it derives both Eq and Show

      @extern
      @type S
      let s
      
      let f = show(s, s)
    `,
    );

    expect(out).toMatchInlineSnapshot(
      `"let pkg:Main.f = show[S:Eq, S:Show](s, s)"`,
    );
  });

  test("do not pass extra args", () => {
    const out = dumpIR(
      `
      @extern
      @type (u) -> String where u: Show
      let inspect

      @extern
      @type (z, z) -> Bool where z: Eq
      let eq

      let equal = fn x, y {
        if eq(x, y) {
          "ok"
        } else {
          inspect(x)
        }
      }
    `,
    );

    expect(out).toMatchInlineSnapshot(`
      "let pkg:Main.equal[a:Eq, a:Show] = fn x#0, y#0 {
        match eq[a:Eq](x#0, y#0) {
          True => "ok",
          False => inspect[a:Show](x#0),
        }
      }"
    `);
  });

  test("do not duplicate when there's only one var to pass", () => {
    const out = dumpIR(
      `
      @extern
      @type (a, a) -> String where a: Show
      let show2

      let f = fn arg {
        show2(arg, "hello")
      }
    `,
    );
    expect(out).toMatchInlineSnapshot(
      `
      "let pkg:Main.f = fn arg#0 {
        show2[String:Show](arg#0, "hello")
      }"
    `,
    );
  });

  test("pass an arg twice if needed", () => {
    const out = dumpIR(
      `
      @extern
      @type (a, b) -> String where a: Show, b: Show
      let show2
      let f = show2("a", "b")
    `,
    );
    expect(out).toMatchInlineSnapshot(
      `"let pkg:Main.f = show2[String:Show, String:Show]("a", "b")"`,
    );
  });

  test("partial application", () => {
    const out = dumpIR(
      `
      @extern
      @type (k, u) -> String where k: Show, u: Show
      let show2
      let f = fn arg {
        show2(arg, "hello")
      }
    `,
    );

    expect(out).toMatchInlineSnapshot(
      `
      "let pkg:Main.f[a:Show] = fn arg#0 {
        show2[a:Show, String:Show](arg#0, "hello")
      }"
    `,
    );
  });

  test("pass trait dicts for types with params when they do not have deps", () => {
    const out = dumpIR(`
      @extern
      @type (a) -> String where a: Show
      let show

      type AlwaysShow<a> { X }
      
      let x = show(X)
    `);

    expect(out).toMatchInlineSnapshot(
      `"let pkg:Main.x = show[AlwaysShow:Show](X)"`,
    );
  });

  test("pass higher order trait dicts for types with params when they do have deps", () => {
    const out = dumpIR(
      `
      @extern
      @type (a) -> String where a: Show
      let show

      type Option<a, b> { Some(b) }
      
      let x = show(Some(42))
    `,
    );

    expect(out).toMatchInlineSnapshot(
      `"let pkg:Main.x = show[Option:Show(Int:Show)](Some(42))"`,
    );
  });

  test("rigid types sig", () => {
    const out = dumpIR(
      `
      @extern
      @type (a) -> String where a: Show
      let show

      @type (a) -> String where a: Show 
      pub let x=
        fn a { show(a) }
    `,
    );

    expect(out).toMatchInlineSnapshot(`
      "let pkg:Main.x[a:Show] = fn a#0 {
        show[a:Show](a#0)
      }"
    `);
  });

  test("trait deps in args when param aren't traits dependencies", () => {
    const out = dumpIR(`
      type IsShow<a> { X } // IsShow does not depend on 'a' for Show trait
      @extern
      @type IsShow<a> where a: Show
      let s
      let x = s
    `);

    expect(out).toMatchInlineSnapshot(`"let pkg:Main.x[a:Show] = s[a:Show]"`);
  });
});

function getIR(src: string) {
  const untypedMod = unsafeParse(src);
  const [tc, errors] = typecheck("pkg", "Main", untypedMod, {
    implicitImports: [],
  });
  expect(errors.filter((e) => e.description.severity === "error")).toEqual([]);
  return lowerProgram(tc, new Map(), () => {
    // TODO fix this
    return undefined;
  });
}

function toSexpr(src: string) {
  const ir = getIR(src);
  return formatIR(ir);
}

function dumpIR(src: string): string {
  const typed = typecheckSource_("pkg", "Main", src, {}, defaultTraitImpls);
  const ir = lowerProgram(typed, new Map(), () => {
    // TODO fix this
    return undefined;
  });
  return formatIR(ir);
}
