import { check } from "../common";

export async function checkCmd(path: string) {
  const program = await check(path);
  if (program === undefined) {
    return;
  }

  console.log("Found no errors ✅");
}
