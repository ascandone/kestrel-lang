import { expect, test } from "vitest";
import { DependenciesProvider, getCompletionItems } from "./completion";
import { parse } from "../parser";
import { typecheck } from "../typecheck/typecheck";
import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { positionOf } from "./__test__/utils";
import { TypedModule } from "../typecheck";

test("completion of field access of a struct whose type is resolved", () => {
  const src = `
extern type String
extern type Int

struct Person {
  name: String,
  age: Int,
}

@type Person
@extern
let p

let expr = p.  
`;

  const cursorPosition = positionOf(src, "p.");
  cursorPosition.character += 2;

  const parsed = parse(src);

  const [typed, _] = typecheck("pkg", "Main", parsed.parsed);

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

struct Person {
  name: String,
  age: Int,
}

let expr = fn p { p. }
`;

  const cursorPosition = positionOf(src, "p.");
  cursorPosition.character += 2;

  const parsed = parse(src);

  const [typed, _] = typecheck("pkg", "Main", parsed.parsed);

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

function makeObjectDepedenciesProvider(
  o: Record<string, TypedModule>,
): DependenciesProvider {
  return {
    getModuleByNs(ns) {
      return o[ns];
    },
  };
}
