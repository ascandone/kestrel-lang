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
  nil,
  pprint,
  sepBy,
  sepByString,
  text,
} from "../../format/pretty";
import * as ir from "../ir";

type LetSugar = {
  type: "let";
  clauses: Array<{
    binding: ir.Ident & { type: "local" };
    value: ir.Expr;
  }>;
  body: ir.Expr;
};

function tryWrappingLet(expr: ir.Expr): ir.Expr | LetSugar {
  if (expr.type !== "match" || expr.clauses.length !== 1) {
    return expr;
  }

  const [pat, body] = expr.clauses[0]!;
  if (pat.type !== "identifier") {
    return expr;
  }

  const clause = { binding: pat.ident, value: expr.expr } as const;
  const inner = tryWrappingLet(body);
  if (inner.type === "let") {
    return {
      type: "let",
      clauses: [clause, ...inner.clauses],
      body: inner.body,
    };
  }

  return {
    type: "let",
    clauses: [clause],
    body,
  };
}

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

  public exprToDoc(expr_: ir.Expr, withinBlock = false): Doc {
    const expr = tryWrappingLet(expr_);

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
          block_(this.exprToDoc(expr.body, true)),
        );
      }

      case "let": {
        const block__ = withinBlock ? concat : block_;

        return block__(
          sepBy(
            break_("", ""),
            expr.clauses.map((clause) =>
              concat(
                text("let ", this.identToString(clause.binding), " = "),
                this.exprToDoc(clause.value),
                text(";"),
              ),
            ),
          ),
          break_(),
          this.exprToDoc(expr.body),
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

  private baseIdent(ident: ir.QualifiedIdentifier): string {
    if (ident.package_ !== this.package_) {
      return `${ident.package_}:${ident.namespace}.${ident.name}`;
    }

    if (ident.namespace !== this.module) {
      return `${ident.namespace}.${ident.name}`;
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
    const id = this.baseIdent(ident.name);
    if (ident.implicitly.length === 0) {
      return id;
    }

    const args = ident.implicitly.map(implicitArgToString).join(", ");
    return `${id}[${args}]`;
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
    const qualifier = this.baseIdent(ident.declaration);

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
        if (pattern.args.length === 0) {
          return text(pattern.name);
        }

        return concat(
          text(pattern.name),
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

function formatImplicitArgs(arg: ir.ImplicitTraitArg[]) {
  if (arg.length === 0) {
    return nil;
  }

  return concat(
    text("["),
    sepByString(
      ", ",
      arg.map((a) => text(implicitArgToString(a))),
    ),
    text("]"),
  );
}

const implicitArgToString = (i: ir.ImplicitTraitArg): string => {
  switch (i.type) {
    case "resolved": {
      const main = `${i.typeName.name}:${i.trait}`;
      if (i.args.length === 0) {
        return main;
      }

      const args = i.args.map(implicitArgToString).join(", ");

      return `${main}(${args})`;
    }
    case "var":
      return `${i.id}:${i.trait}`;
  }
};

function formatDecl(decl: ir.ValueDeclaration) {
  const exprDoc = new ExprPrinter(
    decl.name.name,
    decl.name.package_,
    decl.name.namespace,
  ).exprToDoc(decl.value);
  return concat(
    text(`let ${decl.name.package_}:${decl.name.namespace}.${decl.name.name}`),
    formatImplicitArgs(decl.implicitTraitParams),
    text(" = "),

    exprDoc,
  );
}

export function formatIR(program: ir.Program): string {
  const declrs = program.values.map(formatDecl);
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
