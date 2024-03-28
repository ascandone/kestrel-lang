import { Worker } from "worker_threads";
import { compilePath } from "../common";
import { exit } from "node:process";

export async function runCmd(entryPoint: string | undefined) {
  const compiled = await compilePath(process.cwd(), entryPoint);
  const w = new Worker(compiled, { eval: true });
  w.on("exit", (code) => {
    exit(code);
  });
}
