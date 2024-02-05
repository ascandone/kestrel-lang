import { writeConfig } from "../config";

export async function initCmd() {
  const path = process.cwd();
  await writeConfig(path);
}
