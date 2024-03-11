import { describe, expect, test } from "vitest";
import { Frame, FramesStack } from "./frame";

type Binding = { name: string };

const x = { name: "x" },
  y = { name: "y" };

const decl = { name: "decl" };

test("local var should be resolved", () => {
  const frame = new Frame<Binding>(decl, []);

  frame.defineLocal(x);

  expect(frame.resolve("x")).toBe(x);
});

test("local var should not leak outside scope", () => {
  // { let x = value; body }
  // x // <- not found
  const frame = new Frame<Binding>(decl, []);

  frame.defineLocal(x);
  frame.exitLocal();

  expect(frame.resolve("x")).toBe(undefined);
});

test("bindings should stack", () => {
  const frame = new Frame<Binding>(decl, []);

  frame.defineLocal(x);
  frame.defineLocal(y);

  expect(frame.resolve("x")).toBe(x);
  expect(frame.resolve("y")).toBe(y);
});

test("bindings should shadow each other", () => {
  // { let x = value1; x = value1; x }

  const frame = new Frame<Binding>(decl, []);

  const x1 = { name: "x", value: 1 },
    x2 = { name: "x", value: 2 };

  frame.defineLocal(x1);
  frame.defineLocal(x2);

  expect(frame.resolve("x")).toBe(x2);

  frame.exitLocal();
  expect(frame.resolve("x")).toBe(x1);
});

test("params should be reachable", () => {
  const frame = new Frame<Binding>(decl, [x]);

  expect(frame.resolve("x")).toBe(x);
});

test("local vars should shadow params", () => {
  const x1 = { name: "x", value: 1 },
    x2 = { name: "x", value: 2 };

  const frame = new Frame<Binding>(decl, [x1]);

  frame.defineLocal(x2);
  expect(frame.resolve("x")).toBe(x2);

  frame.exitLocal();
  expect(frame.resolve("x")).toBe(x1);
});

test("allows recursion", () => {
  const frame = new Frame<Binding>(x, []);

  expect(frame.resolve("x")).toBe(x);
});

test("locals shadow recursive binding", () => {
  const x1 = { name: "x", value: 1 },
    x2 = { name: "x", value: 2 };

  const frame = new Frame<Binding>(x1, []);
  frame.defineLocal(x2);

  expect(frame.resolve("x")).toBe(x2);
});

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
    frames.defineRecursiveLabel(x);
    expect(frames.resolve("x")).toEqual(undefined);
  });

  test("recursive labels are not resolved in nested frames", () => {
    const frames = new FramesStack();
    frames.defineRecursiveLabel(x);
    frames.pushFrame([]);
    expect(frames.resolve("x")).toEqual({
      type: "local",
      binding: x,
    });
  });

  test("recursive labels do not leak when frames are popped and are not lost after frame is pushed again", () => {
    const frames = new FramesStack();
    frames.defineRecursiveLabel(x);
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
    frames.defineRecursiveLabel(x);
    frames.pushFrame([]);
    frames.defineRecursiveLabel(y);

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
});
