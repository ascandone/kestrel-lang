export type LinkedList<T> = undefined | [head: T, tail: LinkedList<T>];
export function linkedListToArray<T>(linkedList: LinkedList<T>): T[] {
  const acc: T[] = [];
  while (linkedList !== undefined) {
    const [hd, tl] = linkedList;
    acc.push(hd);
    linkedList = tl;
  }
  return acc;
}

export function linkedListIncludes<T>(
  linkedList: LinkedList<T>,
  value: T,
): boolean {
  while (linkedList !== undefined) {
    const [hd, tl] = linkedList;
    if (hd === value) {
      return true;
    }
    linkedList = tl;
  }
  return false;
}
