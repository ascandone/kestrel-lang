export function sanitizeNamespace(ns: string): string {
  return ns?.replace(/\//g, "$");
}
