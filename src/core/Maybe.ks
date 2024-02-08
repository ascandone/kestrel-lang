pub(..) type Maybe<a> {
  Just(a),
  Nothing,
}

pub let map = fn m, f {
  match m {
    Just(x) => Just(f(x)),
    Nothing => Nothing
  }
}

pub let and_then = fn m, f {
  match m {
    Just(x) => f(x),
    Nothing => Nothing,
  }
}
