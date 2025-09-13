import { publish } from "../package-manager";

export function publishCmd() {
  const token = process.env.KESTREL_GITHUB_TOKEN;
  if (!token) throw new Error("Please set KESTREL_GITHUB_TOKEN");

  publish(token);
}
