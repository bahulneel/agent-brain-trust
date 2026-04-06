# Relational Prompt Language (RPL)

RPL is a declarative logic language for defining agent behaviors. It builds progressively from basic data types to complex rules.

## Level 0: Primitives
RPL uses EDN literals for data:
- **Strings**: `"hello"` (can include templates: `"hello {?name}"`)
- **Regex**: `/(?P<name>\w+)/`
- **Numbers**: `42`, `3.14`
- **Booleans**: `true`, `false`
- **Keywords**: `:status`
- **Symbols**: `foo`
- **Nil**: `nil`

## Level 1: Variables & Matching
- **Logical Variable (lvar)**: `?name` (binds to a value)
- **Anonymous Variable**: `_` (matches anything, binds nothing)
- **In-place Matching**: `~ PATTERN` performs structural matching.
  - `?x = ~ "foo {?bar}"`
  - `?x = ~ {:key ?val}`
  - `?x = ~ /(?P<a>\w+)/`

## Level 2: Collections
Collections group primitives and variables. They cannot directly contain relation calls.
- **Lists**: `[?a ?b]` (fixed), `[?first . ?second & ?rest]` (destructuring)
- **Sets**: `#{?a ?b}` (fixed), `#{?first & ?rest}` (destructuring)
  - *Instance Semantics*: Unifying `#{1 2}` with `~ ?x` yields two instances (`?x=1`, `?x=2`).
- **Maps**: `{:key ?val}`, `{?k ?v & ?rest}` (destructuring)

## Level 3: Operators
- **Comparison**: `=`, `!=`, `<`, `>`, `<=`, `>=`
- **Arithmetic**: `+`, `-`, `*`, `/`
- **Logical**: `,` (AND), `|` (OR), `not`
- **Set**: `union`, `intersect`, `difference`, `in`, `not in`
- **Temporal**: `before`, `after`, `within`, `between`
- **Cardinality**: `|rel(?x)|` (count tuples), `|?list|` (length)
- **Expansion**: `#?x` (splices the *syntax* reading of `?x`'s binding)

## Level 4: Atoms & Namespaces
RPL partitions the world into three namespaces:
- **Relations**: `rel(?a, ?b)` (facts to establish or query)
- **Goals**: `%goal(?a)` (objectives to solve)
- **Tools**: `$tool(?a)` (external capabilities)

## Level 5: Rules, Logic & Metadata
Rules combine heads and tails using implication (`<-`).
- **Implication**: `head <- tail`
- **Conjunction**: `head <- rel1(?x), rel2(?x)`
- **Disjunction**: `head <- rel1(?x) | rel2(?x)`

**Metadata** (`^` and `^^`):
Attaches provenance or bindings to clauses.
- `clause ^ ~ {:doc ?x}` (match metadata map)
- `clause ^:scope ?s` (shorthand for `^ ~ {:scope ?s}`)
- `clause ^^ {a ?a}` (shorthand for `:bindings` sub-map)

**Constraints** (`->`):
Expresses invariants.
- `rel(?x) -> valid(?x)` (if `rel(?x)` holds, `valid(?x)` must hold)
- `rel1(?x), rel2(?x) -> false` (mutual exclusion)

## Level 6: Async & Control
- **Async Variables (avar)**: `$x` (suspends until external value arrives)
- **Tool Calls**: `$tool(?args) ^ ~ {:result ?r}` (dispatches tool, binds result)

**Abductives** (`;`):
Run *before* the rule body to control activation.
- `; @when(tail)`: Activate only if `tail` holds.
- `; @choose(binding, tail)`: Select exactly one binding.
- `; @distinct(binding, tail)`: Bindings must be distinct.
- `; @each(binding, items)`: Iterate over all items.
- `; @for(binding, tail, step)`: Step-based iteration.
