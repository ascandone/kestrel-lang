import * as semver from "semver";

export type PackageDependencies = Record<string, string>;
export type Resolution = Record<string, string>;

type AsyncLazyList<T> = () => Promise<
  | undefined
  | {
      head: T;
      next: AsyncLazyList<T>;
    }
>;

export function toAsyncList<T>(gen: AsyncIterable<T>): AsyncLazyList<T> {
  const iter = gen[Symbol.asyncIterator]();

  const mkNext = (): AsyncLazyList<T> => {
    let cache:
      | Promise<
          | undefined
          | {
              head: T;
              next: AsyncLazyList<T>;
            }
        >
      | undefined = undefined;

    return async () => {
      if (cache === undefined) {
        cache = iter.next().then((result) =>
          result.done
            ? undefined
            : {
                head: result.value,
                next: mkNext(),
              },
        );
      }

      return cache;
    };
  };

  return mkNext();
}

export async function* fromAsyncList<T>(
  lst: AsyncLazyList<T>,
): AsyncIterableIterator<T> {
  while (true) {
    const cell = await lst();
    if (cell === undefined) {
      break;
    }

    yield cell.head;
    lst = cell.next;
  }
}

export type Store = {
  fetchAvailableVersions: (pkg: string) => Promise<string[]>;
  fetchDependencies: (
    pkg: string,
    version: string,
  ) => Promise<Record<string, string>>;
};

function stringifyObj(obj: Record<string, string>): string {
  const buf: string[] = [];
  const sortedKeys = Object.keys(obj).sort();
  for (const key of sortedKeys) {
    buf.push(`${key}@${obj[key]!}`);
  }
  return buf.join(",");
}

class Solver {
  private cache = new Map<string, AsyncLazyList<Resolution>>();

  constructor(private store: Store) {}

  async *solveAll(
    resolution: Resolution,
    constraints: [string, string][],
  ): AsyncGenerator<Resolution> {
    // TODO improv eff. with proper data structure
    const [hd, ...tl] = constraints;

    if (hd === undefined) {
      yield resolution;
      return;
    }

    const [pkg, constraint] = hd;
    const solutions = this.solveWith(resolution, pkg, constraint);

    for await (const solution of solutions) {
      yield* this.solveAll(solution, tl);
    }
  }

  async *solveWith(
    resolution: Resolution,
    pkg: string,
    constraint: string,
  ): AsyncGenerator<Resolution> {
    const key = `${pkg}@${constraint}<-${stringifyObj(resolution)}`;

    const lookup = this.cache.get(key);
    if (lookup !== undefined) {
      yield* fromAsyncList(lookup);
      return;
    }

    const lazyList = toAsyncList(
      this.solveWith__raw(resolution, pkg, constraint),
    );

    this.cache.set(key, lazyList);

    yield* fromAsyncList(lazyList);
  }

  async *solveWith__raw(
    resolution: Resolution,
    pkg: string,
    constraint: string,
  ): AsyncGenerator<Resolution> {
    const pkgResolution = resolution[pkg];
    if (pkgResolution !== undefined) {
      if (semver.satisfies(pkgResolution, constraint)) {
        yield resolution;
      }
      return;
    }

    // We know right away those versions won't satisfy the conditions so we discard them
    const acceptableVersions = (await this.store.fetchAvailableVersions(pkg))
      .filter(
        (availableVersion) =>
          (resolution[pkg] === undefined ||
            semver.eq(resolution[pkg], availableVersion)) &&
          semver.satisfies(availableVersion, constraint),
      )
      .sort((prec, succ) => semver.compare(succ, prec));

    for (const acceptableVersion of acceptableVersions) {
      // This is a candidate solution.
      // but first we need to check that, using this solution, we can also solve
      // this version's dependencies as well
      const updatedResolution: Resolution = {
        ...resolution,
        [pkg]: acceptableVersion,
      };

      const candidateVersionDependencies = await this.store.fetchDependencies(
        pkg,
        acceptableVersion,
      );

      yield* this.solveAll(
        updatedResolution,
        Object.entries(candidateVersionDependencies),
      );
    }
  }
}

export async function solve(
  deps: PackageDependencies,
  store: Store,
): Promise<Resolution | undefined> {
  // The constraints we still need to process
  const pendingQueue = Object.entries(deps);
  const solutions = new Solver(store).solveAll({}, pendingQueue);

  const x = await solutions.next();
  if (x.done) {
    return undefined;
  }

  return x.value;
}
