import {
  Binding,
  MatchPattern,
  Span,
  TypeAst,
  UntypedDeclaration,
  UntypedExpr,
  UntypedImport,
  UntypedModule,
  UntypedTypeDeclaration,
} from "../parser";
import {
  IdentifierResolution,
  TypeResolution,
  TypedDeclaration,
  TypedExposing,
  TypedExpr,
  TypedImport,
  TypedMatchPattern,
  TypedModule,
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
  InvalidPipe,
  NonExistingImport,
  TypeParamShadowing,
  UnboundModule,
  UnboundType,
  UnboundVariable,
  UnimportedModule,
  UnusedVariable,
} from "../errors";
import { Frame } from "./frame";

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

type GlobalScope = Record<string, IdentifierResolution>;

class ResolutionStep {
  private globalScope: GlobalScope = {};

  private errors: ErrorInfo[] = [];
  private imports: TypedImport[] = [];
  private typeDeclarations: TypedTypeDeclaration[] = [];
  private unusedVariables = new WeakSet<Binding<TypeMeta>>();
  private frames: Frame<Binding<TypeMeta>>[] = [new Frame(undefined, [])];
  private recursiveBinding: Binding<TypeMeta> | undefined = undefined;
  private patternBindings: Binding<TypeMeta>[] = [];

  constructor(
    private ns: string,
    private deps: Deps,
  ) {}

  private currentFrame(): Frame<Binding<TypeMeta>> {
    const frame = this.frames.at(-1);
    if (frame === undefined) {
      throw new Error("[unreachable] No frames left");
    }
    return frame;
  }

  run(
    module: UntypedModule,
    implicitImports: UntypedImport[] = defaultImports,
  ): [TypedModule, ErrorInfo[]] {
    TVar.resetId();

    this.imports = [
      ...this.annotateImports(implicitImports),
      ...this.annotateImports(module.imports),
    ];

    for (const typeDeclaration of module.typeDeclarations) {
      // Warning: do not use Array.map, as we need to seed results asap
      const annotated = this.annotateTypeDeclaration(typeDeclaration);
      this.typeDeclarations.push(annotated);
    }

    const annotatedDeclrs = this.annotateDeclarations(module.declarations);
    for (const decl of annotatedDeclrs) {
      if (this.unusedVariables.has(decl.binding)) {
        this.errors.push({
          span: decl.binding.span,
          description: new UnusedVariable(decl.binding.name, "global"),
        });
      }
    }

    return [
      {
        imports: this.imports,
        declarations: annotatedDeclrs,
        typeDeclarations: this.typeDeclarations,
      },
      this.errors,
    ];
  }

  private annotateDeclarations(
    declrs: UntypedDeclaration[],
  ): TypedDeclaration[] {
    return declrs.map<TypedDeclaration>((decl) => {
      const binding: Binding<TypeMeta> = {
        ...decl.binding,
        $: TVar.fresh(),
      };
      this.recursiveBinding = binding;

      let tDecl: TypedDeclaration;
      if (decl.extern) {
        tDecl = {
          ...decl,
          scheme: {},
          binding,
        };
      } else {
        tDecl = {
          ...decl,
          scheme: {},
          binding,
          value: this.annotateExpr(decl.value),
        };
      }

      if (decl.typeHint !== undefined) {
        tDecl.typeHint = this.annotateTypeAst(decl.typeHint);
      }

      if (!decl.pub) {
        this.unusedVariables.add(tDecl.binding);
      }

      if (decl.binding.name in this.globalScope) {
        this.errors.push({
          span: decl.binding.span,
          description: new DuplicateDeclaration(decl.binding.name),
        });
      } else {
        this.globalScope[decl.binding.name] = {
          type: "global-variable",
          declaration: tDecl,
        };
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
              span: ast.span,
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
          span: param.span,
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

        const typedTypeDecl: TypedTypeDeclaration = {
          ...typeDecl,
          variants: typeDecl.variants.map((variant) => {
            const typedVariant: TypedTypeVariant = {
              ...variant,
              scheme: {},
              mono: TVar.fresh().asType(),
              args: variant.args.map((arg) =>
                this.annotateTypeAst(arg, {
                  holes,
                  name: typeDecl.name,
                }),
              ),
            };

            this.globalScope[variant.name] = {
              type: "constructor",
              variant: typedVariant,
            };

            return typedVariant;
          }),
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
          span: import_.span,
          description: new UnboundModule(import_.ns),
        });
        return [];
      }

      return [this.annotateImport(import_, importedModule)];
    });
  }

  private resolveIdentifier(ast: {
    name: string;
    namespace?: string;
    span: Span;
  }): IdentifierResolution | undefined {
    // TODO && ast.namespace !== this.ns
    if (ast.namespace !== undefined) {
      const import_ = this.imports.find(
        (import_) => import_.ns === ast.namespace,
      );
      if (import_ === undefined) {
        this.errors.push({
          span: ast.span,
          description: new UnimportedModule(ast.namespace),
        });
        return undefined;
      }

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
              return { type: "constructor", variant, namespace: ast.namespace };
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
        span: ast.span,
        description: new NonExistingImport(ast.name),
      });

      return;
    }

    for (let i = this.frames.length - 1; i >= 0; i--) {
      const frame = this.frames[i]!;
      const resolution = frame.resolve(ast.name);
      if (resolution !== undefined) {
        this.unusedVariables.delete(resolution);
        return { type: "local-variable", binding: resolution };
      }
    }

    const global = this.globalScope[ast.name];
    if (global !== undefined) {
      if (global.type === "global-variable") {
        this.unusedVariables.delete(global.declaration.binding);
      }
      return global;
    }

    this.errors.push({
      span: ast.span,
      description: new UnboundVariable(ast.name),
    });

    return;
  }

  private annotateExpr(ast: UntypedExpr): TypedExpr {
    switch (ast.type) {
      // syntax sugar
      case "pipe":
        if (ast.right.type !== "application") {
          this.errors.push({
            span: ast.right.span,
            description: new InvalidPipe(),
          });
          return this.annotateExpr(ast.left);
        }

        return this.annotateExpr({
          type: "application",
          span: ast.right.span,
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
            span: ast.mapper.span,
          },
          args: [
            ast.value,
            {
              type: "fn",
              params: [ast.binding],
              body: ast.body,
              span: ast.span,
            },
          ],
          span: ast.span,
        });

      // Actual ast

      case "constant":
        return { ...ast, $: TVar.fresh() };

      case "identifier":
        return {
          ...ast,
          resolution: this.resolveIdentifier(ast),
          $: TVar.fresh(),
        };

      case "fn": {
        const params = ast.params.map<Binding<TypeMeta>>((p) => ({
          ...p,
          $: TVar.fresh(),
        }));

        // TODO frame name
        this.frames.push(new Frame(this.recursiveBinding, params));
        for (const param of params) {
          if (!param.name.startsWith("_")) {
            this.unusedVariables.add(param);
          }
        }

        const body: TypedExpr = this.annotateExpr(ast.body);

        for (const param of params) {
          if (this.unusedVariables.has(param)) {
            this.errors.push({
              span: param.span,
              description: new UnusedVariable(param.name, "local"),
            });
          }
        }

        this.frames.pop();

        return {
          ...ast,
          $: TVar.fresh(),
          body,
          params,
        };
      }

      case "application":
        return {
          ...ast,
          $: TVar.fresh(),
          caller: this.annotateExpr(ast.caller),
          args: ast.args.map((arg) => this.annotateExpr(arg)),
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
        const oldBinding = this.recursiveBinding;

        const binding: Binding<TypeMeta> = {
          ...ast.binding,
          $: TVar.fresh(),
        };

        if (!binding.name.startsWith("_")) {
          this.unusedVariables.add(binding);
        }

        const currentFrame = this.currentFrame();

        // TODO proper rec binding
        this.recursiveBinding = binding;
        const value = this.annotateExpr(ast.value);
        this.recursiveBinding = oldBinding;

        currentFrame.defineLocal(binding);
        const body = this.annotateExpr(ast.body);
        currentFrame.exitLocal();

        const node = {
          ...ast,
          $: TVar.fresh(),
          binding,
          value,
          body,
        };

        if (this.unusedVariables.has(binding)) {
          this.errors.push({
            span: binding.span,
            description: new UnusedVariable(binding.name, "local"),
          });
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
              if (this.unusedVariables.has(binding)) {
                this.errors.push({
                  description: new UnusedVariable(binding.name, "local"),
                  span: binding.span,
                });
              }
            }

            return [annotatedPattern, annotatedExpr];
          }),
        };
      }
    }
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
                span: exposing.span,
                description: new NonExistingImport(exposing.name),
              });
              return exposing;
            }

            if (exposing.exposeImpl) {
              switch (resolved.type) {
                case "extern":
                  this.errors.push({
                    span: exposing.span,
                    description: new BadImport(),
                  });
                  break;
                case "adt":
                  if (resolved.pub !== "..") {
                    this.errors.push({
                      span: exposing.span,
                      description: new BadImport(),
                    });
                    break;
                  } else {
                    for (const variant of resolved.variants) {
                      this.globalScope[variant.name] = {
                        type: "constructor",
                        variant,
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
                span: exposing.span,
                description: new NonExistingImport(exposing.name),
              });
            } else {
              this.globalScope[exposing.name] = {
                type: "global-variable",
                declaration,
                namespace: import_.ns,
              };
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

  private annotateMatchPattern(ast: MatchPattern): TypedMatchPattern {
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
          this.currentFrame().defineLocal(typedBinding);
          this.unusedVariables.add(typedBinding);
          this.patternBindings.push(typedBinding);
        }
        return typedBinding;
      }

      case "constructor": {
        // TODO only resolve if constructor is unqualified
        const typedPattern: TypedMatchPattern = {
          ...ast,
          resolution: this.globalScope[ast.name],
          args: ast.args.map((arg) => this.annotateMatchPattern(arg)),
          $: TVar.fresh(),
        };
        return typedPattern;
      }
    }
  }
}