import { expect, test, beforeEach } from "vitest";
import { typePPrint } from "./pretty-printer";
import { ConcreteType, TVar, Type, unify } from "./unify";

beforeEach(() => {
  TVar.resetId();
});

test("0-arity types", () => {
  expect(typePPrint(Int)).toBe("Int");
});

test("n-arity types", () => {
  expect(typePPrint(List(Int))).toBe("List<Int>");
  expect(typePPrint(Tuple(Int, Bool))).toBe("Tuple<Int, Bool>");
});

test("nested types", () => {
  expect(typePPrint(List(Maybe(Int)))).toBe("List<Maybe<Int>>");
});

test("type var", () => {
  const $a = TVar.fresh();
  expect(typePPrint($a.asType())).toBe("t0");
});

test("type vars", () => {
  const $a = TVar.fresh(),
    $b = TVar.fresh();

  expect(typePPrint(Tuple($a.asType(), $b.asType()))).toBe("Tuple<t0, t1>");
});

test("bound types", () => {
  const $a = TVar.fresh();
  unify($a.asType(), Int);

  expect(typePPrint(List($a.asType()))).toBe("List<Int>");
});

test("fn type with no args", () => {
  expect(typePPrint(Fn([], Bool))).toBe("Fn() -> Bool");
});

test("fn type with one args", () => {
  expect(typePPrint(Fn([Int], Bool))).toBe("Fn(Int) -> Bool");
});

test("fn type with two args ", () => {
  expect(typePPrint(Fn([Int, Bool], Bool))).toBe("Fn(Int, Bool) -> Bool");
});

test("higher order function", () => {
  const f = Fn([Fn([Int], Bool)], Bool);
  expect(typePPrint(f)).toBe("Fn(Fn(Int) -> Bool) -> Bool");
});

test("tv as arg", () => {
  const $a = TVar.fresh();
  expect(typePPrint(Fn([$a.asType()], $a.asType()))).toBe("Fn(t0) -> t0");
});

test("n-arity type nested in a fn", () => {
  const f = Fn([List(Int)], Maybe(Bool));
  expect(typePPrint(f)).toBe("Fn(List<Int>) -> Maybe<Bool>");
});

function named(name: string, ...args: Type[]): ConcreteType {
  return { type: "named", name, args };
}

const Int = named("Int");
const Bool = named("Bool");
function List(p: Type) {
  return named("List", p);
}

function Maybe(p: Type) {
  return named("Maybe", p);
}

function Tuple(...ps: Type[]): ConcreteType {
  return named("Tuple", ...ps);
}

function Fn(args: Type[], ret: Type): ConcreteType {
  return { type: "fn", args, return: ret };
}
