# Layer `lrpl`

**Provides.** Lazy Relational Prompt Language: deferred interiors, constraint memos, satisfactory quiescence, and the lazy stdlib delta.

**Depends on.** [`rpl`](rpl.md).

**Not provided.** A new relational core. Every valid `rpl` program remains valid.

Hosts that *run* LRPL also take [`rpl-runtime`](rpl-runtime.md) (and usually [`rpl-source`](rpl-source.md), [`agent`](agent.md)). Those are not dependencies of this layer’s *meaning*.

---

### lrpl.1 — Lazy expressions

**Law.** `<expr>` participates in outward constraints on its free variables. Its interior is not the same reading as bare `EXPR` until progress requires it or `#<expr>` expands it.

**FOL reading.** *Comment.* Evaluation control, not a new connective on truth.

**Surface.** `<expr>`, `#<expr>`.

**Spec.** [lrpl.md §2](../specification/lrpl.md#2-lazy-expressions).

**Example.** An avar inside `<expr>` is not dispatched until the expression is entered.

**Not.** A third variable sigil. `?` and `$` stay [`rpl`](rpl.md).

---

### lrpl.2 — Constraint memos

**Law.** Before an lvar is bound, candidate worlds may be recorded as a DNF memo on its metadata. Unsatisfiable disjuncts retract.

**FOL reading.** *Comment.* Tracked disjunctions of constraints. Retraction is non-monotonic ([`agent`](agent.md)).

**Surface.** `?x ^ {:memo DNF-EXPR}`, `?x ^:memo ?dnf`.

**Spec.** [lrpl.md §3](../specification/lrpl.md#3-constraint-memos).

**Example.** Incompatible constraints on `?x` surface before either rule fires.

**Not.** A replacement for `rpl.4` invariants. Memos narrow; invariants still check.

---

### lrpl.3 — Satisfactory quiescence

**Law.** Work may stop at the monotonic frontier of the current goal, rather than a full fixpoint.

**FOL reading.** *Comment.* The largest coordination-free prefix of the goal ([theory.md](../theory.md#satisfactory-quiescence-lrpl-bloomcalm-framing)).

**Surface.** None. Host evaluation.

**Spec.** [lrpl.md](../specification/lrpl.md) (satisfactory quiescence).

**Example.** Bindings not required by the active goal stay unrealised.

**Not.** A licence to drop `rpl.4` constraints that *are* required by that goal.

---

### lrpl.4 — Lazy stdlib and session store

**Law.** `$index`, `$read`, `$generate`, `$write` are specified here as the lazy stdlib delta. `$json` remains as in `rpl`. Tool calls need not run until progress needs their result. Optional hosts persist ground truth under `.rpl` and read `.rplrc` at session start.

**FOL reading.** *Comment.* Oracles and host memory, like `rpl.9`.

**Surface.** `$index(...)`, `$read(...)`, `.rplrc`.

**Spec.** [lrpl.md §1](../specification/lrpl.md#1-overview), [lrpl.md §5](../specification/lrpl.md), [lrpl.md §7](../specification/lrpl.md).

**Example.** `<$label(...)>` is lazy expression plus lazy tool dispatch.

**Not.** A requirement that every host have a filesystem.
