import { readFile, readdir } from "node:fs/promises";
import { unsafeParse } from "../parser";
import { typecheckProject, TypeMeta } from "../typecheck/typecheck";
import { parse } from "../parser";
import { typeErrorPPrint } from "../typecheck/pretty-printer";
import { Program, Span } from "../ast";
import { exit } from "node:process";
import { Compiler } from "../compiler";
import { CORE_FOLDER_PATH } from "./paths";
import { topSortedModules } from "../project";

export const FgRed = "\x1b[31m";
export const Reset = "\x1b[0m";
export const FgBlack = "\x1b[30m";
export const BgWhite = "\x1b[47m";

const EXTENSION = "mrs";

type Core = Record<string, Program>;
export async function readCore(): Promise<Core> {
  const paths = await readdir(CORE_FOLDER_PATH);
  const untypedProject: Record<string, Program> = {};
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

export type TypedProject = Record<string, Program<TypeMeta>>;
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
const MAIN_MODULE = "Main";

export async function compilePath(path: string): Promise<string> {
  const project = await check(path);
  if (project === undefined) {
    exit(1);
  }

  const sorted = topSortedModules(project);

  const buf: string[] = [];
  const compiler = new Compiler();
  for (const ns of sorted) {
    try {
      const externBuf = await readFile(`${CORE_FOLDER_PATH}/${ns}.js`);
      buf.push(externBuf.toString());
    } catch {
      // Assume file did not exist
    }

    const mod = project[ns]!;
    const compiled = compiler.compile(mod, ns);

    if (compiled.trim() !== "") {
      buf.push(compiled);
    }
  }

  const main = project.Main;

  const hasMain =
    main?.declarations.some((d) => d.binding.name === "main") ?? false;

  const executor = `${MAIN_MODULE}$main.run(() => {});`;
  const execMain = hasMain ? executor : "";
  buf.push(execMain);
  return buf.join("\n");
}
