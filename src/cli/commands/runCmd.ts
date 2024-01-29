import { Worker } from "worker_threads";
import { compilePath } from "../common";

export function runCmd(path: string) {
  const compiled = compilePath(path);
  new Worker(compiled, { eval: true });
}
