import { constToDoc } from "../../format";
import {
  Doc,
  break_,
  broken,
  concat,
  group,
  lines,
  nest,
  nestOnBreak,
  nextBreakFits,
  pprint,
  sepBy,
  sepByString,
  text,
} from "../../format/pretty";
import * as ir from "../ir";

export class ExprPrinter {
  constructor(
    private readonly declaration: string = "glb",
    private readonly package_: string = "pkg",
    private readonly module: string = "Main",
  ) {}

  public identToString(ident: ir.Ident) {
    switch (ident.type) {
      case "local":
        return this.localIdent(ident);
      case "global":
        return this.glbIdent(ident);
      case "constructor":
        return this.ctor(ident);
    }
  }

  public exprToDoc(expr: ir.Expr): Doc {
    switch (expr.type) {
      case "constant":
        return constToDoc(expr.value);

      case "identifier":
        return text(this.identToString(expr.ident));

      case "application": {
        if (expr.args.length === 0) {
          return concat(this.exprToDoc(expr.caller), text("()"));
        }

        return nextBreakFits(
          group(
            this.exprToDoc(expr.caller),
            text("("),
            nestOnBreak(
              break_(""),
              sepBy(
                concat(text(","), break_()),
                expr.args.map((arg, index, arr) => {
                  const isLast = index === arr.length - 1;
                  const inner = this.exprToDoc(arg);
                  if (isLast) {
                    return nextBreakFits(group(inner));
                  } else {
                    return inner;
                  }
                }),
              ),
            ),
            break_("", ","),
            text(")"),
          ),
          false,
        );
      }
      case "fn": {
        const params = expr.bindings.map((p) =>
          concat(text(" "), text(this.localIdent(p))),
        );

        return concat(
          text("fn"),
          sepByString(",", params),
          text(" "),
          block_(this.exprToDoc(expr.body)),
        );
      }

      case "match": {
        const clauses = expr.clauses.map(([pattern, expr]) =>
          concat(
            this.patternToDoc(pattern),
            text(" => "),
            this.exprToDoc(expr),
          ),
        );

        return concat(
          text("match "),
          this.exprToDoc(expr.expr),
          text(" "),
          clauses.length === 0
            ? text("{ }")
            : block_(
                sepBy(
                  break_("", ""),
                  clauses.map((clause) => concat(clause, text(","))),
                ),
              ),
        );
      }

      case "field-access":
        return concat(
          this.exprToDoc(expr.struct),
          text("."),
          text(expr.field.name),
        );

      case "struct-literal": {
        const fieldLines = expr.fields.map((field) => {
          return concat(
            text(`${field.name}: `),
            this.exprToDoc(field.expr),
            text(`,`),
          );
        });
        if (expr.spread !== undefined) {
          fieldLines.push(
            //
            concat(text(".."), this.exprToDoc(expr.spread)),
          );
        }
        const fields = sepBy(break_(), fieldLines);
        return concat(
          //
          text(expr.struct.name),
          text(" "),
          fieldLines.length === 0 ? text("{ }") : block_(fields),
        );
      }
    }
  }

  /**
   * e.g. `pkg:Main.Box`
   *
   * package is not shown if the current package is the same as the package's, e.g. `Main.Box`
   *
   * module is not shown if the current module is the same as the module's, e.g. `Box`
   */
  private ctor(ident: ir.Ident & { type: "constructor" }): string {
    if (ident.typeName.package_ !== this.package_) {
      return `${ident.typeName.package_}:${ident.typeName.namespace}.${ident.name}`;
    }

    if (ident.typeName.namespace !== this.module) {
      return `${ident.typeName.namespace}.${ident.name}`;
    }

    return ident.name;
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

  private patternToDoc(pattern: ir.MatchPattern): Doc {
    switch (pattern.type) {
      case "identifier":
        return text(this.identToString(pattern.ident));

      case "lit":
        return constToDoc(pattern.literal);

      case "constructor": {
        if (pattern.name === "Cons" && pattern.args.length === 2) {
          const left = pattern.args[0]!;
          const right = pattern.args[1]!;
          return concat(
            this.patternToDoc(left),
            text(" :: "),
            this.patternToDoc(right),
          );
        }

        if (pattern.args.length === 0) {
          return text(pattern.name);
        }

        return concat(
          text(
            // pattern.namespace === undefined ? "" : `${pattern.namespace}.`,
            pattern.name,
          ),
          text("("),
          sepByString(
            ", ",
            pattern.args.map((p) => this.patternToDoc(p)),
          ),
          text(")"),
        );
      }
    }
  }
}

export function formatIR(program: ir.Program): string {
  const declrs = program.values.map((decl) => {
    const exprDoc = new ExprPrinter(
      decl.name.name,
      decl.name.package_,
      decl.name.namespace,
    ).exprToDoc(decl.value);
    return concat(
      text(
        `let ${decl.name.package_}:${decl.name.namespace}.${decl.name.name} = `,
      ),
      exprDoc,
    );
  });

  return pprint(sepBy(lines(1), declrs));
}

export function formatIRExpr(expr: ir.Expr) {
  return pprint(new ExprPrinter().exprToDoc(expr));
}

function block_(...docs: Doc[]): Doc {
  return group(
    //
    text("{"),
    broken(nest(break_(), ...docs)),
    break_(""),
    text("}"),
  );
}
