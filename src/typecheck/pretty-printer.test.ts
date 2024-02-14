import { expect, test, beforeEach } from "vitest";
import { typePPrint } from "./pretty-printer";
import { ConcreteType, TVar, Type, unify } from "./unify";
import { Bool, Int, List, Maybe, Tuple } from "../__test__/types";

beforeEach(() => {
  TVar.resetId();
});

test("0-arity types", () => {
  expect(typePPrint(Int)).toBe("Int");
});

test("n-arity types", () => {
  expect(typePPrint(List(Int))).toBe("List<Int>");
  expect(typePPrint(Tuple(Int, Bool))).toBe("(Int, Bool)");
});

test("nested types", () => {
  expect(typePPrint(List(Maybe(Int)))).toBe("List<Maybe<Int>>");
});

test("type var", () => {
  const $a = TVar.fresh();
  expect(typePPrint($a.asType())).toBe("a");
});

test("type vars", () => {
  const $a = TVar.fresh(),
    $b = TVar.fresh();

  expect(typePPrint(Tuple($a.asType(), $b.asType()))).toBe("(a, b)");
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
  expect(typePPrint(Fn([$a.asType()], $a.asType()))).toBe("Fn(a) -> a");
});

test("n-arity type nested in a fn", () => {
  const f = Fn([List(Int)], Maybe(Bool));
  expect(typePPrint(f)).toBe("Fn(List<Int>) -> Maybe<Bool>");
});

test("handle scheme", () => {
  const f = TVar.fresh().asType();
  expect(typePPrint(f, { 0: "z" })).toBe("z");
});

test("closure", () => {
  const a = TVar.fresh().asType();
  expect(typePPrint(a, {})).toBe("a");
});

function Fn(args: Type[], ret: Type): ConcreteType {
  return { type: "fn", args, return: ret };
}
