import { test, expect } from "vitest";
import { findReferences } from "./findReferences";
import { Position } from "../parser";
import { positionOf, rangeOf } from "./__test__/utils";
import { Identifier, TypedModule } from "../typecheck";
import * as project from "../typecheck/project";
import { nestedMapGetOrPutDefault } from "../common/defaultMap";

test("glb decl in the same module", () => {
  const Main = `
      let glb = 42
      pub let x = glb
    `;

  const refs = findReferences(
    "",
    "Main",
    positionOf(Main, "glb", 1),
    typecheckRaw({ Main }),
  );

  expect(refs?.references).toEqual<[string, Identifier][]>([
    [
      "Main",
      expect.objectContaining({
        name: "glb",
        range: rangeOf(Main, "glb", 2),
      }),
    ],
  ]);
});

test("glb decl in different modules", () => {
  const ImportedModule = `
      pub let glb = 42
    `;

  const Main = `
      import ImportedModule
      pub let example_var = ImportedModule.glb
    `;

  const bindings = parseFindReferences(
    "ImportedModule",
    rangeOf(ImportedModule, "glb")!.start,
    typecheckRaw({ Main, ImportedModule }),
  );

  expect(bindings).toEqual<[string, Identifier][]>([
    [
      "Main",
      expect.objectContaining({
        name: "glb",
        range: rangeOf(Main, "ImportedModule.glb"),
      }),
    ],
  ]);
});

function typecheckRaw(
  rawProject: Record<string, string>,
): Record<string, TypedModule> {
  const raw: project.RawProject = new Map();
  for (const [moduleId, src] of Object.entries(rawProject)) {
    nestedMapGetOrPutDefault(raw, moduleId).set("", src);
  }

  const checker = new project.ProjectTypechecker(raw);

  checker.typecheck();

  const ret: Record<string, TypedModule> = {};

  for (const [moduleId, packages] of checker.compiledProject.inner) {
    for (const [, [typedModule]] of packages) {
      ret[moduleId] = typedModule;
    }
  }

  return ret;
}

function parseFindReferences(
  hoveringOnNamespace: string,
  position: Position,
  typedProject: Record<string, TypedModule> = {},
): [string, Identifier][] {
  return findReferences("", hoveringOnNamespace, position, typedProject)!
    .references;
}
