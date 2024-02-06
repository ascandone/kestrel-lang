import { Worker } from "worker_threads";
import { compilePath } from "../common";

export async function runCmd() {
  const compiled = await compilePath(process.cwd());
  new Worker(compiled, { eval: true });
}
