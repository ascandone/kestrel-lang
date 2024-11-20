export type Mode = "unbroken" | "broken" | "forced-broken" | "forced-unbroken";

export type NestCondition = "always" | "when-broken";

export type Doc =
  | { type: "text"; text: string }
  | { type: "concat"; docs: Doc[] }
  | { type: "lines"; lines: number }
  | {
      type: "break";
      unbroken: string;
      beforeBreak?: string;
      afterBreak?: string;
      flex: boolean;
    }
  | { type: "force-broken"; doc: Doc }
  | { type: "next-break-fits"; doc: Doc; enabled: boolean }
  | { type: "nest"; doc: Doc; condition: NestCondition }
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

export function break_(
  unbroken: string = " ",
  beforeBreak?: string,
  afterBreak?: string,
): Doc {
  return {
    type: "break",
    unbroken,
    beforeBreak,
    afterBreak,
    flex: false,
  };
}

export function flexBreak(unbroken: string = " ", broken?: string): Doc {
  return { type: "break", unbroken, beforeBreak: broken, flex: true };
}

export function nextBreakFits(doc: Doc, enabled = true): Doc {
  return { type: "next-break-fits", doc, enabled };
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
  return concat(
    ...docs.map(
      (doc) => ({ type: "nest", doc, condition: "always" }) satisfies Doc,
    ),
  );
}

export function nestOnBreak(...docs: Doc[]): Doc {
  return concat(
    ...docs.map(
      (doc) => ({ type: "nest", doc, condition: "when-broken" }) satisfies Doc,
    ),
  );
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
  while (width >= 0) {
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

    switch (doc.type) {
      case "text":
        width -= doc.text.length;
        break;
      case "force-broken":
        if (mode === "forced-broken") {
          push(mode, indentation, doc.doc);
          break;
        }
        return false;

      case "next-break-fits":
        if (!doc.enabled) {
          push("forced-unbroken", indentation, doc.doc);
        } else if (mode === "forced-unbroken") {
          push(mode, indentation, doc.doc);
        } else {
          push("forced-broken", indentation, doc.doc);
        }
        break;

      case "break":
        switch (mode) {
          case "broken":
          case "forced-broken":
            return true;
          case "unbroken":
          case "forced-unbroken":
            width -= doc.unbroken.length;
            break;
        }
        break;

      case "group":
        push(mode === "broken" ? "unbroken" : mode, indentation, doc.doc);
        break;

      case "concat":
        for (let i = doc.docs.length - 1; i >= 0; i--) {
          push(mode, indentation, doc.docs[i]!);
        }
        break;

      case "lines":
        break;

      case "nest": {
        let newIndentation;
        switch (doc.condition) {
          case "always":
            newIndentation = indentation + nestSize;
          case "when-broken":
            newIndentation = indentation;
        }
        push(mode, newIndentation, doc.doc);
        break;
      }
    }
  }

  return false;
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

  function pushText(text: string | undefined) {
    if (text === undefined) {
      return;
    }

    buf.push(text);
    width += text.length;
  }

  function pushNewlines(lines: number, indentation: number) {
    for (let i = 0; i < lines; i++) {
      buf.push("\n");
    }
    for (let i = 0; i < indentation; i++) {
      buf.push(indentationSymbol);
    }
    width = indentation;
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (docsStack === null) {
      return buf.join("");
    }

    const { mode, indentation, doc } = docsStack;
    docsStack = docsStack.tail;

    switch (doc.type) {
      case "text":
        pushText(doc.text);
        break;

      case "lines":
        pushNewlines(doc.lines + 1, indentation);
        break;

      case "nest": {
        const addedSize =
          doc.condition === "always" ||
          (doc.condition === "when-broken" && mode === "broken")
            ? nestSize
            : 0;
        push(mode, indentation + addedSize, doc.doc);
        break;
      }

      case "concat":
        for (let i = doc.docs.length - 1; i >= 0; i--) {
          push(mode, indentation, doc.docs[i]!);
        }
        break;

      case "break":
        if (doc.flex) {
          const unbrokenWidth = width + doc.unbroken.length;
          if (
            mode === "unbroken" ||
            fits(maxWidth - unbrokenWidth, nestSize, docsStack)
          ) {
            buf.push(doc.unbroken);
            width = unbrokenWidth;
          } else {
            pushText(doc.beforeBreak);
            pushNewlines(1, indentation);
            pushText(doc.afterBreak);
          }
          break;
        }

        switch (mode) {
          case "unbroken":
          case "forced-unbroken":
            pushText(doc.unbroken);
            break;
          case "broken":
          case "forced-broken":
            pushText(doc.beforeBreak);
            pushNewlines(1, indentation);
            pushText(doc.afterBreak);
            break;
        }
        break;

      case "force-broken":
      case "next-break-fits":
        push(mode, indentation, doc.doc);
        break;

      case "group": {
        if (mode === "forced-broken") {
          throw new Error("[unreachable]");
        }

        const fit = fits(maxWidth - width, nestSize, {
          indentation,
          mode: "unbroken",
          doc,
          tail: null,
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
