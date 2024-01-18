#!/usr/bin/env node

import { Command } from "commander";
import { typecheckCmd } from "./commands/typecheck";
const packageJson = require("../../package.json");

const program = new Command();

program.version(packageJson.version);

program
  .command("typecheck <path>")
  .description("Infer the type of given file")
  .action((path: string) => {
    typecheckCmd(path);
  });

program.parse();
