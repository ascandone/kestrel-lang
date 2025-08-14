export function getOrInsertDefault<K, V>(
  m: Map<K, NonNullable<V>>,
  k: K,
  getDefault: () => NonNullable<V>,
) {
  const lookup = m.get(k);
  if (lookup !== undefined) {
    return lookup;
  }

  const def = getDefault();
  m.set(k, def);
  return def;
}
