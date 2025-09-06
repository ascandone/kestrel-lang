import { check } from "../common";
import { exit } from "node:process";
export async function checkCmd() {
  const program = await check(process.cwd());
  if (program === undefined) {
    return exit(1);
  }

  console.log("Found no errors ✅");
  return program;
}
