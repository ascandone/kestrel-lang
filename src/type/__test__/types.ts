import { ConcreteType, Type } from "..";

export const BASICS_MODULE = "Basics";
export const CORE_PACKAGE = "kestrel_core";

export const Int: ConcreteType = {
  module: BASICS_MODULE,
  package_: CORE_PACKAGE,
  type: "named",
  name: "Int",
  args: [],
};
export const Float: ConcreteType = {
  module: BASICS_MODULE,
  package_: CORE_PACKAGE,
  type: "named",
  name: "Float",
  args: [],
};
export const String: ConcreteType = {
  module: BASICS_MODULE,
  package_: CORE_PACKAGE,
  type: "named",
  name: "String",
  args: [],
};
export const Bool: ConcreteType = {
  module: BASICS_MODULE,
  package_: CORE_PACKAGE,
  type: "named",
  name: "Bool",
  args: [],
};
export const Unit: ConcreteType = {
  module: BASICS_MODULE,
  package_: CORE_PACKAGE,
  type: "named",
  name: "Unit",
  args: [],
};
export function List(arg: Type): ConcreteType {
  return {
    module: BASICS_MODULE,
    package_: CORE_PACKAGE,
    type: "named",
    name: "List",
    args: [arg],
  };
}

export function Option(arg: Type): ConcreteType {
  return {
    module: BASICS_MODULE,
    package_: CORE_PACKAGE,
    type: "named",
    name: "Option",
    args: [arg],
  };
}
const supportedTuplesArities = [2];
export function Tuple(...args: Type[]): ConcreteType {
  if (!supportedTuplesArities.includes(args.length)) {
    throw new Error("Unsupported tuple arity: " + args.length);
  }

  return {
    type: "named",
    package_: CORE_PACKAGE,
    module: "Tuple",
    name: `Tuple${args.length}`,
    args,
  };
}

export function Fn(args: Type[], ret: Type): ConcreteType {
  return { type: "fn", args, return: ret };
}
