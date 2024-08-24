import {
  MatchPattern,
  Range,
  RangeMeta,
  TypeAst,
  UntypedDeclaration,
  UntypedExpr,
  UntypedImport,
  UntypedModule,
  UntypedTypeDeclaration,
} from "../parser";
import {
  FieldResolution,
  IdentifierResolution,
  StructResolution,
  TypeResolution,
  TypedBinding,
  TypedDeclaration,
  TypedExposing,
  TypedExpr,
  TypedImport,
  TypedMatchPattern,
  TypedModule,
  TypedStructField,
  TypedTypeAst,
  TypedTypeDeclaration,
  TypedTypeVariant,
} from "./typedAst";
import { defaultImports } from "./defaultImports";
import { TVar } from "./type";
import {
  BadImport,
  DuplicateDeclaration,
  ErrorInfo,
  InvalidField,
  InvalidPipe,
  NonExistingImport,
  TypeParamShadowing,
  UnboundModule,
  UnboundType,
  UnboundVariable,
  UnimportedModule,
  UnusedExposing,
  UnusedImport,
  UnusedVariable,
} from "../errors";
import { FramesStack } from "./frame";

export type Deps = Record<string, TypedModule>;

export type TypeMeta = { $: TVar };

export function castAst(
  ns: string,
  module: UntypedModule,
  deps: Deps = {},
  implicitImports: UntypedImport[] = defaultImports,
): [TypedModule, ErrorInfo[]] {
  return new ResolutionStep(ns, deps).run(module, implicitImports);
}

type Constructors = Record<
  string,
  IdentifierResolution & { type: "constructor" }
>;

class ResolutionStep {
  private constructors: Constructors = {};

  private errors: ErrorInfo[] = [];
  private imports: TypedImport[] = [];
  private typeDeclarations: TypedTypeDeclaration[] = [];
  private unusedVariables = new WeakSet<TypedBinding>();
  private unusedImports = new WeakSet<TypedImport>();
  private unusedExposing = new WeakSet<TypedExposing>();
  private framesStack = new FramesStack<TypedBinding, TypedDeclaration>();

  private patternBindings: TypedBinding[] = [];

  constructor(
    private ns: string,
    private deps: Deps,
  ) {}

  run(
    module: UntypedModule,
    implicitImports: UntypedImport[] = defaultImports,
  ): [TypedModule, ErrorInfo[]] {
    TVar.resetId();

    const annotatedImplicitImports = this.annotateImports(implicitImports);
    const annotatedImports = this.annotateImports(module.imports);

    for (const import_ of annotatedImports) {
      if (import_.exposing.length === 0) {
        this.unusedImports.add(import_);
      }

      for (const exposing of import_.exposing) {
        if (exposing.type === "value" && exposing.declaration !== undefined) {
          this.unusedExposing.add(exposing);
        } else if (
          exposing.type === "type" &&
          !exposing.exposeImpl &&
          exposing.resolved !== undefined
        ) {
          this.unusedExposing.add(exposing);
        }
      }
    }

    this.imports = [...annotatedImports, ...annotatedImplicitImports];

    for (const typeDeclaration of module.typeDeclarations) {
      // Warning: do not use Array.map, as we need to seed results asap
      const annotated = this.annotateTypeDeclaration(typeDeclaration);
      this.typeDeclarations.push(annotated);
    }

    const annotatedDeclrs = this.annotateDeclarations(module.declarations);
    for (const decl of annotatedDeclrs) {
      if (this.unusedVariables.has(decl.binding)) {
        this.errors.push({
          range: decl.binding.range,
          description: new UnusedVariable(decl.binding.name, "global"),
        });
      }
    }

    for (const import_ of annotatedImports) {
      if (this.unusedImports.has(import_)) {
        this.errors.push({
          description: new UnusedImport(import_.ns),
          range: import_.range,
        });
      }

      for (const exposing of import_.exposing) {
        if (this.unusedExposing.has(exposing)) {
          this.errors.push({
            description: new UnusedExposing(exposing.name),
            range: exposing.range,
          });
        }
      }
    }

    const typedModule: TypedModule = {
      imports: this.imports,
      declarations: annotatedDeclrs,
      typeDeclarations: this.typeDeclarations,
    };

    if (module.moduleDoc !== undefined) {
      typedModule.moduleDoc = module.moduleDoc;
    }

    return [typedModule, this.errors];
  }

  private annotateDeclarations(
    declrs: UntypedDeclaration[],
  ): TypedDeclaration[] {
    return declrs.map<TypedDeclaration>((decl) => {
      const binding: TypedBinding = {
        ...decl.binding,
        $: TVar.fresh(),
      };

      let tDecl: TypedDeclaration;
      if (decl.extern) {
        tDecl = {
          ...decl,
          scheme: {},
          binding,
          typeHint: undefined!,
        };
      } else {
        tDecl = {
          ...decl,
          scheme: {},
          binding,
          typeHint: undefined!,
          value: undefined!,
        };

        this.framesStack.defineRecursiveLabel({
          type: "global",
          declaration: tDecl,
          namespace: this.ns,
        });

        tDecl.value = this.annotateExpr(decl.value);
      }

      if (decl.typeHint !== undefined) {
        tDecl.typeHint = {
          mono: this.annotateTypeAst(decl.typeHint.mono),
          range: decl.typeHint.range,
          where: decl.typeHint.where,
        };
      }

      if (!decl.pub) {
        this.unusedVariables.add(tDecl.binding);
      }

      const ok = this.framesStack.defineGlobal(tDecl, this.ns);
      if (!ok) {
        this.errors.push({
          range: decl.binding.range,
          description: new DuplicateDeclaration(decl.binding.name),
        });
      }
      return tDecl;
    });
  }

  private resolveType(
    namespace: string | undefined,
    typeName: string,
  ): TypeResolution | undefined {
    if (namespace !== undefined) {
      const import_ = this.imports.find((import_) => import_.ns === namespace);
      if (import_ === undefined) {
        return undefined;
      }

      this.unusedImports.delete(import_);

      const dep = this.deps[import_.ns];
      if (dep === undefined) {
        return undefined;
      }

      for (const typeDecl of dep.typeDeclarations) {
        if (typeDecl.name === typeName && typeDecl.pub) {
          return {
            namespace,
            declaration: typeDecl,
          };
        }
      }

      return undefined;
    }

    for (const typeDecl of this.typeDeclarations) {
      if (typeDecl.name === typeName) {
        return {
          declaration: typeDecl,
          namespace: this.ns,
        };
      }
    }

    for (const import_ of this.imports) {
      for (const exposed of import_.exposing) {
        if (exposed.type === "type" && exposed.resolved?.name === typeName) {
          this.unusedExposing.delete(exposed);
          return {
            declaration: exposed.resolved,
            namespace: import_.ns,
          };
        }
      }
    }
    return undefined;
  }

  private annotateTypeAst(
    ast: TypeAst,
    recursiveBinding?: {
      name: string;
      /* mut */ holes: Array<(decl: TypedTypeDeclaration) => void>;
    },
  ): TypedTypeAst {
    const recur = (ast: TypeAst): TypedTypeAst => {
      switch (ast.type) {
        case "var":
        case "any":
          return ast;

        case "fn":
          return {
            ...ast,
            args: ast.args.map(recur),
            return: recur(ast.return),
          };

        case "named": {
          const isRecursive =
            recursiveBinding !== undefined &&
            ast.name === recursiveBinding.name &&
            (ast.namespace === undefined || ast.namespace === this.ns);

          const ret: TypedTypeAst = {
            ...ast,
            args: ast.args.map(recur),
            // This must be filled with this function's return type
            resolution: undefined,
          };

          if (isRecursive) {
            recursiveBinding.holes.push((declaration) => {
              ret.resolution = {
                declaration,
                namespace: this.ns,
              };
            });

            return ret;
          }

          const resolution = this.resolveType(ast.namespace, ast.name);
          if (resolution === undefined) {
            this.errors.push({
              range: ast.range,
              description: new UnboundType(ast.name),
            });
          }
          ret.resolution = resolution;
          return ret;
        }
      }
    };

    return recur(ast);
  }

  private annotateTypeDeclaration(
    typeDecl: UntypedTypeDeclaration,
  ): TypedTypeDeclaration {
    const usedParams = new Set();
    for (const param of typeDecl.params) {
      if (usedParams.has(param.name)) {
        this.errors.push({
          range: param.range,
          description: new TypeParamShadowing(param.name),
        });
      }
      usedParams.add(param.name);
    }

    switch (typeDecl.type) {
      case "extern": {
        return typeDecl;
      }

      case "adt": {
        const holes: Array<(decl: TypedTypeDeclaration) => void> = [];

        const typedTypeDecl: TypedTypeDeclaration & { type: "adt" } = {
          ...typeDecl,

          variants: typeDecl.variants.map((variant) => {
            const typedVariant: TypedTypeVariant = {
              ...variant,
              scheme: {},
              $: TVar.fresh(),
              args: variant.args.map((arg) =>
                this.annotateTypeAst(arg, {
                  holes,
                  name: typeDecl.name,
                }),
              ),
            };

            this.constructors[variant.name] = {
              type: "constructor",
              variant: typedVariant,
              namespace: this.ns,

              // This is unsafe
              declaration: null as never,
            };

            return typedVariant;
          }),
        };

        for (const variant of typedTypeDecl.variants) {
          this.constructors[variant.name]!.declaration = typedTypeDecl;
        }

        for (const hole of holes) {
          hole(typedTypeDecl);
        }

        return typedTypeDecl;
      }

      case "struct": {
        const holes: Array<(decl: TypedTypeDeclaration) => void> = [];

        const typedTypeDecl: TypedTypeDeclaration & { type: "struct" } = {
          ...typeDecl,

          scheme: {},
          $: TVar.fresh(),

          fields: typeDecl.fields.map((untypedField) => ({
            ...untypedField,
            $: TVar.fresh(),
            scheme: {},
            type_: this.annotateTypeAst(untypedField.type_, {
              holes,
              name: typeDecl.name,
            }),
          })),
        };

        for (const hole of holes) {
          hole(typedTypeDecl);
        }

        return typedTypeDecl;
      }
    }
  }

  private annotateImports(imports: UntypedImport[]): TypedImport[] {
    return imports.flatMap((import_) => {
      const importedModule = this.deps[import_.ns];
      if (importedModule === undefined) {
        this.errors.push({
          range: import_.range,
          description: new UnboundModule(import_.ns),
        });
        return [];
      }

      return [this.annotateImport(import_, importedModule)];
    });
  }

  private resolveExternalIdentifier(ast: {
    name: string;
    namespace: string;
    range: Range;
  }): IdentifierResolution | undefined {
    const import_ = this.imports.find(
      (import_) => import_.ns === ast.namespace,
    );
    if (import_ === undefined) {
      this.errors.push({
        range: ast.range,
        description: new UnimportedModule(ast.namespace),
      });
      return undefined;
    }

    this.unusedImports.delete(import_);

    const dep = this.deps[import_.ns];
    if (dep === undefined) {
      return undefined;
    }

    const declaration = dep.declarations.find(
      (decl) => decl.binding.name === ast.name && decl.pub,
    );

    if (declaration !== undefined) {
      return {
        type: "global-variable",
        declaration,
        namespace: ast.namespace,
      };
    }

    for (const tDecl of dep.typeDeclarations) {
      if (tDecl.type === "adt" && tDecl.pub === "..") {
        for (const variant of tDecl.variants) {
          if (variant.name === ast.name) {
            return {
              type: "constructor",
              variant,
              declaration: tDecl,
              namespace: ast.namespace,
            };
          }
        }
      }
    }

    for (const exposed of import_.exposing) {
      if (exposed.name === ast.name) {
        // Found!
        switch (exposed.type) {
          case "value":
            if (exposed.declaration === undefined) {
              return;
            }

            return {
              type: "global-variable",
              namespace: ast.namespace,
              declaration: exposed.declaration,
            };

          case "type":
            break;
        }
      }
    }

    this.errors.push({
      range: ast.range,
      description: new NonExistingImport(ast.name),
    });

    return;
  }

  private *exportedStructs(): Generator<
    [TypedTypeDeclaration & { type: "struct" }, TypedImport, TypedExposing]
  > {
    for (const import_ of this.imports) {
      for (const exposed of import_.exposing) {
        if (
          exposed.type !== "type" ||
          exposed.resolved === undefined ||
          exposed.resolved.type !== "struct"
        ) {
          continue;
        }

        yield [exposed.resolved, import_, exposed];
      }
    }
  }

  private resolveField(
    ast: { name: string; structName?: string } & RangeMeta,
  ): FieldResolution | undefined {
    const { name: fieldName, structName: qualifiedStructName } = ast;

    if (qualifiedStructName !== undefined) {
      for (const typeDecl of this.typeDeclarations) {
        if (typeDecl.name === qualifiedStructName) {
          const fieldLookup = findFieldInTypeDecl(typeDecl, fieldName, this.ns);

          if (fieldLookup === undefined) {
            this.errors.push({
              description: new InvalidField(typeDecl.name, fieldName),
              range: ast.range,
            });
          }

          return fieldLookup;
        }
      }

      const localFieldLookup = findFieldInModule(
        this.typeDeclarations,
        fieldName,
        this.ns,
      );
      if (localFieldLookup !== undefined) {
        return localFieldLookup;
      }

      for (const [struct, import_, exposing] of this.exportedStructs()) {
        if (struct.name !== qualifiedStructName) {
          continue;
        }

        const fieldLookup = findFieldInTypeDecl(struct, fieldName, import_.ns);

        if (fieldLookup === undefined || fieldLookup.declaration.pub !== "..") {
          // TODO emit err: invalid qualifier

          this.errors.push({
            description: new InvalidField(qualifiedStructName, fieldName),
            range: ast.range,
          });
        }

        this.unusedExposing.delete(exposing);

        return fieldLookup;
      }

      this.errors.push({
        description: new UnboundType(qualifiedStructName),
        range: ast.range,
      });

      return undefined;
    }

    // First check locally
    const lookup = findFieldInModule(this.typeDeclarations, fieldName, this.ns);
    if (lookup !== undefined) {
      return lookup;
    }

    // check in import with exposed fields
    for (const import_ of this.imports) {
      for (const exposed of import_.exposing) {
        if (
          exposed.type !== "type" ||
          exposed.resolved === undefined ||
          exposed.resolved.type !== "struct" ||
          !exposed.exposeImpl
        ) {
          continue;
        }

        const lookup = findFieldInTypeDecl(
          exposed.resolved,
          fieldName,
          import_.ns,
        );

        if (lookup !== undefined) {
          return lookup;
        }
      }
    }

    // TODO handle qualified fields
    return undefined;
  }

  private resolveIdentifier(ast: {
    name: string;
    namespace?: string;
    range: Range;
  }): IdentifierResolution | undefined {
    if (ast.namespace !== undefined && ast.namespace !== this.ns) {
      return this.resolveExternalIdentifier({
        name: ast.name,
        namespace: ast.namespace,
        range: ast.range,
      });
    }

    const resolved = this.framesStack.resolve(ast.name);
    if (resolved !== undefined) {
      switch (resolved.type) {
        case "global": {
          this.unusedVariables.delete(resolved.declaration.binding);

          const import_ = this.imports.find(
            (import_) => import_.ns === resolved.namespace,
          );
          const exposing = import_?.exposing.find((e) => e.name === ast.name);
          if (exposing !== undefined) {
            this.unusedExposing.delete(exposing);
          }

          return {
            type: "global-variable",
            declaration: resolved.declaration,
            namespace: resolved.namespace,
          };
        }

        case "local":
          this.unusedVariables.delete(resolved.binding);
          return {
            type: "local-variable",
            binding: resolved.binding,
          };
      }
    }

    const global = this.constructors[ast.name];
    if (global !== undefined) {
      return global;
    }

    this.errors.push({
      range: ast.range,
      description: new UnboundVariable(ast.name),
    });

    return;
  }

  private matchPatternBindings(pattern: TypedMatchPattern): TypedBinding[] {
    switch (pattern.type) {
      case "identifier":
        return [pattern];
      case "constructor":
        return pattern.args.flatMap((pattern) =>
          this.matchPatternBindings(pattern),
        );
      case "lit":
        return [];
    }
  }

  private annotateExpr(ast: UntypedExpr): TypedExpr {
    switch (ast.type) {
      // syntax sugar
      case "pipe":
        if (ast.right.type !== "application") {
          this.errors.push({
            range: ast.right.range,
            description: new InvalidPipe(),
          });
          return this.annotateExpr(ast.left);
        }

        return this.annotateExpr({
          type: "application",
          isPipe: true,
          range: ast.range,
          caller: ast.right.caller,
          args: [ast.left, ...ast.right.args],
        });

      case "let#":
        return this.annotateExpr({
          type: "application",
          caller: {
            type: "identifier",
            namespace: ast.mapper.namespace,
            name: ast.mapper.name,
            range: ast.mapper.range,
          },
          args: [
            ast.value,
            {
              type: "fn",
              params: [ast.pattern],
              body: ast.body,
              range: ast.range,
            },
          ],
          range: ast.range,
        });

      // Actual ast

      case "syntax-err":
      case "constant":
        return { ...ast, $: TVar.fresh() };

      case "struct-literal": {
        const typeDecl = this.resolveStruct(ast.struct.name);

        return {
          ...ast,
          fields: ast.fields.map((field): TypedStructField => {
            const fieldResolution =
              typeDecl === undefined
                ? undefined
                : findFieldInTypeDecl(
                    typeDecl.declaration,
                    field.field.name,
                    this.ns,
                  );

            if (typeDecl !== undefined && fieldResolution === undefined) {
              // TODO move the error back to typecheck step?
              // it has access to the inferred type
              this.errors.push({
                range: field.range,
                description: new InvalidField(
                  makeStructName(typeDecl.declaration),
                  field.field.name,
                ),
              });
            }

            return {
              ...field,
              field: {
                ...field.field,
                resolution: fieldResolution,
              },
              value: this.annotateExpr(field.value),
            };
          }),
          struct: {
            ...ast.struct,
            resolution: typeDecl,
          },
          spread:
            ast.spread === undefined
              ? undefined
              : this.annotateExpr(ast.spread),
          $: TVar.fresh(),
        };
      }

      case "list-literal": {
        return {
          ...ast,
          values: ast.values.map((v) => this.annotateExpr(v)),
          $: TVar.fresh(),
        };
      }

      case "identifier":
        return {
          ...ast,
          resolution: this.resolveIdentifier(ast),
          $: TVar.fresh(),
        };

      case "fn": {
        const params = ast.params.map((p) =>
          this.annotateMatchPattern(p, false),
        );

        const idents = params.flatMap((p) => this.matchPatternBindings(p));

        this.framesStack.pushFrame(idents);
        // TODO frame name
        for (const param of idents) {
          if (!param.name.startsWith("_")) {
            this.unusedVariables.add(param);
          }
        }

        const body: TypedExpr = this.annotateExpr(ast.body);

        for (const param of idents) {
          if (this.unusedVariables.has(param)) {
            this.errors.push({
              range: param.range,
              description: new UnusedVariable(param.name, "local"),
            });
          }
        }

        this.framesStack.popFrame();

        return {
          ...ast,
          $: TVar.fresh(),
          body,
          params,
        };
      }

      case "infix":
        return this.annotateExpr({
          type: "application",
          caller: { type: "identifier", name: ast.operator, range: ast.range },
          args: [ast.left, ast.right],
          range: ast.range,
        });

      case "application":
        return {
          ...ast,
          $: TVar.fresh(),
          caller: this.annotateExpr(ast.caller),
          args: ast.args.map((arg) => this.annotateExpr(arg)),
        };

      case "field-access":
        return {
          ...ast,
          struct: this.annotateExpr(ast.struct),
          resolution: this.resolveField(ast.field),
          $: TVar.fresh(),
        };

      case "if":
        return {
          ...ast,
          $: TVar.fresh(),
          condition: this.annotateExpr(ast.condition),
          then: this.annotateExpr(ast.then),
          else: this.annotateExpr(ast.else),
        };

      case "let": {
        let pattern: TypedMatchPattern;
        let bindings: TypedBinding[];
        if (ast.pattern.type === "identifier") {
          const binding: TypedMatchPattern = {
            ...ast.pattern,
            $: TVar.fresh(),
          };
          pattern = binding;

          this.framesStack.defineRecursiveLabel({
            type: "local",
            binding,
          });

          bindings = [binding];
        } else {
          pattern = this.annotateMatchPattern(ast.pattern, false);
          bindings = this.matchPatternBindings(pattern);
        }

        for (const binding of bindings) {
          if (!binding.name.startsWith("_")) {
            this.unusedVariables.add(binding);
          }
        }

        const value = this.annotateExpr(ast.value);

        for (const binding of bindings) {
          this.framesStack.defineLocal(binding);
        }

        const body = this.annotateExpr(ast.body);
        this.framesStack.exitLocal();

        const node: TypedExpr = {
          ...ast,
          $: TVar.fresh(),
          pattern,
          value,
          body,
        };

        for (const binding of bindings) {
          if (this.unusedVariables.has(binding)) {
            this.errors.push({
              range: binding.range,
              description: new UnusedVariable(binding.name, "local"),
            });
          }
        }

        return node;
      }
      case "match": {
        return {
          ...ast,
          $: TVar.fresh(),
          expr: this.annotateExpr(ast.expr),
          clauses: ast.clauses.map(([pattern, expr]) => {
            this.patternBindings = [];
            const annotatedPattern = this.annotateMatchPattern(pattern);
            const annotatedExpr = this.annotateExpr(expr);

            for (const binding of this.patternBindings) {
              this.framesStack.exitLocal();

              if (this.unusedVariables.has(binding)) {
                this.errors.push({
                  description: new UnusedVariable(binding.name, "local"),
                  range: binding.range,
                });
              }
            }

            return [annotatedPattern, annotatedExpr];
          }),
        };
      }
    }
  }

  private resolveStruct(structName: string): StructResolution | undefined {
    // TODO handle external ns
    for (const typeDecl of this.typeDeclarations) {
      if (typeDecl.name === structName && typeDecl.type === "struct") {
        return {
          declaration: typeDecl,
          namespace: this.ns,
        };
      }
    }

    return undefined;
  }

  private annotateImport(
    import_: UntypedImport,
    importedModule: TypedModule,
  ): TypedImport {
    return {
      ...import_,
      exposing: import_.exposing.map((exposing) => {
        switch (exposing.type) {
          case "type": {
            const resolved = importedModule.typeDeclarations.find(
              (decl) => decl.name === exposing.name,
            );

            if (resolved === undefined || !resolved.pub) {
              this.errors.push({
                range: exposing.range,
                description: new NonExistingImport(exposing.name),
              });
              return exposing;
            }

            if (exposing.exposeImpl) {
              switch (resolved.type) {
                case "extern":
                  this.errors.push({
                    range: exposing.range,
                    description: new BadImport(),
                  });
                  break;
                case "adt":
                  if (resolved.pub !== "..") {
                    this.errors.push({
                      range: exposing.range,
                      description: new BadImport(),
                    });
                    break;
                  } else {
                    for (const variant of resolved.variants) {
                      this.constructors[variant.name] = {
                        type: "constructor",
                        variant,
                        declaration: resolved,
                        namespace: import_.ns,
                      };
                    }
                  }
              }
            }

            return {
              ...exposing,
              resolved,
            };
          }

          case "value": {
            const declaration = importedModule.declarations.find(
              (decl) => decl.binding.name === exposing.name,
            );

            if (declaration === undefined || !declaration.pub) {
              this.errors.push({
                range: exposing.range,
                description: new NonExistingImport(exposing.name),
              });
            } else {
              this.framesStack.defineGlobal(declaration, import_.ns);
            }

            return {
              ...exposing,
              declaration: declaration,
            } as TypedExposing;
          }
        }
      }),
    };
  }

  private annotateMatchPattern(
    ast: MatchPattern,
    defineLocal = true,
  ): TypedMatchPattern {
    switch (ast.type) {
      case "lit":
        return {
          ...ast,
          $: TVar.fresh(),
        };

      case "identifier": {
        const typedBinding = {
          ...ast,
          $: TVar.fresh(),
        };
        if (!ast.name.startsWith("_")) {
          if (defineLocal) {
            this.framesStack.defineLocal(typedBinding);
            this.patternBindings.push(typedBinding);
          }

          this.unusedVariables.add(typedBinding);
        }
        return typedBinding;
      }

      case "constructor": {
        const resolution = this.resolveConstructor(
          ast.namespace,
          ast.name,
          ast.range,
        );
        return {
          ...ast,
          resolution,
          args: ast.args.map((arg) =>
            this.annotateMatchPattern(arg, defineLocal),
          ),
          $: TVar.fresh(),
        };
      }
    }
  }

  private resolveConstructor(
    namespace: string | undefined,
    name: string,
    range: Range,
  ): IdentifierResolution | undefined {
    namespace = namespace ?? this.ns;
    if (namespace === this.ns) {
      const constructor = this.constructors[name];
      if (constructor === undefined) {
        this.errors.push({
          description: new UnboundVariable(name),
          range,
        });
        return undefined;
      }
      return constructor;
    }

    const module = this.deps[namespace];
    if (module === undefined) {
      this.errors.push({
        description: new UnimportedModule(namespace),
        range,
      });
      return undefined;
    }

    for (const typeDeclaration of module.typeDeclarations) {
      if (typeDeclaration.type === "adt") {
        for (const variant of typeDeclaration.variants) {
          if (variant.name === name) {
            return {
              type: "constructor",
              variant: variant,
              declaration: typeDeclaration,
              namespace: namespace,
            };
          }
        }
      }
    }

    this.errors.push({
      description: new UnboundVariable(name),
      range,
    });

    return undefined;
  }
}

export function findFieldInModule(
  typeDeclarations: TypedTypeDeclaration[],
  fieldName: string,
  namespace: string,
): FieldResolution | undefined {
  for (const typeDecl of typeDeclarations) {
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

function makeStructName(
  structDeclaration: TypedTypeDeclaration & { type: "struct" },
): string {
  if (structDeclaration.params.length === 0) {
    return structDeclaration.name;
  }

  const params = structDeclaration.params.map(() => "_").join(", ");

  return `${structDeclaration.name}<${params}>`;
}
