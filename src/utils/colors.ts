// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color

const RESET_CODE = "\x1b[0m";

type Link = { code: string; next: Colored };

export type StringLike = string | number;

class Colored {
  static disabled: boolean = false;

  constructor(private link?: Link) {}

  // render

  tag(strs: TemplateStringsArray, ...args: string[]) {
    const buf: string[] = [];
    for (let i = 0; i < strs.length; i++) {
      buf.push(strs[i]!);
      buf.push(args[i]!);
    }

    return this.str(buf.join(""));
  }

  str(...content: StringLike[]): string {
    const stack: StringLike[] = [];
    let { link } = this;
    while (link !== undefined) {
      if (!Colored.disabled) {
        stack.push(link.code);
      }
      link = link.next.link;
    }
    stack.reverse();
    stack.push(...content);
    if (!Colored.disabled) {
      stack.push(RESET_CODE);
    }
    return stack.join("");
  }

  private chain(code: string): Colored {
    return new Colored({ code, next: this });
  }

  // colors
  get black() {
    return this.chain("\x1b[30m");
  }

  get blue() {
    return this.chain("\x1b[34m");
  }

  get red() {
    return this.chain("\x1b[31m");
  }

  get yellow() {
    return this.chain("\x1b[33m");
  }

  get bgWhite() {
    return this.chain("\x1b[47m");
  }

  // other modifiers
  get bright() {
    return this.chain("\x1b[1m");
  }

  get underline() {
    return this.chain("\x1b[4m");
  }
}

export const col = new Colored();

export function withDisabled<T>(disabled: boolean, f: () => T): T {
  const initial = Colored.disabled;
  Colored.disabled = disabled;
  const res = f();
  Colored.disabled = initial;
  return res;
}
