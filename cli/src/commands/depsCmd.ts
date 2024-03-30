import { readConfig } from "../../../core/src/cli/config";
import { fetchDeps } from "../../../core/src/cli/common";

export async function depsInstall() {
  const path = process.cwd();
  const config = await readConfig(path);
  fetchDeps(path, config);
}
