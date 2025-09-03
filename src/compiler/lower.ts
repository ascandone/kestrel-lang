import { nestedMapGetOrPutDefault } from "../data/defaultMap";
import { RigidVarsCtx, resolveType } from "../type";
import * as typed from "../typecheck";
import { CORE_PACKAGE } from "../typecheck/core_package";
import { TypedProject } from "../typecheck/project";
import * as ir from "./ir";

class ExprEmitter {
  constructor(
    private readonly namespace: string,
    private readonly currentDecl: ir.QualifiedIdentifier,
    private readonly knownImplicitArities: Map<string, ir.ImplicitParam[]>,
    private readonly getDependency: (ns: string) => undefined | ir.Program,
  ) {}

  private readonly uniques = new Map<string, number>();
  private getFreshUnique(name: string) {
    const unique = this.uniques.get(name) ?? 0;
    this.uniques.set(name, unique + 1);
    return unique;
  }

  private readonly loweredIdents = new Map<
    typed.TypedBinding,
    ir.Ident & { type: "local" }
  >();

  private genIdent(): ir.Ident & { type: "local" } {
    const name = "";

    return {
      type: "local",
      name,
      declaration: this.currentDecl,
      unique: this.getFreshUnique(name),
    };
  }

  private mkIdent(pattern: typed.TypedBinding): ir.Ident & { type: "local" } {
    const ident: ir.Ident & { type: "local" } = {
      type: "local",
      name: pattern.name,
      declaration: this.currentDecl,
      unique: this.getFreshUnique(pattern.name),
    };

    this.loweredIdents.set(pattern, ident);

    return ident;
  }

  private lowerBlock(
    statements: typed.TypedBlockStatement[],
    returning: typed.TypedExpr,
  ): ir.Expr {
    // TODO make this more efficient with loops
    const [stmt, ...statementsLeft] = statements;
    if (stmt === undefined) {
      return this.lowerExpr(returning);
    }

    switch (stmt.type) {
      case "let#": {
        if (stmt.pattern.type === "identifier") {
          const ident = this.mkIdent(stmt.pattern);

          return {
            type: "application",
            caller: this.lowerExpr(stmt.mapper),
            args: [
              this.lowerExpr(stmt.value),
              {
                type: "fn",
                bindings: [ident],
                body: this.lowerBlock(statementsLeft, returning),
              },
            ],
          };
        }

        const ident = this.genIdent();

        return {
          type: "application",
          caller: this.lowerExpr(stmt.mapper),
          args: [
            this.lowerExpr(stmt.value),
            {
              type: "fn",
              bindings: [ident],
              body: {
                type: "match",
                expr: { type: "identifier", ident },
                clauses: [
                  [
                    this.lowerPattern(stmt.pattern),
                    this.lowerBlock(statementsLeft, returning),
                  ],
                ],
              },
            },
          ],
        };
      }

      case "let": {
        if (stmt.pattern.type === "identifier") {
          // this line must be above the expr lowering
          const ident = this.mkIdent(stmt.pattern);

          return {
            type: "match",
            expr: this.lowerExpr(stmt.value),
            clauses: [
              [
                { type: "identifier", ident },
                this.lowerBlock(statementsLeft, returning),
              ],
            ],
          };
        }

        return {
          type: "match",
          expr: this.lowerExpr(stmt.value),
          clauses: [
            [
              this.lowerPattern(stmt.pattern),
              this.lowerBlock(statementsLeft, returning),
            ],
          ],
        };
      }
    }
  }

  private lowerPattern(expr: typed.TypedMatchPattern): ir.MatchPattern {
    switch (expr.type) {
      case "lit":
        return {
          type: "lit",
          literal: expr.literal,
        };

      case "identifier":
        return {
          type: "identifier",
          ident: this.mkIdent(expr),
        };

      case "constructor": {
        const resolution = getResolution(expr);
        if (resolution.type !== "constructor") {
          throw new CompilationError("wrong resolution for constructor");
        }

        const qualifiedIdent = new ir.QualifiedIdentifier(
          resolution.package_,
          resolution.namespace,
          resolution.declaration.name,
        );

        return {
          type: "constructor",
          args: expr.args.map((arg) => this.lowerPattern(arg)),
          name: resolution.variant.name,
          typeName: qualifiedIdent,
        };
      }
    }
  }

  public lowerExpr(expr: typed.TypedExpr): ir.Expr {
    switch (expr.type) {
      case "syntax-err":
        throw new CompilationError("syntax error");

      case "constant":
        return {
          type: "constant",
          value: expr.value,
        };

      case "identifier": {
        return {
          type: "identifier",
          ident: this.lowerIdent(expr),
        };
      }

      case "block":
        return this.lowerBlock(expr.statements, expr.returning);

      case "fn": {
        type BindingType = {
          param: typed.TypedMatchPattern;
          ident: ir.Ident & { type: "local" };
        };

        const bindings = expr.params.map(
          (param): BindingType => ({
            param,
            ident:
              param.type === "identifier"
                ? this.mkIdent(param)
                : this.genIdent(),
          }),
        );

        const getBody = bindings
          .filter((b) => b.ident.name === "")
          .reduceRight(
            (getExpr, { ident, param }) =>
              (): ir.Expr => ({
                type: "match",
                expr: { type: "identifier", ident },
                clauses: [[this.lowerPattern(param), getExpr()]],
              }),
            () => this.lowerExpr(expr.body),
          );

        return {
          type: "fn",
          bindings: bindings.map((b) => b.ident),
          body: getBody(),
        };
      }

      case "application":
        return {
          type: "application",
          caller: this.lowerExpr(expr.caller),
          args: expr.args.map((arg) => this.lowerExpr(arg)),
        };

      case "pipe":
        if (expr.right.type !== "application") {
          throw new CompilationError("bad pipe");
        }

        return {
          type: "application",
          caller: this.lowerExpr(expr.right.caller),
          args: [
            this.lowerExpr(expr.left),
            ...expr.right.args.map((arg) => this.lowerExpr(arg)),
          ],
        };

      case "if": {
        const typeName = new ir.QualifiedIdentifier(
          CORE_PACKAGE,
          "Bool",
          "Bool",
        );

        return {
          type: "match",
          expr: this.lowerExpr(expr.condition),
          clauses: [
            [
              { type: "constructor", typeName, name: "True", args: [] },
              this.lowerExpr(expr.then),
            ],
            [
              { type: "constructor", typeName, name: "False", args: [] },
              this.lowerExpr(expr.else),
            ],
          ],
        };
      }

      case "struct-literal": {
        const resolution = getResolution(expr.struct);

        const qualifiedIdent = new ir.QualifiedIdentifier(
          resolution.package_,
          resolution.namespace,
          resolution.declaration.name,
        );

        // TODO enumerate fields in the same order they appear in the struct
        return {
          type: "struct-literal",
          fields: expr.fields.map((field) => ({
            name: field.field.name,
            expr: this.lowerExpr(field.value),
          })),
          struct: qualifiedIdent,
          spread:
            expr.spread === undefined ? undefined : this.lowerExpr(expr.spread),
        };
      }

      case "field-access": {
        const resolution = getResolution(expr);

        const qualifiedIdent = new ir.QualifiedIdentifier(
          resolution.package_,
          resolution.namespace,
          resolution.declaration.name,
        );

        return {
          type: "field-access",
          field: {
            name: expr.field.name,
            struct: qualifiedIdent,
          },
          struct: this.lowerExpr(expr.struct),
        };
      }

      case "list-literal":
        return expr.values.reduceRight(
          (acc, expr): ir.Expr => CONS(this.lowerExpr(expr), acc),
          NIL,
        );

      case "match":
        return {
          type: "match",
          expr: this.lowerExpr(expr.expr),
          clauses: expr.clauses.map(
            ([pat, then_]) =>
              [this.lowerPattern(pat), this.lowerExpr(then_)] as const,
          ),
        };
    }
  }

  private lowerIdent(expr: typed.TypedExpr & { type: "identifier" }): ir.Ident {
    const resolution = getResolution(expr);

    switch (resolution.type) {
      case "local-variable": {
        const lookup = this.loweredIdents.get(resolution.binding);
        if (lookup === undefined) {
          throw new CompilationError(
            "can't find binding for: " + resolution.binding.name,
          );
        }

        return lookup;
      }

      case "constructor":
        if (resolution.namespace !== this.namespace) {
          this.getDependency(resolution.namespace);
        }

        return {
          type: "constructor",
          typeName: new ir.QualifiedIdentifier(
            resolution.package_,
            resolution.namespace,
            resolution.declaration.name,
          ),
          name: resolution.variant.name,
        };

      case "global-variable": {
        if (resolution.namespace !== this.namespace) {
          this.getDependency(resolution.namespace);
        }

        const glbVarId = new ir.QualifiedIdentifier(
          resolution.package_,
          resolution.namespace,
          resolution.declaration.binding.name,
        );

        // TODO we should emit a compilation error if this value is undefined, as it's most likely a bug
        // however this'll make some tests fail
        const implicitArity =
          this.knownImplicitArities.get(glbVarId.toString()) ?? [];

        return {
          type: "global",
          name: glbVarId,
          implicitly: implicitArity.flatMap((arity): ir.ImplicitTraitArg[] => {
            /**
             * the recursive binding doesn't get instantiated, so we'll treat that differently.
             * Luckily, we know what the binding's arity is already
             */
            if (this.currentDecl.equals(glbVarId)) {
              return [arity];
            }

            // TODO  we need to check whether arity.id was resolved as a concrete type
            // TODO this may be a bug: that's the id of the polytype. Try to test this case
            const instantiated = expr.$instantiated.get(arity.id);
            if (instantiated === undefined) {
              throw new CompilationError("unknown instantiated: " + glbVarId);
            }

            return this.lowerImplicitArg(instantiated, arity);
          }),
        };
      }
    }
  }

  private lowerImplicitArg(
    instantiatedType: typed.Type,
    arity: ir.ImplicitParam,
  ): ir.ImplicitTraitArg[] {
    const resolution = resolveType(instantiatedType);
    switch (resolution.type) {
      case "unbound": {
        if (resolution.traits.size === 0) {
          return [];
        }

        throw new CompilationError("unbound dict");
      }

      case "fn":
        // TODO is it actually an error?
        throw new CompilationError("Invalid implicit param resolution (fn)");

      case "rigid-var":
        return [
          {
            type: "var",
            id: resolution.name,
            trait: arity.trait,
          },
        ];

      case "named":
        return [
          {
            type: "resolved",
            // TODO recur for args
            args: resolution.args.flatMap((arg) =>
              this.lowerImplicitArg(arg, arity),
            ),
            trait: arity.trait,
            typeName: new ir.QualifiedIdentifier(
              resolution.package_,
              resolution.module,
              resolution.name,
            ),
          },
        ];
    }
  }
}

// TODO we need to know the strongly connected components
export function lowerProgram(
  module: typed.TypedModule,
  /** TODO look up in deps instead */
  knownImplicitArities = new Map<string, ir.ImplicitParam[]>(),
  /** TODO make getDependency's return not optional */
  getDependency: (ns: string) => undefined | ir.Program,
): ir.Program {
  const namespace = module.moduleInterface.ns;
  const package_ = module.moduleInterface.package_;

  const mkIdent = (name: string) =>
    new ir.QualifiedIdentifier(package_, namespace, name);

  return {
    namespace,
    package_,
    adts: module.typeDeclarations.flatMap((decl): ir.Adt[] => {
      if (decl.type !== "adt") {
        return [];
      }

      return [
        {
          name: mkIdent(decl.name),
          params: decl.params.map((p) => p.name),
          traits: decl.$traits,
          constructors: decl.variants.map(
            (ctor): ir.AdtConstructor => ({
              name: mkIdent(ctor.name),
              arity: ctor.args.length,
              args: ctor.args,
            }),
          ),
        },
      ];
    }),

    structs: module.typeDeclarations.flatMap((decl): ir.Struct[] => {
      if (decl.type !== "struct") {
        return [];
      }

      return [
        {
          name: mkIdent(decl.name),
          declaration: decl,
          fields: decl.fields.map((f) => f.name),
          params: decl.params.map((p) => p.name),
        },
      ];
    }),

    values: module.mutuallyRecursiveDeclrs
      .flatMap((decl) => decl)
      .flatMap((decl): ir.ValueDeclaration[] => {
        const ident = mkIdent(decl.binding.name);

        const implArity = makeImplicitArity(decl, decl.$traitsConstraints);
        knownImplicitArities.set(ident.toString(), implArity);

        if (decl.extern) {
          visitReferencedTypes(decl.binding.$type, (ns) => {
            if (ns !== namespace) {
              getDependency(ns);
            }
          });
          return [];
        }

        const emitter = new ExprEmitter(
          namespace,
          ident,
          knownImplicitArities,
          getDependency,
        );

        return [
          {
            name: ident,
            value: emitter.lowerExpr(decl.value),
            inline: decl.inline,
            implicitTraitParams: implArity,
          },
        ];
      }),
  };
}

export class CompilationError extends Error {}

function getResolution<T>(node: { $resolution?: T | undefined }): T {
  if (node.$resolution === undefined) {
    throw new CompilationError("Undefined resolution");
  }
  return node.$resolution;
}

const listQualifiedName = new ir.QualifiedIdentifier(
  CORE_PACKAGE,
  "List",
  "List",
);

const NIL: ir.Expr = {
  type: "identifier",
  ident: {
    type: "constructor",
    typeName: listQualifiedName,
    name: "Nil",
  },
};

const CONS = (hd: ir.Expr, tl: ir.Expr): ir.Expr => ({
  type: "application",
  args: [hd, tl],
  caller: {
    type: "identifier",
    ident: {
      type: "constructor",
      name: "Cons",
      typeName: listQualifiedName,
    },
  },
});

/**
 * Traverse the type of a declaration to find the implicit arity (the trait dicts to pass)
 * */
function makeImplicitArity(
  decl: typed.TypedDeclaration,
  traitsBounds: RigidVarsCtx,
): ir.ImplicitParam[] {
  const alreadySeen = new Set<string>();

  const out: ir.ImplicitParam[] = [];

  function helper(type_: typed.Type) {
    const resolved = resolveType(type_);
    switch (resolved.type) {
      case "rigid-var":
        if (alreadySeen.has(resolved.name)) {
          return;
        }
        alreadySeen.add(resolved.name);

        for (const trait of traitsBounds[resolved.name] ?? []) {
          out.push({
            type: "var",
            id: resolved.name,
            trait,
          });
        }
        return;

      case "unbound":
        return;

      case "fn":
        for (const arg of resolved.args) {
          helper(arg);
        }
        helper(resolved.return);
        return;

      case "named":
        for (const arg of resolved.args) {
          helper(arg);
        }
        return;

      default:
        resolved satisfies never;
    }
  }

  helper(decl.binding.$type);

  return out;
}

/** we can assume proj modules don't have cycle deps (because of the typechecking phase) */
export class ProjectLowering {
  public readonly sortedVisited: ir.Program[] = [];
  private readonly visited = new Map<string, ir.Program>();
  private readonly knownImplicitArities = new Map<string, ir.ImplicitParam[]>();

  constructor(private readonly typedProject: TypedProject) {}

  visit(package_: string, moduleId: string): ir.Program {
    const cached = this.visited.get(moduleId);
    if (cached !== undefined) {
      return cached;
    }

    const module = nestedMapGetOrPutDefault(this.typedProject, moduleId).get(
      package_,
    );
    if (module === undefined) {
      throw new CompilationError(`Could not find module '${moduleId}'`);
    }

    const lowered = lowerProgram(
      module[0],
      this.knownImplicitArities,
      (dependencyNs) => this.visit(package_, dependencyNs),
    );

    this.sortedVisited.push(lowered);
    this.visited.set(moduleId, lowered);

    return lowered;
  }
}

function visitReferencedTypes(t: typed.Type, visit: (ns: string) => void) {
  const r = resolveType(t);
  switch (r.type) {
    case "unbound":
      return;

    case "named":
      visit(r.module);
      for (const arg of r.args) {
        visitReferencedTypes(arg, visit);
      }
      return;

    case "fn":
      for (const arg of r.args) {
        visitReferencedTypes(arg, visit);
      }
      visitReferencedTypes(r.return, visit);
      return;
  }
}
