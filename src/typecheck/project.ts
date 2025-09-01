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

  private readonly inverseDependencyGraph = new DefaultMap<string, Set<string>>(
    () => new Set(),
  );

  constructor(
    private readonly rawProject: RawProject,
    private readonly projectOptions: Partial<ProjectOptions> = {},
  ) {}

  // -- public API

  public upsert(package_: string, moduleId: string, module: UntypedModule) {
    throw new Error("unimplemented: upsert");
  }
  public delete(package_: string, moduleId: string) {
    throw new Error("unimplemented: delete");
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
  private invalidateCache(moduleId: string) {}

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
    const importErrors: err.ErrorInfo[] = [];
    const output = typecheck(package_, moduleId, module, {
      getDependency: (moduleId: string) => {
        // TODO prevent cycles

        const resolved = this.resolveModule(moduleId, package_);
        if (resolved.type === "ERR") {
          return resolved;
        }

        const [resolvedPackage, rawModule] = resolved.value;
        const [output] = this.typecheckModule(
          resolvedPackage,
          moduleId,
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
