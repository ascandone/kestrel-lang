import { TypedDeclaration, TypedModule } from "../typecheck/typedAst";
import {
  CompletionItem,
  CompletionItemKind,
  Position,
} from "vscode-languageserver";
import {
  DUMMY_STORE,
  Instantiator,
  Type,
  resolveType,
  typeToString,
  unify,
} from "../type";
import { Finder } from "../typecheck/astLookup";

// TODO find a decent name
export type DependenciesProvider = {
  getModuleByNs(ns: string): TypedModule | undefined;
};

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

    return new Finder<CompletionItem[]>(position, {
      onExpression: (expr, next) => {
        switch (expr.type) {
          case "field-access":
            if (expr.field.name === "") {
              return this.fieldCompletion(expr.struct.$type);
            }
        }

        return next();
      },
    }).visitExpr(declaration.value);
  }

  private fieldCompletion(structType: Type) {
    const resolved = resolveType(structType);
    switch (resolved.type) {
      case "unbound":
        return this.module.typeDeclarations.flatMap((d) => {
          if (d.type !== "struct") {
            return [];
          }

          return d.fields.map((f) => ({
            label: f.name,
            kind: CompletionItemKind.Field,
            detail: typeToString(f.$type),
          }));
        });

      case "fn":
      case "rigid-var":
        return [];

      case "named": {
        const typedModule = this.deps.getModuleByNs(resolved.module);
        if (typedModule === undefined) {
          return undefined;
        }

        for (const d of typedModule.typeDeclarations) {
          if (d.type !== "struct" || d.name !== resolved.name) {
            continue;
          }

          return d.fields.map<CompletionItem>((f) => {
            const intantiator = new Instantiator();
            const instantiatedDeclaration = intantiator.instantiate(d.$type);
            const instantiatedField = intantiator.instantiate(f.$type);
            unify(instantiatedDeclaration, structType, DUMMY_STORE);

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
