import { ConcreteType, Context, TVar, Type, generalize } from "./unify";

export const Int: ConcreteType = { type: "named", name: "Int", args: [] };
export const Float: ConcreteType = { type: "named", name: "Float", args: [] };
export const Bool: ConcreteType = { type: "named", name: "Bool", args: [] };
export const Nil: ConcreteType = { type: "named", name: "Nil", args: [] };
export function List(arg: Type): ConcreteType {
  return { type: "named", name: "List", args: [arg] };
}
export function Maybe(arg: Type): ConcreteType {
  return { type: "named", name: "Maybe", args: [arg] };
}
export function Tuple(...args: Type[]): ConcreteType {
  return { type: "named", name: "Tuple", args };
}

function Fn(args: Type[], ret: Type): ConcreteType {
  return { type: "fn", args, return: ret };
}

export const prelude: Context = {
  "+": Fn([Int, Int], Int),
  "-": Fn([Int, Int], Int),
  "*": Fn([Int, Int], Int),
  "/": Fn([Int, Int], Int),
  "^": Fn([Int, Int], Int),
  "%": Fn([Int, Int], Int),
  ">": Fn([Int, Int], Int),
  ">=": Fn([Int, Int], Int),
  "<": Fn([Int, Int], Int),
  "<=": Fn([Int, Int], Int),

  "||": Fn([Bool, Bool], Bool),
  "&&": Fn([Bool, Bool], Bool),

  "==": gen(([$a]) => Fn([$a!, $a!], Bool)),
  "!=": gen(([$a]) => Fn([$a!, $a!], Bool)),

  negate: Fn([Int], Int),
  not: Fn([Bool], Bool),
  True: Bool,
  False: Bool,
  Nil: Nil,
  pair: gen(([$a, $b]) => Fn([$a!, $b!], Tuple($a!, $b!))),
};

function gen(f: (args: Generator<Type>) => Type): Type {
  function* freshVars() {
    while (true) {
      yield TVar.fresh().asType();
    }
  }
  const t = f(freshVars());
  return generalize(t);
}
