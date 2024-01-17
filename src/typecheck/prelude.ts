import { ConcreteType, Context, TVar, Type, generalize } from "./unify";

const Int: ConcreteType = { type: "named", name: "Int", args: [] };
const Bool: ConcreteType = { type: "named", name: "Bool", args: [] };
const Nil: ConcreteType = { type: "named", name: "Nil", args: [] };
function Pair(...args: Type[]): ConcreteType {
  return { type: "named", name: "Pair", args };
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
  pair: gen(([$a, $b]) => Fn([$a!, $b!], Pair($a!, $b!))),
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
