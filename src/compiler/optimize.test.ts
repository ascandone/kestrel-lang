import { describe, expect, test } from "vitest";
import * as ir from "./ir";
import * as optimize from "./optimize";
import { formatIR, formatIRExpr } from "./__test__/ir-to-sexpr";
import { typecheckSource_ } from "./__test__/prelude";
import { lowerProgram } from "./lower";

const baseCtx: optimize.Ctx = {};

describe("fold iif", () => {
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
    const optimized = optimize.foldIIF(
      {
        type: "application",
        caller: {
          type: "fn",
          bindings: [],
          body: strConst("value"),
        },
        args: [],
      },
      baseCtx,
    );

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
    const optimized = optimize.foldIIF(
      {
        type: "application",
        caller: {
          type: "fn",
          bindings: [mkIdent("a"), mkIdent("b")],
          body: strConst("value"),
        },
        args: [strConst("a"), strConst("b")],
      },
      baseCtx,
    );

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

    test("apply recursively", () => {
      const out = applyRule(
        optimize.foldIIF,
        `
        let id = fn a { a }
        let x =  id((fn { "value" })())
    `,
      );
      expect(out).toMatchInlineSnapshot(`
      "(:def id
          (:fn (a#0)
              a#0))

      (:def x
          (id "value"))"
    `);
    });
  });
});

describe("inline let", () => {
  test("inline when value is a simple binding", () => {
    /**
     * ```kestrel
     * // src:
     * { let x = "a"; x ++ x }
     * // =>
     * "a" ++ "a"
     * ```
     */
    const optimized = optimize.inlineLet(
      {
        type: "let",
        binding: mkIdent("x"),
        value: strConst("a"),
        body: {
          type: "application",
          caller: { type: "identifier", ident: mkIdent("add") },
          args: [
            { type: "identifier", ident: mkIdent("x") },
            { type: "identifier", ident: mkIdent("x") },
          ],
        },
      },
      baseCtx,
    );

    const expected: ir.Expr = {
      type: "application",
      caller: { type: "identifier", ident: mkIdent("add") },
      args: [strConst("a"), strConst("a")],
    };

    expect(formatIRExpr(optimized)).toEqual(formatIRExpr(expected));
  });
});

describe("mixed rules", () => {
  test.todo("apply recursively twice", () => {
    const out = applyRule(
      optimize.allOptimizations,
      `
        let x = 
          fn x { x }
            (
              fn y { y } ( 42 )
            )
          
    `,
    );

    expect(out).toMatchInlineSnapshot(`
      "(:def x
          (:let (x#0
                  (:let (y#0 42)
                      y#0))
              x#0))"
    `);
  });
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

function applyRule(rule: optimize.Rule, src: string) {
  const out = typecheckSource_("pkg", "Main", src);
  const irProgram = lowerProgram(out);
  const newProgram = optimize.applyRule(rule, irProgram);
  return formatIR(newProgram);
}
