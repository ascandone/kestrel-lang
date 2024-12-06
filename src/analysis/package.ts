import {
  LinkedList,
  linkedListIncludes,
  linkedListToArray,
} from "../data/linkedList";
import { UntypedModule } from "../parser";
import { Analysis } from "./analyse";
import { CyclicModuleDependency, ErrorInfo } from "./errors";

export type CompilePackageOptions = {
  package: string;
  exposedModules: Set<string>;
  packageModules: Record<string, UntypedModule>;
  packageDependencies: Record<string, CompiledPackage>;
};

export type PackageCompilationError = {
  package: string;
  ns: string;
} & ErrorInfo;

export type CompiledPackage = {
  package: string;
  errors: Array<PackageCompilationError>;
  modules: Map<string, Analysis>;
};

export function compilePackage(args: CompilePackageOptions): CompiledPackage {
  const modules = new Map<string, Analysis>();
  const errors: Array<PackageCompilationError> = [];

  const visitPackageModule = (
    ns: string,
    untypedMod: UntypedModule,
    path: LinkedList<string> = undefined,
  ): Analysis => {
    const previousLookup = modules.get(ns);
    if (previousLookup !== undefined) {
      return previousLookup;
    }

    const analysis = new Analysis(args.package, ns, untypedMod, {
      getDependency(dependencyNs) {
        path = [dependencyNs, path];

        // If this is a local package, visit recursively and add to tracked deps
        const untypedMod = args.packageModules[dependencyNs];
        if (untypedMod !== undefined) {
          // TODO add `namespace` to tracked dependencies of `(args.package, ns)`

          if (linkedListIncludes(path, ns)) {
            // TODO emit actual range
            errors.push({
              description: new CyclicModuleDependency(linkedListToArray(path)),
              ns: dependencyNs,
              package: args.package,
              range: {
                start: { character: 0, line: 0 },
                end: { character: 0, line: 0 },
              },
            });
            return;
          }

          return visitPackageModule(dependencyNs, untypedMod, path);
        }

        for (const compiledPackageDep of Object.values(
          args.packageDependencies,
        )) {
          // Unexposed modules aren't in this map
          const d = compiledPackageDep.modules.get(dependencyNs);
          if (d !== undefined) {
            return d;
          }
        }
        return undefined;
      },
    });

    modules.set(ns, analysis);
    return analysis;
  };

  for (const [ns, untypedMod] of Object.entries(args.packageModules)) {
    visitPackageModule(ns, untypedMod);
  }

  return {
    package: args.package,
    modules,
    errors,
  };
}
