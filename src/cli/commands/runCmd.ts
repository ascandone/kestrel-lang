import { Worker } from "worker_threads";
import { compilePath } from "../common";

export async function runCmd(path: string) {
  const compiled = await compilePath(path);
  new Worker(compiled, { eval: true });
}
