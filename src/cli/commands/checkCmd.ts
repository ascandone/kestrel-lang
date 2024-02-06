import { check } from "../common";

export async function checkCmd() {
  const program = await check(process.cwd());
  if (program === undefined) {
    return;
  }

  console.log("Found no errors ✅");
}
