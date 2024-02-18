import { mkdir, writeFile } from "node:fs/promises";
import { configDecoder, defaultConfig, writeConfig } from "../config";
import { join } from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { fetchDeps } from "../common";
import { col } from "../../utils/colors";

const execP = promisify(exec);

const DEFAULT_GITIGNORE = `.DS_Store

# The directory where dependencies are downloaded
/deps/
`;

async function initGit(path: string) {
  await writeFile(join(path, ".gitignore"), DEFAULT_GITIGNORE);
  await execP(`git init -b main ${path}`);
}

export async function initCmd(projectName: string) {
  // TODO project name validation

  await mkdir(projectName);
  const path = join(process.cwd(), projectName);
  await writeConfig(path, defaultConfig);
  process.stdout.write(`${col.blue.tag`[info]`} Created project\n`);

  await initGit(path);
  process.stdout.write(`${col.blue.tag`[info]`} Initialized git project\n`);

  const parsedConfig = configDecoder.decodeUnsafeThrow(defaultConfig);
  await fetchDeps(path, parsedConfig);
}
