export type Mode = "unbroken" | "broken" | "forced-broken";

export type Doc =
  | { type: "text"; text: string }
  | { type: "concat"; docs: Doc[] }
  | { type: "lines"; lines: number }
  | { type: "break"; unbroken: string; broken?: string }
  | { type: "force-broken"; doc: Doc }
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
  return { type: "text", text: texts.join("") };
}

export function break_(unbroken: string = " ", broken?: string): Doc {
  return { type: "break", unbroken, broken };
}

export function broken(...docs: Doc[]): Doc {
  return { type: "force-broken", doc: concat(...docs) };
}

export function group(...docs: Doc[]): Doc {
  if (docs.length === 1) {
    return { type: "group", doc: docs[0]! };
  }

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

type DocStack = null | {
  mode: Mode;
  indentation: number;
  doc: Doc;
  tail: DocStack;
};

function fits(width: number, nestSize: number, docsStack: DocStack): boolean {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (docsStack === null) {
      return true;
    }
    const { mode, indentation, doc } = docsStack;
    docsStack = docsStack.tail;

    // eslint-disable-next-line no-inner-declarations
    function push(mode: Mode, indentation: number, doc: Doc) {
      docsStack = {
        indentation,
        mode,
        doc,
        tail: docsStack,
      };
    }

    if (width < 0) {
      return false;
    }

    switch (doc.type) {
      case "text":
        width -= doc.text.length;
        break;
      case "force-broken":
        return false;
      case "break":
        switch (mode) {
          case "unbroken":
            width -= doc.unbroken.length;
            break;
          case "broken":
            if (doc.broken !== undefined) {
              width -= doc.broken.length;
            }
          case "forced-broken":
            return true;
        }
        break;

      case "group":
        push("unbroken", indentation, doc.doc);
        break;

      case "concat":
        for (let i = doc.docs.length - 1; i >= 0; i--) {
          push(mode, indentation, doc.docs[i]!);
        }
        break;

      case "lines":
        return true;

      case "nest":
        push(mode, indentation + nestSize, doc.doc);
        break;
    }
  }
}

export function pprint(
  initialDoc: Doc,
  {
    maxWidth = 80,
    indentationSymbol = " ",
    nestSize = 2,
  }: Partial<FormatOptions> = {},
) {
  let docsStack: DocStack = {
    doc: { type: "group", doc: initialDoc },
    indentation: 0,
    mode: "unbroken",
    tail: null,
  };

  function push(mode: Mode, indentation: number, doc: Doc) {
    docsStack = {
      indentation,
      mode,
      doc,
      tail: docsStack,
    };
  }

  // TODO wrap doc in a group
  const buf: string[] = [];
  let width = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (docsStack === null) {
      return buf.join("");
    }
    const mode: Mode = docsStack.mode;
    const indentation: number = docsStack.indentation;
    const doc: Doc = docsStack.doc;
    docsStack = docsStack.tail;

    switch (doc.type) {
      case "text":
        buf.push(doc.text);
        width += doc.text.length;
        break;

      case "lines":
        for (let i = 0; i < doc.lines + 1; i++) {
          buf.push("\n");
        }
        for (let i = 0; i < indentation; i++) {
          buf.push(indentationSymbol);
        }
        width = indentation;
        break;

      case "nest":
        push(mode, indentation + nestSize, doc.doc);
        break;

      case "concat":
        for (let i = doc.docs.length - 1; i >= 0; i--) {
          push(mode, indentation, doc.docs[i]!);
        }
        break;

      case "break":
        switch (mode) {
          case "unbroken":
            buf.push(doc.unbroken);
            width += doc.unbroken.length;
            break;
          case "broken":
          case "forced-broken":
            if (doc.broken !== undefined) {
              buf.push(doc.broken);
            }
            buf.push("\n");
            for (let i = 0; i < indentation; i++) {
              buf.push(indentationSymbol);
            }
            width = indentation;
            break;
        }
        break;

      case "force-broken":
        push("forced-broken", indentation, doc.doc);
        break;

      case "group": {
        if (mode === "forced-broken") {
          push(mode, indentation, doc.doc);
          break;
        }

        const fit = fits(maxWidth - width, nestSize, {
          indentation,
          mode: "unbroken",
          doc,
          tail: docsStack,
        });

        push(fit ? "unbroken" : "broken", indentation, doc.doc);
        break;
      }
    }
  }
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
