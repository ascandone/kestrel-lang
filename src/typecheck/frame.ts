export class Frame<Binding extends { name: string }> {
  private locals: Binding[];
  constructor(
    public readonly self: Binding | undefined,
    parameters: Binding[],
  ) {
    this.locals = [...parameters];
  }

  defineLocal(binding: Binding) {
    this.locals.push(binding);
  }
  exitLocal() {
    this.locals.pop();
  }

  resolve(name: string): Binding | undefined {
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

export type BindingResolution<Binding> = {
  type: "local";
  binding: Binding;
};

export class FramesStack<Binding extends { name: string }> {
  private recursiveLabel: Binding | undefined;
  private frames: Frame<Binding>[] = [new Frame(undefined, [])];
  private getCurrentFrame(): Frame<Binding> {
    const frame = this.frames.at(-1);
    if (frame === undefined) {
      throw new Error("[unreachable] No frames left");
    }
    return frame;
  }

  pushFrame(parameters: Binding[]) {
    this.frames.push(new Frame(this.recursiveLabel, parameters));
  }

  popFrame() {
    this.frames.pop();
  }

  defineLocal(binding: Binding) {
    const currentFrame = this.getCurrentFrame();
    currentFrame.defineLocal(binding);
  }

  exitLocal() {
    const currentFrame = this.getCurrentFrame();
    currentFrame.exitLocal();
  }

  defineRecursiveLabel(binding: Binding) {
    this.recursiveLabel = binding;
  }

  resolve(name: string): BindingResolution<Binding> | undefined {
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

    return undefined;
  }
}
