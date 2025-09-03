export function mapGetOrPutDefault<K, V>(
  map: Map<K, V>,
  key: K,
  init: (key: K) => V,
): V {
  const lookup = map.get(key);
  if (lookup !== undefined) {
    return lookup;
  }

  const value = init(key);
  map.set(key, value);
  return value;
}

export function nestedMapGetOrPutDefault<K, K1, V>(
  map: Map<K, Map<K1, V>>,
  key: K,
): Map<K1, V> {
  return mapGetOrPutDefault(map, key, () => new Map<K1, V>());
}
export class DefaultMap<K, V> {
  public readonly inner = new Map<K, V>();
  constructor(private readonly init: (k: K) => V) {}

  public get(k: K): V {
    return mapGetOrPutDefault(this.inner, k, this.init);
  }
}

export function* nestedMapEntries<K, K1, V>(map: Map<K, Map<K1, V>>) {
  for (const [k1, inner] of map) {
    for (const [k2, value] of inner) {
      yield [k1, k2, value] as const;
    }
  }
}
