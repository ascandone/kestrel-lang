import { test, expect } from "vitest";
import { TraitRegistry } from "./traitsRegistry";

const mockTraitImpl = {
  trait: "Eq",
  packageName: "core",
  moduleName: "Main",
} as const;

const mockType = {
  tag: "Named",
  module: mockTraitImpl.moduleName,
  package: mockTraitImpl.packageName,
} as const;

test("cannot derive an unregisted named type", () => {
  const registry = TraitRegistry.from([]);
  const deps = registry.getTraitDepsFor(mockTraitImpl.trait, {
    ...mockType,
    name: "Custom",
    args: [],
  });

  expect(deps).toEqual(undefined);
});

test("cannot derive a function type", () => {
  const registry = TraitRegistry.from([]);
  const deps = registry.getTraitDepsFor(mockTraitImpl.trait, {
    tag: "Fn",
    args: [],
    return: { tag: "Var", id: 42 },
  });

  expect(deps).toEqual(undefined);
});

test("derive without type args", () => {
  const registry = TraitRegistry.from([
    {
      ...mockTraitImpl,
      typeName: "Int",
    },
  ]);

  const deps = registry.getTraitDepsFor(mockTraitImpl.trait, {
    ...mockType,
    name: "Int",
    args: [],
  });

  expect(deps).toEqual(new Set());
});

test("derive with type args when args derive", () => {
  const registry = TraitRegistry.from([
    {
      ...mockTraitImpl,
      typeName: "Int",
    },
    {
      ...mockTraitImpl,
      typeName: "Bool",
    },
    {
      ...mockTraitImpl,
      typeName: "Result",
      deps: [true, true],
    },
  ]);

  const deps = registry.getTraitDepsFor(mockTraitImpl.trait, {
    ...mockType,
    name: "Result",
    args: [
      { ...mockType, name: "Int", args: [] },
      { ...mockType, name: "Bool", args: [] },
    ],
  });

  expect(deps).toEqual(new Set());
});

test("derive with type args when args do not derive", () => {
  const registry = TraitRegistry.from([
    {
      ...mockTraitImpl,
      typeName: "Int",
    },
    // Bool does not derive
    {
      ...mockTraitImpl,
      typeName: "Result",
      deps: [true, true],
    },
  ]);

  const deps = registry.getTraitDepsFor(mockTraitImpl.trait, {
    ...mockType,
    name: "Result",
    args: [
      { ...mockType, name: "Int", args: [] },
      { ...mockType, name: "Bool", args: [] },
    ],
  });

  expect(deps).toEqual(undefined);
});

test("return type var dependencies", () => {
  const registry = TraitRegistry.from([
    {
      ...mockTraitImpl,
      typeName: "Result",
      deps: [true, true],
    },
  ]);

  const deps = registry.getTraitDepsFor(mockTraitImpl.trait, {
    ...mockType,
    name: "Result",
    args: [
      { tag: "Var", id: 100 },
      { tag: "Var", id: 200 },
    ],
  });

  expect(deps).toEqual(new Set([100, 200]));
});

test("return type var dependencies (nested)", () => {
  const registry = TraitRegistry.from([
    {
      ...mockTraitImpl,
      typeName: "List",
      deps: [true],
    },
    {
      ...mockTraitImpl,
      typeName: "Result",
      deps: [false, true],
    },
  ]);

  const deps = registry.getTraitDepsFor(mockTraitImpl.trait, {
    ...mockType,
    name: "Result",
    args: [
      {
        ...mockType,
        tag: "Named",
        name: "Int",
        args: [],
      },
      {
        ...mockType,
        tag: "Named",
        name: "List",
        args: [{ tag: "Var", id: 42 }],
      },
    ],
  });

  expect(deps).toEqual(new Set([42]));
});
