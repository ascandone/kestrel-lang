# Kestrel lang 🦅

[![CI](https://github.com/ascandone/kestrel-lang/actions/workflows/ci.yml/badge.svg)](https://github.com/ascandone/kestrel-lang/actions/workflows/ci.yml)


Kestrel is a pure, strongly typed functional language that compiles to js.

```rust
// Inferred as `Fn(Int) -> String`
pub let fizz_buzz = fn n {
  match (n % 3, n % 5) {
    (0, 0) => "FizzBuzz",
    (0, _) => "Fizz",
    (_, 0) => "Buzz",
    _ => String.from_int(n),
  }
}
```

### Install
Run the following command in order to install the `kestrel` cli

```bash
npm install -g kestrel-lang
```
