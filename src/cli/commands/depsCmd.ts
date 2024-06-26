import { readConfig } from "../config";
import { fetchDeps } from "../deps";

export async function depsInstall() {
  const path = process.cwd();
  const config = await readConfig(path);
  fetchDeps(path, config);
}
