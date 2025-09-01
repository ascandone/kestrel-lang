import { ConcreteType, Type } from "../type";

export const CORE_PACKAGE = "kestrel_core";

// Keep this in sync with core
export const Bool: ConcreteType = {
  type: "named",
  package_: CORE_PACKAGE,
  module: "Bool",
  name: "Bool",
  args: [],
};

export const Int: ConcreteType = {
  type: "named",
  package_: CORE_PACKAGE,
  module: "Int",
  name: "Int",
  args: [],
};

export const Float: ConcreteType = {
  type: "named",
  package_: CORE_PACKAGE,
  module: "Float",
  name: "Float",
  args: [],
};

export const String: ConcreteType = {
  type: "named",
  package_: CORE_PACKAGE,
  module: "String",
  name: "String",
  args: [],
};

export const Char: ConcreteType = {
  type: "named",
  package_: CORE_PACKAGE,
  module: "Char",
  name: "Char",
  args: [],
};

export const Unit: ConcreteType = {
  type: "named",
  package_: CORE_PACKAGE,
  module: "Tuple",
  name: "Unit",
  args: [],
};

export const List = (a: Type): ConcreteType => ({
  type: "named",
  package_: CORE_PACKAGE,
  module: "List",
  name: "List",
  args: [a],
});

export function Task(arg: Type): ConcreteType {
  return {
    type: "named",
    package_: CORE_PACKAGE,
    module: "Task",
    name: "Task",
    args: [arg],
  };
}
