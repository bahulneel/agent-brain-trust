# Lazy Relational Prompt Language (LRPL) - Formal Specification

## 1. Overview

LRPL extends RPL (§spec.md) with **lazy evaluation**, **constraint memos**,
**satisfactory quiescence**, a **standard library** of data tools, and a
**tool algebra** expressed as natural-language rewrite rules.

Every valid RPL programme is valid under LRPL. The extension adds machinery for
deferring evaluation and reasoning under incomplete bindings without disturbing
the relational and goal layer beneath it.

### 1.1 Theoretical Foundations

LRPL's operating model follows **Bloom** (Alvaro et al.) and the **CALM theorem**:
monotonic logic is coordination-free. The relational core — fact accumulation,
rule derivation, goal satisfaction, trace growth — is monotonic. Any agent with
the same trace reaches the same conclusions regardless of evaluation order.

Non-monotonic operations — memo retraction, constraint conflict resolution, lazy
expression entry, goal selection under ambiguity — are the **coordination points**.
These are where LRPL explicitly defers to agent judgment, consistent with CALM:
non-monotonic steps require coordination; agent judgment is the coordination
mechanism.

Async variables follow Bloom's **asynchronous channel model**: a `$x` is a fact
that arrives at a future timestep via an unordered channel, ground when it
arrives. The trace is Bloom **persistence** — facts that survive timestep
boundaries and form the ground for future derivation.

### 1.2 Inference and Deduction

RPL's two variable modes mark the direction of information flow:

```
?x    inferred  — must be bound by existing facts; a pattern that matches
$x    deduced   — produced by evaluation; the relation body provides the value
```

`r(?x, ?y)` matches against two known values. `r(?x, $y)` takes a known `?x`
and deduces `?y` — the body of `r` is the deduction procedure. The `$` sigil
marks output positions. This is why tool calls use `$`: a tool is a deduction
procedure that produces a value the agent does not yet have.

LRPL adds a third mode:

```
<expr>    lazy — participates in constraint propagation but evaluation
                 is deferred until forward progress requires it
```

### 1.3 Variable Space Summary

```
?x          lvar: inferred, current timestep              (RPL)
$x          avar: deduced async, future timestep          (RPL)
<expr>      lazy expr: deferred until progress stalls     (LRPL)
?x ^ memo   lvar with constraint memo in DNF              (LRPL)
```

Sections build in order. The **Appendix** extends the RPL grammar for new forms.

---

## 2. Lazy Expressions

A **lazy expression** wraps any valid RPL expression and defers its evaluation.

```
LAZY-EXPR = '<' EXPR '>'
```

`<expr>` is valid anywhere a **clause** is valid (§spec §10). It participates
in constraint propagation — constraints accumulate against its free variables
from outside the expression — but its interior is not entered and no bindings
within it are produced until **forward progress stalls** without them.

When evaluation is finally triggered:

1. All constraints accumulated against the lazy expression's free variables
   are applied as a filter before any enumeration or derivation begins.
2. Only bindings that survive the accumulated constraints are produced.
3. The result enters the binding store as **novelty** (§spec §18.2), triggering
   a new quiescence cycle.

**Key property**: a lazy expression is a *property* of the expression, not an
action performed on it. Evaluation is triggered by conditions being met, not by
an external resume call.

### 2.1 Free Variable Scope

Free variables inside `<expr>` that also appear outside it are **shared**. A
constraint on `?x` outside `<expr>` accumulates against the same `?x` inside.
Variables that appear only inside are scoped to the expression.

### 2.2 Lazy Expressions in Rule Bodies

```rpl
result(?x) <= <expensive-relation(?x)>, filter(?x)
```

`expensive-relation` is not entered until `filter(?x)` has narrowed the binding
space as far as possible. The lazy expression sees only the surviving candidates.

### 2.3 Lazy Expressions and Async Vars

A lazy expression may contain async vars. The avar lifecycle (§spec §13.1) is
unchanged; dispatch is deferred along with evaluation. An avar inside `<expr>`
is not dispatched until the expression is entered.

```rpl
content(?x) <= <$read("large-file.md") ^ ~ {:result ?x}>
```

The file is not read until `?x` is needed.

---

## 3. Constraint Memos

A **constraint memo** records the set of candidate worlds an unbound lvar is
tracking, expressed in **disjunctive normal form** (DNF). Memos are stored in
the lvar's **metadata** (§spec §11) under the key `:memo`.

```
?x ^ ~ {:memo ?dnf}     -- read the memo for ?x
?x ^ {:memo DNF-EXPR}   -- assert a memo for ?x
```

A DNF memo is a disjunction of conjunctions of RPL constraints:

```rpl
-- ?severity tracks two candidate worlds
?severity ^ {:memo (
  (?severity = "critical", ?priority = "high") |
  (?severity = "low", ?priority = "normal")
)}
```

### 3.1 Purpose

Constraint memos serve three functions:

**Deferred binding** — an lvar need not be bound to a single ground value while
the constraint space is large or uncertain. The memo records what is known
without committing.

**Early conflict detection** — two rules imposing incompatible constraints on the
same lvar reveal their conflict in the memo before either fires. Conflicts
surface at the earliest possible point.

**Non-monotonic reasoning** — as new facts arrive, memo conjuncts that are no
longer satisfiable are retracted. The surviving disjuncts represent the still-valid
candidate worlds.

### 3.2 Memo Accumulation

Memos accumulate **monotonically** by conjunction within a disjunct and by
disjunction across worlds. A new constraint on `?x` narrows each surviving
world; a new world is added when a new candidate is discovered.

Retraction of a disjunct is **non-monotonic** and is recorded in the trace
(§spec §12.4) with the reason.

### 3.3 Realisation

An lvar is **realised** — bound to a ground value — when:

- exactly one disjunct remains in the memo, and
- that disjunct is fully ground, or
- a downstream goal requires a ground value and the runtime cannot make further
  progress without it.

Realisation is a last-resort act. The runtime prefers constraint propagation over
early binding.

### 3.4 Memos and the Trace

When an lvar is realised, the surviving memo is recorded as a grounded constraint
in the trace (§spec §12.3), preserving the full history of candidate worlds and
the point at which binding occurred.

---

## 4. Satisfactory Quiescence

RPL defines quiescence as derivation to fixpoint (§spec §18.3). LRPL refines
this: **satisfactory quiescence** is goal-relative. The runtime identifies the
minimal set of bindings that must be resolved for the current goal to be
selectable, and quiesces that set rather than the full relation space.

In Bloom/CALM terms, satisfactory quiescence identifies the **monotonic frontier**
of a goal — the largest set of derivations that can proceed coordination-free
before a non-monotonic commitment is required. Work beyond the frontier is
deferred, not abandoned.

### 4.1 Goal-Relative Binding Sets

For a given goal `%g`, the **required binding set** is the transitive closure of:

- the goal's argument lvars,
- the lvars of every relation in the goal's body,
- the lvars of every relation those depend on,

excluding bindings inside lazy expressions until those expressions are entered.

Quiescence of the required binding set — via constraint propagation and memo
narrowing — is sufficient to select the goal. Work outside this set may proceed
but is not required.

### 4.2 Runtime Responsibility

Satisfactory quiescence boundaries are **derived by the runtime**, not declared
by authors. Authors have no visibility into or control over this mechanism.
Getting it wrong would be silent and catastrophic; the runtime is the appropriate
locus of this decision.

### 4.3 Exploration Heuristics

When no goal is yet selectable, the runtime explores the binding space according
to two drives:

**Shared-first exploration** — prefer bindings that appear in the required
binding sets of the most goals simultaneously. Work done here has the highest
leverage across the goal space.

**Adversarial early stopping** — actively seek the input or constraint that would
invalidate the most goals. A conflict or constraint violation that eliminates
whole branches early is more valuable than continued expansion. The aim is the
fewest necessary concrete bindings, not the most thorough exploration.

These heuristics are illustrative of the *stopping shape* rather than prescriptive
of any algorithm. A conforming runtime must honour the properties; the
implementation is unconstrained.

### 4.4 Quiescence and Strata

Each stratum (§scope.md) has its own satisfactory quiescence boundary. Bindings
that are not required by the current stratum's goals may carry forward as
constrained-but-unbound lvars into the next context. The context boundary is a
practical concern, not a structural discontinuity.

---

## 5. Standard Library Tools

LRPL defines three **standard library tools** with specified semantics. All three
follow the tool call syntax (§spec §14.1) and participate in the async lifecycle
(§spec §13.1).

### 5.1 `$index`

`$index` maps an external source to a relation's argument positions.

```
$index(LOCATION)
$index(LOCATION, PROJECTION)
$index(SOURCE-RELATION($collection-avar), PROJECTION?)
```

**Location** — a string path (local or remote file), a URL, or a relation. When
the location is a relation, `$index` traverses the relation's extension rather
than an external source.

**Projection** — an optional string hint, not a unifiable expression, describing
how source fields map to argument positions. Omitted when the mapping is
self-evident from argument names or source structure.

**Collection avar** — when the location is a relation, the argument marked `$`
(not `?`) identifies the collection to enumerate. The `$` sigil carries its
standard async semantics: the collection is enumerated lazily, one element per
produced tuple.

```rpl
-- flat source: column names match argument names
expert(?name, ?domain, ?approach) <= $index("experts.csv")

-- flat source with non-obvious mapping
component(?id, ?label) <= $index("components.yaml", "component_id, display_name")

-- structural unwinding: students with nested class objects
student(?name, ?classes) <= $index("students.yaml")

student-class(?name, ?subject, ?grade) <=
  $index(student(?name, $classes), "subject, grade")
```

In the unwinding form, `$classes` marks the collection argument to enumerate.
Each element of the collection — here an object with `subject` and `grade`
fields — produces one tuple. The projection hint maps object fields to argument
positions. Arbitrarily deep nesting is unwound by repeated application.

**`$index` is lazy by default.** The source is not read and the extension is not
enumerated until a downstream goal requires bound values. Constraints accumulated
against the relation's lvars before enumeration act as a filter, minimising the
scan.

### 5.2 `$generate`

`$generate` produces content by LLM generation rather than external collection.

```
$generate(PROMPT, OPTIONS?)
$generate(PROMPT) ^ ~ {:result ?content}
```

**Prompt** — a string, a string template with bound lvars, or a quoted expression
(§6). The agent collapses the relational context into the prompt at dispatch time.

**Options** — an optional map of generation hints: format, length, persona
constraints, output schema. Options are runtime metadata and do not participate
in unification.

**Result** — bound via standard metadata access (§spec §11):

```rpl
draft(?content) <=
  $generate("Summarise the findings in __findings__") ^ ~ {:result ?content}
```

`$generate` is the **agent-as-producer** primitive. Its result has generation
provenance in the trace, distinct from collected or derived values.

### 5.3 `$write`

`$write` persists a bound value to an external location.

```
$write(CONTENT, LOCATION, OPTIONS?)
```

**Content** — any bound lvar or literal.

**Location** — a string path or URL. The same location namespace as `$index`.

**Options** — an optional map: file format, append vs overwrite, encoding.

`$write` is the inverse of `$index`. A trace stratum written via `$write` becomes
a valid `$index` source for a future stratum, making cross-session continuity
structural rather than incidental.

### 5.4 Transparent File References

A lazy expression wrapping a `$read` call is equivalent to a deferred file
reference. The file is not read until `?x` is needed; constraints on `?x`
accumulated before that point filter what is attended to:

```rpl
content(?x) <= <$read("report.md") ^ ~ {:result ?x}>
```

`?x` behaves identically whether its value comes from a file, an index, a
generation, or a literal. The provenance differs; the lvar does not. This
transparency is a consequence of lazy evaluation and the standard metadata
binding pattern, not a separate mechanism.

---

## 6. Tool Algebra and Rewrite Rules

Tools whose results compose algebraically may declare **rewrite rules** stating
how one family of tool invocations can be simplified into another. Rewrite rules
are optimisation hints, not correctness requirements. A run that does not
discover them produces correct results; it may do more work than necessary.

### 6.1 Syntax

Rewrite rules are stated in natural language with **backtick-quoted syntax** for
the expressions being matched and produced:

```
Rewrite `EXPR` as `EXPR` when CONDITION
```

Quoted expressions are structural — they are matched against the tool invocation
graph, not evaluated. This is syntax quoting: the backticks mark a literal
expression for pattern matching.

### 6.2 Placement

Rewrite rules are authored by tool authors and placed at their discretion:
with one of the tools in question, with the tool family, or in a shared
definitions document. A run discovers rewrite rules only if the relevant
document is in scope. Non-discovery is a missed optimisation, not an error.

### 6.3 Standard Rewrite Rules

The following rules hold over the standard library tools:

```
Rewrite `$read(?x), $write(?x)` as no-op
  when ?x is otherwise unconsumed

Rewrite `$read(?x), $write(?y)` as `$copy(?x, ?y)`
  when ?x is otherwise unconsumed and ?x != ?y

Rewrite `$read(?x), $generate(?prompt), $write(?y)` as `$transform(?x, ?y, ?prompt)`
  when $generate is the only consumer of the read result
```

These rules are illustrative of the form. A conforming runtime that discovers
them may apply them; discovery is not guaranteed.

### 6.4 Macro Hygiene

Variable capture, scope, and hygiene in rewrite rules are the responsibility of
the LLM interpreting them. The language does not define a formal macro system.
The natural-language form is deliberate: it delegates the hard problems of macro
expansion to the agent, consistent with the general principle that RPL structures
the protocol and agent judgment fills gaps.

---

## 7. Dialogue and Role Structure

LRPL provides the formal machinery for **multi-party, phased dialogue** — reviews,
workshops, collaborative design — through composition of existing primitives.
No new language constructs are required.

### 7.1 Speakers as Entities

A speaker is an **entity** — a ground value that participates in relations — not
a relation in its own right. Speaker identity is carried as an argument:

```rpl
speaker("byrd")
speaker("hickey")
speaker("sussman")

position(?speaker, ?claim) => speaker(?speaker)
```

### 7.2 Distinctness Constraints

The honesty constraint — that no two speakers may hold identical claims — is a
standard relational constraint (§spec §12.1):

```rpl
position(?s1, ?claim), position(?s2, ?claim), ?s1 != ?s2 => false
```

A synthesis goal cannot be satisfied unless genuinely distinct positions exist in
the trace. Premature convergence is structurally inexpressible, not merely
discouraged.

### 7.3 Turns and Rounds via Goal Composition

Iteration over speakers within a round, and over rounds within a session, is
expressed by composing parameterised goals with abductive clauses (§spec §16):

```rpl
%session() <= %round(?n)
  ; @for(?n, round-eligible(?n), next-round(?n))

%round(?n) <= %turn(?n, ?speaker)
  ; @each(?speaker)

%turn(?n, ?speaker) <= position(?speaker, ?n, ?claim)
```

`%session` iterates rounds via `@for`, stepping when `next-round` holds.
`%round` iterates speakers via `@each`. `%turn` is the atomic unit: one speaker,
one round, one position asserted. Each level owns exactly one dimension of the
iteration.

### 7.4 Phase Structure

Phases compose above sessions by the same goal composition pattern:

```rpl
%workshop() <= %grounding(), %debate(), %synthesis()
```

Each phase is a goal. The full architecture — phases, rounds, turns, speaker
positions, convergence — falls out of goal composition and abductives with no
special primitives.

### 7.5 Convergence

The `next-round` step relation in `@for` can inspect the trace of the completed
round to determine whether progress was made. If no new ground facts were
established, `next-round` does not hold and iteration terminates. Convergence is
a structural fact derived from the trace, not a procedural judgment.

---

## 8. Runtime — Extensions to the Operating Model

LRPL extends the eight-phase timestep (§spec §18) at phases 3 and 7
(quiescence) and phase 4 (goal activation).

### 8.1 Non-Monotonic Points

The LRPL evaluation model is monotonic at its core — facts accumulate, memos
narrow, the trace grows. The following operations are **non-monotonic** and
constitute the coordination points where agent judgment is explicitly required:

```
Memo disjunct retraction       a candidate world is eliminated
Constraint conflict resolution no disjuncts remain; agent surfaces and decides
Lazy expression entry          commitment to evaluate a deferred expression
Goal selection under ambiguity no root % present; agent chooses among candidates
Non-monotonic schema change    user modifies RPL mid-session (§spec §18.3)
Forced lvar realisation        agent commits to a ground value prematurely
```

At each of these points the agent acts as the coordination mechanism, consistent
with the CALM theorem: monotonic derivation proceeds without coordination;
non-monotonic steps require it.

### 8.1 Extended Timestep

```
Timestep:
  1. Assert new avars                          (RPL)
  2. Assert input novelty                      (RPL)
  3. Quiesce relations + propagate memos       (LRPL: memo propagation added)
  4. Activate goals (satisfactory quiescence)  (LRPL: goal-relative boundary)
  5. Update plans                              (RPL)
  6. Progress plan, asserting novelty          (RPL)
  7. Quiesce relations + propagate memos       (LRPL: memo propagation added)
  8. Dispatch asyncs (lazy exprs excluded)     (LRPL: lazy dispatch deferred)
```

### 8.2 Memo Propagation

At phases 3 and 7, after standard quiescence, the runtime propagates constraint
memos:

1. For each unbound lvar with a memo, apply all accumulated constraints.
2. Retract disjuncts that are no longer satisfiable.
3. If exactly one ground disjunct remains, realise the lvar.
4. If no disjuncts remain, surface a constraint conflict (§spec §18.6).

### 8.3 Lazy Expression Dispatch

Lazy expressions are **not dispatched** at phase 8. An `<expr>` containing an
avar is entered only when forward progress stalls without it. At that point the
accumulated constraints are applied, and the avar within is dispatched in the
next cycle's phase 8.

### 8.4 Failure Modes

LRPL adds to the RPL failure modes (§spec §18.6):

```
Memo conflict (no disjuncts remain)   Agent surfaces; user decides
Lazy expr never entered               Silent; goal may be unsatisfiable
Realisation forced prematurely        Agent warns; records in trace
```

---

## Appendix. Grammar Extensions

Extensions to the RPL formal grammar (§spec Appendix):

```
-- Extended variable forms
VAR             = LVAR | ASYNC-VAR | '~' PATTERN | LAZY-EXPR

-- Lazy expression
LAZY-EXPR       = '<' EXPR '>'

-- Constraint memo (metadata key :memo, value in DNF)
MEMO            = DNF-EXPR
DNF-EXPR        = DNF-CONJ | DNF-CONJ '|' DNF-EXPR
DNF-CONJ        = '(' TAIL ')'

-- Index tool (extends TOOL)
INDEX-CALL      = '$index' '(' INDEX-LOC [ ',' STRING ]? ')'
INDEX-LOC       = STRING | RELATION-WITH-AVAR
RELATION-WITH-AVAR = LABEL '(' [ INDEX-ARG [ ',' INDEX-ARG ]* ]? ')'
INDEX-ARG       = LVAR | ASYNC-VAR | LITERAL | '_'

-- Rewrite rule (document-level form, not in rpl fenced blocks)
REWRITE-RULE    = 'Rewrite' '`' EXPR '`' 'as' ('`' EXPR '`' | NO-OP)
                  [ 'when' CONDITION ]
NO-OP           = 'no-op'
CONDITION       = natural language condition (agent-interpreted)

-- Standard library tools (reserved names)
STDLIB-TOOL     = '$index' | '$generate' | '$write' | '$copy' | '$transform'
```

**Notes:**

- `LAZY-EXPR` is valid wherever `CLAUSE` is valid in the base grammar.
- `:memo` is a reserved metadata key; its value must be a `DNF-EXPR`.
- `INDEX-ARG` uses `$` (async avar) to mark the collection argument for
  structural unwinding; only one `$`-marked arg is permitted per `$index` call.
- `STDLIB-TOOL` names are reserved and may not be used as user-defined relation
  names.
- `REWRITE-RULE` appears in natural-language prose or fenced blocks at tool
  author discretion; it is not part of the formal rule grammar.
```
