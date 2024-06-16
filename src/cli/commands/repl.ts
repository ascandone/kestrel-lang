import { createInterface } from "node:readline";
import { ReplInput, Span, UntypedModule, parseReplInput } from "../../parser";
import { Deps, typeToString, typecheck } from "../../typecheck";
import { TypedProject, checkProject, readProjectWithDeps } from "../common";
import { errorInfoToString } from "../../errors";

const DUMMY_SPAN: Span = [0, 0];
class ReplState {
  constructor(private readonly project: TypedProject) {}

  private moduleBuf: UntypedModule = {
    imports: [],
    declarations: [],
    typeDeclarations: [],
  };

  private static readonly REPL_NS = "Repl";
  private static readonly REPL_EXPR_NAME = "$$REPL_EXPR";

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
        this.moduleBuf.declarations.push(input.decl);
        return input.decl.binding.name;
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

    return typeToString(expr.binding.$.asType());
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

  const replState = new ReplState(project);

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
