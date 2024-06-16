import { createInterface } from "node:readline";
import { ReplInput, Span, UntypedModule, parseReplInput } from "../../parser";
import { Deps, TypedModule, typeToString, typecheck } from "../../typecheck";
import { TypedProject, checkProject, readProjectWithDeps } from "../common";
import { errorInfoToString } from "../../errors";
import { compileProject, defaultEntryPoint } from "../../compiler";
import { TVar } from "../../typecheck/type";
import { Worker } from "worker_threads";

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
  public static readonly REPL_MAIN_NS = "REPL_MAIN";
  public static readonly REPL_EXPR_NAME = "REPL_EXPR";

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

  input(
    src: string,
    input: ReplInput,
  ): [signature: string, compiled: string | undefined] | undefined {
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
      return [expressionStringifiedType, undefined];
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

    if (
      mainErrors.filter((e) => e.description.severity === "error").length !== 0
    ) {
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
        externs: {
          ...this.externs,
          [ReplState.REPL_MAIN_NS]: ReplMainExtern,
        },
      },
    );

    return [expressionStringifiedType, compiled];
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

      const ret = replState.input(inp, parsed);
      if (ret === undefined) {
        return loop();
      }

      const [sig, compiled] = ret;

      if (compiled === undefined) {
        console.log(`#<Internals> : ${sig}`);
        loop();
      } else {
        const w = new Worker(compiled, { eval: true });
        w.on("message", (msg) => {
          console.log(`${msg} : ${sig}`);
          loop();
        });
      }
    });
  }

  loop();
}

const ReplMainExtern = `
function ${ReplState.REPL_MAIN_NS}$post_string(str) {
  return new Task$Task((resolve) => {
    const { parentPort } = require('worker_threads')
    parentPort.postMessage(str)
    resolve(null)
  })
}
`;

const mainModule: UntypedModule = {
  imports: [
    { ns: ReplState.REPL_NS, span: DUMMY_SPAN, exposing: [] },
    { span: DUMMY_SPAN, ns: "Debug", exposing: [] },
    { span: DUMMY_SPAN, ns: "Task", exposing: [] },
  ],
  typeDeclarations: [],
  declarations: [
    // extern let post_string: Fn(String) -> Task<Unit>
    {
      extern: true,
      span: DUMMY_SPAN,
      binding: { name: "post_string", span: DUMMY_SPAN },
      pub: false,
      typeHint: {
        mono: {
          type: "fn",
          args: [
            {
              type: "named",
              namespace: "String",
              name: "String",
              span: DUMMY_SPAN,
              args: [],
            },
          ],
          return: {
            type: "named",
            name: "Task",
            namespace: "Task",
            args: [
              {
                type: "named",
                namespace: "Tuple",
                name: "Unit",
                span: DUMMY_SPAN,
                args: [],
              },
            ],
            span: DUMMY_SPAN,
          },
          span: DUMMY_SPAN,
        },
        where: [],
        span: DUMMY_SPAN,
      },
    },

    // let main = post_string(Debug.inspect(Repl.$$REPL_EXPR_NAME))
    {
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
          name: "post_string",
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
    },
  ],
};
