import { expect, test } from "vitest";
import * as project from "./project";
import { DefaultMap } from "../common/defaultMap";
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

test("single module with parsing erro", () => {
  const checker = prjTypechecker({
    pkg: {
      Main: "pub let x = ",
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
            description: expect.any(err.ParsingError),
            range: expect.anything(),
          },
        ],
      ],
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

test("prevent dependency cycle", () => {
  const checker = prjTypechecker({
    pkg: {
      A: `
        import B
        pub let x = B.x
      `,
      B: `
        import C
        pub let x = C.x
      `,
      C: `
        import A
        pub let x = A.x
      `,
    },
  });

  const changed = checker.typecheck();

  expect(changed).toEqual([
    expect.objectContaining({
      package_: "pkg",
      moduleId: "C",
      output: [
        expect.anything(),
        <err.ErrorInfo[]>[
          {
            description: new err.CyclicImport(["A", "B", "C", "A"]),
            range: expect.anything(),
          },
        ],
      ],
    }),
    expect.objectContaining({
      package_: "pkg",
      moduleId: "B",
      output: [expect.anything(), []],
    }),
    expect.objectContaining({
      package_: "pkg",
      moduleId: "A",
      output: [expect.anything(), []],
    }),
  ]);
});

test("prevent ambiguous import", () => {
  const checker = prjTypechecker(
    {
      pkg: {
        Main: `
        import Dep
        pub let x = Dep.x
      `,
      },

      pkg1: {
        Dep: ``,
      },
      pkg2: {
        Dep: ``,
      },
    },
    {
      packageDependencies: new Map(
        Object.entries({
          pkg: new Set(["pkg1", "pkg2"]),
        }),
      ),
    },
  );

  const changed = checker.typecheck();

  expect(changed).toEqual([
    expect.objectContaining({
      package_: "pkg",
      moduleId: "Main",
      output: [
        expect.anything(),

        <err.ErrorInfo[]>[
          {
            description: new err.AmbiguousImport(["pkg1", "pkg2"]),
            range: expect.anything(),
          },
        ],
      ],
    }),

    expect.objectContaining({
      package_: "pkg1",
      moduleId: "Dep",
      output: [expect.anything(), expect.anything()],
    }),

    expect.objectContaining({
      package_: "pkg2",
      moduleId: "Dep",
      output: [expect.anything(), expect.anything()],
    }),
  ]);
});

test("invalidate all the reachable inverse dependency graph on upsert", () => {
  const checker = prjTypechecker({
    pkg: {
      Main: `
        import Dep
        import Dep2

        pub let x1 = Dep.x
        pub let x2 = Dep2.x
      `,
      Dep: `pub let x = 42`,
      Dep2: `pub let x = 42`,
    },
  });
  checker.typecheck();

  checker.upsert("pkg", "Dep", ``);
  const changed = checker.typecheck();

  // We don't want to typecheck Dep2 as well
  expect(changed).toEqual([
    expect.objectContaining({ package_: "pkg", moduleId: "Dep" }),
    expect.objectContaining({ package_: "pkg", moduleId: "Main" }),
  ]);
});

test("invalidate all the reachable inverse dependency graph on delete", () => {
  const checker = prjTypechecker({
    pkg: {
      Main: `
        import Dep
        import Dep2

        pub let x1 = Dep.x
        pub let x2 = Dep2.x
      `,
      Dep: `pub let x = 42`,
      Dep2: `pub let x = 42`,
    },
  });
  checker.typecheck();

  checker.delete("pkg", "Dep");
  const changed = checker.typecheck();

  expect(changed).toEqual([
    expect.objectContaining({ package_: "pkg", moduleId: "Main" }),
  ]);
});

type RawProject = Record<string, Record<string, string>>;
function prjTypechecker(
  proj: RawProject,
  options: Partial<project.ProjectOptions> = {},
) {
  const proj_ = new DefaultMap<string, Map<string, string>>(() => new Map());

  for (const [pkg, modules] of Object.entries(proj)) {
    for (const [moduleId, source] of Object.entries(modules)) {
      proj_.get(moduleId).set(pkg, source);
    }
  }

  return new project.ProjectTypechecker(proj_.inner, {
    implicitImports: [],
    traitImpls: [],
    ...options,
  });
}
