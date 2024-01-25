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
  { out = DEFAULT_OUTPUT_FILE }: Options,
) {
  const program = check(path);
  if (program === undefined) {
    exit(1);
  }

  const src = compile(program);
  writeFile(out, src);
}
