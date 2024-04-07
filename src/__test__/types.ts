import { ConcreteType, Type } from "../typecheck/type";

export const BASICS_MODULE = "Basics";

export const Int: ConcreteType = {
  moduleName: BASICS_MODULE,
  type: "named",
  name: "Int",
  args: [],
};
export const Float: ConcreteType = {
  moduleName: BASICS_MODULE,
  type: "named",
  name: "Float",
  args: [],
};
export const String: ConcreteType = {
  moduleName: BASICS_MODULE,
  type: "named",
  name: "String",
  args: [],
};
export const Bool: ConcreteType = {
  moduleName: BASICS_MODULE,
  type: "named",
  name: "Bool",
  args: [],
};
export const Unit: ConcreteType = {
  moduleName: BASICS_MODULE,
  type: "named",
  name: "Unit",
  args: [],
};
export function List(arg: Type): ConcreteType {
  return {
    moduleName: BASICS_MODULE,
    type: "named",
    name: "List",
    args: [arg],
  };
}

export function Option(arg: Type): ConcreteType {
  return {
    moduleName: BASICS_MODULE,
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
    moduleName: BASICS_MODULE,
    type: "named",
    name: `Tuple${args.length}`,
    args,
  };
}

export function Fn(args: Type[], ret: Type): ConcreteType {
  return { type: "fn", args, return: ret };
}
