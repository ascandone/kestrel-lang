import { test, expect, beforeEach, describe } from "vitest";
import {
  ConcreteType,
  TVar,
  TVarResolution,
  Type,
  UnifyError,
  generalize,
  instantiate,
  unify,
} from "./unify";
import { Bool, Int, List, Tuple } from "../__test__/types";

beforeEach(() => {
  TVar.resetId();
});

test("unifing two concrete vars when they match", () => {
  expect(unify(Int, Int)).toBeUndefined();
  expect(unify(List(Int), List(Int))).toBeUndefined();
  expect(unify(Fn([Int], Int), Fn([Int], Int))).toBeUndefined();
});

test("do not unify concrete types from different modules", () => {
  expect(
    unify(Int, { ...Int, moduleName: "AnotherModule" } as any),
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
        moduleName: "Mod",
        type: "named",
        name: "T",
        args: [{ moduleName: "Mod", type: "named", name: "X", args: [] }],
      },
      { moduleName: "Mod", type: "named", name: "T", args: [] },
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
  expect($a.resolve()).toEqual<TVarResolution>({ type: "unbound", id: 0 });
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

  expect($a.resolve(), "a").toEqual<TVarResolution>({ type: "unbound", id: 0 });
  expect($b.resolve(), "b").toEqual<TVarResolution>({ type: "unbound", id: 0 });
  expect($b.resolve(), "c").toEqual<TVarResolution>({ type: "unbound", id: 0 });

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

describe("generalization", () => {
  test("generalize primitive value", () => {
    const poly = generalize(Int);
    expect(poly).toEqual(Int);
  });

  test("generalize var bound to primitive", () => {
    const $a = TVar.fresh();
    unify($a.asType(), Int);
    const poly = generalize($a.asType());
    expect(poly).toEqual(Int);
  });

  test("generalize single unbound var", () => {
    const $a = TVar.fresh();
    const poly = generalize($a.asType());
    expect(poly.type).toEqual("quantified");
  });

  test("generalize unbound var in fn args", () => {
    const $a = TVar.fresh();
    const poly = generalize(Fn([$a.asType()], Int));
    if (poly.type !== "fn") {
      throw new Error("FAIL");
    }

    expect(poly.args[0]!.type).toEqual("quantified");
  });

  test("generalize unbound var in fn return", () => {
    const $a = TVar.fresh();
    const poly = generalize(Fn([], $a.asType()));
    if (poly.type !== "fn") {
      throw new Error("FAIL");
    }

    expect(poly.return.type).toEqual("quantified");
  });

  test("generalize many vars", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();
    const poly = generalize(Tuple($a.asType(), $b.asType()));

    if (poly.type !== "named") {
      throw new Error("fail");
    }
    expect(poly.args.length).toEqual(2);
    expect(poly.name).toBe("Tuple2");

    const [$g1, $g2] = poly.args;

    expect($g1).toEqual({ type: "quantified", id: "a" });
    expect($g2).toEqual({ type: "quantified", id: "b" });
  });

  test("generalize many vars when linked", () => {
    const $a = TVar.fresh();
    const poly = generalize(Tuple($a.asType(), $a.asType()));

    if (poly.type !== "named") {
      throw new Error("fail");
    }
    expect(poly.args.length).toEqual(2);
    expect(poly.name).toBe("Tuple2");
    const [$g1, $g2] = poly.args;

    expect(($g1 as any).type).toEqual("quantified");
    expect(($g1 as any).id).toEqual("a");

    expect(($g2 as any).type).toEqual("quantified");
    expect(($g2 as any).id).toEqual("a");
  });

  test("generalize var bound to a nested type to generalize ", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();
    unify($a.asType(), Tuple($b.asType(), $b.asType()));
    const poly = generalize($a.asType());
    if (poly.type !== "named") {
      throw new Error("Expected a named type, got: " + poly.type);
    }

    expect(poly.args.length).toEqual(2);

    const [$g1, $g2] = poly.args;

    expect($g1).toEqual({
      type: "quantified",
      id: "a",
    });
    expect($g2).toEqual({
      type: "quantified",
      id: "a",
    });
  });

  test("do not generalize vars that appear in the context", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();
    const poly = generalize(Tuple($a.asType(), $b.asType()), {
      // Note $b is not free in context
      x: List($b.asType()),
    });

    if (poly.type !== "named") {
      throw new Error("Expected a named type, got: " + poly.type);
    }

    expect(poly.args.length).toEqual(2);
    const [$ga, $gb] = poly.args;
    expect($ga).toEqual({
      type: "quantified",
      id: "a",
    });
    expect($gb).toEqual($b.asType());
  });

  test("instantiate concrete type", () => {
    const m = instantiate(Int);
    expect(m).toEqual(Int);
  });

  test("instantiate fn", () => {
    const m = instantiate(Fn([Int], Bool));
    expect(m).toEqual(Fn([Int], Bool));
  });

  test("instantiate single var", () => {
    const $a = TVar.fresh();
    const $g = generalize($a.asType());
    const $m = instantiate($g);

    expect(($m as any).var.resolve().type).toEqual("unbound");
    expect((($m as any).var.resolve() as any).id).not.toEqual(
      ($a.resolve() as any).id,
    );
  });

  test("instantiate two different vars", () => {
    const $a = TVar.fresh();
    const $b = TVar.fresh();
    const $g = generalize(Tuple($a.asType(), $b.asType()));

    const m = instantiate($g);
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
    const $a = TVar.fresh();
    const $g = generalize(Tuple($a.asType(), $a.asType()));
    const m = instantiate($g);
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

function Fn(args: Type[], ret: Type): ConcreteType {
  return { type: "fn", args, return: ret };
}
