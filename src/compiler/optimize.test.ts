import { describe, expect, test } from "vitest";
import * as ir from "./ir";
import * as optimize from "./optimize";
import { formatIR, formatIRExpr } from "./__test__/ir-to-sexpr";
import { typecheckSource_ } from "./__test__/prelude";
import { lowerProgram } from "./lower";

const baseCtx: optimize.Ctx = {};

describe("beta reduction", () => {
  test("with no args", () => {
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
    const optimized = optimize.betaReduction(
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

  test("with many args", () => {
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
    const optimized = optimize.betaReduction(
      {
        type: "application",
        caller: {
          type: "fn",
          bindings: [mkBinding("a"), mkBinding("b")],
          body: strConst("value"),
        },
        args: [strConst("a"), strConst("b")],
      },
      baseCtx,
    );

    expect(formatIRExpr(optimized)).toEqual(
      formatIRExpr(
        ir.desugarLet({
          binding: mkBinding("a"),
          value: strConst("a"),
          body: ir.desugarLet({
            binding: mkBinding("b"),
            value: strConst("b"),
            body: strConst("value"),
          }),
        }),
      ),
    );
  });

  test("apply recursively", () => {
    const out = applyRule(
      optimize.betaReduction,
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
      ir.desugarLet({
        binding: mkBinding("x"),
        value: strConst("a"),
        body: {
          type: "application",
          caller: mkIdent("add"),
          args: [mkIdent("x"), mkIdent("x")],
        },
      }),
      baseCtx,
    );

    const expected: ir.Expr = {
      type: "application",
      caller: mkIdent("add"),
      args: [strConst("a"), strConst("a")],
    };

    expect(formatIRExpr(optimized)).toEqual(formatIRExpr(expected));
  });

  test("inline when value is only used once", () => {
    const value: ir.Expr = { type: "fn", bindings: [], body: strConst("str") };

    /**
     * ```kestrel
     * // src:
     * { let x = fn { 42 }; x() }
     * // =>
     * fn { 42 } ()
     * ```
     */
    const optimized = optimize.inlineLet(
      ir.desugarLet({
        binding: mkBinding("x"),
        value,
        body: {
          type: "application",
          caller: { type: "identifier", ident: mkBinding("x") },
          args: [],
        },
      }),
      baseCtx,
    );

    const expected: ir.Expr = {
      type: "application",
      caller: value,
      args: [],
    };

    expect(formatIRExpr(optimized)).toEqual(formatIRExpr(expected));
  });

  test("prevent inlining when complex value occurs more than once", () => {
    const original: ir.Expr = ir.desugarLet({
      binding: mkBinding("x"),
      value: { type: "fn", bindings: [], body: strConst("str") },
      body: {
        type: "application",
        caller: mkIdent("f"),
        args: [mkIdent("x"), mkIdent("x")],
      },
    });

    /**
     * ```kestrel
     * // src:
     * { let x = fn { 42 }; f(x, x) }
     * // =>
     * fn { 42 } ()
     * ```
     */
    const optimized = optimize.inlineLet(original, baseCtx);

    expect(formatIRExpr(optimized)).toEqual(formatIRExpr(original));
  });

  test("prevent inlining when complex value occurs within a lambda", () => {
    const original: ir.Expr = ir.desugarLet({
      binding: mkBinding("x"),
      value: {
        type: "application",
        caller: { type: "identifier", ident: mkBinding("f") },
        args: [],
      },
      body: {
        type: "fn",
        bindings: [],
        body: { type: "identifier", ident: mkBinding("x") },
      },
    });

    /**
     * ```kestrel
     * { let x = f(); fn { x } }
     * ```
     */
    const optimized = optimize.inlineLet(original, baseCtx);

    expect(formatIRExpr(optimized)).toEqual(formatIRExpr(original));
  });

  test.todo("prevent previous rule when value is a lambda");
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

const mkBinding = (
  name: string,
  opts = { unique: 0, decl: "glb" },
): ir.Ident & { type: "local" } => ({
  type: "local",
  declaration: new ir.QualifiedIdentifier("pkg", "Main", opts.decl),
  name,
  unique: opts.unique,
});

const mkIdent = (
  name: string,
  opts = { unique: 0, decl: "glb" },
): ir.Expr & { type: "identifier" } => ({
  type: "identifier",
  ident: mkBinding(name, opts),
});

function applyRule(rule: optimize.Rule, src: string) {
  const out = typecheckSource_("pkg", "Main", src);
  const irProgram = lowerProgram(out);
  const newProgram = optimize.applyRule(rule, irProgram);
  return formatIR(newProgram);
}
