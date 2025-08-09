import { describe, expect, test } from "vitest";
import { Position, Range, Import, unsafeParse } from "../parser";
import {
  Deps as IDeps,
  resetTraitsRegistry,
  typecheck,
  typecheckProject,
  TypedModule,
  typeToString,
} from ".";
import { ErrorInfo } from "../errors";
import * as err from "../errors";
import { TraitImpl } from "./defaultImports";

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
  expect(errors[0]?.description).toBeInstanceOf(err.UnboundVariable);
  expect((errors[0]!.description as err.UnboundVariable).ident).toBe(
    "unbound_var",
  );
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
  expect(errors[0]?.description).toBeInstanceOf(err.DuplicateDeclaration);
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
  expect(errors[0]?.description).toBeInstanceOf(err.TypeMismatch);
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
  expect(errors[0]?.description).toBeInstanceOf(err.InvalidPipe);
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

test("let declarations in reverse order", () => {
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
  expect(errs[0]?.description).toBeInstanceOf(err.CyclicDefinition);
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
  expect(errs[0]?.description).toBeInstanceOf(err.UnusedVariable);
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
  expect(errs[0]?.description).toBeInstanceOf(err.UnusedVariable);
});

test("unused globals", () => {
  const [, errs] = tc(
    `
    let x = 42
  `,
  );

  expect(errs).toHaveLength(1);
  expect(errs[0]?.description).toBeInstanceOf(err.UnusedVariable);
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
  expect(errs[0]?.description).toBeInstanceOf(err.OccursCheck);
});

test("does not refer to imported values when qualifying", () => {
  const [T1] = typecheck(
    "T1",
    unsafeParse(`
        pub let x = 42
      `),
    {},
    [],
  );

  const [, errs] = tc(
    `
      import T1.{x}
      pub let a = Main.x

      pub let e = x
    `,
    { T1 },
  );

  expect(errs).toEqual<ErrorInfo[]>([
    expect.objectContaining({
      description: new err.UnboundVariable("x"),
    }),
  ]);
});

test("does not refer to imported types when qualifying", () => {
  const [T1] = typecheck(
    "T1",
    unsafeParse(`
        pub(..) type T1 { X }
      `),
    {},
    [],
  );

  const [, errs] = tc(
    `
      import T1.{T1(..)}
      pub let a = Main.X

      pub let b = X
    `,
    { T1 },
  );

  expect(errs).toEqual<ErrorInfo[]>([
    expect.objectContaining({
      description: new err.UnboundVariable("X"),
    }),
  ]);
});

describe("list literal", () => {
  test("typecheck empty list", () => {
    const [types, errs] = tc(`pub let lst = []`);

    expect(errs).toEqual([]);
    expect(types).toEqual({
      lst: "List<a>",
    });
  });

  test("typecheck singleton list as the value's type", () => {
    const [types, errs] = tc(`pub let lst = [42]`);

    expect(errs).toEqual([]);
    expect(types).toEqual({
      lst: "List<Int>",
    });
  });

  test("typecheck many values", () => {
    const [types, errs] = tc(`pub let lst = [0, 1, 2]`);

    expect(errs).toEqual([]);
    expect(types).toEqual({
      lst: "List<Int>",
    });
  });

  test("fail typechecking when values have different type", () => {
    const [types, errs] = tc(`pub let lst = [0, 1, "not an int"]`);

    expect(errs).not.toEqual([]);
    expect(errs[0]!.description).toBeInstanceOf(err.TypeMismatch);
    expect(types).toEqual({
      lst: "List<Int>",
    });
  });
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
    expect(errs[0]!.description).toBeInstanceOf(err.TypeMismatch);
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
    expect(errs[0]!.description).toBeInstanceOf(err.TypeMismatch);
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
    expect(errs[0]!.description).toBeInstanceOf(err.TypeMismatch);
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
    expect(errs[0]!.description).toBeInstanceOf(err.TypeMismatch);
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
    expect(errs[0]!.description).toBeInstanceOf(err.UnboundType);
    expect(types).toEqual({
      x: "Int",
    });
  });
});

describe("traits", () => {
  test("fails to typecheck when a required trait is not implemented", () => {
    const [types, errs] = tc(
      `
        extern type String
        extern pub let show: Fn(a) -> String where a: Show
        pub let x = show(42) // note that 'Int' doesn't implement 'Show' in this test
      `,
    );
    expect(errs).toHaveLength(1);
    expect(types).toEqual({
      show: "Fn(a) -> String where a: Show",
      x: "String",
    });
  });

  test("succeeds to typecheck when a required trait is not implemented", () => {
    const [, errs] = tc(
      `
        extern type String
        extern pub let show: Fn(a) -> String where a: Show
        pub let x = show(42)
      `,
      {},
      [],
      [{ moduleName: "Int", typeName: "Int", trait: "Show" }],
    );
    expect(errs).toEqual([]);
  });

  test("propagates the trait constraint", () => {
    const [types, errs] = tc(
      `
        extern type String
        extern let show: Fn(a) -> String where a: Show

        pub let use_show = fn value {
          show(value)
        }
      `,
    );
    expect(errs).toEqual([]);
    expect(types).toEqual({
      show: "Fn(a) -> String where a: Show",
      use_show: "Fn(a) -> String where a: Show",
    });
  });

  test("fails to typecheck when unify occurs later", () => {
    const [, errs] = tc(
      `
        extern type String
        extern let show: Fn(a) -> String where a: Show

        extern type Int
        extern pub let (+): Fn(Int, Int) -> Int
        pub let f = fn x {
          let _ = show(x);
          x + 1
        }
      `,
    );
    expect(errs).not.toEqual([]);
  });

  test("infers multiple traits", () => {
    const [types, errs] = tc(
      `
        extern type Unit
        extern let show: Fn(a) -> Unit where a: Show
        extern let eq: Fn(a) -> Unit where a: Eq

        pub let f = fn x {
          let _ = show(x);
          eq(x)
        }
      `,
    );
    expect(errs).toEqual([]);
    expect(types).toEqual(
      expect.objectContaining({
        f: "Fn(a) -> Unit where a: Eq + Show",
      }),
    );
  });

  test("does not break generalization", () => {
    const [types, errs] = tc(
      `
        extern type Unit
        extern let show: Fn(a) -> Unit where a: Show
        extern let eq: Fn(a) -> Unit where a: Eq

        pub let f = fn x {
          let _ = show(x);
          let _ = eq(x);
          0
        }
      `,
    );
    expect(errs).toEqual([]);
    expect(types).toEqual(
      expect.objectContaining({
        eq: "Fn(a) -> Unit where a: Eq",
        show: "Fn(a) -> Unit where a: Show",
      }),
    );
  });

  test("is able to derive Eq trait in ADTs with only a singleton", () => {
    const [, errs] = tc(
      `
        extern let take_eq: Fn(a) -> a where a: Eq
        type MyType {
          Singleton
        }

        pub let example = take_eq(Singleton)
      `,
    );

    expect(errs).toEqual([]);
  });

  test("does not derive Eq trait in ADTs when at least one argument", () => {
    const [, errs] = tc(
      `
        extern type NotEq
        extern let take_eq: Fn(a) -> a where a: Eq

        pub(..) type MyType {
          Singleton,
          Box(NotEq)
        }

        pub let example = take_eq(Singleton)
      `,
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(err.TraitNotSatified);
  });

  test("derives Eq even when constructors have arguments that derive Eq", () => {
    const [, errs] = tc(
      `
        type EqType { }

        extern let take_eq: Fn(a) -> a where a: Eq

        pub(..) type MyType {
          Singleton,
          Box(EqType)
        }

        pub let example = take_eq(Singleton)
      `,
    );

    expect(errs).toEqual([]);
  });

  test("requires deps to derive Eq in order to derive Eq", () => {
    const [, errs] = tc(
      `
        extern let take_eq: Fn(a) -> a where a: Eq

        pub(..) type MyType<a> {
          Box(a)
        }

        extern type NotEq
        extern let my_type: MyType<NotEq>

        pub let example = take_eq(my_type)
      `,
    );

    expect(errs).toHaveLength(1);
  });

  test("derives Eq when dependencies derive Eq", () => {
    const [, errs] = tc(
      `
        extern let take_eq: Fn(a) -> a where a: Eq

        type IsEq { }

        pub(..) type Option<a> {
          Some(a),
          None,
        }

        extern let is_eq: Option<IsEq>

        pub let example = take_eq(is_eq)
      `,
    );

    expect(errs).toEqual([]);
  });

  test("derives in self-recursive types", () => {
    const [, errs] = tc(
      `
        extern let take_eq: Fn(a) -> a where a: Eq

        pub(..) type Rec<a> {
          End,
          Nest(Rec<a>),
        }

        pub let example = take_eq(End)
      `,
    );

    expect(errs).toEqual([]);
  });

  test("derives in self-recursive types (nested)", () => {
    const [, errs] = tc(
      `
        type Box<a> { Box(a) }
        extern let take_eq: Fn(a) -> a where a: Eq

        pub(..) type Rec<a> {
          End,
          Nest(Box<Rec<a>>),
        }

        pub let example = take_eq(End)
      `,
    );

    expect(errs).toEqual([]);
  });

  describe("auto deriving for struct", () => {
    test("is able to derive Eq in empty structs", () => {
      const [, errs] = tc(
        `
          extern let take_eq: Fn(a) -> a where a: Eq
  
          type MyType struct { }
  
          pub let example = take_eq(MyType { })
        `,
      );

      expect(errs).toEqual([]);
    });

    test("is able to derive Show in empty structs", () => {
      const [, errs] = tc(
        `
          extern let take_shoq: Fn(a) -> a where a: Show
  
          type MyType struct { }
  
          pub let example = take_shoq(MyType { })
        `,
      );

      expect(errs).toEqual([]);
    });

    test("is able to derive Eq in structs where all the fields are Eq", () => {
      const [, errs] = tc(
        `
          extern let take_eq: Fn(a) -> a where a: Eq
          type EqT { EqT }
  
          type MyType struct {
            x: EqT
          }
  
          pub let example = take_eq(MyType { x: EqT })
        `,
      );

      expect(errs).toEqual([]);
    });

    test("is not able to derive Eq in structs where at least a fields is not Eq", () => {
      const [, errs] = tc(
        `
          extern let take_eq: Fn(a) -> a where a: Eq
  
          extern type NotEq
          extern let x: NotEq
  
          type MyType struct {
            x: NotEq
          }
  
          pub let example = take_eq(MyType { x: x })
        `,
      );

      expect(errs).toHaveLength(1);
      expect(errs[0]?.description).toBeInstanceOf(err.TraitNotSatified);
    });

    test("requires struct params to be Eq when they appear in struct, for it to be derived", () => {
      const [types, errs] = tc(
        `
          extern let take_eq: Fn(a) -> a where a: Eq
  
          type MyType<a, b> struct {
            x: b,
          }
  
          pub let example = fn x {
            take_eq(MyType { x: x })
          }
        `,
      );

      expect(errs).toEqual([]);
      expect(types).toEqual({
        example: "Fn(a) -> MyType<b, a> where a: Eq",
        take_eq: "Fn(a) -> a where a: Eq",
      });
    });

    test("derives deps in recursive types", () => {
      // TODO assertion
      const [, errs] = tc(
        `
          type Option<a> { None, Some(a) }

          extern let take_eq: Fn(a) -> a where a: Eq
  
          type Rec<a> struct {
            field: Option<Rec<a>>,
          }

          pub let example = {
            take_eq(Rec {
              field: Some(Rec {
                field: None
              })
            })
          }
        `,
      );

      expect(errs).toEqual([]);
    });
  });

  test("fails to derives in self-recursive types when not derivable (nested)", () => {
    const [, errs] = tc(
      `
        type Box<a> { Box(a) }
        extern let take_eq: Fn(a) -> a where a: Eq

        extern type NotEq
        pub(..) type Rec<a> {
          End,
          Nest(Box<Rec<a>>, NotEq),
        }

        pub let example = take_eq(End)
      `,
    );

    expect(errs).not.toEqual([]);
  });

  test("forbid ambiguous instantiations", () => {
    const [, errs] = tc(`
    extern let take_default: Fn(a) -> x where a: Default
    extern let default: a where a: Default
    pub let forbidden = take_default(default)
`);

    expect(errs).not.toEqual([]);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toEqual(
      new err.AmbiguousTypeVar("Default", "Fn(b) -> a where b: Default"),
    );
  });

  test("allow non-ambiguos instantiations", () => {
    const [, errs] = tc(
      `
    extern type X

    extern let take_x: Fn(X) -> X
    extern let default: a where a: Default
    pub let forbidden = take_x(default)
`,
      {},
      [],
      [{ trait: "Default", moduleName: "Main", typeName: "X" }],
    );

    expect(errs).toEqual([]);
  });

  test("allow non-ambiguous instantiations when setting let type", () => {
    const [, errs] = tc(
      `
    extern type X
    extern let default: a where a: Default

    pub let legal: X = default
`,
      {},
      [],
      [{ trait: "Default", moduleName: "Main", typeName: "X" }],
    );

    expect(errs).toEqual([]);
  });

  test("repro", () => {
    const [, errs] = tc(
      `
      type List<a> { Nil, Cons(a, List<a>) }

      type Bool { True, False }
      type Option<a> { None, Some(a) }

      extern let find: Fn(List<a>, Fn(a) -> Bool) -> Option<a>
      extern let (==): Fn(a, a) -> Bool where a: Eq

      pub let res = None == find(Nil, fn _ {
        False
      })
    `,
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(err.AmbiguousTypeVar);
  });

  test("allow ambiguous type vars in let exprs", () => {
    const [, errs] = tc(
      `
      extern type String
      extern let show: Fn(a) -> String where a: Show

      pub let e = {
        let _ = fn s {
          show(s)
        };
        42
      }
    `,
    );

    expect(errs).toHaveLength(0);
  });

  test("do not leak allowed instantiated vars when preventing ambiguous vars", () => {
    const [, errs] = tc(
      `
      extern type String
      extern let show: Fn(a) -> String where a: Show
      extern let showable: a where a: Show

      pub let e = {
        let showable1 = showable;
        let _ = show(showable1);
        42
      }
    `,
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(err.AmbiguousTypeVar);
  });

  test("do not emit ambiguos type error when variable is unbound", () => {
    const [, errs] = tc(
      `
    extern type X
    extern let show: Fn(a) -> X where a: Default

    pub let x = show(unbound_var)
`,
      {},
      [],
      [{ trait: "Default", moduleName: "Main", typeName: "X" }],
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(err.UnboundVariable);
  });

  // TODO Skip until type sigs are fixed
  test.todo("forbid ambiguous instantiations within args", () => {
    const [, errs] = tc(
      `
      extern type Option<a>
      extern let default: a where a: Default
      pub let forbidden: Option<a> = default
  `,
      {},
      [],
      [
        {
          moduleName: "Main",
          typeName: "Option",
          trait: "Default",
          deps: [["Default"]],
        },
      ],
    );

    expect(errs).not.toEqual([]);
    expect(errs.length).toBe(1);
    expect(errs[0]!.description).toEqual(
      new err.AmbiguousTypeVar("Default", "Option<a> where a: Default"),
    );
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
    expect(errs[0]?.description).toBeInstanceOf(err.UnboundType);
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
    expect(errs[0]?.description).toBeInstanceOf(err.InvalidTypeArity);

    const desc = errs[0]?.description as err.InvalidTypeArity;
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
    expect(errs[0]!.description).toBeInstanceOf(err.UnboundTypeParam);
  });

  test("doesn't allow shadowing type params", () => {
    const [, errs] = tc(
      `
        type Box<a, a> { }
  `,
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(err.TypeParamShadowing);
  });

  test("prevents catchall to be used in type args", () => {
    const [, errs] = tc(
      `
        type T { C(_) }
  `,
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(err.InvalidCatchall);
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

describe("struct", () => {
  test("allow creating types", () => {
    const [, errs] = tc(`
      type Person struct { }

      extern pub let p: Person
    `);

    expect(errs).toHaveLength(0);
  });

  test("allow recursive types", () => {
    const [, errs] = tc(`
      extern type List<a>
      type Person struct {
        friends: List<Person>,
      }
    `);

    expect(errs).toHaveLength(0);
  });

  test("allow accessing a type's field", () => {
    const [types, errs] = tc(`
      extern type String

      type Person struct {
        name: String
      }

      extern let p: Person

      pub let p_name = p.name
    `);

    expect(errs).toEqual([]);
    expect(types).toEqual({
      p: "Person",
      p_name: "String",
    });
  });

  test("infer type when accessing known field", () => {
    const [types, errs] = tc(`
      extern type String

      type Person struct {
        name: String
      }

      pub let p_name = fn p { p.name }
    `);

    expect(errs).toEqual([]);
    expect(types).toEqual({
      p_name: "Fn(Person) -> String",
    });
  });

  test("do not allow invalid field access", () => {
    const [types, errs] = tc(`
      extern type String
      type Person struct {
        name: String
      }

      extern let p: Person
      pub let invalid = p.invalid_field
    `);

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toEqual(
      new err.InvalidField("Person", "invalid_field"),
    );
    expect(types).toEqual({
      p: "Person",
      invalid: "a",
    });
  });

  test("handle resolution of other modules' fields", () => {
    const [Person] = tcProgram(
      "Person",
      `
      extern type String
      pub(..) type Person struct {
        name: String
      }
    `,
    );

    const [types, errs] = tc(
      `
      import Person.{Person(..)}
      pub let name = fn p { p.name }
    `,
      { Person },
    );

    expect(errs).toHaveLength(0);
    expect(types).toEqual({
      name: "Fn(Person) -> String",
    });
  });

  test("forbid unknown field on unbound value", () => {
    const [, errs] = tc(`pub let f = fn p { p.invalid_field }`);

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toEqual(
      new err.InvalidField("a", "invalid_field"),
    );
  });

  test("prevent resolution of other modules' fields when import is not (..)", () => {
    const [Person] = tcProgram(
      "Person",
      `
      extern type String
      pub(..) type Person struct {
        name: String
      }
    `,
    );

    const [, errs] = tc(
      `
      import Person.{Person}

      extern pub let x: Person // <- this prevents UnusedExposing err

      pub let name = fn p { p.name }
    `,
      { Person },
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(err.InvalidField);
  });

  test.todo("emit bad import if trying to import(..) private fields");

  test("allow accessing fields in other modules if public", () => {
    const [Person] = tcProgram(
      "Person",
      `
      extern type String
      pub(..) type Person struct {
        name: String
      }
    `,
    );

    const [types, errs] = tc(
      `
      import Person.{Person}

      extern pub let p: Person

      pub let name = p.name 
    `,
      { Person },
    );

    expect(errs).toHaveLength(0);
    expect(types).toEqual({
      p: "Person",
      name: "String",
    });
  });

  test("allow accessing fields in same module with qualified field syntax", () => {
    const [types, errs] = tc(
      `
        extern type String
        type Person struct {
          name: String
        }

        pub let name = fn p {
          p.Person#name
        }
    `,
    );

    expect(errs).toHaveLength(0);
    expect(types).toEqual({
      name: "Fn(Person) -> String",
    });
  });

  test.todo(
    "emit err when field accessed with qualified syntax is invalid",
    () => {
      const [, errs] = tc(
        `
        type Person struct { }

        pub let name = fn p {
          p.Person#invalid_field
        }
    `,
      );

      expect(errs).toHaveLength(1);
      expect(errs[0]?.description).toEqual(
        new err.InvalidField("Person", "invalid_field"),
      );
    },
  );

  test.todo(
    "allow accessing fields in other modules with qualified field syntax",
    () => {
      const [Person] = tcProgram(
        "Person",
        `
      extern type String
      pub(..) type Person struct {
        name: String
      }
    `,
      );

      const [types, errs] = tc(
        `
      import Person.{Person}

      pub let name = fn p {
        p.Person#name
      }
    `,
        { Person },
      );

      expect(errs).toHaveLength(0);
      expect(types).toEqual({
        name: "Fn(Person) -> String",
      });
    },
  );

  test.todo("emit error when struct of qualified field does not exist", () => {
    const [, errs] = tc(
      `
      pub let name = fn p {
        p.InvalidType#name
      }
    `,
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toEqual(new err.UnboundType("InvalidType"));
  });

  test.todo("emit error when qualified field does not exist", () => {
    const [Person] = tcProgram(
      "Person",
      `
        pub(..) type Person struct {}
  `,
    );

    const [, errs] = tc(
      `
      import Person.{Person}
      pub let name = fn p {
        p.Person#invalid_field
      }
    `,
      { Person },
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toEqual(
      new err.InvalidField("Person", "invalid_field"),
    );
  });

  test.todo("emit error when qualified field is private", () => {
    const [Person] = tcProgram(
      "Person",
      `
        extern type Int
        pub type Person struct {
          private_field: Int
        }
  `,
    );

    const [, errs] = tc(
      `
      import Person.{Person}
      pub let name = fn p {
        p.Person#private_field
      }
    `,
      { Person },
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toEqual(
      new err.InvalidField("Person", "private_field"),
    );
  });

  test("emit InvalidField if trying to access private fields", () => {
    const [Person] = tcProgram(
      "Person",
      `
      extern type String
      pub type Person struct { // note fields are  private
        name: String
      }
    `,
    );

    const [, errs] = tc(
      `
      import Person.{Person}

      extern pub let p: Person

      pub let name = p.name 
    `,
      { Person },
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(err.InvalidField);
  });

  test("allow creating structs", () => {
    const [types, errs] = tc(
      `
        type X { X }

        pub type Struct struct {
          x: X
        }

        pub let s = Struct {
          x: X
        }
    `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      s: "Struct",
    });
  });

  test("typecheck params in struct types", () => {
    const [types, errs] = tc(
      `
        type Person<a, b, c> struct { }
        extern pub let p: Person
    `,
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(err.InvalidTypeArity);
    expect(types).toEqual({
      p: "Person",
    });
  });

  test("handling params in dot access", () => {
    const [types, errs] = tc(
      `
        type Box<a> struct {
          field: a
        }

        extern type Int
        extern let box: Box<Int>

        pub let field = box.field
    `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      box: "Box<Int>",
      field: "Int",
    });
  });

  test("inferring params in dot access", () => {
    const [types, errs] = tc(
      `
        type Box<a> struct {
          field: a
        }

        pub let get_field = fn box { box.field }
    `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      get_field: "Fn(Box<a>) -> a",
    });
  });

  test("making sure field values are generalized", () => {
    const [types, errs] = tc(
      `
      extern type Int
      type Box<a> struct {
        field: a
      }

      pub let get_field_1: Fn(Box<Int>) -> Int = fn box { box.field }
      pub let get_field_2 = fn box { box.field }
  `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      get_field_1: "Fn(Box<Int>) -> Int",
      get_field_2: "Fn(Box<a>) -> a",
    });
  });

  test("handling params in struct definition (phantom types)", () => {
    const [types, errs] = tc(
      `
        type Box<a, b> struct { }

        pub let box = Box { }
    `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      box: "Box<a, b>",
    });
  });

  test("typecheck extra fields", () => {
    const [types, errs] = tc(
      `
        type Struct struct {}

        pub let s = Struct {
          extra: 42
        }
    `,
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toEqual(
      new err.InvalidField("Struct", "extra"),
    );

    expect(types).toEqual({
      s: "Struct",
    });
  });

  test("typecheck missing fields", () => {
    const [types, errs] = tc(
      `
        extern type String
        type Person struct {
          name: String,
          second_name: String,
        }

        pub let p = Person { }
    `,
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toEqual(
      new err.MissingRequiredFields("Person", ["name", "second_name"]),
    );

    expect(types).toEqual({
      p: "Person",
    });
  });

  test.todo("prevent from creating structs with private fields");

  test("typecheck fields of wrong type", () => {
    const [types, errs] = tc(
      `
        type X {  }
        type Struct struct {
          field: X,
        }

        pub let s = Struct {
          field: "not x"
        }
    `,
    );

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(err.TypeMismatch);

    expect(types).toEqual({
      s: "Struct",
    });
  });

  test("handling params in struct definition when fields are bound to params", () => {
    const [types, errs] = tc(
      `
      type Box<a, b> struct {
        a: a,
        b: b,
      }

      pub let box = Box {
        a: "str",
        b: 42,
      }
  `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      box: "Box<String, Int>",
    });
  });

  test("instantiated fresh vars when creating structs", () => {
    const [types, errs] = tc(
      `
      type Box<a> struct { a: a }

      pub let str_box = Box { a: "abc" }
      pub let int_box = Box { a: 42 }
  `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      str_box: "Box<String>",
      int_box: "Box<Int>",
    });
  });

  test("updating a infers the spread arg", () => {
    const [types, errs] = tc(
      `
      type Box<a> struct { a: a }

      pub let set_a = fn box {
        Box {
          a: 0,
          ..box
        }
      }
  `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      set_a: "Fn(Box<Int>) -> Box<Int>",
    });
  });

  test("allow to specify a subset of the fields when update another struct", () => {
    const [, errs] = tc(
      `
      type Str<a, b> struct {
        a: a,
        b: b
      }

      pub let x = fn other {
        Str {
          a: 0,
          ..other
        }
      }
      
  `,
    );

    expect(errs).toEqual([]);
  });

  test.todo("namespaced struct names");
});

describe("pattern matching", () => {
  test("typechecks matched expressions", () => {
    const [, errs] = tc(`pub let v = match unbound { }`);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(err.UnboundVariable);
  });

  test("typechecks clause return type", () => {
    const [, errs] = tc(`pub let v = match 0 { _ => unbound }`);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(err.UnboundVariable);
  });

  test("unifies clause return types", () => {
    const [, errs] = tc(`
    pub let _ = match 0 {
        _ => 0,
        _ => 0.0,
      }
    `);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.description).toBeInstanceOf(err.TypeMismatch);
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
      import A

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
    expect(errs[0]?.description).toBeInstanceOf(err.ArityMismatch);
    const error = errs[0]!.description as err.ArityMismatch;
    expect(error.expected).toEqual(3);
    expect(error.got).toEqual(2);
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

  test("does not allow a type to be defined twice in the same module", () => {
    const [, errs] = tc(
      `
      type T {}
      type T {}
    `,
    );

    expect(errs).toEqual<ErrorInfo[]>([
      expect.objectContaining({
        description: new err.DuplicateTypeDeclaration("T"),
      }),
    ]);
  });

  test("does not allow duplicate constructor", () => {
    const [, errs] = tc(
      `
      type T1 { X }
      type T2 { X }
    `,
    );

    expect(errs).toEqual<ErrorInfo[]>([
      expect.objectContaining({
        description: new err.DuplicateConstructor("X"),
      }),
    ]);
  });

  test("does not allow duplicate constructor", () => {
    const [T1] = typecheck(
      "T1",
      unsafeParse(`
        pub(..) type T1 { X }
      `),
      {},
      [],
    );

    const [, errs] = tc(
      `
      import T1.{T1(..)}
      type T2 { X }
    `,
      { T1 },
    );

    expect(errs).toEqual<ErrorInfo[]>(
      expect.arrayContaining([
        expect.objectContaining({
          description: new err.ShadowingImport("X"),
        }),
      ]),
    );
  });

  test("Does not access imported module when qualifying", () => {
    const [T1] = typecheck(
      "T1",
      unsafeParse(`
        pub(..) type T1 { X }
      `),
      {},
      [],
    );

    const [, errs] = tc(
      `
      import T1.{T1(..)}
      pub let a = fn arg {
        match arg {
          Main.X => 0,
        }
      }
    `,
      { T1 },
    );

    expect(errs).toEqual<ErrorInfo[]>(
      expect.arrayContaining([
        expect.objectContaining({
          description: new err.UnboundVariable("X"),
        }),
      ]),
    );
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
    expect(errs[0]!.description).toBeInstanceOf(err.TypeMismatch);
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
    expect(errs[0]!.description).toBeInstanceOf(err.UnboundVariable);
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

  test("force exhaustive match in let binding when there are many values for a const", () => {
    const [, errs] = tc(`
    pub let f = {
      let 42 = 42;
      0
    }
  `);

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(err.NonExhaustiveMatch);
  });

  test("force exhaustive match in let binding when there are many constructors", () => {
    const [, errs] = tc(`
    type Union { A, B }

    pub let f = {
      let A = A;
      0
    }
  `);

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(err.NonExhaustiveMatch);
  });

  test("force exhaustive match in fns binding when there are many constructors", () => {
    const [, errs] = tc(`
    type Union { A, B }

    pub let f = fn A { 0 }
  `);

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(err.NonExhaustiveMatch);
  });
});

describe("prelude", () => {
  test("intrinsics' types are not visible by default", () => {
    const [, errs] = tc(`
     pub let x : Int = 0
    `);

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(err.UnboundType);
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
  const mockPosition: Position = { line: 0, character: 0 };
  const mockRange: Range = { start: mockPosition, end: mockPosition };
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
          range: mockRange,
          ns: "A",
          exposing: [{ type: "value", name: "x", range: mockRange }],
        },
      ],
    );

    expect(moduleB).toEqual({
      y: "Int",
    });
  });

  test("implicit imports aren't marked as unused", () => {
    const [A] = tcProgram(
      "A",
      `
      pub(..) type Box { X }
      pub let x = 42
    `,
    );

    const [, errs] = tc(
      `
      // Not using anything
    `,
      { A },
      [
        {
          range: mockRange,
          ns: "A",
          exposing: [{ type: "value", name: "x", range: mockRange }],
        },
        {
          range: mockRange,
          ns: "A",
          exposing: [
            { type: "type", name: "Box", range: mockRange, exposeImpl: true },
          ],
        },
      ],
    );

    expect(errs).toEqual([]);
  });

  test("implicitly imports types of the modules in the prelude", () => {
    const [A] = tcProgram(
      "A",
      `
      pub type MyType {}
    `,
    );

    const [, errs] = tc(
      `
      let x: Fn(MyType) -> MyType = fn x { x }
    `,
      { A },
      [
        {
          range: mockRange,
          ns: "A",
          exposing: [
            {
              type: "type",
              name: "MyType",
              exposeImpl: false,
              range: mockRange,
            },
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
          range: mockRange,
          ns: "A",
          exposing: [
            {
              type: "type",
              name: "MyType",
              exposeImpl: true,
              range: mockRange,
            },
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

  test("detects unused imports when there are no exposed vars", () => {
    const [A] = tcProgram("A", ``);
    const [, errs] = tc(`import A`, { A });

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(err.UnusedImport);
  });

  test("detects unused exposed values", () => {
    const [A] = tcProgram("A", `pub let x = 42`);
    const [, errs] = tc(`import A.{x}`, { A });

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(err.UnusedExposing);
  });

  test("detects unused types", () => {
    const [A] = tcProgram("A", `pub type T { }`);
    const [, errs] = tc(`import A.{T}`, { A });

    expect(errs).toHaveLength(1);
    expect(errs[0]?.description).toBeInstanceOf(err.UnusedExposing);
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

    expect(errs).toEqual([
      expect.objectContaining({
        description: new err.UnboundModule("ModuleNotFound"),
      }),
    ]);
  });

  test("error when importing a non-existing type", () => {
    const [Mod] = tcProgram("Mod", ``);
    const [, errs] = tc(`import Mod.{NotFound}`, { Mod });

    expect(errs).toEqual([
      expect.objectContaining({
        description: new err.NonExistingImport("NotFound"),
      }),
    ]);
  });

  test("error when importing a type the is not pub", () => {
    const [Mod] = tcProgram("Mod", `type PrivateType {}`);
    const [, errs] = tc(`import Mod.{PrivateType}`, { Mod });

    expect(errs).toEqual([
      expect.objectContaining({
        description: new err.NonExistingImport("PrivateType"),
      }),
    ]);
  });

  test("error when importing a non-existing value", () => {
    const [Mod] = tcProgram("Mod", ``);
    const [, errs] = tc(`import Mod.{not_found}`, { Mod });

    expect(errs).toEqual([
      expect.objectContaining({
        description: new err.NonExistingImport("not_found"),
      }),
    ]);
  });

  test("error when importing a private value", () => {
    const [Mod] = tcProgram("Mod", `let not_found = 42`);
    const [, errs] = tc(`import Mod.{not_found}`, { Mod });

    expect(
      errs.some((e) => e.description instanceof err.NonExistingImport),
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
    expect(errs[0]?.description).toBeInstanceOf(err.NonExistingImport);
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
    expect(errs[0]?.description).toBeInstanceOf(err.NonExistingImport);
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
    expect(errs[0]?.description).toBeInstanceOf(err.UnboundType);
  });

  test("error when expose impl is run on a extern type", () => {
    const [Mod] = tcProgram("Mod", `extern pub type ExternType`);
    const [, errs] = tc(`import Mod.{ExternType(..)}`, { Mod });

    expect(errs).toEqual([
      expect.objectContaining({
        description: new err.BadImport(),
      }),
    ]);
  });

  test("error when expose impl is run on a opaque type", () => {
    // Note it is `pub` instead of `pub(..)`
    const [Mod] = tcProgram("Mod", `pub type T {}`);
    const [, errs] = tc(`import Mod.{T(..)}`, { Mod });

    expect(errs).toEqual([
      expect.objectContaining({
        description: new err.BadImport(),
      }),
    ]);
  });

  test("error when qualifier is not an imported module", () => {
    const [, errs] = tc(`pub let x = NotImported.value`);

    expect(errs).toEqual([
      expect.objectContaining({
        description: new err.UnimportedModule("NotImported"),
      }),
    ]);
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
    expect(errs[0]?.description).toBeInstanceOf(err.TypeMismatch);
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
    expect(project.A!.errors).toEqual([]);
    expect(programTypes(project.A!.typedModule)).toEqual({
      x: "Int",
    });

    expect(project.B).not.toBeUndefined();
    expect(project.B!.errors).toEqual([]);
    expect(programTypes(project.B!.typedModule)).toEqual({
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

    expect(project.B!.errors).toEqual([]);
    expect(programTypes(project.B!.typedModule)).toEqual({
      y: "Int",
    });
  });
});

test("type error when main has not type Task<Unit>", () => {
  const [_, errors] = tc(`pub let main = "not-task-type"`);
  expect(errors).toHaveLength(1);
  expect(errors[0]?.description).toBeInstanceOf(err.TypeMismatch);
});

type Deps = Record<string, TypedModule>;

function tcProgram(
  ns: string,
  src: string,
  deps: Deps = {},
  prelude: Import[] = [],
  traitImpls: TraitImpl[] = [],
) {
  const parsedProgram = unsafeParse(src);
  resetTraitsRegistry(traitImpls);
  const deps_: IDeps = Object.fromEntries(
    Object.entries(deps).map(([k, v]) => [k, v.moduleInterface]),
  );
  return typecheck(ns, parsedProgram, deps_, prelude);
}

function tc(
  src: string,
  deps: Deps = {},
  prelude: Import[] = [],
  traitImpls: TraitImpl[] = [],
) {
  const [typed, errors] = tcProgram("Main", src, deps, prelude, traitImpls);
  return [programTypes(typed) as Record<string, string>, errors] as const;
}

function programTypes(typed: TypedModule): Record<string, string> {
  const kvs = typed.declarations.map((decl) => [
    decl.binding.name,
    typeToString(decl.binding.$type.asType()),
  ]);

  return Object.fromEntries(kvs);
}
