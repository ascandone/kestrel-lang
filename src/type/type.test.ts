import { test, expect, beforeEach, describe } from "vitest";
import {
  ConcreteType,
  TVar,
  TVarResolution,
  Type,
  UnifyError,
  generalizeAsScheme,
  instantiateFromScheme,
  typeToString,
  unify,
} from "./type";
import {
  BASICS_MODULE,
  Bool,
  Int,
  List,
  Option,
  Tuple,
} from "./__test__/types";

beforeEach(() => {
  TVar.resetId();
  TVar.resetTraitImpls();
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

  test("unify two concrete vars that do not match", () => {
    expect(unify(Int, Bool)).toEqual<UnifyError>({
      type: "type-mismatch",
      left: Int,
      right: Bool,
    });
    expect(
      unify(
        {
          module: "Mod",
          type: "named",
          name: "T",
          args: [{ module: "Mod", type: "named", name: "X", args: [] }],
        },
        { module: "Mod", type: "named", name: "T", args: [] },
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
      traits: [],
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
      traits: [],
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
      traits: [],
    });
    expect($b.resolve(), "b").toEqual<TVarResolution>({
      type: "unbound",
      id: 0,
      traits: [],
    });
    expect($b.resolve(), "c").toEqual<TVarResolution>({
      type: "unbound",
      id: 0,
      traits: [],
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
});

describe("generalization", () => {
  test("generalize concrete", () => {
    expect(generalizeAsScheme(Int)).toEqual({});
  });

  test("generalize var bound to a primitive", () => {
    const $a = TVar.fresh();
    unify($a.asType(), Int);
    expect(generalizeAsScheme($a.asType())).toEqual({});
  });

  test("generalize single unbound var", () => {
    const $a = TVar.fresh();
    expect(generalizeAsScheme($a.asType())).toEqual({ 0: "a" });
  });

  test("generalize single unbound var when ident is already used", () => {
    TVar.fresh();
    const $b = TVar.fresh();
    expect(generalizeAsScheme($b.asType(), { 0: "a" })).toEqual({
      0: "a",
      1: "b",
    });
  });

  test("generalize unbound var in fn args", () => {
    const $a = TVar.fresh();
    expect(generalizeAsScheme(Fn([$a.asType()], Int))).toEqual({ 0: "a" });
  });

  test("generalize unbound var in fn return", () => {
    const $a = TVar.fresh();
    expect(generalizeAsScheme(Fn([], $a.asType()))).toEqual({ 0: "a" });
  });

  test("generalize many vars", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();
    expect(generalizeAsScheme(Tuple($a.asType(), $b.asType()))).toEqual({
      0: "a",
      1: "b",
    });
  });

  test("generalize many vars when linked", () => {
    const $a = TVar.fresh();
    expect(generalizeAsScheme(Tuple($a.asType(), $a.asType()))).toEqual({
      0: "a",
    });
  });

  test("generalize var bound to a nested type to generalize ", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();
    unify($a.asType(), Tuple($b.asType(), $b.asType()));
    expect(generalizeAsScheme($a.asType())).toEqual({ 1: "a" });
  });

  test("instantiate concrete type", () => {
    const m = instantiateFromScheme(Int, {});
    expect(m).toEqual(Int);
  });

  test("instantiate fn", () => {
    const m = instantiateFromScheme(Fn([Int], Bool), {});
    expect(m).toEqual(Fn([Int], Bool));
  });

  test("instantiate single var", () => {
    const ta = TVar.fresh().asType();

    const scheme = generalizeAsScheme(ta);
    const taI = instantiateFromScheme(ta, scheme);

    if (taI.type !== "var") {
      throw new Error();
    }

    expect(taI.var.resolve().type).toBe("unbound");
    expect(taI.var.resolve()).not.toEqual(ta.var.resolve());
  });

  test("instantiate two different vars", () => {
    const ta = TVar.fresh().asType();
    const tb = TVar.fresh().asType();
    const t = Tuple(ta, tb);
    const scheme = generalizeAsScheme(t);

    const m = instantiateFromScheme(t, scheme);

    if (m.type !== "named") {
      throw new Error("fail");
    }

    const [$ai, $bi] = m.args;

    expect(($ai as any).var.resolve().type).toEqual("unbound");
    expect(($bi as any).var.resolve().type).toEqual("unbound");
    expect(($ai as any).var.resolve().id).not.toEqual(
      ($bi as any).var.resolve().id,
    );
  });

  test("instantiate two same vars", () => {
    const ta = TVar.fresh().asType();

    const t = Tuple(ta, ta);
    const scheme = generalizeAsScheme(t);

    const m = instantiateFromScheme(t, scheme);

    if (m.type !== "named") {
      throw new Error("fail");
    }

    const [$ai, $bi] = m.args;

    expect(($ai as any).var.resolve().type).toEqual("unbound");
    expect(($bi as any).var.resolve().type).toEqual("unbound");
    expect(($ai as any).var.resolve().id).toEqual(
      ($bi as any).var.resolve().id,
    );
  });
});

describe(typeToString.name, () => {
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
    expect(typeToString(f, { 0: "z" })).toBe("z");
  });

  test("closure", () => {
    const a = TVar.fresh().asType();
    expect(typeToString(a, {})).toBe("a");
  });

  test("traits", () => {
    const a = TVar.fresh(["Ord", "Show"]).asType();
    const b = TVar.fresh().asType();
    const c = TVar.fresh(["Read"]).asType();
    const f: Type = { type: "fn", args: [a, b], return: c };

    expect(typeToString(f, {})).toBe(
      "Fn(a, b) -> c where a: Ord + Show, c: Read",
    );
  });
});

describe("traits", () => {
  test("types can be instantiated with traits", () => {
    expect(TVar.fresh(["ord"]).resolve()).toEqual({
      type: "unbound",
      id: 0,
      traits: ["ord"],
    });
  });

  test("merge traits in unified tvars", () => {
    const $a = TVar.fresh(["ord"]);
    const $b = TVar.fresh(["eq"]);

    unify($a.asType(), $b.asType());

    expect($a.resolve()).toEqual<TVarResolution>(
      expect.objectContaining({
        traits: expect.arrayContaining(["ord", "eq"]),
      }),
    );

    expect($b.resolve()).toEqual<TVarResolution>(
      expect.objectContaining({
        traits: expect.arrayContaining(["ord", "eq"]),
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
        traits: expect.arrayContaining(["eq"]),
      }),
    );

    expect($b.resolve()).toEqual<TVarResolution>(
      expect.objectContaining({
        traits: expect.arrayContaining(["eq"]),
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
    TVar.registerTraitImpl(BASICS_MODULE, "Int", "ord", []);

    const $a = TVar.fresh(["ord"]);

    expect(unify($a.asType(), Int)).toEqual(undefined);
  });

  test("fails to unify a tvar with a concrete type that implements the trait when type vars don't", () => {
    TVar.registerTraitImpl(BASICS_MODULE, "List", "Ord", [["Ord"]]);

    const $a = TVar.fresh(["Ord"]);

    expect(unify($a.asType(), List(Int))).toEqual<UnifyError>({
      type: "missing-trait",
      type_: List(Int),
      trait: "Ord",
    });
  });

  test("succeeds to unify a tvar with a concrete type that implements the trait (including type args)", () => {
    TVar.registerTraitImpl(BASICS_MODULE, "List", "ord", [["ord"]]);
    TVar.registerTraitImpl(BASICS_MODULE, "Int", "ord", []);

    const $a = TVar.fresh(["ord"]);

    expect(unify($a.asType(), List(Int))).toEqual(undefined);
  });

  test("traits are unified to type args", () => {
    // impl ord for List<a> where a: ord
    // unify(a: ord, List<b>)
    // => b: ord

    TVar.registerTraitImpl(BASICS_MODULE, "List", "ord", [["ord"]]);

    const $a = TVar.fresh(["ord"]);
    const $b = TVar.fresh();

    expect(unify($a.asType(), List($b.asType()))).toEqual(undefined);

    expect($b.resolve()).toEqual({
      type: "unbound",
      id: 1,
      traits: ["ord"],
    });
  });

  test("fails to unify dependencies when to not impl required trait", () => {
    // impl ord for List<a> where a: ord
    // unify(List<a: ord>, List<Int>) => fail

    TVar.registerTraitImpl(BASICS_MODULE, "List", "Ord", [["Ord"]]);

    const $a = TVar.fresh(["Ord"]);

    expect(unify(List($a.asType()), List(Int))).toEqual<UnifyError>({
      type: "missing-trait",
      trait: "Ord",
      type_: Int,
    });
  });

  test("generalization and instantiation preserve traits", () => {
    const initialTraits = ["ord"];
    const ta = TVar.fresh(initialTraits).asType();

    const scheme = generalizeAsScheme(ta);
    const taI = instantiateFromScheme(ta, scheme);

    if (taI.type !== "var") {
      throw new Error();
    }

    const resolved = taI.var.resolve();

    if (resolved.type !== "unbound") {
      throw new Error("Expecting an unbound var");
    }

    expect(resolved.traits).toEqual(initialTraits);
  });
});

function Fn(args: Type[], ret: Type): ConcreteType {
  return { type: "fn", args, return: ret };
}
