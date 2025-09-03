import { TextDocument } from "vscode-languageserver-textdocument";
import path from "path";
import * as project from "../typecheck/project";
import { ErrorInfo, TypedModule } from "../typecheck";
import { nestedMapGetOrPutDefault } from "../data/defaultMap";

export const DEBOUNCE_AMOUNT_MS = 150;

export class LsState {
  private timeoutInterval?: NodeJS.Timeout;
  private readonly projectChecker: project.ProjectTypechecker;

  private readonly moduleIdByUri = new Map<
    string,
    { package_: string; moduleId: string }
  >();
  /** Only modules of this.package */
  private readonly docByModuleId = new Map<string, TextDocument>();

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
    clearTimeout(this.timeoutInterval);
    this.timeoutInterval = setTimeout(() => {
      this.runTypecheckSync();
    }, DEBOUNCE_AMOUNT_MS);
  }

  public runTypecheckSync() {
    const out = this.projectChecker.typecheck();
    this.onTypecheckProject(out);
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

  public getModuleByModuleId(
    moduleId: string,
  ): [TypedModule, ErrorInfo[]] | undefined {
    this.runTypecheckSync();
    return this.projectChecker.compiledProject.get(moduleId).get(this.package_);
  }

  public moduleByUri(
    uri: TextDocument["uri"],
  ): [TypedModule, ErrorInfo[]] | undefined {
    this.runTypecheckSync();
    const doc = this.moduleIdByUri.get(uri);
    if (doc === undefined) {
      return undefined;
    }
    return this.getModuleByModuleId(doc.moduleId);
  }

  public getTypedProject(): Record<string, TypedModule> {
    const p: Record<string, TypedModule> = {};
    for (const [moduleId, packages] of this.projectChecker.compiledProject
      .inner) {
      for (const [package_, [typedModule]] of packages) {
        if (package_ !== this.package_) {
          continue;
        }
        p[moduleId] = typedModule;
      }
    }
    return p;
  }

  public getDocByModuleId(moduleId: string): TextDocument | undefined {
    return this.docByModuleId.get(moduleId);
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
