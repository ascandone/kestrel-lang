import { Position, RangeMeta } from "../parser";
import { RigidVarsCtx, typeToString } from "../type";
import { TypedExpr, TypedModule } from "../typecheck/typedAst";
import * as visitor from "../typecheck/visitor";

export type InlayHint = {
  label: string;
  positition: Position;
  paddingLeft: boolean;
};

class InlayHintBuf implements visitor.VisitOptions {
  public inlayHints: InlayHint[] = [];
  constructor(private readonly ctx: RigidVarsCtx) {}

  onPipe(ast: RangeMeta & TypedExpr & { type: "pipe" }): void {
    if (ast.right.type !== "application") {
      return;
    }

    const isArgOnNewline = ast.left.range.end.line !== ast.right.range.end.line;
    if (!isArgOnNewline) {
      return;
    }

    const showLeftArg = ast.left.type !== "pipe";
    if (showLeftArg) {
      this.inlayHints.push({
        label: typeToString(ast.left.$type.asType(), this.ctx),
        positition: ast.left.range.end,
        paddingLeft: true,
      });
    }

    this.inlayHints.push({
      label: typeToString(ast.$type.asType(), this.ctx),
      positition: ast.range.end,
      paddingLeft: true,
    });
  }
}

export function getInlayHints(module: TypedModule): InlayHint[] {
  return module.declarations.flatMap<InlayHint>((d) => {
    if (d.extern) {
      return [];
    }
    const buf = new InlayHintBuf({});
    visitor.visitExpr(d.value, buf);
    return buf.inlayHints;
  });
}
