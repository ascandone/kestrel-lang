import { test, expect, describe } from "vitest";
import {
  normalizeResolved,
  OccursCheckError,
  Type,
  TypeMismatchError,
  Unifier,
} from "./type";
import { num, bool, list, tuple, fn, _0, _1 } from "../__test__/commonTypes";

describe("unify", () => {
  test("unifing two concrete vars when they match", () => {
    const u = new Unifier();

    expect(() => u.unify(num, num)).not.toThrow();
    expect(() => u.unify(list(num), list(num))).not.toThrow();
  });

  test("unifing two fn types when they match", () => {
    const u = new Unifier();

    expect(() => {
      u.unify(fn([num], num), fn([num], num));
    }).not.toThrow();
  });

  test("unifing two fn types when they do not match", () => {
    const u = new Unifier();

    expect(() => {
      u.unify(fn([num], bool), fn([num], num));
    }).toThrow(TypeMismatchError);

    expect(() => {
      u.unify(fn([bool], num), fn([num], num));
    }).toThrow(TypeMismatchError);
  });

  test("fail to unify a fn with a named type", () => {
    const u = new Unifier();

    expect(() => {
      u.unify(fn([num], bool), num);
    }).toThrow(TypeMismatchError);

    expect(() => {
      u.unify(num, fn([num], num));
    }).toThrow(TypeMismatchError);
  });

  test("unify two concrete vars that do not match", () => {
    const u = new Unifier();

    expect(() => u.unify(num, bool), "different type").toThrow();
    expect(() => u.unify(tuple(num, num), tuple()), "different arity").toThrow(
      TypeMismatchError,
    );
    expect(() => u.unify(list(num), list(bool)), "different args").toThrow(
      TypeMismatchError,
    );
  });

  test("TypeVar is unbound initially", () => {
    const u = new Unifier();
    const t0 = u.freshVar();

    expect(u.resolve(t0)).toEqual<Type>({
      tag: "Var",
      id: 0,
    });
  });

  test("unify a concrete type and a var", () => {
    const u = new Unifier();

    const t0 = u.freshVar();
    u.unify(t0, num);

    expect(u.resolve(t0)).toEqual<Type>(num);
  });

  test("unify a var and a concrete type", () => {
    const u = new Unifier();

    const t0 = u.freshVar();
    u.unify(num, t0);

    expect(u.resolve(t0)).toEqual<Type>(num);
  });

  test("unify to another TVar", () => {
    const u = new Unifier();

    const t0 = u.freshVar();
    const t1 = u.freshVar();
    u.unify(t0, t1);
    expect(u.resolve(t0)).toEqual<Type>(u.resolve(t1));
  });

  test("unify to another bound TVar should fail", () => {
    const u = new Unifier();
    const t0 = u.freshVar();
    u.unify(t0, num);

    const t1 = u.freshVar();
    u.unify(t1, bool);

    const t2 = u.freshVar();
    u.unify(t1, t2);

    expect(() => u.unify(t0, t2)).toThrow(TypeMismatchError);
  });

  test("unify 3 lvars", () => {
    const u = new Unifier();
    const t0 = u.freshVar();
    const t1 = u.freshVar();
    const t2 = u.freshVar();

    u.unify(t0, t2);
    u.unify(t2, t1);
    u.unify(t0, num);

    expect(u.resolve(t0)).toEqual<Type>(num);
    expect(u.resolve(t1)).toEqual<Type>(num);
    expect(u.resolve(t2)).toEqual<Type>(num);
  });

  test("TVars should be reactive (left)", () => {
    const u = new Unifier();
    const t0 = u.freshVar();
    const t1 = u.freshVar();

    u.unify(t0, t1);
    u.unify(t1, num);

    expect(u.resolve(t0), "a").toEqual(num);
    expect(u.resolve(t1), "b").toEqual(num);
  });

  test("TVars should be reactive (right)", () => {
    const u = new Unifier();
    const t0 = u.freshVar();
    const t1 = u.freshVar();

    u.unify(t1, t0);
    u.unify(t1, num);

    expect(u.resolve(t0), "a").toEqual(num);
    expect(u.resolve(t1), "b").toEqual(num);
  });

  test("trying to link a linked var (1)", () => {
    const u = new Unifier();
    const t0 = u.freshVar();
    const t1 = u.freshVar();
    const t2 = u.freshVar();

    u.unify(t2, t0); // a~>c
    u.unify(t1, t0); // a~>b
    u.unify(t1, num); // b=int

    expect(u.resolve(t0), "a").toEqual(num);
    expect(u.resolve(t1), "b").toEqual(num);
    expect(u.resolve(t2), "c").toEqual(num);
  });

  test("trying to link a linked var (2)", () => {
    const u = new Unifier();
    const t0 = u.freshVar();
    const t1 = u.freshVar();
    const t2 = u.freshVar();

    u.unify(t0, t2);
    u.unify(t0, t1);
    u.unify(t1, num);

    expect(u.resolve(t0), "a").toEqual(num);
    expect(u.resolve(t1), "b").toEqual(num);
    expect(u.resolve(t2), "c").toEqual(num);
  });

  test("trying to unify two linked vars", () => {
    const u = new Unifier();
    const t0 = u.freshVar();
    const t1 = u.freshVar();
    const t2 = u.freshVar();
    const t3 = u.freshVar();

    u.unify(t1, t0); // a~>b
    u.unify(t3, t2); // c~>d
    u.unify(t0, t2); // c~>a

    u.unify(t1, num);

    expect(u.resolve(t0), "a").toEqual(num);
    expect(u.resolve(t1), "b").toEqual(num);
    expect(u.resolve(t2), "c").toEqual(num);
    expect(u.resolve(t3), "d").toEqual(num);
  });

  test("unify to another TVar", () => {
    const u = new Unifier();
    const t0 = u.freshVar();
    const t1 = u.freshVar();
    u.unify(t0, t1);
    expect(u.resolve(t0)).toEqual<Type>(t0);
    expect(u.resolve(t0)).toEqual(u.resolve(t1));
  });

  test("unify nested TVar", () => {
    const u = new Unifier();
    const t0 = u.freshVar();
    u.unify(list(t0), list(bool));
    expect(u.resolve(t0)).toEqual<Type>(bool);
  });

  test("unify twice to a const", () => {
    const u = new Unifier();
    const t0 = u.freshVar();

    u.unify(t0, num);
    u.unify(t0, num);

    expect(u.resolve(t0)).toEqual<Type>(num);
  });

  test("unify to a const, then to a different one should fail", () => {
    const u = new Unifier();
    const t0 = u.freshVar();

    u.unify(t0, num);
    expect(() => u.unify(t0, bool)).toThrow(TypeMismatchError);
  });

  test("transitive unifications", () => {
    const u = new Unifier();
    const t0 = u.freshVar();
    const t1 = u.freshVar();
    u.unify(t0, t1);
    u.unify(t0, num);

    expect(u.resolve(t0), "a == int").toEqual(num);
    expect(u.resolve(t1), "b == int").toEqual(num);
  });

  test("transitive unifications (3)", () => {
    const u = new Unifier();
    const t0 = u.freshVar();
    const t1 = u.freshVar();
    const t2 = u.freshVar();

    u.unify(t0, t1);
    u.unify(t1, t2);

    expect(u.resolve(t0), "a").toEqual<Type>(t0);
    expect(u.resolve(t1), "b").toEqual<Type>(t0);
    expect(u.resolve(t1), "c").toEqual<Type>(t0);

    u.unify(t0, bool);

    expect(u.resolve(t0), "a == true").toEqual<Type>(bool);
    expect(u.resolve(t1), "b == true").toEqual<Type>(bool);
    expect(u.resolve(t2), "b == true").toEqual<Type>(bool);
  });

  test("recursively linked TVars", () => {
    const u = new Unifier();
    const t0 = u.freshVar();
    const t1 = u.freshVar();

    u.unify(t0, t1);
    u.unify(t1, t0);

    expect(u.resolve(t0)).toEqual(u.resolve(t1));
  });

  test("recursively linked TVars (3 steps)", () => {
    const u = new Unifier();
    const t0 = u.freshVar();
    const t1 = u.freshVar();
    const t2 = u.freshVar();

    u.unify(t0, t1);
    u.unify(t1, t2);
    u.unify(t2, t0);

    expect(u.resolve(t0)).toEqual(u.resolve(t1));
    expect(u.resolve(t0)).toEqual(u.resolve(t2));
  });

  test("occurs check", () => {
    const u = new Unifier();
    const t0 = u.freshVar();

    expect(() => {
      u.unify(t0, list(t0));
    }).toThrow(OccursCheckError);

    expect(() => {
      u.unify(t0, list(list(t0)));
    }).toThrow(OccursCheckError);

    expect(() => {
      u.unify(t0, fn([t0], num));
    }).toThrow(OccursCheckError);

    expect(() => {
      u.unify(fn([t0], num), t0);
    }).toThrow(OccursCheckError);

    expect(() => {
      u.unify(t0, fn([num], t0));
    }).toThrow(OccursCheckError);
  });

  test("occurs check of unified values", () => {
    const u = new Unifier();
    const t0 = u.freshVar();
    const t1 = u.freshVar();

    u.unify(t0, t1);

    expect(() => u.unify(t0, list(t1))).toThrow(OccursCheckError);
  });

  test("occurs check of unified values", () => {
    const u = new Unifier();
    const t0 = u.freshVar();
    const t1 = u.freshVar();

    u.unify(t0, list(t1));

    expect(u.resolve(t0)).toEqual(list(t1));

    u.unify(t1, num);
    expect(u.resolve(t0)).toEqual(list(num));
  });
});

describe("instantiation", () => {
  test("named type without type vars", () => {
    const u = new Unifier();
    expect(u.instantiate(tuple(num, bool))).toEqual(tuple(num, bool));
  });

  test("a type var", () => {
    const u = new Unifier();
    expect(
      u.instantiate({
        tag: "Var",
        id: 0,
      }),
    ).toEqual({
      tag: "Var",
      id: 0,
    });
  });

  test("a type var with an high id", () => {
    const u = new Unifier();
    expect(
      u.instantiate({
        tag: "Var",
        id: 100,
      }),
    ).toEqual({
      tag: "Var",
      id: 0,
    });
  });

  test("fn type", () => {
    const u = new Unifier();
    expect(
      //
      u.instantiate(fn([num], bool)),
    ).toEqual(
      //
      fn([num], bool),
    );

    expect(
      //
      u.instantiate(fn([_1], _0)),
    ).toEqual(
      //
      fn([_0], _1),
    );
  });

  test("many vars", () => {
    const u = new Unifier();
    expect(
      u.instantiate(
        tuple(
          {
            tag: "Var",
            id: 100,
          },
          {
            tag: "Var",
            id: 101,
          },
          {
            tag: "Var",
            id: 100,
          },
        ),
      ),
    ).toEqual(
      tuple(
        {
          tag: "Var",
          id: 0,
        },
        {
          tag: "Var",
          id: 1,
        },
        {
          tag: "Var",
          id: 0,
        },
      ),
    );
  });

  test("resolve first", () => {
    const u = new Unifier();

    const t0 = u.freshVar(),
      t1 = u.freshVar(),
      t3 = u.freshVar();

    u.unify(t0, t1);
    u.unify(t3, t0);

    expect(u.resolve(t1)).toMatchInlineSnapshot(`
      {
        "id": 2,
        "tag": "Var",
      }
    `);
    expect(u.resolve(t0)).toMatchInlineSnapshot(`
      {
        "id": 2,
        "tag": "Var",
      }
    `);

    expect(u.instantiate(tuple(t0, t1))).toEqual<Type>(
      tuple(
        {
          tag: "Var",
          id: 3,
        },
        {
          tag: "Var",
          id: 3,
        },
      ),
    );
  });
});

describe("normalize", () => {
  test("type with vars", () => {
    const out = normalizeResolved(
      tuple(
        { tag: "Var", id: 100 },
        { tag: "Var", id: 101 },
        { tag: "Var", id: 100 },
      ),
    );

    expect(out).toEqual(
      tuple(
        { tag: "Var", id: 0 },
        { tag: "Var", id: 1 },
        { tag: "Var", id: 0 },
      ),
    );
  });
});
