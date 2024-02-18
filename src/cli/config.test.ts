import { expect, test } from "vitest";
import { Config, configDecoder, defaultConfig } from "./config";

test("decode default config", () => {
  expect(() => configDecoder.decodeUnsafeThrow(defaultConfig)).not.toThrow();
});

test("decode application config", () => {
  const c = {
    type: "application",
    dependencies: {
      core: { path: "~/example/path" },
    },
    "source-directories": ["src"],
  };
  expect(configDecoder.decodeUnsafeThrow(c)).toEqual<Config>({
    type: "application",
    dependencies: {
      core: { type: "local", path: "~/example/path" },
    },
    "source-directories": ["src"],
  });
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
