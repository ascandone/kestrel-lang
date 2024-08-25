import { test, expect, describe } from "vitest";
import { Analysis } from "./analyse";
import { typeToString } from "./type";
import {
  DuplicateDeclaration,
  ErrorInfo,
  InvalidCatchall,
  InvalidPipe,
  InvalidTypeArity,
  TypeMismatch,
  TypeParamShadowing,
  UnboundType,
  UnboundTypeParam,
  UnboundVariable,
  UnusedVariable,
} from "../errors";
import { rangeOf } from "./typedAst/__test__/utils";

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
        range: rangeOf(a.source, "unbound_var"),
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
        range: rangeOf(a.source, "x", 1),
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

describe("ADTs", () => {
  test.todo("cannot be declared twice");
  test.todo("cannot declare variants twice");

  test("can be used as type hint", () => {
    const a = new Analysis(
      "Main",
      `
    extern type X
    extern pub let x: X

    type T { }
    pub let f: Fn(T) -> X = fn _ { x }
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      f: "Fn(T) -> X",
      x: "X",
    });
  });

  test("handles constructor without args nor params", () => {
    const a = new Analysis(
      "Main",
      `
    type T { C }
    pub let c = C
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      c: "T",
    });
  });

  test("handles constructor with one (non-parametric) arg", () => {
    const a = new Analysis(
      "Main",
      `
    extern type Int
    type T { C(Int) }
    pub let c = C
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      c: "Fn(Int) -> T",
    });
  });

  test("handles constructor with complex arg", () => {
    const a = new Analysis(
      "Main",
      `
    extern type Int
    type Option<a> { }
    type T {
      C(Option<Int>, Int)
    }
    pub let c = C
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      c: "Fn(Option<Int>, Int) -> T",
    });
  });

  test.todo("generalize type constructors", () => {
    const a = new Analysis(
      "Main",
      `
      type Box<a> {
        Box(a),
        Nested(Box<a>)
      }
      
      pub let x = Nested(Box(42))
      pub let y = Nested(Box("abc"))
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "Box<Int>",
      y: "Box<String>",
    });
  });

  test("handles constructor wrapping a function", () => {
    const a = new Analysis(
      "Main",
      `
    type A {}
    type B {}
    type C {}
    type T {
      C(Fn(A, B) -> C)
    }
    pub let c = C
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      c: "Fn(Fn(A, B) -> C) -> T",
    });
  });

  test.todo("handles types that do not exist", () => {
    const a = new Analysis(
      "Main",
      `
    type T {
      C(NotFound)
    }
  `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(UnboundType);
  });

  test.todo("checks arity in constructors", () => {
    const a = new Analysis(
      "Main",
      `  
      type T<a> { }

      type T1<a, b> {
        C(T<a, b>)
      }
    `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(InvalidTypeArity);

    const desc = a.errors[0]?.description as InvalidTypeArity;
    expect(desc.expected).toEqual(1);
    expect(desc.got).toEqual(2);
  });

  test("add types to the type pool", () => {
    const a = new Analysis(
      "Main",
      `
      type A {}
      type B { C(A) }
  `,
    );

    expect(a.errors).toEqual([]);
  });

  test.todo("handles parametric types", () => {
    const a = new Analysis(
      "Main",
      `
        type Box<a, b> { C }
        pub let a = C
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      a: "Box<a, b>",
    });
  });

  test.todo("allows using parametric types in constructors", () => {
    const a = new Analysis(
      "Main",
      `
        type T<a, b> { C(b) }
        pub let a = C
        pub let b = C(1)
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      a: "Fn(a) -> T<b, a>",
      b: "T<a, Int>",
    });
  });

  test.todo("forbids unbound type params", () => {
    const a = new Analysis(
      "Main",
      `
        type T { C(a) }
  `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]!.description).toBeInstanceOf(UnboundTypeParam);
  });

  test.todo("doesn't allow shadowing type params", () => {
    const a = new Analysis(
      "Main",
      `
        type Box<a, a> { }
  `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]!.description).toBeInstanceOf(TypeParamShadowing);
  });

  test.todo("prevents catchall to be used in type args", () => {
    const a = new Analysis(
      "Main",
      `
        type T { C(_) }
  `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]!.description).toBeInstanceOf(InvalidCatchall);
  });

  test.todo("allows self-recursive type", () => {
    const a = new Analysis(
      "Main",
      `
        type T { C(T) }
      `,
    );

    expect(a.errors).toEqual([]);
  });
});

describe("type hints", () => {
  test("type hints are used by typechecker", () => {
    const a = new Analysis(
      "Main",
      `
        extern type Int
        pub let x: Int = 1.1
      `,
    );
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]!.description).toBeInstanceOf(TypeMismatch);
    expect(getTypes(a)).toEqual({
      x: "Int",
    });
  });

  test("type hints of fns are used by typechecker", () => {
    const a = new Analysis(
      "Main",
      `
        type T { C }
        pub let x: Fn() -> T = fn { 42 }
        `,
    );
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]!.description).toBeInstanceOf(TypeMismatch);
    expect(getTypes(a)).toEqual(
      expect.objectContaining({
        x: "Fn() -> T",
      }),
    );
  });

  test("type hints of fns are used by typechecker (args)", () => {
    const a = new Analysis(
      "Main",
      `
      extern type Bool
      extern type Int
      extern pub let (!): Fn(Bool) -> Bool
      pub let x: Fn(Bool) -> Int = fn x { !x }
      `,
    );
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]!.description).toBeInstanceOf(TypeMismatch);
    expect(getTypes(a)).toEqual(
      expect.objectContaining({
        x: "Fn(Bool) -> Int",
      }),
    );
  });

  test("_ type hints are ignored by typechecker", () => {
    const a = new Analysis(
      "Main",
      `
      extern type Int
      pub let x: _ = 1`,
    );
    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "Int",
    });
  });

  test.todo("vars type hints should be generalized", () => {
    const a = new Analysis("Main", "let x: a = 0");
    expect(a.errors).toHaveLength(1);
    expect(getTypes(a)).toEqual({
      x: "a",
    });
  });

  test.todo("unify generalized values", () => {
    const a = new Analysis("Main", "let f: Fn(ta) -> tb = fn x { x }");
    expect(a.errors[0]!.description).toBeInstanceOf(TypeMismatch);
    expect(getTypes(a)).toEqual({
      f: "Fn(ta) -> tb",
    });
  });

  test.todo("vars type hints are used by typechecker", () => {
    const a = new Analysis(
      "Main",
      "pub let eq: Fn(a, a, b) -> a = fn x, y, z { x }",
    );
    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      eq: "Fn(a, a, b) -> a",
    });
  });

  test("type hints instantiate polytypes", () => {
    const a = new Analysis(
      "Main",
      `
      extern type Int
      pub let f: Fn(Int) -> Int = fn x { x }
    `,
    );
    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      f: "Fn(Int) -> Int",
    });
  });

  // TODO resolve this
  test.todo("unknown types are ignored", () => {
    const a = new Analysis("Main", "pub let x: NotFound = 1");
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]!.description).toBeInstanceOf(UnboundType);
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
        range: rangeOf(a.source, "42"),
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

describe("list literal", () => {
  test("typecheck empty list", () => {
    const a = new Analysis("Main", `pub let lst = []`);

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      lst: "List<a>",
    });
  });

  test("typecheck singleton list as the value's type", () => {
    const a = new Analysis("Main", `pub let lst = [42]`);

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      lst: "List<Int>",
    });
  });

  test("typecheck many values", () => {
    const a = new Analysis("Main", `pub let lst = [0, 1, 2]`);

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      lst: "List<Int>",
    });
  });

  test("fail typechecking when values have different type", () => {
    const a = new Analysis("Main", `pub let lst = [0, 1, "not an int"]`);

    expect(a.errors).not.toEqual([]);
    expect(a.errors[0]!.description).toBeInstanceOf(TypeMismatch);
    expect(getTypes(a)).toEqual({
      lst: "List<Int>",
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

describe("unused locals checks", () => {
  test("detect unused let locals", () => {
    const a = new Analysis(
      "Main",
      `
      pub let f = {
        let unused_var = 42;
        0
      }
    `,
    );

    expect(a.errors).toEqual<ErrorInfo[]>([
      {
        range: rangeOf(a.source, "unused_var"),
        description: new UnusedVariable("unused_var", "local"),
      },
    ]);
  });

  test.todo("detect unused pattern match locals", () => {
    const a = new Analysis(
      "Main",
      `
    pub let a = match "something" {
      x => 42,
    }
  `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(UnusedVariable);
  });

  test.todo("detect unused private globals", () => {
    const a = new Analysis(
      "Main",
      `
    let x = 42
  `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(UnusedVariable);
  });

  test("do not detect unused globals when private vars are used", () => {
    const a = new Analysis(
      "Main",
      `
    let x = 42
    pub let y = x
  `,
    );

    expect(a.errors).toEqual([]);
  });
});

function getTypes(a: Analysis): Record<string, string> {
  const kvs = [...a.getPublicDeclarations()].map((decl) => {
    return [decl.binding.name, typeToString(a.getType(decl.binding))];
  });
  return Object.fromEntries(kvs);
}
