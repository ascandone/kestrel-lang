import { KestrelJson } from "./schema";
import { existsSync } from "node:fs";
import { exit } from "node:process";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { kestrelJsonDecoder } from "./decoder";
import * as dec from "ts-decode";

export const CONFIG_NAME = "kestrel.json";

export async function tryReadingConfig(
  root: string = process.cwd(),
): Promise<KestrelJson> {
  try {
    const f = await readFile(join(root, CONFIG_NAME));
    const res = kestrelJsonDecoder.decode(JSON.parse(f.toString()));
    if (res.error) {
      throw new Error(`Invalid config:\n${dec.reasonToXmlString(res.reason)}`);
    }
    return res.value;
  } catch {
    throw new Error(`Config not found`);
  }
}

export async function readConfigOrExit(
  root: string = process.cwd(),
): Promise<KestrelJson> {
  try {
    return await tryReadingConfig(root);
  } catch (e: unknown) {
    if (!(e instanceof Error)) {
      throw e;
    }

    console.error(e.message);
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
