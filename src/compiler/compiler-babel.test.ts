import { test, expect } from "vitest";
import { unsafeParse } from "../parser";
import { Deps, resetTraitsRegistry, typecheck } from "../typecheck";
import { compile } from "./compiler-babel";
import { TraitImpl } from "../typecheck/defaultImports";
import { describe } from "node:test";

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
      "const Main$X = a0 => ({
        $: 0,
        a0
      });
      const Main$Y = a0 => ({
        $: 1,
        a0
      });"
    `);
  });

  test("allow custom types with two args", () => {
    const out = compileSrc(`type T { X(Int, Int) }`);

    expect(out).toMatchInlineSnapshot(`
      "const Main$X = (a0, a1) => ({
        $: 0,
        a0,
        a1
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
