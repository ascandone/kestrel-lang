import Basics.{Int, Unit}
import Result.{Result(..)}
import String.{String}

extern pub type Task<a>

extern pub let of: Fn(a) -> Task<a>

extern pub let await: Fn(Task<a>, Fn(a) -> Task<b>) -> Task<b>

extern pub let println: Fn(String) -> Task<Unit>

extern pub let print: Fn(String) -> Task<Unit>

extern pub let readline: Task<String>

extern pub let sleep: Fn(Int) -> Task<Unit>

pub let await_ok = fn async_res, f {
  await(async_res, fn err {
    match err {
      Ok(x) => f(x),
      Err(e) => of(Err(e)),
    }
  })
}
