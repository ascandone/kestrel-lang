import * as t from "@babel/types";
import {
  CORE_PACKAGE,
  TypedTypeAst,
  TypedTypeDeclaration,
} from "../../../typecheck";
import * as common from "./common";
import * as ir from "../../ir";
import { TVar } from "../../../type";

function shouldDeriveTrait(
  trait: string,
  ident: ir.QualifiedIdentifier,
  params: string[],
  allowDeriving: string[] | undefined,
): boolean {
  if (allowDeriving !== undefined && !allowDeriving.includes(trait)) {
    return false;
  }

  const deps = TVar.typeImplementsTrait(
    {
      type: "named",
      package_: ident.package_,
      module: ident.namespace,
      name: ident.name,
      args: params.map(() => TVar.fresh().asType()),
    },
    trait,
  );

  return deps !== undefined;
}

export function deriveEqAdt(adt: ir.Adt): t.Expression {
  const params: [t.Identifier, t.Identifier] = [
    { type: "Identifier", name: "x" },
    { type: "Identifier", name: "y" },
  ];
  const deriveEqArgs = new DeriveTraitArgs("Eq");

  function variantEq(variant: ir.AdtConstructor | undefined): t.Expression {
    return common.joinAndExprs(
      variant?.args.map(
        (variant, i): t.Expression => ({
          type: "CallExpression",
          callee: deriveEqArgs.run(variant),
          arguments: params.map(
            (param): t.Expression =>
              repr === "unboxed"
                ? param
                : {
                    type: "MemberExpression",
                    object: param,
                    property: { type: "Identifier", name: `_${i}` },
                    computed: false,
                  },
          ),
        }),
      ) ?? [],
    );
  }
  const repr = common.getAdtReprType(adt);
  let body: t.BlockStatement | t.Expression;
  if (adt.constructors.length <= 1) {
    body = variantEq(adt.constructors[0]);
  } else if (repr === "enum") {
    body = {
      type: "BinaryExpression",
      operator: "===",
      left: params[0],
      right: params[1],
    };
  } else {
    const cases = adt.constructors.map(
      (variant, index): t.SwitchCase => ({
        type: "SwitchCase",
        test: { type: "NumericLiteral", value: index },
        consequent: [
          {
            type: "ReturnStatement",
            argument: variantEq(variant),
          },
        ],
      }),
    );

    body = {
      type: "BlockStatement",
      directives: [],
      body: [
        {
          type: "IfStatement",
          test: {
            type: "BinaryExpression",
            operator: "!==",
            left: {
              type: "MemberExpression",
              object: params[0],
              property: common.TAG_FIELD,
              computed: false,
            },
            right: {
              type: "MemberExpression",
              object: params[1],
              property: common.TAG_FIELD,
              computed: false,
            },
          },
          consequent: {
            type: "BlockStatement",
            directives: [],
            body: [
              {
                type: "ReturnStatement",
                argument: { type: "BooleanLiteral", value: false },
              },
            ],
          },
        },
        {
          type: "SwitchStatement",
          discriminant: {
            type: "MemberExpression",
            object: params[0],
            property: common.TAG_FIELD,
            computed: false,
          },
          cases,
        },
      ],
    };
  }

  return deriveEqArgs.wrap({
    type: "ArrowFunctionExpression",
    async: false,
    expression: true,
    params,
    body,
  });
}

class DeriveTraitArgs {
  private usedVars: string[] = [];
  constructor(private trait: string) {}

  wrap(expr: t.Expression): t.Expression {
    if (this.usedVars.length === 0) {
      return expr;
    }

    return {
      type: "ArrowFunctionExpression",
      async: false,
      expression: true,
      params: this.usedVars.map(
        (x): t.Identifier => ({
          type: "Identifier",
          name: `${this.trait}_${x}`,
        }),
      ),
      body: expr,
    };
  }

  run(arg: TypedTypeAst): t.Expression {
    switch (arg.type) {
      case "any":
        throw new Error("[unreachable] any in constructor args");
      case "fn":
        throw new Error("[unreachable] cannot derive fns");

      case "named": {
        if (arg.$resolution === undefined) {
          throw new Error(
            "[unreachable] undefined resolution for type: " + arg.name,
          );
        }

        const ns = common.sanitizeNamespace(arg.$resolution.namespace);

        // We assume this type impls the trait
        const ident: t.Identifier = {
          type: "Identifier",
          name: `${this.trait}_${ns}$${arg.name}`,
        };

        if (arg.args.length === 0) {
          return ident;
        }

        return {
          type: "CallExpression",
          callee: ident,
          arguments: arg.args.map((subArg) => this.run(subArg)),
        };
      }

      case "var":
        if (!this.usedVars.includes(arg.ident)) {
          this.usedVars.push(arg.ident);
        }
        return { type: "Identifier", name: `${this.trait}_${arg.ident}` };
    }
  }
}

function deriveShowAdt(adt: ir.Adt): t.Expression {
  const param: t.Identifier = { type: "Identifier", name: "x" };
  const deriveArg = new DeriveTraitArgs("Show");

  const repr = common.getAdtReprType(adt);

  const showVariant = (ctor: ir.AdtConstructor): t.Expression => {
    if (ctor.args.length === 0) {
      return { type: "StringLiteral", value: ctor.name.name };
    }

    const isTuple =
      ctor.name.package_ == CORE_PACKAGE && /Tuple[0-9]+/.test(ctor.name.name);
    const name = isTuple ? "" : ctor.name.name;

    return {
      type: "TemplateLiteral",
      expressions: ctor.args.map((arg, i) => ({
        type: "CallExpression",
        callee: deriveArg.run(arg),
        arguments: [
          repr === "unboxed"
            ? param
            : {
                type: "MemberExpression",
                object: param,
                property: { type: "Identifier", name: `_${i}` },
                computed: false,
              },
        ],
      })),
      quasis: [
        {
          type: "TemplateElement",
          tail: true,
          value: { raw: name + "(" },
        },
        ...ctor.args.slice(1).map(
          (): t.TemplateElement => ({
            type: "TemplateElement",
            tail: true,
            value: { raw: ", " },
          }),
        ),
        {
          type: "TemplateElement",
          tail: true,
          value: { raw: ")" },
        },
      ],
    };
  };

  let body: t.Expression | t.BlockStatement;
  switch (adt.constructors.length) {
    case 0:
      body = { type: "StringLiteral", value: "never" };
      break;

    case 1: {
      body = showVariant(adt.constructors[0]!);
      break;
    }

    default:
      body = {
        type: "BlockStatement",
        directives: [],
        body: [
          {
            type: "SwitchStatement",
            discriminant: {
              type: "MemberExpression",
              computed: false,
              object: param,
              property: { type: "Identifier", name: "$" },
            },
            cases: adt.constructors.map((v, index) => ({
              type: "SwitchCase",
              test: { type: "NumericLiteral", value: index },
              consequent: [
                { type: "ReturnStatement", argument: showVariant(v) },
              ],
            })),
          },
        ],
      };
      break;
  }

  return deriveArg.wrap({
    type: "ArrowFunctionExpression",
    params: [param],
    async: false,
    expression: true,
    body,
  });
}

function deriveEqStruct(
  typedDeclaration: TypedTypeDeclaration & { type: "struct" },
): t.Expression {
  const params: t.Identifier[] = [
    { type: "Identifier", name: "x" },
    { type: "Identifier", name: "y" },
  ];

  const deriveEqArs = new DeriveTraitArgs("Eq");

  return deriveEqArs.wrap({
    type: "ArrowFunctionExpression",
    async: false,
    expression: true,
    params,
    body: common.joinAndExprs(
      typedDeclaration.fields.map(
        (field): t.Expression => ({
          type: "CallExpression",
          callee: deriveEqArs.run(field.typeAst),
          arguments: params.map(
            (param): t.Expression => ({
              type: "MemberExpression",
              computed: false,
              object: param,
              property: { type: "Identifier", name: field.name },
            }),
          ),
        }),
      ),
    ),
  });
}

function deriveShowStruct(
  typedDeclaration: TypedTypeDeclaration & { type: "struct" },
): t.Expression {
  const param: t.Identifier = { type: "Identifier", name: "x" };
  const deriveArg = new DeriveTraitArgs("Show");

  return deriveArg.wrap({
    type: "ArrowFunctionExpression",
    params: [param],
    async: false,
    expression: true,
    body: {
      type: "TemplateLiteral",
      quasis:
        typedDeclaration.fields.length === 0
          ? [
              {
                type: "TemplateElement",
                tail: false,
                value: { raw: `${typedDeclaration.name} { }` },
              },
            ]
          : [
              ...typedDeclaration.fields.map(
                (field, index): t.TemplateElement => {
                  const structName =
                    index === 0 ? `${typedDeclaration.name} { ` : ", ";

                  return {
                    type: "TemplateElement",
                    tail: false,
                    value: { raw: `${structName}${field.name}: ` },
                  };
                },
              ),
              {
                type: "TemplateElement",
                tail: false,
                value: { raw: ` }` },
              },
            ],
      expressions: typedDeclaration.fields.map(
        (field): t.Expression => ({
          type: "CallExpression",
          callee: deriveArg.run(field.typeAst),
          arguments: [
            {
              type: "MemberExpression",
              computed: false,
              object: param,
              property: { type: "Identifier", name: field.name },
            },
          ],
        }),
      ),
    },
  });
}

export function deriveAdt(adt: ir.Adt, allowDeriving: string[] | undefined) {
  const buf: t.Statement[] = [];

  if (
    // Bool equality is implemented inside core
    adt.name.name !== "Bool" &&
    shouldDeriveTrait("Eq", adt.name, adt.params, allowDeriving)
  ) {
    buf.push({
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: "Identifier",
            name: `Eq_${common.sanitizeNamespace(adt.name.namespace)}$${adt.name.name}`,
          },
          init: deriveEqAdt(adt),
        },
      ],
    });

    if (
      // Bool and List show are implemented inside core
      adt.name.name !== "Bool" &&
      adt.name.name !== "List" &&
      shouldDeriveTrait("Show", adt.name, adt.params, allowDeriving)
    ) {
      buf.push({
        type: "VariableDeclaration",
        kind: "const",
        declarations: [
          {
            type: "VariableDeclarator",
            id: {
              type: "Identifier",
              name: `Show_${common.sanitizeNamespace(adt.name.namespace)}$${adt.name}`,
            },
            init: deriveShowAdt(adt),
          },
        ],
      });
    }
  }

  return buf;
}

export function deriveStruct(
  decl: ir.Struct,
  params: string[],
  allowDeriving: string[] | undefined,
) {
  const buf: t.Statement[] = [];

  if (shouldDeriveTrait("Eq", decl.name, params, allowDeriving)) {
    buf.push({
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: "Identifier",
            name: `Eq_${common.sanitizeNamespace(decl.name.namespace)}$${decl.name.name}`,
          },
          init: deriveEqStruct(decl.declaration),
        },
      ],
    });
  }

  if (shouldDeriveTrait("Show", decl.name, params, allowDeriving)) {
    buf.push({
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: "Identifier",
            name: `Show_${common.sanitizeNamespace(decl.name.namespace)}$${decl.name.name}`,
          },
          init: deriveShowStruct(decl.declaration),
        },
      ],
    });
  }

  return buf;
}
