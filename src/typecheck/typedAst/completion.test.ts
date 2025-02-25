import { expect, test } from "vitest";
import { getCompletionItems } from "./completion";
import { parse } from "../../parser";
import { typecheck } from "../typecheck";
import { makeObjectDepedenciesProvider } from "./index";
import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { positionOf } from "./__test__/utils";

test("completion of field access of a struct whose type is resolved", () => {
  const src = `
extern type String
extern type Int

type Person struct {
  name: String,
  age: Int,
}

extern let p: Person

let expr = p.  
`;

  const cursorPosition = positionOf(src, "p.");
  cursorPosition.character += 2;

  const [parsed] = parse(src);

  const [typed, _] = typecheck("Main", parsed);

  const ret = getCompletionItems(
    typed,
    cursorPosition,
    makeObjectDepedenciesProvider({ Main: typed }),
  );

  expect(ret).toEqual<CompletionItem[]>([
    {
      label: "name",
      kind: CompletionItemKind.Field,
      detail: "String",
    },
    {
      label: "age",
      kind: CompletionItemKind.Field,
      detail: "Int",
    },
  ]);
});

test("completion of field access of a struct whose type is _not_ resolved", () => {
  const src = `
extern type String
extern type Int

type Person struct {
  name: String,
  age: Int,
}

let expr = fn p { p. }
`;

  const cursorPosition = positionOf(src, "p.");
  cursorPosition.character += 2;

  const [parsed] = parse(src);

  const [typed, _] = typecheck("Main", parsed);

  const ret = getCompletionItems(
    typed,
    cursorPosition,
    makeObjectDepedenciesProvider({ Main: typed }),
  );

  expect(ret).toEqual<CompletionItem[]>([
    {
      label: "name",
      kind: CompletionItemKind.Field,
      detail: "String",
    },
    {
      label: "age",
      kind: CompletionItemKind.Field,
      detail: "Int",
    },
  ]);
});
