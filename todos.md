## Todos

- refactor: use IR
  - refactor: add syntax sugar in both AST
    - remove annotator and typedAst (and deep clone AST instead)
- test: test self-recursive let exprs (and prevent binding pollution)
- refactor: treat constructor and ident as separate nodes
- feat: add package and module to compilation output
- refactor: simplify traits repr
- feat: proper dependencies resolution
- core: proper hydration
- refactor: store traits dict in type def
  - perf: do not invalidate the whole ast
- test: test position of type errs

### Done

- refactor: refactor let block as list
- feat: allow mutually recursive types
- feat: check cyclic module dependency
- feat: allow mutually recursive values
- refactor: add package to named type repr
