import { Span, UntypedImport } from "../parser";

const dummySpan: Span = [0, 0];

export const defaultImports: UntypedImport[] = [
  {
    span: dummySpan,
    ns: "Int",
    exposing: [
      { type: "type", name: "Int", exposeImpl: false, span: dummySpan },
      { type: "value", name: "+", span: dummySpan },
      { type: "value", name: "-", span: dummySpan },
      { type: "value", name: "*", span: dummySpan },
      { type: "value", name: "/", span: dummySpan },
      { type: "value", name: "^", span: dummySpan },
      { type: "value", name: "%", span: dummySpan },
    ],
  },
  {
    span: dummySpan,
    ns: "Float",
    exposing: [
      { type: "type", name: "Float", exposeImpl: false, span: dummySpan },
      { type: "value", name: "+.", span: dummySpan },
      { type: "value", name: "-.", span: dummySpan },
      { type: "value", name: "*.", span: dummySpan },
      { type: "value", name: "/.", span: dummySpan },
    ],
  },
  {
    span: dummySpan,
    ns: "Bool",
    exposing: [
      { type: "type", name: "Bool", exposeImpl: true, span: dummySpan },
      { type: "value", name: "&&", span: dummySpan },
      { type: "value", name: "||", span: dummySpan },
      { type: "value", name: "!", span: dummySpan },

      // Comparasion operators
      { type: "value", name: "==", span: dummySpan },
      { type: "value", name: "!=", span: dummySpan },
      { type: "value", name: ">", span: dummySpan },
      { type: "value", name: "<", span: dummySpan },
      { type: "value", name: ">=", span: dummySpan },
      { type: "value", name: "<=", span: dummySpan },
    ],
  },
  {
    span: dummySpan,
    ns: "Char",
    exposing: [
      { type: "type", name: "Char", exposeImpl: false, span: dummySpan },
    ],
  },
  {
    span: dummySpan,
    ns: "String",
    exposing: [
      { type: "type", name: "String", exposeImpl: false, span: dummySpan },
      { type: "value", name: "++", span: dummySpan },
    ],
  },
  {
    span: dummySpan,
    ns: "Option",
    exposing: [
      { type: "type", name: "Option", exposeImpl: true, span: dummySpan },
    ],
  },
  {
    span: dummySpan,
    ns: "Result",
    exposing: [
      { type: "type", name: "Result", exposeImpl: true, span: dummySpan },
    ],
  },
  {
    span: dummySpan,
    ns: "Tuple",
    exposing: [
      { type: "type", name: "Unit", exposeImpl: true, span: dummySpan },
      { type: "type", name: "Tuple2", exposeImpl: true, span: dummySpan },
      { type: "type", name: "Tuple3", exposeImpl: true, span: dummySpan },
      { type: "type", name: "Tuple4", exposeImpl: true, span: dummySpan },
    ],
  },
  {
    span: dummySpan,
    ns: "List",
    exposing: [
      { type: "type", name: "List", exposeImpl: true, span: dummySpan },
    ],
  },
  {
    span: dummySpan,
    ns: "Task",
    exposing: [
      { type: "type", name: "Task", exposeImpl: false, span: dummySpan },
    ],
  },
];
