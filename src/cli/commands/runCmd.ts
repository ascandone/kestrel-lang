import { Worker } from "worker_threads";
import { compilePath } from "../common";
import { exit } from "node:process";

export async function runCmd() {
  const compiled = await compilePath(process.cwd());
  const w = new Worker(compiled, { eval: true });
  w.on("exit", (code) => {
    exit(code);
  });
}
