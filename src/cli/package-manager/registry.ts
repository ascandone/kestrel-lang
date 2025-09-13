import { existsSync } from "fs";
import { exec as execSync } from "node:child_process";
import { promisify } from "node:util";
import path from "path";
import os from "os";
import * as dec from "ts-decode";

const exec = promisify(execSync);

export const REGISTRY_DEFAULT_FOLDER = path.join(
  os.homedir(),
  ".kestrel",
  "registry",
);

export const REGISTRY_REPO = "https://github.com/ascandone/kestrel-packages";

export async function fetchRegistry() {
  if (existsSync(REGISTRY_DEFAULT_FOLDER)) {
    console.info("Updating registry...");
    await exec(`git fetch --depth 1 origin main`, {
      cwd: REGISTRY_DEFAULT_FOLDER,
    });
    await exec(`git reset --hard FETCH_HEAD`, {
      cwd: REGISTRY_DEFAULT_FOLDER,
    });
  } else {
    console.info("Cloning registry...");
    await exec(
      `git clone --depth 1 ${REGISTRY_REPO} ${REGISTRY_DEFAULT_FOLDER}`,
    );
  }

  return REGISTRY_DEFAULT_FOLDER;
}

// registry.json
export type RegistryEntry = dec.Infer<typeof registryEntryDecoder>;
export const registryEntryDecoder = dec.object({
  name: dec.string.optional, // <- ??
  description: dec.string.required,
  tags: dec.array(dec.string).default([]),
  latestVersion: dec.string.required,
  author: dec.string.required,
});
export type RegistryJson = dec.Infer<typeof registryJsonDecoder>;
export const registryJsonDecoder = dec.dict(registryEntryDecoder);

// [pkg]/versions.json
export type VersionEntry = dec.Infer<typeof versionEntry>;
export const versionEntry = dec.object({
  dependencies: dec.dict(dec.string).required,
});

export type VersionsJson = dec.Infer<typeof versionsJsonDecoder>;
export const versionsJsonDecoder = dec.object({
  versions: dec.dict(versionEntry).required,
});
