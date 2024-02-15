import { Span } from "./parser";
import { Type, typePPrint } from "./typecheck";

export type Severity = "error" | "warning";

export type ErrorInfo = {
  span: Span;
  description: ErrorDescription;
};

export interface ErrorDescription {
  severity?: Severity;
  errorName: string;
  getDescription(): string;
}

export class ParsingError implements ErrorDescription {
  constructor(public expecting: string) {}
  errorName = "Parsing error";
  getDescription(): string {
    return this.expecting;
  }
}

export class UnboundVariable implements ErrorDescription {
  constructor(public ident: string) {}
  errorName = "Unbound variable";
  getDescription() {
    return `Cannot find variable "${this.ident}"`;
  }
}

export class UnusedVariable implements ErrorDescription {
  constructor(
    public ident: string,
    public type: "local" | "global",
  ) {}

  severity?: Severity = "warning";

  errorName = "Unused variable";
  getDescription() {
    const pre = `"${this.ident}" is declared but never used-.`;
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
  getDescription() {
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
  getDescription() {
    return `Wrong number of args for type "${this.type}". Expected ${this.expected} but got ${this.got} instead`;
  }
}

export class UnboundTypeParam implements ErrorDescription {
  constructor(public param: string) {}
  errorName = "Unbound type parameter";
  getDescription() {
    return `Cannot find type parameter "${this.param}"`;
  }
}

export class InvalidCatchall implements ErrorDescription {
  errorName = "Invalid catchall";
  getDescription() {
    return `Invalid use of the catchall type`;
  }
}

export class TypeParamShadowing implements ErrorDescription {
  constructor(public param: string) {}
  errorName = "Type parameter shadowing";
  getDescription(): string {
    return `Cannot redeclare type parameter ${this.param}`;
  }
}

export class ArityMismatch implements ErrorDescription {
  constructor(
    public expected: number,
    public got: number,
  ) {}
  errorName = "Arity mismatch";
  getDescription(): string {
    return `Expected ${this.expected} arguments, but got ${this.got}.`;
  }
}

export class UnboundModule implements ErrorDescription {
  constructor(public moduleName: string) {}
  errorName = "Unbound module";
  getDescription(): string {
    return `Unbound module: "${this.moduleName}".`;
  }
}

export class UnimportedModule implements ErrorDescription {
  constructor(public moduleName: string) {}
  errorName = "Unimported module";
  getDescription(): string {
    return `This module was not imported: "${this.moduleName}".`;
  }
}

export class NonExistingImport implements ErrorDescription {
  constructor(public name: string) {}
  errorName = "Non existing import";
  getDescription(): string {
    return `The module does not expose the following value: ${this.name}`;
  }
}

export class BadImport implements ErrorDescription {
  errorName = "Bad import";
  getDescription(): string {
    return `This type doesn't have constructors to expose`;
  }
}

export class OccursCheck implements ErrorDescription {
  errorName = "Occurs check";
  getDescription(): string {
    return `Cannot construct the infinite type`;
  }
}

export class TypeMismatch implements ErrorDescription {
  constructor(
    public expected: Type,
    public got: Type,
  ) {}

  errorName = "Type mismatch";
  getDescription(): string {
    const expected = typePPrint(this.expected);
    const got = typePPrint(this.got);
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
