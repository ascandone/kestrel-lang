import { pprint } from "../../format/pretty";
import { QualifiedIdentifier } from "../ir";
import { ExprPrinter } from "./format-ir";
import { test, expect } from "vitest";
import * as ir from "../ir";

test("const lit", () => {
  const doc = new ExprPrinter().exprToDoc({
    type: "constant",
    value: { type: "int", value: 42 },
  });

  expect(pprint(doc)).toEqual("42");
});

test("local ident (same pkg)", () => {
  const s = new ExprPrinter("glb", "pkg", "Main").identToString({
    type: "local",
    declaration: new QualifiedIdentifier("pkg", "Main", "glb"),
    name: "x",
    unique: 0,
  });

  expect(s).toEqual("x#0");
});

test("local ident (different decl/pkg)", () => {
  const s = new ExprPrinter("glb", "another_pkg", "Main").identToString({
    type: "local",
    declaration: new QualifiedIdentifier("pkg", "Main", "glb"),
    name: "x",
    unique: 0,
  });

  expect(s).toEqual("pkg:Main.glb:x#0");
});

test("glb ident (same pkg)", () => {
  const str = new ExprPrinter("glb", "pkg", "Main").identToString({
    type: "global",
    name: new QualifiedIdentifier("pkg", "Main", "glb"),
    implicitly: [],
  });

  expect(str).toEqual("glb");
});

test("glb ident with implicits", () => {
  const str = new ExprPrinter("glb", "pkg", "Main").identToString({
    type: "global",
    name: new QualifiedIdentifier("pkg", "Main", "glb"),
    implicitly: [
      {
        type: "resolved",
        trait: "Show",
        typeName: new QualifiedIdentifier("kestrel_core", "Tuple", "Unit"),
        args: [],
      },
      {
        trait: "Eq",
        type: "var",
        id: "t",
      },
    ],
  });

  expect(str).toEqual("glb[kestrel_core:Tuple:Unit:Show, t:Eq]");
});

test("glb ident with higher-order implicits", () => {
  const str = new ExprPrinter("glb", "pkg", "Main").identToString({
    type: "global",
    name: new QualifiedIdentifier("pkg", "Main", "glb"),
    implicitly: [
      {
        type: "resolved",
        trait: "Show",
        typeName: new QualifiedIdentifier("kestrel_core", "Result", "Result"),
        args: [
          {
            type: "resolved",
            trait: "Show",
            typeName: new QualifiedIdentifier("kestrel_core", "Int", "Int"),
            args: [],
          },
          {
            trait: "Show",
            type: "var",
            id: "a",
          },
        ],
      },
    ],
  });

  expect(str).toEqual(
    "glb[kestrel_core:Result:Result:Show(kestrel_core:Int:Int:Show, a:Show)]",
  );
});

test("glb ident (different pkg/mod)", () => {
  const str = new ExprPrinter("glb", "another_pkg", "Main").identToString({
    type: "global",
    name: new QualifiedIdentifier("pkg", "Main", "glb"),
    implicitly: [],
  });

  expect(str).toEqual("pkg:Main.glb");
});

test("application", () => {
  const doc = new ExprPrinter().exprToDoc({
    type: "application",
    caller: mkIdent("f"),
    args: [mkIdent("x"), mkIdent("y")],
  });

  expect(pprint(doc)).toEqual("f#0(x#0, y#0)");
});

test("fn", () => {
  const doc = new ExprPrinter().exprToDoc({
    type: "fn",
    bindings: [mkBinding("a"), mkBinding("b")],
    body: mkIdent("y"),
  });

  expect(pprint(doc)).toMatchInlineSnapshot(`
    "fn a#0, b#0 {
      y#0
    }"
  `);
});

test("pattern", () => {
  const ident = new QualifiedIdentifier("pkg", "Main", "glb");
  const doc = new ExprPrinter().exprToDoc({
    type: "match",
    expr: mkIdent("value"),
    clauses: [
      [
        {
          type: "constructor",
          name: "Ctor",
          args: [
            { type: "lit", literal: { type: "int", value: 42 } },
            { type: "identifier", ident: mkBinding("x") },
          ],
          typeName: ident,
        },
        mkIdent("then"),
      ],
    ],
  });

  expect(pprint(doc)).toMatchInlineSnapshot(`
    "match value#0 {
      Ctor(42, x#0) => then#0,
    }"
  `);
});

test("field access", () => {
  const doc = new ExprPrinter().exprToDoc({
    type: "field-access",

    struct: mkIdent("x"),
    field: { name: "f", struct: new QualifiedIdentifier("pkg", "M", "S") },
  });

  expect(pprint(doc)).toMatchInlineSnapshot(`"x#0.f"`);
});

test("struct lit", () => {
  const doc = new ExprPrinter().exprToDoc({
    type: "struct-literal",
    struct: new QualifiedIdentifier("pkg", "M", "St"),
    fields: [
      {
        name: "f",
        expr: mkIdent("f"),
      },
    ],
    spread: mkIdent("other"),
  });

  expect(pprint(doc)).toMatchInlineSnapshot(`
    "St {
      f: f#0,
      ..other#0
    }"
  `);
});

// TODO dedup from optimize
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
