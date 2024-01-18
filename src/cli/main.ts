#!/usr/bin/env node

import { Command } from "commander";
import { typecheckCmd } from "./commands/typecheck";
import { lspCmd } from "./commands/lsp";
const packageJson = require("../../package.json");

const program = new Command();

program.version(packageJson.version);

program
  .command("typecheck <path>")
  .description("Infer the type of given file")
  .action((path: string) => {
    typecheckCmd(path);
  });

program
  .command("lsp")
  .description("Run the language server")
  .action(() => {
    lspCmd();
  });

program.parse();
