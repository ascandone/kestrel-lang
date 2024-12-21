import { Type } from "./type";

export const bool: Type = {
  type: "named",
  moduleName: "Bool",
  name: "Bool",
  args: [],
};

export const int: Type = {
  moduleName: "Int",
  type: "named",
  name: "Int",
  args: [],
};

export const float: Type = {
  moduleName: "Float",
  type: "named",
  name: "Float",
  args: [],
};

export const string: Type = {
  moduleName: "String",
  type: "named",
  name: "String",
  args: [],
};

export const char: Type = {
  moduleName: "Char",
  type: "named",
  name: "Char",
  args: [],
};

export const unit: Type = {
  type: "named",
  moduleName: "Tuple",
  name: "Unit",
  args: [],
};

export const list = (a: Type): Type => ({
  type: "named",
  moduleName: "List",
  name: "List",
  args: [a],
});

export function task(arg: Type): Type {
  return {
    type: "named",
    moduleName: "Task",
    name: "Task",
    args: [arg],
  };
}
