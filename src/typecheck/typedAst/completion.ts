import { TypedDeclaration, TypedExpr, TypedModule } from "../typedAst";
import { contains, firstBy } from "./common";
import { DependenciesProvider } from ".";
import {
  CompletionItem,
  CompletionItemKind,
  Position,
} from "vscode-languageserver";
import { Instantiator, TVar, typeToString, unify } from "../type";

export function getCompletionItems(
  module: TypedModule,
  position: Position,
  deps: DependenciesProvider,
): CompletionItem[] | undefined {
  for (const decl of module.declarations) {
    const d = new ExprCompletion(module, deps).declCompletion(decl, position);
    if (d !== undefined) {
      return d;
    }
  }

  return undefined;
}

class ExprCompletion {
  constructor(
    private module: TypedModule,
    private deps: DependenciesProvider,
  ) {}

  declCompletion(
    declaration: TypedDeclaration,
    position: Position,
  ): CompletionItem[] | undefined {
    if (declaration.extern) {
      return undefined;
    }

    return this.exprCompletion(declaration.value, position);
  }

  private exprCompletion(
    expr: TypedExpr,
    position: Position,
  ): CompletionItem[] | undefined {
    if (!contains(expr, position)) {
      return undefined;
    }

    switch (expr.type) {
      case "syntax-err":
        // TODO this is a faulty expression
        // we probably want to emit suggestions here
        return undefined;

      case "constant":
        return undefined;

      case "identifier":
        return undefined;

      case "fn":
        return this.exprCompletion(expr.body, position);

      case "list-literal":
        return firstBy(expr.values, (arg) =>
          this.exprCompletion(arg, position),
        );

      case "field-access":
        if (expr.field.name === "") {
          return this.fieldCompletion(expr.struct.$);
        }

        return this.exprCompletion(expr.struct, position);

      case "struct-literal":
        return (
          firstBy(
            expr.fields.map((f) => f.value),
            (arg) => this.exprCompletion(arg, position),
          ) ??
          (expr.spread === undefined
            ? undefined
            : this.exprCompletion(expr.spread, position))
        );

      case "application":
        return (
          firstBy(expr.args, (arg) => this.exprCompletion(arg, position)) ??
          this.exprCompletion(expr.caller, position)
        );

      case "if":
        return (
          this.exprCompletion(expr.condition, position) ??
          this.exprCompletion(expr.then, position) ??
          this.exprCompletion(expr.else, position)
        );

      case "let":
        return (
          this.exprCompletion(expr.value, position) ??
          this.exprCompletion(expr.body, position)
        );

      case "match":
        return (
          this.exprCompletion(expr.expr, position) ??
          firstBy(expr.clauses, ([_pattern, expr]) =>
            this.exprCompletion(expr, position),
          )
        );
    }
  }

  private fieldCompletion(structType: TVar) {
    const resolved = structType.resolve();
    switch (resolved.type) {
      case "unbound":
        return this.module.typeDeclarations.flatMap((d) => {
          if (d.type !== "struct") {
            return [];
          }

          return d.fields.map((f) => ({
            label: f.name,
            kind: CompletionItemKind.Field,
            detail: typeToString(f.$.asType(), f.scheme),
          }));
        });

      case "bound": {
        if (resolved.value.type !== "named") {
          return [];
        }

        const typedModule = this.deps.getModuleByNs(resolved.value.moduleName);
        if (typedModule === undefined) {
          return undefined;
        }

        for (const d of typedModule.typeDeclarations) {
          if (d.type !== "struct" || d.name !== resolved.value.name) {
            continue;
          }

          return d.fields.map<CompletionItem>((f) => {
            const intantiator = new Instantiator();
            const instantiatedDeclaration = intantiator.instantiatePoly(d);
            const instantiatedField = intantiator.instantiatePoly(f);
            unify(instantiatedDeclaration, structType.asType());

            return {
              label: f.name,
              kind: CompletionItemKind.Field,
              detail: typeToString(instantiatedField),
            };
          });
        }

        return [];
      }
    }
  }
}
