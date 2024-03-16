import * as dec from "ts-decode";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { exit } from "node:process";

const CONFIG_NAME = "kestrel.json";

export type Config = dec.Infer<typeof configDecoder>;

export type Dependency = dec.Infer<typeof dependencyDecoder>;
const dependencyDecoder = dec.oneOf(
  dec
    .object({
      path: dec.string.required,
    })
    .map((o) => ({
      type: "local" as const,
      ...o,
    })),
  dec
    .object({
      git: dec.string.required,
    })
    .map((o) => ({
      type: "git" as const,
      ...o,
    })),
);

export const configDecoder = dec.oneOf(
  dec.object({
    type: dec.hardcoded("application").required,
    "source-directories": dec.array(dec.string).required,
    version: dec.string.optional,
    dependencies: dec.dict(dependencyDecoder).optional,
  }),
  dec.object({
    type: dec.hardcoded("package").required,
    "source-directories": dec.array(dec.string).required,
    name: dec.string.required,
    version: dec.string.required,
    dependencies: dec.dict(dependencyDecoder).optional,
  }),
);

export const defaultConfig = {
  type: "application",
  "source-directories": ["src"],
  dependencies: {
    kestrel_core: {
      git: "https://github.com/ascandone/kestrel-core.git",
    },
  },
};

export async function readConfig(
  root: string = process.cwd(),
): Promise<Config> {
  try {
    const f = await readFile(join(root, CONFIG_NAME));

    const res = configDecoder.decode(JSON.parse(f.toString()));
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

export async function writeConfig(
  path: string,
  config: unknown = defaultConfig,
) {
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
