import { exit } from "process";
import { check } from "../check";
import { writeFile } from "node:fs/promises";
import { compile } from "../../compiler";
const DEFAULT_OUTPUT_FILE = "./out.js";

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

  const prelude = compile(output.prelude);
  const main = compile(output.main);
  if (prelude === "") {
    // TODO remove this
    writeFile(outPath, main);
  } else {
    writeFile(outPath, `${prelude}\n\n\n${main}`);
  }
}
