import { expect, test } from "vitest";
import { compile } from "./compiler";
import { typecheck } from "./typecheck/typecheck";
import { unsafeParse } from "./parser";

test("compile int constants", () => {
  const out = compileSrc(`let x = 42`);
  expect(out).toEqual(`const x = 42;
`);
});

test("compile float constants", () => {
  const out = compileSrc(`let x = "abc"`);
  expect(out).toEqual(`const x = "abc";
`);
});

test("compile + of ints", () => {
  const out = compileSrc(`let x = 1 + 2`);
  expect(out).toEqual(`const x = 1 + 2;
`);
});

test("compile * of ints", () => {
  const out = compileSrc(`let x = 1 * 2`);
  expect(out).toEqual(`const x = 1 * 2;
`);
});

test("precedence between * and +", () => {
  const out = compileSrc(`let x = (1 + 2) * 3`);
  expect(out).toEqual(`const x = (1 + 2) * 3;
`);
});

test("precedence between * and + (2)", () => {
  const out = compileSrc(`let x = 1 + 2 * 3`);
  expect(out).toEqual(`const x = 1 + 2 * 3;
`);
});

test("math expr should have same semantics as js", () => {
  const expr = "2 * 3 + 4";
  const compiled = compileSrc(`let x = ${expr}`);

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
  // TODO should I fix grammar?
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

test("represent True as true", () => {
  const out = compileSrc(`
    let x = True
  `);

  expect(out).toEqual(`const x = true;
`);
});

test("represent False as false", () => {
  const out = compileSrc(`
    let x = False
  `);

  expect(out).toEqual(`const x = false;
`);
});

test("represent Nil as null", () => {
  const out = compileSrc(`
    let x = Nil
  `);

  expect(out).toEqual(`const x = null;
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

test("pattern matching bool values", () => {
  const out = compileSrc(`
  let x = match True {
    True => 0,
    False => 1,
  }
`);

  expect(out).toEqual(`const x$GEN__0 = true;
let x;
if (x$GEN__0) {
  x = 0;
} else if (!x$GEN__0) {
  x = 1;
} else {
  throw new Error("[non exhaustive match]")
}
`);
});

test("pattern matching Nil values", () => {
  const out = compileSrc(`
  let x = match Nil {
    Nil => 0,
  }
`);

  expect(out).toEqual(`const x$GEN__0 = null;
let x;
if (true) {
  x = 0;
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

function compileSrc(src: string) {
  const parsed = unsafeParse(src);
  const [program] = typecheck(parsed);
  const out = compile(program);
  return out;
}
