export type Result<T, Err = string> =
  | { type: "OK"; value: T }
  | { type: "ERR"; error: Err };
