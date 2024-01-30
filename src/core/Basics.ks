// Float

extern pub type Float

extern pub let (+.): Fn(Float, Float) -> Float

extern pub let (-.): Fn(Float, Float) -> Float

extern pub let (*.): Fn(Float, Float) -> Float

extern pub let (/.): Fn(Float, Float) -> Float

// Int

extern pub type Int

extern pub let (+): Fn(Int, Int) -> Int

extern pub let (-): Fn(Int, Int) -> Int

extern pub let (*): Fn(Int, Int) -> Int

extern pub let (/): Fn(Int, Int) -> Int

extern pub let (^): Fn(Int, Int) -> Int

extern pub let (%): Fn(Int, Int) -> Int

// Bool
pub(..) type Bool {
  True,
  False,  
}

extern pub let (&&): Fn(Bool, Bool) -> Bool

extern pub let (||): Fn(Bool, Bool) -> Bool

extern pub let (!): Fn(Bool) -> Bool


// Comp

extern pub let (==): Fn(a, a) -> Bool

extern pub let (!=): Fn(a, a) -> Bool

extern pub let (>): Fn(a, a) -> Bool

extern pub let (>=): Fn(a, a) -> Bool

extern pub let (<): Fn(a, a) -> Bool

extern pub let (<=): Fn(a, a) -> Bool

// Misc

pub(..) type Unit {
  Unit
}

