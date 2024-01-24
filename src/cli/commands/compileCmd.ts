import { exit } from "process";
import { check } from "../check";
import { writeFile } from "node:fs/promises";
import { compile } from "../../compiler";
const OUTPUT_FILE = "./out.js";

export function compileCmd(path: string) {
  const program = check(path);
  if (program === undefined) {
    exit(1);
  }

  const src = compile(program);
  writeFile(OUTPUT_FILE, src);
}
