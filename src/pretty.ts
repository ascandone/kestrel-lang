export type Mode = { type: "flat" } | { type: "break"; force: boolean };

export type Doc =
  | { type: "text"; text: string }
  | { type: "concat"; docs: Doc[] }
  | { type: "lines"; lines: number }
  | { type: "break"; unbroken: string }
  | { type: "nest"; doc: Doc }
  | { type: "group"; doc: Doc };

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

export function break_(unbroken: string): Doc {
  return { type: "break", unbroken };
}

export function group(...docs: Doc[]): Doc {
  return { type: "group", doc: concat(...docs) };
}

export function lines(lines = 0): Doc {
  return { type: "lines", lines };
}

export function nest(...docs: Doc[]): Doc {
  return concat(...docs.map((doc) => ({ type: "nest", doc }) satisfies Doc));
}

export type FormatOptions = {
  maxWidth: number;
  nestSize: number;
  indentationSymbol: string;
};

export const defaultFormatOptions: FormatOptions = {
  maxWidth: 80,
  indentationSymbol: " ",
  nestSize: 2,
};

export function pprint(
  doc: Doc,
  {
    // maxWidth = 80,
    indentationSymbol = " ",
    nestSize = 2,
  }: Partial<FormatOptions> = {},
) {
  const stack: Array<[number, Mode, Doc]> = [[0, { type: "flat" }, doc]];
  // TODO wrap doc in a group
  const buf: string[] = [];
  let width = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const popped = stack.pop();
    if (popped === undefined) {
      break;
    }
    const [indentation, mode, doc] = popped;
    switch (doc.type) {
      case "text":
        buf.push(doc.text);
        width += doc.text.length;
        break;

      case "lines":
        for (let i = 0; i < indentation; i++) {
          buf.push(indentationSymbol);
        }
        for (let i = 0; i < doc.lines + 1; i++) {
          buf.push("\n");
        }
        break;

      case "nest":
        stack.push([indentation + nestSize, mode, doc.doc]);
        break;

      case "concat":
        // TODO iter reverse
        for (const d of doc.docs) {
          stack.push([indentation, mode, d]);
        }
        break;

      case "break":
        switch (mode.type) {
          case "flat":
            buf.push(doc.unbroken);
            width += doc.unbroken.length;
            break;
          case "break":
            for (let i = 0; i < indentation; i++) {
              buf.push(indentationSymbol);
            }
            buf.push("\n");
            width = indentation;
            break;
        }
    }
  }

  buf.reverse();
  return buf.join("");
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
