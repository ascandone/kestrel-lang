import { mkdir, writeFile } from "node:fs/promises";
import { configDecoder, defaultConfig, writeConfig } from "../config";
import { join } from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { fetchDeps } from "../deps";
import { col } from "../../utils/colors";

const execP = promisify(exec);

const DEFAULT_GITIGNORE = `.DS_Store

# The directory where dependencies are downloaded
/deps/
`;

const DEFAULT_WORKFLOW_FILE = `name: CI
on: push
jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install kestrel cli
        run: npm install -g kestrel-lang
      - name: Check if project is formatted
        run: kestrel format
      - name: Install dependencies
        run: kestrel deps install
      - name: Typecheck the project
        run: kestrel check
`;

const DEFAULT_EXTENSIONS_FILE = JSON.stringify(
  {
    recommendations: ["ascandone.kestrel-vscode"],
  },
  null,
  2,
);

async function initGit(path: string) {
  await writeFile(join(path, ".gitignore"), DEFAULT_GITIGNORE);

  const workflowFolder = join(path, ".github", "workflows");
  await mkdir(workflowFolder, { recursive: true });
  await writeFile(join(workflowFolder, "ci.yml"), DEFAULT_WORKFLOW_FILE);

  await execP(`git init -b main ${path}`);
}

async function initVscode(path: string) {
  const vscodeExtensionFolder = join(path, ".vscode");
  await mkdir(vscodeExtensionFolder, { recursive: true });
  await writeFile(
    join(vscodeExtensionFolder, "extensions.json"),
    DEFAULT_EXTENSIONS_FILE,
  );
}

export async function initCmd(projectName: string) {
  // TODO project name validation

  await mkdir(projectName);
  const path = join(process.cwd(), projectName);
  await writeConfig(path, defaultConfig);
  process.stdout.write(`${col.blue.tag`[info]`} Created project\n`);

  await initVscode(path);

  await initGit(path);
  process.stdout.write(`${col.blue.tag`[info]`} Initialized git project\n`);

  const parsedConfig = configDecoder.decodeUnsafeThrow(defaultConfig);
  await fetchDeps(path, parsedConfig);
}
