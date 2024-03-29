import { compilePath } from "../common";
import { writeFile } from "node:fs/promises";

const DEFAULT_OUTPUT_FILE = "./out.js";

export type Options = {
  out?: string;
  optimize?: boolean;
};

export async function compileCmd(
  entryPoint: string,
  { out: outPath = DEFAULT_OUTPUT_FILE, optimize = false }: Options,
) {
  const start = Date.now();
  const compiled = await compilePath(process.cwd(), entryPoint, optimize);
  writeFile(outPath, compiled);
  const end = Date.now();

  console.log(
    `Compiled ${entryPoint}.kes into ${outPath} in ${end - start}ms ✨`,
  );
}
