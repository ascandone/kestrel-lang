import { createInterface } from "node:readline";
import {
  ReplInput,
  Span,
  UntypedDeclaration,
  UntypedModule,
  parseReplInput,
} from "../../parser";
import { Deps, TypedModule, typeToString, typecheck } from "../../typecheck";
import { TypedProject, checkProject, readProjectWithDeps } from "../common";
import { errorInfoToString } from "../../errors";
import { compileProject, defaultEntryPoint } from "../../compiler";
import { TVar } from "../../typecheck/type";

const DUMMY_SPAN: Span = [0, 0];

class ReplState {
  constructor(
    private readonly project: TypedProject,
    private readonly externs: Record<string, string>,
  ) {}

  private moduleBuf: UntypedModule = {
    imports: [],
    declarations: [],
    typeDeclarations: [],
  };

  public static readonly REPL_NS = "Repl";
  public static readonly REPL_MAIN_NS = "$$REPL_MAIN";
  public static readonly REPL_EXPR_NAME = "$$REPL_EXPR";

  private shadowDecl(name: string) {
    this.moduleBuf.declarations = this.moduleBuf.declarations.filter(
      (d) => d.binding.name !== name,
    );
  }

  private pushInput(input: ReplInput): string | undefined {
    switch (input.type) {
      case "expression":
        this.shadowDecl(ReplState.REPL_EXPR_NAME);
        this.moduleBuf.declarations.push({
          binding: { name: ReplState.REPL_EXPR_NAME, span: DUMMY_SPAN },
          extern: false,
          inline: false,
          pub: true,
          span: DUMMY_SPAN,
          value: input.expr,
        });
        return ReplState.REPL_EXPR_NAME;
      case "declaration":
        this.shadowDecl(input.decl.binding.name);
        this.shadowDecl(ReplState.REPL_EXPR_NAME);
        this.moduleBuf.declarations.push(input.decl);
        this.moduleBuf.declarations.push({
          binding: { name: ReplState.REPL_EXPR_NAME, span: DUMMY_SPAN },
          extern: false,
          inline: false,
          pub: true,
          span: DUMMY_SPAN,
          value: {
            type: "identifier",
            name: input.decl.binding.name,
            span: DUMMY_SPAN,
          },
        });
        return ReplState.REPL_EXPR_NAME;
      case "import":
        this.moduleBuf.imports.push(input.import);
        return;
      case "typeDecl":
        this.moduleBuf.typeDeclarations.push(input.decl);
        return;
    }
  }

  input(src: string, input: ReplInput): string | undefined {
    const name = this.pushInput(input);
    if (name === undefined) {
      return;
    }

    const deps: Deps = {};
    for (const [k, v] of Object.entries(this.project)) {
      deps[k] = v.typedModule;
    }
    const [typedModule, errs] = typecheck(
      ReplState.REPL_NS,
      this.moduleBuf,
      deps,
    );
    const errors = errs.filter((e) => e.description.severity === "error");
    if (errors.length !== 0) {
      for (const err of errors) {
        console.log(errorInfoToString(src, err), "\n");
      }
      return;
    }

    const expr = typedModule.declarations.find((d) => d.binding.name === name);
    if (expr === undefined) {
      throw new Error("[unreachable] expr not found");
    }

    const expressionStringifiedType = typeToString(expr.binding.$.asType());

    const traitDeps = TVar.typeImplementsTrait(expr.binding.$.asType(), "Show");
    if (traitDeps === undefined) {
      // Cannot show
      console.log(`#<Internals> : ${expressionStringifiedType}`);
      return;
    }

    // TODO handle errors
    const [typedMain, mainErrors] = typecheck(
      ReplState.REPL_MAIN_NS,
      mainModule,
      {
        ...deps,
        [ReplState.REPL_NS]: typedModule,
      },
    );

    if (mainErrors.length !== 0) {
      console.log(mainErrors);
      throw new Error("errors while compiling");
    }

    // ---- Compile
    const project: Record<string, TypedModule> = {};
    for (const [k, v] of Object.entries(this.project)) {
      project[k] = v.typedModule;
    }

    const compiled = compileProject(
      {
        ...project,
        [ReplState.REPL_NS]: typedModule,
        [ReplState.REPL_MAIN_NS]: typedMain,
      },
      {
        entrypoint: {
          ...defaultEntryPoint,
          module: ReplState.REPL_MAIN_NS,
        },
        externs: this.externs,
      },
    );

    const main = new Function(compiled);
    main();

    return expressionStringifiedType;
  }
}

export async function runRepl() {
  const path = process.cwd();
  const rawProject = await readProjectWithDeps(path);
  const [project] = await checkProject(rawProject);
  if (project === undefined) {
    throw new Error("Invalid project");
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const externs: Record<string, string> = {};
  for (const ns in project) {
    const extern = rawProject[ns]?.extern;
    if (extern !== undefined) {
      externs[ns] = extern.toString();
    }
  }

  const replState = new ReplState(project, externs);

  function loop() {
    rl.question("> ", (inp) => {
      const { parsed } = parseReplInput(inp);

      const sig = replState.input(inp, parsed);

      if (sig) {
        console.log(sig);
      }

      loop();
    });
  }

  loop();
}

const mainDeclaration: UntypedDeclaration = {
  binding: { name: "main", span: DUMMY_SPAN },
  extern: false,
  inline: false,
  pub: true,
  span: DUMMY_SPAN,
  value: {
    type: "application",
    caller: {
      type: "identifier",
      span: DUMMY_SPAN,
      namespace: "IO",
      name: "println",
    },
    args: [
      {
        type: "application",
        span: DUMMY_SPAN,
        caller: {
          type: "identifier",
          span: DUMMY_SPAN,
          namespace: "Debug",
          name: "inspect",
        },
        args: [
          {
            type: "identifier",
            span: DUMMY_SPAN,
            namespace: ReplState.REPL_NS,
            name: ReplState.REPL_EXPR_NAME,
          },
        ],
      },
    ],
    span: DUMMY_SPAN,
  },
};

const mainModule: UntypedModule = {
  imports: [
    { ns: ReplState.REPL_NS, span: DUMMY_SPAN, exposing: [] },
    { span: DUMMY_SPAN, ns: "IO", exposing: [] },
    { span: DUMMY_SPAN, ns: "Debug", exposing: [] },
  ],
  typeDeclarations: [],
  declarations: [mainDeclaration],
};
