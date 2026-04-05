# RPL Bootstrap — Lazy Layer (LRPL)

Assumes core.md and rpl.md. Adds lazy evaluation, constraint memos, and
satisfactory quiescence. Load this file only when LRPL semantics are required.

---

## Theoretical Anchor

LRPL follows the **CALM theorem** (Bloom, Alvaro et al.): monotonic logic is
coordination-free. The relational core is monotonic — facts accumulate, memos
narrow, the trace grows. Non-monotonic operations are the coordination points
where agent judgment is explicitly required.

```
Monotonic (coordination-free):
  relational derivation, constraint accumulation,
  memo narrowing, trace growth

Non-monotonic (agent judgment required):
  memo disjunct retraction, constraint conflict resolution,
  lazy expression entry, goal selection under ambiguity,
  non-monotonic schema change, forced lvar realisation
```

---

## Lazy Expressions

`<expr>` wraps any valid RPL expression and defers its evaluation:

```
LAZY-EXPR = '<' EXPR '>'
```

A lazy expression:
- participates in **constraint propagation** — constraints accumulate against
  its free variables from outside
- does **not** enter evaluation until forward progress stalls without it
- when entered, applies all accumulated constraints as a filter before any
  enumeration or derivation begins
- is a **property** of the expression, not an action; evaluation is triggered
  by conditions being met, not by an external call

```rpl
result(?x) <= <expensive-relation(?x)>, filter(?x)
content(?x) <= <$read("large-file.md") ^ ~ {:result ?x}>
```

In the second form the file is not read until `?x` is needed downstream.
Accumulated constraints on `?x` filter what is attended to when the read occurs.

**Lazy expressions are not dispatched at phase 8.** An avar inside `<expr>` is
dispatched only when the expression is entered, in the next cycle's phase 8.

---

## Constraint Memos

Before an lvar is bound, the agent may record the **candidate worlds** it is
tracking as a constraint memo in **disjunctive normal form** (DNF), stored under
`:memo` in the lvar's metadata:

```rpl
?severity ^ {:memo (
  (?severity = "critical", ?priority = "high") |
  (?severity = "low",      ?priority = "normal")
)}
```

### Purpose

**Deferred binding** — binding is deferred while the constraint space is large
or uncertain. The memo records what is known without committing.

**Early conflict detection** — incompatible constraints on the same lvar surface
in the memo before either rule fires.

**Non-monotonic reasoning** — as new facts arrive, unsatisfiable disjuncts are
retracted. The surviving disjuncts are the still-valid candidate worlds.

### Accumulation

Memos accumulate monotonically: new constraints narrow existing disjuncts or add
new worlds. Retraction of a disjunct is non-monotonic and is recorded in the
trace with the reason.

### Realisation

An lvar is realised (bound to a ground value) when:
- exactly one fully-ground disjunct remains, or
- a downstream goal requires a ground value and no further progress is possible
  without it

Realisation is a last resort. The runtime prefers constraint propagation over
early binding. Forced realisation is a non-monotonic act and is recorded in the
trace.

---

## Satisfactory Quiescence

Full quiescence (Datalog fixpoint over all relations) is neither required nor
assumed. **Satisfactory quiescence** is goal-relative:

The runtime identifies the **monotonic frontier** of the current goal — the
minimal set of bindings that must be resolved for that goal to be selectable —
and quiesces that set. Work outside the frontier may proceed but is not required.

This boundary is **derived by the runtime from the dependency graph and memo
state**. It is never declared by authors. Getting it wrong would be silent and
catastrophic; the runtime is the sole locus of this decision.

### Exploration Heuristics

When no goal is yet selectable, the runtime explores according to two drives:

**Shared-first** — prefer bindings that appear in the required binding sets of
the most goals simultaneously. Highest leverage per derivation step.

**Adversarial early stopping** — seek the constraint or input that would
invalidate the most goals. A conflict that eliminates whole branches early is
more valuable than continued expansion. Aim for the fewest necessary concrete
bindings, not the most thorough exploration.

These define the **stopping shape**, not the algorithm. A conforming runtime
honours these properties; the implementation is unconstrained.

### Extended Timestep

Phases 3, 7, and 8 are extended:

```
3. Quiesce relations + propagate memos
   (after standard fixpoint: apply constraints to memos,
    retract unsatisfiable disjuncts, realise ground disjuncts)
4. Activate goals (satisfactory quiescence boundary, not full fixpoint)
7. Quiesce relations + propagate memos (again)
8. Dispatch asyncs — lazy expressions excluded
```

### Failure Modes (additions to rpl.md)

```
Memo conflict (no disjuncts remain)    agent surfaces; user decides
Lazy expr never entered                silent; goal may be unsatisfiable
Realisation forced prematurely         agent warns; records in trace
```
