pub(..) type Result<a, err> {
  Ok(a),
  Err(err)
}

pub let map = fn r, f {
  match r {
    Ok(x) => Ok(f(x)),
    Err(err) => Err(err)
  }
}

pub let and_then = fn r, f {
  match r {
    Ok(x) => f(x),
    Err(err) => Err(err),
  }
}
