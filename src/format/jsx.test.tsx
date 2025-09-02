/** @jsx jsx */
import { expect, test } from "vitest";
import { jsx } from "./jsx";
import { Doc } from "./pretty";

test("text", () => {
  expect(<text text="ciao" />).toEqual<Doc>({ type: "text", text: "ciao" });
});

test("concat", () => {
  expect(
    <concat>
      <text text="t1" />
      <text text="t2" />
    </concat>,
  ).toEqual<Doc>({
    type: "concat",
    docs: [
      { type: "text", text: "t1" },
      { type: "text", text: "t2" },
    ],
  });
});

test("next-break", () => {
  expect(
    <next-break-fits>
      <text text="t1" />
    </next-break-fits>,
  ).toEqual<Doc>({
    type: "next-break-fits",
    enabled: false,
    doc: { type: "text", text: "t1" },
  });
});

test("nest", () => {
  expect(
    <nest>
      <text text="t1" />
    </nest>,
  ).toEqual<Doc>({
    type: "nest",
    condition: "always",
    doc: { type: "text", text: "t1" },
  });
});

test("custom docs with props", () => {
  const MyDoc = (props: { text: string }) => <text text={props.text} />;

  expect(<MyDoc text="hi" />).toEqual<Doc>({
    type: "text",
    text: "hi",
  });
});

test("custom docs with children", () => {
  const MyDoc = (props: { children: Doc[] }) => (
    <concat>{props.children}</concat>
  );

  expect(
    <MyDoc>
      <text text="t1" />
      <text text="t2" />
    </MyDoc>,
  ).toEqual<Doc>({
    type: "concat",
    docs: [
      { type: "text", text: "t1" },
      { type: "text", text: "t2" },
    ],
  });
});
