#!/usr/bin/env node

import { Command } from "commander";
import { checkCmd } from "./commands/checkCmd";
import { lspCmd } from "./commands/lspCmd";
import { compileCmd } from "./commands/compileCmd";
import { runCmd } from "./commands/runCmd";
import { initCmd } from "./commands/initCmd";
import { formatCmd } from "./commands/formatCmd";
import { makeDocs, checkDocs } from "./commands/docsCmd";
import { publishCmd } from "./commands/publishCmd";
// import { depsInstall } from "./commands/depsCmd";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require("../../package.json");

const cmd = new Command();
cmd.version(packageJson.version);

cmd
  .command("init <package_name>")
  .description("Init a kestrel package")
  .action(initCmd);

cmd
  .command("check")
  .description("Analyse and typecheck the project")
  .action(checkCmd);

cmd
  .command("compile <entrypoint>")
  .option("--out <path>")
  .option("--optimize")
  .description("Compile the entrypoint into a js file")
  .action(compileCmd);

// const deps = program.command("deps").description("Manage dependencies");
// deps.command("install").description("Install dependencies").action(depsInstall);

const docs = cmd.command("docs").description("Manage documentation");
docs.command("make").description("Create the docs.json file").action(makeDocs);
docs
  .command("check")
  .description("Check that the docs.json file is up to date")
  .action(checkDocs);

cmd
  .command("format")
  .description("Format a kestrel file")
  .option("--path <path>")
  .option("--write")
  .action(formatCmd);

cmd
  .command("run [entrypoint]")
  .description("Evaluate the given entrypoint")
  .action(runCmd);

cmd
  .command("publish")
  .description("Publish the package into the Kestrel package repository")
  .action(publishCmd);

cmd.command("lsp").description("Run the language server").action(lspCmd);

cmd.parse();
