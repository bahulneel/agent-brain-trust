# Lazy Relational Prompt Language (LRPL) — Formal Specification

Extends RPL ([rpl.md](rpl.md)). Defines only the delta. All base
definitions are as specified in rpl.md unless explicitly overridden here.
LRPL inherits the **declarative reading** of surface syntax (see [motivation.md](../motivation.md#language-overview-why-rpl-is-shaped-this-way)); sections
below add **meaning** for lazy forms and memos, not a mandatory execution recipe.

---

## 1. Overview

LRPL adds three capabilities to RPL:

- **Lazy expressions** — deferred evaluation until forward progress requires it
- **Constraint memos** — candidate world tracking for unbound lvars in DNF
- **Satisfactory quiescence** — goal-relative quiescence boundary in place of
  full fixpoint

And standard library additions:

- **`$index`** — external data mapped into relation positions
- **`$generate`**, **`$write`** — generation and persistence
- **`$json`** — built-in chat emission of an lvar’s binding as NDJSON (see rpl.md §14.2)

**Lazy tool dispatch** — LRPL’s delta on rpl.md §14: a tool invocation **`$label(…)`**
does not run its external capability until forward progress needs a result only
that call can supply (normative detail §5.0). That is independent of **`<expr>`**
(§2), which defers when a wrapped subexpression counts as fully present for
derivation; `<$label(…)>` applies both mechanisms.

Academic grounding (Bloom, CALM, monotonic vs non-monotonic points) —
[theory.md](../theory.md).

**Extensions** — Separate specifications may add tools and grammar on top of
LRPL. One example is [meta-programming.md](meta-programming.md). Extension details
are **not** duplicated in this document; normative text for an extension lives
only in its own spec.

### 1.1 Extended Variable Space

Adds to rpl.md §3:

```
<expr>    lazy: deferred until progress stalls or until `#<expr>` expands it
```

All other variable forms are as in rpl.md.

---

## 2. Lazy Expressions

Adds to rpl.md §3, §10.

```
LAZY-EXPR = '<' EXPR '>'
```

Valid wherever CLAUSE is valid (rpl.md §10).

The **meaning** of `<expr>` includes **deferral**: constraints from outside may
bear on its free variables, but the interior is **not** yet asserted as the same
reading as plain `EXPR` until either progress **stalls** without the bindings it
would yield, or **`#<expr>`** supplies the **syntax** reading of the lazy wrapper
at that site (rpl.md §5.7). Once the interior counts as **present** under that
reading, accumulated constraints on those variables apply as usual; novelty and
store updates follow rpl.md §18.2.

**Expansion at a lazy site.** `#<expr>` is the form whose **meaning** is: at this
position, the deferred body is read **as** `EXPR` (brackets dropped) for purposes
of constraints and derivation (rpl.md §3, §5.7). That is the LRPL-specific
expansion case; all other expansion **meaning** is as in rpl.md.

**Deferral without `#<expr>`.** The lazy form still **says** that the interior is
not yet contributing as a full `EXPR` would; **when** implementations widen that
assertion (e.g. on stall) is not fixed by this delta (cf. [motivation.md](../motivation.md#language-overview-why-rpl-is-shaped-this-way) on non-prescriptive scheduling).

**Free variable scope.** Variables appearing both inside and outside `<expr>`
are shared. Variables appearing only inside are scoped to the expression.

**Avar interaction.** An avar inside `<expr>` is not dispatched until the
expression is entered. Dispatch then occurs in the next cycle's phase 8
(§8 below).

---

## 3. Constraint Memos

Adds to rpl.md §11, §12.

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
facts arrive. Retraction is recorded in the trace (rpl.md §12.4).

### 3.2 Accumulation and Realisation

Memos accumulate monotonically. Retraction of a disjunct is non-monotonic.

An lvar is **realised** (bound to a ground value) when:
- exactly one fully-ground disjunct remains, or
- a downstream goal requires a ground value and no further progress is possible

Realisation is a last resort. Forced realisation is non-monotonic and is
recorded in the trace.

---

## 4. Satisfactory Quiescence

Overrides rpl.md §18.3.

Full quiescence (fixpoint over all relations) is neither required nor assumed.
**Satisfactory quiescence** is goal-relative.

Bloom/CALM framing of satisfactory quiescence — [theory.md](../theory.md#satisfactory-quiescence-lrpl-bloomcalm-framing).

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

### 5.0 Tool dispatch

For every **`$label(…)`** (rpl.md §14), the runtime must not invoke the external
capability until derivation, goal satisfaction, or memo propagation **requires** a
value, binding, or effect that only that invocation can provide. Speculative or
eager tool execution is not prescribed by this document.

**`<expr>`** (§2) is a different axis: it defers when the interior participates as
ordinary syntax in the rule. Wrapping `<$label(…)>` combines expression deferral with
lazy tool dispatch; an unwrapped call is subject only to the latter.

### 5.1 `$index`

Maps an external source to a relation's argument positions.

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

### 5.4 `$json`

Same semantics as rpl.md §14.2. **`$json`** is a **built-in** tool (no external
capability URL): it **only** serializes an lvar’s **value reading** to **JSON**
and appends **NDJSON** lines to the **chat** transcript.

Lazy dispatch (§5.0) applies: the call is not executed until progress requires it.
Authors use `$json(?x)` to **trace** or **debug** bindings visible to the user
without defining a custom tool.

---

## 6. Extended Timestep

Extends rpl.md §18. Phases 3, 7, and 8 are modified:

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
the expression has been entered (via stall or expansion `#<expr>`).

**Additional failure modes** (extends rpl.md §18.6):

```
Memo conflict (no disjuncts remain)    agent surfaces; user decides
Lazy expr never entered                silent; goal may be unsatisfiable
Realisation forced prematurely         agent warns; records in trace
```

---

## Appendix. Grammar Extensions

Extends rpl.md Appendix. Nonterminals not listed here are unchanged there—including
`STRING`, which allows both single- and double-quoted literals (rpl.md §2).

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

STDLIB = '$index' | '$generate' | '$write' | '$json' | '$copy'
       | '$transform'
```

`:memo` is a reserved metadata key; its value must be `DNF-EXPR`.
One `$`-marked arg per `$index` call.
`STDLIB` names may not be used as user-defined relation names.
