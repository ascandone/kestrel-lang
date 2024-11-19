// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defaultRecordGet<K extends keyof any, V>(
  r: Record<K, NonNullable<V>>,
  k: K,
  makeDefault: () => NonNullable<V>,
): V {
  const lookup = r[k];
  if (lookup !== undefined) {
    return lookup;
  }
  const defaultValue = makeDefault();
  r[k] = defaultValue;
  return defaultValue;
}

export function defaultWeakmapGet<K extends object, V>(
  wm: WeakMap<K, NonNullable<V>>,
  k: K,
  makeDefault: () => NonNullable<V>,
) {
  const lookup = wm.get(k);
  if (lookup !== undefined) {
    return lookup;
  }

  const defaultValue = makeDefault();
  wm.set(k, defaultValue);
  return defaultValue;
}
