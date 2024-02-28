import { describe, expect, test } from "vitest";
import { CompileOptions, Compiler, compileProject } from "./compiler";
import { TypedModule, typecheck, typecheckProject } from "../typecheck";
import { UntypedModule, unsafeParse } from "../parser";

test("compile int constants", () => {
  const out = compileSrc(`pub let x = 42`);
  expect(out).toEqual(`const x = 42;
`);
});

test("compile string constants", () => {
  const out = compileSrc(`pub let x = "abc"`);
  expect(out).toEqual(`const x = "abc";
`);
});

test("compile string constants with newlines", () => {
  const out = compileSrc(`pub let x = "ab\nc"`);
  expect(out).toEqual(`const x = "ab\nc";
`);
});

test("compile + of ints", () => {
  const out = compileSrc(`pub let x = 1 + 2`);
  expect(out).toEqual(`const x = 1 + 2;
`);
});

test("compile * of ints", () => {
  const out = compileSrc(`pub let x = 1 * 2`);
  expect(out).toEqual(`const x = 1 * 2;
`);
});

test("compile == of ints", () => {
  const out = compileSrc(`pub let x = 1 == 2`);
  expect(out).toEqual(`const x = 1 == 2;
`);
});

test("precedence between * and +", () => {
  const out = compileSrc(`pub let x = (1 + 2) * 3`);
  expect(out).toEqual(`const x = (1 + 2) * 3;
`);
});

test("precedence between * and + (2)", () => {
  const out = compileSrc(`pub let x = 1 + 2 * 3`);
  expect(out).toEqual(`const x = 1 + 2 * 3;
`);
});

test("math expr should have same semantics as js", () => {
  const expr = "2 * 3 + 4";
  const compiled = compileSrc(`pub let x = ${expr}`);

  const evaluated = new Function(`${compiled}; return x`);
  expect(evaluated()).toEqual(2 * 3 + 4);
});

test("refer to previously defined idents", () => {
  const out = compileSrc(`
    let x = 0
    let y = x
  `);
  expect(out).toEqual(`const x = 0;

const y = x;
`);
});

test("function calls with no args", () => {
  const out = compileSrc(`
    let f = 0
    let y = f()
  `);
  expect(out).toEqual(`const f = 0;

const y = f();
`);
});

test("function calls with args", () => {
  const out = compileSrc(`
    let f = 0
    let y = f(1, 2)
  `);

  expect(out).toEqual(`const f = 0;

const y = f(1, 2);
`);
});

test("let expressions", () => {
  const out = compileSrc(`
    let x = {
      let local = 0;
      local + 1
    }
  `);

  expect(out).toEqual(`const x$local = 0;
const x = x$local + 1;
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

  expect(out).toEqual(`const x$local1 = 0;
const x$local2 = 1;
const x = x$local1 + x$local2;
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

  expect(out).toEqual(`const x$local$nested = 0;
const x$local = x$local$nested + 1;
const x = x$local + 2;
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

  expect(out).toEqual(`const x$a = 0;
const x$a$1 = x$a;
const x = x$a$1;
`);
});

test("two let as fn args, shadowing", () => {
  const out = compileSrc(`
    let f = 0
    let x = f(
      { let a = 0; a },
      { let a = 1; a },
    )
`);

  expect(out).toEqual(`const f = 0;

const x$a = 0;
const x$a$1 = 1;
const x = f(x$a, x$a$1);
`);
});

test("toplevel fn without params", () => {
  const out = compileSrc(`
  let f = fn { 42 }
`);

  expect(out).toEqual(`function f() {
  return 42;
}
`);
});

test("toplevel fn with params", () => {
  const out = compileSrc(`
  let f = fn x, y { y }
`);

  expect(out).toEqual(`function f(x, y) {
  return y;
}
`);
});

test("== performs structural equality when type is unbound", () => {
  const out = compileSrc(`
  extern let (==): Fn(a, a) -> Bool
  let f = fn x, y { x == y }
`);

  expect(out).toEqual(`function f(x, y) {
  return Basics$_eq(x, y);
}
`);
});

test("== performs structural equality when type is adt", () => {
  const out = compileSrc(`
  type T { C(Int) }
  let f = C(0) == C(1)
`);

  expect(out).toEqual(`function C(a0) {
  return { type: "C", a0 };
}
const f = Basics$_eq(C(0), C(1));
`);
});

test("== doesn't perform structural equality when type is int", () => {
  const out = compileSrc(`
  extern let (==): Fn(a, a) -> Bool
  let f = 2 == 0
`);

  expect(out).toEqual(`const f = 2 == 0;
`);
});

test("== doesn't perform structural equality when type is string", () => {
  const out = compileSrc(`
  extern let (==): Fn(a, a) -> Bool
  let f = "a" == "b"
`);

  expect(out).toEqual(`const f = "a" == "b";
`);
});

test("== doesn't perform structural equality when type is float", () => {
  const out = compileSrc(`
  extern let (==): Fn(a, a) -> Bool
  let f = 1.2 == 3.2
`);

  expect(out).toEqual(`const f = 1.2 == 3.2;
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

  expect(out).toEqual(`let f;
if (0) {
  function f$GEN__0() {
    return 1;
  }
  f = f$GEN__0;
} else {
  f = 2;
}
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

  expect(out).toEqual(`function f() {
  const x = 0;
  const y = 1;
  return x;
}
`);
});

test("let inside arg of a function", () => {
  const out = compileSrc(`
  let f = 0
  let a = f({
    let x = 0;
    x
  })
`);

  expect(out).toEqual(`const f = 0;

const a$x = 0;
const a = f(a$x);
`);
});

test("function with a scoped identified as caller", () => {
  const out = compileSrc(`
  let x = {
    let f = 0;
    f()
  }
`);

  expect(out).toEqual(`const x$f = 0;
const x = x$f();
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

  expect(out).toEqual(`let x;
if (0) {
  x = 1;
} else {
  x = 2;
}
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

  expect(out).toEqual(`function is_zero(n) {
  if (n == 0) {
    return "yes";
  } else {
    return "nope";
  }
}
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

  expect(out).toEqual(`function is_zero(n) {
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

  expect(out).toEqual(`const x$a = 0;
let x;
if (x$a == 1) {
  x = "a";
} else {
  x = "b";
}
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

  const isZero = new Function(`${out}; return is_zero`)();

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

  expect(out).toEqual(`function x$f() {
  return 0;
}
const x = x$f(1);
`);
});

test("fn as expr", () => {
  const out = compileSrc(`
    let f = 0
    let x = f(fn {
      1
    })
`);

  expect(out).toEqual(`const f = 0;

function x$GEN__0() {
  return 1;
}
const x = f(x$GEN__0);
`);
});

test("ifs as expr", () => {
  const out = compileSrc(`
    let f = 0
    let x = f(
      if 0 == 1 {
        "a" 
      } else {
        "b"
      })
`);

  expect(out).toEqual(`const f = 0;

let x$GEN__0;
if (0 == 1) {
  x$GEN__0 = "a";
} else {
  x$GEN__0 = "b";
}
const x = f(x$GEN__0);
`);
});

test("infix exprs producing statements", () => {
  const out = compileSrc(`
    let a = { let x = 0; x } + { let x = 1; x }
  `);

  expect(out).toEqual(`const a$x = 0;
const a$x$1 = 1;
const a = a$x + a$x$1;
`);
});

test("iifs", () => {
  // TODO should I fix grammar?
  const out = compileSrc(`
    let a = fn { 42 } ()
  `);

  expect(out).toEqual(`function a$GEN__0() {
  return 42;
}
const a = a$GEN__0();
`);
});

test("(let) closures", () => {
  const out = compileSrc(`
    let a = {
      let captured = 42;
      fn { captured }
    }
  `);

  expect(out).toEqual(`const a$captured = 42;
function a() {
  return a$captured;
}
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

  expect(out).toEqual(`function a() {
  function GEN__0() {
    return 100;
  }
  return GEN__0;
}
`);
});

test("recursion in closures", () => {
  const out = compileSrc(`
    let f = {
      let x = fn { fn { x() } };
      0
    }
`);

  expect(out).toEqual(
    `function f$x() {
  function GEN__0() {
    return f$x();
  }
  return GEN__0;
}
const f = 0;
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

  expect(out).toEqual(`const Main$x = true;
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

  expect(out).toEqual(`const Main$x = false;
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

  expect(out).toEqual(`const Main$x = null;
`);
});

test("allow custom types with zero args", () => {
  const out = compileSrc(`
    type T { X }

    let x = X
  `);

  expect(out).toEqual(`const X = { type: "X" };

const x = X;
`);
});

test("allow custom types with one arg", () => {
  const out = compileSrc(`
    type T { X(Int) }

    let x = X
  `);

  expect(out).toEqual(`function X(a0) {
  return { type: "X", a0 };
}
const x = X;
`);
});

// TODO inlining?
test("allow custom types with two args", () => {
  const out = compileSrc(`
    type T { X(Int, Int) }

    let x = X
  `);

  expect(out).toEqual(`function X(a0, a1) {
  return { type: "X", a0, a1 };
}
const x = X;
`);
});

test("allow non-js operators", () => {
  const out = compileSrc(`let x = "a" <> "b"`);
  expect(out).toEqual(`const x = "a" + "b";
`);
});

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
  expect(out).toEqual(`const A = { type: "A" };

function B(a0) {
  return { type: "B", a0 };
}
const x$GEN__0 = B(42);
let x;
if (x$GEN__0.type === "A") {
  x = 0;
} else if (x$GEN__0.type === "B") {
  x = 1;
} else {
  throw new Error("[non exhaustive match]")
}
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
  expect(out).toEqual(`function C(a0) {
  return { type: "C", a0 };
}
const x$GEN__0 = C(42);
let x;
if (x$GEN__0.type === "C") {
  x = x$GEN__0.a0;
} else {
  throw new Error("[non exhaustive match]")
}
`);
});

test("pattern matching literals", () => {
  const out = compileSrc(`
  let x = match "subject" {
    "constraint" => 0,
  }
`);

  expect(out).toEqual(`const x$GEN__0 = "subject";
let x;
if (x$GEN__0 === "constraint") {
  x = 0;
} else {
  throw new Error("[non exhaustive match]")
}
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

  expect(out).toEqual(`const Main$x$GEN__0 = true;
let Main$x;
if (Main$x$GEN__0) {
  Main$x = 0;
} else if (!Main$x$GEN__0) {
  Main$x = 1;
} else {
  throw new Error("[non exhaustive match]")
}
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

  expect(out).toEqual(`const Main$x$GEN__0 = null;
let Main$x;
if (true) {
  Main$x = 0;
} else {
  throw new Error("[non exhaustive match]")
}
`);
});

test("toplevel ident in p matching", () => {
  const out = compileSrc(`
  let x = match 42 {
    a => a,
  }
`);
  // TODO whitepace
  expect(out).toEqual(`const x$GEN__0 = 42;
let x;
if (true) {
  x = x$GEN__0;
} else {
  throw new Error("[non exhaustive match]")
}
`);
});

test("pattern matching nested value", () => {
  const out = compileSrc(`
  type Bool { True }
  type T {
    C(Bool),
  }

  let x = match C(True) {
    C(True) => 0,
  }
`);
  // TODO whitepace
  expect(out).toEqual(`function C(a0) {
  return { type: "C", a0 };
}
const x$GEN__0 = C(true);
let x;
if (x$GEN__0.type === "C" && x$GEN__0.a0) {
  x = 0;
} else {
  throw new Error("[non exhaustive match]")
}
`);
});

test("simple pattern matching in tail position", () => {
  const out = compileSrc(`
  let f = fn {
    match 42 { x => x }
  }
`);

  expect(out).toEqual(`function f() {
  const GEN__0 = 42;
  if (true) {
    return GEN__0;
  } else {
    throw new Error("[non exhaustive match]")
  }
}
`);
});

test("pattern matching in tail position (match constructor)", () => {
  const out = compileSrc(`
  type Box { Box(Int) }
  let f = fn {
    match Box(42) {
      Box(x) => x + 1
    }
  }
`);

  expect(out).toEqual(`function Box(a0) {
  return { type: "Box", a0 };
}
function f() {
  const GEN__0 = Box(42);
  if (GEN__0.type === "Box") {
    return GEN__0.a0 + 1;
  } else {
    throw new Error("[non exhaustive match]")
  }
}
`);
});

test("pattern matching as fn arg", () => {
  const out = compileSrc(`
  let f = 0
  let x = f(match 42 {
    _ => 0,
  })
`);

  expect(out).toEqual(`const f = 0;

const x$GEN__1 = 42;
let x$GEN__0;
if (true) {
  x$GEN__0 = 0;
} else {
  throw new Error("[non exhaustive match]")
}
const x = f(x$GEN__0);
`);
});

test("eval complex match", () => {
  const out = compileSrc(`
    type Maybe<a> {
      Nothing,
      Just(a),
    }
    
    type Result<a, b> {
      Ok(a),
      Err(b),
    }
    
    type Data {
      A,
      B(Int),
      Z(Maybe<String>, Result<Maybe<String>, String>),
    }
    
    let x = Z(
      Just("abc"),
      Ok(Just("def"))
    )

    let m = match x {
      Z(Just(s1), Ok(Just(s2))) => s1 <> s2,
    }
  `);

  const r = new Function(`${out}; return m`)();
  expect(r).toEqual("abcdef");
});

test("two fns as args", () => {
  const out = compileSrc(`
    let f = 0
    let x = f(
      fn { 0 },
      fn { 1 },
    )
`);

  expect(out).toEqual(`const f = 0;

function x$GEN__0() {
  return 0;
}
function x$GEN__1() {
  return 1;
}
const x = f(x$GEN__0, x$GEN__1);
`);
});

describe("TCO", () => {
  test("does not apply inside infix application", () => {
    const out = compileSrc(`
    let loop = fn {
      1 + loop()
    }
`);

    expect(out).toEqual(`function loop() {
  return 1 + loop();
}
`);
  });

  test("does not apply inside application", () => {
    const out = compileSrc(`
    let a = 0
    let loop = fn {
      a(loop())
    }
`);

    expect(out).toEqual(`const a = 0;

function loop() {
  return a(loop());
}
`);
  });

  test("does not apply to let value", () => {
    const out = compileSrc(`
    let f = fn x {
      let a = f(x + 1);
      a
    }
    
    `);

    expect(out).toEqual(`function f(x) {
  const a = f(x + 1);
  return a;
}
`);
  });

  test("toplevel, no args", () => {
    const out = compileSrc(`
      let loop = fn {
        loop()
      }
  `);

    expect(out).toEqual(`function loop() {
  while (true) {
  }
}
`);
  });

  test("toplevel with args", () => {
    const out = compileSrc(`
      let loop = fn x, y {
        loop(x + 1, y)
      }
  `);

    expect(out).toEqual(`function loop(GEN__0, GEN__1) {
  while (true) {
    const x = GEN__0;
    const y = GEN__1;
    GEN__0 = x + 1;
    GEN__1 = y;
  }
}
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

    expect(out).toEqual(`function to_zero(GEN__0) {
  while (true) {
    const x = GEN__0;
    if (x == 0) {
      return x;
    } else {
      GEN__0 = x - 1;
    }
  }
}
`);
  });

  test("Example: List.reduce", () => {
    const out = compileSrc(`
      pub let reduce = fn lst, acc, f {
        match lst {
          Nil => acc,
          hd :: tl => reduce(lst, f(acc, hd), f),
        }
      }
  `);

    expect(out).toEqual(`function reduce(GEN__1, GEN__2, GEN__3) {
  while (true) {
    const lst = GEN__1;
    const acc = GEN__2;
    const f = GEN__3;
    const GEN__0 = lst;
    if (GEN__0.type === "Nil") {
      return acc;
    } else if (GEN__0.type === "Cons") {
      GEN__0 = lst;
      GEN__1 = f(acc, GEN__0.a0);
      GEN__2 = f;
    } else {
      throw new Error("[non exhaustive match]")
    }
  }
}
`);
  });

  test.todo("Namespaced", () => {
    const out = compileSrc(`let f1 = fn { f1() }`, "Mod");

    expect(out).toEqual(`function Mod$f1() {
  while (true) {
  }
}
`);
  });

  test.todo("Local vars shadow tail calls", () => {
    const out = compileSrc(`
      let f1 = fn {
        let f1 = fn { 0 };
        f1()
      }`);

    expect(out).toEqual(`function f1() {
  function f1$f1() {
    return 0
  };
  return f1$f1();
}
`);
  });
});

describe("modules", () => {
  test("variables from modules different than Main are namespaced", () => {
    const out = compileSrc(`let a = 42`, "ExampleModule");
    expect(out).toEqual(`const ExampleModule$a = 42;\n`);
  });

  test("declarations from modules different than Main are resolved correctly", () => {
    const out = compileSrc(`let a = 42\nlet x = a`, "ExampleModule");
    expect(out).toEqual(
      `const ExampleModule$a = 42;\n\nconst ExampleModule$x = ExampleModule$a;\n`,
    );
  });

  test("extern declarations from modules different than Main are resolved correctly", () => {
    const out = compileSrc(
      `extern let a: Int
      let x = a`,
      "ExampleModule",
    );
    expect(out).toEqual(`const ExampleModule$x = ExampleModule$a;\n`);
  });

  test("variables are scoped in nested modules", () => {
    const out = compileSrc(`let a = 42`, "A/B/C");
    expect(out).toEqual(`const A$B$C$a = 42;\n`);
  });

  test("local variables from modules different than Main are namespaced", () => {
    const out = compileSrc(`let a = { let b = 42; b}`, "ExampleModule");
    expect(out).toEqual(`const ExampleModule$a$b = 42;
const ExampleModule$a = ExampleModule$a$b;
`);
  });

  test("variants from modules different than Main are namespaced", () => {
    const out = compileSrc(
      `
      type MyType { C1, C2(Int) }
      let c2_example = C2(42)
    `,
      "MyModule",
    );

    expect(out).toEqual(`const MyModule$C1 = { type: "C1" };

function MyModule$C2(a0) {
  return { type: "C2", a0 };
}
const MyModule$c2_example = MyModule$C2(42);
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
    expect(out).toEqual(`const Main$a = ExampleModule$value_name;\n`);
  });

  test("values imported with unqualfied imports in nested modules are resolved with the right namespace", () => {
    const out = compileSrcWithDeps({
      "Nested/Mod": `pub let value_name = 42`,
      Main: `
        import Nested/Mod.{value_name}
        let a = value_name
      `,
    });
    expect(out).toEqual(`const Main$a = Nested$Mod$value_name;\n`);
  });

  test("values imported with ualfied imports in nested modules are resolved with the right namespace", () => {
    const out = compileSrcWithDeps({
      "Nested/Mod": `pub let value_name = 42`,
      Main: `
        import Nested/Mod
        let a = Nested/Mod.value_name
      `,
    });
    expect(out).toEqual(`const Main$a = Nested$Mod$value_name;\n`);
  });

  test("values imported from another module are resolved with the right namespace", () => {
    const out = compileSrcWithDeps({
      ExampleModule: "pub let value_name = 42",
      Main: `
      import ExampleModule
      let a = ExampleModule.value_name
    `,
    });
    expect(out).toEqual(`const Main$a = ExampleModule$value_name;\n`);
  });

  test("constructors imported with unqualfied imports are resolved with the right namespace", () => {
    const out = compileSrcWithDeps({
      ExampleModule: `pub(..) type T { Constr }`,
      Main: `
      import ExampleModule.{T(..)}
      let a = Constr
      `,
    });

    expect(out).toEqual(`const Main$a = ExampleModule$Constr;\n`);
  });

  test("constructors imported with qualified imports are resolved with the right namespace", () => {
    const out = compileSrcWithDeps({
      ExampleModule: `pub(..) type T { Constr }`,
      Main: `
        import ExampleModule
        let a = ExampleModule.Constr
      `,
    });
    expect(out).toEqual(`const Main$a = ExampleModule$Constr;\n`);
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

function compileSrc(src: string, ns?: string) {
  const parsed = unsafeParse(src);
  const [program] = typecheck(
    ns ?? "Main",
    parsed,
    {},
    [],
    testEntryPoint.type,
  );
  const out = new Compiler().compile(program, ns);
  return out;
}

// Returns Main
function compileSrcWithDeps(rawProject: Record<string, string>): string {
  const res = typecheckProject(
    parseProject(rawProject),
    [],
    testEntryPoint.type,
  );
  const Main = res.Main!;
  return new Compiler().compile(Main[0], "Main");
}

function parseProject(
  rawProject: Record<string, string>,
): Record<string, UntypedModule> {
  return Object.fromEntries(
    Object.entries(rawProject).map(([ns, src]) => [ns, unsafeParse(src)]),
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
  const untypedProject = parseProject(rawProject);
  const typecheckResult = typecheckProject(
    untypedProject,
    [],
    testEntryPoint.type,
  );

  const typedProject: Record<string, TypedModule> = {};
  for (const [ns, [typedModule, errs]] of Object.entries(typecheckResult)) {
    if (errs.length !== 0) {
      throw new Error(
        "Got errors while type checking: \n" + JSON.stringify(errs, null, 2),
      );
    }

    typedProject[ns] = typedModule;
  }

  return compileProject(typedProject, options);
}
