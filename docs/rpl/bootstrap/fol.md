# Layer `fol`

**Provides.** The definite Horn / Datalog-shaped fragment of first-order logic, spelled in RPL surface form.

**Depends on.** None.

**Not provided.** RPL namespaces, `->` traces, `%`, `$`, Markdown, timestep, additional logics, lazy evaluation.

The fragment is first-order logic, restricted. It does not take arbitrary quantifier prefixes, function-term construction as a primary syntax, or classical completeness.

---

### fol.1 — Truth values exist

**Law.** `true` and `false` are literals.

**FOL reading.** ⊤ and ⊥.

**Surface.** `true`, `false`.

**Spec.** [rpl.md §2](../specification/rpl.md#2-literals).

**Example.**

```rpl
true
false
```

**Not.** `true` is not a command.

---

### fol.2 — An atomic formula is a predicate applied to terms

**Law.** A labelled application names a fact.

**FOL reading.** P(t₁, …, tₙ).

**Surface.** `LABEL '(' ARG,* ')'`.

**Spec.** [rpl.md §9](../specification/rpl.md#9-relations).

**Example.**

```rpl
parent(?x, ?y)
```

**Not.** This layer does not fix RPL naming style or the `%` / `$` namespaces. Those are [`rpl`](rpl.md).

---

### fol.3 — Conjunction

**Law.** A comma joins claims that must hold together.

**FOL reading.** ∧.

**Surface.** `A , B`.

**Spec.** [rpl.md §5.5](../specification/rpl.md#55-logical-operators), [rpl.md §10](../specification/rpl.md#10-rules-and-implication).

**Example.**

```rpl
parent(?x, ?y), ancestor(?y, ?z)
```

**Not.** Comma is not sequencing.

---

### fol.4 — Disjunction

**Law.** A bar joins alternative claims.

**FOL reading.** ∨.

**Surface.** `A | B`.

**Spec.** [rpl.md §5.5](../specification/rpl.md#55-logical-operators), [rpl.md §10](../specification/rpl.md#10-rules-and-implication).

**Example.**

```rpl
parent(?x, ?y) | mentor(?x, ?y)
```

**Not.** Which eligible alternative is tried first is not a theorem of `fol`. That is [`agent`](agent.md) plus [`rpl-runtime`](rpl-runtime.md).

---

### fol.5 — Negation is written, not classified

**Law.** `not A` is a well-formed operator.

**FOL reading.** *Comment.* [rpl.md §5.5](../specification/rpl.md#55-logical-operators) lists `not`. It does not say classical ¬ versus failure to prove.

**Surface.** `not A`.

**Spec.** [rpl.md §5.5](../specification/rpl.md#55-logical-operators).

**Example.**

```rpl
not premium-member(?user)
```

**Not.** A missing fact is not automatically a proof of `not P`.

---

### fol.6 — Horn implication

**Law.** `HEAD <- BODY` means the head holds when the body holds.

**FOL reading.** ∀x⃗ (BODY(x⃗) → HEAD(x⃗)).

**Surface.** `HEAD <- EXPR`.

**Spec.** [rpl.md §10](../specification/rpl.md#10-rules-and-implication).

**Example.**

```rpl
ancestor(?x, ?y) <- parent(?x, ?y)
ancestor(?x, ?z) <- parent(?x, ?y), ancestor(?y, ?z)
```

**Not.** `<-` is not a procedure call. `<=` is comparison ([rpl.md §5.1](../specification/rpl.md#51-comparison-and-arithmetic)), not implication.

---

### fol.7 — Logical variables

**Law.** `?name` is a logical variable. `_` matches anything and binds nothing.

**FOL reading.** In a rule (fol.6), free lvars are universal. In a query, unbound lvars are existential. Queries as a distinct `%` namespace are [`rpl`](rpl.md).

**Surface.** `?name`, `_`.

**Spec.** [rpl.md §3](../specification/rpl.md#3-variables).

**Example.**

```rpl
ancestor(?x, ?y) <- parent(?x, ?y)
```

**Not.** `?q(?a)` is ill-formed. The callee must be a label. Syntax-reading `#?x` is [`rpl`](rpl.md).

---

### fol.8 — Equality

**Law.** `=` is equality of values. `!=` is its denial.

**FOL reading.** Identity of values.

**Surface.** `?x = ?y`, `?x != ?y`.

**Spec.** [rpl.md §5.1](../specification/rpl.md#51-comparison-and-arithmetic).

**Example.**

```rpl
?g != "unknown"
```

**Not.** Structural matching is [`rpl`](rpl.md) (`~ PATTERN`).

---

### fol.9 — The Horn theory is monotonic

**Law.** Adding sentences does not withdraw earlier consequences of this fragment.

**FOL reading.** Monotonic consequence.

**Surface.** None.

**Spec.** [theory.md](../theory.md).

**Example.** The same facts and clauses yield the same `ancestor` tuples for any reader.

**Not.** Retraction, forced choice, and lazy entry are not theorems of `fol`. They appear in [`rpl`](rpl.md), [`lrpl`](lrpl.md), and [`agent`](agent.md).
