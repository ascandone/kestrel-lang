#!/usr/bin/env node

import { Command } from "commander";
import { checkCmd } from "./commands/checkCmd";
import { lspCmd } from "./commands/lspCmd";
import { compileCmd } from "./commands/compileCmd";
import { runCmd } from "./commands/runCmd";
import { initCmd } from "./commands/initCmd";
import { formatCmd } from "./commands/formatCmd";
import { depsInstall } from "./commands/depsCmd";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require("../../package.json");

const program = new Command();

program.version(packageJson.version);

program
  .command("init <project_name>")
  .description("Init a kestrel program")
  .action(initCmd);

program
  .command("check")
  .description("Infer the type of given file")
  .action(checkCmd);

program
  .command("compile <entrypoint>")
  .option("--out <path>")
  // TODO add the flag when is fixed
  // .option("--optimize")
  .description("Compile the file into a js file")
  .action(compileCmd);

const deps = program.command("deps").description("Manage dependencies");
deps.command("install").description("Install dependencies").action(depsInstall);

program
  .command("format")
  .description("Format a kestrel file")
  .option("--path <path>")
  .option("--write")
  .action(formatCmd);

program
  .command("run [entrypoint]")
  .description("Evaluate the given file")
  .action(runCmd);

program.command("lsp").description("Run the language server").action(lspCmd);

program.parse();
