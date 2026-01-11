import { TextDocument } from "vscode-languageserver-textdocument";
import path from "path";
import * as project from "../typecheck/project";
import { ErrorInfo, TypedModule } from "../typecheck";
import { nestedMapGetOrPutDefault } from "../common/defaultMap";
import { KestrelJson } from "../cli/kestrel-json/schema";
import { getPkgId } from "../cli/common";
import { tryReadingConfig, CONFIG_NAME } from "../cli/kestrel-json/utils";
import { existsSync } from "node:fs";
import { join, dirname, resolve } from "path";

export const DEBOUNCE_AMOUNT_MS = 150;

function pathSegments(p: string): number {
  return p.split("/").length;
}

type ProjectInfo = {
  manifestDir: string;
  config: KestrelJson;
  packageName: string;
};

export class MultiProjectAnalysisState {
  private timeoutToken?: NodeJS.Timeout;
  private projectChecker: project.ProjectTypechecker;

  /** Map: manifestDir -> ProjectInfo */
  private readonly projects = new Map<string, ProjectInfo>();

  /** Map: uri -> manifestDir (cache for filesystem lookups) */
  private readonly uriToManifestCache = new Map<string, string | null>();

  /** Map: uri -> { package_, moduleId } */
  private readonly moduleIdByUri = new Map<
    string,
    { package_: string; moduleId: string }
  >();

  /** Map: moduleId -> TextDocument */
  private readonly docByModuleId = new Map<string, TextDocument>();

  /** Merged project options across all projects */
  private readonly mergedPackageDependencies = new Map<string, Set<string>>();
  private readonly mergedExposedModules = new Map<string, Set<string>>();

  /** Unified raw project across all projects */
  private readonly rawProject: project.RawProject = new Map();

  /** Listeners that are flushed after they are */
  private listenersOnce: Array<(out: project.TypecheckResult) => void> = [];

  constructor(
    private readonly onTypecheckProject: (out: project.TypecheckResult) => void,
    private readonly loadProject: (manifestDir: string) => Promise<{
      rawProject: Map<
        string,
        Map<string, { doc: TextDocument; source: string }>
      >;
      deps: project.ProjectOptions["packageDependencies"];
      exposedModules: project.ProjectOptions["exposedModules"];
      config: KestrelJson;
    }>,
  ) {
    this.projectChecker = new project.ProjectTypechecker(this.rawProject, {
      packageDependencies: this.mergedPackageDependencies,
      exposedModules: this.mergedExposedModules,
    });
  }

  private startTimeout() {
    clearTimeout(this.timeoutToken);
    this.timeoutToken = setTimeout(() => {
      this.runTypecheckSync();
    }, DEBOUNCE_AMOUNT_MS);
  }

  public runTypecheckSync() {
    const out = this.projectChecker.typecheck();
    this.onTypecheckProject(out);
    for (const listener of this.listenersOnce) {
      listener(out);
    }
    return out;
  }

  /**
   * Find the project that contains this URI.
   * Checks in-memory projects first, then filesystem if needed.
   */
  private findProjectForUri(uri: string): ProjectInfo | null {
    // Check in-memory projects - find ALL that contain this URI
    // If multiple matches, use the "closest" (most nested/longest path)
    const matchingProjects = Array.from(this.projects)
      .filter(([manifestDir, projectInfo]) =>
        projectContainsUri(manifestDir, projectInfo.config.sources, uri),
      )
      .sort((a, b) => pathSegments(b[0]) - pathSegments(a[0])); // Most deeply nested path first

    const closest = matchingProjects[0];
    if (closest !== undefined) {
      return closest[1];
    }

    // Check cache (filesystem search result)
    const cached = this.uriToManifestCache.get(uri);
    if (cached !== undefined) {
      return cached ? (this.projects.get(cached) ?? null) : null;
    }

    // Search filesystem - finds closest manifest
    const filePath = new URL(uri).pathname;
    const manifestDir = findManifestUpward(filePath);
    this.uriToManifestCache.set(uri, manifestDir);

    if (manifestDir && !this.projects.has(manifestDir)) {
      // Project not loaded yet - will be loaded when file is opened
      return null;
    }

    return manifestDir ? (this.projects.get(manifestDir) ?? null) : null;
  }

  /**
   * Register a dependency project's manifest so it can be found by findProjectForUri.
   * This doesn't load the project, just registers its config.
   */
  private async registerDependencyProject(
    depManifestDir: string,
  ): Promise<void> {
    if (this.projects.has(depManifestDir)) {
      return; // Already registered
    }

    try {
      const config = await tryReadingConfig(depManifestDir);
      this.projects.set(depManifestDir, {
        manifestDir: depManifestDir,
        config,
        packageName: getPkgId(depManifestDir, config.name ?? ""),
      });
    } catch {}
  }

  /**
   * Discover and register all dependency projects for a given project.
   */
  private async registerDependencyProjects(
    manifestDir: string,
    config: KestrelJson,
  ): Promise<void> {
    const depsDir = join(manifestDir, "deps");

    // Check each dependency listed in config.dependencies
    const depNames = Object.keys(config.dependencies ?? {});
    for (const depName of depNames) {
      const depPath = join(depsDir, depName);
      const depManifestPath = join(depPath, CONFIG_NAME);

      if (existsSync(depManifestPath)) {
        await this.registerDependencyProject(depPath);
        // Recursively register dependencies of dependencies
        try {
          const depConfig = await tryReadingConfig(depPath);
          await this.registerDependencyProjects(depPath, depConfig);
        } catch {}
      }
    }
  }

  /**
   * Load a project from its manifest directory.
   * This loads all source files and dependencies.
   */
  public async ensureProjectLoaded(manifestDir: string): Promise<void> {
    if (this.projects.has(manifestDir)) {
      return; // Already loaded
    }

    const { rawProject, deps, exposedModules, config } =
      await this.loadProject(manifestDir);

    // Store project info
    this.projects.set(manifestDir, {
      manifestDir,
      config,
      packageName: getPkgId(manifestDir, config.name ?? ""),
    });

    // Register all dependency projects so they can be found by findProjectForUri
    await this.registerDependencyProjects(manifestDir, config);

    // Merge dependencies
    for (const [pkg, depsSet] of deps) {
      const existing = this.mergedPackageDependencies.get(pkg) ?? new Set();
      for (const dep of depsSet) {
        existing.add(dep);
      }
      this.mergedPackageDependencies.set(pkg, existing);
    }

    // Merge exposed modules
    for (const [pkg, modsSet] of exposedModules) {
      const existing = this.mergedExposedModules.get(pkg) ?? new Set();
      for (const mod of modsSet) {
        existing.add(mod);
      }
      this.mergedExposedModules.set(pkg, existing);
    }

    // Add all files to the unified raw project
    for (const [moduleId, packages] of rawProject.entries()) {
      for (const [package_, { doc, source }] of packages.entries()) {
        this.projectChecker.upsert(package_, moduleId, source);
        this.moduleIdByUri.set(doc.uri, { moduleId, package_ });
        this.docByModuleId.set(moduleId, doc);
      }
    }

    // Trigger typecheck
    this.startTimeout();
  }

  /**
   * Ensure the project for a URI is loaded, then upsert the document.
   */
  public async upsertDoc(doc: TextDocument): Promise<void> {
    const projectInfo = this.findProjectForUri(doc.uri);

    if (projectInfo === null) {
      // Try to load project if manifest was found
      const filePath = new URL(doc.uri).pathname;
      const manifestDir = findManifestUpward(filePath);
      if (manifestDir) {
        await this.ensureProjectLoaded(manifestDir);
        // Re-find project after loading
        const reloadedProject = this.projects.get(manifestDir);
        if (reloadedProject) {
          const moduleId = makeModuleId({
            uri: doc.uri,
            manifestDir: reloadedProject.manifestDir,
            sourceDirectories: reloadedProject.config.sources,
          });

          if (moduleId !== undefined) {
            nestedMapGetOrPutDefault(this.rawProject, moduleId).set(
              reloadedProject.packageName,
              doc.getText(),
            );
            this.projectChecker.upsert(
              reloadedProject.packageName,
              moduleId,
              doc.getText(),
            );
            this.moduleIdByUri.set(doc.uri, {
              moduleId,
              package_: reloadedProject.packageName,
            });
            this.docByModuleId.set(moduleId, doc);
            this.startTimeout();
          }
        }
      }
      return;
    }

    const moduleId = makeModuleId({
      uri: doc.uri,
      manifestDir: projectInfo.manifestDir,
      sourceDirectories: projectInfo.config.sources,
    });

    if (moduleId === undefined) {
      return;
    }

    // Update raw project directly, then use checker's upsert
    nestedMapGetOrPutDefault(this.rawProject, moduleId).set(
      projectInfo.packageName,
      doc.getText(),
    );
    this.projectChecker.upsert(
      projectInfo.packageName,
      moduleId,
      doc.getText(),
    );
    this.moduleIdByUri.set(doc.uri, {
      moduleId,
      package_: projectInfo.packageName,
    });
    this.docByModuleId.set(moduleId, doc);

    this.startTimeout();
  }

  public getDocByModuleId(moduleId: string): TextDocument | undefined {
    return this.docByModuleId.get(moduleId);
  }

  public async getModuleByUriAsync(
    uri: TextDocument["uri"],
  ): Promise<[TypedModule, ErrorInfo[]] | undefined> {
    const proj = await this.getProjectAsync();
    const doc = this.moduleIdByUri.get(uri);
    if (doc === undefined) {
      return undefined;
    }

    return proj.get(doc.moduleId)?.get(doc.package_);
  }

  public getModuleByUriSync(
    uri: TextDocument["uri"],
  ): [TypedModule, ErrorInfo[]] | undefined {
    const doc = this.moduleIdByUri.get(uri);
    if (doc === undefined) {
      return undefined;
    }

    return this.getProjectSync().get(doc.moduleId)?.get(doc.package_);
  }

  /**
   * Async API: wait for project, as soon as it's ready
   */
  private getProjectAsync(): Promise<project.TypedProject> {
    if (this.timeoutToken === undefined) {
      const project = this.getProjectSync();
      return Promise.resolve(project);
    }

    return new Promise((resolve) => {
      this.listenersOnce.push(() => {
        resolve(this.projectChecker.compiledProject.inner);
      });
    });
  }

  /**
   * Sync API: synchronously typecheck and get the project immediately.
   */
  public getProjectSync(): project.TypedProject {
    this.runTypecheckSync();
    return this.projectChecker.compiledProject.inner;
  }
}

export function makeModuleId(args: {
  uri: TextDocument["uri"];
  manifestDir: string;
  sourceDirectories: string[];
}): string | undefined {
  let { pathname } = new URL(args.uri);

  const ext = path.extname(pathname);
  if (ext !== ".kes") {
    return;
  }
  pathname = pathname.slice(0, -ext.length);

  for (const sourceDir of args.sourceDirectories) {
    const joined = path.join(args.manifestDir, sourceDir);
    const relative = path.relative(joined, pathname);
    const isPrefix = !relative.startsWith("..");
    if (isPrefix) {
      return relative;
    }
  }

  return undefined;
}

function projectContainsUri(
  manifestDir: string,
  sourceDirs: string[],
  uri: string,
): boolean {
  const moduleId = makeModuleId({
    uri,
    manifestDir,
    sourceDirectories: sourceDirs,
  });
  return moduleId !== undefined;
}

/**
 * Walk up the directory tree from a file path to find the nearest kestrel.json manifest.
 * Returns the directory path containing the manifest, or null if not found.
 */
export function findManifestUpward(filePath: string): string | null {
  let currentDir = resolve(filePath);

  // If it's a file, start from its directory
  if (!existsSync(currentDir) || !existsSync(join(currentDir, CONFIG_NAME))) {
    currentDir = dirname(currentDir);
  }

  const root = resolve("/");

  while (currentDir !== root && currentDir !== dirname(currentDir)) {
    const manifestPath = join(currentDir, CONFIG_NAME);
    if (existsSync(manifestPath)) {
      return currentDir;
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  return null;
}
