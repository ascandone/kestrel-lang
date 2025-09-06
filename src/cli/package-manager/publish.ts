import {
  JsonPublishConfig,
  kestrelJsonPublishDecoder,
  readConfig,
} from "../kestrel-json";
import { create } from "tar";
import { join } from "node:path";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import {
  fetchRegistry,
  registryEntryDecoder,
  RegistryEntry,
  RegistryJson,
  VersionsJson,
  VersionEntry,
  versionsJsonDecoder,
} from "./registry";
import { existsSync } from "node:fs";
import { makeProjectDoc } from "../commands/docsCmd/documentation";
import { checkCmd } from "../commands/checkCmd";
import { TypedProject } from "../../typecheck/project";
import { exec as execSync } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execSync);

export async function publish(token: string) {
  const config = kestrelJsonPublishDecoder.decodeUnsafeThrow(
    await readConfig(),
  );

  // TODO check semantic version diff
  const typedProject = await checkCmd();
  if (typedProject === undefined) {
    throw new Error("Error while checking");
  }

  const registryRepoPath = await fetchRegistry();

  // -- paths
  const packageFolderPath = join(registryRepoPath, config.name);
  const versionsJsonPath = join(packageFolderPath, "versions.json");
  const packageVersionFolderPath = join(
    registryRepoPath,
    config.name,
    config.version,
  );
  // --

  if (!existsSync(packageFolderPath)) {
    mkdir(packageFolderPath);
  }

  const author = await getGithubUsername(token);
  await updateRegistryJson(registryRepoPath, author, config);

  await updateVersionsJson(config, versionsJsonPath);

  if (!existsSync(packageVersionFolderPath)) {
    await mkdir(packageVersionFolderPath);
  }

  await cp("README.md", join(packageVersionFolderPath, "README.md"));

  await writeFile(
    join(packageVersionFolderPath, "docs.json"),
    getDocsJson(config, typedProject),
  );

  // TODO maybe temp folder?
  const gzipName = await createTarball(config);
  try {
    await cp(gzipName, join(packageVersionFolderPath, gzipName));
  } finally {
    rm(gzipName);
  }

  await createPR({
    token: token,
    registryPath: registryRepoPath,
    package_: config.name,
    username: author,
    version: config.version,
  });
}

function getDocsJson(config: JsonPublishConfig, typedProject: TypedProject) {
  const projectDoc = makeProjectDoc(
    config.name ?? "",
    config.version,
    typedProject,
    new Set(config.exposedModules),
  );

  return JSON.stringify(projectDoc, null, 2);
}

/** Update the `[pkg]/versions.json` file */
async function updateVersionsJson(
  config: JsonPublishConfig,
  versionsJsonPath: string,
) {
  const versionsJsonEntry: VersionEntry = {
    dependencies: config.dependencies ?? {},
  };

  if (!existsSync(versionsJsonPath)) {
    const versions: VersionsJson = {
      versions: {
        [config.version]: versionsJsonEntry,
      },
    };

    await writeFile(versionsJsonPath, JSON.stringify(versions, null, 2));
  } else {
    const raw = (await readFile(versionsJsonPath)).toString();
    const previousVersionsJson = versionsJsonDecoder.decodeUnsafeThrow(
      JSON.parse(raw),
    );
    previousVersionsJson.versions[config.version] = versionsJsonEntry;
    await writeFile(
      versionsJsonPath,
      JSON.stringify(previousVersionsJson, null, 2),
    );
  }
}

// TODO return the version bump type (major/minor/patch)
/** Update the `/registry.json` file  */
async function updateRegistryJson(
  registryPath: string,
  author: string,
  config: JsonPublishConfig,
): Promise<void> {
  const registryJsonPath = join(registryPath, "registry.json");

  const registryJson: RegistryJson = JSON.parse(
    (await readFile(registryJsonPath)).toString(),
  );

  const registryEntry: RegistryJson["name"] | undefined =
    registryJson[config.name];

  let entry: RegistryEntry;
  if (registryEntry === undefined) {
    // creating the package
    entry = {
      name: config.name,
      description: config.description,
      author,
      latestVersion: config.version,
      tags: config.tags ?? [],
    };
  } else {
    // adding a new version
    const decoded = registryEntryDecoder.decodeUnsafeThrow(registryEntry);
    entry = {
      ...decoded,
      latestVersion: config.version,
    };
  }

  registryJson[config.name] = entry;

  await writeFile(registryJsonPath, JSON.stringify(registryJson, null, 2));
}

async function listKesFiles(dir: string, buf: string[]): Promise<void> {
  const files = await readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = join(dir, file.name);

    if (file.isDirectory()) {
      listKesFiles(fullPath, buf);
    } else if (
      file.isFile() &&
      (file.name.endsWith(".kes") || file.name.endsWith(".js"))
    ) {
      buf.push(fullPath);
    }
  }
}

async function getGithubUsername(token: string): Promise<string> {
  const res = await fetch("https://api.github.com/user", {
    headers: { Authorization: `token ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch GitHub user");
  const data = await res.json();
  return data.login; // GitHub username
}

async function createTarball(config: JsonPublishConfig) {
  const entries = ["kestrel.json"];
  for (const src of config.sources) {
    await listKesFiles(src, entries);
  }

  const gzipName = `${config.name}-${config.version}.tar.gz`;
  await create(
    {
      gzip: true,
      file: gzipName,
    },
    entries,
  );

  console.info(`Created ${gzipName}`);

  return gzipName;
}

async function createPR(args: {
  token: string;
  registryPath: string;
  package_: string;
  version: string;
  username: string;
}) {
  const versionedPackage = `${args.package_}@${args.version}`;
  const branchName = `publish/${versionedPackage}`;

  const opts = { cwd: args.registryPath };

  await exec(`git add .`, opts);
  try {
    await exec(`git branch ${branchName}`, opts);
  } catch {}
  await exec(`git checkout ${branchName}`, opts);
  await exec(`git commit -m "Publish ${versionedPackage}"`, opts);
  await exec(`git push origin ${branchName}`, opts);

  const OWNER = "ascandone",
    REPO = "kestrel-packages";

  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/pulls`,
    {
      method: "POST",
      headers: {
        Authorization: `token ${args.token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: branchName,
        head: `${args.username}:${branchName}`,
        base: "main",
        body: "",
      }),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${errText}`);
  }

  const pr = await response.json();
  console.info("PR created:", pr.html_url);
}
