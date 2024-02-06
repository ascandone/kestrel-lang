#!/usr/bin/env node

import { Command } from "commander";
import { checkCmd } from "./commands/checkCmd";
import { lspCmd } from "./commands/lspCmd";
import { compileCmd } from "./commands/compileCmd";
import { runCmd } from "./commands/runCmd";
import { initCmd } from "./commands/initCmd";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require("../../package.json");

const program = new Command();

program.version(packageJson.version);

program.command("init").description("Init a kestrel program").action(initCmd);

program
  .command("check")
  .description("Infer the type of given file")
  .action(checkCmd);

program
  .command("compile")
  .option("--out <path>")
  .description("Compile the file into a js file")
  .action(compileCmd);

program.command("run").description("Evaluate the given file").action(runCmd);

program.command("lsp").description("Run the language server").action(lspCmd);

program.parse();
