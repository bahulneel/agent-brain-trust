# Lazy Relational Prompt Language (LRPL) — Formal Specification

Extends RPL (spec.md with errata applied). Defines only the delta. All base
definitions are as specified in spec.md unless explicitly overridden here.

---

## 1. Overview

LRPL adds three capabilities to RPL:

- **Lazy expressions** — deferred evaluation until forward progress requires it
- **Constraint memos** — candidate world tracking for unbound lvars in DNF
- **Satisfactory quiescence** — goal-relative quiescence boundary in place of
  full fixpoint

And two standard library additions:

- **`$index`** — lazy external data traversal
- **`$generate`**, **`$write`** — generation and persistence
- **`length`** — cardinality over any collection or relation-valued lvar

### 1.1 Theoretical Anchor

LRPL's evaluation model follows **Bloom** (Alvaro et al.) and the **CALM
theorem**: monotonic logic is coordination-free. The relational core is
monotonic — facts accumulate, memos narrow, the trace grows. Non-monotonic
operations are the coordination points where agent judgment is required:

```
Monotonic:
  relational derivation, constraint accumulation,
  memo narrowing, trace growth

Non-monotonic (agent judgment required):
  memo disjunct retraction, constraint conflict resolution,
  lazy expression entry, goal selection under ambiguity,
  non-monotonic schema change, forced lvar realisation
```

### 1.2 Extended Variable Space

Adds to §spec §3:

```
<expr>    lazy: deferred until progress stalls or unquoted
```

All other variable forms are as in spec.md.

---

## 2. Lazy Expressions

Adds to §spec §3, §10.

```
LAZY-EXPR = '<' EXPR '>'
```

Valid wherever CLAUSE is valid (§spec §10).

A lazy expression participates in constraint propagation — constraints
accumulate against its free variables from outside — but its interior is not
entered and no bindings within it are produced until either:

- forward progress **stalls** without the bindings it would produce, or
- it is **unquoted** (`` ` ``), which forces immediate entry

On entry, all accumulated constraints on free variables are applied as a filter
before any enumeration or derivation begins. Results enter the binding store as
novelty (§spec §18.2).

**Unquote interaction.** Unquoting a lazy expression (`` `<expr> ``) forces
entry at that point. Accumulated constraints still apply. This is the one
LRPL-specific effect of the unquote operator; all other unquote semantics are
defined in spec.md.

**Property, not action.** Outside of explicit unquote, evaluation is triggered
by conditions being met, not by an external call.

**Free variable scope.** Variables appearing both inside and outside `<expr>`
are shared. Variables appearing only inside are scoped to the expression.

**Avar interaction.** An avar inside `<expr>` is not dispatched until the
expression is entered. Dispatch then occurs in the next cycle's phase 8
(§8 below).

---

## 3. Constraint Memos

Adds to §spec §11, §12.

Before an lvar is bound, the agent records candidate worlds as a constraint
memo in **disjunctive normal form** (DNF), stored under `:memo` in the lvar's
metadata:

```rpl
?x ^ {:memo DNF-EXPR}
?x ^:memo ?dnf
```

```
DNF-EXPR = DNF-CONJ | DNF-CONJ '|' DNF-EXPR
DNF-CONJ = '(' TAIL ')'
```

### 3.1 Purpose

**Deferred binding** — binding is deferred while the constraint space is large
or uncertain.

**Early conflict detection** — incompatible constraints on the same lvar surface
before either rule fires.

**Non-monotonic reasoning** — unsatisfiable disjuncts are retracted as new
facts arrive. Retraction is recorded in the trace (§spec §12.4).

### 3.2 Accumulation and Realisation

Memos accumulate monotonically. Retraction of a disjunct is non-monotonic.

An lvar is **realised** (bound to a ground value) when:
- exactly one fully-ground disjunct remains, or
- a downstream goal requires a ground value and no further progress is possible

Realisation is a last resort. Forced realisation is non-monotonic and is
recorded in the trace.

---

## 4. Satisfactory Quiescence

Overrides §spec §18.3.

Full quiescence (fixpoint over all relations) is neither required nor assumed.
**Satisfactory quiescence** is goal-relative.

In Bloom/CALM terms: satisfactory quiescence identifies the **monotonic
frontier** of a goal — the largest set of derivations that can proceed
coordination-free before a non-monotonic commitment is required.

### 4.1 Required Binding Set

For goal `%g`, the required binding set is the transitive closure of the goal's
argument lvars and the lvars of every relation in its dependency graph,
excluding bindings inside lazy expressions until those expressions are entered.

Quiescence of the required binding set is sufficient to select the goal.

### 4.2 Runtime Responsibility

The satisfactory quiescence boundary is derived by the runtime from the
dependency graph and memo state. It is never declared by authors.

### 4.3 Exploration Heuristics

When no goal is selectable, the runtime explores by two drives:

**Shared-first** — prefer bindings in the required binding sets of the most
goals simultaneously.

**Adversarial early stopping** — seek the constraint or input that invalidates
the most goals. Fewest necessary concrete bindings, not most thorough
exploration.

These define the stopping shape, not the algorithm.

---

## 5. Standard Library

### 5.1 `$index`

Maps an external source to a relation's argument positions. Lazy by default —
not entered until a downstream goal requires bound values.

```
$index(LOCATION)
$index(LOCATION, "projection hint")
$index(SOURCE-RELATION(?a, $collection), "projection hint"?)
```

**Location** — string path, URL, or relation call.

**Projection hint** — string, not unifiable. Omit when mapping is self-evident.

**Collection avar** — the `$`-marked argument in a source relation identifies
the collection to enumerate. One `$`-marked arg per call. Nesting is unwound
by repeated application, each level carrying parent bindings forward.

Accumulated constraints filter the scan before entry.

### 5.2 `$generate`

```
$generate(?prompt) ^:result ?content
$generate(?prompt, ?options) ^:result ?content
```

**Options** — map of generation hints; does not participate in unification.

Generated values carry `:generated true` provenance in the trace.

### 5.3 `$write`

```
$write(?content, ?location)
$write(?content, ?location, ?options)
```

A trace stratum written via `$write` is a valid `$index` source for a future
stratum.

### 5.4 `length`

```rpl
length(?collection, $n) <= $n = |`?collection|
```

`?collection` may be a list, set, or relation-valued lvar. `$n` is deduced as
the cardinality.

---

## 6. Extended Timestep

Extends §spec §18. Phases 3, 7, and 8 are modified:

```
1. Assert new avars                              (unchanged)
2. Assert input novelty                          (unchanged)
3. Quiesce + propagate memos                     (extended)
4. Activate goals (satisfactory quiescence)      (extended)
5. Update plans                                  (unchanged)
6. Progress plan                                 (unchanged)
7. Quiesce + propagate memos                     (extended)
8. Dispatch asyncs — lazy exprs excluded         (extended)
```

**Memo propagation** (phases 3 and 7, after standard quiescence):
1. Apply accumulated constraints to each unbound lvar's memo.
2. Retract unsatisfiable disjuncts.
3. Realise lvars with exactly one ground disjunct.
4. Surface conflict if no disjuncts remain.

**Lazy dispatch** — avars inside `<expr>` are not dispatched at phase 8 unless
the expression has been entered (via stall or unquote).

**Additional failure modes** (extends §spec §18.6):

```
Memo conflict (no disjuncts remain)    agent surfaces; user decides
Lazy expr never entered                silent; goal may be unsatisfiable
Realisation forced prematurely         agent warns; records in trace
```

---

## Appendix. Grammar Extensions

Extends §spec Appendix.

```
VAR      += LAZY-EXPR
LAZY-EXPR = '<' EXPR '>'

MEMO      = DNF-EXPR
DNF-EXPR  = DNF-CONJ | DNF-CONJ '|' DNF-EXPR
DNF-CONJ  = '(' TAIL ')'

INDEX-CALL         = '$index' '(' INDEX-LOC [ ',' STRING ]? ')'
INDEX-LOC          = STRING | RELATION-WITH-AVAR
RELATION-WITH-AVAR = LABEL '(' [ INDEX-ARG [ ',' INDEX-ARG ]* ]? ')'
INDEX-ARG          = LVAR | ASYNC-VAR | LITERAL | '_'

STDLIB = '$index' | '$generate' | '$write' | '$copy'
       | '$transform' | 'length'
```

`:memo` is a reserved metadata key; its value must be `DNF-EXPR`.
One `$`-marked arg per `$index` call.
`STDLIB` names may not be used as user-defined relation names.
