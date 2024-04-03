import { Span } from "../../../parser";

export function indexOf(
  src: string,
  subStr: string = src,
  occurrenceNumber: number = 1,
): number | undefined {
  let lastOccurrenceIndex = -1;
  for (let i = 0; i < occurrenceNumber; i++) {
    lastOccurrenceIndex = src.indexOf(subStr, lastOccurrenceIndex + 1);
    if (lastOccurrenceIndex === -1) {
      return undefined;
    }
  }
  return lastOccurrenceIndex;
}

export function spanOf(
  src: string,
  subStr: string = src,
  occurrenceNumber: number = 1,
): Span {
  const index = indexOf(src, subStr, occurrenceNumber);
  if (index === undefined) {
    throw new Error("Invalid index");
  }

  return [index, index + subStr.length];
}
