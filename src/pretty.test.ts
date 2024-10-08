import { test, expect, describe } from "vitest";
import {
  lines,
  concat,
  pprint,
  nest,
  text,
  break_,
  broken,
  group,
  flexBreak,
  nextBreakFits,
  nestOnBreak,
} from "./pretty";

test("renders plain text", () => {
  expect(pprint(text("Hello"))).toBe(`Hello`);
});

test("renders seq of text", () => {
  expect(
    pprint(
      //
      text("abc", "cde"),
    ),
  ).toBe(`abccde`);
});

test("singleton concat", () => {
  expect(
    pprint(
      //
      { type: "concat", docs: [text("abc")] },
    ),
  ).toBe(`abc`);
});

test("renders break", () => {
  expect(
    pprint(
      concat(
        //
        text("ab"),
        lines(),
        text("cd"),
      ),
    ),
  ).toBe(`ab\ncd`);
});

test("does not render indentation", () => {
  expect(
    pprint(
      group(
        broken(
          nest(
            //

            text("if"),
            break_(),
            text("then"),
            lines(2),
            text("else"),
          ),
        ),
      ),
    ),
  ).toBe(`if\n  then\n\n\n  else`);
});

test("renders break of many lines", () => {
  expect(
    pprint(
      concat(
        //
        text("ab"),
        lines(2),
        text("cd"),
      ),
    ),
  ).toBe(`ab\n\n\ncd`);
});

test("nesting has no effect when there aren't breaks", () => {
  expect(
    pprint(
      concat(
        //
        text("ab"),
        nest(text("cd")),
      ),
    ),
  ).toBe(`abcd`);
});

test("nesting idents the wrapped doc after a break", () => {
  expect(
    pprint(
      concat(
        //
        text("ab"),
        nest(lines(), text("cd")),
        lines(),
        text("ef"),
      ),
    ),
  ).toBe(`ab\n  cd\nef`);
});

test("optional line break doesn't wrap when there is enough space", () => {
  expect(
    pprint(
      concat(
        //
        text("ab"),
        break_("-"),
        text("cd"),
      ),
      { maxWidth: Infinity },
    ),
  ).toBe(`ab-cd`);
});

test("optional line break works when not indented", () => {
  expect(
    pprint(
      concat(
        //
        text("super_long_text"),
        break_("UNREACHABLE", ">"),
        text("super_long_text_2"),
      ),
      { maxWidth: 3 },
    ),
  ).toBe(`super_long_text>\nsuper_long_text_2`);
});

test("optional line break wraps when there is not enough space", () => {
  expect(
    pprint(
      concat(
        //
        text("abc"),
        break_("-"),
        text("def"),
      ),
      { maxWidth: 2 },
    ),
  ).toBe(`abc\ndef`);
});

test("break respects indentation", () => {
  expect(
    pprint(
      concat(
        //
        text("abc"),
        nest(break_("-"), text("def")),
      ),
      { maxWidth: 2 },
    ),
  ).toBe(`abc\n  def`);
});

test("force break outside of a group", () => {
  const docs = broken(
    //
    group(text("abc"), break_("-"), text("def")),
  );

  expect(pprint(docs, { maxWidth: Infinity })).toBe(`abc-def`);
});

test("force break inside a group", () => {
  const docs = broken(
    //
    text("abc"),
    break_("-"),
    text("def"),
  );

  expect(pprint(docs, { maxWidth: Infinity })).toBe(`abc\ndef`);
});

test("if a group breaks, do not break nested group", () => {
  const docs = broken(
    text("a"),
    break_(),
    text("b"),
    break_(),
    group(text("1"), break_(), text("2")),
    broken(break_(), text("c")),
  );

  expect(pprint(docs, { maxWidth: Infinity })).toBe(`a
b
1 2
c`);
});

test("force break when nesting", () => {
  expect(
    pprint(
      concat(
        //
        text("abc"),
        broken(nest(break_("-"), text("def"))),
      ),
      { maxWidth: Infinity },
    ),
  ).toBe(`abc\n  def`);
});

test("flexible break when breaking last", () => {
  const doc = concat(
    text("some-long-string"),
    flexBreak(),
    text("some-long-string"),
    flexBreak(),
    text("some-long-string"),
  );

  expect(pprint(doc, { maxWidth: "some-long-string".length * 2 + 3 }))
    .toBe(`some-long-string some-long-string
some-long-string`);
});

test("flexible break when breaking all", () => {
  const doc = concat(
    text("some-long-string"),
    flexBreak("IGNORED", ">"),
    text("some-long-string"),
    flexBreak("IGNORED", ">"),
    text("some-long-string"),
  );

  expect(pprint(doc, { maxWidth: 3 })).toBe(`some-long-string>
some-long-string>
some-long-string`);
});

test("flexible break when not breaking", () => {
  const doc = concat(
    text("a"),
    flexBreak("_"),
    text("b"),
    flexBreak("_"),
    text("c"),
  );

  expect(pprint(doc, { maxWidth: Infinity })).toBe(`a_b_c`);
});

describe("next break fits", () => {
  test("prevents wrapping", () => {
    const doc = concat(
      //
      text("a"),
      break_("-"),
      text("b"),
      break_("-"),
      nextBreakFits(
        group(
          //
          text("1"),
          break_("-"),
          text("2"),
        ),
      ),
    );

    const out1 = `a-b-1
2`;
    expect(pprint(doc, { maxWidth: "a-b-1".length })).toBe(out1);

    const out2 = `a-b-1-2`;
    expect(pprint(doc, { maxWidth: Infinity })).toBe(out2);

    const out3 = `a
b
1
2`;
    expect(pprint(doc, { maxWidth: 1 })).toBe(out3);
  });

  test("using conditional nesting", () => {
    const doc = nestOnBreak(
      text("first_value"),
      break_(),
      text("second_value"),
      nextBreakFits(
        group(
          //
          break_("<unreachable>"),
          text("some_long_spanning_stuff"),
        ),
      ),
    );

    const out = `first_value second_value
some_long_spanning_stuff`;

    expect(pprint(doc, { maxWidth: "first_value second_value  ".length })).toBe(
      out,
    );
  });
});

test("example: fn application", () => {
  const fnDoc = group(
    text("fn {"),
    broken(
      nest(
        //
        break_("NOT_SHOWN"),
        text("body"),
      ),
      break_(),
      text("}"),
    ),
  );
  expect(pprint(fnDoc, { maxWidth: Infinity })).toBe(`fn {
  body
}`);

  const doc = concat(
    //
    text("f("),
    nestOnBreak(
      //
      break_(""),
      text("first_arg,"),
      break_(),
      text("second_arg,"),
      break_(),
      nextBreakFits(fnDoc),
    ),
    break_(""),
    text(")"),
  );

  expect(pprint(doc, { maxWidth: Infinity }))
    .toBe(`f(first_arg, second_arg, fn {
  body
})`);
});
