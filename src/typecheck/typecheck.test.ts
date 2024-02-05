import { describe, expect, test } from "vitest";
import { unsafeParse } from "../parser";
import { Deps, typecheck, typecheckProject, TypecheckError } from "./typecheck";
import { typePPrint } from "./pretty-printer";
import { UntypedImport } from "../ast";
import { TypedModule } from "../typedAst";

test("infer int", () => {
  const [types, errors] = tc(`
    let x = 42
  `);

  expect(errors).toEqual([]);
  expect(types).toEqual({
    x: "Int",
  });
});

test("infer float", () => {
  const [types, errors] = tc(`
    let x = 42.2
  `);

  expect(errors).toEqual([]);
  expect(types).toEqual({
    x: "Float",
  });
});

test("infer a variable present in the context", () => {
  const [types, errors] = tc(
    `
    let x = 42
    let y = x
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
    let x = unbound_var
  `,
  );

  expect(errors).toEqual<TypecheckError[]>([
    expect.objectContaining({
      type: "unbound-variable",
      ident: "unbound_var",
    }),
  ]);
  expect(types).toEqual({
    x: "t0",
  });
});

test("typechecking previously defined vars", () => {
  const [types, errors] = tc(`
    let x = 42
    let y = x
  `);

  expect(errors).toEqual([]);
  expect(types).toEqual({
    x: "Int",
    y: "Int",
  });
});

test("fn returning a constant", () => {
  const [types, errors] = tc(`
    let f = fn { 42 }
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
    extern let (>): Fn(a, a) -> Bool
    let x = 1 > 2
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
    extern let (>): Fn(Int, Int) -> Bool
    let x = 1.1 > 2
  `,
  );

  expect(errors).not.toEqual([]);
});

test("typecheck fn args", () => {
  const [types] = tc(
    `
    extern let (>): Fn(Int, Int) -> Bool
    let f = fn x, y { x > y }
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
    let x = {
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
    let id = fn x { x }
  `,
  );

  expect(errs).toEqual([]);
  expect(types).toEqual({
    id: "Fn(t0) -> t0",
  });
});

test("generalize values", () => {
  const [types, errs] = tc(
    `
    let id = fn x { x }
    let _ = id(42)
  `,
  );

  expect(errs).toEqual([]);
  expect(types).toEqual({
    id: "Fn(t0) -> t0",
    _: "Int",
  });
});

test("recursive let exprs", () => {
  const [types, errs] = tc(
    `
    let f = {
      let g = fn _ { g(1) };
      g
  }
  `,
  );

  expect(errs).toEqual([]);
  expect(types).toEqual({
    f: "Fn(Int) -> t0",
  });
});

test("recursive let declarations", () => {
  const [types, errs] = tc(
    `
    let f = fn _ { f(42) }
  `,
  );

  expect(errs).toEqual([]);
  expect(types).toEqual({
    f: "Fn(Int) -> t0",
  });
});

describe("type hints", () => {
  test("type hints are used by typechecker", () => {
    const [types, errs] = tc(
      `
        extern type Int
        let x: Int = 1.1
      `,
    );
    expect(errs).not.toEqual([]);
    expect(types).toEqual({
      x: "Int",
    });
  });

  test("type hints of fns are used by typechecker", () => {
    const [types, errs] = tc(
      `
        extern type Int
        let x: Fn() -> Int = fn { 1.1 }
        `,
    );
    expect(errs).not.toEqual([]);
    expect(types).toEqual(
      expect.objectContaining({
        x: "Fn() -> Int",
      }),
    );
  });

  test("type hints of fns are used by typechecker (args)", () => {
    const [types, errs] = tc(
      `
      extern let (!): Fn(Bool) -> Bool
      let x: Fn(Bool) -> Int = fn x { !x }
      `,
    );
    expect(errs).not.toEqual([]);
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
      let x: _ = 1`,
    );
    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Int",
    });
  });

  test.todo("vars type hints should be generalized", () => {
    const [types, errs] = tc("let x: a = 0");
    expect(errs).not.toEqual([]);
    expect(types).toEqual({
      x: "a",
    });
  });

  test.todo("unify generalized values", () => {
    const [types, errs] = tc("let f: Fn(ta) -> tb = fn x { x }");
    expect(errs).not.toEqual([]);
    expect(types).toEqual({
      f: "Fn(ta) -> tb",
    });
  });

  test.todo("vars type hints are used by typechecker", () => {
    const [types, errs] = tc("let eq: Fn(a, a, b) -> a = fn x, y, z { x }");
    expect(errs).toEqual([]);
    expect(types).toEqual({
      eq: "Fn(a, a, b) -> a",
    });
  });

  test("type hints instantiate polytypes", () => {
    const [types, errs] = tc(`
      extern type Int
      let f: Fn(Int) -> Int = fn x { x }
    `);
    expect(errs).toEqual([]);
    expect(types).toEqual({
      f: "Fn(Int) -> Int",
    });
  });

  test("unknown types are rejected", () => {
    const [types, errs] = tc("let x: NotFound = 1");
    expect(errs).not.toEqual([]);
    expect(errs[0]!.type).toBe("unbound-type");
    expect(types).toEqual({
      x: "NotFound",
    });
  });
});

describe("custom types", () => {
  test("allows to use it as type hint", () => {
    const [types, errs] = tc(`
    extern type Int
    type T { }
    let f: Fn(T) -> Int = fn _ { 0 }
  `);

    expect(errs).toEqual([]);
    expect(types).toEqual({
      f: "Fn(T) -> Int",
    });
  });

  test("handles constructor without args nor params", () => {
    const [types, errs] = tc(`
    type T { C }
    let c = C
  `);

    expect(errs).toEqual([]);
    expect(types).toEqual({
      c: "T",
    });
  });

  test("handles constructor with one (non-parametric) arg", () => {
    const [types, errs] = tc(
      `
    extern type Int
    type T { C(Int) }
    let c = C
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
    type Maybe<a> { }
    type T {
      C(Maybe<Int>, Int)
    }
    let c = C
  `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      c: "Fn(Maybe<Int>, Int) -> T",
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
    let c = C
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

    expect(errs).not.toEqual([]);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.type).toBe("unbound-type");
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
        let a = C
  `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      a: "Box<t0, t1>",
    });
  });

  test("allows using parametric types in constructors", () => {
    const [types, errs] = tc(
      `
        type T<a, b> { C(b) }
        let a = C
        let b = C(1)
  `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      a: "Fn(t0) -> T<t1, t0>",
      b: "T<t0, Int>",
    });
  });

  test("forbids unbound type params", () => {
    const [, errs] = tc(
      `
        type T { C(a) }
  `,
    );

    expect(errs).not.toEqual([]);
  });

  test("doesn't allow shadowing type params", () => {
    const [, errs] = tc(
      `
        type Box<a, a> { }
  `,
    );

    expect(errs).not.toEqual([]);
  });

  test("prevents catchall to be used in type args", () => {
    const [, errs] = tc(
      `
        type T { C(_) }
  `,
    );

    expect(errs).not.toEqual([]);
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
    const [, errs] = tc(`let _ = match unbound { }`);
    expect(errs).not.toEqual([]);
  });

  test("typechecks clause return type", () => {
    const [, errs] = tc(`let _ = match 0 { _ => unbound }`);
    expect(errs).not.toEqual([]);
  });

  test("unifies clause return types", () => {
    const [, errs] = tc(`
      let _ = match 0 {
        _ => 0,
        _ => 0.0,
      }
    `);
    expect(errs).not.toEqual([]);
  });

  test("infers return type", () => {
    const [types, errs] = tc(`
      let x = match 1.1 { _ => 0 }
    `);
    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Int",
    });
  });

  test("infers matched type when is a lit", () => {
    const [types, errs] = tc(`
      let f = fn x {
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

      let f = fn x {
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

  test("infers matched type when there are concrete args", () => {
    const [types, errs] = tc(
      `
      type Bool { }
      type T { C(Bool) }

      let f = fn x {
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

  test("infers nested types in p match", () => {
    const [types, errs] = tc(
      `
      type Bool {
        True,
      }

      type Box<a> {
        Make(a),
      }

      let f = fn x {
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

      type Maybe<a> {
        Nothing,
        Just(a),
      }

      let f = fn x {
        match x {
          Nothing => 2,
        }
      }
    `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      f: "Fn(Maybe<t0>) -> Int",
    });
  });

  test("use pattern matching bound vars", () => {
    const [types, errs] = tc(`let x = match 0 { a => a }`);

    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Int",
    });
  });

  test("use pattern matching bound vars in nested types", () => {
    const [types, errs] = tc(`
      type Boxed<a> { Boxed(a) }

      let x = match Boxed(42) {
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
      let _ = match 42 {
        X => 0
      }
    `);

    expect(errs).not.toEqual([]);
  });

  test("return error on unbound types", () => {
    const [, errs] = tc(`
      let _ = fn x {
        match x {
          NotFound => 0
        }
      }
    `);

    expect(errs).not.toEqual([]);
  });
});

describe("prelude", () => {
  test("intrinsics' types are not visible by default", () => {
    const [, errs] = tc(`
     let x : Int = 0
    `);

    expect(errs).not.toEqual([]);
    expect(errs[0]!.type).toEqual("unbound-type");
  });

  test("checks extern types", () => {
    const [, errs] = tc(`
     extern type Int
     let x : Int = 0
    `);

    expect(errs).toEqual([]);
  });

  test("typechecks extern values", () => {
    const [types, errs] = tc(
      `
     type Unit {}
     extern let x : Unit
    `,
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Unit",
    });
  });

  test("typechecks extern values", () => {
    const [types, errs] = tc(
      `
     type Unit { }
     extern let x : Unit
     let y = x
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
    const [A] = tcProgram(`
      pub let x = 42
    `);

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
    const [A] = tcProgram(`
      type MyType {}
    `);

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
    const [A] = tcProgram(`
      pub(..) type MyType { A }
    `);

    const [types, errs] = tc(
      `
      let x = A
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
    const [A] = tcProgram(`
      pub(..) type T { T }
      pub(..) type Boxed { Boxed(T) }
    `);

    const [types, errs] = tc(
      `
      import A.{Boxed(..), T(..)}
      let x = Boxed(T)
    `,
      { A },
    );
    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Boxed",
    });
  });

  test("handles variants imports", () => {
    const [A] = tcProgram(`
      pub(..) type MyType { Constr }
    `);

    const [types, errs] = tc(
      `
      import A
      let x = A.Constr
    `,
      { A },
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "MyType",
    });
  });

  test("handles nested imports", () => {
    const [Mod] = tcProgram(`
      pub let x = 42
    `);

    const [types, errs] = tc(
      `
      import A/B/C
      let x = A/B/C.x
    `,
      { "A/B/C": Mod },
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Int",
    });
  });

  test("allow importing types (unqualified)", () => {
    const [Mod] = tcProgram(`pub type Example { }`);

    const [types, errs] = tc(
      `
      import Mod.{Example}
      extern let x: Example
    `,
      { Mod },
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Example",
    });
  });

  test("allow importing types (qualified)", () => {
    const [Mod] = tcProgram(`pub type Example { }`);
    const [types, errs] = tc(
      `
      import Mod
      extern let x: Mod.Example
    `,
      { Mod },
    );

    expect(errs).toEqual([]);
    expect(types).toEqual({
      x: "Example",
    });
  });

  test("allow using imported types in match patterns", () => {
    const [Mod] = tcProgram(`pub(..) type T { Constr }`);
    const [, errs] = tc(
      `
      import Mod.{T(..)}
      let x = match Constr {
        Constr => 0,
      }
    `,
      { Mod },
    );

    expect(errs).toEqual([]);
  });

  test("error when import a non-existing module", () => {
    const [, errs] = tc(`import ModuleNotFound`);

    expect(errs).not.toEqual([]);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.type).toBe("unbound-module");
  });

  test("error when importing a non-existing type", () => {
    const [Mod] = tcProgram(``);
    const [, errs] = tc(`import Mod.{NotFound}`, { Mod });

    expect(errs).not.toEqual([]);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.type).toBe("non-existing-import");
  });

  test("error when importing a type the is not pub", () => {
    const [Mod] = tcProgram(`type PrivateType {}`);
    const [, errs] = tc(`import Mod.{PrivateType}`, { Mod });

    expect(errs).not.toEqual([]);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.type).toBe("non-existing-import");
  });

  test("error when importing a non-existing value", () => {
    const [Mod] = tcProgram(``);
    const [, errs] = tc(`import Mod.{not_found}`, { Mod });

    expect(errs).not.toEqual([]);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.type).toBe("non-existing-import");
  });

  test("error when importing a private value", () => {
    const [Mod] = tcProgram(`let not_found = 42`);
    const [, errs] = tc(`import Mod.{not_found}`, { Mod });

    expect(errs).not.toEqual([]);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.type).toBe("non-existing-import");
  });

  test("qualified imports should not work on priv functions", () => {
    const [Mod] = tcProgram(`let not_found = 42`);
    const [, errs] = tc(
      `
      import Mod
      let _ = Mod.not_found
    `,
      { Mod },
    );

    expect(errs).not.toEqual([]);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.type).toBe("non-existing-import");
  });

  test("qualified imports should not work on priv constructors", () => {
    const [Mod] = tcProgram(`pub type T { A }`);
    const [, errs] = tc(
      `
      import Mod
      let _ = Mod.A
    `,
      { Mod },
    );

    expect(errs).not.toEqual([]);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.type).toBe("non-existing-import");
  });

  test("qualified imports should not work on priv types", () => {
    const [Mod] = tcProgram(`type PrivateType {}`);
    const [, errs] = tc(
      `
      import Mod
      extern let x: Mod.PrivateType
    `,
      { Mod },
    );

    expect(errs).not.toEqual([]);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.type).toBe("non-existing-import");
  });

  test("error when expose impl is run on a extern type", () => {
    const [Mod] = tcProgram(`extern pub type ExternType`);
    const [, errs] = tc(`import Mod.{ExternType(..)}`, { Mod });

    expect(errs).not.toEqual([]);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.type).toBe("bad-import");
  });

  test("error when expose impl is run on a opaque type", () => {
    // Note it is `pub` instead of `pub(..)`
    const [Mod] = tcProgram(`pub type T {}`);
    const [, errs] = tc(`import Mod.{T(..)}`, { Mod });

    expect(errs).not.toEqual([]);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.type).toBe("bad-import");
  });

  test("error when qualifier is not an imported module", () => {
    const [, errs] = tc(`let x = NotImported.value`);

    expect(errs).not.toEqual([]);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.type).toBe("unimported-module");
  });
});

describe("typecheck project", () => {
  test("single import", () => {
    const project = typecheckProject(
      {
        A: unsafeParse(`
        pub let x = 42
      `),
        B: unsafeParse(`
        import A.{x}
        let y = x
      `),
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
        A: unsafeParse(`
        pub let x = 42
      `),
        B: unsafeParse(`
        import A
        let y = A.x
      `),
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

function tcProgram(
  src: string,
  deps: Deps = {},
  prelude: UntypedImport[] = [],
) {
  const parsedProgram = unsafeParse(src);
  return typecheck(parsedProgram, deps, prelude);
}

function tc(src: string, deps: Deps = {}, prelude: UntypedImport[] = []) {
  const [typed, errors] = tcProgram(src, deps, prelude);
  return [programTypes(typed) as Record<string, string>, errors] as const;
}

function programTypes(typed: TypedModule): Record<string, string> {
  const kvs = typed.declarations.map((decl) => [
    decl.binding.name,
    typePPrint(decl.binding.$.asType()),
  ]);

  return Object.fromEntries(kvs);
}
