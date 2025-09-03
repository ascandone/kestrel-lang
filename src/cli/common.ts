import { readFile, readdir } from "node:fs/promises";
import { parse, UntypedModule } from "../parser";
import { exit } from "node:process";
import {
  compileProject,
  defaultEntryPoint,
} from "../compiler/backend/js/compiler";
import { col } from "../common/colors";
import { Config, getConfigPackageName, readConfig } from "./config";
import { join } from "node:path";
import { errorInfoToString } from "../typecheck/errors";
import * as paths from "./paths";
import {
  DefaultMap,
  nestedMapGetOrPutDefault,
  nestedMapEntries,
} from "../common/defaultMap";
import * as project from "../typecheck/project";

export const EXTENSION = "kes";

export type RawModule = {
  package: string;
  path: string;
  content: string;
  extern: string | undefined;
};

export type RawProject = Map<string, Map<string, RawModule>>;

/** Read a package and its dependecies. Returns a (module, pkg)-indexed nested map */
export async function readRawProject(
  path: string,
): Promise<[RawProject, project.ProjectOptions["packageDependencies"]]> {
  const project = new DefaultMap<string, Map<string, RawModule>>(
    () => new Map(),
  );

  const packagesDeps: project.ProjectOptions["packageDependencies"] = new Map();

  // TODO make sure there aren't cyclic deps
  async function helper(path: string) {
    const config = await readConfig(path);

    const deps = Object.keys(config.dependencies ?? {});
    packagesDeps.set(getConfigPackageName(config), new Set(deps));

    await readPackage(project, path, config);

    try {
      const deps = await readdir(paths.dependencies(path));
      for (const dependencyName of deps) {
        const depPath = paths.dependency(path, dependencyName);
        await helper(depPath);
      }
    } catch {
      // Assume /deps/ is not present otherwise
    }
  }

  await helper(path);

  return [project.inner, packagesDeps] as const;
}

/** Read a single package and load its content into the project  */
async function readPackage(
  /* &mut */ project: DefaultMap<string, Map<string, RawModule>>,

  path: string,
  config?: Config,
): Promise<void> {
  if (config === undefined) {
    config = await readConfig(path);
  }

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

      const package_ = getConfigPackageName(config);
      project.get(moduleName!).set(package_, {
        package: package_,
        path: filePath,
        content: fileBuf.toString(),
        extern,
      });
    }
  }
}

export async function check(
  path: string,
): Promise<project.TypedProject | undefined> {
  const [rawProject, projectDeps] = await readRawProject(path);
  const [project, hasWarnings] = await checkProject(rawProject, projectDeps);
  if (hasWarnings) {
    return undefined;
  }
  return project;
}

export function parseModule(src: string): UntypedModule {
  const parseResult = parse(src);
  if (parseResult.lexerErrors.length !== 0) {
    console.info(
      `${col.red.tag`Parsing error:`} ${parseResult.parsingErrors[0]!.description!}`,
    );
    exit(1);
  }
  if (parseResult.parsingErrors.length !== 0) {
    console.info(
      `${col.red.tag`Parsing error:`} ${parseResult.parsingErrors[0]!.description!}`,
    );
    exit(1);
  }
  return parseResult.parsed;
}

export async function checkProject(
  rawProject: Map<string, Map<string, RawModule>>,
  packageDependencies: project.ProjectOptions["packageDependencies"],
): Promise<[project.TypedProject | undefined, boolean]> {
  const raw: project.RawProject = new Map();

  for (const [moduleId, package_, info] of nestedMapEntries(rawProject)) {
    nestedMapGetOrPutDefault(raw, moduleId).set(package_, info.content);
  }

  const checker = new project.ProjectTypechecker(raw, {
    packageDependencies,
  });
  checker.typecheck();

  let errorsCount = 0,
    warningsCount = 0;

  // TODO make this bit a pure and test it
  for (const [moduleId, packages] of checker.compiledProject.inner) {
    for (const [package_, [, errors]] of packages) {
      if (errors.length !== 0) {
        console.info(col.blue.tag`-------- ${moduleId}.${EXTENSION}\n`);
      }

      for (const error of errors) {
        if (error.description.severity === "warning") {
          warningsCount++;
        } else {
          errorsCount++;
        }

        const src = nestedMapGetOrPutDefault(rawProject, moduleId).get(
          package_,
        )!.content;
        console.info(errorInfoToString(src, error), "\n\n");
      }
    }
  }

  const totalIssuesCount = errorsCount + warningsCount;
  const hasWarnings = warningsCount !== 0;

  if (totalIssuesCount > 0) {
    const plErr = totalIssuesCount === 1 ? "error" : "errors";
    console.info(`[Found ${totalIssuesCount} ${plErr}]\n`);
  }

  if (errorsCount === 0) {
    return [checker.compiledProject.inner, hasWarnings];
  } else {
    return [undefined, hasWarnings];
  }
}

export async function compilePath(
  path: string,
  entryPointModule?: string,
  _optimize?: boolean,
): Promise<string> {
  const [rawProject] = await readRawProject(path);
  const [typedProject] = await checkProject(rawProject, new Map());
  if (typedProject === undefined) {
    exit(1);
  }

  const externs: Record<string, string> = {};
  for (const [moduleId, packages] of typedProject) {
    for (const [package_] of packages) {
      const extern = nestedMapGetOrPutDefault(rawProject, moduleId).get(
        package_,
      )?.extern;

      if (extern !== undefined) {
        // TODO(bug) this isn't safe: we need a nested map for externs as well
        externs[moduleId] = extern.toString();
      }
    }
  }

  // TODO we could rease this config
  const config = await readConfig(path);

  try {
    // TODO package_
    return compileProject(getConfigPackageName(config), typedProject, {
      externs,
      entrypoint: entryPointModule ?? defaultEntryPoint,
    });
  } catch (e) {
    console.error(col.red.tag`Error:`, (e as Error).message);
    exit(1);
  }
}
