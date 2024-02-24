import { ConstLiteral } from "../parser";
import { TypedExpr, TypedModule } from "../typecheck";

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
        case "<>":
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

const OPTIMIZATIONS: Optimization[] = [constantFolding];

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

export function optimize(src: TypedModule): TypedModule {
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
