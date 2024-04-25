import { describe, expect, test } from "vitest";
import { format } from "../formatter";
import { unsafeParse } from "../parser";
import { optimizeModule } from "./optimize";
import { typecheck } from "../typecheck";

describe("constant folding", () => {
  test("leave optimized program as it is", () => {
    expect("let x = 42").toOptimizeAs("let x = 42");
  });

  test("fold constants (one step)", () => {
    expect("let x = 1 + 2").toOptimizeAs("let x = 3");
    expect("let x = 2 * 3").toOptimizeAs("let x = 6");
    expect("let x = 1.3 +. 2.4").toOptimizeAs("let x = 3.7");
    expect(`let x = "a" ++ "b"`).toOptimizeAs(`let x = "ab"`);
    expect("let x = 10 - 1").toOptimizeAs("let x = 9");
    expect("let x = 10.5 -. 1.2").toOptimizeAs("let x = 9.3");
  });

  test("fold constants (two steps)", () => {
    expect("let x = (1 + 1) * 4").toOptimizeAs("let x = 8");
  });
});

describe("fold iif", () => {
  test("with no args", () => {
    expect(`
    let a = fn { x * y } ()
`).toOptimizeAs(`
let a = x * y
  `);
  });

  test("with one arg", () => {
    expect(`
    let a = fn x { x * x } (expr())
`).toOptimizeAs(`
let a = {
  let x = expr();
  x * x
}
  `);
  });

  test("with many args", () => {
    expect(`
    let a = fn x, y { x * x * y * y } (f(), g())
`).toOptimizeAs(`
let a = {
  let x = f();
  let y = g();
  x * x * y * y
}
  `);
  });
});

describe("inline let bindings", () => {
  test("does not apply to recursive functions that are only used once", () => {
    const src = `let glb = {
  let rec = fn x {
    rec(x)
  };
  rec(10)
}
`;

    expect(src).toOptimizeAs(src);
  });

  test("remove unused bindings", () => {
    expect(`
let glb = {
  let unused = f();
  g()
}
`).toOptimizeAs(`
let glb = g()
`);
  });

  test("inline let binding when is only used once", () => {
    expect(`
let g = {
  let x = f();
  g(x)
}
    `).toOptimizeAs(`
let g = g(f())
`);
  });
});

describe("inline globals", () => {
  test("inline globals marked with @inline", () => {
    const src = `
@inline
let inlinable = fn x { x + 1 }
let example = inlinable(42)
`;

    expect(src).toOptimizeAs(`
@inline
let inlinable = fn x {
  x + 1
}

let example = 43
`);
  });
});

test("apply opt to many statements", () => {
  expect(`
    let x = 1 + 2
    let y = 10 + 20
  `).toOptimizeAs(`
let x = 3

let y = 30
  `);
});

test("optimizations apply to nodes nested within an application", () => {
  expect(`
    let x = f(f(1 + 2))
  `).toOptimizeAs(`
    let x = f(f(3))
  `);
});

test("optimizations apply to nodes nested in a fn body", () => {
  expect(`
    let x = fn { 1 + 2 }
  `).toOptimizeAs(`
let x = fn {
  3
}
  `);
});

test("optimizations apply to nodes nested in an if condition", () => {
  expect(`
let x =
  if 1 + 2 {
    10 + 20
  } else {
    100 + 200
  }
  `).toOptimizeAs(`
let x =
  if 3 {
    30
  } else {
    300
  }
  `);
});

test("optimizations apply to nodes nested in an let expr", () => {
  expect(`
let x = {
  let a = f(1 + 10);
  1 + 10 + a
}
  `).toOptimizeAs(`
let x = 11 + f(11)
`);
});

test("optimizations apply to nodes nested in match expr", () => {
  expect(`
let x = match 1 + 2 {
  _ => 10 + 20
}
  `).toOptimizeAs(`
let x = match 3 {
  _ => 30,
}
`);
});

test("function inlining example", () => {
  expect(`
  let glb = {
    let add1 = fn x { x + 1 };
    add1(100)
  }
  `).toOptimizeAs(`let glb = 101`);

  expect(`
    pub let map = fn m, f {
      let and_then = fn m, f {
        match m {
          Some(x) => f(x),
          None => None,
        }
      };

      and_then(m, fn x {
        Some(f(x))
      })
    }
  
  `).toOptimizeAs(`
pub let map = fn m, f {
  match m {
    Some(x) => Some(f(x)),
    None => None,
  }
}
`);

  expect(`
  let glb = {
    let opt_map = fn x, f {
      match x {
        None => None,
        Some(v) => f(v),
      }
    };
    opt_map(Some(42), fn x { x + 1 })
  }
  `).toOptimizeAs(`
let glb = match Some(42) {
  None => None,
  Some(v) => v + 1,
}
`);
});

test("function inlining example (globals)", () => {
  expect(`
@inline
let and_then = fn m, f {
  match m {
    Some(x) => f(x),
    None => None,
  }
}

pub let map = fn m, f {
  and_then(m, fn x {
    Some(f(x))
  })
}
`).toOptimizeAs(`@inline
let and_then = fn m, f {
  match m {
    Some(x) => f(x),
    None => None,
  }
}

pub let map = fn m, f {
  match m {
    Some(x) => Some(f(x)),
    None => None,
  }
}
`);

  expect(`
@inline
let zip = fn m1, m2 {
  match (m1, m2) {
    (Some(m1), Some(m2)) => (m1, m2),
    None => None,
  }
}

pub let mapped = zip(None, None)
`).toOptimizeAs(`@inline
let zip = fn m1, m2 {
  match (m1, m2) {
    (Some(m1), Some(m2)) => (m1, m2),
    None => None,
  }
}

pub let mapped = match (None, None) {
  (Some(m1), Some(m2)) => (m1, m2),
  None => None,
}
`);
});

interface CustomMatchers<R = unknown> {
  toOptimizeAs: (formatted: string) => R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toOptimizeAs(received, expected) {
    const parsedSrc = unsafeParse(received);
    const [typed] = typecheck("Main", parsedSrc, {}, []);

    const optimized = optimizeModule(typed);
    const optFormatted = format(optimized).trimStart().trimEnd();

    const expectedNormalized = expected.trimStart().trimEnd();

    return {
      pass: optFormatted === expectedNormalized,
      expected: expectedNormalized,
      actual: optFormatted,
      message: () => `The given program is not optimized as expected`,
    };
  },
});
