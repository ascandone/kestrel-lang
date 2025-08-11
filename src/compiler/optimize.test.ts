import { expect, test } from "vitest";
import * as ir from "./ir";
import { foldIIF } from "./optimize";
import { formatIRExpr } from "./__test__/ir-to-sexpr";

test("fold iif with no args", () => {
  /**
   * ```kestrel
   * (fn { "value" })()
   * ```
   *
   * into:
   *
   * ```kestrel
   * "value"
   * ```
   */
  const optimized = foldIIF({
    type: "application",
    caller: {
      type: "fn",
      bindings: [],
      body: strConst("value"),
    },
    args: [],
  });

  expect(formatIRExpr(optimized)).toEqual(formatIRExpr(strConst("value")));
});

test("fold iif with many args", () => {
  /**
   * ```kestrel
   * (fn a, b { "value" })("a", "b")
   * ```
   *
   * into:
   *
   * ```ocaml
   * let a = "a" in
   * let b = "b" in
   * "value"
   * ```
   */
  const optimized = foldIIF({
    type: "application",
    caller: {
      type: "fn",
      bindings: [mkIdent("a"), mkIdent("b")],
      body: strConst("value"),
    },
    args: [strConst("a"), strConst("b")],
  });

  expect(formatIRExpr(optimized)).toEqual(
    formatIRExpr({
      type: "let",
      binding: mkIdent("a"),
      value: strConst("a"),
      body: {
        type: "let",
        binding: mkIdent("b"),
        value: strConst("b"),
        body: strConst("value"),
      },
    }),
  );
});

function strConst(value: string): ir.Expr {
  return {
    type: "constant",
    value: { type: "string", value },
  };
}

const mkIdent = (
  name: string,
  opts = { unique: 0, decl: "glb" },
): ir.Ident & { type: "local" } => ({
  type: "local",
  declaration: new ir.QualifiedIdentifier("pkg", "Main", opts.decl),
  name,
  unique: opts.unique,
});
