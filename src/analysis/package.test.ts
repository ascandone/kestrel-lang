import { expect, test, vi } from "vitest";
import { PackageWatcher } from "./package";

function setup() {
  const onVisit = vi.fn();
  const watcher = new PackageWatcher({
    package: "kestrel_core",
    exposedModules: new Set(),
    packageModules: {},
    packageDependencies: {},
    onAnalysis(analysis) {
      onVisit(analysis.ns);
    },
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
