import { test, expect, describe } from "vitest";
import { unsafeParse } from "../parser";
import { Deps, resetTraitsRegistry, typecheck } from "../typecheck";
import { compile } from "./compiler-babel";
import { TraitImpl } from "../typecheck/defaultImports";

describe("datatype representation", () => {
  test("int", () => {
    const out = compileSrc(`pub let x = 42`);
    expect(out).toMatchInlineSnapshot(`"const Main$x = 42;"`);
  });

  test("float", () => {
    const out = compileSrc(`pub let x = 42.42`);
    expect(out).toMatchInlineSnapshot(`"const Main$x = 42.42;"`);
  });

  test("string", () => {
    const out = compileSrc(`pub let x = "abc"`);
    expect(out).toMatchInlineSnapshot(`"const Main$x = "abc";"`);
  });

  test("string constants with newlines", () => {
    const out = compileSrc(`pub let x = "ab\nc"`);
    expect(out).toMatchInlineSnapshot(`"const Main$x = "ab\\nc";"`);
  });

  test("char", () => {
    const out = compileSrc(`pub let x = 'a'`);
    expect(out).toMatchInlineSnapshot(`"const Main$x = "a";"`);
  });

  test("represent Bool with booleans", () => {
    const boolModule = typecheckSource(
      "Bool",
      `pub(..) type Bool { True, False }`,
    );

    const out = compileSrc(
      `
      import Bool.{Bool(..)}
      let t = True
      let f = False
    `,
      {
        deps: { Bool: boolModule },
      },
    );
    expect(out).toMatchInlineSnapshot(`
      "const Main$t = true;
      const Main$f = false;"
    `);
  });

  // TODO probably not necessary
  test.todo("represent Unit as null");
});

describe("intrinsics", () => {
  test("compile + of ints", () => {
    const out = compileSrc(`pub let x = 1 + 2`);
    expect(out).toMatchInlineSnapshot(`"const Main$x = 1 + 2;"`);
  });

  test("compile * of ints", () => {
    const out = compileSrc(`pub let x = 1 * 2`);
    expect(out).toMatchInlineSnapshot(`"const Main$x = 1 * 2;"`);
  });

  test("strings concat", () => {
    const out = compileSrc(`let x = "a" ++ "b"`);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x = "a" + "b";"
    `);
  });

  test("boolean negation", () => {
    const out = compileSrc(`let x = fn b { !b }`);

    expect(out).toMatchInlineSnapshot(`"const Main$x = b => !b;"`);
  });

  test("infix &&", () => {
    const out = compileSrc(`let x = fn a, b { a && b }`);

    expect(out).toMatchInlineSnapshot(`"const Main$x = (a, b) => a && b;"`);
  });

  test("infix ||", () => {
    const out = compileSrc(`let x = fn a, b { a || b }`);

    expect(out).toMatchInlineSnapshot(`"const Main$x = (a, b) => a || b;"`);
  });

  test("boolean negation and && prec", () => {
    const out = compileSrc(`let x = fn t, f { !(t && f)}`);

    expect(out).toMatchInlineSnapshot(`
      "const Main$x = (t, f) => !(t && f);"
    `);
  });

  test("compile == of ints", () => {
    const out = compileSrc(`pub let x = 1 == 2`);
    expect(out).toMatchInlineSnapshot(`"const Main$x = 1 === 2;"`);
  });

  test("precedence between * and +", () => {
    const out = compileSrc(`pub let x = (1 + 2) * 3`);
    expect(out).toMatchInlineSnapshot(`"const Main$x = (1 + 2) * 3;"`);
  });

  test("precedence between * and + (2)", () => {
    const out = compileSrc(`pub let x = 1 + 2 * 3`);
    expect(out).toMatchInlineSnapshot(`"const Main$x = 1 + 2 * 3;"`);
  });

  test("math expr should have same semantics as js", () => {
    const expr = "2 * 3 + 4";
    const compiled = compileSrc(`pub let x = ${expr}`);

    const evaluated = new Function(`${compiled}; return Main$x`);
    expect(evaluated()).toEqual(2 * 3 + 4);
  });
});

test("nested namespaces", () => {
  const out = compileSrc(`pub let x = 42`, { ns: "Json/Encode" });
  expect(out).toMatchInlineSnapshot(`"const Json$Encode$x = 42;"`);
});

test("refer to previously defined idents", () => {
  const out = compileSrc(`
      let x = 0
      let y = x
    `);
  expect(out).toMatchInlineSnapshot(`
      "const Main$x = 0;
      const Main$y = Main$x;"
    `);
});

test("function calls with no args", () => {
  const out = compileSrc(`
      extern let f: Fn() -> a
      let y = f()
    `);
  expect(out).toMatchInlineSnapshot(`"const Main$y = Main$f();"`);
});

test("function calls with args", () => {
  const out = compileSrc(`
      extern let f: Fn(a, a) -> a
      let y = f(1, 2)
    `);

  expect(out).toMatchInlineSnapshot(`"const Main$y = Main$f(1, 2);"`);
});

describe("let expressions", () => {
  test("let expressions", () => {
    const out = compileSrc(`
      let x = {
          let local = 0;
          local + 1
      }
      `);

    expect(out).toMatchInlineSnapshot(`
          "const Main$x$local = 0;
          const Main$x = Main$x$local + 1;"
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
        const Main$x = Main$x$local1 + Main$x$local2;"
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
        const Main$x = Main$x$local + 2;"
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
          const Main$x = Main$x$a$1;"
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
      const Main$x = Main$f(Main$x$a, Main$x$a$1);"
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
    };"
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
    const Main$a = Main$f(Main$a$x);"
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
      "const Main$x$f = () => 0;
      const Main$x = Main$x$f();"
    `);
  });

  test("infix exprs producing statements", () => {
    const out = compileSrc(`
    let a = { let x = 0; x } + { let x = 1; x }
  `);

    expect(out).toMatchInlineSnapshot(`
    "const Main$a$x = 0;
    const Main$a$x$1 = 1;
    const Main$a = Main$a$x + Main$a$x$1;"
  `);
  });
});

describe("lambda expressions", () => {
  test("toplevel fn without params", () => {
    const out = compileSrc(`
    let f = fn { 42 }
  `);

    expect(out).toMatchInlineSnapshot(`"const Main$f = () => 42;"`);
  });

  test("toplevel fn with params", () => {
    const out = compileSrc(`
    let f = fn x, y { y }
  `);

    expect(out).toMatchInlineSnapshot(`"const Main$f = (x, y) => y;"`);
  });

  test("shadowing fn params", () => {
    const out = compileSrc(`
      let f = fn a, a { a }
    `);

    expect(out).toMatchInlineSnapshot(`"const Main$f = (a, a$1) => a$1;"`);
  });

  test("higher order fn", () => {
    const out = compileSrc(`
    let f = fn x { fn x { x } }
  `);

    expect(out).toMatchInlineSnapshot(`"const Main$f = x => x => x;"`);
  });

  test("fn as expr", () => {
    const out = compileSrc(`
    extern let f: Fn(a) -> a
    let x = f(fn {
      1
    })
`);

    expect(out).toMatchInlineSnapshot(`"const Main$x = Main$f(() => 1);"`);
  });

  test("iifs", () => {
    // TODO should I fix grammar?
    const out = compileSrc(`
      let a = fn { 42 } ()
    `);

    expect(out).toMatchInlineSnapshot(`"const Main$a = (() => 42)();"`);
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
      const Main$a = () => Main$a$captured;"
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

    expect(out).toMatchInlineSnapshot(`"const Main$a = () => () => 100;"`);
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
      "const Main$f$x = () => () => Main$f$x();
      const Main$f = 0;"
    `,
    );
  });

  test("two fns as args", () => {
    const out = compileSrc(`
      extern let f: Fn(a) -> a
      let x = f(
        fn { 0 },
        fn { 1 },
      )
  `);

    expect(out).toMatchInlineSnapshot(
      `"const Main$x = Main$f(() => 0, () => 1);"`,
    );
  });
});

describe("if expressions", () => {
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
    "let Main$x$GEN__0;
    if (0) {
      Main$x$GEN__0 = 1;
    } else {
      Main$x$GEN__0 = 2;
    }
    const Main$x = Main$x$GEN__0;"
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
      "let Main$f$GEN__0;
      if (0) {
        Main$f$GEN__0 = () => 1;
      } else {
        Main$f$GEN__0 = 2;
      }
      const Main$f = Main$f$GEN__0;"
    `);
  });

  test.todo("tail position if");

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
    "const Main$is_zero = n => {
      let GEN__0;
      if (n === 0) {
        GEN__0 = "zero";
      } else {
        let GEN__1;
        if (n === 1) {
          GEN__1 = "one";
        } else {
          GEN__1 = "other";
        }
        GEN__0 = GEN__1;
      }
      return GEN__0;
    };"
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
    let Main$x$GEN__0;
    if (Main$x$a === 1) {
      Main$x$GEN__0 = "a";
    } else {
      Main$x$GEN__0 = "b";
    }
    const Main$x = Main$x$GEN__0;"
  `);
  });

  test("let expr inside if branch", () => {
    const out = compileSrc(`
    let x = if 0 {
      let y = 100;  
      y + 1
    } else {
      "else"
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "let Main$x$GEN__0;
      if (0) {
        const Main$x$y = 100;
        Main$x$GEN__0 = Main$x$y + 1;
      } else {
        Main$x$GEN__0 = "else";
      }
      const Main$x = Main$x$GEN__0;"
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
    if (0 === 1) {
      Main$x$GEN__0 = "a";
    } else {
      Main$x$GEN__0 = "b";
    }
    const Main$x = Main$f(Main$x$GEN__0);"
  `);
  });
});

describe("list literal", () => {
  test("compile empty list", () => {
    const out = compileSrc(`let x = []`);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x = List$Nil;"
    `);
  });

  test("compile singleton list", () => {
    const out = compileSrc(`let x = [42]`);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x = List$Cons(42, List$Nil);"
    `);
  });

  test("compile list with many elements", () => {
    const out = compileSrc(`let x = [0, 1, 2]`);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x = List$Cons(0, List$Cons(1, List$Cons(2, List$Nil)));"
    `);
  });

  test("compile list that wraps statements", () => {
    const out = compileSrc(`let x = [{ let loc = 42; loc }]`);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x$loc = 42;
      const Main$x = List$Cons(Main$x$loc, List$Nil);"
    `);
  });
});

describe("ADTs", () => {
  test("create ADTs with zero args", () => {
    const out = compileSrc(`type T { X, Y }`);

    expect(out).toMatchInlineSnapshot(`
      "const Main$X = {
        $: 0
      };
      const Main$Y = {
        $: 1
      };"
    `);
  });

  test.todo("unbox newtype repr");

  test("allow custom types with one arg", () => {
    const out = compileSrc(`type T { X(Int), Y(Bool) }`);

    expect(out).toMatchInlineSnapshot(`
      "const Main$X = _0 => ({
        $: 0,
        _0
      });
      const Main$Y = _0 => ({
        $: 1,
        _0
      });"
    `);
  });

  test("allow custom types with two args", () => {
    const out = compileSrc(`type T { X(Int, Int) }`);

    expect(out).toMatchInlineSnapshot(`
      "const Main$X = (_0, _1) => ({
        $: 0,
        _0,
        _1
      });"
    `);
  });

  // TODO inline constructor call?
  test("allow custom types with zero args", () => {
    const mod = typecheckSource("Mod", "pub(..) type MyType { Variant(Int) }");
    const out = compileSrc(
      `
      import Mod.{MyType(..)}
  
      let x = Variant(42)
    `,
      { deps: { Mod: mod } },
    );

    expect(out).toMatchInlineSnapshot(`
      "const Main$x = Mod$Variant(42);"
    `);
  });
});

describe("Eq trait", () => {
  test.todo("== performs structural equality when type is unbound");
  test.todo("== performs structural equality when type is adt");
  test.todo("== doesn't perform structural equality when type is int");
  test.todo("== doesn't perform structural equality when type is string");
  test.todo("== doesn't perform structural equality when type is float");
});

describe("modules", () => {
  test("variables from modules different than Main are namespaced", () => {
    const out = compileSrc(`let a = 42`, { ns: "ExampleModule" });
    expect(out).toMatchInlineSnapshot(`
      "const ExampleModule$a = 42;"
    `);
  });

  test("declarations from modules different than Main are resolved correctly", () => {
    const out = compileSrc(`let a = 42\nlet x = a`, { ns: "ExampleModule" });
    expect(out).toMatchInlineSnapshot(
      `
      "const ExampleModule$a = 42;
      const ExampleModule$x = ExampleModule$a;"
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
      "const ExampleModule$x = ExampleModule$a;"
    `,
    );
  });

  test("variables are scoped in nested modules", () => {
    const out = compileSrc(`let a = 42`, { ns: "A/B/C" });
    expect(out).toMatchInlineSnapshot(`
      "const A$B$C$a = 42;"
    `);
  });

  test("local variables from modules different than Main are namespaced", () => {
    const out = compileSrc(`let a = { let b = 42; b}`, {
      ns: "ExampleModule",
    });
    expect(out).toMatchInlineSnapshot(`
      "const ExampleModule$a$b = 42;
      const ExampleModule$a = ExampleModule$a$b;"
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
      "const MyModule$C1 = {
        $: 0
      };
      const MyModule$C2 = _0 => ({
        $: 1,
        _0
      });
      const MyModule$c2_example = MyModule$C2(42);"
    `);
  });

  test("values imported with unqualfied imports are resolved with the right namespace", () => {
    const mod = typecheckSource("ExampleModule", `pub let value_name = 42`);

    const out = compileSrc(
      `
        import ExampleModule.{value_name}
        let a = value_name
      `,
      { deps: { ExampleModule: mod } },
    );

    expect(out).toMatchInlineSnapshot(
      `
      "const Main$a = ExampleModule$value_name;"
    `,
    );
  });

  test("values imported with unqualfied imports in nested modules are resolved with the right namespace", () => {
    const mod = typecheckSource("Nested/Mod", `pub let value_name = 42`);

    const out = compileSrc(
      `
          import Nested/Mod.{value_name}
          let a = value_name
        `,
      { deps: { "Nested/Mod": mod } },
    );

    expect(out).toMatchInlineSnapshot(
      `
      "const Main$a = Nested$Mod$value_name;"
    `,
    );
  });

  test("values imported with ualfied imports in nested modules are resolved with the right namespace", () => {
    const mod = typecheckSource("Nested/Mod", `pub let value_name = 42`);
    const out = compileSrc(
      `
        import Nested/Mod
        let a = Nested/Mod.value_name
      `,
      { deps: { "Nested/Mod": mod } },
    );

    expect(out).toMatchInlineSnapshot(
      `
      "const Main$a = Nested$Mod$value_name;"
    `,
    );
  });

  test("values imported from another module are resolved with the right namespace", () => {
    const mod = typecheckSource("ExampleModule", `pub let value_name = 42`);
    const out = compileSrc(
      `
      import ExampleModule
      let a = ExampleModule.value_name
    `,
      { deps: { ExampleModule: mod } },
    );

    expect(out).toMatchInlineSnapshot(
      `
      "const Main$a = ExampleModule$value_name;"
    `,
    );
  });

  test("constructors imported with unqualfied imports are resolved with the right namespace", () => {
    const mod = typecheckSource("ExampleModule", `pub(..) type T { Constr }`);
    const out = compileSrc(
      `
      import ExampleModule.{T(..)}
      let a = Constr
      `,
      { deps: { ExampleModule: mod } },
    );

    expect(out).toMatchInlineSnapshot(`
      "const Main$a = ExampleModule$Constr;"
    `);
  });

  test("constructors imported with qualified imports are resolved with the right namespace", () => {
    const mod = typecheckSource("ExampleModule", `pub(..) type T { Constr }`);
    const out = compileSrc(
      `
        import ExampleModule
        let a = ExampleModule.Constr
      `,
      { deps: { ExampleModule: mod } },
    );

    expect(out).toMatchInlineSnapshot(`
      "const Main$a = ExampleModule$Constr;"
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

    expect(out).toMatchInlineSnapshot(`
      "const Main$A = {
        $: 0
      };
      const Main$B = _0 => ({
        $: 1,
        _0
      });
      const Main$x$GEN__0 = Main$B(42);
      let Main$x$GEN__1;
      if (Main$x$GEN__0.$ === 0) {
        Main$x$GEN__1 = 0;
      } else if (Main$x$GEN__0.$ === 1) {
        Main$x$GEN__1 = 1;
      } else {
        throw new Error("[non exhaustive match]");
      }
      const Main$x = Main$x$GEN__1;"
    `);
  });

  test("pattern matching an identifier", () => {
    const out = compileSrc(`
    let v = 42
    let x = match v {
      1 => 0,
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$v = 42;
      let Main$x$GEN__0;
      if (Main$v === 1) {
        Main$x$GEN__0 = 0;
      } else {
        throw new Error("[non exhaustive match]");
      }
      const Main$x = Main$x$GEN__0;"
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
      "const Main$C = _0 => ({
        $: 0,
        _0
      });
      const Main$x$GEN__0 = Main$C(42);
      let Main$x$GEN__1;
      if (Main$x$GEN__0.$ === 0) {
        Main$x$GEN__1 = Main$x$GEN__0._0;
      } else {
        throw new Error("[non exhaustive match]");
      }
      const Main$x = Main$x$GEN__1;"
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
      let Main$x$GEN__1;
      if (Main$x$GEN__0 === "constraint") {
        Main$x$GEN__1 = 0;
      } else {
        throw new Error("[non exhaustive match]");
      }
      const Main$x = Main$x$GEN__1;"
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
      let Main$x$GEN__1;
      if (Main$x$GEN__0 === "x") {
        Main$x$GEN__1 = 0;
      } else {
        throw new Error("[non exhaustive match]");
      }
      const Main$x = Main$x$GEN__1;"
    `);
  });

  test("pattern matching bool values", () => {
    const Bool = typecheckSource("Bool", `pub(..) type Bool { True, False }`);
    const out = compileSrc(
      `
    import Bool.{Bool(..)}
    let x = match True {
      True => 0,
      False => 1,
    }
  `,
      { deps: { Bool } },
    );

    expect(out).toMatchInlineSnapshot(`
      "const Main$x$GEN__0 = true;
      let Main$x$GEN__1;
      if (Main$x$GEN__0) {
        Main$x$GEN__1 = 0;
      } else if (!Main$x$GEN__0) {
        Main$x$GEN__1 = 1;
      } else {
        throw new Error("[non exhaustive match]");
      }
      const Main$x = Main$x$GEN__1;"
    `);
  });

  test.todo("pattern matching Unit values");

  // TODO better output
  test("toplevel ident in p matching", () => {
    const out = compileSrc(`
  let x = match 42 {
    a => a,
  }
`);
    // TODO whitepace
    expect(out).toMatchInlineSnapshot(`
      "const Main$x$GEN__0 = 42;
      let Main$x$GEN__1;
      if (true) {
        Main$x$GEN__1 = Main$x$GEN__0;
      } else {
        throw new Error("[non exhaustive match]");
      }
      const Main$x = Main$x$GEN__1;"
    `);
  });

  test("pattern matching nested value", () => {
    const Bool = typecheckSource("Bool", `pub(..) type Bool { True, False }`);
    const out = compileSrc(
      `
  import Bool.{Bool(..)}

  type T {
    C(Bool),
  }

  let x = match C(True) {
    C(True) => 0,
  }
`,
      { deps: { Bool } },
    );

    // TODO whitepace
    expect(out).toMatchInlineSnapshot(`
      "const Main$C = _0 => ({
        $: 0,
        _0
      });
      const Main$x$GEN__0 = Main$C(true);
      let Main$x$GEN__1;
      if (Main$x$GEN__0.$ === 0 && Main$x$GEN__0._0) {
        Main$x$GEN__1 = 0;
      } else {
        throw new Error("[non exhaustive match]");
      }
      const Main$x = Main$x$GEN__1;"
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
        let GEN__1;
        if (true) {
          GEN__1 = GEN__0;
        } else {
          throw new Error("[non exhaustive match]");
        }
        return GEN__1;
      };"
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
      "const Main$Box = _0 => ({
        $: 0,
        _0
      });
      const Main$f = () => {
        const GEN__0 = Main$Box(42);
        let GEN__1;
        if (GEN__0.$ === 0) {
          GEN__1 = GEN__0._0 + 1;
        } else {
          throw new Error("[non exhaustive match]");
        }
        return GEN__1;
      };"
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
      "const Main$x$GEN__0 = 42;
      let Main$x$GEN__1;
      if (true) {
        Main$x$GEN__1 = 0;
      } else {
        throw new Error("[non exhaustive match]");
      }
      const Main$x = Main$f(Main$x$GEN__1);"
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

  test.todo("matching ident", () => {
    const out = compileSrc(`
    type Box { Box(Int) }

    let f = fn b {
      match b {
        Box(a) => a
      }
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$Box = _0 => ({
        $: 0,
        _0
      });
      const Main$f = b => {
        let GEN__1;
        if (b.$ === 0) {
          GEN__1 = b._0;
        } else {
          throw new Error("[non exhaustive match]");
        }
        return GEN__1;
      };"
    `);
  });

  test.todo("compiling let match", () => {
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

  test.todo("compiling nested let match", () => {
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

  test.todo("compiling fn match", () => {
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

type CompileSrcOpts = {
  ns?: string;
  traitImpl?: TraitImpl[];
  allowDeriving?: string[] | undefined;
  deps?: Deps;
};

function compileSrc(
  src: string,
  { ns = "Main", traitImpl = [], deps = {} }: CompileSrcOpts = {},
) {
  resetTraitsRegistry(traitImpl);
  const program = typecheckSource(ns, src, deps);
  const out = compile(ns, program);
  return out;
}

function typecheckSource(ns: string, src: string, deps: Deps = {}) {
  const parsed = unsafeParse(src);
  const [program] = typecheck(ns, parsed, deps, []);
  return program;
}
