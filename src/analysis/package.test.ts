import { expect, test, vi } from "vitest";
import { CompilePackageOptions, PackageWatcher } from "./package";
import { unsafeParse } from "../parser";

function setup(opts: Partial<CompilePackageOptions> = {}) {
  const onVisit = vi.fn();
  const watcher = new PackageWatcher({
    package: "kestrel_core",
    exposedModules: new Set(),
    packageModules: {},
    packageDependencies: {},
    onAnalysis(analysis) {
      onVisit(analysis.ns);
    },
    ...opts,
  });
  return [watcher, onVisit] as const;
}

test("cache HIT initially", () => {
  const [watcher, onVisit] = setup();

  watcher.addFile("Dependency", `pub let x = 0`);
  watcher.addFile(
    "Main",
    `
    import Dependency
    pub let y = Dependency.x
  `,
  );

  expect(onVisit.mock.calls).toEqual([
    // add("Dependency")
    ["Dependency"],

    // add("Main")
    ["Main"], // don't recompile Dependency
  ]);
});

test("recompile transitevely when changing a dependency", () => {
  const [watcher, onVisit] = setup();

  watcher.addFile("Dependency", `pub let x = 0`);
  watcher.addFile(
    "Main",
    `
    import Dependency
    pub let y = Dependency.x
  `,
  );

  // This will invalide Main's cache
  watcher.addFile("Dependency", `pub let x = "abc"`);

  expect(onVisit.mock.calls).toEqual([
    // add("Dependency")
    ["Dependency"],
    // add("Main")
    ["Main"],

    // add("Dependency")
    ["Dependency"],
    ["Main"],
  ]);
});

test("do not invalidate dependency when not needed", () => {
  const [watcher, onVisit] = setup();

  watcher.addFile("Dependency", `pub let x = 0`);
  watcher.addFile(
    "Main",
    `
    import Dependency
    pub let y = Dependency.x
  `,
  );

  // This shouldn't invalide Dependency's cache
  watcher.addFile(
    "Main",
    `
    import Dependency
    pub let y = 42
  `,
  );

  expect(onVisit.mock.calls).toEqual([
    // add("Dependency")
    ["Dependency"],
    // add("Main")
    ["Main"],

    // add("Main")
    ["Main"],
  ]);
});

test("analyse the initial modules", () => {
  const [, onVisit] = setup({
    packageModules: {
      Main: unsafeParse(`
    import Dependency
    pub let y = Dependency.x
  `),
      Dependency: unsafeParse(`pub let x = 0`),
    },
  });

  expect(onVisit.mock.calls).toEqual([
    // Init
    ["Dependency"],
    ["Main"],
  ]);
});

test("add a new module to the initial ones", () => {
  const [w, onVisit] = setup({
    packageModules: {
      Main: unsafeParse(`
    import Dependency
    pub let y = Dependency.x
  `),
      Dependency: unsafeParse(`pub let x = 0`),
    },
  });

  w.addFile("NewMod", `import Main`);

  expect(onVisit.mock.calls).toEqual([
    // Init
    ["Dependency"],
    ["Main"],
    // Add(NewMod)
    ["NewMod"],
  ]);
});

test("override a file in the initial package", () => {
  const [w, onVisit] = setup({
    packageModules: {
      Main: unsafeParse(`
    import Dependency
    pub let y = Dependency.x
  `),
      Dependency: unsafeParse(`pub let x = 0`),
    },
  });

  w.addFile("Dependency", `let y = 0`);

  expect(onVisit.mock.calls).toEqual([
    // Init
    ["Dependency"],
    ["Main"],
    // Add(Dependency)
    ["Dependency"],
    ["Main"],
  ]);
});
