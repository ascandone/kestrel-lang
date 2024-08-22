import { test, expect, describe } from "vitest";
import { Analysis } from "./analyse";
import { typeToString } from "./type";
import {
  DuplicateDeclaration,
  ErrorInfo,
  InvalidPipe,
  TypeMismatch,
  UnboundVariable,
} from "../errors";
import { spanOf } from "./typedAst/__test__/utils";

describe("infer constants", () => {
  test("int", () => {
    const a = new Analysis("Main", `pub let x = 42`);
    expect(a.errors).toEqual([]);

    expect(getTypes(a)).toEqual({
      x: "Int",
    });
  });

  test("float", () => {
    const a = new Analysis(
      "Main",
      `
        pub let x = 42.2
      `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "Float",
    });
  });

  test("string", () => {
    const a = new Analysis(
      "Main",
      `
          pub let x = "abc"
        `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "String",
    });
  });

  test("char", () => {
    const a = new Analysis(
      "Main",
      `
            pub let x = 'a'
          `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "Char",
    });
  });
});

describe("globals resolution", () => {
  test("resolve a global variable already declared", () => {
    const a = new Analysis(
      "Main",
      `
        let x = 42
        pub let y = x
      `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      y: "Int",
    });
  });

  test("emit unbound var when variable is not found", () => {
    const a = new Analysis(
      "Main",
      `
        pub let x = unbound_var
      `,
    );

    expect(a.errors).toEqual<ErrorInfo[]>([
      {
        span: spanOf(a.source, "unbound_var"),
        description: new UnboundVariable("unbound_var"),
      },
    ]);
    expect(getTypes(a)).toEqual({
      x: "a",
    });
  });

  test.todo("forbid duplicate identifiers", () => {
    const a = new Analysis(
      "Main",
      `
      let x = 42
      let x = "override"
  
      pub let y = x
    `,
    );

    expect(a.errors).toEqual<ErrorInfo[]>([
      {
        description: new DuplicateDeclaration("x"),
        span: spanOf(a.source, "x", 1),
      },
    ]);

    expect(getTypes(a)).toEqual({
      y: "Int",
    });
  });

  test("self-recursive declarations", () => {
    const a = new Analysis("Main", `pub let f = fn _ { f(42) }`);

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      f: "Fn(Int) -> a",
    });
  });

  test("let declarations in reverse order", () => {
    const a = new Analysis(
      "Main",
      `
    pub let a = b
    pub let b = 42
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      a: "Int",
      b: "Int",
    });
  });

  test("allow dependency cycle between declarations inside thunks", () => {
    const a = new Analysis(
      "Main",
      `
    pub let a = b()
    pub let b = fn { a }
  `,
    );

    expect(a.errors).toEqual([]);
  });

  test.todo("forbid self-recusive definitions outside of fns", () => {
    const a = new Analysis(
      "Main",
      `
  pub let a = a
`,
    );

    expect(a.errors).toHaveLength(1);
    expect(getTypes(a)).toEqual({
      a: "a",
      b: "a",
    });
  });

  test.todo("forbid dependency cycles outside of fns", () => {
    const a = new Analysis(
      "Main",
      `
  pub let a = b
  pub let b = a
`,
    );

    expect(a.errors).toHaveLength(1);
    expect(getTypes(a)).toEqual({
      a: "a",
      b: "a",
    });
  });
});

describe("named types", () => {
  test("are resolved when defined as extern", () => {
    const a = new Analysis(
      "Main",
      `
      extern type Int
      extern pub let x: Int
      `,
    );

    expect(a.errors).toEqual<ErrorInfo[]>([]);
    expect(getTypes(a)).toEqual({
      x: "Int",
    });
  });
});

describe("functions and application", () => {
  test("returning a constant", () => {
    const a = new Analysis(
      "Main",
      `
        pub let f = fn { 42 }
      `,
    );

    expect(a.errors).toEqual<ErrorInfo[]>([]);
    expect(getTypes(a)).toEqual({
      f: "Fn() -> Int",
    });
  });

  test("application return type", () => {
    const a = new Analysis(
      "Main",
      `
        extern type Bool
        extern let cmp: Fn(a, a) -> Bool
        pub let x = cmp(1, 2)
      `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "Bool",
    });
  });

  test("application args should be typechecked", () => {
    const a = new Analysis(
      "Main",
      `
          extern type Ret
          extern type T
          extern let c: T
  
          extern let f: Fn(T, T) -> Ret
  
          pub let x = f(42, c)
      `,
    );

    expect(a.errors).toEqual<ErrorInfo[]>([
      {
        description: new TypeMismatch(
          {
            type: "named",
            args: [],
            moduleName: "Main",
            name: "T",
          },
          {
            type: "named",
            moduleName: "Int",
            name: "Int",
            args: [],
          },
        ),
        span: spanOf(a.source, "42"),
      },
    ]);
  });

  test("typecheck fn args", () => {
    const a = new Analysis(
      "Main",
      `
    extern type Int
    extern type Bool
    extern let cmp: Fn(Int, Int) -> Bool
    pub let f = fn x, y { cmp(x, y) }
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      f: "Fn(Int, Int) -> Bool",
    });
  });

  test("typechecks generic values", () => {
    const a = new Analysis(
      "Main",
      `
    pub let id = fn x { x }
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      id: "Fn(a) -> a",
    });
  });

  test.todo("generalize values", () => {
    const a = new Analysis(
      "Main",
      `
      pub let id = fn x { x }
      pub let v = id(42)
    `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      id: "Fn(a) -> a",
      v: "Int",
    });
  });
});

describe("if expression", () => {
  test("typecheck if ret value", () => {
    const a = new Analysis(
      "Main",
      `
    type Bool { True }
    pub let f =
      if True {
        0
      } else {
        1
      }
  `,
    );

    expect(getTypes(a)).toEqual({
      f: "Int",
    });
  });

  test("unify if clauses", () => {
    const a = new Analysis(
      "Main",
      `
    type Bool { True }
    pub let f = fn x {
      if True {
        0
      } else {
        x
      }
    }
  `,
    );

    expect(getTypes(a)).toEqual({
      f: "Fn(Int) -> Int",
    });
  });

  test("typecheck if condition", () => {
    const a = new Analysis(
      "Main",
      `
    pub let f = fn x {
      if x {
        0
      } else {
        0
      }
    }
  `,
    );

    expect(getTypes(a)).toEqual({
      f: "Fn(Bool) -> Int",
    });
  });
});

describe("let expressions", () => {
  test("infers return value", () => {
    const a = new Analysis(
      "Main",
      `
    pub let x = {
      let y = 42;
      y
    }
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "Int",
    });
  });

  test.todo("allow self-recursive let expressions", () => {
    const a = new Analysis(
      "Main",
      `
      pub let f = {
        let g = fn _ { g(1) };
        g
    }
    `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      f: "Fn(Int) -> a",
    });
  });
});

describe("pipe operator", () => {
  test.todo("infer pipe operator left side and right side");

  test("infers return type", () => {
    const a = new Analysis(
      "Main",
      `
    extern type T
    extern let t: T

    extern type T1
    extern let t1: T1
    
    extern type Ret

    extern let f: Fn(T, T1) -> Ret
    pub let x = t |> f(t1)
    // let x = f(t, t1)
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "Ret",
    });
  });

  test("emits error when right side is not function call", () => {
    const a = new Analysis(
      "Main",
      `
    pub let x = 0 |> 1
  `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(InvalidPipe);
  });
});

function getTypes(a: Analysis): Record<string, string> {
  const kvs = [...a.getPublicDeclarations()].map((decl) => {
    return [decl.binding.name, typeToString(a.getType(decl.binding))];
  });
  return Object.fromEntries(kvs);
}
