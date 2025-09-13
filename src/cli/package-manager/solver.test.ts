import { expect, test, vi } from "vitest";
import { Resolution, solve, toAsyncList } from "./solver";

const MAIN = ".";

test("cacher", async () => {
  const f = vi.fn((x) => x);

  const asyncLazyList = toAsyncList(
    (async function* () {
      for (const x of "abcd") {
        yield f(x);
      }
    })(),
  );

  expect(f).toHaveBeenCalledTimes(0);

  const x0 = await asyncLazyList();
  expect(x0?.head).toEqual("a");
  expect(f).toHaveBeenCalledTimes(1);

  const x0_bis = await asyncLazyList();
  expect(x0_bis?.head).toEqual("a");
  expect(f).toHaveBeenCalledTimes(1);

  const x1 = await x0?.next();
  expect(x1?.head).toEqual("b");
  expect(f).toHaveBeenCalledTimes(2);

  const x1_bis = await x0_bis?.next();
  expect(x1_bis?.head).toEqual("b");
  expect(f).toHaveBeenCalledTimes(2);
});

test("no deps", async () => {
  const resolved = await testSolver({
    [MAIN]: {},
  });

  expect(resolved).toEqual<Resolution>({});
});

test("single dependency (transitive)", async () => {
  const resolved = await testSolver({
    [MAIN]: {
      a: "1.0.0",
    },
    "a@1.0.0": {
      b: "1.0.0",
    },
    "b@1.0.0": {},
  });

  expect(resolved).toEqual({
    a: "1.0.0",
    b: "1.0.0",
  });
});

test("choose highest dependency available if possible", async () => {
  const resolved = await testSolver({
    [MAIN]: {
      a: ">=1.0.0",
    },
    "a@1.0.0": {},
    "a@2.0.0": {},
    "a@2.0.5": {},
  });

  expect(resolved).toEqual({
    a: "2.0.5",
  });
});

test("use constraints from other deps", async () => {
  const resolved = await testSolver({
    [MAIN]: {
      a: ">=1.0.0",
      b: "1.0.0",
    },
    "a@1.0.0": {},
    "a@2.0.0": {},
    "a@2.0.5": {},

    "b@1.0.0": {
      a: "1.0.0",
    },
  });

  expect(resolved).toEqual({
    a: "1.0.0",
    b: "1.0.0",
  });
});

test("backtrack", async () => {
  const resolved = await testSolver({
    [MAIN]: {
      a: "1.0.0",
      b: ">=1.0.0",
    },
    "b@1.0.0": {},
    "b@2.0.0": {},
    "b@2.0.5": {},

    "a@1.0.0": {
      b: "1.0.0",
    },
  });

  expect(resolved).toEqual({
    a: "1.0.0",
    b: "1.0.0",
  });
});

test("unsolvable", async () => {
  const resolved = await testSolver({
    [MAIN]: {
      a: "1.0.0",
      b: "1.0.0",
    },
    "b@1.0.0": {},
    "a@1.0.0": {
      b: "2.0.0",
    },
  });

  expect(resolved).toEqual(undefined);
});

// Helpers

function testSolver(
  graph: Record<string, Record<string, string>>,
): Promise<Resolution | undefined> {
  const availableVersions: Record<string, string[]> = {};

  for (const lib of Object.keys(graph)) {
    if (lib === MAIN) {
      continue;
    }

    const [name, version] = lib.split("@");

    if (!(name! in availableVersions)) {
      availableVersions[name!] = [];
    }
    availableVersions[name!]!.push(version!);
  }

  return solve(graph[MAIN]!, {
    async fetchAvailableVersions(pkg) {
      const lookup = availableVersions[pkg];
      if (lookup === undefined) {
        throw new Error(`package not found: '${pkg}'`);
      }
      return lookup;
    },
    async fetchDependencies(pkg, version) {
      const lookup = graph[`${pkg}@${version}`];
      if (lookup === undefined) {
        throw new Error(`package not found: '${pkg}'`);
      }
      return lookup;
    },
  });
}
