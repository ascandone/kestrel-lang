import { readConfig } from "../config";
import { fetchDeps } from "../common";

export async function depsInstall() {
  const config = await readConfig(process.cwd());
  fetchDeps(config);
}
