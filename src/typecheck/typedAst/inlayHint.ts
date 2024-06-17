import { TypedExpr, TypedModule } from "../typedAst";

export type InlayHint = { label: string; offset: number };

export function getInlayHints(module: TypedModule): InlayHint[] {
  return module.declarations.flatMap<InlayHint>((d) => {
    if (d.extern) {
      return [];
    }
    return [...inlayHintsOfExpr(d.value)];
  });
}

// eslint-disable-next-line require-yield
function* inlayHintsOfExpr(ast: TypedExpr): Generator<InlayHint> {
  switch (ast.type) {
    case "syntax-err":
    case "constant":
    case "identifier":
      return;

    case "list-literal":
    case "fn":
    case "application":
    case "let":
    case "if":
    case "match":
      return;
  }
}
