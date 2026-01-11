import { nestedMapGetOrPutDefault } from "./defaultMap";

export class NestedMap<K1, K2, V> {
  public readonly inner = new Map<K1, Map<K2, V>>();

  public get(k1: K1, k2: K2): V | undefined {
    return nestedMapGetOrPutDefault(this.inner, k1).get(k2);
  }

  public set(k1: K1, k2: K2, value: V) {
    return nestedMapGetOrPutDefault(this.inner, k1).set(k2, value);
  }

  public *entries() {
    for (const [k1, nested] of this.inner.entries()) {
      for (const [k2, v] of nested.entries()) {
        yield [k1, k2, v] as const;
      }
    }
  }
}
