import { readFile, readdir } from "node:fs/promises";
import { unsafeParse, parse, Span, UntypedModule } from "../parser";
import { typecheckProject, typeErrorPPrint, TypedModule } from "../typecheck";
import { exit } from "node:process";
import { compileProject } from "../compiler";
import { CORE_FOLDER_PATH } from "./paths";

export const FgRed = "\x1b[31m";
export const Reset = "\x1b[0m";
export const FgBlack = "\x1b[30m";
export const BgWhite = "\x1b[47m";

const EXTENSION = "ks";

type Core = Record<string, UntypedModule>;
export async function readCore(): Promise<Core> {
  const paths = await readdir(CORE_FOLDER_PATH);
  const untypedProject: Record<string, UntypedModule> = {};
  for (const fileName of paths) {
    const [moduleName, ext] = fileName.split(".");
    if (ext !== EXTENSION) {
      continue;
    }

    const fileBuf = await readFile(`${CORE_FOLDER_PATH}/${fileName}`);
    const parsed = unsafeParse(fileBuf.toString());
    untypedProject[moduleName!] = parsed;
  }

  return untypedProject;
}

export type TypedProject = Record<string, TypedModule>;
export async function check(path: string): Promise<TypedProject | undefined> {
  const core = await readCore();

  const f = await readFile(path);
  const src = f.toString();
  const parseResult = parse(src);
  if (!parseResult.ok) {
    console.log(
      `${FgRed}Parsing error:${Reset} ${parseResult.matchResult.message!}`,
    );
    exit(1);
  }

  const typedProject = typecheckProject({
    // TODO actual name
    Main: parseResult.value,
    ...core,
  });

  const res: TypedProject = {};
  let errorCount = 0;
  for (const [ns, [program, errors]] of Object.entries(typedProject)) {
    res[ns] = program;
    for (const error of errors) {
      errorCount++;
      const msg = typeErrorPPrint(error);
      console.log(`${FgRed}Error:${Reset} ${msg}`);
      // TODO fix src
      console.log(showErrorLine(src, error.span), "\n\n");
    }
  }

  if (errorCount > 0) {
    const plErr = errorCount === 1 ? "error" : "errors";
    console.log(`[Found ${errorCount} ${plErr}]\n`);
    return undefined;
  }

  return res;
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

export async function compilePath(path: string): Promise<string> {
  const typedProject = await check(path);
  if (typedProject === undefined) {
    exit(1);
  }

  const externs: Record<string, string> = {};
  for (const ns in typedProject) {
    try {
      const externBuf = await readFile(`${CORE_FOLDER_PATH}/${ns}.js`);
      externs[ns] = externBuf.toString();
    } catch {
      // Assume file did not exist
    }
  }

  return compileProject(typedProject, { externs });
}
