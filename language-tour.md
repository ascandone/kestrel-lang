# Language tour

## Basic syntax

Kestrel has basics datatypes such as:

- values of type `Char`, such as `'x'`
- values of type `String`, such as `"abc"`
- values of type `Int`, such as `42`
- values of type `Float`, such as `42.1`
- values of type `Bool` : `True` and `False`
- the value `Unit`, that is the only value of type `Unit`

Comments can be written using `//` syntax.

There are a bunch of pre-defined operators:

```rust
1 + 2 // => 3
// You have to use +. instead of + for floats:
1.5 +. 2.5 // => 4

"Hello " ++ "world" // => "Hello world"

!True // => False
True && False // => False
```

Most of those functions are documented in the [`Basics` module documentation](https://kestrel-module-docs.vercel.app/ascandone/kestrel_core/Basics)

#### Functions

You can create anonymous functions with the `fn` keyword:

```rust
fn x, y { x + y }
```

And call them using common function call syntax: `my_function(1, 2)`

Functions are first class citizen, therefore you can assign them to let declarations, pass them to other function or return from functions

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

You can locally-scoped `let` expression whenever there is a block (e.g. `if` expressions or `fn` body)

#### If expressions

To branch programs, you can use `if` expressions:

```rust
let value =
  if n == 0 {
    "zero"
  } else {
    "not zero"
  }
```

## Types

There are a few built-in types, such as `Int`, `Float`, `String`.

Kestrel has Hindley-Milner type inference, meaning that you don't need to manually write types, as they will be inferred by the typechecker. Still, is possible to give `let` declarations explicit type hints:

```rust
let x: Int = 42
let x: Bool = "not a bool" // => this will not typecheck
```

Functions have their own types:

```rust
// `add1` is inferred as `Fn(Int) -> Int`
let add1 = fn x { x + 1 }
```

Lowercase types behave as type variables, for example:

```rust
// `add1` is inferred as `Fn(a) -> a`
let identity = fn x { x }
```

In the example above, `a` is a type variable that can be instantiated to any possible type, as long as every occurrence is instantiated to the same type. This is the same as writing `<T>(x: T) => T` in typescript

#### Custom types (unions)

You can also create your own types, specifying its constructors:

```rust
type MyType {
  NoArgs,
  WithArgs(Int, Int),
}
```

This way, we now have in scope:

1.  A type called `MyType`
2.  Two constructors `NoArgs` (that is a value of type `MyType`) and `WithArgs` (that is a value of type `Fn(Int, Int) -> MyType`)

For example, we can now write:

```rust
// x is inferred as `MyType`
let x = WithArgs(1, 2)
```

Custom types can have generic args:

```rust
type Box<a> {
  MakeBox(a),
}
```

PS. Note that `Bool` is simply defined as

```rust
type Bool {
  True,
  False,
}
```

#### Match expressions

You can pattern match values using the `match` expression:

```rust
match value {
  None => "no values",
  Some(value) => "value is: " ++ value
}
```

Pattern match supports nested patterns, catchall patterns (`_`), and matching literals, e.g.

```rust
match (n % 3, n % 5) {
  (0, 0) => "FizzBuzz",
  (0, _) => "Fizz",
  (_, 0) => "Buzz",
  _ => String.from_int(n),
}
```

#### Custom types (structs)

You can also define, create and manipulate structs:

```rust
type Person struct {
  name: String,
  age: Int,
}

// you can instantiate a struct:
let p = Person {
  name: "John Doe",
  age: 42
}

// you can access fields of a struct:
let age = p.age

// you can update a previosly defined struct
let increment_age = fn p {
  Person {
    age: p.age + 1,
    ..p
  }
}
```

## Modules

You can import values and types of different modules with `import` statements, that must appear first in the module.

```
import MyModule
// Now you can use the MyModule.some_value syntax to access to
// `some_value` defined in MyModule
// You can also access types and constructors
```

Imports can be unqualified too:

```
import MyModule.{some_value, MyType(..)}
// this adds to the scope:
// the `some_value` value
// the `MyType` type
// `MyType` constructors (because of the `(..)`)
```

You can import nested modules using the `import My/Nested/Module` syntax

### Creating modules

Creating a file implicitly creates a module whose the namespace is the file's path.
Values defined in a module are private by default, but can be visible from outer modules using the `pub` keyword:

```rust
// Export `x`
pub let x = 42

// Export `MyType`, but not the constructors
// aka "opaque types"
pub type MyType { Constructor }

// Export `MyType` _and_ its constructors
pub(..) MyType { Constructor }
```

## Creating a Kestrel project

Kestrel's cli is the unified tool to run, typecheck, build, format your kestrel projects, and more.

You can create an new Kestrel project using the `kestrel init` command.

You can run the typechecker over a Kestrel project using `kestrel check`

You can compile a Kestrel project using the `kestrel build` or run it on the fly using `kestrel run`.
To do that, you'll need to create a module exposing a value called `main` that has type `Task<Unit>`.

You can learn more about `Task`'s APIs in the [`Task` module documentation](https://kestrel-module-docs.vercel.app/ascandone/kestrel_core/Task)

Here's the classic hello world example:

```rust
import IO

pub let main = IO.println("Hello world!")
```

## Traits

Kestrel extends the Hindley-Milner type system with a lightweight version of traits. Each type variable can be associate with one or more named traits, defining constraints for that variables.
Defined traits are built-in and not extensible by the users, nor parametric.

Built-in traits are currently: `Show` (used to represent a value that can be converted to a human-readable string), `Eq` (used for values that can have equality), `Ord` (used for values which can be compared)

```rust
let show: Fn(a) -> String where a: Show

// the following is valid, because Int implements Show
show(42)

// the following is not, because Fn() -> Int doen't
show(fn { 0 })
```

Primitive values (`Int`, `Float`, `String` and `Char`) implement all those traits.
Implementation is derived for union types whose constructors' arguments implement some trait, or for structs whose fields implement some trait. For example:

```rust
// this type implements Show
type Bool { True, False }

// this type implements show if 'a' implements Show
type Option<a> { None, Some(a) }
```

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

#### `let#` syntax

`let#` is a powerful syntax sugar that allows to rewrite this:

```rust
Mod.some_function(value, fn x {
  body
})
```

As the following:

```rust
{
  let#Mod.some_function x = value;
  body
}
```

You can chain multiple `let#` expressions.
This syntax is very useful in many situations, here are a couple of examples of idioms:

<details>
<summary> `await` syntax </summary>

The `let#` syntax is useful to avoid deeply nested calls to `Task.await`, that might become something similar to callback hell:

For example, the following expressions:

```rust
let program: Task<Unit> =
  Task.await(IO.println("Enter you name"), fn _ {
    Task.await(IO.readline, fn name {
      IO.println("Hello " ++ name ++ "!")
    })
  })
```

Can be rewritten as:

```rust
{
  let#Task.await _ = IO.println("Enter your name");
  let#Task.await name = IO.readline;
  IO.println("Hello " ++ name ++ "!")
}
```

</details>

<details>
<summary> Errors early exit (similar to rust's `?` sugar) </summary>

Since you don't have try-catch in Kestrel, errors have to be modelled as data, typically using the `Result` type.
This results in lots of `Result.and_then` chained call.

You can simplify this using `let#`:

```rust
let get_some_number: Fn(String) -> Result<Int, String>
let get_data_by_id: Fn(Int) -> Result<MyData, String>

// Inferred as `Result<MyData, String>`
let get_data = {
  let#Result.and_then int = get_some_number("example");
  let#Result.and_then my_data = get_some_number(int);
  Ok(my_data)
}
```

This is similar to writing the following rust code:

```rust
fn get_data() {
  let int = get_some_number("example")?;
  let my_data = get_some_number(int)?;
  Ok(my_data)
}
```

Like in rust, you might want to combine this with `Result.map_err` in case the results have a different error type.

You can apply a similar pattern in effectful computations using `Task.await_ok`, or to the `Option` type using `Option.and_then`.

</details>

<details>
<summary> List comprehension </summary>

While, for simplicity's sake, Kestrel doesn't have an ad-hoc list comprehension syntax, you can use `let#` to archieve the same goal.

For example:

```rust
let comprehension = {
  let#List.flat_map x = [1, 2, 3];
  let#List.flat_map y = ['a', 'b'];
  let#List.guard _unit = x <= 2;
  [(x, y)]
}
```

Will yield `[(1, 'a'), (1, 'b'), (2, 'a'), (2, 'b')]`

</details>
