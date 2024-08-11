import { describe, expect, test } from "vitest";
import { CompileOptions, Compiler, compileProject } from "./";
import {
  TypedModule,
  resetTraitsRegistry,
  typecheck,
  typecheckProject,
} from "../typecheck";
import { UntypedModule, unsafeParse } from "../parser";
import { TraitImpl, defaultTraitImpls } from "../typecheck/defaultImports";

test("compile int constants", () => {
  const out = compileSrc(`pub let x = 42`);
  expect(out).toMatchInlineSnapshot(`
    "const Main$x = 42;
    "
  `);
});

test("compile string constants", () => {
  const out = compileSrc(`pub let x = "abc"`);
  expect(out).toMatchInlineSnapshot(`
    "const Main$x = "abc";
    "
  `);
});

test("compile char constants", () => {
  const out = compileSrc(`pub let x = 'a'`);
  expect(out).toMatchInlineSnapshot(`
    "const Main$x = "a";
    "
  `);
});

test("compile string constants with newlines", () => {
  const out = compileSrc(`pub let x = "ab\nc"`);
  expect(out).toMatchInlineSnapshot(`
    "const Main$x = "ab
    c";
    "
  `);
});

test("compile + of ints", () => {
  const out = compileSrc(`pub let x = 1 + 2`);
  expect(out).toMatchInlineSnapshot(`
    "const Main$x = 1 + 2;
    "
  `);
});

test("compile * of ints", () => {
  const out = compileSrc(`pub let x = 1 * 2`);
  expect(out).toMatchInlineSnapshot(`
    "const Main$x = 1 * 2;
    "
  `);
});

test("compile == of ints", () => {
  const out = compileSrc(`pub let x = 1 == 2`);
  expect(out).toMatchInlineSnapshot(`
    "const Main$x = 1 == 2;
    "
  `);
});

test("precedence between * and +", () => {
  const out = compileSrc(`pub let x = (1 + 2) * 3`);
  expect(out).toMatchInlineSnapshot(`
    "const Main$x = (1 + 2) * 3;
    "
  `);
});

test("precedence between * and + (2)", () => {
  const out = compileSrc(`pub let x = 1 + 2 * 3`);
  expect(out).toMatchInlineSnapshot(`
    "const Main$x = 1 + 2 * 3;
    "
  `);
});

test("math expr should have same semantics as js", () => {
  const expr = "2 * 3 + 4";
  const compiled = compileSrc(`pub let x = ${expr}`);

  const evaluated = new Function(`${compiled}; return Main$x`);
  expect(evaluated()).toEqual(2 * 3 + 4);
});

test("refer to previously defined idents", () => {
  const out = compileSrc(`
    let x = 0
    let y = x
  `);
  expect(out).toMatchInlineSnapshot(`
    "const Main$x = 0;

    const Main$y = Main$x;
    "
  `);
});

test("function calls with no args", () => {
  const out = compileSrc(`
    extern let f: Fn() -> a
    let y = f()
  `);
  expect(out).toMatchInlineSnapshot(`
    "const Main$y = Main$f();
    "
  `);
});

test("function calls with args", () => {
  const out = compileSrc(`
    extern let f: Fn(a, a) -> a
    let y = f(1, 2)
  `);

  expect(out).toMatchInlineSnapshot(`
    "const Main$y = Main$f(1, 2);
    "
  `);
});

test("let expressions", () => {
  const out = compileSrc(`
    let x = {
      let local = 0;
      local + 1
    }
  `);

  expect(out).toMatchInlineSnapshot(`
    "const Main$x$local = 0;
    const Main$x = Main$x$local + 1;
    "
  `);
});

test("let expressions with multiple vars", () => {
  const out = compileSrc(`
    let x = {
      let local1 = 0;
      let local2 = 1;
      local1 + local2
    }
  `);

  expect(out).toMatchInlineSnapshot(`
    "const Main$x$local1 = 0;
    const Main$x$local2 = 1;
    const Main$x = Main$x$local1 + Main$x$local2;
    "
  `);
});

test("nested let exprs", () => {
  const out = compileSrc(`
    let x = {
      let local = {
        let nested = 0;
        nested + 1
      };
      local + 2
    }
  `);

  expect(out).toMatchInlineSnapshot(`
    "const Main$x$local$nested = 0;
    const Main$x$local = Main$x$local$nested + 1;
    const Main$x = Main$x$local + 2;
    "
  `);
});

test("shadowed let exprs", () => {
  const out = compileSrc(`
    let x = {
      let a = 0;
      let a = a;
      a
    }
  `);

  expect(out).toMatchInlineSnapshot(`
    "const Main$x$a = 0;
    const Main$x$a$1 = Main$x$a;
    const Main$x = Main$x$a$1;
    "
  `);
});

test("shadowing fn params", () => {
  const out = compileSrc(`
    let f = fn a, a { a }
  `);

  expect(out).toMatchInlineSnapshot(`
    "const Main$f = (a, a$1) => {
      return a$1;
    }
    "
  `);
});

test("shadowing fn params with let", () => {
  const out = compileSrc(`
    let f = fn msg {
      let msg = msg;
      msg
    }
  `);

  expect(out).toMatchInlineSnapshot(`
    "const Main$f = (msg) => {
      const msg$1 = msg;
      return msg$1;
    }
    "
  `);
});

test("two let as fn args, shadowing", () => {
  const out = compileSrc(`
    extern let f: Fn(a, a) -> a
    let x = f(
      { let a = 0; a },
      { let a = 1; a },
    )
`);

  expect(out).toMatchInlineSnapshot(`
    "const Main$x$a = 0;
    const Main$x$a$1 = 1;
    const Main$x = Main$f(Main$x$a, Main$x$a$1);
    "
  `);
});

test("toplevel fn without params", () => {
  const out = compileSrc(`
  let f = fn { 42 }
`);

  expect(out).toMatchInlineSnapshot(`
    "const Main$f = () => {
      return 42;
    }
    "
  `);
});

test("toplevel fn with params", () => {
  const out = compileSrc(`
  let f = fn x, y { y }
`);

  expect(out).toMatchInlineSnapshot(`
    "const Main$f = (x, y) => {
      return y;
    }
    "
  `);
});

test("== performs structural equality when type is unbound", () => {
  const out = compileSrc(`
  extern let (==): Fn(a, a) -> Bool
  let f = fn x, y { x == y }
`);

  expect(out).toMatchInlineSnapshot(`
    "const Main$f = (x, y) => {
      return Main$_eq(x, y);
    }
    "
  `);
});

test("== performs structural equality when type is adt", () => {
  const out = compileSrc(`
    extern let (==): Fn(a, a) -> Bool
    type T { C(Int) }
    let f = C(0) == C(1)
`);

  expect(out).toMatchInlineSnapshot(`
    "function Main$C(a0) {
      return { $: "C", a0 };
    }
    const Main$f = Main$_eq(Main$C(0), Main$C(1));
    "
  `);
});

test("== doesn't perform structural equality when type is int", () => {
  const out = compileSrc(`
  extern let (==): Fn(a, a) -> Bool
  let f = 2 == 0
`);

  expect(out).toMatchInlineSnapshot(`
    "const Main$f = 2 == 0;
    "
  `);
});

test("== doesn't perform structural equality when type is string", () => {
  const out = compileSrc(`
  extern let (==): Fn(a, a) -> Bool
  let f = "a" == "b"
`);

  expect(out).toMatchInlineSnapshot(`
    "const Main$f = "a" == "b";
    "
  `);
});

test("== doesn't perform structural equality when type is float", () => {
  const out = compileSrc(`
  extern let (==): Fn(a, a) -> Bool
  let f = 1.2 == 3.2
`);

  expect(out).toMatchInlineSnapshot(`
    "const Main$f = 1.2 == 3.2;
    "
  `);
});

test("fn inside if return", () => {
  const out = compileSrc(`
  let f =
    if 0 {
      fn { 1 }
    } else {
      2
    }
`);

  expect(out).toMatchInlineSnapshot(`
    "let Main$f;
    if (0) {
      const Main$f$GEN__0 = () => {
        return 1;
      }
      Main$f = Main$f$GEN__0;
    } else {
      Main$f = 2;
    }
    "
  `);
});

test("let inside scope", () => {
  const out = compileSrc(`
  let f = fn {
    let x = 0;
    let y = 1;
    x
  }
`);

  expect(out).toMatchInlineSnapshot(`
    "const Main$f = () => {
      const x = 0;
      const y = 1;
      return x;
    }
    "
  `);
});

test("let inside arg of a function", () => {
  const out = compileSrc(`
  extern let f: Fn(a) -> a
  let a = f({
    let x = 0;
    x
  })
`);

  expect(out).toMatchInlineSnapshot(`
    "const Main$a$x = 0;
    const Main$a = Main$f(Main$a$x);
    "
  `);
});

test("function with a scoped identified as caller", () => {
  const out = compileSrc(`
  let x = {
    let f = fn { 0 };
    f()
  }
`);

  expect(out).toMatchInlineSnapshot(`
    "const Main$x$f = () => {
      return 0;
    }
    const Main$x = Main$x$f();
    "
  `);
});

test("if expression", () => {
  const out = compileSrc(`
  let x =
    if 0 {
      1
    } else {
      2
    }
`);

  expect(out).toMatchInlineSnapshot(`
    "let Main$x;
    if (0) {
      Main$x = 1;
    } else {
      Main$x = 2;
    }
    "
  `);
});

test("tail position if", () => {
  const out = compileSrc(`
    extern let (==): Fn(a, a) -> Bool
    let is_zero = fn n {
      if n == 0 {
        "yes"
      } else {
        "nope"
      }
    }
  `);

  expect(out).toMatchInlineSnapshot(`
    "const Main$is_zero = (n) => {
      if (n == 0) {
        return "yes";
      } else {
        return "nope";
      }
    }
    "
  `);
});

test("nested ifs", () => {
  // TODO switch this to if-else syntax
  const out = compileSrc(`
    extern let (==): Fn(a, a) -> Bool
    let is_zero = fn n {
      if n == 0 {
        "zero"
      } else {
        if n == 1 {
          "one"
        } else {
          "other"
        }
      }
    }
  `);

  expect(out).toMatchInlineSnapshot(`
    "const Main$is_zero = (n) => {
      if (n == 0) {
        return "zero";
      } else {
        if (n == 1) {
          return "one";
        } else {
          return "other";
        }
      }
    }
    "
  `);
});

test("let expr inside if condition", () => {
  const out = compileSrc(`
    let x = if { let a = 0; a == 1 } {
        "a"
      } else {
        "b"
      }
  `);

  expect(out).toMatchInlineSnapshot(`
    "const Main$x$a = 0;
    let Main$x;
    if (Main$x$a == 1) {
      Main$x = "a";
    } else {
      Main$x = "b";
    }
    "
  `);
});

test("eval if", () => {
  const out = compileSrc(`
    extern let (==): Fn(a, a) -> Bool
    let is_zero = fn n {
      if n == 0 {
        "yes"
      } else {
        "nope"
      }
    }
  `);

  const isZero = new Function(`${out}; return Main$is_zero`)();

  expect(isZero(0)).toEqual("yes");
  expect(isZero(42)).toEqual("nope");
});

test("fn inside let", () => {
  const out = compileSrc(`
    let x = {
      let f = fn { 0 };
      f(1)
    }
`);

  expect(out).toMatchInlineSnapshot(`
    "const Main$x$f = () => {
      return 0;
    }
    const Main$x = Main$x$f(1);
    "
  `);
});

test("fn as expr", () => {
  const out = compileSrc(`
    extern let f: Fn(a) -> a
    let x = f(fn {
      1
    })
`);

  expect(out).toMatchInlineSnapshot(`
    "const Main$x$GEN__0 = () => {
      return 1;
    }
    const Main$x = Main$f(Main$x$GEN__0);
    "
  `);
});

test("ifs as expr", () => {
  const out = compileSrc(`
    extern let f: Fn(a) -> a
    let x = f(
      if 0 == 1 {
        "a" 
      } else {
        "b"
      })
`);

  expect(out).toMatchInlineSnapshot(`
    "let Main$x$GEN__0;
    if (0 == 1) {
      Main$x$GEN__0 = "a";
    } else {
      Main$x$GEN__0 = "b";
    }
    const Main$x = Main$f(Main$x$GEN__0);
    "
  `);
});

test("infix exprs producing statements", () => {
  const out = compileSrc(`
    let a = { let x = 0; x } + { let x = 1; x }
  `);

  expect(out).toMatchInlineSnapshot(`
    "const Main$a$x = 0;
    const Main$a$x$1 = 1;
    const Main$a = Main$a$x + Main$a$x$1;
    "
  `);
});

test("iifs", () => {
  // TODO should I fix grammar?
  const out = compileSrc(`
    let a = fn { 42 } ()
  `);

  expect(out).toMatchInlineSnapshot(`
    "const Main$a$GEN__0 = () => {
      return 42;
    }
    const Main$a = Main$a$GEN__0();
    "
  `);
});

test("(let) closures", () => {
  const out = compileSrc(`
    let a = {
      let captured = 42;
      fn { captured }
    }
  `);

  expect(out).toMatchInlineSnapshot(`
    "const Main$a$captured = 42;
    const Main$a = () => {
      return Main$a$captured;
    }
    "
  `);
});

test("fn closures", () => {
  const out = compileSrc(`
    let a = fn {
      fn {
        100
      }
    }
  `);

  expect(out).toMatchInlineSnapshot(`
    "const Main$a = () => {
      const GEN__0 = () => {
        return 100;
      }
      return GEN__0;
    }
    "
  `);
});

test("recursion in closures", () => {
  const out = compileSrc(`
    let f = {
      let x = fn { fn { x() } };
      0
    }
`);

  expect(out).toMatchInlineSnapshot(
    `
    "const Main$f$x = () => {
      const GEN__0 = () => {
        return Main$f$x();
      }
      return GEN__0;
    }
    const Main$f = 0;
    "
  `,
  );
});

test("represent True as true", () => {
  const out = compileSrcWithDeps({
    Basics: `pub(..) type Bool { True, False }`,
    Main: `
      import Basics.{Bool(..)}
      let x = True
    `,
  });

  expect(out).toMatchInlineSnapshot(`
    "const Main$x = true;
    "
  `);
});

test("boolean negation", () => {
  const out = compileSrcWithDeps({
    Basics: `
      pub(..) type Bool { True, False }
      extern pub let (!): Fn(Bool) -> Bool
    `,
    Main: `
      import Basics.{Bool(..), (!)}
      let x = !True
    `,
  });

  expect(out).toMatchInlineSnapshot(`
    "const Main$x = !true;
    "
  `);
});

test("boolean negation and && prec", () => {
  const out = compileSrcWithDeps({
    Basics: `pub(..) type Bool { True, False }`,
    Main: `
      import Basics.{Bool(..)}
      let x = !(True && False)
    `,
  });

  expect(out).toMatchInlineSnapshot(`
    "const Main$x = !(true && false);
    "
  `);
});

test("represent False as false", () => {
  const out = compileSrcWithDeps({
    Basics: `pub(..) type Bool { True, False }`,
    Main: `
      import Basics.{Bool(..)}
      let x = False
    `,
  });

  expect(out).toMatchInlineSnapshot(`
    "const Main$x = false;
    "
  `);
});

test("represent Unit as null", () => {
  const out = compileSrcWithDeps({
    Basics: `
      pub(..) type Unit { Unit }
  `,
    Main: `
    import Basics.{Unit(..)}
    let x = Unit
  `,
  });

  expect(out).toMatchInlineSnapshot(`
    "const Main$x = null;
    "
  `);
});

test("allow custom types with zero args", () => {
  const out = compileSrc(`
    type T { X }

    let x = X
  `);

  expect(out).toMatchInlineSnapshot(`
    "const Main$X = { $: "X" };

    const Main$x = Main$X;
    "
  `);
});

test("allow custom types with one arg", () => {
  const out = compileSrc(`
    type T { X(Int) }

    let x = X
  `);

  expect(out).toMatchInlineSnapshot(`
    "function Main$X(a0) {
      return { $: "X", a0 };
    }
    const Main$x = Main$X;
    "
  `);
});

// TODO inlining?
test("allow custom types with two args", () => {
  const out = compileSrc(`
    type T { X(Int, Int) }

    let x = X
  `);

  expect(out).toMatchInlineSnapshot(`
    "function Main$X(a0, a1) {
      return { $: "X", a0, a1 };
    }
    const Main$x = Main$X;
    "
  `);
});

test("allow non-js operators", () => {
  const out = compileSrc(`let x = "a" ++ "b"`);
  expect(out).toMatchInlineSnapshot(`
    "const Main$x = "a" + "b";
    "
  `);
});

describe("list literal", () => {
  test("compile empty list", () => {
    const out = compileSrc(`let x = []`);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x = List$Nil;
      "
    `);
  });

  test("compile singleton list", () => {
    const out = compileSrc(`let x = [42]`);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x = List$Cons(42, List$Nil);
      "
    `);
  });

  test("compile list with many elements", () => {
    const out = compileSrc(`let x = [0, 1, 2]`);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x = List$Cons(0, List$Cons(1, List$Cons(2, List$Nil)));
      "
    `);
  });

  test("compile list that wraps statements", () => {
    const out = compileSrc(`let x = [{ let loc = 42; loc }]`);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x$loc = 42;
      const Main$x = List$Cons(Main$x$loc, List$Nil);
      "
    `);
  });
});

describe("structs", () => {
  test("struct declaration is a noop", () => {
    const out = compileSrc(`
      extern type String
      type User struct {
          name: String
      }
    `);

    expect(out).toMatchInlineSnapshot(`
      ""
    `);
  });

  test("struct declaration", () => {
    const out = compileSrc(`
      extern type Int
      type Point struct {
          x: Int,
          y: Int,
      }

      pub let user = Point {
        y: 1,
        x: 0,
      } 
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$user = { y: 1, x: 0 };
      "
    `);
  });

  test("empty struct is represented as null", () => {
    const out = compileSrc(`
      extern type Int
      type Nil struct { }

      pub let nil = Nil { }
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$nil = null;
      "
    `);
  });

  test("field access", () => {
    const out = compileSrc(`
      extern type Int

      type Box struct { x: Int }

      pub let b = Box { x: 42 } 

      pub let x_f = b.x
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$b = { x: 42 };

      const Main$x_f = Main$b.x;
      "
    `);
  });

  test("field access of struct lit", () => {
    const out = compileSrc(`
      extern type Int
      type Box struct { x: Int }

      pub let x_f = Box { x: 42 }.x
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$x_f = { x: 42 }.x;
      "
    `);
  });

  test("struct update", () => {
    const out = compileSrc(`
      extern type Int
      type Point3D struct {
        x: Int,
        y: Int,
        z: Int,
      }

      extern let original: Point3D
      pub let update_y = Point3D {
        y: 42,
        ..original
      }
      
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$update_y = { y: 42, x: Main$original.x, z: Main$original.z };
      "
    `);
  });

  test.todo("struct update when expr is not ident");

  // Note: this should never happen, as currently there aren't any
  // builtin infix ops that yield structs
  // still, it's better to handle it
  test.todo("field access of infix expr", () => {
    const out = compileSrc(`
      pub let x_f = (1 + 2).x
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$x_f = { x: 42 }.x;
      "
    `);
  });
});

describe("derive Eq instance", () => {
  test("do not derive underivable types", () => {
    const out = compileSrc(
      `
      extern type DoNotDerive
      type T { X(DoNotDerive) }
    `,
      { allowDeriving: ["Eq"] },
    );
    expect(out).toMatchInlineSnapshot(`
      "function Main$X(a0) {
        return { $: "X", a0 };
      }"
    `);
  });

  test("no variants", () => {
    const out = compileSrc(
      `
      type T { }
    `,
      { allowDeriving: ["Eq"] },
    );
    expect(out).toMatchInlineSnapshot(`
      "const Eq_Main$T = (x, y) => {
        return true;
      }"
    `);
  });

  test("singleton without args", () => {
    const out = compileSrc(
      `
      type T { X }
    `,
      { allowDeriving: ["Eq"] },
    );
    expect(out).toMatchInlineSnapshot(`
      "const Main$X = { $: "X" };

      const Eq_Main$T = (x, y) => {
        return true;
      }"
    `);
  });

  test("singleton with concrete arg", () => {
    const out = compileSrc(
      `
      extern type Int
      type T { X(Int) }
    `,
      {
        allowDeriving: ["Eq"],
        traitImpl: [{ moduleName: "Main", typeName: "Int", trait: "Eq" }],
      },
    );
    expect(out).toMatchInlineSnapshot(`
      "function Main$X(a0) {
        return { $: "X", a0 };
      }
      const Eq_Main$T = (x, y) => {
        return Eq_Main$Int(x.a0, y.a0);
      }"
    `);
  });

  test("singleton with var args", () => {
    const out = compileSrc(
      `
      type T<a, b, c, d> { X(b) }
    `,
      { allowDeriving: ["Eq"] },
    );
    expect(out).toMatchInlineSnapshot(`
      "function Main$X(a0) {
        return { $: "X", a0 };
      }
      const Eq_Main$T = (Eq_b) => (x, y) => {
        return Eq_b(x.a0, y.a0);
      }"
    `);
  });

  test("singleton with concrete args", () => {
    const out = compileSrc(
      `
      extern type Int
      extern type Bool
      type T { X(Int, Bool) }
    `,
      {
        allowDeriving: ["Eq"],
        traitImpl: [
          { moduleName: "Main", typeName: "Int", trait: "Eq" },
          { moduleName: "Main", typeName: "Bool", trait: "Eq" },
        ],
      },
    );
    expect(out).toMatchInlineSnapshot(`
      "function Main$X(a0, a1) {
        return { $: "X", a0, a1 };
      }
      const Eq_Main$T = (x, y) => {
        return Eq_Main$Int(x.a0, y.a0) && Eq_Main$Bool(x.a1, y.a1);
      }"
    `);
  });

  test("type with many variants", () => {
    const out = compileSrc(
      `
      extern type Int
      extern type Bool
      type T<a> {
        A(Int),
        B(a, Int),
        C,
      }
    `,
      {
        allowDeriving: ["Eq"],
        traitImpl: [
          { moduleName: "Main", typeName: "Int", trait: "Eq" },
          { moduleName: "Main", typeName: "Bool", trait: "Eq" },
        ],
      },
    );

    expect(out).toMatchInlineSnapshot(`
      "function Main$A(a0) {
        return { $: "A", a0 };
      }
      function Main$B(a0, a1) {
        return { $: "B", a0, a1 };
      }
      const Main$C = { $: "C" };

      const Eq_Main$T = (Eq_a) => (x, y) => {
        if (x.$ !== y.$) {
          return false;
        }
        switch (x.$) {
          case "A":
            return Eq_Main$Int(x.a0, y.a0);
          case "B":
            return Eq_a(x.a0, y.a0) && Eq_Main$Int(x.a1, y.a1);
          case "C":
            return true;
        }
      }"
    `);
  });

  test("parametric arg", () => {
    const out = compileSrc(
      `
      type X<a> { X(a) }

      type Y<b> {
        Y(X<b>),
      }
    `,
      {
        allowDeriving: ["Eq"],
      },
    );

    expect(out).toMatchInlineSnapshot(`
      "function Main$X(a0) {
        return { $: "X", a0 };
      }
      const Eq_Main$X = (Eq_a) => (x, y) => {
        return Eq_a(x.a0, y.a0);
      }
      function Main$Y(a0) {
        return { $: "Y", a0 };
      }
      const Eq_Main$Y = (Eq_b) => (x, y) => {
        return Eq_Main$X(Eq_b)(x.a0, y.a0);
      }"
    `);
  });

  test("recursive data structures", () => {
    const out = compileSrc(
      `
      type List<a> {
        None,
        Cons(a, List<a>),
      }
    `,
      {
        allowDeriving: ["Eq"],
      },
    );

    expect(out).toMatchInlineSnapshot(`
      "const Main$None = { $: "None" };

      function Main$Cons(a0, a1) {
        return { $: "Cons", a0, a1 };
      }
      const Eq_Main$List = (Eq_a) => (x, y) => {
        if (x.$ !== y.$) {
          return false;
        }
        switch (x.$) {
          case "None":
            return true;
          case "Cons":
            return Eq_a(x.a0, y.a0) && Eq_Main$List(Eq_a)(x.a1, y.a1);
        }
      }"
    `);
  });
});

describe("Derive Show instance", () => {
  test("do not derive underivable types", () => {
    const out = compileSrc(
      `
      extern type DoNotDerive
      type T { X(DoNotDerive) }
    `,
      { allowDeriving: ["Show"] },
    );
    expect(out).toMatchInlineSnapshot(`
      "function Main$X(a0) {
        return { $: "X", a0 };
      }"
    `);
  });

  test("no variants", () => {
    const out = compileSrc(
      `
      type T {  }
    `,
      { allowDeriving: ["Show"] },
    );
    expect(out).toMatchInlineSnapshot(`
      "const Show_Main$T = (x) => {
        return "never";
      }"
    `);
  });

  test("singleton without args", () => {
    const out = compileSrc(
      `
      type T { X }
    `,
      { allowDeriving: ["Show"] },
    );
    expect(out).toMatchInlineSnapshot(`
      "const Main$X = { $: "X" };

      const Show_Main$T = (x) => {
        return "X";
      }"
    `);
  });

  test("single variant, with concrete args", () => {
    const out = compileSrc(
      `
      extern type Int
      type T { X(Int) }
    `,
      {
        allowDeriving: ["Show"],
        traitImpl: [{ moduleName: "Main", typeName: "Int", trait: "Show" }],
      },
    );

    expect(out).toMatchInlineSnapshot(`
      "function Main$X(a0) {
        return { $: "X", a0 };
      }
      const Show_Main$T = (x) => {
        return \`X(\${Show_Main$Int(x.a0)})\`;
      }"
    `);
  });

  test("single variant with var arg", () => {
    const out = compileSrc(
      `
      type T<a, b, c, d> { X(c) }
    `,
      { allowDeriving: ["Show"] },
    );

    expect(out).toMatchInlineSnapshot(`
      "function Main$X(a0) {
        return { $: "X", a0 };
      }
      const Show_Main$T = (Show_c) => (x) => {
        return \`X(\${Show_c(x.a0)})\`;
      }"
    `);
  });

  test("many variants", () => {
    const out = compileSrc(
      `
      extern type Int
      type T<a, b> {
        A,
        B(Int, a),
        C(b),
      }
    `,
      {
        allowDeriving: ["Show"],
        traitImpl: [{ moduleName: "Main", typeName: "Int", trait: "Show" }],
      },
    );

    expect(out).toMatchInlineSnapshot(`
      "const Main$A = { $: "A" };

      function Main$B(a0, a1) {
        return { $: "B", a0, a1 };
      }
      function Main$C(a0) {
        return { $: "C", a0 };
      }
      const Show_Main$T = (Show_a, Show_b) => (x) => {
        switch (x.$) {
          case "A":
            return "A";
          case "B":
            return \`B(\${Show_Main$Int(x.a0)}, \${Show_a(x.a1)})\`;
          case "C":
            return \`C(\${Show_b(x.a0)})\`;
        }
      }"
    `);
  });

  test("parametric arg", () => {
    const out = compileSrc(
      `
      type X<a> { X(a) }

      type Y<b> {
        Y(X<b>),
      }
    `,
      {
        allowDeriving: ["Show"],
      },
    );

    expect(out).toMatchInlineSnapshot(`
      "function Main$X(a0) {
        return { $: "X", a0 };
      }
      const Show_Main$X = (Show_a) => (x) => {
        return \`X(\${Show_a(x.a0)})\`;
      }
      function Main$Y(a0) {
        return { $: "Y", a0 };
      }
      const Show_Main$Y = (Show_b) => (x) => {
        return \`Y(\${Show_Main$X(Show_b)(x.a0)})\`;
      }"
    `);
  });

  test("recursive data structures", () => {
    const out = compileSrc(
      `
      type Lst<a> {
        None,
        Cons(a, Lst<a>),
      }
    `,
      {
        allowDeriving: ["Show"],
      },
    );

    expect(out).toMatchInlineSnapshot(`
      "const Main$None = { $: "None" };

      function Main$Cons(a0, a1) {
        return { $: "Cons", a0, a1 };
      }
      const Show_Main$Lst = (Show_a) => (x) => {
        switch (x.$) {
          case "None":
            return "None";
          case "Cons":
            return \`Cons(\${Show_a(x.a0)}, \${Show_Main$Lst(Show_a)(x.a1)})\`;
        }
      }"
    `);
  });

  test("handle special tuple syntax", () => {
    const out = compileSrc(
      `
      type Tuple2<a, b> {
        Tuple2(a, b),
      }
    `,
      {
        allowDeriving: ["Show"],
        ns: "Tuple",
      },
    );

    expect(out).toMatchInlineSnapshot(`
      "function Tuple$Tuple2(a0, a1) {
        return { $: "Tuple2", a0, a1 };
      }
      const Show_Tuple$Tuple2 = (Show_a, Show_b) => (x) => {
        return \`(\${Show_a(x.a0)}, \${Show_b(x.a1)})\`;
      }"
    `);
  });
});

describe("traits compilation", () => {
  test("non-fn values", () => {
    const out = compileSrc(`
      extern let p: a where a: Show

      type Int {}
      extern let take_int: Fn(Int) -> a

      let x = take_int(p)
    `);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x = Main$take_int(Main$p(Show_Main$Int));
      "
    `);
  });

  test("applying with concrete types", () => {
    const out = compileSrc(
      `
      extern let show: Fn(a) -> String where a: Show
      let x = show("abc")
    `,
      { traitImpl: defaultTraitImpls },
    );
    expect(out).toMatchInlineSnapshot(`
      "const Main$x = Main$show(Show_String$String)("abc");
      "
    `);
  });

  test("unresolved traits", () => {
    const out = compileSrc(`
      extern let p: a  where a: Show
      let x = p //: a1 where a1: Show 
    `);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x = (Show_1) => Main$p(Show_1);
      "
    `);
  });

  test("higher order fn", () => {
    const out = compileSrc(
      `
      extern type String
      let id = fn x { x }
      extern let show: Fn(a) -> String where a: Show
      let f = id(show)(42)
    `,
      { traitImpl: defaultTraitImpls },
    );
    expect(out).toMatchInlineSnapshot(`
      "const Main$id = (x) => {
        return x;
      }

      const Main$f = Main$id(Main$show(Show_Int$Int))(42);
      "
    `);
  });

  test("applying with type variables", () => {
    const out = compileSrc(`
      extern let show: Fn(a) -> String where a: Show
      let f = fn x { show(x) }
    `);
    expect(out).toMatchInlineSnapshot(`
      "const Main$f = (Show_9) => (x) => {
        return Main$show(Show_9)(x);
      }
      "
    `);
  });

  test("do not duplicate vars", () => {
    const out = compileSrc(`
      extern let show2: Fn(a, a) -> String where a: Show
      let f = show2
    `);
    expect(out).toMatchInlineSnapshot(`
      "const Main$f = (Show_5) => Main$show2(Show_5);
      "
    `);
  });

  test("handle multiple traits", () => {
    const out = compileSrc(`
      extern let show: Fn(a, a) -> String where a: Eq + Show
      let f = show
    `);
    expect(out).toMatchInlineSnapshot(`
      "const Main$f = (Eq_5, Show_5) => Main$show(Eq_5, Show_5);
      "
    `);
  });

  test("handle multiple traits when applying to concrete args", () => {
    const out = compileSrc(
      `
      extern let show: Fn(a, a) -> String where a: Eq + Show
      let f = show("a", "b")
    `,
      { traitImpl: defaultTraitImpls },
    );

    expect(out).toMatchInlineSnapshot(`
      "const Main$f = Main$show(Eq_String$String, Show_String$String)("a", "b");
      "
    `);
  });

  test("do not pass extra args", () => {
    const out = compileSrc(
      `
      extern type String
      extern type Bool

      extern let inspect: Fn(a) -> String where a: Show
      extern let (==): Fn(a, a) -> Bool where a: Eq

      let equal = fn x, y {
        if x == y {
          "ok"
        } else {
          inspect(x)
        }
      }
    `,
      { traitImpl: defaultTraitImpls },
    );

    expect(out).toMatchInlineSnapshot(`
      "const Main$equal = (Eq_17, Show_17) => (x, y) => {
        if (Main$_eq(Eq_17)(x, y)) {
          return "ok";
        } else {
          return Main$inspect(Show_17)(x);
        }
      }
      "
    `);
  });

  test("do not duplicate when there's only one var to pass", () => {
    const out = compileSrc(
      `
      extern let show2: Fn(a, a) -> String where a: Show
      let f = fn arg {
        show2(arg, "hello")
      }
    `,
      { traitImpl: defaultTraitImpls },
    );
    expect(out).toMatchInlineSnapshot(`
      "const Main$f = (arg) => {
        return Main$show2(Show_String$String)(arg, "hello");
      }
      "
    `);
  });

  test("pass an arg twice if needed", () => {
    const out = compileSrc(
      `
      extern let show2: Fn(a, b) -> String where a: Show, b: Show
      let f =  show2("a", "b")
    `,
      { traitImpl: defaultTraitImpls },
    );
    expect(out).toMatchInlineSnapshot(`
      "const Main$f = Main$show2(Show_String$String, Show_String$String)("a", "b");
      "
    `);
  });

  test("partial application", () => {
    const out = compileSrc(
      `
      extern let show2: Fn(a, b) -> String where a: Show, b: Show
      let f = fn arg {
        show2(arg, "hello")
      }
    `,
      { traitImpl: defaultTraitImpls },
    );

    expect(out).toMatchInlineSnapshot(`
      "const Main$f = (Show_11) => (arg) => {
        return Main$show2(Show_11, Show_String$String)(arg, "hello");
      }
      "
    `);
  });

  test("pass trait dicts for types with params when they do not have deps", () => {
    const out = compileSrc(`
      extern let show: Fn(a) -> String where a: Show

      type AlwaysShow<a> { X }
      
      let x = show(X)
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$X = { $: "X" };

      const Main$x = Main$show(Show_Main$AlwaysShow)(Main$X);
      "
    `);
  });

  test("pass higher order trait dicts for types with params when they do have deps", () => {
    const out = compileSrc(
      `
      extern let show: Fn(a) -> String where a: Show

      type Option<a, b> { Some(b) }
      
      let x = show(Some(42))
    `,
      { traitImpl: defaultTraitImpls },
    );

    // Some(42) : Option<Int>

    expect(out).toMatchInlineSnapshot(`
      "function Main$Some(a0) {
        return { $: "Some", a0 };
      }
      const Main$x = Main$show(Show_Main$Option(Show_Int$Int))(Main$Some(42));
      "
    `);
  });

  test("deeply nested higher order traits", () => {
    const out = compileSrc(
      `
      extern let show: Fn(a) -> String where a: Show

      type Tuple2<a, b> { Tuple2(a, b) }
      type Option<a> { Some(a) }
      
      let x = show(Tuple2(Some(42), 2))
    `,
      { traitImpl: defaultTraitImpls },
    );

    expect(out).toMatchInlineSnapshot(`
      "function Main$Tuple2(a0, a1) {
        return { $: "Tuple2", a0, a1 };
      }
      function Main$Some(a0) {
        return { $: "Some", a0 };
      }
      const Main$x = Main$show(Show_Main$Tuple2(Show_Main$Option(Show_Int$Int), Show_Int$Int))(Main$Tuple2(Main$Some(42), 2));
      "
    `);
  });

  test("trait deps in args when param aren't traits dependencies", () => {
    const out = compileSrc(`
      type IsShow<a> { X } // IsShow does not depend on 'a' for Show trait
      extern let s: IsShow<a> where a: Show
      let x = s
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$X = { $: "X" };

      const Main$x = (Show_6) => Main$s(Show_6);
      "
    `);
  });

  test("trait deps in args when param aren traits dependencies", () => {
    const out = compileSrc(`
      type Option<a, b, c> { Some(b) } 
      extern let s: Option<a, b, c> where b: Show
      let x = s
    `);

    expect(out).toMatchInlineSnapshot(`
      "function Main$Some(a0) {
        return { $: "Some", a0 };
      }
      const Main$x = (Show_11) => Main$s(Show_11);
      "
    `);
  });

  test("pass higher order trait dicts for types when their deps is in scope", () => {
    const out = compileSrc(`
      extern let show: Fn(a) -> String where a: Show

      type Option<a> {
        Some(a),
        None,
      }
      
      let f = fn x {
        show(Some(x))
      }
    `);

    expect(out).toMatchInlineSnapshot(`
      "function Main$Some(a0) {
        return { $: "Some", a0 };
      }
      const Main$None = { $: "None" };

      const Main$f = (Show_16) => (x) => {
        return Main$show(Show_Main$Option(Show_16))(Main$Some(x));
      }
      "
    `);
  });

  test("== handles traits dicts", () => {
    const out = compileSrc(`
  extern let (==): Fn(a, a) -> Bool where a: Eq
  let f = fn x, y { x == y }
`);

    expect(out).toMatchInlineSnapshot(`
    "const Main$f = (Eq_11) => (x, y) => {
      return Main$_eq(Eq_11)(x, y);
    }
    "
  `);
  });

  // TODO fix
  test.todo("== handles traits dicts on adts", () => {
    const out = compileSrc(
      `
    extern type Int
    extern type Bool
    extern let (==): Fn(a, a) -> Bool where a: Eq
    type T { C(Int) }
    let f = C(0) == C(1)
`,
      { allowDeriving: ["Eq"] },
    );

    expect(out).toMatchInlineSnapshot(`
      "function Main$C(a0) {
        return { $: "C", a0 };
      }
      const Eq_Main$T = (x, y) => {
        return Eq_Main$Int(x.a0, y.a0);
      }
      const Main$f = Main$_eq(Eq_Main$T)(Main$C(0), Main$C(1));
      "
    `);
  });

  test("fn returning arg with traits", () => {
    const out = compileSrc(
      `
      extern type Int
      extern type Json
      extern type Option<a>

      extern let from_json: Fn(Json) -> Option<a> where a: FromJson
      extern let take_opt_int: Fn(Option<Int>) -> Int
      extern let json: Json


      let example = 
        from_json(json)
        |> take_opt_int()
    `,
      {
        traitImpl: [
          {
            typeName: "Int",
            moduleName: "Main",
            trait: "FromJson",
          },
          {
            typeName: "Option",
            moduleName: "Main",
            trait: "FromJson",
            deps: [["FromJson"]],
          },
        ],
      },
    );

    expect(out).toMatchInlineSnapshot(`
      "const Main$example = Main$take_opt_int(Main$from_json(FromJson_Main$Int)(Main$json));
      "
    `);
  });

  test("fn returning arg handles params", () => {
    const out = compileSrc(
      `
      extern type Int
      extern type Json
      extern type Option<a>

      extern let from_json: Fn(Json) -> Option<a> where a: FromJson
      extern let take_opt_int: Fn(Option<Int>) -> x
      extern let json: Json

      let called = from_json(json)
    `,
      {
        traitImpl: [
          { typeName: "Int", moduleName: "Main", trait: "FromJson" },
          {
            typeName: "Option",
            moduleName: "Main",
            trait: "FromJson",
            deps: [["FromJson"]],
          },
        ],
      },
    );

    expect(out).toMatchInlineSnapshot(`
      "const Main$called = (FromJson_9) => Main$from_json(FromJson_9)(Main$json);
      "
    `);
  });
});

describe("pattern matching", () => {
  test("pattern matching (flat)", () => {
    const out = compileSrc(`
  
    type T {
      A,
      B(Int),
    }
  
    let x = match B(42) {
      A => 0,
      B(_) => 1,
    }
  `);
    // TODO whitepace
    expect(out).toMatchInlineSnapshot(`
      "const Main$A = { $: "A" };

      function Main$B(a0) {
        return { $: "B", a0 };
      }
      const Main$x$GEN__0 = Main$B(42);
      let Main$x;
      if (Main$x$GEN__0.$ === "A") {
        Main$x = 0;
      } else if (Main$x$GEN__0.$ === "B") {
        Main$x = 1;
      } else {
        throw new Error("[non exhaustive match]")
      }
      "
    `);
  });

  test("pattern matching (ident)", () => {
    const out = compileSrc(`

  type T {
    C(Int),
  }

  let x = match C(42) {
    C(y) => y,
  }
`);
    // TODO whitepace
    expect(out).toMatchInlineSnapshot(`
      "function Main$C(a0) {
        return { $: "C", a0 };
      }
      const Main$x$GEN__0 = Main$C(42);
      let Main$x;
      if (Main$x$GEN__0.$ === "C") {
        Main$x = Main$x$GEN__0.a0;
      } else {
        throw new Error("[non exhaustive match]")
      }
      "
    `);
  });

  test("pattern matching str literals", () => {
    const out = compileSrc(`
  let x = match "subject" {
    "constraint" => 0,
  }
`);

    expect(out).toMatchInlineSnapshot(`
      "const Main$x$GEN__0 = "subject";
      let Main$x;
      if (Main$x$GEN__0 === "constraint") {
        Main$x = 0;
      } else {
        throw new Error("[non exhaustive match]")
      }
      "
    `);
  });

  test("pattern matching char literals", () => {
    const out = compileSrc(`
  let x = match 'a' {
    'x' => 0,
  }
`);

    expect(out).toMatchInlineSnapshot(`
      "const Main$x$GEN__0 = "a";
      let Main$x;
      if (Main$x$GEN__0.toString() === "x") {
        Main$x = 0;
      } else {
        throw new Error("[non exhaustive match]")
      }
      "
    `);
  });

  test("pattern matching bool values", () => {
    const out = compileSrcWithDeps({
      Basics: `pub(..) type Bool { True, False }`,
      Main: `
    import Basics.{Bool(..)}
    let x = match True {
      True => 0,
      False => 1,
    }
  `,
    });

    expect(out).toMatchInlineSnapshot(`
      "const Main$x$GEN__0 = true;
      let Main$x;
      if (Main$x$GEN__0) {
        Main$x = 0;
      } else if (!Main$x$GEN__0) {
        Main$x = 1;
      } else {
        throw new Error("[non exhaustive match]")
      }
      "
    `);
  });

  test("pattern matching Unit values", () => {
    const out = compileSrcWithDeps({
      Basics: `pub(..) type Unit { Unit }`,
      Main: `
  import Basics.{Unit(..)}
  let x = match Unit {
    Unit => 0,
  }
`,
    });

    expect(out).toMatchInlineSnapshot(`
      "const Main$x$GEN__0 = null;
      let Main$x;
      if (true) {
        Main$x = 0;
      } else {
        throw new Error("[non exhaustive match]")
      }
      "
    `);
  });

  test("toplevel ident in p matching", () => {
    const out = compileSrc(`
  let x = match 42 {
    a => a,
  }
`);
    // TODO whitepace
    expect(out).toMatchInlineSnapshot(`
      "const Main$x$GEN__0 = 42;
      let Main$x;
      if (true) {
        Main$x = Main$x$GEN__0;
      } else {
        throw new Error("[non exhaustive match]")
      }
      "
    `);
  });

  test("pattern matching nested value", () => {
    const out = compileSrcWithDeps({
      Basics: `pub(..) type Bool { True }`,
      Main: `
  import Basics.{Bool(..)}

  type T {
    C(Bool),
  }

  let x = match C(True) {
    C(True) => 0,
  }
`,
    });
    // TODO whitepace
    expect(out).toMatchInlineSnapshot(`
      "function Main$C(a0) {
        return { $: "C", a0 };
      }
      const Main$x$GEN__0 = Main$C(true);
      let Main$x;
      if (Main$x$GEN__0.$ === "C" && Main$x$GEN__0.a0) {
        Main$x = 0;
      } else {
        throw new Error("[non exhaustive match]")
      }
      "
    `);
  });

  test("simple pattern matching in tail position", () => {
    const out = compileSrc(`
    let f = fn {
      match 42 { x => x }
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$f = () => {
        const GEN__0 = 42;
        if (true) {
          return GEN__0;
        } else {
          throw new Error("[non exhaustive match]")
        }
      }
      "
    `);
  });

  test("pattern matching in tail position (match constructor)", () => {
    const out = compileSrc(`
    type Box { Box(Int) }
    extern let (+): Fn(Int, Int) -> Int
    let f = fn {
      match Box(42) {
        Box(x) => x + 1
      }
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "function Main$Box(a0) {
        return { $: "Box", a0 };
      }
      const Main$f = () => {
        const GEN__0 = Main$Box(42);
        if (GEN__0.$ === "Box") {
          return GEN__0.a0 + 1;
        } else {
          throw new Error("[non exhaustive match]")
        }
      }
      "
    `);
  });

  test("pattern matching as fn arg", () => {
    const out = compileSrc(`
    extern let f: Fn(a) -> a
    let x = f(match 42 {
      _ => 0,
    })
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$x$GEN__1 = 42;
      let Main$x$GEN__0;
      if (true) {
        Main$x$GEN__0 = 0;
      } else {
        throw new Error("[non exhaustive match]")
      }
      const Main$x = Main$f(Main$x$GEN__0);
      "
    `);
  });

  test("eval complex match", () => {
    const out = compileSrc(`
      type Option<a> {
        None,
        Some(a),
      }
      
      type Result<a, b> {
        Ok(a),
        Err(b),
      }
      
      type Data {
        A,
        B(Int),
        Z(Option<String>, Result<Option<String>, String>),
      }
      
      let x = Z(
        Some("abc"),
        Ok(Some("def"))
      )
  
      let m = match x {
        Z(Some(s1), Ok(Some(s2))) => s1 ++ s2,
      }
    `);

    const r = new Function(`${out}; return Main$m`)();
    expect(r).toEqual("abcdef");
  });

  test("compiling let match", () => {
    const out = compileSrc(`
    type Box { Box(Int) }

    let f = fn b {
      let Box(a) = b;
      a
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "function Main$Box(a0) {
        return { $: "Box", a0 };
      }
      const Main$f = (b) => {
        const GEN__0 = b;
        return GEN__0.a0;
      }
      "
    `);
  });

  test("compiling nested let match", () => {
    const out = compileSrc(`
    type Pair { Pair(Int, Int) }

    let f = fn b {
      let Pair(_, Pair(a, _)) = b;
      a
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "function Main$Pair(a0, a1) {
        return { $: "Pair", a0, a1 };
      }
      const Main$f = (b) => {
        const GEN__0 = b;
        return GEN__0.a1.a0;
      }
      "
    `);
  });

  test("compiling fn match", () => {
    const out = compileSrc(`
    type Box { Box(Int) }

    let f = fn x, Box(a), y { a }
  `);

    expect(out).toMatchInlineSnapshot(`
      "function Main$Box(a0) {
        return { $: "Box", a0 };
      }
      const Main$f = (x, GEN__0, y) => {
        return GEN__0.a0;
      }
      "
    `);
  });
});

test("two fns as args", () => {
  const out = compileSrc(`
    extern let f: Fn(a) -> a
    let x = f(
      fn { 0 },
      fn { 1 },
    )
`);

  expect(out).toMatchInlineSnapshot(`
    "const Main$x$GEN__0 = () => {
      return 0;
    }
    const Main$x$GEN__1 = () => {
      return 1;
    }
    const Main$x = Main$f(Main$x$GEN__0, Main$x$GEN__1);
    "
  `);
});

describe("TCO", () => {
  test("does not apply inside infix application", () => {
    const out = compileSrc(`
    extern let (+): Fn(Int, Int) -> Int
    let loop = fn {
      1 + loop()
    }
`);

    expect(out).toMatchInlineSnapshot(`
      "const Main$loop = () => {
        return 1 + Main$loop();
      }
      "
    `);
  });

  test("does not apply inside application", () => {
    const out = compileSrc(`
    extern let a: Fn(a) -> a
    let loop = fn {
      a(loop())
    }
`);

    expect(out).toMatchInlineSnapshot(`
      "const Main$loop = () => {
        return Main$a(Main$loop());
      }
      "
    `);
  });

  test("does not apply to let value", () => {
    const out = compileSrc(`
    let f = fn x {
      let a = f(x + 1);
      a
    }
    
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$f = (x) => {
        const a = Main$f(x + 1);
        return a;
      }
      "
    `);
  });

  test("toplevel, no args", () => {
    const out = compileSrc(`
      let loop = fn {
        loop()
      }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$loop = () => {
        while (true) {
        }
      }
      "
    `);
  });

  test("toplevel with args", () => {
    const out = compileSrc(`
      let loop = fn x, y {
        loop(x + 1, y)
      }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$loop = (GEN_TC__0, GEN_TC__1) => {
        while (true) {
          const x = GEN_TC__0;
          const y = GEN_TC__1;
          GEN_TC__0 = x + 1;
          GEN_TC__1 = y;
        }
      }
      "
    `);
  });

  test("toplevel with match args", () => {
    const out = compileSrc(`
      type Box { Box(a) }

      let loop = fn x, Box(y) {
        loop(x + 1, Box(y))
      }
  `);

    expect(out).toMatchInlineSnapshot(`
      "function Main$Box(a0) {
        return { $: "Box", a0 };
      }
      const Main$loop = (GEN_TC__0, GEN_TC__1) => {
        while (true) {
          const x = GEN_TC__0;
          const GEN__0 = GEN_TC__1;
          GEN_TC__0 = x + 1;
          GEN_TC__1 = Main$Box(GEN__0.a0);
        }
      }
      "
    `);
  });

  test("inside if", () => {
    const out = compileSrc(`
      extern let (==): Fn(a, a) -> Bool
      let to_zero = fn x {
        if x == 0 {
          x
        } else {
          to_zero(x - 1)
        }
      }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$to_zero = (GEN_TC__0) => {
        while (true) {
          const x = GEN_TC__0;
          if (x == 0) {
            return x;
          } else {
            GEN_TC__0 = x - 1;
          }
        }
      }
      "
    `);
  });

  test("Example: List.reduce", () => {
    const out = compileSrc(
      `
      pub let reduce = fn lst, acc, f {
        match lst {
          Nil => acc,
          hd :: tl => reduce(lst, f(acc, hd), f),
        }
      }
  `,
      { ns: "List" },
    );

    expect(out).toMatchInlineSnapshot(`
      "const List$reduce = (GEN_TC__0, GEN_TC__1, GEN_TC__2) => {
        while (true) {
          const lst = GEN_TC__0;
          const acc = GEN_TC__1;
          const f = GEN_TC__2;
          const GEN__0 = lst;
          if (GEN__0.$ === "Nil") {
            return acc;
          } else if (GEN__0.$ === "Cons") {
            GEN_TC__0 = lst;
            GEN_TC__1 = f(acc, GEN__0.a0);
            GEN_TC__2 = f;
          } else {
            throw new Error("[non exhaustive match]")
          }
        }
      }
      "
    `);
  });

  test("a tc call should not leak into other expressions", () => {
    const out = compileSrc(`
    let ap = fn f { f(10) }

    pub let f = fn a {
      if a {
        f()
      } else {
        let id = ap(fn x { x });
        0
      }
    }
`);

    expect(out).toMatchInlineSnapshot(`
      "const Main$ap = (f) => {
        return f(10);
      }

      const Main$f = (GEN_TC__0) => {
        while (true) {
          const a = GEN_TC__0;
          if (a) {
          } else {
            const id$GEN__0 = (x) => {
              return x;
            }
            const id = Main$ap(id$GEN__0);
            return 0;
          }
        }
      }
      "
    `);
  });

  test("Namespaced", () => {
    const out = compileSrc(`let f1 = fn { f1() }`, { ns: "Mod" });

    expect(out).toMatchInlineSnapshot(`
      "const Mod$f1 = () => {
        while (true) {
        }
      }
      "
    `);
  });

  test("Local vars shadow tail calls", () => {
    const out = compileSrc(`
      let f1 = fn {
        let f1 = fn { 0 };
        f1()
      }`);

    expect(out).toMatchInlineSnapshot(`
      "const Main$f1 = () => {
        const f1 = () => {
          return 0;
        }
        return f1();
      }
      "
    `);
  });
});

describe("modules", () => {
  test("variables from modules different than Main are namespaced", () => {
    const out = compileSrc(`let a = 42`, { ns: "ExampleModule" });
    expect(out).toMatchInlineSnapshot(`
      "const ExampleModule$a = 42;
      "
    `);
  });

  test("declarations from modules different than Main are resolved correctly", () => {
    const out = compileSrc(`let a = 42\nlet x = a`, { ns: "ExampleModule" });
    expect(out).toMatchInlineSnapshot(
      `
      "const ExampleModule$a = 42;

      const ExampleModule$x = ExampleModule$a;
      "
    `,
    );
  });

  test("extern declarations from modules different than Main are resolved correctly", () => {
    const out = compileSrc(
      `extern type Int
      extern let a: Int
      let x = a`,
      { ns: "ExampleModule" },
    );
    expect(out).toMatchInlineSnapshot(
      `
      "const ExampleModule$x = ExampleModule$a;
      "
    `,
    );
  });

  test("variables are scoped in nested modules", () => {
    const out = compileSrc(`let a = 42`, { ns: "A/B/C" });
    expect(out).toMatchInlineSnapshot(`
      "const A$B$C$a = 42;
      "
    `);
  });

  test("local variables from modules different than Main are namespaced", () => {
    const out = compileSrc(`let a = { let b = 42; b}`, { ns: "ExampleModule" });
    expect(out).toMatchInlineSnapshot(`
      "const ExampleModule$a$b = 42;
      const ExampleModule$a = ExampleModule$a$b;
      "
    `);
  });

  test("variants from modules different than Main are namespaced", () => {
    const out = compileSrc(
      `
      type MyType { C1, C2(Int) }
      let c2_example = C2(42)
    `,
      { ns: "MyModule" },
    );

    expect(out).toMatchInlineSnapshot(`
      "const MyModule$C1 = { $: "C1" };

      function MyModule$C2(a0) {
        return { $: "C2", a0 };
      }
      const MyModule$c2_example = MyModule$C2(42);
      "
    `);
  });

  test("values imported with unqualfied imports are resolved with the right namespace", () => {
    const out = compileSrcWithDeps({
      ExampleModule: `pub let value_name = 42`,
      Main: `
        import ExampleModule.{value_name}
        let a = value_name
      `,
    });
    expect(out).toMatchInlineSnapshot(
      `
      "const Main$a = ExampleModule$value_name;
      "
    `,
    );
  });

  test("values imported with unqualfied imports in nested modules are resolved with the right namespace", () => {
    const out = compileSrcWithDeps({
      "Nested/Mod": `pub let value_name = 42`,
      Main: `
        import Nested/Mod.{value_name}
        let a = value_name
      `,
    });
    expect(out).toMatchInlineSnapshot(
      `
      "const Main$a = Nested$Mod$value_name;
      "
    `,
    );
  });

  test("values imported with ualfied imports in nested modules are resolved with the right namespace", () => {
    const out = compileSrcWithDeps({
      "Nested/Mod": `pub let value_name = 42`,
      Main: `
        import Nested/Mod
        let a = Nested/Mod.value_name
      `,
    });
    expect(out).toMatchInlineSnapshot(
      `
      "const Main$a = Nested$Mod$value_name;
      "
    `,
    );
  });

  test("values imported from another module are resolved with the right namespace", () => {
    const out = compileSrcWithDeps({
      ExampleModule: "pub let value_name = 42",
      Main: `
      import ExampleModule
      let a = ExampleModule.value_name
    `,
    });
    expect(out).toMatchInlineSnapshot(
      `
      "const Main$a = ExampleModule$value_name;
      "
    `,
    );
  });

  test("constructors imported with unqualfied imports are resolved with the right namespace", () => {
    const out = compileSrcWithDeps({
      ExampleModule: `pub(..) type T { Constr }`,
      Main: `
      import ExampleModule.{T(..)}
      let a = Constr
      `,
    });

    expect(out).toMatchInlineSnapshot(`
      "const Main$a = ExampleModule$Constr;
      "
    `);
  });

  test("constructors imported with qualified imports are resolved with the right namespace", () => {
    const out = compileSrcWithDeps({
      ExampleModule: `pub(..) type T { Constr }`,
      Main: `
        import ExampleModule
        let a = ExampleModule.Constr
      `,
    });
    expect(out).toMatchInlineSnapshot(`
      "const Main$a = ExampleModule$Constr;
      "
    `);
  });
});

describe("project compilation", () => {
  test("compile single module with main value", () => {
    const out = compileRawProject({
      Main: `pub let main = "main"`,
    });

    expect(out).toBe(`const Main$main = "main";


Main$main.exec();
`);
  });

  test("handles nested modules as entrypoint", () => {
    const out = compileRawProject(
      {
        "Nested/Entrypoint/Mod": `pub let main = "main"`,
      },
      {
        entrypoint: {
          ...testEntryPoint,
          module: "Nested/Entrypoint/Mod",
        },
      },
    );

    expect(out).toBe(`const Nested$Entrypoint$Mod$main = "main";


Nested$Entrypoint$Mod$main.exec();
`);
  });

  test("compile a module importing another module", () => {
    const out = compileRawProject({
      ModA: `pub let x = "main"`,
      Main: `
          import ModA
          pub let main = ModA.x
        `,
    });

    expect(out).toBe(`const ModA$x = "main";


const Main$main = ModA$x;


Main$main.exec();
`);
  });

  test("if two modules import a module, it has to be compiled only once", () => {
    const out = compileRawProject({
      ModA: `pub let a = "a"`,
      ModB: `import ModA\npub let b = "b"`,
      Main: `
          import ModA
          import ModB
          pub let main = "main"
        `,
    });

    expect(out).toBe(`const ModA$a = "a";


const ModB$b = "b";


const Main$main = "main";


Main$main.exec();
`);
  });

  test("compiling externs", () => {
    const out = compileRawProject(
      {
        Main: `pub let main = "main"`,
      },
      {
        entrypoint: testEntryPoint,
        externs: { Main: "<extern>" },
      },
    );

    expect(out).toBe(`<extern>

const Main$main = "main";


Main$main.exec();
`);
  });

  test("throws when main is missing", () => {
    expect(() =>
      compileRawProject(
        {
          Main: ``,
        },
        { entrypoint: testEntryPoint },
      ),
    ).toThrow();
  });

  test("throws when main is not public", () => {
    expect(() =>
      compileRawProject(
        {
          Main: `
            let main = "main"
            pub let f = main
          `,
        },
        { entrypoint: testEntryPoint },
      ),
    ).toThrow();
  });

  test.todo("error when extern types are not found");
});

type CompileSrcOpts = {
  ns?: string;
  traitImpl?: TraitImpl[];
  allowDeriving?: string[] | undefined;
};

function compileSrc(
  src: string,
  { ns = "Main", traitImpl = [], allowDeriving = [] }: CompileSrcOpts = {},
) {
  const parsed = unsafeParse(src);
  resetTraitsRegistry(traitImpl);
  const [program] = typecheck(ns, parsed, {}, [], testEntryPoint.type);
  const compiler = new Compiler();
  compiler.allowDeriving = allowDeriving;
  const out = compiler.compile(program, ns);
  return out;
}

// Returns Main
function compileSrcWithDeps(rawProject: Record<string, string>): string {
  resetTraitsRegistry();
  const res = typecheckProject(
    parseProject(rawProject),
    [],
    testEntryPoint.type,
  );
  const Main = res.Main!;
  const compiler = new Compiler();
  compiler.allowDeriving = [];
  return compiler.compile(Main.typedModule, "Main");
}

function parseProject(
  rawProject: Record<string, string>,
): Record<string, { package: string; module: UntypedModule }> {
  return Object.fromEntries(
    Object.entries(rawProject).map(([ns, src]) => [
      ns,
      {
        package: "example_package",
        module: unsafeParse(src),
      },
    ]),
  );
}

const testEntryPoint: NonNullable<CompileOptions["entrypoint"]> = {
  module: "Main",
  type: {
    type: "named",
    name: "String",
    moduleName: "String",
    args: [],
  },
};

function compileRawProject(
  rawProject: Record<string, string>,
  options: CompileOptions = { entrypoint: testEntryPoint },
): string {
  resetTraitsRegistry();
  const untypedProject = parseProject(rawProject);
  const typecheckResult = typecheckProject(
    untypedProject,
    [],
    testEntryPoint.type,
  );

  const typedProject: Record<string, TypedModule> = {};
  for (const [ns, { typedModule, errors }] of Object.entries(typecheckResult)) {
    if (errors.filter((e) => e.description.severity === "error").length !== 0) {
      throw new Error(
        "Got errors while type checking: \n" + JSON.stringify(errors, null, 2),
      );
    }

    typedProject[ns] = typedModule;
  }

  return compileProject(typedProject, options);
}
