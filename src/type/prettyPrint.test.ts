import { expect, test } from "vitest";
import { typePPrint } from "./prettyPrint";
import {
  bool,
  num,
  list,
  tuple,
  maybe,
  fn,
  result,
  _1,
  _0,
  _2,
  _3,
} from "../__test__/commonTypes";

test("0-arity types", () => {
  expect(typePPrint(num)).toBe("Num");
});

test("n-arity types", () => {
  expect(typePPrint(list(num))).toBe("List<Num>");
  expect(typePPrint(result(num, bool))).toBe("Result<Num, Bool>");
});

test("nested types", () => {
  expect(typePPrint(list(maybe(num)))).toBe("List<Maybe<Num>>");
});

test("type var", () => {
  expect(typePPrint(_0)).toBe("a");
});

test("type vars", () => {
  expect(typePPrint(result(_0, _1))).toBe("Result<a, b>");
});

test("arrow", () => {
  expect(typePPrint(fn([num], bool))).toBe("Fn(Num) -> Bool");
});

test("2-arity arrow ", () => {
  expect(typePPrint(fn([num, bool], num))).toBe("Fn(Num, Bool) -> Num");
});

test("higher order function", () => {
  const t = fn([fn([num], bool)], num);

  expect(typePPrint(t)).toBe("Fn(Fn(Num) -> Bool) -> Num");
});

test("tv as arg", () => {
  expect(typePPrint(fn([_0], _0))).toBe("Fn(a) -> a");
});

test("n-arity type nested in arrow", () => {
  const t = fn([list(num)], maybe(bool));
  expect(typePPrint(t)).toBe("Fn(List<Num>) -> Maybe<Bool>");
});

test("tuple special syntax", () => {
  expect(typePPrint(tuple(_0, _1))).toBe("(a, b)");
  expect(typePPrint(tuple(_0, _1, _2))).toBe("(a, b, c)");
  expect(typePPrint(tuple(_0, _1, _2, _3))).toBe("(a, b, c, d)");
});

test("pretty print vars", () => {
  expect(typePPrint({ tag: "Var", id: 0 })).toBe("a");
  expect(typePPrint({ tag: "Var", id: 1 })).toBe("b");
  expect(typePPrint({ tag: "Var", id: 2 })).toBe("c");
  // ...
  expect(typePPrint({ tag: "Var", id: 25 })).toBe("z");

  expect(typePPrint({ tag: "Var", id: 26 })).toBe("a0");
  expect(typePPrint({ tag: "Var", id: 27 })).toBe("b0");
  // ...

  expect(typePPrint({ tag: "Var", id: 52 })).toBe("a1");
  expect(typePPrint({ tag: "Var", id: 53 })).toBe("b1");
});