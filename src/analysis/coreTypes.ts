import { Type } from "../type";

const KESTREL_CORE = "kestrel_core";

export const bool: Type = {
  tag: "Named",
  package: KESTREL_CORE,
  module: "Bool",
  name: "Bool",
  args: [],
};

export const int: Type = {
  tag: "Named",
  package: KESTREL_CORE,
  module: "Int",
  name: "Int",
  args: [],
};

export const float: Type = {
  tag: "Named",
  package: KESTREL_CORE,
  module: "Float",
  name: "Float",
  args: [],
};

export const string: Type = {
  tag: "Named",
  package: KESTREL_CORE,
  module: "String",
  name: "String",
  args: [],
};

export const char: Type = {
  tag: "Named",
  package: KESTREL_CORE,
  module: "Char",
  name: "Char",
  args: [],
};

export const unit: Type = {
  tag: "Named",
  package: KESTREL_CORE,
  module: "Tuple",
  name: "Unit",
  args: [],
};

export const list = (a: Type): Type => ({
  tag: "Named",
  package: KESTREL_CORE,
  module: "List",
  name: "List",
  args: [a],
});

export function task(arg: Type): Type {
  return {
    tag: "Named",
    package: KESTREL_CORE,
    module: "Task",
    name: "Task",
    args: [arg],
  };
}
