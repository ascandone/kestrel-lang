import { expect, test } from "vitest";
import * as project from "./project";
import { UntypedModule, unsafeParse } from "../parser";
import { DefaultMap } from "../data/defaultMap";
import * as err from "./errors";

test("single module", () => {
  const checker = prjTypechecker({
    pkg: {
      Main: "pub let x = 42",
    },
  });

  const changed = checker.typecheck();
  expect(changed).toEqual([
    expect.objectContaining({
      package_: "pkg",
      moduleId: "Main",
    }),
  ]);
});

test("with dependency", () => {
  const checker = prjTypechecker({
    pkg: {
      Main: `
        import Dep
        pub let x = Dep.x
      `,
      Dep: `pub let x = 42`,
    },
  });

  const changed = checker.typecheck();
  expect(changed).toEqual([
    expect.objectContaining({
      package_: "pkg",
      moduleId: "Dep",
      output: [expect.anything(), []],
    }),
    expect.objectContaining({
      package_: "pkg",
      moduleId: "Main",
      output: [expect.anything(), []],
    }),
  ]);
});

test("emit error when dependency is not visible", () => {
  const checker = prjTypechecker({
    pkg: {
      Main: `
        import Dep
        pub let x = Dep.x
      `,
    },
    pkg2: {
      Dep: `pub let x = 42`,
    },
  });

  const changed = checker.typecheck();

  expect(changed).toEqual([
    expect.objectContaining({
      package_: "pkg",
      moduleId: "Main",
      output: [
        expect.anything(),
        <err.ErrorInfo[]>[
          {
            description: new err.UnboundModule("Dep"),
            range: expect.anything(),
          },
        ],
      ],
    }),

    expect.objectContaining({
      package_: "pkg2",
      moduleId: "Dep",
    }),
  ]);
});

test.todo("prevent dependency cycle");
test.todo("prevent ambiguous import");
test.todo("emit error on unkown dependency");

test.todo("invalidate", () => {
  const checker = prjTypechecker({
    pkg: {
      Main: `
        import Dep
        pub let x = Dep.x
      `,
      Dep: `pub let x = 42`,
    },
  });

  checker.upsert("pkg", "Dep", unsafeParse(``));
});

type RawProject = Record<string, Record<string, string>>;
function prjTypechecker(
  proj: RawProject,
  options: Partial<project.ProjectOptions> = {},
) {
  const proj_ = new DefaultMap<string, Map<string, UntypedModule>>(
    () => new Map(),
  );

  for (const [pkg, modules] of Object.entries(proj)) {
    for (const [moduleId, source] of Object.entries(modules)) {
      proj_.get(moduleId).set(pkg, unsafeParse(source));
    }
  }

  return new project.ProjectTypechecker(proj_.inner, {
    implicitImports: [],
    traitImpls: [],
    ...options,
  });
}
