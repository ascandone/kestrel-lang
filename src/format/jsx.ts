import { type Doc, type NestCondition } from "./pretty";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace JSX {
    export type Element = Doc;

    export interface ElementChildrenAttribute {
      children: object;
    }

    export interface IntrinsicElements {
      text: { text: string };
      concat: { children: Doc[] };
      lines: { lines: number };
      break: {
        unbroken: string;
        beforeBreak?: string;
        afterBreak?: string;
        flex?: boolean;
      };
      "force-broken": { children: Doc | Doc[] };
      "next-break-fits": { children: Doc | Doc[]; enabled?: boolean };
      nest: { children: Doc | Doc[]; condition?: NestCondition };
      group: { children: Doc | Doc[] };
    }
  }
}

function asDoc(docs: Doc[]): Doc {
  if (docs.length === 1) {
    return docs[0]!;
  }
  return { type: "concat", docs };
}

export type Component = <T>(props: T) => Doc;

export function jsx(
  type_: keyof JSX.IntrinsicElements | Component,
  props: JSX.IntrinsicElements[keyof JSX.IntrinsicElements] | object,
  ...children: Doc[]
): Doc {
  switch (type_) {
    case "text": {
      const props_ = props as JSX.IntrinsicElements["text"];
      return {
        type: "text",
        text: props_.text,
      };
    }

    case "concat":
      return {
        type: "concat",
        docs: children.flat(),
      };

    case "lines": {
      const props_ = props as JSX.IntrinsicElements["lines"];
      return { type: "lines", lines: props_.lines };
    }

    case "break": {
      const props_ = props as JSX.IntrinsicElements["break"];
      return {
        type: "break",
        flex: props_.flex ?? false,
        unbroken: props_.unbroken,
        afterBreak: props_.afterBreak,
        beforeBreak: props_.beforeBreak,
      };
    }

    case "group":
      return { type: "group", doc: asDoc(children) };

    case "force-broken":
      return { type: "force-broken", doc: asDoc(children) };

    case "next-break-fits": {
      const props_ = (props as JSX.IntrinsicElements["next-break-fits"]) ?? {};
      return {
        type: "next-break-fits",
        doc: asDoc(children),
        enabled: props_.enabled ?? false,
      };
    }

    case "nest": {
      const props_ = (props as JSX.IntrinsicElements["nest"]) ?? {};
      return {
        type: "nest",
        doc: asDoc(children),
        condition: props_.condition ?? "always",
      };
    }

    default:
      return type_({ ...(props ?? {}), children: children });
  }
}
