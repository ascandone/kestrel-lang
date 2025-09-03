import { ModuleDoc, makeModuleDoc } from "./documentation";
import { unsafeParse } from "../../../parser";
import { typecheck } from "../../../typecheck";
import { test, expect } from "vitest";

test("Extract values documentation", () => {
  const src = `
    extern type Bool
    extern type Int

    let priv = 0

    /// First line
    /// Second line
    pub let x = 1

    /// Extern value
    extern pub let y: (Bool) -> Int
  `;

  expect(parseExtractDocs(src)).toEqual<ModuleDoc>({
    moduleName: "Example",
    items: [
      {
        type: "value",
        name: "x",
        signature: "Int",
        docComment: " First line\n Second line\n",
      },
      {
        type: "value",
        name: "y",
        signature: "(Bool) -> Int",
        docComment: " Extern value\n",
      },
    ],
  });
});

test("Extract types documentation", () => {
  const src = `
    extern type Arg

    /// Comment
    extern pub type X

    pub(..) type Y<x, y> {
      FirstVariant,
      SecondVariant(x, Arg),
      Rec(Y<y, Arg>),
    }

    pub type Opaque { Constr }
  `;

  expect(parseExtractDocs(src)).toEqual<ModuleDoc>({
    moduleName: "Example",
    items: [
      {
        type: "adt",
        name: "X",
        params: [],
        docComment: " Comment\n",
      },
      {
        type: "adt",
        name: "Y",
        params: ["x", "y"],
        variants: [
          { name: "FirstVariant", args: [] },
          { name: "SecondVariant", args: ["x", "Arg"] },
          { name: "Rec", args: ["Y<y, Arg>"] },
        ],
      },
      {
        type: "adt",
        name: "Opaque",
        params: [],
      },
    ],
  });
});

test("order between types and values", () => {
  const src = `
  extern pub let x: a
  extern pub type X
  extern pub let y: b
`;

  expect(parseExtractDocs(src)).toEqual<ModuleDoc>({
    moduleName: "Example",
    items: [
      expect.objectContaining({ name: "x" }),
      expect.objectContaining({ name: "X" }),
      expect.objectContaining({ name: "y" }),
    ],
  });
});

test("moduledoc", () => {
  const src = `
  //// Moduledoc comment
  //// line 2

  /// Comment
  pub let x = 1
`;

  expect(parseExtractDocs(src)).toEqual<ModuleDoc>({
    moduleName: "Example",
    moduleDoc: " Moduledoc comment\n line 2\n",
    items: [
      {
        type: "value",
        name: "x",
        signature: "Int",
        docComment: " Comment\n",
      },
    ],
  });
});

function parseExtractDocs(src: string): ModuleDoc {
  const ns = "Example";
  const parsed = unsafeParse(src);
  const [tc, errors] = typecheck("pkg", ns, parsed, {
    implicitImports: [],
  });
  const e = errors.find((e) => e.description.severity === "error");
  if (e !== undefined) {
    throw new Error("Typecheck error: " + e.description.shortDescription());
  }

  return makeModuleDoc(ns, tc);
}
