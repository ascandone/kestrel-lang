import { readFile, writeFile } from "fs/promises";
import { KestrelJson, readConfig } from "../kestrel-json";
import { solve } from "./solver";
import { Fetcher } from "./store";
import * as dec from "ts-decode";
import semver from "semver";
import fs from "fs";
import * as tar from "tar";
import https from "https";
import path from "path";

const KESTREL_LOCK = "kestrel-lock.json";

export async function install() {
  const config = await readConfig();
  const resolvedLockFile = await installLockFile(config);

  for (const [package_, version] of Object.entries(resolvedLockFile)) {
    // TODO only download if dependency is changed

    const URL = `https://raw.githubusercontent.com/ascandone/kestrel-packages/main/${package_}/${version}/${package_}-${version}.tar.gz`;
    await downloadAndExtract(URL, `./deps/${package_}`);
  }

  console.info("Done! ✅");
}

async function installLockFile(config: KestrelJson) {
  const lockFile = await readUpToDateLockFile(config.dependencies);
  if (lockFile !== undefined) {
    // we already have the solution
    console.info("up-to-date kestrel.lock");
    return lockFile;
  }

  // resolve again
  console.info("stale kestrel.lock");

  // TODO this would allow mutually exclusive "dependencies" and "devDependencies" constraints
  const solution = await solve(
    {
      ...config.dependencies,
      ...config.devDependencies,
    },
    new Fetcher(),
  );
  if (solution === undefined) {
    throw new Error("cannot find resolution");
  }

  await writeFile(KESTREL_LOCK, JSON.stringify(solution, null, 2));
  console.info("updated kestrel.lock");

  return solution;
}
export function downloadAndExtract(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Ensure destination exists
    fs.mkdirSync(dest, { recursive: true });

    const tempFile = path.join(dest, "temp.tgz");
    const file = fs.createWriteStream(tempFile);

    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`Failed to download: ${res.statusCode}`));
        }

        res.pipe(file);

        file.on("finish", () => {
          file.close(); // done writing

          // Extract tarball
          tar
            .x({ file: tempFile, cwd: dest, gzip: true })
            .then(() => {
              fs.unlinkSync(tempFile); // remove temp file
              resolve();
            })
            .catch(reject);
        });
      })
      .on("error", reject);
  });
}

async function readUpToDateLockFile(deps: KestrelJson["dependencies"]) {
  try {
    const lockFileRaw = await readFile(KESTREL_LOCK);
    const lockFile = lockFileDecoder.decodeUnsafeThrow(
      JSON.parse(lockFileRaw.toString()),
    );
    if (isLockFileStale(lockFile, deps)) {
      return undefined;
    }

    return lockFile;
  } catch {
    return undefined;
  }
}

function isLockFileStale(
  lockFile: Record<string, string>,
  deps: KestrelJson["dependencies"] = {},
): boolean {
  for (const [package_, requiredRng] of Object.entries(deps)) {
    const locked = lockFile[package_];
    if (locked === undefined || !semver.satisfies(locked, requiredRng)) {
      return true;
    }
  }

  return false;
}

const lockFileDecoder = dec.dict(dec.string);
