import { check } from "../check";

export function checkCmd(path: string) {
  const program = check(path);
  if (program === undefined) {
    return;
  }

  console.log("Found no errors ✅");
}
