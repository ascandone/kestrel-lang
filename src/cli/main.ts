#!/usr/bin/env node

import { Command } from "commander";
import { checkCmd } from "./commands/checkCmd";
import { lspCmd } from "./commands/lspCmd";
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
  .command("lsp")
  .description("Run the language server")
  .action(() => {
    lspCmd();
  });

program.parse();
