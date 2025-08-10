import { Position, RangeMeta } from "../parser";
import { TypeScheme, typeToString } from "../type";
import { TypedExpr, TypedModule } from "../typecheck/typedAst";
import * as visitor from "../typecheck/visitor";

export type InlayHint = {
  label: string;
  positition: Position;
  paddingLeft: boolean;
};

class InlayHintBuf implements visitor.VisitOptions {
  public inlayHints: InlayHint[] = [];
  constructor(private readonly scheme: TypeScheme) {}

  onApplication(ast: RangeMeta & TypedExpr & { type: "application" }): void {
    const resolved = ast.caller.$type.resolve();
    if (ast.isPipe) {
      if (resolved.type !== "bound" || resolved.value.type !== "fn") {
        // invalid pipe
        return;
      }

      const [arg] = ast.args;
      if (arg === undefined) {
        return;
      }

      const argWasPipe = arg.type === "application" && arg.isPipe;

      const isArgOnNewline = ast.range.end.line !== arg.range.end.line;

      if (isArgOnNewline) {
        if (!argWasPipe) {
          this.inlayHints.push({
            label: typeToString(arg.$type.asType(), this.scheme),
            positition: arg.range.end,
            paddingLeft: true,
          });
        }

        this.inlayHints.push({
          label: typeToString(resolved.value.return, this.scheme),
          positition: ast.range.end,
          paddingLeft: true,
        });
      }
    }
  }
}

export function getInlayHints(module: TypedModule): InlayHint[] {
  return module.declarations.flatMap<InlayHint>((d) => {
    if (d.extern) {
      return [];
    }
    const buf = new InlayHintBuf(d.$scheme);
    visitor.visitExpr(d.value, buf);
    return buf.inlayHints;
  });
}
