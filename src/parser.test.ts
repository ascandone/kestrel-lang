import { expect, test, describe } from "vitest";
import { unsafeParse } from "./parser";
import { Program, Span, SpanMeta } from "./ast";

test("parsing a declaration", () => {
  const src = "let x = 0";
  expect(unsafeParse(src)).toEqual<Program<SpanMeta>>({
    typeDeclarations: [],
    declarations: [
      {
        binding: { name: "x", span: spanOf(src, "x") },
        value: {
          type: "constant",
          value: {
            type: "int",
            value: 0,
          },
          span: spanOf(src, "0"),
        },
        span: spanOf(src, src),
      },
    ],
  });
});

test("parsing two declarations", () => {
  const src = `let x = 0\nlet y = 1`;
  expect(unsafeParse(src)).toEqual<Program<SpanMeta>>({
    typeDeclarations: [],
    declarations: [
      {
        binding: { name: "x", span: spanOf(src, "x") },
        value: {
          type: "constant",
          value: {
            type: "int",
            value: 0,
          },
          span: spanOf(src, "0"),
        },
        span: spanOf(src, "let x = 0"),
      },
      {
        binding: { name: "y", span: spanOf(src, "y") },
        value: {
          type: "constant",
          value: {
            type: "int",
            value: 1,
          },
          span: spanOf(src, "1"),
        },
        span: spanOf(src, "let y = 1"),
      },
    ],
  });
});

test("parse float", () => {
  const src = "let _ = 1.23";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse + expr", () => {
  const src = "let _ = 1 + 2";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse - expr", () => {
  const src = "let _ = 1 - 2";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse * expr", () => {
  const src = "let _ = 1 * 2";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse + and * prec", () => {
  const src = "let _ = 1 - 2 * 3";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse + and * prec with parens", () => {
  const src = "let _ = (1 - 2) * 3";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse ident", () => {
  const src = "let _ = x";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse appl with no args", () => {
  const src = "let _ = f()";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse appl with 1 arg", () => {
  const src = "let _ = f(x)";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse appl with 3 args", () => {
  const src = "let _ = f(x, y, z)";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse appl with trailing comma", () => {
  const src = `let _ = f(
    x,
    y,
  )`;
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse appl with nested expr", () => {
  const src = "let _ = f(1 + 2)";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse appl with nested parens", () => {
  const src = "let _ = f((1))";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse block with no let", () => {
  const src = `
let _ = { 1 }
`;

  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse let block with one let", () => {
  const src = `
let _ = {
  let x = 0;
  1
}
`;

  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse let block with two let stmts", () => {
  const src = `
let _ = {
  let x = 0;
  let y = 1;
  2
}
`;

  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse fn with no args", () => {
  const src = `
let _ = fn { 0 }
`;

  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse fn with 1 arg", () => {
  const src = `
let _ = fn x { 0 }
`;

  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse fn with 2 args", () => {
  const src = `
let _ = fn x, y { 0 }
`;

  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse fn with let", () => {
  const src = `
let _ = fn {
  let x = 0;
  1
}
`;

  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse if expr", () => {
  const src = `
let _ = if b { 0 } else { 1 }
`;

  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse if expr with a let expr", () => {
  const src = `
let _ = if b {
  let x = a;
  0
} else {
  1
}
`;

  expect(unsafeParse(src)).toMatchSnapshot();
});

describe("type hints", () => {
  test("parses a concrete type with no args as a type hint", () => {
    const src = "let x : Int = 0";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("parses underscore type", () => {
    const src = "let x : _ = 0";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("parses concrete type with 1 arg", () => {
    const src = "let x : Maybe<Int> = 0";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("parses concrete type with 2 args", () => {
    const src = "let x : Result<Int, Bool> = 0";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("parses Fn type with no args", () => {
    const src = "let x : Fn() -> Int = 0";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("parses Fn type with args", () => {
    const src = "let x : Fn(X, Y) -> Z = 0";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("parses type vars hints", () => {
    const src = "let x : a = 0";
    expect(unsafeParse(src)).toMatchSnapshot();
  });
});

describe("type declarations", () => {
  test("type with no variants", () => {
    const src = "type Never { }";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("type with a variant with no args", () => {
    const src = "type T { C }";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("type with a variant with no args", () => {
    const src = "type T { C(Arg) }";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("type with a variant with complex args", () => {
    const src = `
      type T {
        C(Example<a, Nested<Int>>)
      }
    `;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("type with many variants", () => {
    const src = `type T { A, B }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("trailing comma after variants", () => {
    const src = `type T { A, B, }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("single type param", () => {
    const src = `type T<a> { }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("many type params", () => {
    const src = `type T<a, b, c> { }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });
});

describe("pattern matching", () => {
  test("empty match expression", () => {
    const src = `let _ = match x {}`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("binding with identifier", () => {
    const src = `let _ = match x { a => res }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });
});

function spanOf(src: string, substr: string = src): Span {
  const index = src.indexOf(substr);
  return [index, index + substr.length];
}
