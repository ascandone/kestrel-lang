import { Type } from "../type/type";

export const string: Type = { tag: "Named", name: "String", args: [] };
export const num: Type = { tag: "Named", name: "Num", args: [] };
export const bool: Type = { tag: "Named", name: "Bool", args: [] };
export const list = (x: Type): Type => ({
  tag: "Named",
  name: "List",
  args: [x],
});
export const tuple = (...ts: Type[]): Type => ({
  tag: "Named",
  name: `Tuple${ts.length}`,
  args: ts,
});
export const result = (t1: Type, t2: Type): Type => ({
  tag: "Named",
  name: `Result`,
  args: [t1, t2],
});
export const unit: Type = {
  tag: "Named",
  name: `Unit`,
  args: [],
};
export const maybe = (...ts: Type[]): Type => ({
  tag: "Named",
  name: "Maybe",
  args: ts,
});

export const fn = (args: Type[], return_: Type): Type => ({
  tag: "Fn",
  args,
  return: return_,
});

export const $ = (id: number): Type => ({ tag: "Var", id });

export const _0 = $(0),
  _1 = $(1),
  _2 = $(2),
  _3 = $(3),
  _4 = $(4);
