import { compilePath } from "../common";
import { writeFile } from "node:fs/promises";

const DEFAULT_OUTPUT_FILE = "./out.js";

export type Options = {
  out?: string;
};

export async function compileCmd({
  out: outPath = DEFAULT_OUTPUT_FILE,
}: Options) {
  const start = Date.now();
  const compiled = await compilePath(process.cwd());
  writeFile(outPath, compiled);
  const end = Date.now();
  console.log(`Done in ${end - start}ms ✨`);
}
