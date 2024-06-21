import { TypeScheme, typeToString } from "../type";
import { TypedExpr, TypedModule } from "../typedAst";
import { ExpressionVisitor, visitExpression } from "./visitor";

export type InlayHint = {
  label: string;
  offset: number;
  paddingLeft: boolean;
};

class InlayHintsVisitor implements ExpressionVisitor {
  public inlayHints: InlayHint[] = [];
  constructor(
    private readonly scheme: TypeScheme,
    private readonly document: PositionedDocument,
  ) {}

  visitApplication(ast: TypedExpr & { type: "application" }): void {
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

      const argWasPipe = arg.type === "application" && arg.isPipe;

      const isArgOnNewline =
        this.document.positionAt(ast.span[1]).line !==
        this.document.positionAt(arg.span[1]).line;

      if (isArgOnNewline) {
        if (!argWasPipe) {
          this.inlayHints.push({
            label: typeToString(arg.$.asType(), this.scheme),
            offset: arg.span[1],
            paddingLeft: true,
          });
        }

        this.inlayHints.push({
          label: typeToString(resolved.value.return, this.scheme),
          offset: ast.span[1],
          paddingLeft: true,
        });
      }
    }
  }
}

export type PositionedDocument = {
  positionAt: (offset: number) => {
    line: number;
  };
};

export function getInlayHints(
  module: TypedModule,
  positionedDocument: PositionedDocument,
): InlayHint[] {
  return module.declarations.flatMap<InlayHint>((d) => {
    if (d.extern) {
      return [];
    }

    const visitor = new InlayHintsVisitor(d.scheme, positionedDocument);
    visitExpression(d.value, visitor);
    return visitor.inlayHints;
  });
}
