import { Import, UntypedModule } from "../parser";
import {
  FieldResolution,
  IdentifierResolution,
  ModuleInterface,
  TypeResolution,
  TypedBinding,
  TypedDeclaration,
  TypedExposedValue,
  TypedExpr,
  TypedImport,
  TypedMatchPattern,
  TypedModule,
  TypedTypeAst,
  TypedTypeDeclaration,
} from "./typedAst";
import { defaultImports } from "./defaultImports";
import { TVar } from "./type";
import { ErrorInfo } from "../errors";
import * as err from "../errors";
import { Annotator } from "./Annotator";
import * as visitor from "./visitor";

// Record from namespace (e.g. "A.B.C" ) to the module
export type Deps = Record<string, ModuleInterface>;

export function castAst(
  ns: string,
  module: UntypedModule,
  deps: Deps = {},
  implicitImports: Import[] = defaultImports,
): [TypedModule, ErrorInfo[]] {
  return new ResolutionStep(ns, deps).run(module, implicitImports);
}

class LocalFrames {
  // TODO remove stack, use single map instead

  /** The previous values */
  private readonly stack: Array<Map<string, IdentifierResolution | undefined>> =
    [];

  constructor(
    private readonly valuesResolution: Map<string, IdentifierResolution>,
  ) {}

  public enter() {
    const previous = new Map<string, IdentifierResolution>();
    this.stack.push(previous);

    return () => {
      for (const [key, previousValue] of previous.entries()) {
        if (previousValue === undefined) {
          this.valuesResolution.delete(key);
        } else {
          this.valuesResolution.set(key, previousValue);
        }
      }
    };
  }

  public register(binding: TypedBinding) {
    const currentScope = this.stack.at(-1);
    if (currentScope === undefined) {
      throw new Error("[unreachable] empty stack");
    }

    const previousValue = this.valuesResolution.get(binding.name);
    currentScope.set(binding.name, previousValue);

    this.valuesResolution.set(binding.name, {
      type: "local-variable",
      binding,
    });
  }
}

// TODO remove this err
class UnimplementedErr extends Error {}

class ResolutionStep {
  private errors: ErrorInfo[] = [];

  // scope
  private importedModules = new Set<string>();

  private importedTypes = new Map<string, TypeResolution>();
  private moduleTypes = new Map<string, TypeResolution>();

  private importedValues = new Map<
    string,
    IdentifierResolution & { type: "constructor" | "global-variable" }
  >();
  private moduleValues = new Map<
    string,
    IdentifierResolution & { type: "constructor" | "global-variable" }
  >();
  private importedFields = new Map<string, FieldResolution>();
  private moduleFields = new Map<string, FieldResolution>();
  private localValues = new Map<
    string,
    IdentifierResolution & { type: "local-variable" }
  >();
  private localFrames = new LocalFrames(this.localValues);

  // unused checks
  private unusedLocals = new Set<TypedBinding>();
  private unusedGlobals = new Set<TypedDeclaration>();
  // private unusedImports = new Set<TypedImport>();
  // private unusedExposing = new Set<TypedExposedValue>();

  constructor(
    private readonly ns: string,
    private readonly deps: Deps,
  ) {}

  private loadTypeImport(
    moduleInterface: ModuleInterface,
    exposing: TypedExposedValue & { type: "type" },
  ) {
    const typeDeclaration = moduleInterface.publicTypes[exposing.name];
    if (typeDeclaration === undefined) {
      throw new UnimplementedErr("imported type not found: " + exposing.name);
    }

    exposing.$resolution = typeDeclaration;

    if (this.importedTypes.has(typeDeclaration.name)) {
      throw new UnimplementedErr("duplicate name import");
    }
    this.importedTypes.set(typeDeclaration.name, {
      declaration: typeDeclaration,
      namespace: moduleInterface.ns,
    });

    // -- Open import
    if (!exposing.exposeImpl) {
      return;
    }

    if (typeDeclaration.pub !== "..") {
      this.errors.push({
        description: new err.BadImport(),
        range: exposing.range,
      });
    }

    // TODO add to unused exports

    switch (typeDeclaration.type) {
      case "adt":
        for (const variant of typeDeclaration.variants) {
          this.importedValues.set(variant.name, {
            type: "constructor",
            declaration: typeDeclaration,
            variant: variant,
            namespace: moduleInterface.ns,
          });
        }
        break;

      case "struct":
        for (const field of typeDeclaration.fields) {
          this.importedFields.set(field.name, {
            declaration: typeDeclaration,
            field,
            namespace: moduleInterface.ns,
          });
        }
        break;
    }
  }

  private loadValueImport(
    moduleInterface: ModuleInterface,
    exposing: TypedExposedValue & { type: "value" },
  ) {
    const declaration = moduleInterface.publicValues[exposing.name];
    if (declaration === undefined) {
      throw new UnimplementedErr("bad exposing (private value)");
    }

    if (this.importedValues.has(declaration.binding.name)) {
      throw new UnimplementedErr("duplicate name value import");
    }
    this.importedValues.set(exposing.name, {
      type: "global-variable",
      declaration,
      namespace: moduleInterface.ns,
    });

    // TODO add to unused exports
  }

  /** add imports to scope and mark them as unused */
  private loadImports(imports: TypedImport[], _markUnused: boolean) {
    for (const import_ of imports) {
      this.importedModules.add(import_.ns);

      const dep = this.deps[import_.ns];
      if (dep === undefined) {
        throw new UnimplementedErr("module not found");
      }

      // TODO add to unused imports

      for (const exposing of import_.exposing) {
        switch (exposing.type) {
          case "type":
            this.loadTypeImport(dep, exposing);
            break;

          case "value":
            this.loadValueImport(dep, exposing);
            break;
        }
      }
    }
  }

  private resolveTypeAst(arg: TypedTypeAst) {
    visitor.visitTypeAst(arg, {
      onNamedType: (ast) => {
        if (ast.namespace !== undefined) {
          throw new UnimplementedErr("unqualified type");
        }

        ast.$resolution =
          this.importedTypes.get(ast.name) ?? this.moduleTypes.get(ast.name);

        if (ast.$resolution === undefined) {
          this.errors.push({
            description: new err.UnboundType(ast.name),
            range: ast.range,
          });
        }
      },
    });
  }

  private onResolvePatternConstructor(
    ctor: TypedMatchPattern & { type: "constructor" },
  ) {
    if (ctor.namespace === undefined) {
      ctor.$resolution =
        this.moduleValues.get(ctor.name) ?? this.importedValues.get(ctor.name);
    } else if (ctor.namespace === this.ns) {
      ctor.$resolution = this.moduleValues.get(ctor.name);
    } else {
      if (!this.importedModules.has(ctor.namespace)) {
        throw new UnimplementedErr("unimpoorted qualifier");
      }

      const dep = this.deps[ctor.namespace];
      if (dep === undefined) {
        // we probably already emitted this
        throw new UnimplementedErr("qualify to not existing module");
      }

      ctor.$resolution = dep.publicConstructors[ctor.name];
    }

    if (ctor.$resolution === undefined) {
      this.errors.push({
        description: new err.UnboundVariable(ctor.name),
        range: ctor.range,
      });
    }
  }

  private onResolveIdentifier(expr: TypedExpr & { type: "identifier" }) {
    if (expr.namespace === undefined) {
      expr.$resolution =
        this.localValues.get(expr.name) ??
        this.moduleValues.get(expr.name) ??
        this.importedValues.get(expr.name);
    } else if (expr.namespace === this.ns) {
      expr.$resolution = this.moduleValues.get(expr.name);
    } else {
      const dep = this.deps[expr.namespace];
      if (dep === undefined) {
        throw new UnimplementedErr("qualified mod not found");
      }

      const valueLookup = dep.publicValues[expr.name];
      if (valueLookup !== undefined) {
        expr.$resolution = {
          type: "global-variable",
          declaration: valueLookup,
          namespace: expr.namespace,
        };
      } else {
        expr.$resolution = dep.publicConstructors[expr.name];
      }
    }

    if (expr.$resolution === undefined) {
      this.errors.push({
        description: new err.UnboundVariable(expr.name),
        range: expr.range,
      });
    } else {
      switch (expr.$resolution.type) {
        case "constructor":
          // TODO unused constructors
          break;

        case "local-variable":
          this.unusedLocals.delete(expr.$resolution.binding);
          break;

        case "global-variable":
          this.unusedGlobals.delete(expr.$resolution.declaration);
          break;
      }
    }
  }

  private resolveExpression(expr: TypedExpr) {
    visitor.visitExpr(expr, {
      onPatternIdentifier: (ident) => {
        this.localFrames.register(ident);
        if (!validUnusedBinding(ident)) {
          this.unusedLocals.add(ident);
        }
      },

      onPatternConstructor: this.onResolvePatternConstructor.bind(this),
      onIdentifier: this.onResolveIdentifier.bind(this),

      onFieldAccess: (expr) => {
        expr.$resolution =
          this.moduleFields.get(expr.field.name) ??
          this.importedFields.get(expr.field.name);
      },

      onStructLiteral: (expr) => {
        // TODO handle namespaced struct
        const resolution =
          this.moduleTypes.get(expr.struct.name) ??
          this.importedTypes.get(expr.struct.name);

        if (resolution === undefined) {
          throw new UnimplementedErr("undefined struct resolution");
        }

        if (resolution.declaration.type !== "struct") {
          throw new UnimplementedErr("bad resolution for struct");
        }

        expr.struct.$resolution = {
          declaration: resolution.declaration,
          namespace: this.ns,
        };

        for (const field of expr.fields) {
          const fieldDefinition = resolution.declaration.fields.find(
            (fieldDefinition) => fieldDefinition.name === field.field.name,
          );

          if (fieldDefinition === undefined) {
            this.errors.push({
              description: new err.InvalidField(
                resolution.declaration.name,
                field.field.name,
              ),
              range: field.range,
            });
          } else {
            field.field.$resolution = {
              declaration: resolution.declaration,
              field: fieldDefinition,
              namespace: this.ns,
            };
          }
        }
      },

      onMatchClause: () => {
        const onExit = this.localFrames.enter();
        return () => {
          onExit();
        };
      },

      onFn: () => {
        const onExit = this.localFrames.enter();
        return () => {
          onExit();
        };
      },

      onLet: () => {
        const onExit = this.localFrames.enter();
        return () => {
          onExit();
        };
      },
    });
  }

  private detectDuplicateParams(typeDeclarations: TypedTypeDeclaration) {
    const params = new Set<string>();
    for (const param of typeDeclarations.params) {
      if (params.has(param.name)) {
        this.errors.push({
          description: new err.TypeParamShadowing(param.name),
          range: param.range,
        });
      } else {
        params.add(param.name);
      }
    }
  }

  /** add global type declarations (and constructors and fields) to scope and mark them as unused */
  private loadTypeDeclarations(typeDeclarations: TypedTypeDeclaration[]) {
    for (const declaration of typeDeclarations) {
      if (this.importedTypes.has(declaration.name)) {
        throw new UnimplementedErr("duplicate type (import)");
        this.errors.push({
          description: new err.DuplicateTypeDeclaration(declaration.name),
          range: declaration.range,
        });
        continue;
      }

      if (this.moduleTypes.has(declaration.name)) {
        this.errors.push({
          description: new err.DuplicateTypeDeclaration(declaration.name),
          range: declaration.range,
        });
        continue;
      }

      this.moduleTypes.set(declaration.name, {
        declaration,
        namespace: this.ns,
      });

      this.detectDuplicateParams(declaration);

      // TODO add to unused types
      switch (declaration.type) {
        case "adt":
          for (const variant of declaration.variants) {
            if (this.moduleValues.has(variant.name)) {
              this.errors.push({
                description: new err.DuplicateConstructor(variant.name),
                range: variant.range,
              });
            } else if (this.importedValues.has(variant.name)) {
              this.errors.push({
                description: new err.ShadowingImport(variant.name),
                range: variant.range,
              });
            } else {
              this.moduleValues.set(variant.name, {
                type: "constructor",
                declaration: declaration,
                variant: variant,
                namespace: this.ns,
              });
            }

            for (const arg of variant.args) {
              this.resolveTypeAst(arg);
            }
          }
          break;

        case "struct":
          for (const field of declaration.fields) {
            this.resolveTypeAst(field.typeAst);
            this.moduleFields.set(field.name, {
              declaration,
              field,
              namespace: this.ns,
            });
          }
          break;
      }
    }
  }

  /**
   * add global declarations to scope and mark them as unused
   * runs type ast resolution (but no expressions resolution yet)
   */
  private loadValueDeclarations(declarations: TypedDeclaration[]) {
    for (const declaration of declarations) {
      if (this.moduleValues.has(declaration.binding.name)) {
        this.errors.push({
          description: new err.DuplicateDeclaration(declaration.binding.name),
          range: declaration.binding.range,
        });
        continue;
      }

      this.moduleValues.set(declaration.binding.name, {
        type: "global-variable",
        declaration,
        namespace: this.ns,
      });

      if (declaration.typeHint !== undefined) {
        this.resolveTypeAst(declaration.typeHint.mono);
      }

      if (!declaration.pub) {
        this.unusedGlobals.add(declaration);
      }
    }
  }

  private emitUnusedLocalsErrors() {
    for (const declaration of this.unusedLocals) {
      this.errors.push({
        range: declaration.range,
        description: new err.UnusedVariable(declaration.name, "local"),
      });
    }

    this.unusedLocals = new Set();
  }

  private emitUnusedGlobalsErrors() {
    for (const declaration of this.unusedGlobals) {
      this.errors.push({
        range: declaration.binding.range,
        description: new err.UnusedVariable(declaration.binding.name, "global"),
      });
    }
    this.unusedGlobals = new Set();
  }

  run(
    module: UntypedModule,
    implicitImports: Import[] = defaultImports,
  ): [TypedModule, ErrorInfo[]] {
    TVar.resetId();

    const annotator = new Annotator(this.errors);
    const annotatedModule = annotator.annotateModule(module);

    /**
     * We global values into scope
     * Make sure the order of "load*" calls isn't changed
     * */
    this.loadImports(
      implicitImports.map((import_) => annotator.annotateImport(import_)),
      false,
    );
    this.loadImports(annotatedModule.imports, true);
    this.loadTypeDeclarations(annotatedModule.typeDeclarations);
    this.loadValueDeclarations(annotatedModule.declarations);

    // Now that global vars are into scope, we visit each (non-extern) declaration
    for (const decl of annotatedModule.declarations) {
      if (!decl.extern) {
        this.resolveExpression(decl.value);
      }

      this.emitUnusedLocalsErrors();
    }

    this.emitUnusedGlobalsErrors();

    const typedModule: TypedModule = {
      ...annotatedModule,

      moduleInterface: makeInterface(
        this.ns,
        annotatedModule.typeDeclarations,
        annotatedModule.declarations,
      ),
    };

    return [typedModule, this.errors];
  }
}

export function findFieldInModule(
  typeDeclarations: Map<string, TypedTypeDeclaration>,
  fieldName: string,
  namespace: string,
): FieldResolution | undefined {
  for (const typeDecl of typeDeclarations.values()) {
    const lookup = findFieldInTypeDecl(typeDecl, fieldName, namespace);
    if (lookup !== undefined) {
      return lookup;
    }
  }

  return undefined;
}

export function findFieldInTypeDecl(
  declaration: TypedTypeDeclaration,
  fieldName: string,
  namespace: string,
): FieldResolution | undefined {
  if (declaration.type !== "struct") {
    return undefined;
  }

  for (const field of declaration.fields) {
    if (field.name !== fieldName) {
      continue;
    }

    return { declaration, field, namespace };
  }

  return undefined;
}

// TODO make this lazy
function makeInterface(
  ns: string,
  typeDeclarations: TypedModule["typeDeclarations"],
  declarations: TypedModule["declarations"],
): ModuleInterface {
  const publicFields: ModuleInterface["publicFields"] = {};
  const publicConstructors: ModuleInterface["publicConstructors"] = {};
  const publicTypes: ModuleInterface["publicTypes"] = {};
  for (const typeDeclaration of typeDeclarations) {
    if (typeDeclaration.pub === false) {
      continue;
    }

    publicTypes[typeDeclaration.name] = typeDeclaration;
    if (typeDeclaration.pub === ".." && typeDeclaration.type === "adt") {
      for (const ctor of typeDeclaration.variants) {
        publicConstructors[ctor.name] = {
          type: "constructor",
          variant: ctor,
          declaration: typeDeclaration,
          namespace: ns,
        };
      }
    }

    if (typeDeclaration.pub === ".." && typeDeclaration.type === "struct") {
      for (const field of typeDeclaration.fields) {
        publicFields[field.name] = {
          declaration: typeDeclaration,
          field: field,
          namespace: ns,
        };
      }
    }
  }

  const publicValues: ModuleInterface["publicValues"] = {};
  for (const d of declarations) {
    if (!d.pub) {
      continue;
    }
    publicValues[d.binding.name] = d;
  }

  return {
    ns,
    publicConstructors,
    publicTypes,
    publicValues,
    publicFields,
  };
}

function validUnusedBinding(b: TypedBinding) {
  return b.name.startsWith("_");
}
