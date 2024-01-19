import { readFileSync } from "fs";
import { parse } from "../../parser";
import { typecheck } from "../../typecheck/typecheck";
import { typeErrorPPrint } from "../../typecheck/pretty-printer";
import { prelude } from "../../typecheck/prelude";
import { Span } from "../../ast";

const FgRed = "\x1b[31m";
const Reset = "\x1b[0m";
const FgBlack = "\x1b[30m";
const BgWhite = "\x1b[47m";

export function typecheckCmd(path: string) {
  const f = readFileSync(path);

  const src = f.toString();
  const parseResult = parse(src);
  if (!parseResult.ok) {
    console.log(
      `${FgRed}Parsing error:${Reset} ${parseResult.matchResult.message!}`,
    );
    return;
  }

  const [, errors] = typecheck(parseResult.value, prelude);

  for (const error of errors) {
    const msg = typeErrorPPrint(error);
    console.log(`${FgRed}Error:${Reset} ${msg}`);
    console.log(showErrorLine(src, error.node.span), "\n\n");
  }

  if (errors.length > 0) {
    const plErr = errors.length === 1 ? "error" : "errors";
    console.log(`[Found ${errors.length} ${plErr}]\n`);
  } else {
    console.log("Found no errors ✅");
  }
}

export function showErrorLine(src: string, [start, end]: Span): string {
  const startPos = offsetToPosition(src, start);
  const endPos = offsetToPosition(src, end);
  const lines = src.split("\n");

  // TODO handle nums with many digits
  const digitsPadding = repeatN(" ", 1);

  function showLine(line: number) {
    const codeLine = lines[line]!;
    const lineNum = `${BgWhite}${FgBlack}${line + 1}${Reset}`;
    return `${lineNum} ${codeLine}`;
  }

  function showErr([start, end]: [start: number, end: number]) {
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

    ret.push(showLine(currentLine), showErr([startChar, endChar]));
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
