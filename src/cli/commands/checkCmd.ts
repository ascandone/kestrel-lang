import { check_REWRITE } from "../common";
import { exit } from "node:process";
export async function checkCmd() {
  const program = await check_REWRITE(process.cwd());
  if (program === undefined) {
    return exit(1);
  }

  console.log("Found no errors ✅");
}
