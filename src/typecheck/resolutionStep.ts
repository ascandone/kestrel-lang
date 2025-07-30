import {
  MatchPattern,
  Range,
  RangeMeta,
  TypeAst,
  Expr,
  Import,
  UntypedModule,
  TypeDeclaration,
  Declaration,
} from "../parser";
import {
  FieldResolution,
  IdentifierResolution,
  StructResolution,
  TypeResolution,
  TypedBinding,
  TypedDeclaration,
  TypedExposedValue,
  TypedExpr,
  TypedImport,
  TypedMatchPattern,
  TypedModule,
  TypedStructDeclarationField,
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
  implicitImports: Import[] = defaultImports,
): [TypedModule, ErrorInfo[]] {
  return new ResolutionStep(ns, deps).run(module, implicitImports);
}

type Constructors = Record<
  string,
  IdentifierResolution & { type: "constructor" }
>;

class ResolutionStep {
  private readonly holes: Record<
    string,
    Array<TypedTypeAst & { type: "named" }>
  > = {};

  private constructors: Constructors = {};

  private errors: ErrorInfo[] = [];
  private imports: TypedImport[] = [];
  private typedTypeDeclarations: TypedTypeDeclaration[] = [];
  private unusedVariables = new WeakSet<TypedBinding>();
  private unusedImports = new WeakSet<TypedImport>();
  private unusedExposing = new WeakSet<TypedExposedValue>();
  private framesStack = new FramesStack<TypedBinding, TypedDeclaration>();

  private patternBindings: TypedBinding[] = [];

  constructor(
    private readonly ns: string,
    private readonly deps: Deps,
  ) {}

  run(
    module: UntypedModule,
    implicitImports: Import[] = defaultImports,
  ): [TypedModule, ErrorInfo[]] {
    TVar.resetId();

    const annotatedImplicitImports = this.annotateImports(
      implicitImports,
      false,
    );
    const annotatedImports = this.annotateImports(module.imports, true);

    this.imports = [...annotatedImports, ...annotatedImplicitImports];
    this.typedTypeDeclarations = this.resolveTypeDeclarations(
      module.typeDeclarations,
    );

    const annotatedDeclrs = this.annotateDeclarations(module.declarations);
    for (const decl of annotatedDeclrs) {
      if (this.unusedVariables.has(decl.binding)) {
        this.errors.push({
          range: decl.binding.range,
          description: new UnusedVariable(decl.binding.name, "global"),
        });
      }
    }

    this.detectUnusedImports(annotatedImports);

    const typedModule: TypedModule = {
      imports: this.imports,
      declarations: annotatedDeclrs,
      typeDeclarations: this.typedTypeDeclarations,
    };

    if (module.moduleDoc !== undefined) {
      typedModule.moduleDoc = module.moduleDoc;
    }

    return [typedModule, this.errors];
  }

  /**
   * Fill all the holes, and then looked for ones that aren't filled yet, and emit UnboundType errors for them.
   * This must be called after each type declaration is resolved
   * */
  private resolveTypeDeclarations(typeDeclarations: TypeDeclaration[]) {
    const annotatedTypeDeclarationsDeclarations = typeDeclarations.map(
      (typeDeclaration) => this.annotateTypeDeclaration(typeDeclaration),
    );

    // First, we fill the holes (if any) by registering a named type in this same module
    for (const decl of annotatedTypeDeclarationsDeclarations) {
      const holes = this.holes[decl.name] ?? [];
      for (const hole of holes) {
        hole.$resolution = {
          namespace: this.ns,
          declaration: decl,
        };
      }
      delete this.holes[decl.name];
    }

    // Then we look for the holes left
    for (const holes of Object.values(this.holes)) {
      for (const decl of holes) {
        this.errors.push({
          range: decl.range,
          description: new UnboundType(decl.name),
        });
      }
    }

    return annotatedTypeDeclarationsDeclarations;
  }

  private annotateDeclarations(declrs: Declaration[]): TypedDeclaration[] {
    return declrs.map<TypedDeclaration>((decl) => {
      const binding: TypedBinding = {
        ...decl.binding,
        $type: TVar.fresh(),
      };

      let tDecl: TypedDeclaration;
      if (decl.extern) {
        tDecl = {
          ...decl,
          $scheme: {},
          binding,
          typeHint: undefined!,
        };
      } else {
        tDecl = {
          ...decl,
          $scheme: {},
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
          mono: this.annotateTypeAst(decl.typeHint.mono, false),
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

  /**
   * Resolves a type and emits the corresponding errors (or registers the hole)
   * */
  private resolveType(
    ast: TypedTypeAst & { type: "named" },
    allowHoles: boolean,
  ): TypeResolution | undefined {
    if (ast.namespace !== undefined) {
      const import_ = this.imports.find(
        (import_) => import_.ns === ast.namespace,
      );

      if (import_ === undefined) {
        return undefined;
      }

      this.unusedImports.delete(import_);

      const dep = this.deps[import_.ns];
      if (dep === undefined) {
        return undefined;
      }

      for (const typeDecl of dep.typeDeclarations) {
        if (typeDecl.name === ast.name && typeDecl.pub) {
          return {
            namespace: ast.namespace,
            declaration: typeDecl,
          };
        }
      }

      this.errors.push({
        range: ast.range,
        description: new UnboundType(ast.name),
      });
      return undefined;
    }

    // Here we should look for local typeDeclarations
    // however, we won't yet: we'll pretend no such local declaration exists, and fill holes later on,
    // as we process local types

    for (const typeDecl of this.typedTypeDeclarations) {
      if (typeDecl.name === ast.name) {
        return {
          declaration: typeDecl,
          namespace: this.ns,
        };
      }
    }

    for (const import_ of this.imports) {
      for (const exposed of import_.exposing) {
        if (exposed.type === "type" && exposed.$resolution?.name === ast.name) {
          this.unusedExposing.delete(exposed);
          return {
            declaration: exposed.$resolution,
            namespace: import_.ns,
          };
        }
      }
    }

    if (allowHoles) {
      // Register the hole:
      defaultMapPush(this.holes, ast.name, ast);
    } else {
      this.errors.push({
        range: ast.range,
        description: new UnboundType(ast.name),
      });
    }

    return undefined;
  }

  private annotateTypeAst(ast: TypeAst, allowHoles: boolean): TypedTypeAst {
    switch (ast.type) {
      case "var":
      case "any":
        return ast;

      case "fn":
        return {
          ...ast,
          args: ast.args.map((a) => this.annotateTypeAst(a, allowHoles)),
          return: this.annotateTypeAst(ast.return, allowHoles),
        };

      case "named": {
        const typedAst: TypedTypeAst & { type: "named" } = {
          ...ast,
          args: ast.args.map((a) => this.annotateTypeAst(a, allowHoles)),
          $resolution: undefined,
        };
        typedAst.$resolution = this.resolveType(typedAst, allowHoles);
        return typedAst;
      }
    }
  }

  private annotateTypeDeclaration(
    typeDecl: TypeDeclaration,
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
      case "extern":
        return typeDecl;

      case "adt": {
        const typedTypeDecl: TypedTypeDeclaration & { type: "adt" } = {
          ...typeDecl,

          variants: typeDecl.variants.map((variant) => {
            const typedVariant: TypedTypeVariant = {
              ...variant,
              $scheme: {},
              $type: TVar.fresh(),
              args: variant.args.map((arg) => this.annotateTypeAst(arg, true)),
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

        return typedTypeDecl;
      }

      case "struct": {
        return {
          ...typeDecl,

          $scheme: {},
          $type: TVar.fresh(),

          fields: typeDecl.fields.map(
            (untypedField): TypedStructDeclarationField => ({
              ...untypedField,
              $type: TVar.fresh(),
              $scheme: {},
              typeAst: this.annotateTypeAst(untypedField.typeAst, true),
            }),
          ),
        };
      }
    }
  }

  private detectUnusedImports(annotatedImports: TypedImport[]) {
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
  }

  private annotateImports(
    imports: Import[],
    markUnused: boolean,
  ): TypedImport[] {
    return imports.flatMap((import_) => {
      const importedModule = this.deps[import_.ns];
      if (importedModule === undefined) {
        this.errors.push({
          range: import_.range,
          description: new UnboundModule(import_.ns),
        });
        return [];
      }

      const annotatedImport = this.annotateImport(import_, importedModule);

      if (markUnused) {
        // Track imported values so that we can tell which of them are
        if (annotatedImport.exposing.length === 0) {
          this.unusedImports.add(annotatedImport);
        }
        for (const exposing of annotatedImport.exposing) {
          if (
            exposing.type === "value" &&
            exposing.$declaration !== undefined
          ) {
            this.unusedExposing.add(exposing);
          } else if (
            exposing.type === "type" &&
            !exposing.exposeImpl &&
            exposing.$resolution !== undefined
          ) {
            this.unusedExposing.add(exposing);
          }
        }
      }

      return [annotatedImport];
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
            if (exposed.$declaration === undefined) {
              return;
            }

            return {
              type: "global-variable",
              namespace: ast.namespace,
              declaration: exposed.$declaration,
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
    [TypedTypeDeclaration & { type: "struct" }, TypedImport, TypedExposedValue]
  > {
    for (const import_ of this.imports) {
      for (const exposed of import_.exposing) {
        if (
          exposed.type !== "type" ||
          exposed.$resolution === undefined ||
          exposed.$resolution.type !== "struct"
        ) {
          continue;
        }

        yield [exposed.$resolution, import_, exposed];
      }
    }
  }

  private resolveField(
    ast: { name: string; structName?: string } & RangeMeta,
  ): FieldResolution | undefined {
    const { name: fieldName, structName: qualifiedStructName } = ast;

    if (qualifiedStructName !== undefined) {
      for (const typeDecl of this.typedTypeDeclarations) {
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
        this.typedTypeDeclarations,
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
    const lookup = findFieldInModule(
      this.typedTypeDeclarations,
      fieldName,
      this.ns,
    );
    if (lookup !== undefined) {
      return lookup;
    }

    // check in import with exposed fields
    for (const import_ of this.imports) {
      for (const exposed of import_.exposing) {
        if (
          exposed.type !== "type" ||
          exposed.$resolution === undefined ||
          exposed.$resolution.type !== "struct" ||
          !exposed.exposeImpl
        ) {
          continue;
        }

        const lookup = findFieldInTypeDecl(
          exposed.$resolution,
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

  private annotateExpr(ast: Expr): TypedExpr {
    switch (ast.type) {
      // syntax sugar
      case "block":
        return this.annotateExpr(ast.inner);

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
        return { ...ast, $type: TVar.fresh() };

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
                $resolution: fieldResolution,
              },
              value: this.annotateExpr(field.value),
            };
          }),
          struct: {
            ...ast.struct,
            $resolution: typeDecl,
          },
          spread:
            ast.spread === undefined
              ? undefined
              : this.annotateExpr(ast.spread),
          $type: TVar.fresh(),
        };
      }

      case "list-literal": {
        return {
          ...ast,
          values: ast.values.map((v) => this.annotateExpr(v)),
          $type: TVar.fresh(),
        };
      }

      case "identifier":
        return {
          ...ast,
          $resolution: this.resolveIdentifier(ast),
          $type: TVar.fresh(),
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
          $type: TVar.fresh(),
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
          $type: TVar.fresh(),
          caller: this.annotateExpr(ast.caller),
          args: ast.args.map((arg) => this.annotateExpr(arg)),
        };

      case "field-access":
        return {
          ...ast,
          struct: this.annotateExpr(ast.struct),
          $resolution: this.resolveField(ast.field),
          $type: TVar.fresh(),
        };

      case "if":
        return {
          ...ast,
          $type: TVar.fresh(),
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
            $type: TVar.fresh(),
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
          $type: TVar.fresh(),
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
          $type: TVar.fresh(),
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
    for (const typeDecl of this.typedTypeDeclarations) {
      if (typeDecl.name === structName && typeDecl.type === "struct") {
        return {
          declaration: typeDecl,
          namespace: this.ns,
        };
      }
    }

    for (const import_ of this.imports) {
      for (const exposed of import_.exposing) {
        if (
          exposed.type === "type" &&
          exposed.$resolution !== undefined &&
          exposed.$resolution.name === structName &&
          exposed.$resolution.type === "struct"
        ) {
          return {
            declaration: exposed.$resolution,
            namespace: import_.ns,
          };
        }
      }
    }

    return undefined;
  }

  private annotateImport(
    import_: Import,
    importedModule: TypedModule,
  ): TypedImport {
    return {
      ...import_,
      exposing: import_.exposing.map((exposing): TypedExposedValue => {
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

              return {
                ...exposing,
                $resolution: undefined,
              };
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
              $resolution: resolved,
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
              $declaration: declaration,
            } as TypedExposedValue;
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
          $type: TVar.fresh(),
        };

      case "identifier": {
        const typedBinding = {
          ...ast,
          $type: TVar.fresh(),
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
          $resolution: resolution,
          args: ast.args.map((arg) =>
            this.annotateMatchPattern(arg, defineLocal),
          ),
          $type: TVar.fresh(),
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

function defaultMapPush<T>(m: Record<string, T[]>, key: string, value: T) {
  const previous = m[key];
  if (previous === undefined) {
    m[key] = [value];
  } else {
    previous.push(value);
  }
}
