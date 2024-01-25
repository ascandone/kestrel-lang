import { readFileSync } from "fs";
import { parse } from "../parser";
import { TypeMeta, typecheck } from "../typecheck/typecheck";
import { typeErrorPPrint } from "../typecheck/pretty-printer";
import { Program, Span } from "../ast";
import { BgWhite, FgBlack, FgRed, Reset } from "./colors";
import { readPrelude } from "./readprelude";

export function check(path: string): Program<TypeMeta> | undefined {
  const { types, context } = readPrelude();

  const f = readFileSync(path);
  const src = f.toString();
  const parseResult = parse(src);
  if (!parseResult.ok) {
    console.log(
      `${FgRed}Parsing error:${Reset} ${parseResult.matchResult.message!}`,
    );
    return undefined;
  }

  const [program, errors] = typecheck(parseResult.value, context, types);

  for (const error of errors) {
    const msg = typeErrorPPrint(error);
    console.log(`${FgRed}Error:${Reset} ${msg}`);
    console.log(showErrorLine(src, error.span), "\n\n");
  }

  if (errors.length > 0) {
    const plErr = errors.length === 1 ? "error" : "errors";
    console.log(`[Found ${errors.length} ${plErr}]\n`);
    return undefined;
  }

  return program;
}

export function showErrorLine(src: string, [start, end]: Span): string {
  const startPos = offsetToPosition(src, start);
  const endPos = offsetToPosition(src, end);
  const lines = src.split("\n");

  function showLine(line: number) {
    const codeLine = lines[line]!;
    const lineNum = `${BgWhite}${FgBlack}${line + 1}${Reset}`;
    return `${lineNum} ${codeLine}`;
  }

  function showErr(
    currentLine: number,
    [start, end]: [start: number, end: number],
  ) {
    const lineDigits = currentLine.toString().length;
    const digitsPadding = repeatN(" ", lineDigits);

    const errPadding = repeatN(" ", start);
    const errHighlight = repeatN("~", end - start);
    return `${BgWhite}${digitsPadding}${Reset} ${FgRed}${errPadding}${errHighlight}${Reset}`;
  }

  const ret: string[] = [];
  for (
    let currentLine = startPos.line;
    currentLine <= endPos.line;
    currentLine++
  ) {
    const startChar = currentLine === startPos.line ? startPos.character : 0;

    const endChar =
      currentLine === endPos.line
        ? endPos.character
        : lines[currentLine]!.length;

    ret.push(showLine(currentLine), showErr(currentLine, [startChar, endChar]));
  }

  return ret.join("\n");
}

type Position = { line: number; character: number };

function offsetToPosition(src: string, offset: number): Position {
  let line = 0,
    character = 0;

  for (const ch of src) {
    if (offset === 0) {
      break;
    }

    offset--;
    if (ch === "\n") {
      line++;
      character = 0;
    } else {
      character++;
    }
  }

  return { line, character };
}

function repeatN(ch: string, times: number) {
  return Array.from({ length: times }, () => ch).join("");
}
