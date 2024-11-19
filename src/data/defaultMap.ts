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

export interface MapLike<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): this;
}

export function defaultMapGet<K, V>(
  wm: MapLike<K, NonNullable<V>>,
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
