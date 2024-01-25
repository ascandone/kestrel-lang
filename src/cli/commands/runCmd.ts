import { compilePath } from "../common";

export function runCmd(path: string) {
  const compiled = compilePath(path);
  const f = new Function(compiled);
  f();
}
