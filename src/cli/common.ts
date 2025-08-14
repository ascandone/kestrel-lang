import { readFile, readdir } from "node:fs/promises";
import { parse, UntypedModule } from "../parser";
import {
  TypecheckedModule,
  typecheckProject,
  TypedModule,
  UntypedProject,
} from "../typecheck";
import { exit } from "node:process";
import {
  compileProject,
  defaultEntryPoint,
} from "../compiler/backend/js/compiler";
import { col } from "../utils/colors";
import { Config, readConfig } from "./config";
import { join } from "node:path";
import { errorInfoToString } from "../typecheck/errors";
import * as paths from "./paths";

export const EXTENSION = "kes";

export type RawModule = {
  package: string;
  path: string;
  content: string;
  extern: string | undefined;
};

export async function readProjectWithDeps(
  path: string,
  config?: Config,
): Promise<Record<string, RawModule>> {
  if (config === undefined) {
    config = await readConfig(path);
  }
  let rawProject: Record<string, RawModule> = await readProject(path, config);
  try {
    const deps = await readdir(paths.dependencies(path));
    for (const dependencyName of deps) {
      const depPath = paths.dependency(path, dependencyName);
      const dep = await readProject(depPath);
      rawProject = { ...rawProject, ...dep };
    }
  } catch {
    // Assume /deps/ is not present otherwise
  }

  return rawProject;
}

async function readProject(
  path: string,
  config?: Config,
): Promise<Record<string, RawModule>> {
  if (config === undefined) {
    config = await readConfig(path);
  }

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
        package: config.type === "package" ? config.name : "",
        path: filePath,
        content: fileBuf.toString(),
        extern,
      };
    }
  }

  return res;
}

export type TypedProject = Record<string, TypecheckedModule>;

export async function check(path: string): Promise<TypedProject | undefined> {
  const rawProject = await readProjectWithDeps(path);
  const [project, hasWarnings] = await checkProject(rawProject);
  if (hasWarnings) {
    return undefined;
  }
  return project;
}

export function parseModule(src: string): UntypedModule {
  const parseResult = parse(src);
  if (parseResult.lexerErrors.length !== 0) {
    console.log(
      `${col.red.tag`Parsing error:`} ${parseResult.parsingErrors[0]!.description!}`,
    );
    exit(1);
  }
  if (parseResult.parsingErrors.length !== 0) {
    console.log(
      `${col.red.tag`Parsing error:`} ${parseResult.parsingErrors[0]!.description!}`,
    );
    exit(1);
  }
  return parseResult.parsed;
}

export async function checkProject(
  rawProject: Record<string, RawModule>,
): Promise<[TypedProject | undefined, boolean]> {
  const untypedProject: UntypedProject = {};

  for (const [ns, info] of Object.entries(rawProject)) {
    const parseResult = parse(info.content);
    if (parseResult.lexerErrors.length !== 0) {
      console.log(
        `${col.red.tag`Parsing error:`} ${parseResult.parsingErrors[0]!.description!}`,
      );
      exit(1);
    }

    if (parseResult.parsingErrors.length !== 0) {
      console.log(
        `${col.red.tag`Parsing error:`} ${parseResult.parsingErrors[0]!.description!}`,
      );
      exit(1);
    }

    untypedProject[ns] = {
      package: info.package,
      module: parseResult.parsed,
    };
  }

  const typedProject = typecheckProject(untypedProject);

  const res: TypedProject = {};
  let errorsCount = 0,
    warningsCount = 0;
  for (const [ns, m] of Object.entries(typedProject)) {
    res[ns] = m;
    if (m.errors.length !== 0) {
      console.log(col.blue.tag`-------- ${ns}.${EXTENSION}\n`);
    }

    for (const error of m.errors) {
      if (error.description.severity === "warning") {
        warningsCount++;
      } else {
        errorsCount++;
      }

      const src = rawProject[ns]!.content!;
      console.log(errorInfoToString(src, error), "\n\n");
    }
  }

  const totalIssuesCount = errorsCount + warningsCount;
  const hasWarnings = warningsCount !== 0;

  if (totalIssuesCount > 0) {
    const plErr = totalIssuesCount === 1 ? "error" : "errors";
    console.log(`[Found ${totalIssuesCount} ${plErr}]\n`);
  }

  if (errorsCount === 0) {
    return [res, hasWarnings];
  } else {
    return [undefined, hasWarnings];
  }
}

export async function compilePath(
  path: string,
  entryPointModule?: string,
  optimize?: boolean,
): Promise<string> {
  const rawProject = await readProjectWithDeps(path);
  const [typedProject] = await checkProject(rawProject);
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

  try {
    const project: Record<string, TypedModule> = {};
    for (const [k, v] of Object.entries(typedProject)) {
      project[k] = v.typedModule;
    }

    return compileProject(project, {
      externs,
      optimize,
      entrypoint: {
        ...defaultEntryPoint,
        module: entryPointModule ?? defaultEntryPoint.module,
      },
    });
  } catch (e) {
    console.error(col.red.tag`Error:`, (e as Error).message);
    exit(1);
  }
}
