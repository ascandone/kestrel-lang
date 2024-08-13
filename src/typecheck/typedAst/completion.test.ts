import { expect, test } from "vitest";
import { getCompletionItems } from "./completion";
import { parse } from "../../parser";
import { typecheck } from "../typecheck";
import { typeToString } from "../type";

test("field access", () => {
  const src = `

type Person struct {
  name: String,
  age: Int,
}

extern let p: Person

let expr = p.  
`;

  const cursorIndex = src.indexOf("p.") + 2;

  const parsed = parse(src);

  console.log(parsed.parsed.declarations.map((d) => [d.binding.name, d.span]));

  const [typed, _] = typecheck("Main", parsed.parsed);

  const ret = getCompletionItems(typed, cursorIndex);

  expect(ret?.type).toEqual("field-access");
  expect(typeToString(ret!.structType.asType())).toEqual("Person");
});
