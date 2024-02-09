export type Doc =
  | { type: "text"; text: string }
  | { type: "concat"; docs: Doc[] }
  | { type: "line-break"; lines: number }
  | { type: "nest"; doc: Doc };

export function concat(...docs: Doc[]): Doc {
  if (docs.length === 1) {
    return docs[0]!;
  }
  return { type: "concat", docs };
}

export function text(...texts: string[]): Doc {
  return concat(...texts.map((text) => ({ type: "text", text }) satisfies Doc));
}

export function break_(lines = 1): Doc {
  return { type: "line-break", lines };
}

export function nest(...docs: Doc[]): Doc {
  return concat(...docs.map((doc) => ({ type: "nest", doc }) satisfies Doc));
}

export type FormatOptions = {
  // maxW: number;
  nestSize: number;
  indentationSymbol: string;
};

export function format(
  doc: Doc,
  { nestSize = 2, indentationSymbol = " " }: Partial<FormatOptions> = {},
): string {
  // TODO wrap doc in a group
  const buf: string[] = [];
  const vec: Array<[number, Doc]> = [[0, doc]];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const popped = vec.pop();
    if (popped === undefined) {
      break;
    }
    const [indentation, doc] = popped;
    switch (doc.type) {
      case "text":
        buf.push(doc.text);
        // TODO update size
        break;

      case "line-break":
        for (let i = 0; i < indentation; i++) {
          buf.push(indentationSymbol);
        }
        for (let i = 0; i < doc.lines; i++) {
          buf.push("\n");
        }
        break;

      case "nest":
        vec.push([indentation + nestSize, doc.doc]);
        break;

      case "concat":
        for (const d of doc.docs) {
          vec.push([indentation, d]);
        }
        break;
    }
  }

  buf.reverse();
  return buf.join("");
}
