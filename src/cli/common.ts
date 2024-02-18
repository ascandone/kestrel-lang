import { readFile, readdir } from "node:fs/promises";
import { parse, UntypedModule } from "../parser";
import { typecheckProject, TypedModule } from "../typecheck";
import { exit } from "node:process";
import { compileProject } from "../compiler";
import { col } from "../utils/colors";
import { exec } from "node:child_process";
import { Config, Dependency, readConfig } from "./config";
import { join } from "node:path";
import { errorInfoToString } from "../errors";
import { promisify } from "node:util";

const execP = promisify(exec);

export const EXTENSION = "kes";

export type RawModule = {
  path: string;
  content: string;
  extern: string | undefined;
};

function dependencyToPath(name: string, dep: Dependency): string {
  switch (dep.type) {
    case "local":
      return dep.path;
    case "git":
      return `deps/${name}`;
  }
}

export async function fetchDeps(path: string, config: Config) {
  const deps = Object.entries(config.dependencies ?? {});

  for (const [name, dep] of deps) {
    if (dep.type === "git") {
      process.stdout.write(
        `${col.blue.tag`[info]`} Fetching ${name} from git...`,
      );
      // This raises an err on failure
      await execP(`git clone --depth=1 ${dep.git} ${path}/deps/${name}`);
      process.stdout.write(` Done.`);
    }
  }
}

export async function readProjectWithDeps(
  path: string,
): Promise<Record<string, RawModule>> {
  const config = await readConfig(path);
  let rawProject: Record<string, RawModule> = await readProject(path, config);
  if (config.type === "application") {
    const deps = Object.entries(config.dependencies ?? {});
    for (const [name, depInfo] of deps) {
      const depPath = dependencyToPath(name, depInfo);
      const depConfig = await readConfig(depPath);
      const dep = await readProject(depPath, depConfig);
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

export function parseModule(src: string): UntypedModule {
  const parseResult = parse(src);
  if (!parseResult.ok) {
    console.log(
      `${col.red.tag`Parsing error:`} ${parseResult.matchResult.message!}`,
    );
    exit(1);
  }
  return parseResult.value;
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
      const src = rawProject[ns]!.content!;
      console.log(errorInfoToString(src, error), "\n\n");
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
