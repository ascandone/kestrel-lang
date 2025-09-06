# Kestrel lang 🦅

[![npm](https://badgen.net/npm/v/kestrel-lang)](https://www.npmjs.com/package/kestrel-lang)
[![CI](https://github.com/ascandone/kestrel-lang/actions/workflows/ci.yml/badge.svg)](https://github.com/ascandone/kestrel-lang/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/ascandone/kestrel-lang/graph/badge.svg?token=rHjOLSg3xg)](https://codecov.io/gh/ascandone/kestrel-lang)

Kestrel is a pure, strongly typed functional language that compiles to js.

```rust
// Type is inferred as `(Int) -> String`
pub let fizz_buzz = fn n {
  match (n % 3, n % 5) {
    (0, 0) => "FizzBuzz",
    (0, _) => "Fizz",
    (_, 0) => "Buzz",
    _ => String.from_int(n),
  }
}
```

Take a look at the [language tour](https://ascandone.github.io/kestrel-docs) to learn more. You can find some examples by looking at the standard library [implementation](https://github.com/ascandone/kestrel_core/tree/main/src)

### Get started

> You can try kestrel without installing it on the [online playground](https://kestrel-playground.vercel.app/).

Install the `kestrel` cli using npm:

```bash
npm install -g kestrel-lang
```

Lsp integration is available as a [vscode extension](https://marketplace.visualstudio.com/items?itemName=ascandone.kestrel-vscode).
