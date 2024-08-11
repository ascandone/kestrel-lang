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
  severity: Severity;
  errorName: string;
  shortDescription(): string;
}

export class ParsingError implements ErrorDescription {
  constructor(public expecting: string) {}
  severity: Severity = "error";
  errorName = "Parsing error";
  shortDescription(): string {
    return this.expecting;
  }
}

export class InvalidPipe implements ErrorDescription {
  constructor() {}
  severity: Severity = "error";
  errorName = "Invalid pipe";
  shortDescription(): string {
    return "Pipe right side should be a function application";
  }
}

export class DuplicateDeclaration implements ErrorDescription {
  constructor(public ident: string) {}
  severity: Severity = "error";
  errorName = "Duplicate declaration";
  shortDescription() {
    return `"${this.ident}" was already defined`;
  }
}

export class UnboundVariable implements ErrorDescription {
  constructor(public ident: string) {}
  severity: Severity = "error";
  errorName = "Unbound variable";
  shortDescription() {
    return `Cannot find variable "${this.ident}"`;
  }
}

export class CyclicDefinition implements ErrorDescription {
  constructor(public ident: string) {}
  severity: Severity = "error";
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

  severity: Severity = "warning";

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

export class UnusedImport implements ErrorDescription {
  severity: Severity = "warning";
  errorName: string = "Unused import";
  constructor(public namespace: string) {}
  shortDescription(): string {
    return `Import is never used: ${this.namespace}`;
  }
}

export class UnusedExposing implements ErrorDescription {
  severity: Severity = "warning";
  errorName: string = "Unused import";
  constructor(public name: string) {}
  shortDescription(): string {
    return `Exposed value is never used: "${this.name}"`;
  }
}

export class UnboundType implements ErrorDescription {
  constructor(public ident: string) {}
  severity: Severity = "error";
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
  severity: Severity = "error";
  errorName = "Invalid type arity";
  shortDescription() {
    return `Wrong number of args for type "${this.type}". Expected ${this.expected} but got ${this.got} instead`;
  }
}

export class UnboundTypeParam implements ErrorDescription {
  constructor(public param: string) {}
  severity: Severity = "error";
  errorName = "Unbound type parameter";
  shortDescription() {
    return `Cannot find type parameter "${this.param}"`;
  }
}

export class InvalidCatchall implements ErrorDescription {
  errorName = "Invalid catchall";
  severity: Severity = "error";
  shortDescription() {
    return `Invalid use of the catchall type`;
  }
}

export class TypeParamShadowing implements ErrorDescription {
  constructor(public param: string) {}
  severity: Severity = "error";
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
  severity: Severity = "error";
  errorName = "Arity mismatch";
  shortDescription(): string {
    return `Expected ${this.expected} arguments, but got ${this.got}.`;
  }
}

export class UnboundModule implements ErrorDescription {
  constructor(public moduleName: string) {}
  severity: Severity = "error";
  errorName = "Unbound module";
  shortDescription(): string {
    return `Unbound module: "${this.moduleName}".`;
  }
}

export class UnimportedModule implements ErrorDescription {
  constructor(public moduleName: string) {}
  severity: Severity = "error";
  errorName = "Unimported module";
  shortDescription(): string {
    return `This module was not imported: "${this.moduleName}".`;
  }
}

export class NonExistingImport implements ErrorDescription {
  constructor(public name: string) {}
  severity: Severity = "error";
  errorName = "Non existing import";
  shortDescription(): string {
    return `The module does not expose the following value: ${this.name}`;
  }
}

export class BadImport implements ErrorDescription {
  errorName = "Bad import";
  severity: Severity = "error";
  shortDescription(): string {
    return `This type doesn't have constructors to expose`;
  }
}

export class OccursCheck implements ErrorDescription {
  errorName = "Occurs check";
  severity: Severity = "error";
  shortDescription(): string {
    return `Cannot construct the infinite type`;
  }
}

export class NonExhaustiveMatch implements ErrorDescription {
  severity: Severity = "error";
  errorName: string = "Non exhaustive match";
  shortDescription(): string {
    return "Match is not exhaustive";
  }
}

export class TraitNotSatified implements ErrorDescription {
  severity: Severity = "error";

  errorName: string = "Trait not satisfied";

  constructor(
    public readonly type: Type,
    public readonly trait: string,
  ) {}

  shortDescription(): string {
    const type = typeToString(this.type);
    return `Cannot satisfy trait ${this.trait} for type ${type}`;
  }
}

export class TypeMismatch implements ErrorDescription {
  constructor(
    public expected: Type,
    public got: Type,
  ) {}

  errorName = "Type mismatch";
  severity: Severity = "error";
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

export class InvalidField implements ErrorDescription {
  severity: Severity = "error";
  errorName: string = "Invalid field";

  constructor(
    public type: string,
    public field: string,
  ) {}

  shortDescription(): string {
    return `The field '${this.field}' does not exist on type '${this.type}'`;
  }
}

export class MissingRequiredFields implements ErrorDescription {
  severity: Severity = "error";
  errorName: string = "Missing required field";

  constructor(
    public type: string,
    public fields: string[],
  ) {}

  shortDescription(): string {
    if (this.fields.length === 1) {
      return `Missing field '${this.fields[0]}' (required on type '${this.type}')`;
    }

    const missingFields = this.fields.map((f) => `'${f}'`).join(", ");
    return `Missing the following fields: ${missingFields} (required on type '${this.type}')`;
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
