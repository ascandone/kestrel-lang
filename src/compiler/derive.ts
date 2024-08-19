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
  const usedVars: string[] = [];

  function variantEq(variant: TypedTypeVariant | undefined): t.Expression {
    if (variant === undefined || variant.args.length === 0) {
      return { type: "BooleanLiteral", value: true };
    }

    return variant.args
      .map((variant, i): t.Expression => {
        const callExpr = deriveEqArg(usedVars, variant);
        // return `${callEXpr}(x.a${i}, y.a${i})`;

        return {
          type: "CallExpression",
          callee: { type: "Identifier", name: callExpr },
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
        };
      })
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

  let value: t.Expression = {
    type: "ArrowFunctionExpression",
    async: false,
    expression: true,
    params: [
      { type: "Identifier", name: "x" },
      { type: "Identifier", name: "y" },
    ],
    body,
  };

  const dictsArg = usedVars.map(
    (x): t.Identifier => ({ type: "Identifier", name: `Eq_${x}` }),
  );

  if (dictsArg.length !== 0) {
    value = {
      type: "ArrowFunctionExpression",
      async: false,
      expression: true,
      params: dictsArg,
      body: value,
    };
  }

  return value;
}

function deriveEqArg(usedVars: string[], arg: TypedTypeAst): string {
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

      const subArgs = arg.args.map((subArg) => deriveEqArg(usedVars, subArg));

      const ns = sanitizeNamespace(arg.resolution.namespace);
      let subCall: string;
      if (subArgs.length === 0) {
        subCall = "";
      } else {
        subCall = `(${subArgs.join(", ")})`;
      }
      // We assume this type impls the trait
      return `Eq_${ns}$${arg.name}${subCall}`;
    }

    case "var":
      if (!usedVars.includes(arg.ident)) {
        usedVars.push(arg.ident);
      }
      return `Eq_${arg.ident}`;
  }
}
