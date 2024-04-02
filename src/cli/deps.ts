import { promisify } from "node:util";
import { exec } from "node:child_process";
import * as dec from "ts-decode";
import { col } from "../utils/colors";
import { readFile, rm, writeFile } from "node:fs/promises";
import { Config } from "./config";
import * as paths from "./paths";

const execP = promisify(exec);

function logInfo(msg: string) {
  process.stdout.write(`${col.blue.tag`[info]`} ${msg}\n`);
}

export type LockFilePackage = {
  type: "git";
  repo: string;
  hash: string;
};

export type LockFile = {
  packages: Record<string, LockFilePackage>;
};

const packageDecoder: dec.Decoder<LockFilePackage> = dec.object({
  type: dec.hardcoded("git").required,
  repo: dec.string.required,
  hash: dec.string.required,
});

export const lockFileDecoder: dec.Decoder<LockFile> = dec.object({
  packages: dec.dict(packageDecoder).required,
});

async function writeLockFile(path: string, lockfile: LockFile) {
  const fileName = paths.lockfile(path);
  const content = JSON.stringify(lockfile, null, 2);
  await writeFile(fileName, content + "\n");
}

async function readLockFile(path: string): Promise<LockFile | undefined> {
  const fileName = paths.lockfile(path);
  try {
    const content = await readFile(fileName);
    const json = JSON.parse(content.toString());

    const decoded = lockFileDecoder.decode(json);
    if (decoded.error) {
      return undefined;
    }

    return decoded.value;
  } catch {
    return undefined;
  }
}

async function getCurrentRepoHash(
  dependencyPath: string,
): Promise<string | undefined> {
  try {
    const { stdout: hash } = await execP(`git rev-parse HEAD`, {
      cwd: dependencyPath,
    });

    return hash.trim();
  } catch {
    return undefined;
  }
}

async function cloneGitDep(dependencyPath: string, repo: string) {
  try {
    await rm(dependencyPath, { recursive: true, force: true });
  } catch {
    //
  }

  // This raises an err on failure
  await execP(`git clone ${repo} ${dependencyPath}`);

  return getCurrentRepoHash(dependencyPath);
}

async function checkoutGitDep(
  dependencyPath: string,
  hash: string,
  currentHash?: string,
): Promise<"up-to-date" | "updated"> {
  if (currentHash === hash) {
    return "up-to-date";
  }

  await execP(`git fetch`, { cwd: dependencyPath });
  await execP(`git checkout ${hash}`, { cwd: dependencyPath });

  return "updated";
}

export async function fetchGitDep(
  /* mut */ lockfile: LockFile,
  path: string,
  dependencyName: string,
  repo: string,
): Promise<boolean> {
  const dependencyPath = paths.dependency(path, dependencyName);
  const packageLockfileEntry = lockfile.packages[dependencyName];

  const checkoutRepo =
    packageLockfileEntry !== undefined && packageLockfileEntry.type === "git";

  if (checkoutRepo) {
    const currentHash = await getCurrentRepoHash(dependencyPath);
    if (currentHash === undefined) {
      logInfo(`Fetching ${dependencyName} from git...`);
      await cloneGitDep(dependencyPath, repo);
    } else {
      logInfo(`Checking out ${dependencyName}...`);
    }

    const outcome = await checkoutGitDep(
      dependencyPath,
      packageLockfileEntry.hash,
      currentHash,
    );

    switch (outcome) {
      case "updated":
        logInfo(`updated ${dependencyName}`);
        break;
      case "up-to-date":
        logInfo(`${dependencyName} is up to date`);
        break;
    }

    return false;
  } else {
    logInfo(`Fetching ${dependencyName} from git...`);
    const newHash = await cloneGitDep(dependencyPath, repo);
    if (newHash === undefined) {
      throw new Error("Error while creating lockfile");
    }

    if (newHash !== packageLockfileEntry?.hash) {
      lockfile.packages[dependencyName] = {
        type: "git",
        repo,
        hash: newHash,
      };
      return true;
    }

    return false;
  }
}

export async function fetchDeps(path: string, config: Config) {
  let lockfile = await readLockFile(path);
  let updatedLockfile = false;
  if (lockfile === undefined) {
    updatedLockfile = true;
    lockfile = {
      packages: {},
    };
  }

  const deps = Object.entries(config.dependencies ?? {});
  for (const [dependencyName, dep] of deps) {
    switch (dep.type) {
      case "git": {
        const updated = await fetchGitDep(
          lockfile,
          path,
          dependencyName,
          dep.git,
        );

        if (updated) {
          updatedLockfile = true;
        }
      }

      case "local":
        continue;
    }
  }

  if (updatedLockfile) {
    await writeLockFile(path, lockfile);
  }
}
