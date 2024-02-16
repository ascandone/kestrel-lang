# Language tour

## Basic syntax

Kestrel has basics datatypes such as:

- strings: `"abc"`
- int: `42`
- float: `42.1`
- bool: `True` and `False`

Comments can be written using `//` syntax.

There are a bunch of pre-defined operators:

```rust
1 + 2 // => 3
// You have to use +. instead of + for floats:
1.5 +. 2.5 // => 4

"Hello " <> "world" // => "Hello world"

!True // => False
True && False // => False
```

#### Functions

You can create anonymous functions with the `fn` keyword:

```rust
fn x, y { x + y }
```

And call them using common function call syntax: `my_function(1, 2)`

#### Let declarations

You can bind an expression to a variable using global `let` statements:

```rust
let x = 42
```

`let` declarations are immutable: they cannot be reassigned again, and names have to be unique in a module.

`let` expressions are also available:

```rust
let declaration = 2 * {
  let x = 0;
  let y = 1;
  x + y
}
```

They have to be wrapped in blocks. `let` expressions are immutable too, but can be shadowed:

```rust
let declaration = {
  let x = 0;
  // Here `x` is bound to `0`
  let x = 1;
  // Here `x` is bound to `1`
  x
}
```

#### If expressions

To branch programgs, you can use `if` expressions:

```rust
let value =
  if n == 0 {
    "zero"
  } else {
    "not zero"
  }
```

## Types

#### Match expressions

## Modules

## Syntax sugar

#### Pipe operator

The pipe (`|>`) operator is a syntax sugar to avoid nested function calls.

`a |> f(x, y)` is desugared as `f(a, x, y)` from the compiler

Pipe calls can be nested, e.g. `f(g(arg, x1, x2), y1)` is the same as:

```fs
arg
|> g(x1, x2)
|> f(y1)
```

#### Monadic let

Sometimes we need to deeply nest function calls like in the following example:

```rust
let program: Task<Unit> =
  Task.await(IO.print("Enter you name"), fn _ {
    Task.await(IO.readline, fn name {
      IO.print("Hello " <> line <> "!")
    })
  })
```

However, such programs quickly become unreadable. To avoid that, we can use the following syntax sugar (only available inside blocks), that will desugar like in the example above:

```rust
{
  let#Task.await _ = IO.print("Enter your name");
  let#Task.await name = IO.readline;
  IO.print("Hello " <> line <> "!")
}
```

This syntax can be used with any kind of type, including `Result` or `Maybe`
