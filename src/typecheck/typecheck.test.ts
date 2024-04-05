import { describe, expect, test } from "vitest";
import { unsafeParse, UntypedImport } from "../parser";
import {
  Deps,
  typecheck,
  typecheckProject,
  TypedModule,
  typeToString,
} from ".";
import {
  ArityMismatch,
  BadImport,
  CyclicDefinition,
  DuplicateDeclaration,
  InvalidCatchall,
  InvalidPipe,
  InvalidTypeArity,
  NonExistingImport,
  OccursCheck,
  TypeMismatch,
  TypeParamShadowing,
  UnboundModule,
  UnboundType,
  UnboundTypeParam,
  UnboundVariable,
  UnimportedModule,
  UnusedExposing,
  UnusedImport,
  UnusedVariable,
} from "../errors";

test("infer int", () => {
  const [types, errors] = tc(`
    pub let x = 42
  `);

  expect(errors).toEqual([]);
  expect(types).toEqual({
    x: "Int",
  });
});

test("infer float", () => {
  const [types, errors] = tc(`
    pub let x = 42.2
  `);

  expect(errors).toEqual([]);
  expect(types).toEqual({
    x: "Float",
  });
});

test("infer a variable present in the context", () => {
  const [types, errors] = tc(
    `
    pub let x = 42
    pub let y = x
  `,
  );

  expect(errors).toEqual([]);
  expect(types).toEqual({
    x: "Int",
    y: "Int",
  });
});

test("infer a variable not present in the context", () => {
  const [types, errors] = tc(
    `
    pub let x = unbound_var
  `,
  );

  expect(errors).toHaveLength(1);
  expect(errors[0]?.description).toBeInstanceOf(UnboundVariable);
  expect((errors[0]!.description as UnboundVariable).ident).toBe("unbound_var");
  expect(types).toEqual({
    x: "a",
  });
});

test("typechecking previously defined vars", () => {
  const [types, errors] = tc(`
    pub let x = 42
    pub let y = x
  `);

  expect(errors).toEqual([]);
  expect(types).toEqual({
    x: "Int",
    y: "Int",
  });
});

test("forbid duplicate identifiers", () => {
  const [types, errors] = tc(`
    pub let x = 42
    pub let x = "override"

    pub let y = x
  `);

  expect(errors).toHaveLength(1);
  expect(errors[0]?.description).toBeInstanceOf(DuplicateDeclaration);
  expect(types).toEqual(
    expect.objectContaining({
      y: "Int",
    }),
  );
});

test("fn returning a constant", () => {
  const [types, errors] = tc(`
    pub let f = fn { 42 }
  `);

  expect(errors).toEqual([]);
  expect(types).toEqual({
    f: "Fn() -> Int",
  });
});

test("application return type", () => {
  const [types, errors] = tc(
    `
    extern type Bool
    extern pub let (>): Fn(a, a) -> Bool
    pub let x = 1 > 2
  `,
  );

  expect(errors).toEqual([]);
  expect(types).toEqual(
    expect.objectContaining({
      x: "Bool",
    }),
  );
});

test("application args should be typechecked", () => {
  const [, errors] = tc(
    `
    type T { C }
    type Ret {}

    extern pub let f: Fn(T, T) -> Ret
    pub let x = f(42, C)
  `,
  );

  expect(errors).toHaveLength(1);
  expect(errors[0]?.description).toBeInstanceOf(TypeMismatch);
});

test("application (pipe operator)", () => {
  const [types, errors] = tc(
    `
    type T { C }
    type T1 { C1 }
    type Ret {}

    extern pub let f: Fn(T, T1) -> Ret
    pub let x = C |> f(C1)
  `,
  );

  expect(errors).toEqual([]);
  expect(types).toEqual(
    expect.objectContaining({
      x: "Ret",
    }),
  );
});

test("invalid pipe operator", () => {
  const [, errors] = tc(
    `
    pub let x = 0 |> 1
  `,
  );

  expect(errors).toHaveLength(1);
  expect(errors[0]?.description).toBeInstanceOf(InvalidPipe);
});

test("typecheck fn args", () => {
  const [types] = tc(
    `
    extern type Int
    extern type Bool
    extern pub let (>): Fn(Int, Int) -> Bool
    pub let f = fn x, y { x > y }
  `,
  );

  expect(types).toEqual(
    expect.objectContaining({
      f: "Fn(Int, Int) -> Bool",
    }),
  );
});

test("typecheck if ret value", () => {
  const [types] = tc(
    `
    type Bool { True }
    let f =
      if True {
        0
      } else {
        1
      }
  `,
  );

  expect(types).toEqual({
    f: "Int",
  });
});

test("unify if clauses", () => {
  const [types] = tc(
    `
    type Bool { True }
    let f = fn x {
      if True {
        0
      } else {
        x
      }
    }
  `,
  );

  expect(types).toEqual({
    f: "Fn(Int) -> Int",
  });
});

test("typecheck if condition", () => {
  const [types] = tc(
    `
    let f = fn x {
      if x {
        0
      } else {
        0
      }
    }
  `,
  );

  expect(types).toEqual({
    f: "Fn(Bool) -> Int",
  });
});

test("typecheck let expr", () => {
  const [types, errs] = tc(
    `
    pub let x = {
      let y = 42;
      y
    }
  `,
  );

  expect(errs).toEqual([]);
  expect(types).toEqual({
    x: "Int",
  });
});

test("typecheck generic values", () => {
  const [types, errs] = tc(
    `
    pub let id = fn x { x }
  `,
  );

  expect(errs).toEqual([]);
  expect(types).toEqual({
    id: "Fn(a) -> a",
  });
});

test("generalize values", () => {
  const [types, errs] = tc(
    `
    pub let id = fn x { x }
    pub let v = id(42)
  `,
  );

  expect(errs).toEqual([]);
  expect(types).toEqual({
    id: "Fn(a) -> a",
    v: "Int",
  });
});

test("recursive let exprs", () => {
  const [types, errs] = tc(
    `
    pub let f = {
      let g = fn _ { g(1) };
      g
  }
  `,
  );

  expect(errs).toEqual([]);
  expect(types).toEqual({
    f: "Fn(Int) -> a",
  });
});

test("recursive let declarations", () => {
  const [types, errs] = tc(
    `
    pub let f = fn _ { f(42) }
  `,
  );

  expect(errs).toEqual([]);
  expect(types).toEqual({
    f: "Fn(Int) -> a",
  });
});

test.todo("let declarations in reverse order", () => {
  const [types, errs] = tc(
    `
    pub let a = b
    pub let b = 42
  `,
  );

  expect(errs).toEqual([]);
  expect(types).toEqual({
    a: "Int",
    b: "Int",
  });
});

test.todo("dependency cycle between let declarations in reverse order", () => {
  const [, errs] = tc(
    `
    pub let a = b
    pub let b = a
  `,
  );

  expect(errs).toHaveLength(1);
  expect(errs[0]?.description).toBeInstanceOf(CyclicDefinition);
});

test.todo(
  "dependency cycle between let declarations are permitted in thunks",
  () => {
    const [, errs] = tc(
      `
    pub let a = b
    pub let b = fn { a }
  `,
    );

    expect(errs).toEqual([]);
  },
);

test("unused locals", () => {
  const [, errs] = tc(
    `
    pub let f = {
      let unused_var = 42;
      0
    }
  `,
  );

  expect(errs).toHaveLength(1);
  expect(errs[0]?.description).toBeInstanceOf(UnusedVariable);
});

test("unused pattern match locals", () => {
  const [, errs] = tc(
    `
    pub let a = match "something" {
      x => 42,
    }
  `,
  );

  expect(errs).toHaveLength(1);
  expect(errs[0]?.description).toBeInstanceOf(UnusedVariable);
});

test("unused globals", () => {
  const [, errs] = tc(
    `
    let x = 42
  `,
  );

  expect(errs).toHaveLength(1);
  expect(errs[0]?.description).toBeInstanceOf(UnusedVariable);
});

test("unused globals does not trigger when private vars are used", () => {
  const [, errs] = tc(
    `
    let x = 42
    pub let y = x
  `,
  );

  expect(errs).toEqual([]);
});

test("closures with resursive bindings", () => {
  const [, errs] = tc(
    `
    pub let f = fn {
      fn { f }
    }
  `,
  );

  expect(errs).toHaveLength(1);
  expect(errs[0]?.description).toBeInstanceOf(OccursCheck);
});

describe("type hints", () => {
  test("type hints are used by typechecker", () => {
    const [types, errs] = tc(
      `
        extern type Int
        pub let x: Int = 1.1
      `,
    );
    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(TypeMismatch);
    expect(types).toEqual({
      x: "Int",
    });
  });

  test("type hints of fns are used by typechecker", () => {
    const [types, errs] = tc(
      `
        type T { C }
        pub let x: Fn() -> T = fn { 42 }
        `,
    );
    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(TypeMismatch);
    expect(types).toEqual(
      expect.objectContaining({
        x: "Fn() -> T",
      }),
    );
  });

  test("type hints of fns are used by typechecker (args)", () => {
    const [types, errs] = tc(
      `
      extern type Bool
      extern type Int
      extern pub let (!): Fn(Bool) -> Bool
      pub let x: Fn(Bool) -> Int = fn x { !x }
      `,
    );
    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(TypeMismatch);
    expect(types).toEqual(
      expect.objectContaining({
        x: "Fn(Bool) -> Int",
      }),
    );
  });

  test("_ type hints are ignored by typechecker", () => {
    const [types, errs] = tc(
      `
      extern type Int
      pub let x: _ = 1`,
    );
    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Int",
    });
  });

  test.todo("vars type hints should be generalized", () => {
    const [types, errs] = tc("let x: a = 0");
    expect(errs).toHaveLength(1);
    expect(types).toEqual({
      x: "a",
    });
  });

  test.todo("unify generalized values", () => {
    const [types, errs] = tc("let f: Fn(ta) -> tb = fn x { x }");
    expect(errs[0]!.description).toBeInstanceOf(TypeMismatch);
    expect(types).toEqual({
      f: "Fn(ta) -> tb",
    });
  });

  test.todo("vars type hints are used by typechecker", () => {
    const [types, errs] = tc("pub let eq: Fn(a, a, b) -> a = fn x, y, z { x }");
    expect(errs).toEqual([]);
    expect(types).toEqual({
      eq: "Fn(a, a, b) -> a",
    });
  });

  test("type hints instantiate polytypes", () => {
    const [types, errs] = tc(`
      extern type Int
      pub let f: Fn(Int) -> Int = fn x { x }
    `);
    expect(errs).toEqual([]);
    expect(types).toEqual({
      f: "Fn(Int) -> Int",
    });
  });

  test("unknown types are ignored", () => {
    const [types, errs] = tc("pub let x: NotFound = 1");
    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(UnboundType);
    expect(types).toEqual({
      x: "Int",
    });
  });
});

describe("custom types", () => {
  test("allows to use it as type hint", () => {
    const [types, errs] = tc(
      `
    extern type X
    extern pub let x: X

    type T { }
    pub let f: Fn(T) -> X = fn _ { x }
  `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      f: "Fn(T) -> X",
      x: "X",
    });
  });

  test("handles constructor without args nor params", () => {
    const [types, errs] = tc(`
    type T { C }
    pub let c = C
  `);

    expect(errs).toEqual([]);
    expect(types).toEqual({
      c: "T",
    });
  });

  test("generalize type constructors", () => {
    const [types, errs] = tc(
      `
      type Box<a> {
        Box(a),
        Nested(Box<a>)
      }
      
      pub let x = Nested(Box(42))
      pub let y = Nested(Box("abc"))
  `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Box<Int>",
      y: "Box<String>",
    });
  });

  test("handles constructor with one (non-parametric) arg", () => {
    const [types, errs] = tc(
      `
    extern type Int
    type T { C(Int) }
    pub let c = C
  `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      c: "Fn(Int) -> T",
    });
  });

  test("handles constructor with complex arg", () => {
    const [types, errs] = tc(
      `
    extern type Int
    type Option<a> { }
    type T {
      C(Option<Int>, Int)
    }
    pub let c = C
  `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      c: "Fn(Option<Int>, Int) -> T",
    });
  });

  test("handles constructor wrapping a function", () => {
    const [types, errs] = tc(
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

    expect(errs).toEqual([]);
    expect(types).toEqual({
      c: "Fn(Fn(A, B) -> C) -> T",
    });
  });

  test("handles types that do not exist", () => {
    const [, errs] = tc(
      `
    type T {
      C(NotFound)
    }
  `,
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(UnboundType);
  });

  test("checks arity in constructors", () => {
    const [, errs] = tc(
      `  
      type T<a> { }

      type T1<a, b> {
        C(T<a, b>)
      }
    `,
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(InvalidTypeArity);

    const desc = errs[0]?.description as InvalidTypeArity;
    expect(desc.expected).toEqual(1);
    expect(desc.got).toEqual(2);
  });

  test("add types to the type pool", () => {
    const [, errs] = tc(
      `
      type A {}
      type B { C(A) }
  `,
    );

    expect(errs).toEqual([]);
  });

  test("handles parametric types", () => {
    const [types, errs] = tc(
      `
        type Box<a, b> { C }
        pub let a = C
  `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      a: "Box<a, b>",
    });
  });

  test("allows using parametric types in constructors", () => {
    const [types, errs] = tc(
      `
        type T<a, b> { C(b) }
        pub let a = C
        pub let b = C(1)
  `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      a: "Fn(a) -> T<b, a>",
      b: "T<a, Int>",
    });
  });

  test("forbids unbound type params", () => {
    const [, errs] = tc(
      `
        type T { C(a) }
  `,
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(UnboundTypeParam);
  });

  test("doesn't allow shadowing type params", () => {
    const [, errs] = tc(
      `
        type Box<a, a> { }
  `,
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(TypeParamShadowing);
  });

  test("prevents catchall to be used in type args", () => {
    const [, errs] = tc(
      `
        type T { C(_) }
  `,
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(InvalidCatchall);
  });

  test("allows self-recursive type", () => {
    const [, errs] = tc(
      `
        type T { C(T) }
      `,
    );

    expect(errs).toEqual([]);
  });
});

describe("pattern matching", () => {
  test("typechecks matched expressions", () => {
    const [, errs] = tc(`pub let v = match unbound { }`);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(UnboundVariable);
  });

  test("typechecks clause return type", () => {
    const [, errs] = tc(`pub let v = match 0 { _ => unbound }`);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(UnboundVariable);
  });

  test("unifies clause return types", () => {
    const [, errs] = tc(`
    pub let _ = match 0 {
        _ => 0,
        _ => 0.0,
      }
    `);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(TypeMismatch);
  });

  test("infers return type", () => {
    const [types, errs] = tc(`
      pub let x = match 1.1 { _ => 0 }
    `);
    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Int",
    });
  });

  test("infers matched type when is a lit", () => {
    const [types, errs] = tc(`
    pub let f = fn x {
        match x {
          42 => 0,
        }
      }
    `);

    expect(errs).toEqual([]);
    expect(types).toEqual({
      f: "Fn(Int) -> Int",
    });
  });

  test("infers matched type when there are no args", () => {
    const [types, errs] = tc(`
      type T { C }

      pub let f = fn x {
        match x {
          C => 0,
        }
      }
    `);
    expect(errs).toEqual([]);
    expect(types).toEqual({
      f: "Fn(T) -> Int",
    });
  });

  test("infers matched type when is qualified", () => {
    const [A] = tcProgram(
      "A",
      `
      pub(..) type T { T }
    `,
    );

    const [types, errs] = tc(
      `
      import A.{T(..)}

      pub let f = fn x {
        match x {
          A.T => 0,
        }
      }
    `,
      {
        A,
      },
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      f: "Fn(T) -> Int",
    });
  });

  test("infers matched type when there are concrete args", () => {
    const [types, errs] = tc(
      `
      type Bool { }
      type T { C(Bool) }

      pub let f = fn x {
        match x {
          C(_) => 0,
        }
      }
    `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      f: "Fn(T) -> Int",
    });
  });

  test("typechecks constructor args", () => {
    const [, errs] = tc(
      `
      type T<a> { C(a, a, a) }

      pub let f = fn x {
        match x {
          C(_, _) => 0,
        }
      }
    `,
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(ArityMismatch);
    const err = errs[0]!.description as ArityMismatch;
    expect(err.expected).toEqual(3);
    expect(err.got).toEqual(2);
  });

  test("infers nested types in p match", () => {
    const [types, errs] = tc(
      `
      type Bool {
        True,
      }

      type Box<a> {
        Make(a),
      }

      pub let f = fn x {
        match x {
          Make(True) => 0,
        }
      }
    `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      f: "Fn(Box<Bool>) -> Int",
    });
  });

  test("infers nested types in p match, matching on a zero-args variant", () => {
    const [types, errs] = tc(
      `

      type Option<a> {
        None,
        Some(a),
      }

      pub let f = fn x {
        match x {
          None => 2,
        }
      }
    `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      f: "Fn(Option<a>) -> Int",
    });
  });

  test("use pattern matching bound vars", () => {
    const [types, errs] = tc(`pub let x = match 0 { a => a }`);

    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Int",
    });
  });

  test("use pattern matching bound vars in nested types", () => {
    const [types, errs] = tc(`
      type Boxed<a> { Boxed(a) }

      pub let x = match Boxed(42) {
        Boxed(a) => a
      }
    `);

    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Int",
    });
  });

  test("return error on wrong matched type", () => {
    const [, errs] = tc(`
      type X { X }
      pub let v = match 42 {
        X => 0
      }
    `);

    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(TypeMismatch);
  });

  test("return error on unbound types", () => {
    const [, errs] = tc(`
      pub let v = fn x {
        match x {
          NotFound => 0
        }
      }
    `);

    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(UnboundVariable);
  });

  test("infers fn match param type", () => {
    const [types, errs] = tc(`
    extern type T
    type Box { Boxed(T) }

    pub let f = fn Boxed(n) { n }
  `);

    expect(errs).toEqual([]);
    expect(types).toEqual({
      f: "Fn(Box) -> T",
    });
  });

  test("infers let match type", () => {
    const [types, errs] = tc(`
    extern type T
    type Box { Boxed(T) }

    pub let f = fn box {
      let Boxed(n) = box;
      n
    }
  `);

    expect(errs).toEqual([]);
    expect(types).toEqual({
      f: "Fn(Box) -> T",
    });
  });
});

describe("prelude", () => {
  test("intrinsics' types are not visible by default", () => {
    const [, errs] = tc(`
     pub let x : Int = 0
    `);

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(UnboundType);
  });

  test("checks extern types", () => {
    const [, errs] = tc(`
     extern type ExtType
     extern pub let x : ExtType
     pub let y: ExtType = x
    `);

    expect(errs).toEqual([]);
  });

  test("typechecks extern values", () => {
    const [types, errs] = tc(
      `
     type Unit { }
     extern pub let x : Unit
     pub let y = x
    `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual(
      expect.objectContaining({
        y: "Unit",
      }),
    );
  });
});

describe("modules", () => {
  test("implicitly imports values of the modules in the prelude", () => {
    const [A] = tcProgram(
      "A",
      `
      pub let x = 42
    `,
    );

    const [moduleB] = tc(
      `
      let y = x
    `,
      { A },
      [
        {
          span: [0, 0],
          ns: "A",
          exposing: [{ type: "value", name: "x", span: [0, 0] }],
        },
      ],
    );

    expect(moduleB).toEqual({
      y: "Int",
    });
  });

  test("implicitly imports types of the modules in the prelude", () => {
    const [A] = tcProgram(
      "A",
      `
      type MyType {}
    `,
    );

    const [, errs] = tc(
      `
      let x: Fn(MyType) -> MyType = fn x { x }
    `,
      { A },
      [
        {
          span: [0, 0],
          ns: "A",
          exposing: [
            { type: "type", name: "MyType", exposeImpl: false, span: [0, 0] },
          ],
        },
      ],
    );
    expect(errs).toEqual(errs);
  });

  test("implicitly imports variants of the modules in the prelude", () => {
    const [A] = tcProgram(
      "A",
      `
      pub(..) type MyType { A }
    `,
    );

    const [types, errs] = tc(
      `
      pub let x = A
    `,
      { A },
      [
        {
          span: [0, 0],
          ns: "A",
          exposing: [
            { type: "type", name: "MyType", exposeImpl: true, span: [0, 0] },
          ],
        },
      ],
    );
    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "MyType",
    });
  });

  test("handles nested type references from other modules", () => {
    const [A] = tcProgram(
      "A",
      `
      pub(..) type T { T }
      pub(..) type Boxed { Boxed(T) }
    `,
    );

    const [types, errs] = tc(
      `
      import A.{Boxed(..), T(..)}
      pub let x = Boxed(T)
    `,
      { A },
    );
    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Boxed",
    });
  });

  test("detects unused imports when there are not exposed vars", () => {
    const [A] = tcProgram("A", ``);
    const [, errs] = tc(`import A`, { A });

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(UnusedImport);
  });

  test("detects unused exposed values", () => {
    const [A] = tcProgram("A", `pub let x = 42`);
    const [, errs] = tc(`import A.{x}`, { A });

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(UnusedExposing);
  });

  test("detects unused types", () => {
    const [A] = tcProgram("A", `pub type T { }`);
    const [, errs] = tc(`import A.{T}`, { A });

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(UnusedExposing);
  });

  test("handles variants imports", () => {
    const [A] = tcProgram(
      "A",
      `
      pub(..) type MyType { Constr }
    `,
    );

    const [types, errs] = tc(
      `
      import A
      pub let x = A.Constr
    `,
      { A },
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "MyType",
    });
  });

  test("handles nested imports", () => {
    const [Mod] = tcProgram(
      "Mod",
      `
      pub let x = 42
    `,
    );

    const [types, errs] = tc(
      `
      import A/B/C
      pub let x = A/B/C.x
    `,
      { "A/B/C": Mod },
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Int",
    });
  });

  test("allow importing types (unqualified)", () => {
    const [Mod] = tcProgram("Mod", `pub type Example { }`);

    const [types, errs] = tc(
      `
      import Mod.{Example}
      extern pub let x: Example
    `,
      { Mod },
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Example",
    });
  });

  test("allow importing types (qualified)", () => {
    const [Mod] = tcProgram("Mod", `pub type Example { }`);
    const [types, errs] = tc(
      `
      import Mod
      extern pub let x: Mod.Example
    `,
      { Mod },
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Example",
    });
  });

  test("allow using imported types in match patterns", () => {
    const [Mod] = tcProgram("Mod", `pub(..) type T { Constr }`);
    const [, errs] = tc(
      `
      import Mod.{T(..)}
      pub let x = match Constr {
        Constr => 0,
      }
    `,
      { Mod },
    );

    expect(errs).toEqual([]);
  });

  test("error when import a non-existing module", () => {
    const [, errs] = tc(`import ModuleNotFound`);

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(UnboundModule);
  });

  test("error when importing a non-existing type", () => {
    const [Mod] = tcProgram("Mod", ``);
    const [, errs] = tc(`import Mod.{NotFound}`, { Mod });

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(NonExistingImport);
  });

  test("error when importing a type the is not pub", () => {
    const [Mod] = tcProgram("Mod", `type PrivateType {}`);
    const [, errs] = tc(`import Mod.{PrivateType}`, { Mod });

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(NonExistingImport);
  });

  test("error when importing a non-existing value", () => {
    const [Mod] = tcProgram("Mod", ``);
    const [, errs] = tc(`import Mod.{not_found}`, { Mod });

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(NonExistingImport);
  });

  test("error when importing a private value", () => {
    const [Mod] = tcProgram("Mod", `let not_found = 42`);
    const [, errs] = tc(`import Mod.{not_found}`, { Mod });

    expect(
      errs.some((e) => e.description instanceof NonExistingImport),
    ).toBeTruthy();
  });

  test("qualified imports should not work on priv functions", () => {
    const [Mod] = tcProgram("Mod", `let not_found = 42`);
    const [, errs] = tc(
      `
      import Mod
      pub let v = Mod.not_found
    `,
      { Mod },
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(NonExistingImport);
  });

  test("qualified imports should not work on priv constructors", () => {
    const [Mod] = tcProgram("Mod", `pub type T { A }`);
    const [, errs] = tc(
      `
      import Mod
      pub let v = Mod.A
    `,
      { Mod },
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(NonExistingImport);
  });

  test("qualified imports should not work on priv types", () => {
    const [Mod] = tcProgram("Mod", `type PrivateType {}`);
    const [, errs] = tc(
      `
      import Mod
      extern pub let x: Mod.PrivateType
    `,
      { Mod },
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(UnboundType);
  });

  test("error when expose impl is run on a extern type", () => {
    const [Mod] = tcProgram("Mod", `extern pub type ExternType`);
    const [, errs] = tc(`import Mod.{ExternType(..)}`, { Mod });

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(BadImport);
  });

  test("error when expose impl is run on a opaque type", () => {
    // Note it is `pub` instead of `pub(..)`
    const [Mod] = tcProgram("Mod", `pub type T {}`);
    const [, errs] = tc(`import Mod.{T(..)}`, { Mod });

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(BadImport);
  });

  test("error when qualifier is not an imported module", () => {
    const [, errs] = tc(`pub let x = NotImported.value`);

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(UnimportedModule);
  });

  test("types from different modules with the same name aren't treated the same", () => {
    const [Mod] = tcProgram("Mod", `pub(..) type T { Constr }`);
    const [, errs] = tc(
      `
      import Mod
      type T { Constr }
      pub let t: T = Mod.Constr
    `,
      { Mod },
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(TypeMismatch);
  });
});

describe("typecheck project", () => {
  test("single import", () => {
    const project = typecheckProject(
      {
        A: {
          package: "kestrel_core",
          module: unsafeParse(`
        pub let x = 42
      `),
        },
        B: {
          package: "kestrel_core",
          module: unsafeParse(`
        import A.{x}
        pub let y = x
      `),
        },
      },
      [],
    );

    expect(project.A).not.toBeUndefined();
    const [pA, errA] = project.A!;
    expect(errA).toEqual([]);
    expect(programTypes(pA)).toEqual({
      x: "Int",
    });

    expect(project.B).not.toBeUndefined();
    const [pB, errB] = project.B!;
    expect(errB).toEqual([]);
    expect(programTypes(pB)).toEqual({
      y: "Int",
    });
  });

  test("qualified imports", () => {
    const project = typecheckProject(
      {
        A: {
          package: "kestrel_core",
          module: unsafeParse(`
        pub let x = 42
      `),
        },
        B: {
          package: "kestrel_core",
          module: unsafeParse(`
        import A
        pub let y = A.x
      `),
        },
      },
      [],
    );

    expect(project.B).not.toBeUndefined();
    const [pB, errB] = project.B!;
    expect(errB).toEqual([]);
    expect(programTypes(pB)).toEqual({
      y: "Int",
    });
  });
});

test("type error when main has not type Task<Unit>", () => {
  const [_, errors] = tc(`pub let main = "not-task-type"`);
  expect(errors).toHaveLength(1);
  expect(errors[0]?.description).toBeInstanceOf(TypeMismatch);
});

function tcProgram(
  ns: string,
  src: string,
  deps: Deps = {},
  prelude: UntypedImport[] = [],
) {
  const parsedProgram = unsafeParse(src);
  return typecheck(ns, parsedProgram, deps, prelude);
}

function tc(src: string, deps: Deps = {}, prelude: UntypedImport[] = []) {
  const [typed, errors] = tcProgram("Main", src, deps, prelude);
  return [programTypes(typed) as Record<string, string>, errors] as const;
}

function programTypes(typed: TypedModule): Record<string, string> {
  const kvs = typed.declarations.map((decl) => [
    decl.binding.name,
    typeToString(decl.binding.$.asType()),
  ]);

  return Object.fromEntries(kvs);
}
