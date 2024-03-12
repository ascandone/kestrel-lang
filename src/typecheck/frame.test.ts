import { describe, expect, test } from "vitest";
import { BindingResolution, FramesStack } from "./frame";

type Binding = { name: string };
type Declaration = { binding: Binding };

const x = { name: "x" },
  y = { name: "y" };

describe("frames stack", () => {
  test("allows to define toplevel locals", () => {
    const frames = new FramesStack();

    frames.defineLocal(x);
    expect(frames.resolve("x")).toEqual({
      type: "local",
      binding: x,
    });
  });

  test("allows to define locals in nested frames", () => {
    const frames = new FramesStack();
    frames.pushFrame([x]);
    frames.defineLocal(y);
    expect(frames.resolve("y")).toEqual({
      type: "local",
      binding: y,
    });
    expect(frames.resolve("x")).toEqual({
      type: "local",
      binding: x,
    });
  });

  test("does not leak popped locals", () => {
    const frames = new FramesStack();
    frames.pushFrame([]);
    frames.defineLocal(x);
    frames.popFrame();
    expect(frames.resolve("x")).toBe(undefined);
  });

  test("allows closures", () => {
    const frames = new FramesStack();
    frames.defineLocal(x);
    frames.pushFrame([]);
    expect(frames.resolve("x")).toEqual({
      type: "local",
      binding: x,
    });
  });

  test("recursive labels are not resolved in the current frame", () => {
    const frames = new FramesStack();
    frames.defineRecursiveLabel({ type: "local", binding: x });
    expect(frames.resolve("x")).toEqual(undefined);
  });

  test("recursive labels are not resolved in nested frames", () => {
    const frames = new FramesStack();
    frames.defineRecursiveLabel({ type: "local", binding: x });
    frames.pushFrame([]);
    expect(frames.resolve("x")).toEqual({
      type: "local",
      binding: x,
    });
  });

  test("recursive labels do not leak when frames are popped and are not lost after frame is pushed again", () => {
    const frames = new FramesStack();
    frames.defineRecursiveLabel({ type: "local", binding: x });
    frames.pushFrame([]);
    frames.popFrame();

    expect(frames.resolve("x")).toEqual(undefined);

    frames.pushFrame([]);
    expect(frames.resolve("x")).toEqual({
      type: "local",
      binding: x,
    });
  });

  test("recursive labels can be nested", () => {
    const frames = new FramesStack();
    frames.defineRecursiveLabel({ type: "local", binding: x });
    frames.pushFrame([]);
    frames.defineRecursiveLabel({ type: "local", binding: y });

    frames.pushFrame([]);

    expect(frames.resolve("x")).toEqual({
      type: "local",
      binding: x,
    });

    expect(frames.resolve("y")).toEqual({
      type: "local",
      binding: y,
    });
  });

  test("allows globals", () => {
    const frames = new FramesStack<Binding, { binding: Binding }>();
    frames.defineGlobal({ binding: x }, "ns");
    expect(frames.resolve("x")).toEqual<
      BindingResolution<Binding, Declaration>
    >({
      type: "global",
      declaration: { binding: x },
      namespace: "ns",
    });
  });

  test("locals shadow globals", () => {
    const frames = new FramesStack<Binding, { binding: Binding }>();
    frames.defineGlobal({ binding: x }, undefined);
    frames.defineLocal(x);
    expect(frames.resolve("x")).toEqual({
      type: "local",
      binding: x,
    });
  });
});
