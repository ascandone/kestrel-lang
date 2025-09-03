import { describe, expect, test } from "vitest";
import { makeModuleId } from "./analysis-state";

describe("makeModuleId", () => {
  test("no source dirs", () => {
    const out = makeModuleId({
      uri: "file:///src/My/Mod/File.kes",
      currentDirectory: "/",
      sourceDirectories: [],
    });

    expect(out).toEqual(undefined);
  });

  test("single folder", () => {
    const out = makeModuleId({
      uri: "file:///Users/user/Desktop/my-project/src/My/Nested/Mod.kes",
      currentDirectory: "/Users/user/Desktop/my-project",
      sourceDirectories: ["user", "src"],
    });

    expect(out).toEqual("My/Nested/Mod");
  });
});
