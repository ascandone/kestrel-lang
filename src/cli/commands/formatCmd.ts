import { readFile, readdir, writeFile } from "fs/promises";
import { EXTENSION, parseModule } from "../common";
import { format } from "../../format";
import { exit } from "process";
import { stat } from "node:fs/promises";
import { join } from "path";

export type FormatOptions = {
  write?: boolean;
  path?: string;
};

export async function formatCmd({ write = false, ...opts }: FormatOptions) {
  let path: string;
  if (opts.path === undefined) {
    // TODO this should be read from config
    path = join(process.cwd(), "src");
  } else {
    path = opts.path;
  }

  const start = Date.now();

  const stat_ = await stat(path);

  let files: string[];
  if (stat_.isFile()) {
    files = [path];
  } else {
    const files_ = await readdir(path, { recursive: true });
    files = files_.filter((f) => f.endsWith(EXTENSION));
  }

  for (const relativeFilePath of files) {
    const filePath = join(path, relativeFilePath);

    const file = await readFile(filePath);
    const fileContent = file.toString();
    const parsed = parseModule(fileContent);
    const formatted = format(parsed);
    if (write) {
      await writeFile(filePath, formatted);
    } else if (formatted !== fileContent) {
      console.error(`${filePath} is not formatted`);
      exit(1);
    }
  }

  const end = Date.now();
  console.log(`Done in ${end - start}ms ✨`);
}
