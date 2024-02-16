# Kestrel lang 🦅

[![CI](https://github.com/ascandone/kestrel-lang/actions/workflows/ci.yml/badge.svg)](https://github.com/ascandone/kestrel-lang/actions/workflows/ci.yml)

Kestrel is a pure, strongly typed functional language that compiles to js.

```rust
// Type is inferred as `Fn(Int) -> String`
pub let fizz_buzz = fn n {
  match (n % 3, n % 5) {
    (0, 0) => "FizzBuzz",
    (0, _) => "Fizz",
    (_, 0) => "Buzz",
    _ => String.from_int(n),
  }
}
```

Take a look at the [language tour](https://github.com/ascandone/kestrel-lang/blob/main/language-tour.md) to learn more


### Get started

Install the `kestrel` cli using npm:

```bash
npm install -g kestrel-lang
```
