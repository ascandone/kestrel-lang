import { readFile, writeFile } from "fs/promises";
import { parseModule } from "../common";
import { format } from "../../formatter";
import { exit } from "process";

export type FormatOptions = {
  write?: boolean;
};

export async function formatCmd(
  path: string,
  { write = false }: FormatOptions,
) {
  const start = Date.now();
  const file = await readFile(path);
  const fileContent = file.toString();
  const parsed = parseModule(fileContent);
  const formatted = format(parsed);
  if (write) {
    await writeFile(path, formatted);
  } else if (formatted !== fileContent) {
    console.error(`${path} is not formatted`);
    exit(1);
  }

  const end = Date.now();
  console.log(`Done in ${end - start}ms ✨`);
}
