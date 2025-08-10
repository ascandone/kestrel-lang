import * as ir from "../ir";
import { SExpr, SymbolAtom, sym } from "./sexpr";

export function programToSexpr(program: ir.Program): SExpr[] {
  // TODO also show other values (types, etc)
  return program.values.map((decl) => {
    const e = new ExprPrinter(
      program.package_,
      program.namespace,
      decl.name,
    ).toSexpr(decl.value);
    return [sym`:def`, { type: "symbol", value: decl.name }, e];
  });
}

class ExprPrinter {
  constructor(
    private readonly package_: string,
    private readonly module: string,
    private readonly declaration: string,
  ) {}

  public toSexpr(expr: ir.Expr): SExpr {
    switch (expr.type) {
      case "constant":
        return expr.value;

      case "identifier": {
        return {
          type: "symbol",
          value: this.identifier(expr.ident),
        };
      }

      case "application":
        return [
          this.toSexpr(expr.caller),
          ...expr.args.map((e) => this.toSexpr(e)),
        ];

      case "fn":
        return [
          sym`:fn`,
          expr.bindings.map(
            (value): SymbolAtom => ({
              type: "symbol",
              value: this.identifier(value),
            }),
          ),
          this.toSexpr(expr.body),
        ];

      case "let":
        return [
          sym`:let`,
          [
            { type: "symbol", value: this.localIdent(expr.binding) },
            this.toSexpr(expr.value),
          ],
          this.toSexpr(expr.body),
        ];

      case "if":
        return [
          sym`:if`,
          this.toSexpr(expr.condition),
          this.toSexpr(expr.then),
          this.toSexpr(expr.else),
        ];

      case "struct-literal":
        return [
          sym`:struct`,
          {
            type: "symbol",
            value: this.glbIdent({ type: "global", name: expr.struct }),
          },
          ...expr.fields.map((field): SExpr[] => [
            { type: "symbol", value: field.name },
            this.toSexpr(field.expr),
          ]),

          ...(expr.spread === undefined
            ? []
            : [[sym`:spread`, this.toSexpr(expr.spread)]]),
        ];

      case "field-access":
        return [
          {
            type: "symbol",
            value: "." + expr.field.name,
          },
          this.toSexpr(expr.struct),
        ];

      case "match":
        throw new Error("TODO toSexpr of " + expr.type);
    }
  }

  /**
   * e.g. `pkg:Main.x`
   *
   * package is not shown if the current package is the same as the package's, e.g. `Main.x`
   *
   * module is not shown if the current module is the same as the module's, e.g. `x`
   */
  private glbIdent(ident: ir.Ident & { type: "global" }): string {
    if (ident.name.package_ !== this.package_) {
      return `${ident.name.package_}:${ident.name.namespace}.${ident.name.name}`;
    }

    if (ident.name.namespace !== this.module) {
      return `${ident.name.namespace}.${ident.name.name}`;
    }

    return ident.name.name;
  }

  /**
   * e.g. `pkg:Main.glb:x#0`
   *
   * package is not shown if the curret package is the same as the package's, e.g. `Main.glb:x#0`
   *
   * module is not shown if the current module is the same as the module's, e.g. `glb:x#0`
   *
   * if the variable is withing the it's declaration qualifier, that isn't show either, e.g. `x#0`
   */
  private localIdent(ident: ir.Ident & { type: "local" }): string {
    const qualifier = this.glbIdent({
      type: "global",
      name: ident.declaration,
    });

    const local = `${ident.name}#${ident.unique}`;

    if (
      ident.declaration.package_ !== this.package_ ||
      ident.declaration.namespace !== this.module ||
      ident.declaration.name !== this.declaration
    ) {
      return `${qualifier}:${local}`;
    }

    return local;
  }

  private identifier(ident: ir.Ident): string {
    switch (ident.type) {
      case "constructor":
        throw new Error("TODO constructor");

      case "global":
        return this.glbIdent(ident);

      case "local":
        return this.localIdent(ident);
    }
  }
}
