import { test, expect, describe } from "vitest";
import { unsafeParse } from "./parser";
import { format } from "./formatter";

test("int lit", () => {
  expect(`let x = 42\n`).toBeFormatted();
});

test("float lit", () => {
  expect(`let x = 1.2\n`).toBeFormatted();
});

test("float lit that is integer", () => {
  expect(`let x = 2.0\n`).toBeFormatted();
});

test("string lit", () => {
  expect(`let x = "abc"\n`).toBeFormatted();
});

test("identifier", () => {
  expect(`let x = y\n`).toBeFormatted();
});

test("pub modifier", () => {
  expect(`pub let x = 42\n`).toBeFormatted();
});

test("namespaced identifier", () => {
  expect(`let x = A/B/C.y\n`).toBeFormatted();
});

test("application with no args", () => {
  expect(`let x = f()\n`).toBeFormatted();
});

test("application with one arg", () => {
  expect(`let x = f(0)\n`).toBeFormatted();
});

test("application with many args", () => {
  expect(`let x = f(0, 1, 2)\n`).toBeFormatted();
});

test("application that wraps", () => {
  expect(`let x = f(
  long_spanning_val,
  long_spanning_fn(1, 2, 3),
  long_spanning_val,
  long_spanning_val,
)
`).toBeFormatted();
});

test("constructor application with many args", () => {
  expect(`let x = Constr(0, 1, 2)\n`).toBeFormatted();
});

test("Tuple2 sugar", () => {
  expect(`let x = (1, 2)\n`).toBeFormatted();
});

describe("list lit syntax", () => {
  test("on empty list", () => {
    expect(`let x = []\n`).toBeFormatted();
  });

  test("on singleton", () => {
    expect(`let x = [42]\n`).toBeFormatted();
  });

  test("on list with many elems", () => {
    expect(`let x = [1, 2, 3]\n`).toBeFormatted();
  });
});

test("cons application sugar", () => {
  expect(`let x = hd :: hd2 :: tl\n`).toBeFormatted();
});

test.todo("cons application is rassoc", () => {
  expect(`let x = (hd :: tl1) :: tl2\n`).toBeFormatted();
});

test("infix application", () => {
  expect(`let x = 1 + 2\n`).toBeFormatted();
});

test("nested infix", () => {
  expect(`let x = 1 + 2 * 3\n`).toBeFormatted();
  expect(`let x = 1 * 2 + 3\n`).toBeFormatted();
});

test("keep parenthesis if needed by prec", () => {
  expect(`let x = (1 + 2) * 3\n`).toBeFormatted();
});

test("mix infix and appl", () => {
  expect(`let x = 1 + f(2 + 3) + 4\n`).toBeFormatted();
});

test("prefix not", () => {
  expect(`let x = !0\n`).toBeFormatted();
});

test("prefix with and", () => {
  expect(`let x = !(True && False)\n`).toBeFormatted();
  expect(`let x = !True && !False\n`).toBeFormatted();
});

test("pipe operator in let", () => {
  expect(`let x = {
  example_arg
  |> f(a, b)
  |> g(c)
}
`).toBeFormatted();
});

test("pipe within a list", () => {
  expect(`let t = Test.describe("descr", [
  example_value
  |> Expect.eq(42),
  example_value
  |> Expect.eq(2),
])
`).toBeFormatted();
});

test("pipe operator in let", () => {
  expect(`let x = f(1, 2, {
  arg
  |> f(a, b)
  |> g(c)
})
`).toBeFormatted();
});

test("pipe operator inside fn", () => {
  expect(`let x = fn {
  arg
  |> f(a, b)
  |> g(c)
}
`).toBeFormatted();
});

test("multiple declrs", () => {
  expect(`let x = 0

let y = 1\n`).toBeFormatted();
});

test("if expr", () => {
  expect(`let _ =
  if cond {
    0
  } else {
    1
  }

`).toBeFormatted();
});

test("fn with no params", () => {
  expect(`let f = fn {
  x
}
`).toBeFormatted();
});

test("fn with params", () => {
  expect(`let f = fn a, b, c {
  x
}
`).toBeFormatted();
});

test("fn inside function call", () => {
  expect(`let x = f(0, 1, fn a {
  x
})
`).toBeFormatted();
});

test("fn inside function call that wraps", () => {
  expect(`let x = f(0, 1, fn a {
  very_very_very_very_very_very_very_very_long_spanning_fn_value()
})
`).toBeFormatted();
});

test("if inside fn", () => {
  expect(`let f = fn {
  if cond {
    x
  } else {
    y
  }
}
`).toBeFormatted();
});

test("toplevel let expr", () => {
  expect(`let f = {
  let x = value;
  body
}
`).toBeFormatted();
});

test("toplevel nested let expr", () => {
  expect(`let f = {
  let x = value;
  let y = value2;
  let z = value3;
  body
}
`).toBeFormatted();
});

test("toplevel nested let# expr", () => {
  expect(`let f = {
  let#and_then x = value;
  let#My/Mod.and_then y = value2;
  let#and_then z = value3;
  body
}
`).toBeFormatted();
});

test("let inside fn", () => {
  expect(`let f = fn {
  let x = value;
  body
}
`).toBeFormatted();
});

test("let inside if body", () => {
  expect(`let f =
  if cond {
    let x = value;
    let y = value2;
    body1
  } else {
    let x = value;
    let y = value2;
    body2
  }

`).toBeFormatted();
});

describe("imports", () => {
  test("without exposings", () => {
    expect(`import A\n`).toBeFormatted();
  });

  test("order with declrs", () => {
    expect(`import A
import B

let x = 0
`).toBeFormatted();
  });

  test("exposing a value", () => {
    expect(`import A.{value}\n`).toBeFormatted();
  });

  test("exposing a type", () => {
    expect(`import A.{Type}\n`).toBeFormatted();
  });

  test("exposing an infix value", () => {
    expect(`import A.{(+)}\n`).toBeFormatted();
  });

  test("exposing many values", () => {
    expect(`import A.{a, b, c}\n`).toBeFormatted();
  });

  test("exposing a type and its constructors", () => {
    expect(`import A.{Type(..)}\n`).toBeFormatted();
  });

  test("sort imports alphabetically", () => {
    expect(`import B
import A
`).toBeFormatted(
      `import A
import B
`,
    );
  });
});

test("order between type declrs and declrs", () => {
  const t = `type T { }`;
  const d = `let x = 0`;
  expect(`${t}\n\n${d}\n`).toBeFormatted();
  expect(`${d}\n\n${t}\n`).toBeFormatted();
});

describe("comments", () => {
  test.todo("regular comments");

  test("doc comments on declrs", () => {
    expect(`/// First line
/// Second line
let f = 0
`).toBeFormatted();
  });

  test("doc comments on extern declrs", () => {
    expect(`/// First line
/// Second line
extern let f: X
`).toBeFormatted();
  });

  test("doc comments on types", () => {
    expect(`/// First line
/// Second line
type X { }
`).toBeFormatted();
  });

  test("doc comments on extern types", () => {
    expect(`/// First line
/// Second line
extern type X
`).toBeFormatted();
  });
});

describe("type hints", () => {
  test("concrete type", () => {
    expect(`let f: Int = 0\n`).toBeFormatted();
  });

  test("qualified concrete type", () => {
    expect(`let f: A/B/C.Int = 0\n`).toBeFormatted();
  });

  test("type hints on extern", () => {
    expect(`extern let f: Int\n`).toBeFormatted();
  });

  test("infix extern", () => {
    expect(`extern let (+): Fn(Int, Int) -> Int\n`).toBeFormatted();
  });

  test("prefix extern", () => {
    expect(`extern let (!): Fn(Bool) -> Bool\n`).toBeFormatted();
  });

  test("concrete with one arg", () => {
    expect(`extern let f: Maybe<Int>\n`).toBeFormatted();
  });

  test("concrete with many args", () => {
    expect(`extern let f: Result<Int, String>\n`).toBeFormatted();
  });

  test("tvar", () => {
    expect(`extern let f: a\n`).toBeFormatted();
  });

  test("catchall", () => {
    expect(`extern let f: _\n`).toBeFormatted();
  });

  test("Fn with no args", () => {
    expect(`extern let f: Fn() -> Int\n`).toBeFormatted();
  });

  test("Fn with one arg", () => {
    expect(`extern let f: Fn(A) -> Int\n`).toBeFormatted();
  });

  test("Fn with many arg", () => {
    expect(`extern let f: Fn(A, B, C) -> Int\n`).toBeFormatted();
  });
});

describe("type delc", () => {
  test("extern types", () => {
    expect(`extern type T\n`).toBeFormatted();
  });

  test("extern types with generic args", () => {
    expect(`extern type T<p1, p2>\n`).toBeFormatted();
  });

  test("extern types pub modifier", () => {
    expect(`extern pub type T\n`).toBeFormatted();
  });

  test("adts with no construtcors", () => {
    expect(`type T { }\n`).toBeFormatted();
  });

  test("adts pub modifier", () => {
    expect(`pub type T { }\n`).toBeFormatted();
  });

  test("adts pub(..) modifier", () => {
    expect(`pub(..) type T { }\n`).toBeFormatted();
  });

  test("adts with a constructors", () => {
    expect(`type Unit {
  Unit,
}
`).toBeFormatted();
  });

  test("adts with many constructors", () => {
    expect(`type T {
  A,
  B,
}
`).toBeFormatted();
  });

  test("adts with a constructors with an arg", () => {
    expect(`type Box {
  Box(Int),
}
`).toBeFormatted();
  });

  test("adts with a constructors with many args", () => {
    expect(`type Box {
  Box(Int, a, Maybe<Int>),
}
`).toBeFormatted();
  });

  test("adts with one type params", () => {
    expect(`type Box<a> { }
`).toBeFormatted();
  });

  test("adts with many type params", () => {
    expect(`type Box<a, b, c> { }
`).toBeFormatted();
  });
});

describe("pattern matching", () => {
  test("empty pattern matching", () => {
    expect(`let x = match expr { }
`).toBeFormatted();
  });

  test("matching over an ident", () => {
    expect(`let m = match expr {
  x => 0,
}
`).toBeFormatted();
  });

  test("many clauses", () => {
    expect(`let m = match expr {
  x => 0,
  y => 1,
}
`).toBeFormatted();
  });

  test("matching over a const", () => {
    expect(`let m = match expr {
  0 => 0,
}
`).toBeFormatted();
  });

  test("matching a constructor with no args", () => {
    expect(`let m = match expr {
  X => ret,
}
`).toBeFormatted();
  });

  test("matching a constructor with one arg", () => {
    expect(`let m = match expr {
  X(x) => ret,
}
`).toBeFormatted();
  });

  test("matching a constructor with many args", () => {
    expect(`let m = match expr {
  X(x, y, z) => ret,
}
`).toBeFormatted();
  });

  test("matching :: sugar", () => {
    expect(`let m = match expr {
  hd :: tl => ret,
}
`).toBeFormatted();
  });

  test("matching Tuple2 sugar", () => {
    expect(`let m = match expr {
  (a, b) => ret,
}
`).toBeFormatted();
  });

  test.todo("TupleN sugar");

  test("nested pattern matching", () => {
    expect(`let m = match expr {
  X(Just(a, _, Ok)) => ret,
}
`).toBeFormatted();
  });
});

test("actual examples", () => {
  expect(
    `
pub let range = fn from, to {
  if from >= to {
    []
  } else {
    from :: range(from + 1, to)
  }
}

pub let filter_map = fn lst, f {
  reduce_right(lst, [], fn x, xs {
    match f(x) {
      Nothing => xs,
      Just(hd) => hd :: xs,
    }
  })
}
`.trimStart(),
  ).toBeFormatted();
});

test("list that wraps", () => {
  const src = `let x = [
  "long-element-of-list",
  "long-element-of-list",
  "long-element-of-list",
  "long-element-of-list",
]
`;
  expect(src).toBeFormatted();
});

test("fn callback after list", () => {
  const src = `let x = List.map([1, 2, 3], fn x {
  x + 1
})
`;
  expect(src).toBeFormatted();
});

test("match as last arg", () => {
  const src = `let x = f(a, b, match expr {
  b => 42,
})
`;
  expect(src).toBeFormatted();
});

test("let block as last arg", () => {
  const src = `let x = f(a, b, {
  let x = 42;
  value
})
`;
  expect(src).toBeFormatted();
});

test("long arg as last arg", () => {
  const src = `let x = f(
  a,
  b,
  "something that should wrap 'cause its very long and it's overflowing",
)
`;
  expect(src).toBeFormatted();
});

test("let inside list", () => {
  const src = `let x = [
  {
    let x = 42;
    0
  },
]
`;
  expect(src).toBeFormatted();
});

test("fn inside list", () => {
  const src = `let x = [
  fn {
    0
  },
]
`;
  expect(src).toBeFormatted();
});

describe("test dsl", () => {
  test("Test.test", () => {
    expect(`let t = Test.test("example", {
  f(a, b)
  |> Expect.eq_just(Expect.eq_int, 0)
})
`).toBeFormatted();
  });

  test("Test.describe", () => {
    expect(`let t = Test.describe("descr", [
  Test.test("my test with a long description that should break the group", {
    0
    |> Expect.eq(42)
  }),
  Test.test("my second test", {
    0
    |> Expect.eq(42)
  }),
])
`).toBeFormatted();
  });

  test("Test.describe short", () => {
    expect(`let t = Test.describe("example", [
  Test.test("my test", {
    0
    |> Expect.eq(42)
  }),
  Test.test("my test", {
    0
    |> Expect.eq(42)
  }),
])
`).toBeFormatted();
  });
});

interface CustomMatchers<R = unknown> {
  toBeFormatted: (as?: string) => R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toBeFormatted(received, expected = received) {
    const formatted = format(unsafeParse(received));

    if (expected !== formatted) {
      console.log(formatted);
    }
    return {
      pass: expected === formatted,
      expected,
      actual: formatted,
      message: () => `The given string is not formatted as expected`,
    };
  },
});
