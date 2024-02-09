import { readFile, writeFile } from "fs/promises";
import { parseModule } from "../common";
import { format } from "../../formatter";

export async function formatCmd(path: string) {
  const start = Date.now();
  const file = await readFile(path);
  const parsed = parseModule(file.toString());
  const formatted = format(parsed);
  await writeFile(path, formatted);
  const end = Date.now();
  console.log(`Done in ${end - start}ms ✨`);
}
