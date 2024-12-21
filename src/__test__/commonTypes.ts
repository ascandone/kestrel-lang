import { Type } from "../type/type";

export const string: Type = {
  tag: "Named",
  module: "Main",
  package: "core",
  name: "String",
  args: [],
};
export const num = {
  tag: "Named",
  module: "Main",
  package: "core",
  name: "Num",
  args: [],
} satisfies Type;
export const bool: Type = {
  tag: "Named",
  module: "Main",
  package: "core",
  name: "Bool",
  args: [],
};
export const list = (x: Type): Type => ({
  tag: "Named",
  module: "Main",
  package: "core",
  name: "List",
  args: [x],
});
export const tuple = (...ts: Type[]): Type => ({
  tag: "Named",
  module: "Main",
  package: "core",
  name: `Tuple${ts.length}`,
  args: ts,
});
export const result = (t1: Type, t2: Type) =>
  ({
    tag: "Named",
    module: "Main",
    package: "core",
    name: `Result`,
    args: [t1, t2],
  }) satisfies Type;
export const unit: Type = {
  tag: "Named",
  module: "Main",
  package: "core",
  name: `Unit`,
  args: [],
};
export const maybe = (...ts: Type[]): Type => ({
  tag: "Named",
  module: "Main",
  package: "core",
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
