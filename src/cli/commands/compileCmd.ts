import { readFileSync } from "node:fs";
import { exit } from "process";
import { check } from "../common";
import { writeFile } from "node:fs/promises";
import { Compiler } from "../../compiler";
const DEFAULT_OUTPUT_FILE = "./out.js";

const EXTERNS_PATH = `${__dirname}/../../externs/Prelude.js`;

export type Options = {
  out?: string;
};

export function compileCmd(
  path: string,
  { out: outPath = DEFAULT_OUTPUT_FILE }: Options,
) {
  const output = check(path);
  if (output === undefined) {
    exit(1);
  }

  const externsBuf = readFileSync(EXTERNS_PATH);

  const compiler = new Compiler();
  const prelude = compiler.compile(output.prelude);
  const main = compiler.compile(output.main);

  const hasMain = output.main.declarations.some(
    (d) => d.binding.name === "main",
  );

  const execMain = hasMain ? `main.run(() => {})` : "";

  const program = [externsBuf.toString(), prelude, main, execMain, ""];
  const compilationResult = program.join("\n");

  writeFile(outPath, compilationResult);
}
