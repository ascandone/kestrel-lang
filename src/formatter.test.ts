import { test, expect, describe } from "vitest";
import { unsafeParse } from "./parser";
import { format } from "./formatter";

test("int lit", () => {
  assertFormatted(`let x = 42\n`);
});

test("float lit", () => {
  assertFormatted(`let x = 1.2\n`);
});

test("string lit", () => {
  assertFormatted(`let x = "abc"\n`);
});

test("identifier", () => {
  assertFormatted(`let x = y\n`);
});

test("pub modifier", () => {
  assertFormatted(`pub let x = 42\n`);
});

test("namespaced identifier", () => {
  assertFormatted(`let x = A/B/C.y\n`);
});

test("application with no args", () => {
  assertFormatted(`let x = f()\n`);
});

test("application with one arg", () => {
  assertFormatted(`let x = f(0)\n`);
});

test("application with many args", () => {
  assertFormatted(`let x = f(0, 1, 2)\n`);
});

test("infix application", () => {
  assertFormatted(`let x = 1 + 2\n`);
});

test("nested infix", () => {
  assertFormatted(`let x = 1 + 2 * 3\n`);
  assertFormatted(`let x = 1 * 2 + 3\n`);
});

test("keep parenthesis if needed by prec", () => {
  assertFormatted(`let x = (1 + 2) * 3\n`);
});

test("mix infix and appl", () => {
  assertFormatted(`let x = 1 + f(2 + 3) + 4\n`);
});

test("prefix not", () => {
  assertFormatted(`let x = !0\n`);
});

test("prefix with and", () => {
  assertFormatted(`let x = !(True && False)\n`);
  assertFormatted(`let x = !True && !False\n`);
});

test("multiple declrs", () => {
  assertFormatted(`let x = 0

let y = 1\n`);
});

test("if expr", () => {
  assertFormatted(`let _ = if cond {
  0
} else {
  1
}
`);
});

test("fn with no params", () => {
  assertFormatted(`let f = fn {
  x
}
`);
});

test("fn with params", () => {
  assertFormatted(`let f = fn a, b, c {
  x
}
`);
});

test("fn inside function call", () => {
  assertFormatted(`let x = f(0, 1, fn a {
  x
})
`);
});

test("if inside fn", () => {
  assertFormatted(`let f = fn {
  if cond {
    x
  } else {
    y
  }
}
`);
});

test("toplevel let expr", () => {
  assertFormatted(`let f = {
  let x = value;
  body
}
`);
});

test("toplevel nested let expr", () => {
  assertFormatted(`let f = {
  let x = value;
  let y = value2;
  let z = value3;
  body
}
`);
});

test("let inside fn", () => {
  assertFormatted(`let f = fn {
  let x = value;
  body
}
`);
});

test("let inside if body", () => {
  assertFormatted(`let f = if cond {
  let x = value;
  let y = value2;
  body1
} else {
  let x = value;
  let y = value2;
  body2
}
`);
});

describe("type hints", () => {
  test("concrete type", () => {
    assertFormatted(`let f: Int = 0\n`);
  });

  test("qualified concrete type", () => {
    assertFormatted(`let f: A/B/C.Int = 0\n`);
  });

  test("type hints on extern", () => {
    assertFormatted(`extern let f: Int\n`);
  });

  test("concrete with one arg", () => {
    assertFormatted(`extern let f: Maybe<Int>\n`);
  });

  test("concrete with many args", () => {
    assertFormatted(`extern let f: Result<Int, String>\n`);
  });

  test("tvar", () => {
    assertFormatted(`extern let f: a\n`);
  });

  test("catchall", () => {
    assertFormatted(`extern let f: _\n`);
  });

  test("Fn with no args", () => {
    assertFormatted(`extern let f: Fn() -> Int\n`);
  });

  test("Fn with one arg", () => {
    assertFormatted(`extern let f: Fn(A) -> Int\n`);
  });

  test("Fn with many arg", () => {
    assertFormatted(`extern let f: Fn(A, B, C) -> Int\n`);
  });
});

describe("type delc", () => {
  test("extern types", () => {
    assertFormatted(`extern type T\n`);
  });

  test("extern types pub modifier", () => {
    assertFormatted(`extern pub type T\n`);
  });

  test("adts with no construtcors", () => {
    assertFormatted(`type T { }\n`);
  });

  test("adts pub modifier", () => {
    assertFormatted(`pub type T { }\n`);
  });

  test("adts pub(..) modifier", () => {
    assertFormatted(`pub(..) type T { }\n`);
  });

  test("adts with a constructors", () => {
    assertFormatted(`type Unit {
  Unit,
}
`);
  });

  test("adts with many constructors", () => {
    assertFormatted(`type T {
  A,
  B,
}
`);
  });

  test("adts with a constructors with an arg", () => {
    assertFormatted(`type Box {
  Box(Int),
}
`);
  });

  test("adts with a constructors with many args", () => {
    assertFormatted(`type Box {
  Box(Int, a, Maybe<Int>),
}
`);
  });

  test("adts with one type params", () => {
    assertFormatted(`type Box<a> { }
`);
  });

  test("adts with many type params", () => {
    assertFormatted(`type Box<a, b, c> { }
`);
  });
});

describe("pattern matching", () => {
  test("empty pattern matching", () => {
    assertFormatted(`let x = match expr { }
`);
  });

  test("matching over an ident", () => {
    assertFormatted(`let m = match expr {
  x => 0,
}
`);
  });

  test("matching over a const", () => {
    assertFormatted(`let m = match expr {
  0 => 0,
}
`);
  });
});

test.todo("order between type declrs and declrs");
test.todo("comments");

function assertFormatted(src: string) {
  const ast = unsafeParse(src);
  expect(format(ast)).toBe(src);
}
