import { readFileSync } from "node:fs";
import { unsafeParse } from "../parser";
import { typecheck, TypesPool } from "../typecheck/typecheck";
import { Context } from "../typecheck/unify";

// __dirname is src/dist/cli
const PRELUDE_PATH = `${__dirname}/../../src/prelude.mrs`;

export function readPrelude(): { types: TypesPool; context: Context } {
  const f = readFileSync(PRELUDE_PATH);
  const src = f.toString();

  const parsed = unsafeParse(src);

  const context: Context = {};
  const types: TypesPool = {};

  const [, errors] = typecheck(parsed, context, types);
  if (errors.length !== 0) {
    throw new Error("[unreachable] errors compiling prelude");
  }

  return { types, context };
}
