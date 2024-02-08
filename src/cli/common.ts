import { readFile, readdir } from "node:fs/promises";
import { unsafeParse, parse, UntypedModule } from "../parser";
import { typecheckProject, TypedModule } from "../typecheck";
import { exit } from "node:process";
import { compileProject } from "../compiler";
import { CORE_FOLDER_PATH } from "./paths";
import { showErrorLine } from "./utils/showErrorLine";
import { col } from "./utils/colors";
import { Config, readConfig } from "./config";
import { join } from "node:path";

const EXTENSION = "ks";

type Core = Record<string, UntypedModule>;

export type RawModule = {
  path: string;
  content: string;
  extern: string | undefined;
};

export async function readProject(
  path: string,
  config: Config,
): Promise<Record<string, RawModule>> {
  const res: Record<string, RawModule> = {};
  for (const sourceDir of config["source-directories"]) {
    const files = await readdir(sourceDir, { recursive: true });
    // TODo is the file relative path?
    for (const file of files) {
      const [moduleName, ext] = file.split(".");
      if (ext !== EXTENSION) {
        continue;
      }

      const filePath = join(path, sourceDir, file);
      const fileBuf = await readFile(filePath);

      let extern: string | undefined = undefined;
      try {
        const externPath = join(path, sourceDir, `${moduleName}.js`);
        const externBuf = await readFile(externPath);
        extern = externBuf.toString();
      } catch {
        // Assume file did not exist
      }

      res[moduleName!] = {
        path: filePath,
        content: fileBuf.toString(),
        extern,
      };
    }
  }

  return res;
}

export async function readCoreRaw(): Promise<Record<string, RawModule>> {
  const paths = await readdir(CORE_FOLDER_PATH);
  const untypedProject: Record<string, RawModule> = {};
  for (const fileName of paths) {
    const [moduleName, ext] = fileName.split(".");
    if (ext !== EXTENSION) {
      continue;
    }

    const path = `${CORE_FOLDER_PATH}/${fileName}`;

    const contentBuf = await readFile(path);
    let extern: string | undefined;
    try {
      const externBuf = await readFile(`${CORE_FOLDER_PATH}/${moduleName}.js`);
      extern = externBuf.toString();
    } catch {
      // Assume file did not exist
    }

    untypedProject[moduleName!] = {
      path,
      content: contentBuf.toString(),
      extern,
    };
  }

  return untypedProject;
}

export async function readCore(): Promise<Core> {
  const rawCore = await readCoreRaw();

  const core: Core = {};
  for (const [ns, rawModule] of Object.entries(rawCore)) {
    core[ns] = unsafeParse(rawModule.content);
  }
  return core;
}

export type TypedProject = Record<string, TypedModule>;
export async function check(
  path: string,
  config?: Config,
): Promise<TypedProject | undefined> {
  if (config === undefined) {
    config = await readConfig(path);
  }

  const core = await readCore();
  const rawProject = await readProject(path, config);

  const untypedProject: Record<string, UntypedModule> = {};
  for (const [ns, info] of Object.entries(rawProject)) {
    const parseResult = parse(info.content);
    if (!parseResult.ok) {
      console.log(
        `${col.red.tag`Parsing error:`} ${parseResult.matchResult.message!}`,
      );
      exit(1);
    }
    untypedProject[ns] = parseResult.value;
  }

  const typedProject = typecheckProject({
    ...untypedProject,
    ...core,
  });

  const res: TypedProject = {};
  let errorCount = 0;
  for (const [ns, [program, errors]] of Object.entries(typedProject)) {
    res[ns] = program;
    if (errors.length !== 0) {
      console.log(col.blue.tag`-------- ${ns}.${EXTENSION}\n`);
    }

    for (const error of errors) {
      errorCount++;
      const msg = error.description.getDescription();
      console.log(
        `${col.red.tag`Error:`} ${col.bright.str(error.description.errorName)}

${msg}
`,
      );
      console.log(showErrorLine(rawProject[ns]!.content, error.span), "\n\n");
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
