// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defaultRecordGet<K extends keyof any, T>(
  r: Record<K, T>,
  k: K,
  makeDefault: () => T,
): T {
  const lookup = r[k];
  if (lookup !== undefined) {
    return lookup;
  }
  const defaultValue = makeDefault();
  r[k] = defaultValue;
  return defaultValue;
}
