import { UntypedModule } from "../parser";
import { Analysis } from "./analyse";
import { ErrorInfo } from "./errors";

export type CompilePackageOptions = {
  package: string;
  exposedModules: Set<string>;
  packageModules: Map<string, UntypedModule>;
  dependencies: Map<string, CompiledPackage>;
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
  ): Analysis =>
    new Analysis(args.package, ns, untypedMod, {
      getDependency(namespace) {
        // If this is a local package, visit recursively and add to tracked deps
        const untypedMod = args.packageModules.get(namespace);
        if (untypedMod !== undefined) {
          // TODO mark this as already visited an exit if already visited
          // TODO add `namespace` to tracked dependencies of `(args.package, ns)`
          return visitPackageModule(ns, untypedMod);
        }

        for (const [, compiledPackageDep] of args.dependencies.entries()) {
          // Unexposed modules aren't in this map
          const d = compiledPackageDep.modules.get(namespace);
          if (d !== undefined) {
            return d;
          }
        }
        return undefined;
      },
    });

  for (const [ns, untypedMod] of args.packageModules.entries()) {
    const analysis = visitPackageModule(ns, untypedMod);

    modules.set(ns, analysis);
  }

  return {
    package: args.package,
    modules,
    errors,
  };
}
