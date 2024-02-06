import { readFile, readdir } from "node:fs/promises";
import { unsafeParse, parse, UntypedModule } from "../parser";
import { typecheckProject, typeErrorPPrint, TypedModule } from "../typecheck";
import { exit } from "node:process";
import { compileProject } from "../compiler";
import { CORE_FOLDER_PATH } from "./paths";
import { showErrorLine } from "./utils/showErrorLine";
import { FgRed, Reset } from "./utils/colors";

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
