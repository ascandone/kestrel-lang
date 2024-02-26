import { showErrorLine } from "./errors/showErrorLine";
import { Span } from "./parser";
import { Type, typeToString } from "./typecheck";
import { col, withDisabled } from "./utils/colors";

export type Severity = "error" | "warning";

export type ErrorInfo = {
  span: Span;
  description: ErrorDescription;
};

export interface ErrorDescription {
  severity?: Severity;
  errorName: string;
  shortDescription(): string;
}

export class ParsingError implements ErrorDescription {
  constructor(public expecting: string) {}
  errorName = "Parsing error";
  shortDescription(): string {
    return this.expecting;
  }
}

export class InvalidPipe implements ErrorDescription {
  constructor() {}
  errorName = "Invalid pipe";
  shortDescription(): string {
    return "Pipe right side should be a function application";
  }
}

export class DuplicateDeclaration implements ErrorDescription {
  constructor(public ident: string) {}
  errorName = "Duplicate declaration";
  shortDescription() {
    return `"${this.ident}" was already defined`;
  }
}

export class UnboundVariable implements ErrorDescription {
  constructor(public ident: string) {}
  errorName = "Unbound variable";
  shortDescription() {
    return `Cannot find variable "${this.ident}"`;
  }
}

export class CyclicDefinition implements ErrorDescription {
  constructor(public ident: string) {}
  errorName = "Cyclic definition";
  // TODO better error
  shortDescription() {
    return `Cyclic definition`;
  }
}

export class UnusedVariable implements ErrorDescription {
  constructor(
    public ident: string,
    public type: "local" | "global",
  ) {}

  severity?: Severity = "warning";

  errorName = "Unused variable";
  shortDescription() {
    const pre = `"${this.ident}" is declared but never used.`;
    switch (this.type) {
      case "local":
        return `${pre}\nTry to rename it to "_${this.ident}"`;
      case "global":
        return `${pre}\nTry to add a \`pub\` modifier`;
    }
  }
}

export class UnboundType implements ErrorDescription {
  constructor(public ident: string) {}
  errorName = "Unbound type";
  shortDescription() {
    return `Cannot find type "${this.ident}"`;
  }
}

export class InvalidTypeArity implements ErrorDescription {
  constructor(
    public type: string,
    public expected: number,
    public got: number,
  ) {}
  errorName = "Invalid type arity";
  shortDescription() {
    return `Wrong number of args for type "${this.type}". Expected ${this.expected} but got ${this.got} instead`;
  }
}

export class UnboundTypeParam implements ErrorDescription {
  constructor(public param: string) {}
  errorName = "Unbound type parameter";
  shortDescription() {
    return `Cannot find type parameter "${this.param}"`;
  }
}

export class InvalidCatchall implements ErrorDescription {
  errorName = "Invalid catchall";
  shortDescription() {
    return `Invalid use of the catchall type`;
  }
}

export class TypeParamShadowing implements ErrorDescription {
  constructor(public param: string) {}
  errorName = "Type parameter shadowing";
  shortDescription(): string {
    return `Cannot redeclare type parameter ${this.param}`;
  }
}

export class ArityMismatch implements ErrorDescription {
  constructor(
    public expected: number,
    public got: number,
  ) {}
  errorName = "Arity mismatch";
  shortDescription(): string {
    return `Expected ${this.expected} arguments, but got ${this.got}.`;
  }
}

export class UnboundModule implements ErrorDescription {
  constructor(public moduleName: string) {}
  errorName = "Unbound module";
  shortDescription(): string {
    return `Unbound module: "${this.moduleName}".`;
  }
}

export class UnimportedModule implements ErrorDescription {
  constructor(public moduleName: string) {}
  errorName = "Unimported module";
  shortDescription(): string {
    return `This module was not imported: "${this.moduleName}".`;
  }
}

export class NonExistingImport implements ErrorDescription {
  constructor(public name: string) {}
  errorName = "Non existing import";
  shortDescription(): string {
    return `The module does not expose the following value: ${this.name}`;
  }
}

export class BadImport implements ErrorDescription {
  errorName = "Bad import";
  shortDescription(): string {
    return `This type doesn't have constructors to expose`;
  }
}

export class OccursCheck implements ErrorDescription {
  errorName = "Occurs check";
  shortDescription(): string {
    return `Cannot construct the infinite type`;
  }
}

export class TypeMismatch implements ErrorDescription {
  constructor(
    public expected: Type,
    public got: Type,
  ) {}

  errorName = "Type mismatch";
  shortDescription(): string {
    const expected = typeToString(this.expected);
    const got = typeToString(this.got);
    const qualify = expected === got;

    const nsLeft =
      qualify && this.expected.type === "named"
        ? `${this.expected.moduleName}.`
        : "";

    const nsRight =
      qualify && this.got.type === "named" ? `${this.got.moduleName}.` : "";

    return `Expected:  ${nsLeft}${expected}
     Got:  ${nsRight}${got}
`;
  }
}

export function errorInfoToString(
  src: string,
  { description, span }: ErrorInfo,
  disableColors: boolean = false,
): string {
  return withDisabled(disableColors, () => {
    const sev = description.severity ?? "error";
    const errType =
      sev === "error" ? col.red.tag`Error:` : col.yellow.tag`Warning:`;

    return `${errType} ${col.bright.str(description.errorName)}

${description.shortDescription()}

${showErrorLine(src, span)}`;
  });
}
