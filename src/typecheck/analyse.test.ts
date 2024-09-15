import { test, expect, describe, beforeEach } from "vitest";
import { Analysis, resetTraitsRegistry } from "./analyse";
import { typeToString } from "./type";
import {
  AmbiguousTypeVar,
  ArityMismatch,
  BadImport,
  DuplicateDeclaration,
  ErrorInfo,
  InvalidCatchall,
  InvalidField,
  InvalidPipe,
  InvalidTypeArity,
  MissingRequiredFields,
  NonExhaustiveMatch,
  NonExistingImport,
  TraitNotSatified,
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
import { rangeOf } from "./typedAst/__test__/utils";
import { dummyRange } from "./defaultImports";

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

  test.todo("self-recursive declarations", () => {
    const a = new Analysis("Main", `pub let f = fn _ { f(42) }`);

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      f: "Fn(Int) -> a",
    });
  });

  test.todo("let declarations in reverse order", () => {
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

  test.todo("allow dependency cycle between declarations inside thunks", () => {
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

describe.todo("modules", () => {
  test.todo("imports cannot shadow values");
  test.todo("imports cannot shadow types");
  test.todo("imports cannot shadow constructors");
  test.todo("imports cannot shadow fields");

  test("implicitly imports values of the modules in the prelude", () => {
    const A = new Analysis(
      "A",
      `
      pub let x = 42
    `,
    );

    const a = new Analysis(
      "Main",
      `
      pub let y = x
    `,
      {
        dependencies: { A },
        implicitImports: [
          {
            range: dummyRange,
            ns: "A",
            exposing: [{ type: "value", name: "x", range: dummyRange }],
          },
        ],
      },
    );

    expect(getTypes(a)).toEqual({
      y: "Int",
    });
  });

  test("implicitly imports types of the modules in the prelude", () => {
    const A = new Analysis(
      "A",
      `
      type MyType {}
    `,
    );

    const a = new Analysis(
      "Main",
      `
      let x: Fn(MyType) -> MyType = fn x { x }
    `,
      {
        dependencies: { A },
        implicitImports: [
          {
            range: dummyRange,
            ns: "A",
            exposing: [
              {
                type: "type",
                name: "MyType",
                exposeImpl: false,
                range: dummyRange,
              },
            ],
          },
        ],
      },
    );
    expect(a.errors).toEqual([]); // TODO check assertion
  });

  test("implicitly imports variants of the modules in the prelude", () => {
    const A = new Analysis(
      "A",
      `
      pub(..) type MyType { A }
    `,
    );

    const a = new Analysis(
      "Main",
      `
      pub let x = A
    `,
      {
        dependencies: { A },
        implicitImports: [
          {
            range: dummyRange,
            ns: "A",
            exposing: [
              {
                type: "type",
                name: "MyType",
                exposeImpl: true,
                range: dummyRange,
              },
            ],
          },
        ],
      },
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "MyType",
    });
  });

  test("handles nested type references from other modules", () => {
    const A = new Analysis(
      "A",
      `
      pub(..) type T { T }
      pub(..) type Boxed { Boxed(T) }
    `,
    );

    const a = new Analysis(
      "Main",
      `
      import A.{Boxed(..), T(..)}
      pub let x = Boxed(T)
    `,
      { dependencies: { A } },
    );
    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "Boxed",
    });
  });

  test("detects unused imports when there are not exposed vars", () => {
    const A = new Analysis("A", ``);
    const a = new Analysis("Main", `import A`, { dependencies: { A } });
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(UnusedImport);
  });

  test("detects unused exposed values", () => {
    const A = new Analysis("A", `pub let x = 42`);
    const a = new Analysis("Main", `import A.{x}`, { dependencies: { A } });
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(UnusedExposing);
  });

  test("detects unused types", () => {
    const A = new Analysis("A", `pub type T { }`);
    const a = new Analysis("Main", `import A.{T}`, { dependencies: { A } });
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(UnusedExposing);
  });

  test("handles variants imports", () => {
    const A = new Analysis(
      "A",
      `
      pub(..) type MyType { Constr }
    `,
    );

    const a = new Analysis(
      "Main",
      `
      import A
      pub let x = A.Constr
    `,
      { dependencies: { A } },
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "MyType",
    });
  });

  test("handles nested imports", () => {
    const Mod = new Analysis(
      "Mod",
      `
      pub let x = 42
    `,
    );

    const a = new Analysis(
      "Main",
      `
      import A/B/C
      pub let x = A/B/C.x
    `,
      { dependencies: { "A/B/C": Mod } },
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "Int",
    });
  });

  test("allow importing types (unqualified)", () => {
    const Mod = new Analysis("Mod", `pub type Example { }`);

    const a = new Analysis(
      "Main",
      `
      import Mod.{Example}
      extern pub let x: Example
    `,
      { dependencies: { Mod } },
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "Example",
    });
  });

  test("allow importing types (qualified)", () => {
    const Mod = new Analysis("Mod", `pub type Example { }`);
    const a = new Analysis(
      "Main",
      `
      import Mod
      extern pub let x: Mod.Example
    `,
      { dependencies: { Mod } },
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "Example",
    });
  });

  test("allow using imported types in match patterns", () => {
    const Mod = new Analysis("Mod", `pub(..) type T { Constr }`);
    const a = new Analysis(
      "Main",
      `
      import Mod.{T(..)}
      pub let x = match Constr {
        Constr => 0,
      }
    `,
      { dependencies: { Mod } },
    );

    expect(a.errors).toEqual([]);
  });

  test("error when import a non-existing module", () => {
    const a = new Analysis("Main", `import ModuleNotFound`);
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(UnboundModule);
  });

  test("error when importing a non-existing type", () => {
    const Mod = new Analysis("Mod", ``);
    const a = new Analysis("Main", `import Mod.{NotFound}`, {
      dependencies: { Mod },
    });
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(NonExistingImport);
  });

  test("error when importing a type the is not pub", () => {
    const Mod = new Analysis("Mod", `type PrivateType {}`);
    const a = new Analysis("Main", `import Mod.{PrivateType}`, {
      dependencies: { Mod },
    });
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(NonExistingImport);
  });

  test("error when importing a non-existing value", () => {
    const Mod = new Analysis("Mod", ``);
    const a = new Analysis("Main", `import Mod.{not_found}`, {
      dependencies: { Mod },
    });
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(NonExistingImport);
  });

  test("error when importing a private value", () => {
    const Mod = new Analysis("Mod", `let not_found = 42`);
    const a = new Analysis("Main", `import Mod.{not_found}`, {
      dependencies: { Mod },
    });
    expect(
      a.errors.some((e) => e.description instanceof NonExistingImport),
    ).toBeTruthy();
  });

  test("qualified imports should not work on priv functions", () => {
    const Mod = new Analysis("Mod", `let not_found = 42`);
    const a = new Analysis(
      "Main",
      `
      import Mod
      pub let v = Mod.not_found
    `,
      { dependencies: { Mod } },
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(NonExistingImport);
  });

  test("qualified imports should not work on priv constructors", () => {
    const Mod = new Analysis("Mod", `pub type T { A }`);
    const a = new Analysis(
      "Main",
      `
      import Mod
      pub let v = Mod.A
    `,
      { dependencies: { Mod } },
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(NonExistingImport);
  });

  test("qualified imports should not work on priv types", () => {
    const Mod = new Analysis("Mod", `type PrivateType {}`);
    const a = new Analysis(
      "Main",
      `
      import Mod
      extern pub let x: Mod.PrivateType
    `,
      { dependencies: { Mod } },
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(UnboundType);
  });

  test("error when expose impl is run on a extern type", () => {
    const Mod = new Analysis("Mod", `extern pub type ExternType`);
    const a = new Analysis("Main", `import Mod.{ExternType(..)}`, {
      dependencies: { Mod },
    });
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(BadImport);
  });

  test("error when expose impl is run on a opaque type", () => {
    // Note it is `pub` instead of `pub(..)`
    const Mod = new Analysis("Mod", `pub type T {}`);
    const a = new Analysis("Main", `import Mod.{T(..)}`, {
      dependencies: { Mod },
    });
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(BadImport);
  });

  test("error when qualifier is not an imported module", () => {
    const a = new Analysis("Main", `pub let x = NotImported.value`);
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(UnimportedModule);
  });

  test("types from different modules with the same name aren't treated the same", () => {
    const Mod = new Analysis("Mod", `pub(..) type T { Constr }`);
    const a = new Analysis(
      "Main",
      `
      import Mod
      type T { Constr }
      pub let t: T = Mod.Constr
    `,
      { dependencies: { Mod } },
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(TypeMismatch);
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

  test.todo("can be used as type hint", () => {
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

  test("generalize type constructors", () => {
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

  test("handles types that do not exist", () => {
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

  test("checks arity in constructors", () => {
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
    expect(desc.type).toEqual("T");
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

  test("handles parametric types", () => {
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

  test("allows using parametric types in constructors", () => {
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

  test("forbids unbound type params", () => {
    const a = new Analysis(
      "Main",
      `
        type T { C(a) }
  `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]!.description).toBeInstanceOf(UnboundTypeParam);
  });

  test("doesn't allow shadowing type params", () => {
    const a = new Analysis(
      "Main",
      `
        type Box<a, a> { }
  `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]!.description).toBeInstanceOf(TypeParamShadowing);
  });

  test("prevents catchall to be used in type args", () => {
    const a = new Analysis(
      "Main",
      `
        type T { C(_) }
  `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]!.description).toBeInstanceOf(InvalidCatchall);
  });

  test("allows self-recursive type", () => {
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
  test.todo("type hints are used by typechecker", () => {
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

  test.todo("type hints of fns are used by typechecker", () => {
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

  test.todo("type hints of fns are used by typechecker (args)", () => {
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

  test.todo("type hints instantiate polytypes", () => {
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

describe.todo("pattern matching", () => {
  test("typechecks matched expressions", () => {
    const a = new Analysis("Main", `pub let v = match unbound { }`);

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]!.description).toBeInstanceOf(UnboundVariable);
  });

  test("typechecks clause return type", () => {
    const a = new Analysis("Main", `pub let v = match 0 { _ => unbound }`);
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]!.description).toBeInstanceOf(UnboundVariable);
  });

  test("unifies clause return types", () => {
    const a = new Analysis(
      "Main",
      `pub let _ = match 0 {
        _ => 0,
        _ => 0.0,
      }
    `,
    );
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]!.description).toBeInstanceOf(TypeMismatch);
  });

  test("infers return type", () => {
    const a = new Analysis(
      "Main",
      `
      pub let x = match 1.1 { _ => 0 }
    `,
    );
    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "Int",
    });
  });

  test("infers matched type when is a lit", () => {
    const a = new Analysis(
      "Main",
      `
    pub let f = fn x {
        match x {
          42 => 0,
        }
      }
    `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      f: "Fn(Int) -> Int",
    });
  });

  test("infers matched type when there are no args", () => {
    const a = new Analysis(
      "Main",
      `
      type T { C }

      pub let f = fn x {
        match x {
          C => 0,
        }
      }
    `,
    );
    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      f: "Fn(T) -> Int",
    });
  });

  test("infers matched type when is qualified", () => {
    const A = new Analysis("A", `pub(..) type T { T }`);

    const a = new Analysis(
      "Main",
      `
      import A.{T(..)}

      pub let f = fn x {
        match x {
          A.T => 0,
        }
      }
    `,
      {
        dependencies: { A },
      },
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      f: "Fn(T) -> Int",
    });
  });

  test("infers matched type when there are concrete args", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      f: "Fn(T) -> Int",
    });
  });

  test("typechecks constructor args", () => {
    const a = new Analysis(
      "Main",
      `
      type T<a> { C(a, a, a) }

      pub let f = fn x {
        match x {
          C(_, _) => 0,
        }
      }
    `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(ArityMismatch);
    const err = a.errors[0]!.description as ArityMismatch;
    expect(err.expected).toEqual(3);
    expect(err.got).toEqual(2);
  });

  test("infers nested types in p match", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      f: "Fn(Box<Bool>) -> Int",
    });
  });

  test("infers nested types in p match, matching on a zero-args variant", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      f: "Fn(Option<a>) -> Int",
    });
  });

  test("use pattern matching bound vars", () => {
    const a = new Analysis("Main", `pub let x = match 0 { a => a }`);

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "Int",
    });
  });

  test("use pattern matching bound vars in nested types", () => {
    const a = new Analysis(
      "Main",
      `
      type Boxed<a> { Boxed(a) }

      pub let x = match Boxed(42) {
        Boxed(a) => a
      }
    `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      x: "Int",
    });
  });

  test("return error on wrong matched type", () => {
    const a = new Analysis(
      "Main",
      `type X { X }
      pub let v = match 42 {
        X => 0
      }
    `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]!.description).toBeInstanceOf(TypeMismatch);
  });

  test("return error on unbound types", () => {
    const a = new Analysis(
      "Main",
      `pub let v = fn x {
        match x {
          NotFound => 0
        }
      }
    `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]!.description).toBeInstanceOf(UnboundVariable);
  });

  test("infers fn match param type", () => {
    const a = new Analysis(
      "Main",
      `
    extern type T
    type Box { Boxed(T) }

    pub let f = fn Boxed(n) { n }
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      f: "Fn(Box) -> T",
    });
  });

  test("infers let match type", () => {
    const a = new Analysis(
      "Main",
      `
    extern type T
    type Box { Boxed(T) }

    pub let f = fn box {
      let Boxed(n) = box;
      n
    }
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      f: "Fn(Box) -> T",
    });
  });

  test("force exhaustive match in let binding when there are many values for a const", () => {
    const a = new Analysis(
      "Main",
      `pub let f = {
      let 42 = 42;
      0
    }
  `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(NonExhaustiveMatch);
  });

  test("force exhaustive match in let binding when there are many constructors", () => {
    const a = new Analysis(
      "Main",
      `type Union { A, B }

    pub let f = {
      let A = A;
      0
    }
  `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(NonExhaustiveMatch);
  });

  test("force exhaustive match in fns binding when there are many constructors", () => {
    const a = new Analysis(
      "Main",
      `type Union { A, B }

    pub let f = fn A { 0 }
  `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(NonExhaustiveMatch);
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

describe.todo("traits", () => {
  test("fails to typecheck when a required trait is not implemented", () => {
    const a = new Analysis(
      "Main",
      `
        extern type String
        extern pub let show: Fn(a) -> String where a: Show
        pub let x = show(42) // note that 'Int' doesn't implement 'Show' in this test
      `,
    );
    expect(a.errors).toHaveLength(1);
    expect(getTypes(a)).toEqual({
      show: "Fn(a) -> String where a: Show",
      x: "String",
    });
  });

  test("succeeds to typecheck when a required trait is not implemented", () => {
    resetTraitsRegistry([
      { trait: "Show", moduleName: "Int", typeName: "Int" },
    ]);

    const a = new Analysis(
      "Main",
      `
        extern type String
        extern pub let show: Fn(a) -> String where a: Show
        pub let x = show(42)
      `,
    );

    expect(a.errors).toEqual([]);
  });

  test("propagates the trait constraint", () => {
    const a = new Analysis(
      "Main",
      `
        extern type String
        extern let show: Fn(a) -> String where a: Show

        pub let use_show = fn value {
          show(value)
        }
      `,
    );
    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      show: "Fn(a) -> String where a: Show",
      use_show: "Fn(a) -> String where a: Show",
    });
  });

  test("fails to typecheck when unify occurs later", () => {
    const a = new Analysis(
      "Main",
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
    expect(a.errors).not.toEqual([]);
  });

  test("infers multiple traits", () => {
    const a = new Analysis(
      "Main",
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
    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual(
      expect.objectContaining({
        f: "Fn(a) -> Unit where a: Eq + Show",
      }),
    );
  });

  test("does not break generalization", () => {
    const a = new Analysis(
      "Main",
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
    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual(
      expect.objectContaining({
        eq: "Fn(a) -> Unit where a: Eq",
        show: "Fn(a) -> Unit where a: Show",
      }),
    );
  });

  test("is able to derive Eq trait in ADTs with only a singleton", () => {
    const a = new Analysis(
      "Main",
      `
        extern let take_eq: Fn(a) -> a where a: Eq
        type MyType {
          Singleton
        }

        pub let example = take_eq(Singleton)
      `,
    );

    expect(a.errors).toEqual([]);
  });

  test("does not derive Eq trait in ADTs when at least one argument", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toHaveLength(1);
  });

  test("derives Eq even when constructors have arguments that derive Eq", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toEqual([]);
  });

  test("requires deps to derive Eq in order to derive Eq", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toHaveLength(1);
  });

  test("derives Eq when dependencies derive Eq", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toEqual([]);
  });

  test("derives in self-recursive types", () => {
    const a = new Analysis(
      "Main",
      `
        extern let take_eq: Fn(a) -> a where a: Eq

        pub(..) type Rec<a> {
          End,
          Nest(Rec<a>),
        }

        pub let example = take_eq(End)
      `,
    );

    expect(a.errors).toEqual([]);
  });

  test("derives in self-recursive types (nested)", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toEqual([]);
  });

  describe("auto deriving for struct", () => {
    test("is able to derive Eq in empty structs", () => {
      const a = new Analysis(
        "Main",
        `
          extern let take_eq: Fn(a) -> a where a: Eq
  
          type MyType struct { }
  
          pub let example = take_eq(MyType { })
        `,
      );

      expect(a.errors).toEqual([]);
    });

    test("is able to derive Show in empty structs", () => {
      const a = new Analysis(
        "Main",
        `
          extern let take_shoq: Fn(a) -> a where a: Show
  
          type MyType struct { }
  
          pub let example = take_shoq(MyType { })
        `,
      );

      expect(a.errors).toEqual([]);
    });

    test("is able to derive Eq in structs where all the fields are Eq", () => {
      const a = new Analysis(
        "Main",
        `
          extern let take_eq: Fn(a) -> a where a: Eq
          type EqT { EqT }
  
          type MyType struct {
            x: EqT
          }
  
          pub let example = take_eq(MyType { x: EqT })
        `,
      );

      expect(a.errors).toEqual([]);
    });

    test("is not able to derive Eq in structs where at least a fields is not Eq", () => {
      const a = new Analysis(
        "Main",
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

      expect(a.errors).toHaveLength(1);
      expect(a.errors[0]?.description).toBeInstanceOf(TraitNotSatified);
    });

    test("requires struct params to be Eq when they appear in struct, for it to be derived", () => {
      const a = new Analysis(
        "Main",
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

      expect(a.errors).toEqual([]);
      expect(getTypes(a)).toEqual({
        example: "Fn(a) -> MyType<b, a> where a: Eq",
        take_eq: "Fn(a) -> a where a: Eq",
      });
    });

    test("derives deps in recursive types", () => {
      // TODO assertion
      const a = new Analysis(
        "Main",
        `
          type Option<a> { None, Some(a) }

          extern let take_eq: Fn(a) -> a where a: Eq
  
          type Rec<a> struct {
            field: Option<Rec<a>>,
          }

          pub let example = {
            take_eq(MyType {
              field: Some(MyType {
                field: None
              })
            })
          }
        `,
      );

      expect(a.errors).toEqual([]);
    });
  });

  test("fails to derives in self-recursive types when not derivable (nested)", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).not.toEqual([]);
  });

  test("forbid ambiguous instantiations", () => {
    const a = new Analysis(
      "Main",
      `extern let take_default: Fn(a) -> x where a: Default
    extern let default: a where a: Default
    pub let forbidden = take_default(default)
    `,
    );

    expect(a.errors).not.toEqual([]);
    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]!.description).toEqual(
      new AmbiguousTypeVar("Default", "Fn(b) -> a where b: Default"),
    );
  });

  test("allow non-ambiguos instantiations", () => {
    resetTraitsRegistry([
      { trait: "Default", moduleName: "Main", typeName: "X" },
    ]);

    const a = new Analysis(
      "Main",
      `
    extern type X

    extern let take_x: Fn(X) -> X
    extern let default: a where a: Default
    pub let forbidden = take_x(default)
`,
    );

    expect(a.errors).toEqual([]);
  });

  test("allow non-ambiguous instantiations when setting let type", () => {
    resetTraitsRegistry([
      { trait: "Default", moduleName: "Main", typeName: "X" },
    ]);

    const a = new Analysis(
      "Main",
      `
    extern type X
    extern let default: a where a: Default

    pub let legal: X = default
`,
    );

    expect(a.errors).toEqual([]);
  });

  test("repro", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(AmbiguousTypeVar);
  });

  test("allow ambiguous type vars in let exprs", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toHaveLength(0);
  });

  test("do not leak allowed instantiated vars when preventing ambiguous vars", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(AmbiguousTypeVar);
  });

  test("do not emit ambiguos type error when variable is unbound", () => {
    resetTraitsRegistry([
      { trait: "Default", moduleName: "Main", typeName: "X" },
    ]);

    const a = new Analysis(
      "Main",
      `
    extern type X
    extern let show: Fn(a) -> X where a: Default

    pub let x = show(unbound_var)
`,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(UnboundVariable);
  });

  // TODO Skip until type sigs are fixed
  test.todo("forbid ambiguous instantiations within args", () => {
    resetTraitsRegistry([
      {
        moduleName: "Main",
        typeName: "Option",
        trait: "Default",
        deps: [["Default"]],
      },
    ]);

    const a = new Analysis(
      "Main",
      `
      extern type Option<a>
      extern let default: a where a: Default
      pub let forbidden: Option<a> = default
  `,
    );

    expect(a.errors).not.toEqual([]);
    expect(a.errors.length).toBe(1);
    expect(a.errors[0]!.description).toEqual(
      new AmbiguousTypeVar("Default", "Option<a> where a: Default"),
    );
  });
});

describe.todo("struct", () => {
  test("allow creating types", () => {
    const a = new Analysis(
      "Main",
      `type Person struct { }
      extern pub let p: Person
    `,
    );

    expect(a.errors).toHaveLength(0);
  });

  test("allow recursive types", () => {
    const a = new Analysis(
      "Main",
      `extern type List<a>
      type Person struct {
        friends: List<Person>,
      }
    `,
    );

    expect(a.errors).toHaveLength(0);
  });

  test("allow accessing a type's field", () => {
    const a = new Analysis(
      "Main",
      `
      extern type String

      type Person struct {
        name: String
      }

      extern let p: Person

      pub let p_name = p.name
    `,
    );

    expect(a.errors).toHaveLength(0);
    expect(getTypes(a)).toEqual({
      p: "Person",
      p_name: "String",
    });
  });

  test("infer type when accessing known field", () => {
    const a = new Analysis(
      "Main",
      `
      extern type String

      type Person struct {
        name: String
      }

      pub let p_name = fn p { p.name }
    `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      p_name: "Fn(Person) -> String",
    });
  });

  test("do not allow invalid field access", () => {
    const a = new Analysis(
      "Main",
      `
      extern type String
      type Person struct {
        name: String
      }

      extern let p: Person
      pub let invalid = p.invalid_field
    `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toEqual(
      new InvalidField("Person", "invalid_field"),
    );
    expect(getTypes(a)).toEqual({
      p: "Person",
      invalid: "a",
    });
  });

  test.todo("handle resolution of other modules' fields", () => {
    const Person = new Analysis(
      "Person",
      `
      extern type String
      pub(..) type Person struct {
        name: String
      }
    `,
    );

    const a = new Analysis(
      "Main",
      `
      import Person.{Person(..)}
      pub let name = fn p { p.name }
    `,
      { dependencies: { Person } },
    );

    expect(a.errors).toHaveLength(0);
    expect(getTypes(a)).toEqual({
      name: "Fn(Person) -> String",
    });
  });

  test("forbid unknown field on unbound value", () => {
    const a = new Analysis("Main", `pub let f = fn p { p.invalid_field }`);

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toEqual(
      new InvalidField("a", "invalid_field"),
    );
  });

  test("prevent resolution of other modules' fields when import is not (..)", () => {
    const Person = new Analysis(
      "Person",
      `
      extern type String
      pub(..) type Person struct {
        name: String
      }
    `,
    );

    const a = new Analysis(
      "Main",
      `
      import Person.{Person}

      extern pub let x: Person // <- this prevents UnusedExposing err

      pub let name = fn p { p.name }
    `,
      { dependencies: { Person } },
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(InvalidField);
  });

  test.todo("emit bad import if trying to import(..) private fields");

  test("allow accessing fields in other modules if public", () => {
    const Person = new Analysis(
      "Person",
      `
      extern type String
      pub(..) type Person struct {
        name: String
      }
    `,
    );

    const a = new Analysis(
      "Main",
      `
      import Person.{Person}

      extern pub let p: Person

      pub let name = p.name 
    `,
      { dependencies: { Person } },
    );

    expect(a.errors).toHaveLength(0);
    expect(getTypes(a)).toEqual({
      p: "Person",
      name: "String",
    });
  });

  test("allow accessing fields in same module with qualified field syntax", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toHaveLength(0);
    expect(getTypes(a)).toEqual({
      name: "Fn(Person) -> String",
    });
  });

  test("emit err when field accessed with qualified syntax is invalid", () => {
    const a = new Analysis(
      "Main",
      `
        type Person struct { }

        pub let name = fn p {
          p.Person#invalid_field
        }
    `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toEqual(
      new InvalidField("Person", "invalid_field"),
    );
  });

  test("allow accessing fields in other modules with qualified field syntax", () => {
    const Person = new Analysis(
      "Person",
      `
      extern type String
      pub(..) type Person struct {
        name: String
      }
    `,
    );

    const a = new Analysis(
      "Main",
      `
      import Person.{Person}

      pub let name = fn p {
        p.Person#name
      }
    `,
      { dependencies: { Person } },
    );

    expect(a.errors).toHaveLength(0);
    expect(getTypes(a)).toEqual({
      name: "Fn(Person) -> String",
    });
  });

  test("emit error when struct of qualified field does not exist", () => {
    const a = new Analysis(
      "Main",
      `
      pub let name = fn p {
        p.InvalidType#name
      }
    `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toEqual(new UnboundType("InvalidType"));
  });

  test("emit error when qualified field does not exist", () => {
    const Person = new Analysis(
      "Person",
      `
        pub(..) type Person struct {}
  `,
    );

    const a = new Analysis(
      "Main",
      `
      import Person.{Person}
      pub let name = fn p {
        p.Person#invalid_field
      }
    `,
      { dependencies: { Person } },
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toEqual(
      new InvalidField("Person", "invalid_field"),
    );
  });

  test("emit error when qualified field is private", () => {
    const Person = new Analysis(
      "Person",
      `
        extern type Int
        pub type Person struct {
          private_field: Int
        }
  `,
    );

    const a = new Analysis(
      "Main",
      `
      import Person.{Person}
      pub let name = fn p {
        p.Person#private_field
      }
    `,
      { dependencies: { Person } },
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toEqual(
      new InvalidField("Person", "private_field"),
    );
  });

  test("emit InvalidField if trying to access private fields", () => {
    const Person = new Analysis(
      "Person",
      `
      extern type String
      pub type Person struct { // note fields are  private
        name: String
      }
    `,
    );

    const a = new Analysis(
      "Main",
      `
      import Person.{Person}

      extern pub let p: Person

      pub let name = p.name 
    `,
      { dependencies: { Person } },
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(InvalidField);
  });

  test("allow creating structs", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      s: "Struct",
    });
  });

  test("typecheck params in struct types", () => {
    const a = new Analysis(
      "Main",
      `
        type Person<a, b, c> struct { }
        extern pub let p: Person
    `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(InvalidTypeArity);
    expect(getTypes(a)).toEqual({
      p: "Person",
    });
  });

  test("handling params in dot access", () => {
    const a = new Analysis(
      "Main",
      `
        type Box<a> struct {
          field: a
        }

        extern type Int
        extern let box: Box<Int>

        pub let field = box.field
    `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      box: "Box<Int>",
      field: "Int",
    });
  });

  test("inferring params in dot access", () => {
    const a = new Analysis(
      "Main",
      `
        type Box<a> struct {
          field: a
        }

        pub let get_field = fn box { box.field }
    `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      get_field: "Fn(Box<a>) -> a",
    });
  });

  test("making sure field values are generalized", () => {
    const a = new Analysis(
      "Main",
      `
      extern type Int
      type Box<a> struct {
        field: a
      }

      pub let get_field_1: Fn(Box<Int>) -> Int = fn box { box.field }
      pub let get_field_2 = fn box { box.field }
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      get_field_1: "Fn(Box<Int>) -> Int",
      get_field_2: "Fn(Box<a>) -> a",
    });
  });

  test("handling params in struct definition (phantom types)", () => {
    const a = new Analysis(
      "Main",
      `
        type Box<a, b> struct { }

        pub let box = Box { }
    `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      box: "Box<a, b>",
    });
  });

  test("typecheck extra fields", () => {
    const a = new Analysis(
      "Main",
      `
        type Struct struct {}

        pub let s = Struct {
          extra: 42
        }
    `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toEqual(
      new InvalidField("Struct", "extra"),
    );

    expect(getTypes(a)).toEqual({
      s: "Struct",
    });
  });

  test("typecheck missing fields", () => {
    const a = new Analysis(
      "Main",
      `
        extern type String
        type Person struct {
          name: String,
          second_name: String,
        }

        pub let p = Person { }
    `,
    );

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toEqual(
      new MissingRequiredFields("Person", ["name", "second_name"]),
    );

    expect(getTypes(a)).toEqual({
      p: "Person",
    });
  });

  test.todo("prevent from creating structs with private fields");

  test("typecheck fields of wrong type", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toHaveLength(1);
    expect(a.errors[0]?.description).toBeInstanceOf(TypeMismatch);

    expect(getTypes(a)).toEqual({
      s: "Struct",
    });
  });

  test("handling params in struct definition when fields are bound to params", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      box: "Box<String, Int>",
    });
  });

  test("instantiated fresh vars when creating structs", () => {
    const a = new Analysis(
      "Main",
      `
      type Box<a> struct { a: a }

      pub let str_box = Box { a: "abc" }
      pub let int_box = Box { a: 42 }
  `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      str_box: "Box<String>",
      int_box: "Box<Int>",
    });
  });

  test("updating a infers the spread arg", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual({
      set_a: "Fn(Box<Int>) -> Box<Int>",
    });
  });

  test("allow to specify a subset of the fields when update another struct", () => {
    const a = new Analysis(
      "Main",
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

    expect(a.errors).toEqual([]);
  });

  test.todo("namespaced struct names");
});

describe.todo("prelude", () => {
  test("intrinsics' types are not visible by default", () => {
    const a = new Analysis("Main", `pub let x: Int = 0`);
    expect(a.errors).toEqual<ErrorInfo[]>([
      expect.objectContaining<ErrorInfo["description"]>(new UnboundType("Int")),
    ]);
  });

  test("checks extern types", () => {
    const a = new Analysis(
      "Main",
      `extern type ExtType
     extern pub let x : ExtType
     pub let y: ExtType = x
    `,
    );

    expect(a.errors).toEqual([]);
  });

  test("typechecks extern values", () => {
    const a = new Analysis(
      "Main",
      `
     type Unit { }
     extern pub let x : Unit
     pub let y = x
    `,
    );

    expect(a.errors).toEqual([]);
    expect(getTypes(a)).toEqual(
      expect.objectContaining({
        y: "Unit",
      }),
    );
  });
});

test.todo("type error when main has not type Task<Unit>", () => {
  const a = new Analysis("Main", `pub let main = "not-task-type"`);
  expect(a.errors).toHaveLength(1);
  expect(a.errors[0]?.description).toBeInstanceOf(TypeMismatch);
});

function getTypes(a: Analysis): Record<string, string> {
  const kvs = [...a.getPublicDeclarations()].map((decl) => {
    const [, mono] = a.getDeclarationType(decl);
    // TODO scheme

    return [decl.binding.name, typeToString(mono)];
  });
  return Object.fromEntries(kvs);
}

beforeEach(() => {
  resetTraitsRegistry();
});
