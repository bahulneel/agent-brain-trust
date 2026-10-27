# Relational Prompt Language (RPL)

RPL is a declarative logic language for defining agent behaviors. It builds progressively from basic data types to complex rules.

## RPL shell mode (trailing `%` line)

When the **user’s message ends with a non-empty line whose first non-whitespace character is `%`**, use **RPL shell mode** for **that assistant turn only**:

1. Treat **only that final line** as an RPL **goal** to **evaluate**; lines above are **context** (facts, prose, protocol).
2. **If the goal head has capture arguments** (`%name(?a, ?b, …)`): reply with **only** the **values or result** those arguments ask for—no preamble or explanation unless the query itself demands prose.
3. **If there is no substantive output** (no capture values to show, and no chat payload from tools such as **`$json`**): reply with exactly **`true`** if the goal is **satisfied**, or a **short reason** if it is **unsatisfied**.

Normative detail: formal spec **§15.8** (`docs/rpl/specification/rpl.md`).

## `$json` contract with the user

`$json` is a built-in **user-visible** tracing contract, not an internal-only debug hook.

- **Call shape**: `$json(?x)` (exactly one lvar argument).
- **Chat shape**: emits **NDJSON** to chat, one JSON value per line.
- **Line payload**: each line is the JSON encoding of one possible **binding instance** of `?x` at that point in evaluation.
- **Multiple bindings**: if `?x` has multiple active ground bindings, emit **one NDJSON line per binding instance**.

**Binding forms and trace forms (literal keys on metadata maps, spec §11):**

```rpl
pending-choice(?value) ^^ choice ?x              -- single-slot binding shorthand (space after ^^)
pending-choice(?value) ^^ {choice ?x}           -- equivalent map form
pending-choice(?value) ^:bindings {choice ?x}   -- equivalent explicit form

pending-choice(?value) ^^ {?choice "critical"} -> true
```

**Variable key** — metadata maps may not use an lvar as a key. Bind the map, then match (tuple or map destructuring per §4 / §6):

```rpl
expr ^^ ?b, ?b ~ [?key, ?value]
```

### Closed script examples (`USER` / `AGENT`)

Each `USER` block below is a **closed multiline pure RPL query context**; no
extra facts are assumed.

**Example 1 — value of a single binding**

USER:
```rpl
user('foo')
% <- user(?u), $json(?u)
```

AGENT:
```ndjson
"foo"
```

**Example 2 — binding map via `^^ ?b`**

USER:
```rpl
user('foo')
% <- user(?u) ^^ ?b, $json(?b)
```

AGENT:
```ndjson
{"?u":"foo"}
```

**Example 3 — multiple value instances**

USER:
```rpl
user('foo')
user('bar')
% <- user(?u), $json(?u)
```

AGENT:
```ndjson
"foo"
"bar"
```

**Example 4 — multiple binding-map instances**

USER:
```rpl
user('foo')
user('bar')
% <- user(?u) ^^ ?b, $json(?b)
```

AGENT:
```ndjson
{"?u":"foo"}
{"?u":"bar"}
```

**Example 5 — metadata projection (single instance)**

USER:
```rpl
user('foo')
% <- user(?u) ^ ?m, $json(?m)
```

AGENT:
```ndjson
{":bindings":[{"?u":"foo"}]}
```

**Example 6 — metadata projection (multiple instances)**

USER:
```rpl
user('foo')
user('bar')
% <- user(?u) ^ ?m, $json(?m)
```

AGENT:
```ndjson
{":bindings":[{"?u":"foo"},{"?u":"bar"}]}
```

## Level 0: Primitives
RPL uses EDN literals for data:
- **Strings**: `"hello"` or `'hello'` — **single- and double-quoted literals are interchangeable**; use whichever makes the surrounding expression easier to read (including nested quotes). Templates work in either form: `"hello {?name}"`, `'hello {?name}'`.
- **Regex**: `/(?P<name>\w+)/`
- **Numbers**: `42`, `3.14`
- **Booleans**: `true`, `false`
- **Keywords**: `:status`
- **Symbols**: `foo`
- **Nil**: `nil`

**Readability first** — When you write or complete any RPL expression (literals, tails, constraints, patterns), prefer clarity and scan-ability over minimal token count. If two spellings are allowed, pick the one reviewers can follow at a glance.

## Level 1: Variables & Matching
- **Logical Variable (lvar)**: `?name` (binds to a value)
- **Anonymous Variable**: `_` (matches anything, binds nothing)

**Metadata / trace map keys (clause `^` / `^^`)** — In maps written **on a clause** for metadata (`^ ~ {…}`, `^^ {…}`, `:bindings {…}`), **keys must be literals** (symbols, keywords, strings, etc.). **Lvars are not allowed in key position.** To match by a dynamic key, use `expr ^^ ?b` then `?b ~ …` (see **`$json` contract** above). Ordinary **data** maps in patterns (`?x = ~ {:key ?val}`) still allow `?key` where §4 / §6 apply.

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

## Relational Modelling

Relations are named for what is *true*, not what to *do*.

- **Arity 1 — type assertion**: `person(?p)`, `premium-member(?u)` — classifies a subject.
- **Arity 2 — binary relation**: `age(?person, ?n)`, `severity(?patient, ?level)` — subject has or is related to a value.
- **Arity 3+ — complex relation**: `appointment(?patient, ?doctor, ?time)` — a richer fact.

Prefer nouns and adjectives over verbs: `eligible(?u)` not `check-eligibility(?u)`.

Prose that refers to **action-shaped tools** (`$ask`, `$write`, `$generate`) may use imperative language — e.g. “Ask the user for their name” matches `$ask` as a command.

Prose that refers to **query-shaped tools** (`$query-db`, `$index`) stays relational — e.g. “A query has results from the database” rather than “Run the query”.

## Level 5: Rules, Logic & Metadata
Rules combine heads and tails using implication (`<-`).
- **Implication**: `head <- tail`
- **Conjunction**: `head <- rel1(?x), rel2(?x)`
- **Disjunction**: `head <- rel1(?x) | rel2(?x)`

**Metadata** (`^` and `^^`):
Attaches provenance or bindings to clauses (map keys **literal** in `^ ~` / `^^` forms; spec §11).
- `clause ^ ~ {:doc ?x}` (match metadata map)
- `clause ^:scope ?s` (shorthand for `^ ~ {:scope ?s}`)
- `clause ^^ {a ?a}` (shorthand for `:bindings` sub-map; key `a` is a symbol literal)

**Constraints** (`->`):
Expresses invariants.
- `rel(?x) -> valid(?x)` (if `rel(?x)` holds, `valid(?x)` must hold)
- `rel1(?x), rel2(?x) -> false` (mutual exclusion)

## Level 6: Async & Control
- **Async Variables (avar)**: `$x` (suspends until external value arrives; once resolved, the value is recorded under **`?x`**; trace/bindings in `^^ {…}` use **literal** symbol keys per §11)
- **Tool Calls**: `$tool(?args) ^ ~ {:result ?r}` (dispatches tool, binds result)
- **Async bind sugar**: `?r = $tool(?args)` is sugar for `$tool(?args) ^ :result ?r` (same as `$tool(?args) ^ ~ {:result ?r}`); likewise `?v = $x` for a bare avar
- **Built-in `$json(?x)`** — user-facing NDJSON contract for raw bindings (see **`$json` contract with the user** above). Use it when the user asked to see bound values in machine-readable form.

**Abductives** (`;`):
Run *before* the rule body to control activation.
- `; @when(tail)`: Activate only if `tail` holds.
- `; @choose(binding, tail)`: Select exactly one binding.
- `; @distinct(binding, tail)`: Bindings must be distinct.
- `; @each(binding, items)`: Iterate over all items.
- `; @for(binding, tail, step)`: Step-based iteration.
