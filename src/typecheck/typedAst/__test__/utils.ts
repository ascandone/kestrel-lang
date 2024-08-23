import { Position, Range } from "../../../parser";

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

export function positionOf(
  src: string,
  subStr: string = src,
  occurrenceNumber: number = 1,
): Position {
  const index = indexOf(src, subStr, occurrenceNumber);
  if (index === undefined) {
    throw new Error("Invalid index");
  }

  return offsetToPosition(src, index);
}

export function rangeOf(
  src: string,
  subStr: string = src,
  occurrenceNumber: number = 1,
): Range {
  const index = indexOf(src, subStr, occurrenceNumber);
  if (index === undefined) {
    throw new Error("Invalid index");
  }

  const offsetStart = index;
  const offsetEnd = index + subStr.length;

  return {
    start: offsetToPosition(src, offsetStart),
    end: offsetToPosition(src, offsetEnd),
  };
}

// TODO dedup
function offsetToPosition(src: string, offset: number): Position {
  let line = 0,
    character = 0;

  for (const ch of src) {
    if (offset === 0) {
      break;
    }

    offset--;
    if (ch === "\n") {
      line++;
      character = 0;
    } else {
      character++;
    }
  }

  return { line, character };
}
