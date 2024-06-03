import { test, expect } from "vitest";
import { findReferences, Identifier, TypedModule } from "../typedAst";
import { unsafeParse } from "../../parser/antlr-parser";
import { UntypedProject, typecheckProject } from "../typecheck";
import { indexOf, spanOf } from "./__test__/utils";

test("glb decl in the same module", () => {
  const Main = `
      let glb = 42
      pub let x = glb
    `;

  const refs = findReferences(
    "Main",
    indexOf(Main, "glb", 1)!,
    typecheckRaw({ Main }),
  );

  expect(refs?.references).toEqual<[string, Identifier][]>([
    [
      "Main",
      expect.objectContaining({
        name: "glb",
        span: spanOf(Main, "glb", 2),
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
    indexOf(ImportedModule, "glb")!,
    typecheckRaw({ Main, ImportedModule }),
  );

  expect(bindings).toEqual<[string, Identifier][]>([
    [
      "Main",
      expect.objectContaining({
        name: "glb",
        span: spanOf(Main, "ImportedModule.glb"),
      }),
    ],
  ]);
});

function typecheckRaw(
  rawProject: Record<string, string>,
): Record<string, TypedModule> {
  const untypedProject: UntypedProject = {};
  for (const [ns, src] of Object.entries(rawProject)) {
    untypedProject[ns] = { package: "", module: unsafeParse(src) };
  }
  const p = typecheckProject(untypedProject);
  return Object.fromEntries(
    Object.entries(p).map(([k, { typedModule }]) => [k, typedModule]),
  );
}

function parseFindReferences(
  hoveringOnNamespace: string,
  offset: number,
  typedProject: Record<string, TypedModule> = {},
): [string, Identifier][] {
  return findReferences(hoveringOnNamespace, offset, typedProject)!.references;
}
