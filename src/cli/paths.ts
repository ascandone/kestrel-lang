import { join } from "node:path";

export function dependencies(path: string) {
  return join(path, "deps");
}

export function dependency(path: string, name: string) {
  return join(dependencies(path), name);
}

export function lockfile(path: string) {
  const LOCKFILE_NAME = "kestrel.lock";
  return join(path, LOCKFILE_NAME);
}
