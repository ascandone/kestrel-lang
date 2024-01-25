import { compilePath } from "../common";
import { writeFile } from "node:fs/promises";

const DEFAULT_OUTPUT_FILE = "./out.js";

export type Options = {
  out?: string;
};

export function compileCmd(
  path: string,
  { out: outPath = DEFAULT_OUTPUT_FILE }: Options,
) {
  const compiled = compilePath(path);
  writeFile(outPath, compiled);
}
