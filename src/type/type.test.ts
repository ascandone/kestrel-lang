import { test, expect, beforeEach, describe } from "vitest";
import {
  ConcreteType,
  DUMMY_STORE,
  TVar,
  TVarResolution,
  TraitsStore,
  Type,
  UnifyError,
  resolveType,
  typeToString,
  unify as unify_,
} from "./type";
import {
  BASICS_MODULE,
  Bool,
  Int,
  List,
  Option,
  Tuple,
} from "./__test__/types";
import { CORE_PACKAGE } from "../typecheck";

function unify(t1: Type, t2: Type, store = DUMMY_STORE) {
  return unify_(t1, t2, store);
}

beforeEach(() => {
  TVar.resetId();
});

describe("unify", () => {
  test("unifing two concrete vars when they match", () => {
    expect(unify(Int, Int)).toBeUndefined();
    expect(unify(List(Int), List(Int))).toBeUndefined();
    expect(unify(Fn([Int], Int), Fn([Int], Int))).toBeUndefined();
  });

  test("do not unify concrete types from different modules", () => {
    expect(
      unify(Int, { ...Int, module: "AnotherModule" } as any),
    ).not.toBeUndefined();
  });

  test("do not unify concrete types same different module of different packages", () => {
    expect(
      unify(Int, { ...Int, package_: "another_package" } as any),
    ).not.toBeUndefined();
  });

  test("unify two concrete vars that do not match", () => {
    expect(unify(Int, Bool)).toEqual<UnifyError>({
      type: "type-mismatch",
      left: Int,
      right: Bool,
    });
    expect(
      unify(
        {
          package_: CORE_PACKAGE,
          module: "Mod",
          type: "named",
          name: "T",
          args: [
            {
              package_: CORE_PACKAGE,
              module: "Mod",
              type: "named",
              name: "X",
              args: [],
            },
          ],
        },
        {
          package_: CORE_PACKAGE,
          module: "Mod",
          type: "named",
          name: "T",
          args: [],
        },
      ),
    ).not.toBeUndefined();
    expect(unify(List(Int), List(Bool))).not.toBeUndefined();
    expect(unify(Fn([Int], Int), Fn([], Int))).not.toBeUndefined();
    expect(unify(Fn([Int], Int), Fn([Bool], Int))).not.toBeUndefined();
    expect(unify(Fn([Int], Int), Fn([Int], Bool))).not.toBeUndefined();
    expect(unify(Fn([], Int), Int)).not.toBeUndefined();
  });

  test("TypeVar is unbound initially", () => {
    const $a = TVar.fresh();

    expect($a.resolve()).toEqual<TVarResolution>({
      type: "unbound",
      id: 0,
      traits: new Set(),
    });
  });

  test("unify a concrete type and a var", () => {
    const $a = TVar.fresh();
    unify($a.asType(), Int);

    expect($a.resolve()).toEqual<TVarResolution>({
      type: "bound",
      value: Int,
    });
  });

  test("unify a var and a concrete type", () => {
    const $a = TVar.fresh();
    unify(Int, $a.asType());

    expect($a.resolve()).toEqual<TVarResolution>({
      type: "bound",
      value: Int,
    });
  });

  test("unify to another TVar", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();
    unify($a.asType(), $b.asType());
    expect($a.resolve()).toEqual<TVarResolution>($b.resolve());
  });

  test("unify to another bound TVar should fail", () => {
    const $a = TVar.fresh();
    unify($a.asType(), Int);

    const $b = TVar.fresh();
    unify($b.asType(), Bool);

    const $c = TVar.fresh();
    unify($b.asType(), $c.asType());

    expect(unify($a.asType(), $c.asType())).toEqual<UnifyError>({
      type: "type-mismatch",
      left: Bool,
      right: Int,
    });
  });

  test("unify 3 lvars", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();
    const $c = TVar.fresh();

    unify($a.asType(), $c.asType());
    unify($c.asType(), $b.asType());
    unify($a.asType(), Int);

    expect($a.resolve()).toEqual<TVarResolution>({
      type: "bound",
      value: Int,
    });
    expect($b.resolve()).toEqual<TVarResolution>({
      type: "bound",
      value: Int,
    });
    expect($c.resolve()).toEqual<TVarResolution>({
      type: "bound",
      value: Int,
    });
  });

  test("TVars should be reactive (left)", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();

    unify($a.asType(), $b.asType());
    unify($b.asType(), Int);

    expect($a.resolve(), "a").toEqual<TVarResolution>({
      type: "bound",
      value: Int,
    });
    expect($b.resolve(), "b").toEqual<TVarResolution>({
      type: "bound",
      value: Int,
    });
  });

  test("TVars should be reactive (right)", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();

    unify($b.asType(), $a.asType());
    unify($b.asType(), Int);

    expect($a.resolve(), "a").toEqual<TVarResolution>({
      type: "bound",
      value: Int,
    });
    expect($b.resolve(), "b").toEqual<TVarResolution>({
      type: "bound",
      value: Int,
    });
  });

  test("trying to link a linked var (1)", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();
    const $c = TVar.fresh();

    unify($c.asType(), $a.asType()); // a~>c
    unify($b.asType(), $a.asType()); // a~>b
    unify($b.asType(), Int); // b=Int

    expect($a.resolve(), "a").toEqual({ type: "bound", value: Int });
    expect($b.resolve(), "b").toEqual({ type: "bound", value: Int });
    expect($c.resolve(), "c").toEqual({ type: "bound", value: Int });
  });

  test("trying to link a linked var (2)", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();
    const $c = TVar.fresh();

    unify($a.asType(), $c.asType());
    unify($a.asType(), $b.asType());
    unify($b.asType(), Int);

    expect($a.resolve(), "a").toEqual({ type: "bound", value: Int });
    expect($b.resolve(), "b").toEqual({ type: "bound", value: Int });
    expect($c.resolve(), "c").toEqual({ type: "bound", value: Int });
  });

  test("trying to unify two linked vars", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();
    const $c = TVar.fresh();
    const $d = TVar.fresh();

    unify($b.asType(), $a.asType()); // a~>b
    unify($d.asType(), $c.asType()); // c~>d
    unify($a.asType(), $c.asType()); // c~>a

    unify($b.asType(), Int);

    expect($a.resolve(), "a").toEqual({ type: "bound", value: Int });
    expect($b.resolve(), "b").toEqual({ type: "bound", value: Int });
    expect($c.resolve(), "c").toEqual({ type: "bound", value: Int });
    expect($d.resolve(), "d").toEqual({ type: "bound", value: Int });
  });

  test("unify to another TVar", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();
    unify($a.asType(), $b.asType());
    expect($a.resolve()).toEqual<TVarResolution>({
      type: "unbound",
      id: 0,
      traits: new Set(),
    });
    expect($a.resolve()).toEqual($b.resolve());
  });

  test("unify nested TVar", () => {
    const $a = TVar.fresh();
    unify(List($a.asType()), List(Bool));
    expect($a.resolve()).toEqual<TVarResolution>({
      type: "bound",
      value: Bool,
    });
  });

  test("unify twice to a const", () => {
    const $a = TVar.fresh();

    unify($a.asType(), Int);
    unify($a.asType(), Int);

    expect($a.resolve()).toEqual<TVarResolution>({
      type: "bound",
      value: Int,
    });
  });

  test("unify to a const, then to a different one should fail", () => {
    const $a = TVar.fresh();

    unify($a.asType(), Int);
    expect(unify($a.asType(), Bool)).toEqual<UnifyError>(
      expect.objectContaining({ type: "type-mismatch" }),
    );
  });

  test("transitive unifications", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();
    unify($a.asType(), $b.asType());
    unify($a.asType(), Int);

    expect($a.resolve(), "a == Int").toEqual({
      type: "bound",
      value: Int,
    });
    expect($b.resolve(), "b == Int").toEqual({
      type: "bound",
      value: Int,
    });
  });

  test("transitive unifications (3)", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();
    const $c = TVar.fresh();

    unify($a.asType(), $b.asType());
    unify($b.asType(), $c.asType());

    expect($a.resolve(), "a").toEqual<TVarResolution>({
      type: "unbound",
      id: 0,
      traits: new Set(),
    });
    expect($b.resolve(), "b").toEqual<TVarResolution>({
      type: "unbound",
      id: 0,
      traits: new Set(),
    });
    expect($b.resolve(), "c").toEqual<TVarResolution>({
      type: "unbound",
      id: 0,
      traits: new Set(),
    });

    unify($a.asType(), Bool);

    expect($a.resolve(), "a == true").toEqual<TVarResolution>({
      type: "bound",
      value: Bool,
    });
    expect($b.resolve(), "b == true").toEqual<TVarResolution>({
      type: "bound",
      value: Bool,
    });
    expect($c.resolve(), "b == true").toEqual<TVarResolution>({
      type: "bound",
      value: Bool,
    });
  });

  test("recursively linked TVars", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();

    unify($a.asType(), $b.asType());
    unify($b.asType(), $a.asType());

    expect($a.resolve()).toEqual($b.resolve());
  });

  test("recursively linked TVars (3 steps)", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();
    const $c = TVar.fresh();

    unify($a.asType(), $b.asType());
    unify($b.asType(), $c.asType());
    unify($c.asType(), $a.asType());

    expect($a.resolve()).toEqual($b.resolve());
    expect($a.resolve()).toEqual($c.resolve());
  });

  test("occurs check in named types", () => {
    const $a = TVar.fresh();
    expect(unify($a.asType(), List($a.asType()))).toEqual<UnifyError>({
      type: "occurs-check",
      left: $a.asType(),
      right: List($a.asType()),
    });
  });

  test("occurs check in fn args", () => {
    const $a = TVar.fresh();
    expect(unify($a.asType(), Fn([$a.asType()], Int))).not.toBeUndefined();
  });

  test("occurs check in fn ret", () => {
    const $a = TVar.fresh();
    expect(unify($a.asType(), Fn([], $a.asType()))).not.toBeUndefined();
  });

  test("occurs check of unified values", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();

    unify($a.asType(), $b.asType());

    expect(unify($a.asType(), List($b.asType()))).toEqual<UnifyError>({
      type: "occurs-check",
      left: $a.asType(),
      right: List($b.asType()),
    });
  });

  test("unify rigid vars when equal", () => {
    expect(
      unify({ type: "rigid-var", name: "a" }, { type: "rigid-var", name: "a" }),
    ).toEqual(undefined);
  });

  test("don't unify rigid vars when different", () => {
    const $a = TVar.fresh().asType();

    expect(
      unify($a, {
        type: "rigid-var",
        name: "a",
      }),
    ).toBeUndefined();

    expect(resolveType($a)).toEqual({
      type: "rigid-var",
      name: "a",
    });
  });

  test("dont' unify rigid vars with named types", () => {
    expect(unify({ type: "rigid-var", name: "a" }, Int)).not.toBeUndefined();
  });

  test("unify rigid vars with tvars", () => {
    expect(unify({ type: "rigid-var", name: "a" }, Int)).not.toBeUndefined();
  });
});

describe("typeToString", () => {
  test("0-arity types", () => {
    expect(typeToString(Int)).toBe("Int");
  });

  test("n-arity types", () => {
    expect(typeToString(List(Int))).toBe("List<Int>");
    expect(typeToString(Tuple(Int, Bool))).toBe("(Int, Bool)");
  });

  test("nested types", () => {
    expect(typeToString(List(Option(Int)))).toBe("List<Option<Int>>");
  });

  test("type var", () => {
    const $a = TVar.fresh();
    expect(typeToString($a.asType())).toBe("a");
  });

  test("type vars", () => {
    const $a = TVar.fresh(),
      $b = TVar.fresh();

    expect(typeToString(Tuple($a.asType(), $b.asType()))).toBe("(a, b)");
  });

  test("bound types", () => {
    const $a = TVar.fresh();
    unify($a.asType(), Int);

    expect(typeToString(List($a.asType()))).toBe("List<Int>");
  });

  test("fn type with no args", () => {
    expect(typeToString(Fn([], Bool))).toBe("Fn() -> Bool");
  });

  test("fn type with one args", () => {
    expect(typeToString(Fn([Int], Bool))).toBe("Fn(Int) -> Bool");
  });

  test("fn type with two args ", () => {
    expect(typeToString(Fn([Int, Bool], Bool))).toBe("Fn(Int, Bool) -> Bool");
  });

  test("higher order function", () => {
    const f = Fn([Fn([Int], Bool)], Bool);
    expect(typeToString(f)).toBe("Fn(Fn(Int) -> Bool) -> Bool");
  });

  test("tv as arg", () => {
    const $a = TVar.fresh();
    expect(typeToString(Fn([$a.asType()], $a.asType()))).toBe("Fn(a) -> a");
  });

  test("n-arity type nested in a fn", () => {
    const f = Fn([List(Int)], Option(Bool));
    expect(typeToString(f)).toBe("Fn(List<Int>) -> Option<Bool>");
  });

  test("handle scheme", () => {
    const f = TVar.fresh().asType();
    expect(typeToString(f, { a: new Set() })).toBe("b");
  });

  test("closure", () => {
    const a = TVar.fresh().asType();
    expect(typeToString(a)).toBe("a");
  });

  test("traits from rigid vars", () => {
    expect(
      typeToString(
        {
          type: "rigid-var",
          name: "a",
        },
        { a: new Set(["Show"]) },
      ),
    ).toBe("a where a: Show");
  });

  test("traits from flex vars", () => {
    const $a = TVar.fresh(["Show"]);
    expect(typeToString($a.asType(), {})).toBe("a where a: Show");
  });

  test("mixed rigid vars and flex vars traits", () => {
    const b = TVar.fresh().asType();
    const c = TVar.fresh(["Read"]).asType();
    const f: Type = {
      type: "fn",
      args: [{ type: "rigid-var", name: "a" }, b],
      return: c,
    };

    expect(
      typeToString(f, {
        a: new Set(["Ord", "Show"]),
        // b: new Set(["Read"]),
      }),
    ).toBe("Fn(a, b) -> c where a: Ord + Show, c: Read");
  });
});

describe("traits", () => {
  test("types can be instantiated with traits", () => {
    expect(TVar.fresh(["ord"]).resolve()).toEqual({
      type: "unbound",
      id: 0,
      traits: new Set(["ord"]),
    });
  });

  test("merge traits in unified tvars", () => {
    const $a = TVar.fresh(["ord"]);
    const $b = TVar.fresh(["eq"]);

    unify($a.asType(), $b.asType());

    expect($a.resolve()).toEqual<TVarResolution>(
      expect.objectContaining({
        traits: new Set(["ord", "eq"]),
      }),
    );

    expect($b.resolve()).toEqual<TVarResolution>(
      expect.objectContaining({
        traits: new Set(["ord", "eq"]),
      }),
    );
  });

  test("transitively unify traits", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();
    unify($a.asType(), $b.asType());

    const $c = TVar.fresh(["eq"]);
    unify($a.asType(), $c.asType());

    expect($a.resolve()).toEqual<TVarResolution>(
      expect.objectContaining({
        traits: new Set(["eq"]),
      }),
    );

    expect($b.resolve()).toEqual<TVarResolution>(
      expect.objectContaining({
        traits: new Set(["eq"]),
      }),
    );
  });

  test("fail when trying to unify a tvar with a concrete type that does implement the trait", () => {
    const $a = TVar.fresh(["Ord"]);

    expect(unify($a.asType(), Int)).toEqual<UnifyError>({
      type: "missing-trait",
      type_: Int,
      trait: "Ord",
    });
  });

  test("transitively fail when trying to unify a tvar with a concrete type that does implement the trait", () => {
    const $a = TVar.fresh();
    unify($a.asType(), Int);

    const $b = TVar.fresh(["Ord"]);

    expect(unify($a.asType(), $b.asType())).toEqual<UnifyError>({
      type: "missing-trait",
      type_: Int,
      trait: "Ord",
    });
  });

  test("succeed to unify a tvar with a concrete type that implements the trait", () => {
    const store = mkStore({
      [`${CORE_PACKAGE}.${BASICS_MODULE}.Int`]: {
        Ord: [],
      },
    });

    const $a = TVar.fresh(["Ord"]);

    expect(unify($a.asType(), Int, store)).toEqual(undefined);
  });

  test("fails to unify a tvar with a concrete type that implements the trait when type vars don't", () => {
    // TVar.registerTraitImpl(BASICS_MODULE, "List", "Ord", [["Ord"]]);

    const $a = TVar.fresh(["Ord"]);

    expect(unify($a.asType(), List(Int))).toEqual<UnifyError>({
      type: "missing-trait",
      type_: List(Int),
      trait: "Ord",
    });
  });

  test("succeeds to unify a tvar with a concrete type that implements the trait (including type args)", () => {
    const store = mkStore({
      [`${CORE_PACKAGE}.${BASICS_MODULE}.List`]: {
        Ord: [["Ord"]],
      },
      [`${CORE_PACKAGE}.${BASICS_MODULE}.Int`]: {
        Ord: [],
      },
    });

    const $a = TVar.fresh(["Ord"]);

    expect(unify($a.asType(), List(Int), store)).toEqual(undefined);
  });

  test("traits are unified to type args", () => {
    // impl ord for List<a> where a: ord
    // unify(a: ord, List<b>)
    // => b: ord

    const store = mkStore({
      [`${CORE_PACKAGE}.${BASICS_MODULE}.List`]: {
        Ord: [["Ord"]],
      },
    });

    const $a = TVar.fresh(["Ord"]);
    const $b = TVar.fresh();

    expect(unify($a.asType(), List($b.asType()), store)).toEqual(undefined);

    expect($b.resolve()).toEqual({
      type: "unbound",
      id: 1,
      traits: new Set(["Ord"]),
    });
  });

  test("fails to unify dependencies when to not impl required trait", () => {
    // impl ord for List<a> where a: ord
    // unify(List<a: ord>, List<Int>) => fail

    const store = mkStore({
      [`${CORE_PACKAGE}.${BASICS_MODULE}.List`]: {
        Ord: [["Ord"]],
      },
    });

    const $a = TVar.fresh(["Ord"]);

    expect(unify(List($a.asType()), List(Int), store)).toEqual<UnifyError>({
      type: "missing-trait",
      trait: "Ord",
      type_: Int,
    });
  });
});

function Fn(args: Type[], ret: Type): ConcreteType {
  return { type: "fn", args, return: ret };
}

/**
 * intented for tests
 * e.g.
 * { "kestrel_core.My.Mod.Int": { Show: [["Show"]] } }
 * */
export function mkStore(
  staticStore: Record<
    `${string}.${string}.${string}`,
    Record<string, string[][]>
  >,
): TraitsStore {
  return {
    getNamedTypeDependencies(type_, trait) {
      const key = `${type_.package_}.${type_.module}.${type_.name}` as const;
      const deps = staticStore[key]?.[trait];
      if (deps === undefined) {
        return undefined;
      }

      return deps.map((dep) => new Set(dep));
    },
  };
}
