import { DefaultMap } from "../data/defaultMap";
import { UntypedModule } from "../parser";
import { TypedModule } from "./typedAst";
import * as err from "./errors";
import { TypecheckOptions, typecheck } from "./typecheck";
import { Result } from "../data/result";
import { DependencyProviderError } from "./resolution";

/** e.g. `{ "My/Mod": { pkg_a: ..., pkg_b: ... } }` */
export type RawProject = Map<string, Map<string, UntypedModule>>;

export type ProjectOptions = Pick<
  TypecheckOptions,
  "implicitImports" | "mainType" | "traitImpls"
> & {
  packageDependencies: Map<string, Set<string>>;
};

export class ProjectTypechecker {
  /** e.g. `{ "My/Mod": { pkg_a: ..., pkg_b: ... } }` */
  public readonly compiledProject = new DefaultMap<
    string,
    Map<string, [TypedModule, err.ErrorInfo[]]>
  >(() => new Map());

  /** keys (and values) have the form `${pkg}:${moduleId}` */
  private readonly inverseDependencyGraph = new DefaultMap<string, Set<string>>(
    () => new Set(),
  );

  /**
   * The visit path, used to track cycles
   *
   * Note: we don't track packages because there can't be a dependency cycle between different packages (as the package graph is acyclic)
   */
  private currentPath: string[] = [];

  constructor(
    private readonly rawProject: RawProject,
    private readonly projectOptions: Partial<ProjectOptions> = {},
  ) {}

  // -- public API

  public upsert(package_: string, moduleId: string, module: UntypedModule) {
    this.invalidateCache(package_, moduleId);

    // Add to project
    let packages = this.rawProject.get(moduleId);
    if (packages === undefined) {
      packages = new Map();
      this.rawProject.set(moduleId, packages);
    }
    packages.set(package_, module);
  }

  public delete(package_: string, moduleId: string) {
    this.invalidateCache(package_, moduleId);

    // Delete module
    let packages = this.rawProject.get(moduleId);
    if (packages === undefined) {
      packages = new Map();
      this.rawProject.set(moduleId, packages);
    }
    packages.delete(package_);
  }

  /** typecheck the whole project and returns the set of changed files */
  public typecheck(): Array<{
    package_: string;
    moduleId: string;
    output: [TypedModule, err.ErrorInfo[]];
  }> {
    // no worklist: initial load
    for (const [moduleId, modules] of this.rawProject.entries()) {
      for (const [package_, untypedModule] of modules.entries()) {
        this.typecheckModule(package_, moduleId, untypedModule);
      }
    }

    const changedModules = this.changedModules;
    this.changedModules = [];
    return changedModules;
  }

  // -- internal

  private changedModules: Array<{
    package_: string;
    moduleId: string;
    output: [TypedModule, err.ErrorInfo[]];
  }> = [];

  /** recursively invalidate cache */
  private invalidateCache(package_: string, moduleId: string) {
    this.compiledProject.get(moduleId).delete(package_);

    // TODO add to work list so that we don't have to iterate the whole project
    const key = `${package_}:${moduleId}`;

    const revDeps = this.inverseDependencyGraph.get(key);
    for (const key_ of revDeps) {
      // TODO maybe use different data structure?
      const [package2, moduleId2] = key_.split(":");
      this.invalidateCache(package2!, moduleId2!);
    }

    this.inverseDependencyGraph.inner.set(key, new Set());
  }

  private resolveModule(
    requestedModuleId: string,
    callerPackage: string,
  ): Result<
    [package_: string, module: UntypedModule],
    DependencyProviderError
  > {
    const modules = this.rawProject.get(requestedModuleId);
    if (modules === undefined) {
      // TODO maybe this could be an exception? should it even happen?
      return { type: "ERR", error: { type: "UNBOUND_MODULE" } };
    }

    const visibleModules = [...modules.entries()].filter(([pkg]) => {
      if (callerPackage === pkg) {
        return true;
      }

      const deps =
        this.projectOptions.packageDependencies?.get(callerPackage) ??
        new Set();

      return deps.has(pkg);
    });

    if (visibleModules.length === 0) {
      return { type: "ERR", error: { type: "UNBOUND_MODULE" } };
    }

    if (visibleModules.length !== 1) {
      return {
        type: "ERR",
        error: {
          type: "AMBIGUOUS_IMPORT",
          packages: visibleModules.map((m) => m[0]),
        },
      };
    }

    if (this.currentPath.includes(requestedModuleId)) {
      return {
        type: "ERR",
        error: { type: "CYCLIC_DEPENDENCY", path: this.currentPath },
      };
    }

    return { type: "OK", value: visibleModules[0]! };
  }

  private typecheckModule(
    package_: string,
    moduleId: string,
    module: UntypedModule,
  ): [TypedModule, err.ErrorInfo[]] {
    const cached = this.compiledProject.get(moduleId)?.get(package_);
    if (cached !== undefined) {
      return cached;
    }

    const out = this.typecheckModule__raw(package_, moduleId, module);
    this.compiledProject.get(moduleId).set(package_, out);
    return out;
  }

  private typecheckModule__raw(
    package_: string,
    moduleId: string,
    module: UntypedModule,
  ): [TypedModule, err.ErrorInfo[]] {
    this.currentPath.push(moduleId);

    const importErrors: err.ErrorInfo[] = [];
    const output = typecheck(package_, moduleId, module, {
      getDependency: (dependencyModuleId: string) => {
        const resolved = this.resolveModule(dependencyModuleId, package_);
        if (resolved.type === "ERR") {
          return resolved;
        }

        // TODO it's not super correct not to do this if the resolution fails
        // (we risk stale dependencies if there are imports errs)

        this.inverseDependencyGraph
          .get(`${resolved.value[0]}:${dependencyModuleId}`)
          .add(`${package_}:${moduleId}`);

        const [resolvedPackage, rawModule] = resolved.value;
        const [output] = this.typecheckModule(
          resolvedPackage,
          dependencyModuleId,
          rawModule,
        );

        return { type: "OK", value: output.moduleInterface };
      },
      ...this.projectOptions,
    });

    this.changedModules.push({ package_, moduleId, output });
    output[1].push(...importErrors);
    return output;
  }
}
