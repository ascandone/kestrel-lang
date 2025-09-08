import { KestrelJson } from "./schema";
import { existsSync } from "node:fs";
import { exit } from "node:process";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { kestrelJsonDecoder } from "./decoder";
import * as dec from "ts-decode";

export const CONFIG_NAME = "kestrel.json";

export async function readConfig(
  root: string = process.cwd(),
): Promise<KestrelJson> {
  try {
    const f = await readFile(join(root, CONFIG_NAME));
    const res = kestrelJsonDecoder.decode(JSON.parse(f.toString()));
    if (res.error) {
      console.error(`Invalid config:\n${dec.reasonToXmlString(res.reason)}`);
      exit(1);
    } else {
      return res.value;
    }
  } catch {
    console.error(`Config not found`);
    exit(1);
  }
}

export async function writeConfig(path: string, config: unknown) {
  const kestrelJsonPath = join(path, CONFIG_NAME);
  const configExists = existsSync(kestrelJsonPath);
  if (configExists) {
    console.error(`Config already exists`);
    exit(1);
  }

  const content = JSON.stringify(config, null, 2);
  await writeFile(kestrelJsonPath, content + "\n");
  await mkdir(join(path, "src"));
}
