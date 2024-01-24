#!/usr/bin/env node

import { Command } from "commander";
import { checkCmd } from "./commands/checkCmd";
import { lspCmd } from "./commands/lspCmd";
import { compileCmd } from "./commands/compileCmd";

const packageJson = require("../../package.json");

const program = new Command();

program.version(packageJson.version);

program
  .command("check <path>")
  .description("Infer the type of given file")
  .action((path: string) => {
    checkCmd(path);
  });

program
  .command("compile <path>")
  .description("Compile the file into a js file")
  .action((path: string) => {
    compileCmd(path);
  });

program
  .command("lsp")
  .description("Run the language server")
  .action(() => {
    lspCmd();
  });

program.parse();
