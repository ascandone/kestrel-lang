import {
  LinkedList,
  linkedListIncludes,
  linkedListToArray,
} from "../data/linkedList";
import { Analysis, IDocument } from "./analyse";
import { CyclicModuleDependency, ErrorInfo } from "./errors";

export type CompilePackageOptions<Doc extends IDocument> = {
  package: string;
  exposedModules: Set<string>;
  packageModules: Record<string, Doc>;
  packageDependencies: Record<string, CompiledPackage<Doc>>;
  onAnalysis?: (analysis: Analysis<Doc>) => void;
};

export type PackageCompilationError = {
  package: string;
  ns: string;
} & ErrorInfo;

export type CompiledPackage<Doc extends IDocument> = {
  package: string;
  errors: Array<PackageCompilationError>;
  modules: Map<string, Analysis<Doc>>;
};

export function compilePackage<Doc extends IDocument>(
  args: CompilePackageOptions<Doc>,
): CompiledPackage<Doc> {
  const w = new PackageWatcher(args);
  return {
    errors: w.errors,
    modules: w.modules,
    package: args.package,
  };
}

/**
 * TODO perf can be improved: rn this takes O(modules.length)
 * We can reduce this to O(staleModules) by
 * navigating the reverse dependency graph
 */
export class PackageWatcher<Doc extends IDocument> {
  public errors: Array<PackageCompilationError> = [];
  public readonly modules = new Map<string, Analysis<Doc>>();

  /**
   * Map each module to its dependencies.
   */
  private readonly trackedDependencies = new Map<
    string,
    Map<string, Analysis<Doc>>
  >();

  constructor(private readonly options: CompilePackageOptions<Doc>) {
    this.reload();
  }

  public upsertDocument(ns: string, document: Doc) {
    this.errors = [];
    // TODO avoid mutating input's data
    this.options.packageModules[ns] = document;
    this.reload();
  }

  private reload() {
    for (const entry of Object.entries(this.options.packageModules)) {
      this.analyseModule(...entry);
    }
  }

  private getCachedModule(ns: string): Analysis<Doc> | undefined {
    // Check that each of the tracked dependencies
    // is still the one that we have in the cache
    const isDependencyUpToDate = [
      ...(this.trackedDependencies.get(ns)?.entries() ?? []),
    ].every(([k, v]) => this.getCachedModule(k) === v);

    // If at least one dependency changed, the module has to be recompiled again
    if (!isDependencyUpToDate) {
      return undefined;
    }

    // Otherwise we can just return the version that we have in cache
    const cachedVersion = this.modules.get(ns);

    // as long as the underlying module wasn't updated
    if (
      cachedVersion === undefined ||
      cachedVersion.document.getText() !==
        this.options.packageModules[ns]?.getText()
    ) {
      return undefined;
    }

    return cachedVersion;
  }

  // Decorator for analyseModule
  private cacheAnalyseModule = (
    analyseModule: (
      ns: string,
      document: Doc,
      path?: LinkedList<string>,
    ) => Analysis<Doc>,
  ): typeof analyseModule => {
    return (ns, source, path) => {
      const cacheLookup = this.getCachedModule(ns);
      if (cacheLookup !== undefined) {
        return cacheLookup;
      }

      // Since we are starting analyse from scratch, we'll purge this ns' tracked deps
      this.trackedDependencies.set(ns, new Map());
      const analysis = analyseModule(ns, source, path);
      this.options.onAnalysis?.(analysis);
      this.modules.set(ns, analysis);
      return analysis;
    };
  };

  private getExternalDependency(dependencyNs: string) {
    for (const compiledPackageDep of Object.values(
      this.options.packageDependencies,
    )) {
      // Unexposed modules aren't in this map
      const d = compiledPackageDep.modules.get(dependencyNs);
      if (d !== undefined) {
        return d;
      }
    }

    return undefined;
  }

  private getDependency(path: LinkedList<string>, dependencyNs: string) {
    // If this is a local package, visit recursively
    const untypedMod = this.options.packageModules[dependencyNs];
    if (untypedMod !== undefined) {
      if (linkedListIncludes(path, dependencyNs)) {
        // TODO emit actual range
        this.errors.push({
          description: new CyclicModuleDependency(linkedListToArray(path)),
          ns: dependencyNs,
          package: this.options.package,
          range: {
            start: { character: 0, line: 0 },
            end: { character: 0, line: 0 },
          },
        });
        return;
      }

      return this.analyseModule(dependencyNs, untypedMod, path);
    }

    return this.getExternalDependency(dependencyNs);
  }

  private analyseModule = this.cacheAnalyseModule(
    (ns, document, path): Analysis<Doc> => {
      return new Analysis<Doc>(this.options.package, ns, document, {
        getDependency: (dependencyNs) => {
          const dep = this.getDependency([ns, path], dependencyNs);

          if (dep !== undefined) {
            this.trackedDependencies.get(ns)!.set(dependencyNs, dep);
          }
          return dep;
        },
      });
    },
  );
}
