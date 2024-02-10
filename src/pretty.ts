export type Doc =
  | { type: "text"; text: string }
  | { type: "concat"; docs: Doc[] }
  | { type: "lines"; lines: number }
  | { type: "nest"; doc: Doc };

export const nil = concat();

export function concat(...docs: Doc[]): Doc {
  if (docs.length === 1) {
    return docs[0]!;
  }
  return { type: "concat", docs };
}

export function text(...texts: string[]): Doc {
  return concat(...texts.map((text) => ({ type: "text", text }) satisfies Doc));
}

export function lines(lines = 0): Doc {
  return { type: "lines", lines };
}

export function nest(...docs: Doc[]): Doc {
  return concat(...docs.map((doc) => ({ type: "nest", doc }) satisfies Doc));
}

export type FormatOptions = {
  // maxW: number;
  nestSize: number;
  indentationSymbol: string;
};

class PPrint {
  private stack: Array<[number, Doc]>;

  constructor(
    doc: Doc,
    private readonly options: FormatOptions,
  ) {
    this.stack = [[0, doc]];
  }

  format() {
    // TODO wrap doc in a group
    const buf: string[] = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const popped = this.stack.pop();
      if (popped === undefined) {
        break;
      }
      const [indentation, doc] = popped;
      switch (doc.type) {
        case "text":
          buf.push(doc.text);
          // TODO update size
          break;

        case "lines":
          for (let i = 0; i < indentation; i++) {
            buf.push(this.options.indentationSymbol);
          }
          for (let i = 0; i < doc.lines + 1; i++) {
            buf.push("\n");
          }
          break;

        case "nest":
          this.stack.push([indentation + this.options.nestSize, doc.doc]);
          break;

        case "concat":
          for (const d of doc.docs) {
            this.stack.push([indentation, d]);
          }
          break;
      }
    }

    buf.reverse();
    return buf.join("");
  }
}

export function pprint(doc: Doc, opt: Partial<FormatOptions> = {}): string {
  const pprint = new PPrint(doc, {
    nestSize: opt.nestSize ?? 2,
    indentationSymbol: opt.indentationSymbol ?? " ",
  });

  return pprint.format();
}

export function sepByString(sep: string, docs: Doc[]): Doc {
  return sepBy(text(sep), docs);
}

export function sepBy(sep: Doc, docs: Doc[]): Doc {
  return {
    type: "concat",
    docs: docs.flatMap((doc, index) => {
      const isLast = index === docs.length - 1;
      return [doc, isLast ? nil : sep];
    }),
  };
}
