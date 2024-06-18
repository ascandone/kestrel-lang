import { TypeScheme, typeToString } from "../type";
import { TypedExpr, TypedModule } from "../typedAst";

export type InlayHint = {
  label: string;
  offset: number;
  paddingLeft: boolean;
};

class InlayHintBuf {
  public inlayHints: InlayHint[] = [];
  constructor(private readonly scheme: TypeScheme) {}

  inlayHintsOfExpr(ast: TypedExpr): void {
    switch (ast.type) {
      case "syntax-err":
      case "constant":
      case "identifier":
        return;

      case "application": {
        const resolved = ast.caller.$.resolve();
        if (ast.isPipe) {
          if (resolved.type !== "bound" || resolved.value.type !== "fn") {
            // invalid pipe
            return;
          }

          const [arg] = ast.args;
          if (arg === undefined) {
            return;
          }

          this.inlayHints.push({
            label: typeToString(arg.$.asType(), this.scheme),
            offset: arg.span[1],
            paddingLeft: true,
          });

          this.inlayHints.push({
            label: typeToString(resolved.value.return, this.scheme),
            offset: ast.span[1],
            paddingLeft: true,
          });
        }

        for (const arg of ast.args) {
          this.inlayHintsOfExpr(arg);
        }
        return;
      }

      case "fn":
        this.inlayHintsOfExpr(ast.body);
        return;

      case "list-literal":
        for (const value of ast.values) {
          this.inlayHintsOfExpr(value);
        }
        return;

      case "let":
        this.inlayHintsOfExpr(ast.body);
        this.inlayHintsOfExpr(ast.value);
        return;

      case "if":
        this.inlayHintsOfExpr(ast.then);
        this.inlayHintsOfExpr(ast.condition);
        this.inlayHintsOfExpr(ast.else);
        return;

      case "match":
        this.inlayHintsOfExpr(ast.expr);
        for (const [_p, expr] of ast.clauses) {
          this.inlayHintsOfExpr(expr);
        }
        return;
    }
  }
}

export function getInlayHints(module: TypedModule): InlayHint[] {
  return module.declarations.flatMap<InlayHint>((d) => {
    if (d.extern) {
      return [];
    }
    const buf = new InlayHintBuf(d.scheme);

    buf.inlayHintsOfExpr(d.value);
    return buf.inlayHints;
  });
}
