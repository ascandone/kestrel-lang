import { Binding, ConstLiteral } from "../parser";
import { TypeMeta, TypedExpr, TypedModule, foldTree } from "../typecheck";

type Optimization = (src: TypedExpr) => TypedExpr | undefined;

function foldInfix(
  src: TypedExpr & { type: "application" },
  fold: (l: ConstLiteral, r: ConstLiteral) => ConstLiteral,
): TypedExpr | undefined {
  const [left, right] = src.args;
  if (left?.type !== "constant" || right?.type !== "constant") {
    return undefined;
  }

  return {
    type: "constant",
    value: fold(left.value, right.value),
    span: src.span,
    $: src.$,
  };
}

const constantFolding: Optimization = (src) => {
  switch (src.type) {
    case "application":
      if (src.caller.type !== "identifier") {
        return undefined;
      }

      switch (src.caller.name) {
        case "+":
        case "+.":
        case "++":
          return foldInfix(src, (l, r) => ({
            type: l.type,
            value:
              //@ts-ignore
              l.value + r.value,
          }));

        case "*":
          return foldInfix(src, (l, r) => ({
            type: "int",
            value:
              //@ts-ignore
              l.value * r.value,
          }));

        case "-":
          return foldInfix(src, (l, r) => ({
            type: "int",
            value:
              //@ts-ignore
              l.value - r.value,
          }));

        case "-.":
          return foldInfix(src, (l, r) => ({
            type: "float",
            value:
              //@ts-ignore
              l.value - r.value,
          }));

        default:
          return undefined;
      }
  }
};

const iifFolding: Optimization = (src) => {
  if (src.type !== "application") {
    return undefined;
  }

  if (src.caller.type !== "fn") {
    return undefined;
  }

  const zipped = src.caller.params.map<[Binding<TypeMeta>, TypedExpr]>(
    (param, index) => [param, src.args[index]!] as const,
  );

  return zipped.reduceRight(
    (acc, [binding, arg]): TypedExpr => ({
      type: "let",
      span: src.span,
      $: src.$,
      binding,
      body: acc,
      value: arg,
    }),
    src.caller.body,
  );
};

const inlineLetExpr: Optimization = (src) => {
  if (src.type !== "let") {
    return undefined;
  }

  const isRec = countBindingUsages(src.binding, src.value);
  if (isRec) {
    return undefined;
  }

  const count = countBindingUsages(src.binding, src.body);
  if (count === 0) {
    return src.body;
  } else if (count === 1) {
    return substituteBinding(src.binding, src.value, src.body);
  }

  return undefined;
};

const OPTIMIZATIONS: Optimization[] = [
  constantFolding,
  iifFolding,
  inlineLetExpr,
];

class ChangeTracker {
  public patchedNode = false;

  runOnce(src: TypedExpr): TypedExpr {
    for (const opt of OPTIMIZATIONS) {
      const optimizedNode = opt(src);
      if (optimizedNode !== undefined) {
        this.patchedNode = true;
        return optimizeExpr(optimizedNode);
      }
    }

    switch (src.type) {
      case "constant":
      case "identifier":
        return src;

      case "application": {
        return {
          ...src,
          caller: this.runOnce(src.caller),
          args: src.args.map((arg) => this.runOnce(arg)),
        };
      }

      case "fn":
        return {
          ...src,
          body: this.runOnce(src.body),
        };

      case "if":
        return {
          ...src,
          condition: this.runOnce(src.condition),
          then: this.runOnce(src.then),
          else: this.runOnce(src.else),
        };
      case "let":
        return {
          ...src,
          value: this.runOnce(src.value),
          body: this.runOnce(src.body),
        };
      case "match":
        return {
          ...src,
          expr: this.runOnce(src.expr),
          clauses: src.clauses.map(([pat, e]) => [pat, this.runOnce(e)]),
        };
    }
  }
}

function optimizeExpr(src: TypedExpr): TypedExpr {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const optimizer = new ChangeTracker();
    src = optimizer.runOnce(src);
    if (!optimizer.patchedNode) {
      return src;
    }
  }
}

export function optimizeModule(src: TypedModule): TypedModule {
  return {
    ...src,
    declarations: src.declarations.map((decl) => {
      if (decl.extern) {
        return decl;
      }
      return {
        ...decl,
        value: optimizeExpr(decl.value),
      };
    }),
  };
}

function countBindingUsages(
  binding: Binding<TypeMeta>,
  src: TypedExpr,
): number {
  return foldTree(src, 0, (src, acc) => {
    switch (src.type) {
      case "identifier":
        if (
          src.resolution !== undefined &&
          src.resolution.type === "local-variable" &&
          src.resolution.binding === binding
        ) {
          return acc + 1;
        }

      default:
        return acc;
    }
  });
}

function substituteBinding(
  binding: Binding<TypeMeta>,
  with_: TypedExpr,
  src: TypedExpr,
): TypedExpr {
  switch (src.type) {
    case "identifier":
      if (src.resolution === undefined) {
        return src;
      } else if (src.resolution.type !== "local-variable") {
        return src;
      } else if (src.resolution.binding !== binding) {
        return src;
      } else {
        return with_;
      }
    case "constant":
      return src;

    case "application": {
      return {
        ...src,
        caller: substituteBinding(binding, with_, src.caller),
        args: src.args.map((arg) => substituteBinding(binding, with_, arg)),
      };
    }

    case "fn":
      return {
        ...src,
        body: substituteBinding(binding, with_, src.body),
      };

    case "if":
      return {
        ...src,
        condition: substituteBinding(binding, with_, src.condition),
        then: substituteBinding(binding, with_, src.then),
        else: substituteBinding(binding, with_, src.else),
      };
    case "let":
      return {
        ...src,
        value: substituteBinding(binding, with_, src.value),
        body: substituteBinding(binding, with_, src.body),
      };
    case "match":
      return {
        ...src,
        expr: substituteBinding(binding, with_, src.expr),
        clauses: src.clauses.map(([pat, e]) => [
          pat,
          substituteBinding(binding, with_, e),
        ]),
      };
  }
}
