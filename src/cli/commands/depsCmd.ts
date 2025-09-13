import { install } from "../package-manager/install";

export async function depsInstall() {
  await install();
}
