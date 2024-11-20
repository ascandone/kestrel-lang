import { Range } from "../parser";
import { col } from "../utils/colors";

function repeatN(ch: string, times: number) {
  return Array.from({ length: times }, () => ch).join("");
}

export function showErrorLine(
  src: string,
  { start: startPos, end: endPos }: Range,
): string {
  const lines = src.split("\n");

  function showLine(line: number) {
    const codeLine = lines[line]!;
    return `${line + 1}| ${codeLine}`;
  }

  function showErr(
    currentLine: number,
    [start, end]: [start: number, end: number],
  ) {
    const lineDigits = currentLine.toString().length;
    const digitsPadding = repeatN(" ", lineDigits);

    const errPadding = repeatN(" ", start);
    const errHighlight = repeatN("~", end - start);
    return `${digitsPadding}| ${col.red.str(errPadding + errHighlight)}`;
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
