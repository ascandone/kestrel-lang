import { KestrelJson } from "./schema";
import * as dec from "ts-decode";

export const kestrelJsonDecoder: dec.Decoder<KestrelJson> = dec.object({
  name: dec.string.optional,
  version: dec.string.optional,
  description: dec.string.optional,
  tags: dec.array(dec.string).optional,
  licence: dec.string.optional,
  exposedModules: dec.array(dec.string).optional,
  sources: dec.array(dec.string).required,
  devSources: dec.array(dec.string).optional,
  dependencies: dec.dict(dec.string).optional,
  devDependencies: dec.dict(dec.string).optional,
  entrypoints: dec.dict(dec.string).optional,
});
