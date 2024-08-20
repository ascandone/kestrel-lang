import {
  TypedTypeAst,
  TypedTypeDeclaration,
  TypedTypeVariant,
} from "../typecheck";
import * as t from "@babel/types";
import { sanitizeNamespace } from "./utils";

export function deriveEqAdt(
  typedDeclaration: TypedTypeDeclaration & { type: "adt" },
): t.Expression {
  const deriveEqArgs = new DeriveTraitArgs("Eq");

  function variantEq(variant: TypedTypeVariant | undefined): t.Expression {
    if (variant === undefined || variant.args.length === 0) {
      return { type: "BooleanLiteral", value: true };
    }

    return variant.args
      .map(
        (variant, i): t.Expression => ({
          type: "CallExpression",
          callee: deriveEqArgs.run(variant),
          arguments: [
            {
              type: "MemberExpression",
              object: { type: "Identifier", name: "x" },
              property: { type: "Identifier", name: `_${i}` },
              computed: false,
            },
            {
              type: "MemberExpression",
              object: { type: "Identifier", name: "y" },
              property: { type: "Identifier", name: `_${i}` },
              computed: false,
            },
          ],
        }),
      )
      .reduce(
        (left, right): t.Expression => ({
          type: "LogicalExpression",
          operator: "&&",
          left,
          right,
        }),
      );
  }

  let body: t.BlockStatement | t.Expression;
  if (typedDeclaration.variants.length <= 1) {
    body = variantEq(typedDeclaration.variants[0]);
  } else {
    const cases = typedDeclaration.variants.map(
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
              object: { type: "Identifier", name: "x" },
              property: { type: "Identifier", name: `$` },
              computed: false,
            },
            right: {
              type: "MemberExpression",
              object: { type: "Identifier", name: "y" },
              property: { type: "Identifier", name: `$` },
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
            object: { type: "Identifier", name: "x" },
            property: { type: "Identifier", name: `$` },
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
    params: [
      { type: "Identifier", name: "x" },
      { type: "Identifier", name: "y" },
    ],
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
        if (arg.resolution === undefined) {
          throw new Error(
            "[unreachable] undefined resolution for type: " + arg.name,
          );
        }

        const ns = sanitizeNamespace(arg.resolution.namespace);

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

export function deriveShowAdt(
  typedDeclaration: TypedTypeDeclaration & { type: "adt" },
): t.Expression {
  const deriveArg = new DeriveTraitArgs("Show");

  const showVariant = (variant: TypedTypeVariant): t.Expression => {
    if (variant.args.length === 0) {
      return { type: "StringLiteral", value: variant.name };
    }

    const name = /Tuple[0-9]+/.test(variant.name) ? "" : variant.name;

    return {
      type: "TemplateLiteral",
      expressions: variant.args.map((arg, i) => ({
        type: "CallExpression",
        callee: deriveArg.run(arg),
        arguments: [
          {
            type: "MemberExpression",
            object: { type: "Identifier", name: "x" },
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
        ...variant.args.slice(1).map(
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
  switch (typedDeclaration.variants.length) {
    case 0:
      body = { type: "StringLiteral", value: "never" };
      break;

    case 1: {
      body = showVariant(typedDeclaration.variants[0]!);
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
              object: { type: "Identifier", name: "x" },
              property: { type: "Identifier", name: "$" },
            },
            cases: typedDeclaration.variants.map((v, index) => ({
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
    params: [{ type: "Identifier", name: "x" }],
    async: false,
    expression: true,
    body,
  });
}

export function deriveEqStruct(
  typedDeclaration: TypedTypeDeclaration & { type: "struct" },
): t.Expression {
  const params: t.Identifier[] = [
    { type: "Identifier", name: "x" },
    { type: "Identifier", name: "y" },
  ];

  const deriveEqArs = new DeriveTraitArgs("Eq");

  const body: t.Expression =
    typedDeclaration.fields.length === 0
      ? { type: "BooleanLiteral", value: true }
      : typedDeclaration.fields
          .map(
            (field): t.Expression => ({
              type: "CallExpression",
              callee: deriveEqArs.run(field.type_),
              arguments: params.map(
                (param): t.Expression => ({
                  type: "MemberExpression",
                  computed: false,
                  object: param,
                  property: { type: "Identifier", name: field.name },
                }),
              ),
            }),
          )
          .reduce(
            (left, right): t.Expression => ({
              type: "LogicalExpression",
              operator: "&&",
              left,
              right,
            }),
          );

  return deriveEqArs.wrap({
    type: "ArrowFunctionExpression",
    async: false,
    expression: true,
    params,
    body,
  });
}

export function deriveShowStruct(
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
          callee: deriveArg.run(field.type_),
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
