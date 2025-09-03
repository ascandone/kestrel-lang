import { TextDocument } from "vscode-languageserver-textdocument";
import path from "path";
import * as project from "../typecheck/project";
import { ErrorInfo, TypedModule } from "../typecheck";
import { nestedMapGetOrPutDefault } from "../common/defaultMap";

export const DEBOUNCE_AMOUNT_MS = 150;

export class AnalysisState {
  private timeoutToken?: NodeJS.Timeout;
  private readonly projectChecker: project.ProjectTypechecker;

  private readonly moduleIdByUri = new Map<
    string,
    { package_: string; moduleId: string }
  >();
  /** Only modules of this.package */
  private readonly docByModuleId = new Map<string, TextDocument>();

  /** Listeners that are flushed after they are */
  private listenersOnce: Array<(out: project.TypecheckResult) => void> = [];

  constructor(
    private readonly package_: string,
    private readonly currentDirectory: TextDocument["uri"],
    private readonly sourceDirectories: string[],
    private readonly onTypecheckProject: (out: project.TypecheckResult) => void,

    prj: Map<string, Map<string, { doc: TextDocument; source: string }>>,
    projectOptions: Partial<project.ProjectOptions> = {},
  ) {
    const rawProject: project.RawProject = new Map();
    for (const [moduleId, modules] of prj.entries()) {
      for (const [package_, { doc, source }] of modules.entries()) {
        nestedMapGetOrPutDefault(rawProject, moduleId).set(package_, source);
        this.moduleIdByUri.set(doc.uri, { moduleId, package_ });
        this.docByModuleId.set(moduleId, doc);
      }
    }

    this.projectChecker = new project.ProjectTypechecker(
      rawProject,
      projectOptions,
    );
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

  /** Upsert a doc of this.package */
  public upsertDoc(doc: TextDocument) {
    const moduleId = this.makeModuleId(doc.uri);
    if (moduleId === undefined) {
      return;
    }

    this.projectChecker.upsert(this.package_, moduleId, doc.getText());
    this.moduleIdByUri.set(doc.uri, { moduleId, package_: this.package_ });
    this.docByModuleId.set(moduleId, doc);

    this.startTimeout();
  }

  /** Delete a doc of this.package */
  public deleteDoc(uri: TextDocument["uri"]) {
    const moduleId = this.makeModuleId(uri);
    if (moduleId === undefined) {
      return;
    }

    const deleted = this.projectChecker.delete(this.package_, moduleId);
    this.moduleIdByUri.delete(uri);
    this.docByModuleId.delete(moduleId);

    if (deleted) {
      this.startTimeout();
    }
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

    return proj.get(doc.moduleId)?.get(this.package_);
  }

  public getModuleByUriSync(
    uri: TextDocument["uri"],
  ): [TypedModule, ErrorInfo[]] | undefined {
    const doc = this.moduleIdByUri.get(uri);
    if (doc === undefined) {
      return undefined;
    }

    return this.getProjectSync().get(doc.moduleId)?.get(this.package_);
  }

  /**
   * Async API: wait for project, as soon as it's ready
   * (either when the debounce timer completes, or when there's a sync request)
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
   * Will stop the debounce and notify async listeners as well
   */
  public getProjectSync(): project.TypedProject {
    this.runTypecheckSync();
    return this.projectChecker.compiledProject.inner;
  }

  private makeModuleId(uri: TextDocument["uri"]) {
    return makeModuleId({
      uri,
      currentDirectory: this.currentDirectory,
      sourceDirectories: this.sourceDirectories,
    });
  }
}

export function makeModuleId(args: {
  uri: TextDocument["uri"];
  currentDirectory: string;
  sourceDirectories: string[];
}): string | undefined {
  let { pathname } = new URL(args.uri);

  const ext = path.extname(pathname);
  if (ext !== ".kes") {
    return;
  }
  pathname = pathname.slice(0, -ext.length);

  for (const sourceDir of args.sourceDirectories) {
    const joined = path.join(args.currentDirectory, sourceDir);
    const relative = path.relative(joined, pathname);
    const isPrefix = !relative.startsWith("..");
    if (isPrefix) {
      return relative;
    }
  }

  return undefined;
}
