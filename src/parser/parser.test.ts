import { expect, test, describe } from "vitest";
import { parse, unsafeParse } from "./parser";
import { UntypedModule } from "./ast";
import { rangeOf } from "../typecheck/typedAst/__test__/utils";

test("parsing a declaration", () => {
  const src = "let x = 0";
  expect(unsafeParse(src)).toEqual<UntypedModule>({
    lineComments: [],
    imports: [],
    typeDeclarations: [],
    declarations: [
      {
        pub: false,
        extern: false,
        inline: false,
        binding: { name: "x", range: rangeOf(src, "x") },
        value: {
          type: "constant",
          value: {
            type: "int",
            value: 0,
          },
          range: rangeOf(src, "0"),
        },
        range: rangeOf(src, src),
      },
    ],
  });
});

test("parsing two declarations", () => {
  const src = `let x = 0\nlet y = 1`;
  expect(unsafeParse(src)).toEqual<UntypedModule>({
    lineComments: [],
    imports: [],
    typeDeclarations: [],
    declarations: [
      {
        pub: false,
        extern: false,
        inline: false,
        binding: { name: "x", range: rangeOf(src, "x") },
        value: {
          type: "constant",
          value: {
            type: "int",
            value: 0,
          },
          range: rangeOf(src, "0"),
        },
        range: rangeOf(src, "let x = 0"),
      },
      {
        pub: false,
        extern: false,
        inline: false,
        binding: { name: "y", range: rangeOf(src, "y") },
        value: {
          type: "constant",
          value: {
            type: "int",
            value: 1,
          },
          range: rangeOf(src, "1"),
        },
        range: rangeOf(src, "let y = 1"),
      },
    ],
  });
});

test("parse float", () => {
  const src = "let _ = 1.23";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse empty strings", () => {
  const src = `let _ = ""`;
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse nonempty strings", () => {
  const src = `let _ = "abc"`;
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse chars", () => {
  const src = `let _ = 'a'`;
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse strings with newlines", () => {
  const src = String.raw`let _ = "ab\nc"`;
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse strings with escaped quotes", () => {
  const src = String.raw`let _ = "ab\"c"`;
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse + expr", () => {
  const src = "let _ = 1 + 2";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("+ is left-associative", () => {
  const src = "let _ = 1 + 2 + 3";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse +. expr", () => {
  const src = "let _ = 1 +. 2";
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

test("parse <= and && prec", () => {
  const src = "let _ = a <= b || y";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse + and * prec with parens", () => {
  const src = "let _ = (1 - 2) * 3";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse unary ! expr", () => {
  const src = "let _ = ! b";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse ident", () => {
  const src = "let _ = ab_c2";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("a constructor ident shouldn't be allowed in let binding", () => {
  const src = "let X = x";
  expect(() => unsafeParse(src)).toThrow();
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

test.todo("parse if-else syntax sugar", () => {
  const src = `
    let _ = if b { 0 } else if { 1 } else { 2 }
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

test("parse tuple sugar", () => {
  const src = "let _ = (1, 2)";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse empty list sugar", () => {
  const src = "let _ = []";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse singleton list sugar", () => {
  const src = "let _ = [42]";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse list sugar with many values", () => {
  const src = "let _ = [0, 1, 2]";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse conslist sugar", () => {
  const src = "let _ = hd :: tl";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("parse cons operator is right-associative", () => {
  const src = "let _ = a :: b :: nil";
  expect(unsafeParse(src)).toMatchSnapshot();
});

test("monadic let syntax sugar", () => {
  const src = `
    let _ = {
      let#bind_f x = expr;
      body
    }
  `;

  // This should desugar to:
  /*
    let _ = bind_f(expr, fn x {
      body
    })
  */

  expect(unsafeParse(src)).toMatchSnapshot();
});

test("monadic let syntax sugar should handle qualified names", () => {
  const src = `
    let _ = {
      let#Task.bind x = expr;
      body
    }
  `;

  expect(unsafeParse(src)).toMatchSnapshot();
});

test("monadic let syntax sugar should not contain space", () => {
  const src = `
    let _ = {
      let #bind_f x = expr;
      value
    }
  `;

  expect(() => unsafeParse(src)).toThrow();
});

test("pipe syntax sugar", () => {
  const src = `
    let _ = a |> f(x, y)
  `;

  // This should desugar to:
  //  f(a, x, y)

  expect(unsafeParse(src)).toMatchSnapshot();
});

test("pipe syntax sugar should handle qualified names", () => {
  const src = `
    let _ = Mod.a |> f(x, y)
  `;

  expect(unsafeParse(src)).toMatchSnapshot();
});

test("pipe syntax sugar should be chainable", () => {
  const src = `
    let _ = a |> f() |> g()
  `;

  // This should desugar to:
  //  g(f(a))

  expect(unsafeParse(src)).toMatchSnapshot();
});

test("it should be possible to mix pipe with infix", () => {
  const src = `
    let _ = 1 + 2 |> f() |> g()
  `;

  // This should desugar to:
  //  g(f(1 + 2))

  expect(unsafeParse(src)).toMatchSnapshot();
});

test("ignoring comments", () => {
  const src = `
    // ignoring comments
    let _ = 42
  `;

  expect(unsafeParse(src)).toMatchSnapshot();
});

describe("type hints", () => {
  test("parses a concrete type with no args as a type hint", () => {
    const src = "let x : Int = 0";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("parses a concrete type with no args as a type hint (no whitespace after binding)", () => {
    const src = "let x: Int = 0";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("parses a concrete type with no args as a type hint (extern)", () => {
    const src = "extern let x: Int";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("parses underscore type", () => {
    const src = "let x : _ = 0";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("parses concrete type with 1 arg", () => {
    const src = "let x : Option<Int> = 0";
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

  test("parses tuple type syntax sugar", () => {
    const src = "let x : (Int, Maybe<Int>) = 0";
    expect(unsafeParse(src)).toMatchSnapshot();
  });
});

describe("traits", () => {
  test("parses traits in a polytype", () => {
    const src = "extern let x: a where a: Ord";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("parses many traits in a polytype for the same tvar", () => {
    const src = "extern let x: a where a: Ord + Eq";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("parses traits for many vars", () => {
    const src = "extern let x: (a, b) where a: Ord, b: Show";
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

  test("type with a variant with one arg", () => {
    const src = "type T { C(Arg) }";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("type with a variant with many args", () => {
    const src = "type T { C(A, B) }";
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

describe("structs", () => {
  test("empty struct", () => {
    const src = `type Person struct { }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("pub modifier", () => {
    const src = `pub type Person struct { }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("pub(..) modifier", () => {
    const src = `pub(..) type Person struct { }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("type params", () => {
    const src = `type Person<a, b> struct { }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("doc comments", () => {
    const src = `
      /// example docs
      type Person struct { }
    `;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("field", () => {
    const src = `type Person struct { age: Int }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("many fields", () => {
    const src = `
      type Person struct {
        name: a,
        age: b, 
      }
    `;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("field access", () => {
    const src = `let _ = s.my_field`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("construct fields with no fields", () => {
    const src = `let _ = MyStruct { }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("construct fields with many fields", () => {
    const src = `
      let _ = MyStruct {
        a: 42,
        b: "ok",
      }
    `;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("update a struct", () => {
    const src = `
      let _ = MyStruct {
        a: 42,
        b: "ok",
        ..expr
      }
    `;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test.todo("complex exprs in update syntax");

  test("qualified field access", () => {
    const src = `let _ = s.MyStruct#my_field`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test.todo("namespaced-qualified field access");
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

  test("matching many clauses, without trailing comma", () => {
    const src = `let _ = match x { a => ret_a, b => ret_b  }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("matching many clauses, with trailing comma", () => {
    const src = `let _ = match x { a => ret_a, b => ret_b,  }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("matching constructor with no args", () => {
    const src = `let _ = match x { X => res }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("matching constructor with one arg", () => {
    const src = `let _ = match x { X(a) => res }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("matching int literals", () => {
    const src = `let _ = match x { 42 => res }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("matching float literals", () => {
    const src = `let _ = match x { 1.1 => res }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("matching str literals", () => {
    const src = `let _ = match x { "abc" => res }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("matching char literals", () => {
    const src = `let _ = match x { 'a' => res }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("matching tuples literal (syntax sugar)", () => {
    const src = `let _ = match x { (x, y) => res }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("matching cons literal (syntax sugar)", () => {
    const src = `let _ = match x { hd :: tl => res }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("matching cons literal is right assoc", () => {
    const src = `let _ = match x { hd :: tl :: Nil => res }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("matching cons nested in tuple", () => {
    const src = `let _ = match x { (hd :: Nil, y) => res }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("matching qualified constructors", () => {
    const src = `let _ = match x { A/B.Constr(a, b) => 42 }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("matching pattern in let", () => {
    const src = `let _ = { let X(a, b :: c) = x; res }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("matching pattern in let#", () => {
    const src = `let _ = { let#ident X(a, b :: c) = x; res }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("matching pattern in fn param", () => {
    const src = `let _ = fn X(a, b) { 42 }`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });
});

describe("extern bindings", () => {
  test("types", () => {
    const src = `
      extern type T
    `;

    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("let decls", () => {
    const src = `
      extern let x: Int
    `;

    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("let decls defining infix operators", () => {
    const src = `
      extern let (>=>): ExampleType
    `;

    expect(unsafeParse(src)).toMatchSnapshot();
  });
});

describe("imports", () => {
  test("parse pub modifier", () => {
    const src = "pub let _ = 1.23";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("parse pub modifier on extern values", () => {
    const src = "extern pub let _: Int";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("parse pub modifier on types", () => {
    const src = "pub type T { }";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("parse pub(..) modifier on types", () => {
    const src = "pub(..) type T { }";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("parse pub modifier on extern types", () => {
    const src = "extern pub type T";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("import single module", () => {
    const src = "import A";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("import nested modules", () => {
    const src = "import A/B/C";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("unqualified import of a value", () => {
    const src = "import A/B/C.{imported}";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("unqualified import of an infix value", () => {
    const src = "import A.{(+)}";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("unqualified import of values", () => {
    const src = "import A/B/C.{x, y, z}";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("unqualified import of types", () => {
    const src = "import A/B/C.{T1, T2}";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("unqualified import of types (non-opaque)", () => {
    const src = "import A/B/C.{T1(..)}";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("identifiers can be qualified", () => {
    const src = "let x = A/B.name";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("type defs can be qualified", () => {
    const src = "extern let x: A/B.MyType";
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("type constructors can be qualified", () => {
    const src = "let x = A/B.Name";
    expect(unsafeParse(src)).toMatchSnapshot();
  });
});

describe("Comments", () => {
  test("doc comments", () => {
    const src = `
    /// first line
    /// second line
    let x = 0
    `;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("doc comments on externs", () => {
    const src = `
    /// first line
    /// second line
    extern let x: X
    `;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("doc comments with many declrs", () => {
    const src = `
    let x = 0

    /// comment
    pub let y = 1
    `;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("doc comments on types", () => {
    const src = `
    /// first line
    /// second line
    type X {}
    `;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("doc comments on extern types", () => {
    const src = `
    /// first line
    /// second line
    extern type X
    `;
    expect(unsafeParse(src)).toMatchSnapshot();
  });

  test("moduledoc comments", () => {
    const src = `
    //// Module level comment
    //// Second line
    let x = 0
    `;
    expect(unsafeParse(src)).toMatchSnapshot();
  });
});

describe("Decorators", () => {
  test("inline decorator", () => {
    const src = `@inline pub let x = 0`;
    expect(unsafeParse(src)).toMatchSnapshot();
  });
});

describe("Fault tolerance", () => {
  test("faulty infix", () => {
    const src = `let x = 1 +`;
    expect(parse(src).parsed).toMatchSnapshot();
  });

  test("faulty decl", () => {
    const src = `
      let
      let x = 42
    `;
    expect(parse(src).parsed).toMatchSnapshot();
  });

  test("missing expr", () => {
    const src = `let x =   `;
    expect(parse(src).parsed).toMatchSnapshot();
  });

  test("missing string lit termination", () => {
    const src = `let x = "`;

    expect(parse(src).parsed).toMatchSnapshot();
  });

  test("dot notation in struct", () => {
    const src = `let x = str. `;
    // "str:" 8 - 12

    expect(parse(src).parsed).toMatchSnapshot();
  });
});
