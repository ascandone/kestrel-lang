import { readFile, readdir } from "node:fs/promises";
import { parse, UntypedModule } from "../parser";
import { typecheckProject, TypedModule } from "../typecheck";
import { exit } from "node:process";
import { compileProject } from "../compiler";
import { showErrorLine } from "./utils/showErrorLine";
import { col } from "./utils/colors";
import { Config, readConfig } from "./config";
import { join } from "node:path";

const EXTENSION = "ks";

export type RawModule = {
  path: string;
  content: string;
  extern: string | undefined;
};

export async function readProjectWithDeps(
  path: string,
): Promise<Record<string, RawModule>> {
  const config = await readConfig(path);
  let rawProject: Record<string, RawModule> = await readProject(path, config);
  if (config.type === "application") {
    for (const [_name, depInfo] of Object.entries(config.dependencies ?? {})) {
      const path = depInfo.path;
      const depConfig = await readConfig(path);
      const dep = await readProject(depInfo.path, depConfig);
      rawProject = { ...rawProject, ...dep };
    }
  }
  return rawProject;
}

async function readProject(
  path: string,
  config: Config,
): Promise<Record<string, RawModule>> {
  const res: Record<string, RawModule> = {};
  for (const sourceDir of config["source-directories"]) {
    const files = await readdir(join(path, sourceDir), { recursive: true });

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

export type TypedProject = Record<string, TypedModule>;

export async function check(path: string): Promise<TypedProject | undefined> {
  const rawProject = await readProjectWithDeps(path);
  return checkProject(rawProject);
}

export async function checkProject(
  rawProject: Record<string, RawModule>,
): Promise<TypedProject | undefined> {
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

  const typedProject = typecheckProject(untypedProject);

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
  const rawProject = await readProjectWithDeps(path);
  const typedProject = await checkProject(rawProject);
  if (typedProject === undefined) {
    exit(1);
  }

  const externs: Record<string, string> = {};
  for (const ns in typedProject) {
    const extern = rawProject[ns]?.extern;
    if (extern !== undefined) {
      externs[ns] = extern.toString();
    }
  }

  return compileProject(typedProject, { externs });
}
