import { expect, test } from "vitest";
import { configDecoder } from "./config";

test("decode application config", () => {
  const c = {
    type: "application",
    dependencies: {
      core: { path: "~/example/path" },
    },
    "source-directories": ["src"],
  };
  expect(configDecoder.decodeUnsafeThrow(c)).toEqual(c);
});

test("decode package config", () => {
  const c = {
    type: "package",
    name: "example-package",
    version: "1.0.0",
    "source-directories": ["src"],
  };
  expect(configDecoder.decodeUnsafeThrow(c)).toEqual(c);
});
