import { test, expect, describe } from "vitest";
import { Compiler, compile } from "./compiler";
import {
  TraitImpl,
  defaultTraitImpls,
} from "../../../typecheck/defaultImports";
import { ProjectLowering, lowerProgram } from "../../lower";
import {
  Deps,
  typecheckSource,
  typecheckSource_ as typecheckSource_,
} from "../../__test__/prelude";
import { CORE_PACKAGE } from "../../../typecheck/core_package";
import { TypedProject } from "../../../typecheck/project";
import { nestedMapGetOrPutDefault } from "../../../common/defaultMap";

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
    expect(out).toMatchInlineSnapshot(`"const Main$x = \`abc\`;"`);
  });

  test("string (escape)", () => {
    const out = compileSrc(`let color_reset_code = "\x1b[39m"`);
    expect(out).toMatchInlineSnapshot(
      `"const Main$color_reset_code = \`\x1B[39m\`;"`,
    );
  });

  test("string constants with newlines", () => {
    const out = compileSrc(`pub let x = "ab\nc"`);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x = \`ab
      c\`;"
    `);
  });

  test("char", () => {
    const out = compileSrc(`pub let x = 'a'`);
    expect(out).toMatchInlineSnapshot(`"const Main$x = \`a\`;"`);
  });

  test("represent Bool with booleans", () => {
    const out = compileSrc(
      `
      let t = True
      let f = False
    `,
    );
    expect(out).toMatchInlineSnapshot(`
      "const Main$t = true;
      const Main$f = false;"
    `);
  });
});

describe("global identifiers", () => {
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

  // this should be handled at the IR lowering level
  test("refer to idents in revers order", () => {
    const out = compileSrc(`
      let y = x
      let x = 0
    `);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x = 0;
      const Main$y = Main$x;"
    `);
  });

  test("nested namespaces", () => {
    const out = compileSrc(
      `
      pub let x = 42
      pub let y = x
    `,
      { ns: "Json/Encode" },
    );
    expect(out).toMatchInlineSnapshot(`
      "const Json$Encode$x = 42;
      const Json$Encode$y = Json$Encode$x;"
    `);
  });
});

describe("function application", () => {
  test("function calls with no args", () => {
    const out = compileSrc(`
      @extern
      @type () -> a
      let f

      let y = f()
    `);

    expect(out).toMatchInlineSnapshot(`"const Main$y = Main$f();"`);
  });

  test("function calls with args", () => {
    const out = compileSrc(`
      @extern
      @type (a, a) -> a
      let f

      let y = f(1, 2)
    `);

    expect(out).toMatchInlineSnapshot(`"const Main$y = Main$f(1, 2);"`);
  });
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
    expect(out).toMatchInlineSnapshot(`"const Main$x = \`a\` + \`b\`;"`);
  });

  test("boolean negation", () => {
    const out = compileSrc(`let x = !True`);

    expect(out).toMatchInlineSnapshot(`"const Main$x = !true;"`);
  });

  test("infix &&", () => {
    const out = compileSrc(`let x = True && False`);

    expect(out).toMatchInlineSnapshot(`"const Main$x = true && false;"`);
  });

  test("infix ||", () => {
    const out = compileSrc(`let x = False || False`);

    expect(out).toMatchInlineSnapshot(`"const Main$x = false || false;"`);
  });

  test("boolean negation and && prec", () => {
    const out = compileSrc(`let x = !(True && False)`);

    expect(out).toMatchInlineSnapshot(`
      "const Main$x = !(true && false);"
    `);
  });

  test("compile %", () => {
    const out = compileSrc(`pub let x = 3 % 2`);
    expect(out).toMatchInlineSnapshot(`"const Main$x = 3 % 2;"`);
  });

  test("compile / (integer division)", () => {
    const out = compileSrc(`pub let x = 3 / 2`);
    expect(out).toMatchInlineSnapshot(`"const Main$x = Math.floor(3 / 2);"`);
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

describe("let expressions", () => {
  test("let expressions (simple)", () => {
    const out = compileSrc(`
      let x = {
          let local = 0;
          local
      }
      `);

    expect(out).toMatchInlineSnapshot(`
          "const Main$x$local = 0;
          const Main$x = Main$x$local;"
      `);
  });

  test("let expressions", () => {
    const out = compileSrc(
      `
      let x = {
          let local = 0;
          local + 1
      }
      `,
    );

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
        "const Main$x$nested = 0;
        const Main$x$local = Main$x$nested + 1;
        const Main$x = Main$x$local + 2;"
      `);
  });

  test("shadowed let exprs", () => {
    const out = compileSrc(`
        let x = {
          let a = 0;
          let mid = a;
          let a = mid + 1;
          a
        }
      `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$x$a = 0;
      const Main$x$a$1 = Main$x$a + 1;
      const Main$x = Main$x$a$1;"
    `);
  });

  test("two let as fn args, shadowing", () => {
    const out = compileSrc(`
      @extern
      @type (a, a) -> a
      let f

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
        const Main$f$x = 0;
        const Main$f$y = 1;
        return Main$f$x;
      };"
    `);
  });

  test("let inside arg of a function", () => {
    const out = compileSrc(`
  @extern
  @type (a) -> a
  let f

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

describe("fn", () => {
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

    expect(out).toMatchInlineSnapshot(
      `"const Main$f = (Main$f$x, Main$f$y) => Main$f$y;"`,
    );
  });

  test("shadowing fn params", () => {
    const out = compileSrc(`
      let f = fn a, a { a }
    `);

    expect(out).toMatchInlineSnapshot(
      `"const Main$f = (Main$f$a, Main$f$a$1) => Main$f$a$1;"`,
    );
  });

  test("higher order fn", () => {
    const out = compileSrc(`
    let f = fn x { fn x { x } }
  `);

    expect(out).toMatchInlineSnapshot(
      `"const Main$f = Main$f$x => Main$f$x$1 => Main$f$x$1;"`,
    );
  });

  test("fn as expr", () => {
    const out = compileSrc(`
    @extern
    @type (a) -> a
    let f

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
      @extern
      @type (a) -> a
      let f

      let x = f(
        fn { 0 },
        fn { 1 },
      )
  `);

    expect(out).toMatchInlineSnapshot(
      `"const Main$x = Main$f(() => 0, () => 1);"`,
    );
  });

  test("do not let GEN values be shadowed", () => {
    const out = compileSrc(`
      enum Box<a> { Box(a) }
      let x = fn Box(a) {
        fn Box(_) {
          a
        }
      }
    `);
    expect(out).toMatchInlineSnapshot(`
      "const Main$Box = _0 => _0;
      const Main$x = Main$x$_IR_GEN => Main$x$_IR_GEN$1 => Main$x$_IR_GEN;"
    `);
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
    "let Main$x;
    if (0) {
      Main$x = 1;
    } else {
      Main$x = 2;
    }"
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
        Main$f = () => 1;
      } else {
        Main$f = 2;
      }"
    `);
  });

  test("if within fn", () => {
    // TODO switch this to if-else syntax
    const out = compileSrc(`
    @extern
    @type (a, a) -> Bool
    let eq

    let is_zero = fn n {
      if eq(n, 0) {
        "zero"
      } else {
        "other"
      }
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$is_zero = Main$is_zero$n => {
        if (Main$eq(Main$is_zero$n, 0)) {
          return \`zero\`;
        } else {
          return \`other\`;
        }
      };"
    `);
  });

  test("nested ifs", () => {
    // TODO switch this to if-else syntax
    const out = compileSrc(`
    @extern
    @type (a, a) -> Bool
    let eq

    let is_zero = fn n {
      if eq(n, 0) {
        "zero"
      } else {
        if eq(n, 1) {
          "one"
        } else {
          "other"
        }
      }
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$is_zero = Main$is_zero$n => {
        if (Main$eq(Main$is_zero$n, 0)) {
          return \`zero\`;
        } else {
          if (Main$eq(Main$is_zero$n, 1)) {
            return \`one\`;
          } else {
            return \`other\`;
          }
        }
      };"
    `);
  });

  test("let expr inside if condition", () => {
    const out = compileSrc(`
    @extern
    @type (a) -> Bool
    let is_zero


    pub let x = if { let a = 42; is_zero(a) } {
        "a"
      } else {
        "b"
      }
  `);

    expect(out).toMatchInlineSnapshot(`
      "let Main$x;
      const Main$x$a = 42;
      if (Main$is_zero(Main$x$a)) {
        Main$x = \`a\`;
      } else {
        Main$x = \`b\`;
      }"
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
      "let Main$x;
      if (0) {
        const Main$x$y = 100;
        Main$x = Main$x$y + 1;
      } else {
        Main$x = \`else\`;
      }"
    `);
  });

  test.skip("eval if", () => {
    const out = compileSrc(`
      @extern
      @type (a, a) -> Bool
      let eq

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
    @extern
    @type (a, a) -> Bool
    let eq

    @extern
    @type (a) -> a
    let f


    let x = f(
      if eq(0, 1) {
        "a" 
      } else {
        "b"
      })
`);

    expect(out).toMatchInlineSnapshot(`
      "let $0;
      if (Main$eq(0, 1)) {
        $0 = \`a\`;
      } else {
        $0 = \`b\`;
      }
      const Main$x = Main$f($0);"
    `);
  });
});

describe("TCO", () => {
  test("does not apply inside infix application", () => {
    const out = compileSrc(`
    let loop = fn {
      1 + loop()
    }
`);

    expect(out).toMatchInlineSnapshot(
      `"const Main$loop = () => 1 + Main$loop();"`,
    );
  });

  test("does not apply inside application", () => {
    const out = compileSrc(`
    @extern
    @type (a) -> a
    let a

    let loop = fn {
      a(loop())
    }
`);

    expect(out).toMatchInlineSnapshot(
      `"const Main$loop = () => Main$a(Main$loop());"`,
    );
  });

  test("does not apply to let value", () => {
    const out = compileSrc(`
    let f = fn x {
      let a = f(x + 1);
      a
    }
    
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$f = Main$f$x => {
        const Main$f$a = Main$f(Main$f$x + 1);
        return Main$f$a;
      };"
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
        while (true) {}
      };"
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
          const Main$loop$x = GEN_TC__0;
          const Main$loop$y = GEN_TC__1;
          GEN_TC__0 = Main$loop$x + 1;
          GEN_TC__1 = Main$loop$y;
        }
      };"
    `);
  });

  test("toplevel with match args", () => {
    const out = compileSrc(`
      enum Box { Box(a) }

      let loop = fn x, Box(y) {
        loop(x + 1, Box(y))
      }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$Box = _0 => _0;
      const Main$loop = (GEN_TC__0, GEN_TC__1) => {
        while (true) {
          const Main$loop$x = GEN_TC__0;
          const Main$loop$_IR_GEN = GEN_TC__1;
          GEN_TC__0 = Main$loop$x + 1;
          GEN_TC__1 = Main$loop$_IR_GEN;
        }
      };"
    `);
  });

  test("inside if", () => {
    const out = compileSrc(`
      @extern
      @type (a, a) -> Bool
      let (==)

      let to_zero = fn x {
        if x == 0 {
          x
        } else {
          to_zero(x - 1)
        }
      }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$to_zero = GEN_TC__0 => {
        while (true) {
          const Main$to_zero$x = GEN_TC__0;
          if (_eq(Main$to_zero$x, 0)) {
            return Main$to_zero$x;
          } else {
            GEN_TC__0 = Main$to_zero$x - 1;
          }
        }
      };"
    `);
  });

  test("in a pattern matching expr", () => {
    const out = compileSrc(
      `
      enum List<a> { Nil, Cons(a, List<a>) }
      pub let to_zero = fn lst {
        match lst {
          Nil => 0,
          [_, ..tl] => to_zero(tl),
        }
      }
  `,
      { ns: "List" },
    );

    expect(out).toMatchInlineSnapshot(`
      "const List$Nil = {
        $: 0
      };
      const List$Cons = (_0, _1) => ({
        $: 1,
        _0,
        _1
      });
      const List$to_zero = GEN_TC__0 => {
        while (true) {
          const List$to_zero$lst = GEN_TC__0;
          if (List$to_zero$lst.$ === 0) {
            return 0;
          } else if (List$to_zero$lst.$ === 1) {
            GEN_TC__0 = List$to_zero$lst._1;
          } else {
            throw new Error("[non exhaustive match]");
          }
        }
      };"
    `);
  });

  test("Example: List.reduce", () => {
    const out = compileSrc(
      `
      enum List<a> { Nil, Cons(a, List<a>) }
      pub let reduce = fn lst, acc, f {
        match lst {
          Nil => acc,
          [hd, ..tl] => reduce(lst, f(acc, hd), f),
        }
      }
  `,
      { ns: "List" },
    );

    expect(out).toMatchInlineSnapshot(`
      "const List$Nil = {
        $: 0
      };
      const List$Cons = (_0, _1) => ({
        $: 1,
        _0,
        _1
      });
      const List$reduce = (GEN_TC__0, GEN_TC__1, GEN_TC__2) => {
        while (true) {
          const List$reduce$lst = GEN_TC__0;
          const List$reduce$acc = GEN_TC__1;
          const List$reduce$f = GEN_TC__2;
          if (List$reduce$lst.$ === 0) {
            return List$reduce$acc;
          } else if (List$reduce$lst.$ === 1) {
            GEN_TC__0 = List$reduce$lst;
            GEN_TC__1 = List$reduce$f(List$reduce$acc, List$reduce$lst._0);
            GEN_TC__2 = List$reduce$f;
          } else {
            throw new Error("[non exhaustive match]");
          }
        }
      };"
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
      "const Main$ap = Main$ap$f => Main$ap$f(10);
      const Main$f = GEN_TC__0 => {
        while (true) {
          const Main$f$a = GEN_TC__0;
          if (Main$f$a) {} else {
            const Main$f$id = Main$ap(Main$f$x => Main$f$x);
            return 0;
          }
        }
      };"
    `);
  });

  test("Namespaced", () => {
    const out = compileSrc(`let f1 = fn { f1() }`, { ns: "Mod" });

    expect(out).toMatchInlineSnapshot(`
      "const Mod$f1 = () => {
        while (true) {}
      };"
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
        const Main$f1$f1 = () => 0;
        return Main$f1$f1();
      };"
    `);
  });
});

describe("ADTs", () => {
  test("reference ctor identifier", () => {
    const Dependency = typecheckSource_(
      "pkg",
      "Dependency",
      `
        pub(..) enum Pair<a, b> {
          Pair(a, b),
        }
    `,
    ).moduleInterface;

    const out = compileSrc(
      `
      import Dependency
      pub let ctor = Dependency.Pair
    `,
      { deps: { Dependency } },
    );

    expect(out).toMatchInlineSnapshot(`"const Main$ctor = Dependency$Pair;"`);
  });

  test("do not emit Bool repr", () => {
    const out = compileSrc(
      `
      enum Bool { True, False }
    `,
      { ns: "Bool", package_: CORE_PACKAGE },
    );
    expect(out).toMatchInlineSnapshot(`""`);
  });

  // whenever no variant has any argumuments, you can represent it with numbers
  test("create ADTs with zero args", () => {
    const out = compileSrc(`enum T { X, Y, Z }`);

    expect(out).toMatchInlineSnapshot(`
      "const Main$X = 0;
      const Main$Y = 1;
      const Main$Z = 2;"
    `);
  });

  test("create unboxed ADTs when there is exactly one variant with exactly one arg", () => {
    const out = compileSrc(`
      enum T { X(Int) }
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$X = _0 => _0;"
    `);
  });

  test("create ADTs when at least a variant has one arg", () => {
    const out = compileSrc(`
        enum T { X, Y(Int) }
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$X = {
        $: 0
      };
      const Main$Y = _0 => ({
        $: 1,
        _0
      });"
    `);
  });

  test("allow custom types with one arg", () => {
    const out = compileSrc(`enum T { X(Int), Y(Bool) }`);

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
    const out = compileSrc(`enum T { X(Int, Int) }`);

    expect(out).toMatchInlineSnapshot(`
      "const Main$X = (_0, _1) => ({
        $: 0,
        _0,
        _1
      });"
    `);
  });

  test("inline ctor call with default repr", () => {
    const out = compileSrc(
      `
      enum Pair<a, b> {
        First,
        Pair(a, b),
      }

      pub let ctor = Pair("a", "b")
    `,
    );

    expect(out).toMatchInlineSnapshot(
      `
      "const Main$First = {
        $: 0
      };
      const Main$Pair = (_0, _1) => ({
        $: 1,
        _0,
        _1
      });
      const Main$ctor = {
        $: 1,
        _0: \`a\`,
        _1: \`b\`
      };"
    `,
    );
  });

  test("allow custom types with zero args", () => {
    const out = compileSrc(
      `
       pub(..) enum MyType { Variant(Int) }
  
      let x = Variant(42)
    `,
    );
    expect(out).toMatchInlineSnapshot(`
      "const Main$Variant = _0 => _0;
      const Main$x = 42;"
    `);
  });

  test("enum repr", () => {
    const out = compileSrc(
      `
       pub(..) enum MyType {
          T0,
          T1,
        }
  
      let x = T0
    `,
    );
    expect(out).toMatchInlineSnapshot(`
      "const Main$T0 = 0;
      const Main$T1 = 1;
      const Main$x = Main$T0;"
    `);
  });
});

describe("list literal", () => {
  function compile(src: string) {
    const c = new ProjectCompiler();
    c.compile(
      CORE_PACKAGE,
      "List",
      `
        pub enum List<a> {
          Nil,
          Cons(a, List<a>),
        }
    `,
    );
    return c.compile("pkg", "Main", src);
  }

  test("compile empty list", () => {
    const out = compile(`let x = []`);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x = List$Nil;"
    `);
  });

  test("compile singleton list", () => {
    const out = compile(`let x = [42]`);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x = {
        $: 1,
        _0: 42,
        _1: List$Nil
      };"
    `);
  });

  test("compile list with many elements", () => {
    const out = compile(`let x = [0, 1, 2]`);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x = {
        $: 1,
        _0: 0,
        _1: {
          $: 1,
          _0: 1,
          _1: {
            $: 1,
            _0: 2,
            _1: List$Nil
          }
        }
      };"
    `);
  });

  test("compile list that wraps statements", () => {
    const out = compile(`let x = [{ let loc = 42; loc }]`);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x$loc = 42;
      const Main$x = {
        $: 1,
        _0: Main$x$loc,
        _1: List$Nil
      };"
    `);
  });
});

describe("structs", () => {
  test("struct declaration is a noop", () => {
    const out = compileSrc(`
      struct User {
          name: String
      }
    `);

    expect(out).toMatchInlineSnapshot(`
      ""
    `);
  });

  test("struct declaration", () => {
    const out = compileSrc(`
      struct Point {
          x: Int,
          y: Int,
      }

      pub let user = Point {
        y: 1,
        x: 0,
      } 
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$user = {
        x: 0,
        y: 1
      };"
    `);
  });

  test("empty struct is represented as {}", () => {
    const out = compileSrc(`
      struct Nil { }

      pub let nil = Nil { }
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$nil = {};"
    `);
  });

  test("field access", () => {
    const out = compileSrc(`
      struct Box { x: Int }

      pub let b = Box { x: 42 } 

      pub let x_f = b.x
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$b = {
        x: 42
      };
      const Main$x_f = Main$b.x;"
    `);
  });

  test("field access of struct lit", () => {
    const out = compileSrc(`
      struct Box { x: Int }

      pub let x_f = Box { x: 42 }.x
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$x_f = {
        x: 42
      }.x;"
    `);
  });

  test("struct update", () => {
    const out = compileSrc(`
      struct Point3D {
        x: Int,
        y: Int,
        z: Int,
      }

      @extern
      @type Point3D
      let original

      pub let update_y = Point3D {
        y: 42,
        ..original
      }
      
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$update_y = {
        x: Main$original.x,
        y: 42,
        z: Main$original.z
      };"
    `);
  });

  test("struct update when expr is not ident", () => {
    const out = compileSrc(`
      struct Point3D {
        x: Int,
        y: Int,
        z: Int,
      }

      @extern
      @type () -> Point3D
      let get_original

      pub let update_y = Point3D {
        y: 42,
        ..get_original()
      }
      
    `);

    expect(out).toMatchInlineSnapshot(`
      "const $0 = Main$get_original();
      const Main$update_y = {
        x: $0.x,
        y: 42,
        z: $0.z
      };"
    `);
  });
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
      `
      @extern
      @type Int
      let a

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
    const out = compileSrc(`let a = { let b = 42; b }`, {
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
      enum MyType { C1, C2(Int) }
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
      const MyModule$c2_example = {
        $: 1,
        _0: 42
      };"
    `);
  });

  test("values imported with unqualfied imports are resolved with the right namespace", () => {
    const mod = typecheckSource(
      "pkg",
      "ExampleModule",
      `pub let value_name = 42`,
    );

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
    const mod = typecheckSource("pkg", "Nested/Mod", `pub let value_name = 42`);

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
    const mod = typecheckSource("pkg", "Nested/Mod", `pub let value_name = 42`);
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
    const mod = typecheckSource(
      "pkg",
      "ExampleModule",
      `pub let value_name = 42`,
    );
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
    const mod = typecheckSource(
      "pkg",
      "ExampleModule",
      `pub(..) enum T { Constr }`,
    );
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
    const mod = typecheckSource(
      "pkg",
      "ExampleModule",
      `pub(..) enum T { Constr }`,
    );
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
  test("pattern with exactly one ident", () => {
    const out = compileSrc(`
    let id = fn a { a }
    // let v = {
    //   let a = 0;
    //   id(a)
    // }
    let v = match 0 {
      a => id(a)
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$id = Main$id$a => Main$id$a;
      const Main$v$a = 0;
      const Main$v = Main$id(Main$v$a);"
    `);
  });

  test("pattern matching an enum repr", () => {
    const out = compileSrc(`
    enum T {
      A,
      B,
    }
  
    let x = match B {
      A => "a",
      B => "b",
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$A = 0;
      const Main$B = 1;
      let Main$x;
      if (Main$B === 0) {
        Main$x = \`a\`;
      } else if (Main$B === 1) {
        Main$x = \`b\`;
      } else {
        throw new Error("[non exhaustive match]");
      }"
    `);
  });

  test("pattern matching (flat)", () => {
    const out = compileSrc(`
    enum T {
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
      let Main$x;
      const $0 = {
        $: 1,
        _0: 42
      };
      if ($0.$ === 0) {
        Main$x = 0;
      } else if ($0.$ === 1) {
        Main$x = 1;
      } else {
        throw new Error("[non exhaustive match]");
      }"
    `);
  });

  test("pattern match on unboxed variant", () => {
    const out = compileSrc(`
    enum T {
      A(Int),
    }
  
    let x = match A(42) {
      A(arg) => arg,
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$A = _0 => _0;
      const Main$x$arg = 42;
      const Main$x = Main$x$arg;"
    `);
  });

  // TODO remove this test when exhaustive match is impl
  test("avoid redundant checks", () => {
    const out = compileSrc(`
    let x = match 0 {
      0 => "0",
      _ => "any",
      1 => "1",
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "let Main$x;
      const $0 = 0;
      if ($0 === 0) {
        Main$x = \`0\`;
      } else {
        Main$x = \`any\`;
      }"
    `);
  });

  test("avoid else when last match is exhaustive", () => {
    const out = compileSrc(`
    let x = match 0 {
      0 => "0",
      1 => "1",
      _ => "2",
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "let Main$x;
      const $0 = 0;
      if ($0 === 0) {
        Main$x = \`0\`;
      } else if ($0 === 1) {
        Main$x = \`1\`;
      } else {
        Main$x = \`2\`;
      }"
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
      let Main$x;
      if (Main$v === 1) {
        Main$x = 0;
      } else {
        throw new Error("[non exhaustive match]");
      }"
    `);
  });

  test("pattern matching str literals", () => {
    const out = compileSrc(`
  let x = match "subject" {
    "constraint" => 0,
  }
`);

    expect(out).toMatchInlineSnapshot(`
      "let Main$x;
      const $0 = \`subject\`;
      if ($0 === \`constraint\`) {
        Main$x = 0;
      } else {
        throw new Error("[non exhaustive match]");
      }"
    `);
  });

  test("pattern matching char literals", () => {
    const out = compileSrc(`
  let x = match 'a' {
    'x' => 0,
  }
`);

    expect(out).toMatchInlineSnapshot(`
      "let Main$x;
      const $0 = \`a\`;
      if ($0 === \`x\`) {
        Main$x = 0;
      } else {
        throw new Error("[non exhaustive match]");
      }"
    `);
  });

  test("pattern matching bool values", () => {
    const out = compileSrc(
      `
    let x = match True {
      True => 0,
      False => 1,
    }
  `,
    );

    expect(out).toMatchInlineSnapshot(`
      "let Main$x;
      if (true) {
        Main$x = 0;
      } else {
        Main$x = 1;
      }"
    `);
  });

  test("pattern matching Unit values", () => {
    const out = compileSrc(
      `

    enum Unit { Unit }
    let x = match Unit {
      Unit => 0,
    }
  `,
    );

    expect(out).toMatchInlineSnapshot(`
      "const Main$Unit = 0;
      let Main$x;
      Main$x = 0;"
    `);
  });

  test("toplevel ident in p matching", () => {
    const out = compileSrc(`
  let x = match 42 {
    a => a,
  }
`);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x$a = 42;
      const Main$x = Main$x$a;"
    `);
  });

  test("pattern matching nested value", () => {
    const out = compileSrc(
      `
  enum T {
    C(Bool),
  }

  let x = match C(True) {
    C(True) => 0,
  }
`,
    );

    expect(out).toMatchInlineSnapshot(`
      "const Main$C = _0 => _0;
      let Main$x;
      const $0 = true;
      if ($0) {
        Main$x = 0;
      } else {
        throw new Error("[non exhaustive match]");
      }"
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
        const Main$f$x = 42;
        return Main$f$x;
      };"
    `);
  });

  test("pattern matching in tail position (match constructor)", () => {
    const out = compileSrc(`
    enum Box { Box(Int) }
    
    let f = fn {
      match Box(42) {
        Box(x) => x + 1
      }
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$Box = _0 => _0;
      const Main$f = () => {
        const Main$f$x = 42;
        return Main$f$x + 1;
      };"
    `);
  });

  test("pattern matching as fn arg", () => {
    const out = compileSrc(`
    @extern
    @type (a) -> a
    let f

    let x = f(match 42 {
      _ => 0,
    })
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$x$_ = 42;
      const Main$x = Main$f(0);"
    `);
  });

  test("eval complex match", () => {
    const out = compileSrc(`
      enum Option<a> {
        None,
        Some(a),
      }
      
      enum Result<a, b> {
        Ok(a),
        Err(b),
      }
      
      enum Data {
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

  test("matching ident", () => {
    const out = compileSrc(`
    enum Box { Box(Int) }

    let f = fn b {
      match b {
        Box(a) => a
      }
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$Box = _0 => _0;
      const Main$f = Main$f$b => Main$f$b;"
    `);
  });

  test("compiling let match before desugaring", () => {
    const out = compileSrc(`
    enum Box { Box(Int) }

    let f = fn b {
      match b {
        Box(a) => a,
      }
    }

  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$Box = _0 => _0;
      const Main$f = Main$f$b => Main$f$b;"
    `);
  });

  test("compiling let match", () => {
    const out = compileSrc(`
    enum Box { Box(Int) }

    let f = fn b {
      let Box(a) = b;
      a
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$Box = _0 => _0;
      const Main$f = Main$f$b => Main$f$b;"
    `);
  });

  test("compiling let within let match", () => {
    const out = compileSrc(`
    enum Box { Box(Int) }

    let f = fn b {
      let Box(a) = {
        let c = 42;
        c
      };
      a
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$Box = _0 => _0;
      const Main$f = Main$f$b => {
        const Main$f$c = 42;
        return Main$f$c;
      };"
    `);
  });

  test("compiling nested let match", () => {
    const out = compileSrc(`
    enum Pair { Pair(Int, Int) }

    let f = fn b {
      let Pair(_, Pair(a, _)) = b;
      a
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$Pair = (_0, _1) => ({
        $: 0,
        _0,
        _1
      });
      const Main$f = Main$f$b => Main$f$b._1._0;"
    `);
  });

  test("compiling fn match", () => {
    const out = compileSrc(`
    enum Box { Box(Int) }

    let f = fn x, Box(a), y { a }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$Box = _0 => _0;
      const Main$f = (Main$f$x, Main$f$_IR_GEN, Main$f$y) => Main$f$_IR_GEN;"
    `);
  });

  test("statements inside p match", () => {
    const out = compileSrc(`
    enum Pair<a, b> { Pair(a, b), None }

    let f = fn x {
      match x {
        Pair(l, r) => {
          let a = l + r;
          a + 1
        },
        None => 100
      }
    }
  `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$Pair = (_0, _1) => ({
        $: 0,
        _0,
        _1
      });
      const Main$None = {
        $: 1
      };
      const Main$f = Main$f$x => {
        if (Main$f$x.$ === 0) {
          const Main$f$a = Main$f$x._0 + Main$f$x._1;
          return Main$f$a + 1;
        } else if (Main$f$x.$ === 1) {
          return 100;
        } else {
          throw new Error("[non exhaustive match]");
        }
      };"
    `);
  });
});

describe("traits compilation", () => {
  test("non-fn values", () => {
    const out = compileSrc(`
      @extern
      @type a where a: Show
      let p


      @extern
      @type (Int) -> a
      let take_int


      let x = take_int(p)
    `);
    expect(out).toMatchInlineSnapshot(`
      "const Main$x = Main$take_int(Main$p(Show_Int$Int));"
    `);
  });

  test("applying with concrete types", () => {
    const out = compileSrc(
      `
      @extern
      @type (a) -> String where a: Show
      let show

      let x = show("abc")
    `,
      { traitImpl: defaultTraitImpls },
    );
    expect(out).toMatchInlineSnapshot(
      `"const Main$x = Main$show(Show_String$String)(\`abc\`);"`,
    );
  });

  test("unresolved traits", () => {
    const out = compileSrc(`
      @extern
      @type a where a: Show
      let p

      let x = p //: a1 where a1: Show 
    `);
    expect(out).toMatchInlineSnapshot(
      `"const Main$x = Show_a => Main$p(Show_a);"`,
    );
  });

  test("higher order fn", () => {
    const out = compileSrc(
      `
      let id = fn x { x }

      @extern
      @type (a) -> String where a: Show
      let show

      let f = id(show)(42)
    `,
      { traitImpl: defaultTraitImpls },
    );
    expect(out).toMatchInlineSnapshot(`
      "const Main$id = Main$id$x => Main$id$x;
      const Main$f = Main$id(Main$show(Show_Int$Int))(42);"
    `);
  });

  test("applying with type variables", () => {
    const out = compileSrc(`
      @extern
      @type (a) -> String where a: Show
      let show

      let f = fn x { show(x) }
    `);
    expect(out).toMatchInlineSnapshot(
      `"const Main$f = Show_a => Main$f$x => Main$show(Show_a)(Main$f$x);"`,
    );
  });

  test("do not duplicate vars", () => {
    const out = compileSrc(`
      @extern
      @type (a, a) -> String where a: Show
      let show2

      let f = show2
    `);
    expect(out).toMatchInlineSnapshot(
      `"const Main$f = Show_a => Main$show2(Show_a);"`,
    );
  });

  test("handle multiple traits", () => {
    const out = compileSrc(`
      @extern
      @type (a, a) -> String where a: Eq + Show
      let show

      let f = show
    `);
    expect(out).toMatchInlineSnapshot(
      `"const Main$f = (Eq_a, Show_a) => Main$show(Eq_a, Show_a);"`,
    );
  });

  test("handle multiple traits when applying to concrete args", () => {
    const out = compileSrc(
      `
      @extern
      @type (a, a) -> String where a: Eq + Show
      let show

      let f = show("a", "b")
    `,
      { traitImpl: defaultTraitImpls },
    );

    expect(out).toMatchInlineSnapshot(
      `"const Main$f = Main$show(Eq_String$String, Show_String$String)(\`a\`, \`b\`);"`,
    );
  });

  test("do not pass extra args", () => {
    const out = compileSrc(
      `
      @extern
      @type (a) -> String where a: Show
      let inspect

      @extern
      @type (a, a) -> Bool where a: Eq
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
      "const Main$equal = (Eq_a, Show_a) => (Main$equal$x, Main$equal$y) => {
        if (Main$eq(Eq_a)(Main$equal$x, Main$equal$y)) {
          return \`ok\`;
        } else {
          return Main$inspect(Show_a)(Main$equal$x);
        }
      };"
    `);
  });

  test("do not duplicate when there's only one var to pass", () => {
    const out = compileSrc(
      `
      @extern
      @type (a, a) -> String where a: Show
      let show2

      let f = fn arg {
        show2(arg, "hello")
      }
    `,
      { traitImpl: defaultTraitImpls },
    );
    expect(out).toMatchInlineSnapshot(
      `"const Main$f = Main$f$arg => Main$show2(Show_String$String)(Main$f$arg, \`hello\`);"`,
    );
  });

  test("pass an arg twice if needed", () => {
    const out = compileSrc(
      `
      @extern
      @type (a, b) -> String where a: Show, b: Show
      let show2

      let f = show2("a", "b")
    `,
      { traitImpl: defaultTraitImpls },
    );
    expect(out).toMatchInlineSnapshot(
      `"const Main$f = Main$show2(Show_String$String, Show_String$String)(\`a\`, \`b\`);"`,
    );
  });

  test("partial application", () => {
    const out = compileSrc(
      `
      @extern
      @type (a, b) -> String where a: Show, b: Show
      let show2

      let f = fn arg {
        show2(arg, "hello")
      }
    `,
      { traitImpl: defaultTraitImpls },
    );

    expect(out).toMatchInlineSnapshot(
      `"const Main$f = Show_a => Main$f$arg => Main$show2(Show_a, Show_String$String)(Main$f$arg, \`hello\`);"`,
    );
  });

  test("pass trait dicts for types with params when they do not have deps", () => {
    const out = compileSrc(`
      @extern
      @type (a) -> String where a: Show
      let show


      enum AlwaysShow<a> { X }
      
      let x = show(X)
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$X = 0;
      const Main$x = Main$show(Show_Main$AlwaysShow)(Main$X);"
    `);
  });

  test("pass higher order trait dicts for types with params when they do have deps", () => {
    const out = compileSrc(
      `
      @extern
      @type (a) -> String where a: Show
      let show


      enum Option<a, b> { Some(b) }
      
      let x = show(Some(42))
    `,
      { traitImpl: defaultTraitImpls },
    );

    // Some(42) : Option<Int>
    expect(out).toMatchInlineSnapshot(`
      "const Main$Some = _0 => _0;
      const Main$x = Main$show(Show_Main$Option(Show_Int$Int))(42);"
    `);
  });

  test("deeply nested higher order traits", () => {
    const out = compileSrc(
      `
      @extern
      @type (a) -> String where a: Show
      let show


      enum Tuple2<a, b> { Tuple2(a, b) }
      enum Option<a> { Some(a) }
      
      let x = show(Tuple2(Some(42), 2))
    `,
      { traitImpl: defaultTraitImpls },
    );

    expect(out).toMatchInlineSnapshot(`
      "const Main$Tuple2 = (_0, _1) => ({
        $: 0,
        _0,
        _1
      });
      const Main$Some = _0 => _0;
      const Main$x = Main$show(Show_Main$Tuple2(Show_Main$Option(Show_Int$Int), Show_Int$Int))({
        $: 0,
        _0: 42,
        _1: 2
      });"
    `);
  });

  test("trait deps in args when param aren't traits dependencies", () => {
    const out = compileSrc(`
      enum IsShow<a> { X } // IsShow does not depend on 'a' for Show trait

      @extern
      @type IsShow<a> where a: Show
      let s

      let x = s
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$X = 0;
      const Main$x = Show_a => Main$s(Show_a);"
    `);
  });

  test("trait deps in args when param aren traits dependencies", () => {
    const out = compileSrc(`
      enum Option<a, b, c> { Some(b) } 

      @extern
      @type Option<a, b, c> where b: Show
      let s

      let x = s
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$Some = _0 => _0;
      const Main$x = Show_b => Main$s(Show_b);"
    `);
  });

  test("pass higher order trait dicts for types when their deps is in scope", () => {
    const out = compileSrc(`
      @extern
      @type (a) -> String where a: Show
      let show


      enum Option<a> {
        Some(a),
        None,
      }
      
      let f = fn x {
        show(Some(x))
      }
    `);

    expect(out).toMatchInlineSnapshot(`
      "const Main$Some = _0 => ({
        $: 0,
        _0
      });
      const Main$None = {
        $: 1
      };
      const Main$f = Show_a => Main$f$x => Main$show(Show_Main$Option(Show_a))({
        $: 0,
        _0: Main$f$x
      });"
    `);
  });

  test("== handles traits dicts", () => {
    const out = compileSrc(
      `
  @extern
  @type (a, a) -> Bool where a: Eq
  let (==)

  let f = fn x, y { x == y }
`,
    );

    expect(out).toMatchInlineSnapshot(
      `"const Main$f = Eq_a => (Main$f$x, Main$f$y) => _eq(Eq_a)(Main$f$x, Main$f$y);"`,
    );
  });

  test("== compares primitives directly", () => {
    const out = compileSrc(
      `
  @extern
  @type (a, a) -> Bool where a: Eq
  let (==)

  let a = 1 == 2
  let b = 1.0 == 2.0
  let c = "a" == "ab"
  let d = 'x' == 'y'
`,
      // TODO(test) check why default import isn't working
      { package_: CORE_PACKAGE, ns: "Bool" },
    );

    expect(out).toMatchInlineSnapshot(`
      "const Bool$a = 1 === 2;
      const Bool$b = 1 === 2;
      const Bool$c = \`a\` === \`ab\`;
      const Bool$d = \`x\` === \`y\`;"
    `);
  });

  test.skip("== handles traits dicts on adts", () => {
    const out = compileSrc(
      `
    
    @extern
    @type (a, a) -> Bool where a: Eq
    let (==)


    enum T { C(Int) }
    let f = C(0) == C(1)
`,
      { ns: "Bool", package_: CORE_PACKAGE },
    );

    expect(out).toMatchInlineSnapshot(`
      "const Bool$C = _0 => _0;
      const Eq_Main$T = (x, y) => Eq_Main$Int(x, y);
      const Bool$f = _eq(Eq_Bool$T)(0, 1);"
    `);
  });

  test("fn returning arg with traits", () => {
    const out = compileSrc(
      `
      extern type Num
      extern type Json
      extern type Option<a>

      @extern
      @type (Json) -> Option<a> where a: FromJson
      let from_json

      @extern
      @type (Option<Num>) -> Num
      let take_opt_int

      @extern
      @type Json
      let json



      let example = 
        from_json(json)
        |> take_opt_int()
    `,
      {
        traitImpl: [
          {
            typeName: "Num",
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
      "const Main$example = Main$take_opt_int(Main$from_json(FromJson_Main$Num)(Main$json));"
    `);
  });

  test("fn returning arg handles params", () => {
    const out = compileSrc(
      `
      extern type Num
      extern type Json
      extern type Option<a>

      @extern
      @type (Json) -> Option<a> where a: FromJson
      let from_json

      @extern
      @type (Option<Num>) -> x
      let take_opt_int

      @extern
      @type Json
      let json


      let called = from_json(json)
    `,
      {
        traitImpl: [
          { typeName: "Num", moduleName: "Main", trait: "FromJson" },
          {
            typeName: "Option",
            moduleName: "Main",
            trait: "FromJson",
            deps: [["FromJson"]],
          },
        ],
      },
    );

    expect(out).toMatchInlineSnapshot(
      `"const Main$called = FromJson_a => Main$from_json(FromJson_a)(Main$json);"`,
    );
  });
});

describe("deriving", () => {
  describe("derive Eq instance for Adt", () => {
    test("do not derive underivable types", () => {
      const out = compileSrc(
        `
      extern type DoNotDerive
      enum T { X(DoNotDerive) }
    `,
        { allowDeriving: ["Eq"] },
      );
      expect(out).toMatchInlineSnapshot(`
      "const Main$X = _0 => _0;"
    `);
    });

    test("no variants", () => {
      const out = compileSrc(
        `
      enum T { }
    `,
        { allowDeriving: ["Eq"] },
      );
      expect(out).toMatchInlineSnapshot(`"const Eq_Main$T = (x, y) => true;"`);
    });

    test("singleton without args", () => {
      const out = compileSrc(
        `
      enum T { X }
    `,
        { allowDeriving: ["Eq"] },
      );
      expect(out).toMatchInlineSnapshot(`
      "const Main$X = 0;
      const Eq_Main$T = (x, y) => true;"
    `);
    });

    test("singleton with concrete args", () => {
      const out = compileSrc(
        `
      extern type MyInt
      enum T { X(MyInt, MyInt) }
    `,
        {
          allowDeriving: ["Eq"],
          traitImpl: [{ moduleName: "Main", typeName: "MyInt", trait: "Eq" }],
        },
      );
      expect(out).toMatchInlineSnapshot(`
      "const Main$X = (_0, _1) => ({
        $: 0,
        _0,
        _1
      });
      const Eq_Main$T = (x, y) => Eq_Main$MyInt(x._0, y._0) && Eq_Main$MyInt(x._1, y._1);"
    `);
    });

    test("singleton with newtype repr", () => {
      const out = compileSrc(
        `
      extern type MyInt
      enum T { X(MyInt) }
    `,
        {
          allowDeriving: ["Eq"],
          traitImpl: [{ moduleName: "Main", typeName: "MyInt", trait: "Eq" }],
        },
      );
      expect(out).toMatchInlineSnapshot(`
      "const Main$X = _0 => _0;
      const Eq_Main$T = (x, y) => Eq_Main$MyInt(x, y);"
    `);
    });

    test("singleton with var args", () => {
      const out = compileSrc(
        `
      enum T<a, b, c, d> { X(b) }
    `,
        { allowDeriving: ["Eq"] },
      );
      expect(out).toMatchInlineSnapshot(`
      "const Main$X = _0 => _0;
      const Eq_Main$T = Eq_b => (x, y) => Eq_b(x, y);"
    `);
    });

    test("singleton with concrete args", () => {
      const out = compileSrc(
        `
      extern type IntZ
      extern type BoolZ
      enum T { X(IntZ, BoolZ) }
    `,
        {
          allowDeriving: ["Eq"],
          traitImpl: [
            { moduleName: "Main", typeName: "IntZ", trait: "Eq" },
            { moduleName: "Main", typeName: "BoolZ", trait: "Eq" },
          ],
        },
      );
      expect(out).toMatchInlineSnapshot(`
      "const Main$X = (_0, _1) => ({
        $: 0,
        _0,
        _1
      });
      const Eq_Main$T = (x, y) => Eq_Main$IntZ(x._0, y._0) && Eq_Main$BoolZ(x._1, y._1);"
    `);
    });

    test("compare unboxed when repr is enum", () => {
      const out = compileSrc(
        `
      enum T { X, Y, Z }
    `,
        { allowDeriving: ["Eq"] },
      );
      expect(out).toMatchInlineSnapshot(`
      "const Main$X = 0;
      const Main$Y = 1;
      const Main$Z = 2;
      const Eq_Main$T = (x, y) => x === y;"
    `);
    });

    test("type with many variants", () => {
      const out = compileSrc(
        `
      extern type Num
      extern type Flag
      enum T<a> {
        A(Num),
        B(a, Num),
        C,
      }
    `,
        {
          allowDeriving: ["Eq"],
          traitImpl: [
            { moduleName: "Main", typeName: "Num", trait: "Eq" },
            { moduleName: "Main", typeName: "Flag", trait: "Eq" },
          ],
        },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Main$A = _0 => ({
        $: 0,
        _0
      });
      const Main$B = (_0, _1) => ({
        $: 1,
        _0,
        _1
      });
      const Main$C = {
        $: 2
      };
      const Eq_Main$T = Eq_a => (x, y) => {
        if (x.$ !== y.$) {
          return false;
        }
        switch (x.$) {
          case 0:
            return Eq_Main$Num(x._0, y._0);
          case 1:
            return Eq_a(x._0, y._0) && Eq_Main$Num(x._1, y._1);
          case 2:
            return true;
        }
      };"
    `);
    });

    test("parametric arg", () => {
      const out = compileSrc(
        `
      enum X<a> { X(a) }

      enum Y<b> {
        Y(X<b>),
      }
    `,
        {
          allowDeriving: ["Eq"],
        },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Main$X = _0 => _0;
      const Eq_Main$X = Eq_a => (x, y) => Eq_a(x, y);
      const Main$Y = _0 => _0;
      const Eq_Main$Y = Eq_b => (x, y) => Eq_Main$X(Eq_b)(x, y);"
    `);
    });

    test("recursive data structures", () => {
      const out = compileSrc(
        `
      enum List<a> {
        None,
        Cons(a, List<a>),
      }
    `,
        {
          allowDeriving: ["Eq"],
        },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Main$None = {
        $: 0
      };
      const Main$Cons = (_0, _1) => ({
        $: 1,
        _0,
        _1
      });
      const Eq_Main$List = Eq_a => (x, y) => {
        if (x.$ !== y.$) {
          return false;
        }
        switch (x.$) {
          case 0:
            return true;
          case 1:
            return Eq_a(x._0, y._0) && Eq_Main$List(Eq_a)(x._1, y._1);
        }
      };"
    `);
    });
  });

  describe("derive Eq instance for structs", () => {
    test("do not derive underivable types", () => {
      const out = compileSrc(
        `
      extern type DoNotDerive
      struct Struct { x: DoNotDerive }
    `,
        { allowDeriving: ["Eq"] },
      );
      expect(out).toMatchInlineSnapshot(`""`);
    });

    test("no fields", () => {
      const out = compileSrc(
        `
      struct T { }
    `,
        { allowDeriving: ["Eq"] },
      );
      expect(out).toMatchInlineSnapshot(`
      "const Eq_Main$T = (x, y) => true;"
    `);
    });

    test("single field", () => {
      const out = compileSrc(
        `
      
      struct T { x: Int }
    `,
        {
          allowDeriving: ["Eq"],
          traitImpl: [{ moduleName: "Main", typeName: "Int", trait: "Eq" }],
        },
      );

      expect(out).toMatchInlineSnapshot(
        `"const Eq_Main$T = (x, y) => Eq_Int$Int(x.x, y.x);"`,
      );
    });

    test("single field with var args", () => {
      const out = compileSrc(
        `
      struct T<a, b, c, d> { field: b }
    `,
        { allowDeriving: ["Eq"] },
      );
      expect(out).toMatchInlineSnapshot(`
      "const Eq_Main$T = Eq_b => (x, y) => Eq_b(x.field, y.field);"
    `);
    });

    test("many fields with concrete args", () => {
      const out = compileSrc(
        `
      extern type Num
      extern type Str
      struct T {
        int_field: Num,
        str_field: Str,
      }
    `,
        {
          allowDeriving: ["Eq"],
          traitImpl: [
            { moduleName: "Main", typeName: "Num", trait: "Eq" },
            { moduleName: "Main", typeName: "Str", trait: "Eq" },
          ],
        },
      );
      expect(out).toMatchInlineSnapshot(`
      "const Eq_Main$T = (x, y) => Eq_Main$Num(x.int_field, y.int_field) && Eq_Main$Str(x.str_field, y.str_field);"
    `);
    });

    test("field with parametric arg", () => {
      const out = compileSrc(
        `
      enum X<a> { X(a) }

      struct Y<param> {
        field: X<param>,
      }
    `,
        {
          allowDeriving: ["Eq"],
        },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Main$X = _0 => _0;
      const Eq_Main$X = Eq_a => (x, y) => Eq_a(x, y);
      const Eq_Main$Y = Eq_param => (x, y) => Eq_Main$X(Eq_param)(x.field, y.field);"
    `);
    });

    test("recursive data structures", () => {
      const out = compileSrc(
        `
      struct Struct<a> {
        x: a,
        y: Struct<a>,
      }
    `,
        {
          allowDeriving: ["Eq"],
        },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Eq_Main$Struct = Eq_a => (x, y) => Eq_a(x.x, y.x) && Eq_Main$Struct(Eq_a)(x.y, y.y);"
    `);
    });
  });

  describe("Derive Show instance for Adts", () => {
    test("do not derive underivable types", () => {
      const out = compileSrc(
        `
      extern type DoNotDerive
      enum T { X(DoNotDerive) }
    `,
        { allowDeriving: ["Show"] },
      );
      expect(out).toMatchInlineSnapshot(`
      "const Main$X = _0 => _0;"
    `);
    });

    test("no variants", () => {
      const out = compileSrc(
        `
      enum T {  }
    `,
        { allowDeriving: ["Show"] },
      );
      expect(out).toMatchInlineSnapshot(`"const Show_Main$T = x => "never";"`);
    });

    test("singleton without args", () => {
      const out = compileSrc(
        `
      enum T { X }
    `,
        { allowDeriving: ["Show"] },
      );
      expect(out).toMatchInlineSnapshot(`
      "const Main$X = 0;
      const Show_Main$T = x => "X";"
    `);
    });

    test("single variant, with concrete args", () => {
      const out = compileSrc(
        `
      extern type MyInt
      enum T { X(MyInt, MyInt) }
    `,
        {
          ns: "Main",
          allowDeriving: ["Show"],
          traitImpl: [{ moduleName: "Main", typeName: "MyInt", trait: "Show" }],
        },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Main$X = (_0, _1) => ({
        $: 0,
        _0,
        _1
      });
      const Show_Main$T = x => \`X(\${Show_Main$MyInt(x._0)}, \${Show_Main$MyInt(x._1)})\`;"
    `);
    });

    test("single variant (unboxed repr)", () => {
      const out = compileSrc(
        `
      extern type MyInt
      enum T { X(MyInt) }
    `,
        {
          allowDeriving: ["Show"],
          traitImpl: [{ moduleName: "Main", typeName: "MyInt", trait: "Show" }],
        },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Main$X = _0 => _0;
      const Show_Main$T = x => \`X(\${Show_Main$MyInt(x)})\`;"
    `);
    });

    test("single variant (namespaced)", () => {
      const out = compileSrc(
        `
      extern type MyInt
      enum T { X(MyInt) }
    `,
        {
          allowDeriving: ["Show"],
          traitImpl: [
            {
              moduleName: "Example/Namespace",
              typeName: "MyInt",
              trait: "Show",
            },
          ],
          ns: "Example/Namespace",
        },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Example$Namespace$X = _0 => _0;
      const Show_Example$Namespace$T = x => \`X(\${Show_Example$Namespace$MyInt(x)})\`;"
    `);
    });

    test("single variant with var arg", () => {
      const out = compileSrc(
        `
      enum T<a, b, c, d> { X(c) }
    `,
        { allowDeriving: ["Show"] },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Main$X = _0 => _0;
      const Show_Main$T = Show_c => x => \`X(\${Show_c(x)})\`;"
    `);
    });

    test("many variants", () => {
      const out = compileSrc(
        `
      extern type MyInt
      enum T<a, b> {
        A,
        B(MyInt, a),
        C(b),
      }
    `,
        {
          allowDeriving: ["Show"],
          traitImpl: [{ moduleName: "Main", typeName: "MyInt", trait: "Show" }],
        },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Main$A = {
        $: 0
      };
      const Main$B = (_0, _1) => ({
        $: 1,
        _0,
        _1
      });
      const Main$C = _0 => ({
        $: 2,
        _0
      });
      const Show_Main$T = (Show_a, Show_b) => x => {
        switch (x.$) {
          case 0:
            return "A";
          case 1:
            return \`B(\${Show_Main$MyInt(x._0)}, \${Show_a(x._1)})\`;
          case 2:
            return \`C(\${Show_b(x._0)})\`;
        }
      };"
    `);
    });

    test("parametric arg", () => {
      const out = compileSrc(
        `
      enum X<a> { X(a) }

      enum Y<b> {
        Y(X<b>),
      }
    `,
        {
          allowDeriving: ["Show"],
        },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Main$X = _0 => _0;
      const Show_Main$X = Show_a => x => \`X(\${Show_a(x)})\`;
      const Main$Y = _0 => _0;
      const Show_Main$Y = Show_b => x => \`Y(\${Show_Main$X(Show_b)(x)})\`;"
    `);
    });

    test("recursive data structures", () => {
      const out = compileSrc(
        `
      enum Lst<a> {
        None,
        Cons(a, Lst<a>),
      }
    `,
        {
          allowDeriving: ["Show"],
        },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Main$None = {
        $: 0
      };
      const Main$Cons = (_0, _1) => ({
        $: 1,
        _0,
        _1
      });
      const Show_Main$Lst = Show_a => x => {
        switch (x.$) {
          case 0:
            return "None";
          case 1:
            return \`Cons(\${Show_a(x._0)}, \${Show_Main$Lst(Show_a)(x._1)})\`;
        }
      };"
    `);
    });

    test("handle special tuple syntax", () => {
      const out = compileSrc(
        `
      enum Tuple2<a, b> {
        Tuple2(a, b),
      }
    `,
        {
          allowDeriving: ["Show"],
          ns: "Tuple",
          package_: CORE_PACKAGE,
        },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Tuple$Tuple2 = (_0, _1) => ({
        $: 0,
        _0,
        _1
      });
      const Show_Tuple$Tuple2 = (Show_a, Show_b) => x => \`(\${Show_a(x._0)}, \${Show_b(x._1)})\`;"
    `);
    });
  });

  describe("Derive Show instance for structs", () => {
    test("do not derive underivable types", () => {
      const out = compileSrc(
        `
      extern type DoNotDerive
      struct T { x: DoNotDerive }
    `,
        { allowDeriving: ["Show"] },
      );
      expect(out).toMatchInlineSnapshot(`
      ""
    `);
    });

    test("no fields", () => {
      const out = compileSrc(
        `
      struct T {  }
    `,
        { allowDeriving: ["Show"] },
      );
      expect(out).toMatchInlineSnapshot(`
      "const Show_Main$T = x => \`T { }\`;"
    `);
    });

    test("single field with concrete args", () => {
      const out = compileSrc(
        `
      extern type MyInt
      struct T { field: MyInt }
    `,
        {
          allowDeriving: ["Show"],
          traitImpl: [{ moduleName: "Main", typeName: "MyInt", trait: "Show" }],
        },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Show_Main$T = x => \`T { field: \${Show_Main$MyInt(x.field)} }\`;"
    `);
    });

    test("single field with var arg", () => {
      const out = compileSrc(
        `
      struct T<a, b, c, d> { field: c }
    `,
        { allowDeriving: ["Show"] },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Show_Main$T = Show_c => x => \`T { field: \${Show_c(x.field)} }\`;"
    `);
    });

    test("many fields", () => {
      const out = compileSrc(
        `
      extern type MyInt
      struct T<a, b> {
        field_int: MyInt,
        field_a: a,
        field_b: b,
      }
    `,
        {
          allowDeriving: ["Show"],
          traitImpl: [{ moduleName: "Main", typeName: "MyInt", trait: "Show" }],
        },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Show_Main$T = (Show_a, Show_b) => x => \`T { field_int: \${Show_Main$MyInt(x.field_int)}, field_a: \${Show_a(x.field_a)}, field_b: \${Show_b(x.field_b)} }\`;"
    `);
    });

    test("parametric arg", () => {
      const out = compileSrc(
        `
      enum X<a> { X(a) }

      struct Y<b> {
        field: X<b>,
      }
    `,
        {
          allowDeriving: ["Show"],
        },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Main$X = _0 => _0;
      const Show_Main$X = Show_a => x => \`X(\${Show_a(x)})\`;
      const Show_Main$Y = Show_b => x => \`Y { field: \${Show_Main$X(Show_b)(x.field)} }\`;"
    `);
    });

    test("recursive data structures", () => {
      const out = compileSrc(
        `
      struct Str<a> {
        field: Str<a>,
      }
    `,
        {
          allowDeriving: ["Show"],
        },
      );

      expect(out).toMatchInlineSnapshot(`
      "const Show_Main$Str = Show_a => x => \`Str { field: \${Show_Main$Str(Show_a)(x.field)} }\`;"
    `);
    });
  });
});

type CompileSrcOpts = {
  package_?: string;
  ns?: string;
  traitImpl?: TraitImpl[];
  allowDeriving?: string[] | undefined;
  deps?: Deps;
};

function compileSrc(
  src: string,
  {
    package_ = "pkg",
    ns = "Main",
    traitImpl,
    deps = {},
    allowDeriving = [],
  }: CompileSrcOpts = {},
) {
  const program = typecheckSource_(
    package_,
    ns,
    src,
    deps,
    traitImpl === undefined
      ? defaultTraitImpls
      : [...defaultTraitImpls, ...traitImpl],
  );
  const out = compile(
    lowerProgram(program, new Map(), () => {
      return undefined;
    }),
    {
      allowDeriving,
    },
  );
  return out;
}

class ProjectCompiler {
  private readonly compiler = new Compiler();

  private readonly typedProject: TypedProject = new Map();
  private readonly deps: Deps = {};

  private readonly projectLower = new ProjectLowering(this.typedProject);

  compile(package_: string, moduleId: string, src: string) {
    const program = typecheckSource_(package_, moduleId, src, this.deps);

    // TODO use ProjectChecker instead
    nestedMapGetOrPutDefault(this.typedProject, moduleId).set(package_, [
      program,
      [],
    ]);

    this.deps[moduleId] = program.moduleInterface;
    const ir = this.projectLower.visit(package_, moduleId);
    this.compiler.compile(ir);
    return this.compiler.generate();
  }
}
