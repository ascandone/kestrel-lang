## Todos

- refactor: model list pattern in ast
- feat: package manager
- refactor: compare tvars by identity instead of by id
- feat: improve implicit imports repr
  - no dummy ranges
  - allow duplicate imports if the first one is the implicit
  - refactor: introduce tuples as AST node
  - refactor: add syntax sugar in both AST
    - remove annotator and typedAst (and deep clone AST instead)
    - refactor: simplify IR (struct-literal -> match)
  - perf: ir optimizations
    - inline let (inline values used once; inline consts)
    - inline globals
    - constant folding
    - within lambdas, cache sub-expression that only depend on free values in an outer let
    - eta reduction
- test: test self-recursive let exprs (and prevent binding pollution and direct dependency)
- refactor: treat constructor and ident as separate nodes
- feat: add package and module to compilation output
- test: test position of type errs
- refactor: implement infixes as macros for normal extern functions
- refactor: ditch the ".type" tagging convention, and use .eg. `_tag` instead

### Done

- breaking: syntax changes
- core: proper hints via rigid vars
- refactor: refactor let block as list
- feat: allow mutually recursive types
- feat: check cyclic module dependency
- feat: allow mutually recursive values
- refactor: add package to named type repr
- refactor: re-architecture compiler using IR
- refactor: store traits dict in type def
  - perf: do not invalidate the whole ast
