import { ConcreteType, Poly, TVar, Type, generalize } from "../typecheck/unify";

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

export function Fn(args: Type[], ret: Type): ConcreteType {
  return { type: "fn", args, return: ret };
}

export function gen(f: (args: Generator<Type>) => Type): Type<Poly> {
  function* freshVars() {
    while (true) {
      yield TVar.fresh().asType();
    }
  }
  const t = f(freshVars());
  return generalize(t);
}
