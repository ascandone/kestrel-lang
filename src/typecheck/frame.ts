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

export class Frame<
  Binding extends { name: string },
  Global extends { binding: Binding },
> {
  private locals: Binding[];
  constructor(
    public readonly closestLabel:
      | BindingResolution<Binding, Global>
      | undefined,
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

  resolve(name: string): BindingResolution<Binding, Global> | undefined {
    for (let i = this.locals.length - 1; i >= 0; i--) {
      const b = this.locals[i]!;
      if (b.name === name) {
        return { type: "local", binding: b };
      }
    }

    if (this.closestLabel === undefined) {
      return undefined;
    }

    const recLabelName = (() => {
      switch (this.closestLabel.type) {
        case "local":
          return this.closestLabel.binding.name;
        case "global":
          return this.closestLabel.declaration.binding.name;
      }
    })();

    if (recLabelName === name) {
      return this.closestLabel;
    }

    return undefined;
  }
}

export class FramesStack<
  Binding extends { name: string },
  Declaration extends { binding: Binding },
> {
  private globals = new Map<string, [string | undefined, Declaration]>();
  private recursiveLabel: BindingResolution<Binding, Declaration> | undefined;
  private frames = [new Frame<Binding, Declaration>(undefined, [])];
  private getCurrentFrame(): Frame<Binding, Declaration> {
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

  defineGlobal(global: Declaration, namespace: string | undefined): boolean {
    if (this.globals.has(global.binding.name)) {
      return false;
    }
    this.globals.set(global.binding.name, [namespace, global]);
    return true;
  }

  exitLocal() {
    const currentFrame = this.getCurrentFrame();
    currentFrame.exitLocal();
  }

  defineRecursiveLabel(label: BindingResolution<Binding, Declaration>) {
    this.recursiveLabel = label;
  }

  resolve(name: string): BindingResolution<Binding, Declaration> | undefined {
    for (let i = this.frames.length - 1; i >= 0; i--) {
      const frame = this.frames[i]!;
      const resolution = frame.resolve(name);

      if (resolution !== undefined) {
        return resolution;
      }
    }

    const glb = this.globals.get(name);
    if (glb !== undefined) {
      const [ns, declaration] = glb;
      return {
        type: "global",
        declaration,
        namespace: ns,
      };
    }

    return undefined;
  }
}
