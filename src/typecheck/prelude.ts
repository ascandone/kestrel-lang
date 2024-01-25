import { ConcreteType, Context, Poly, TVar, Type, generalize } from "./unify";

export const Int: ConcreteType = { type: "named", name: "Int", args: [] };
export const Float: ConcreteType = { type: "named", name: "Float", args: [] };
export const String: ConcreteType = { type: "named", name: "String", args: [] };
export const Bool: ConcreteType = { type: "named", name: "Bool", args: [] };
export const Nil: ConcreteType = { type: "named", name: "Nil", args: [] };
export function List(arg: Type): ConcreteType {
  return { type: "named", name: "List", args: [arg] };
}
export function Maybe(arg: Type): ConcreteType {
  return { type: "named", name: "Maybe", args: [arg] };
}
const supportedTuplesArities = [2];
export function Tuple(...args: Type[]): ConcreteType {
  if (!supportedTuplesArities.includes(args.length)) {
    throw new Error("Unsupported tuple arity: " + args.length);
  }

  return { type: "named", name: `Tuple${args.length}`, args };
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

  "+.": Fn([Float, Float], Float),
  "-.": Fn([Float, Float], Float),
  "*.": Fn([Float, Float], Float),
  "/.": Fn([Float, Float], Float),

  "||": Fn([Bool, Bool], Bool),
  "&&": Fn([Bool, Bool], Bool),
  "!": Fn([Bool], Bool),

  ">": gen(([$a]) => Fn([$a!, $a!], Bool)),
  ">=": gen(([$a]) => Fn([$a!, $a!], Bool)),
  "<": gen(([$a]) => Fn([$a!, $a!], Bool)),
  "<=": gen(([$a]) => Fn([$a!, $a!], Bool)),
  "==": gen(([$a]) => Fn([$a!, $a!], Bool)),
  "!=": gen(([$a]) => Fn([$a!, $a!], Bool)),

  "<>": Fn([String, String], String),
};

function gen(f: (args: Generator<Type>) => Type): Type<Poly> {
  function* freshVars() {
    while (true) {
      yield TVar.fresh().asType();
    }
  }
  const t = f(freshVars());
  return generalize(t);
}

export type TypesPool = Record<string, number>;
