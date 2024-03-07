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
