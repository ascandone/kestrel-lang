export class DefaultMap<K, V> {
  public readonly inner = new Map<K, V>();
  constructor(private readonly init: (k: K) => V) {}

  public get(k: K): V {
    const lookup = this.inner.get(k);
    if (lookup !== undefined) {
      return lookup;
    }

    const value = this.init(k);
    this.inner.set(k, value);
    return value;
  }
}
