import { writeFile, readFile } from "fs/promises";
import { makeProjectDoc } from "./docsCmd/documentation";
import { check } from "../common";
import { join } from "node:path";
import { exit } from "process";
import { readConfig } from "../kestrel-json";

const DOCS_JSON_NAME = "docs.json";

async function getDocsJson(root: string) {
  const config = await readConfig(root);
  if (config.version === undefined) {
    console.error("Version is required to generate docs");
    exit(1);
  }

  const typedProject = await check(root);
  if (typedProject === undefined) {
    return;
  }

  const projectDoc = makeProjectDoc(
    config.name ?? "",
    config.version,
    typedProject,
  );
  return JSON.stringify(projectDoc);
}

export async function makeDocs() {
  const root = process.cwd();
  const json = await getDocsJson(root);
  if (json === undefined) {
    return;
  }

  const fileName = join(root, DOCS_JSON_NAME);
  await writeFile(fileName, json);
  console.log(`Created ${fileName}`);
}

export async function checkDocs() {
  const root = process.cwd();

  const fileName = join(root, DOCS_JSON_NAME);

  const oldContent = await readFile(fileName);

  const json = await getDocsJson(root);
  if (json === undefined) {
    return;
  }

  if (oldContent.toString() !== json) {
    console.log(`The docs.json file is not in sync`);
    exit(1);
  }

  console.log(`The docs.json file is in sync ✅`);
}
