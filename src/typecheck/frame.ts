export class Frame<Local extends { name: string }> {
  private locals: Local[];
  constructor(
    public readonly self: Local | undefined,
    parameters: Local[],
  ) {
    this.locals = [...parameters];
  }

  defineLocal(binding: Local) {
    this.locals.push(binding);
  }

  exitLocal() {
    this.locals.pop();
  }

  resolve(name: string): Local | undefined {
    for (let i = this.locals.length - 1; i >= 0; i--) {
      const b = this.locals[i]!;
      if (b.name === name) {
        return b;
      }
    }

    if (this.self?.name === name) {
      return this.self;
    }

    return undefined;
  }
}

export type BindingResolution<Binding, Global> =
  | {
      type: "local";
      binding: Binding;
    }
  | {
      type: "global";
      declaration: Global;
      namespace?: string;
    };

export class FramesStack<Local extends { name: string }, Global = never> {
  private globals = new Map<string, [string | undefined, Global]>();
  private recursiveLabel: Local | undefined;
  private frames: Frame<Local>[] = [new Frame(undefined, [])];
  private getCurrentFrame(): Frame<Local> {
    const frame = this.frames.at(-1);
    if (frame === undefined) {
      throw new Error("[unreachable] No frames left");
    }
    return frame;
  }

  pushFrame(parameters: Local[]) {
    this.frames.push(new Frame(this.recursiveLabel, parameters));
  }

  popFrame() {
    this.frames.pop();
  }

  defineLocal(binding: Local) {
    const currentFrame = this.getCurrentFrame();
    currentFrame.defineLocal(binding);
  }

  defineGlobal(
    name: string,
    namespace: string | undefined,
    global: Global,
  ): boolean {
    if (this.globals.has(name)) {
      return false;
    }
    this.globals.set(name, [namespace, global]);
    return true;
  }

  exitLocal() {
    const currentFrame = this.getCurrentFrame();
    currentFrame.exitLocal();
  }

  defineRecursiveLabel(binding: Local) {
    this.recursiveLabel = binding;
  }

  resolve(name: string): BindingResolution<Local, Global> | undefined {
    for (let i = this.frames.length - 1; i >= 0; i--) {
      const frame = this.frames[i]!;
      const resolution = frame.resolve(name);
      if (resolution === undefined) {
        continue;
      }
      return {
        type: "local",
        binding: resolution,
      };
    }

    const glb = this.globals.get(name);
    if (glb !== undefined) {
      const [ns, declaration] = glb;
      return { type: "global", declaration, namespace: ns };
    }

    return undefined;
  }
}
