# Layer `rpl`

**Provides.** Base Relational Prompt Language: the relational, goal, tool, and constraint language on top of `fol`.

**Depends on.** [`fol`](fol.md).

**Not provided.** Markdown embedding ([`rpl-source`](rpl-source.md)), timestep / shell ([`rpl-runtime`](rpl-runtime.md)), additional logics, lazy evaluation ([`lrpl`](lrpl.md)).

---

### rpl.1 — Relations name facts, not actions

**Law.** Relation labels are declarative. Names are kebab-case.

**FOL reading.** The predicates of `fol`, with an authoring restriction.

**Surface.** `name(?first, ?last)`, not `collect-name(...)`.

**Spec.** [rpl.md §9](../specification/rpl.md#9-relations).

**Example.**

```rpl
locked-ingredient-line($ingredient, $qtyNote)
```

**Not.** A relation is not a command.

---

### rpl.2 — `#?x` is the syntax reading

**Law.** `?x` means the value of the binding. `#?x` means the form of the bound expression.

**FOL reading.** *Partial.* Value reading is `fol`. Expansion is a syntactic operation, not a FOL connective.

**Surface.** `?x`, `#?x`.

**Spec.** [rpl.md §3](../specification/rpl.md#3-variables), [rpl.md §5.7](../specification/rpl.md#57-expansion).

**Example.**

```rpl
outer(?r, ?y) <- ... -> ?r -> inner(?x)
```

**Not.** An lvar in callee position is still ill-formed.

---

### rpl.3 — Matching and collections

**Law.** `~ PATTERN` is structural matching. Collections are lists, sets, and maps. A relation call is not a collection element.

**FOL reading.** Unification against a pattern form. Not a FOL connective.

**Surface.** `?x = ~ {:key ?val}`, `[?a ?b]`, `#{?a ?b}`, `{?k ?v}`.

**Spec.** [rpl.md §4](../specification/rpl.md#4-collections), [rpl.md §6](../specification/rpl.md#6-in-place-matching).

**Example.**

```rpl
?s ~ /chest pain/
```

**Not.** Bare `=` does not match structure.

---

### rpl.4 — Invariant implication

**Law.** `LEFT -> RIGHT` is an invariant: under the left-hand conditions, the right-hand side must hold.

**FOL reading.** An obligation LEFT ⊨ RIGHT, checked, not used to generate heads.

**Surface.** `… -> CONSTRAINT`.

**Spec.** [rpl.md §12](../specification/rpl.md#12-constraints-and-tracing).

**Example.**

```rpl
edit-brief(?d, ?g), editing-goal(?g) -> valid-editing-goal(?g)
rel1(?x), rel2(?x) -> false
```

**Not.** `->` is not the `%` namespace. [logics.md](../specification/logics.md) sometimes calls `->` “Goals” in the fact/proof sense. That is this invariant. It is not `%`.

---

### rpl.5 — Assertion and proof together

**Law.** A standalone expression is asserted and required to hold.

**FOL reading.** Existence plus obligation. Canonical form:

```
true <- expr -> true
```

**Surface.** A bare `expr`.

**Spec.** [logics.md §1](../specification/logics.md#1-motivation-and-base-logic), [rpl.md §10](../specification/rpl.md#10-rules-and-implication).

**Example.**

```rpl
names-workflow-phase("explore")
```

**Not.** Splitting existence from proof is [`existential`](existential.md), not this layer.

---

### rpl.6 — A grounded invariant is a trace

**Law.** An ungrounded constraint is a live check. Once every variable is bound, it is a trace. Traces are ordinary relations.

**FOL reading.** A closed sentence, recorded.

**Surface.** `… ^^ {…} -> true`; retract with `… -> false`.

**Spec.** [rpl.md §12.2–12.5](../specification/rpl.md#122-constraint-grounding), [vision.md](../vision.md#the-trace).

**Example.**

```rpl
editing-goal(?g) ^^ {?g "publish", ?d "draft-0"} -> true
```

**Not.** The trace is not optional debug output.

**Comment.** Retraction is non-monotonic. Coordination is [`agent`](agent.md).

---

### rpl.7 — Three namespaces, one grammar

**Law.** Relations, goals, and tools are syntactically distinct and uniform under the rule grammar.

**FOL reading.** *Partial.* Relations are predicates. Goals are queries (rpl.8). Tools are oracles: they are not theorems of `fol`.

**Surface.** `rel(…)`, `%goal(…)`, `$tool(…)`.

**Spec.** [rpl.md §1](../specification/rpl.md#1-overview), [rpl.md §14](../specification/rpl.md#14-tools), [rpl.md §15](../specification/rpl.md#15-goals).

**Example.**

```rpl
ask(?prompt, ?answer) <- $ask(?prompt) ^ ~ {:result ?answer}
```

**Not.** A tool is not a derived relation. Hide it behind a relation when you want a stable interface ([rpl.md §13.3](../specification/rpl.md#133-resolution-as-grounded-constraint)).

---

### rpl.8 — A goal is an existential problem

**Law.** A goal is a rule whose head is in `%`. Unbound arguments ask for a witness.

**FOL reading.** ∃x⃗ BODY(x⃗). Several `%` rules disjoin (`fol.4`).

**Surface.** `% <- tail`, `%name <- tail`, `%name(?a, ?b) <- tail`.

**Spec.** [rpl.md §15](../specification/rpl.md#15-goals).

**Example.**

```rpl
% <- %needs-discovery | %needs-edit
```

**Not.** A goal is not an imperative script.

**Comment.** Named-goal choice with no root `%` is [`agent`](agent.md).

---

### rpl.9 — `$` marks async deduction

**Law.** `$x` suspends until a later timestep. `$name(...)` is a tool. `?x` is resolved in the current deductive step.

**FOL reading.** *Comment.* There is no FOL connective for “the witness arrives later.” The spec treats `$` as a Bloom-style channel ([theory.md](../theory.md)). Resolution is a grounded constraint (rpl.6).

**Surface.** `$x`, `$tool(...)`, sugar `?r = $tool(...)`.

**Spec.** [rpl.md §13](../specification/rpl.md#13-async-variables), [rpl.md §14](../specification/rpl.md#14-tools), [scope.md](../scope.md#inference-and-deduction).

**Example.**

```rpl
?answer = $ask("How are you?")
```

**Not.** `$` is not a second sort of lvar. Scope: `?` inferred, `$` deduced.

---

### rpl.10 — Abductives activate; they do not generate

**Law.** `; @when`, `@choose`, `@distinct`, `@each`, `@for` control activation of a rule.

**FOL reading.** *Comment.* Formal, not Horn generators ([theory.md](../theory.md#layers-formal-and-agent)).

**Surface.** `HEAD <- EXPR ; ABDUCTIVE`.

**Spec.** [rpl.md §16](../specification/rpl.md#16-activation-clause--abductives).

**Example.**

```rpl
%needs-edit(?d) <- edit-brief(?d, ?g) ; @when(?g != "unknown")
```

**Not.** Nested `HEAD <- HEAD <- TAIL` is a permitted idiom, not the execution model ([rpl.md §10](../specification/rpl.md#10-rules-and-implication)).

---

### rpl.11 — Data operators

**Law.** Arithmetic, comparison (other than `=` / `!=`, which are [`fol`](fol.md)), set operators, temporal operators, and cardinality `|…|` are part of this layer’s term language.

**FOL reading.** *Partial.* Functions and defined predicates on terms. They do not change `fol.6`.

**Surface.** `+ - * /`, `< > <= >=`, `union` `intersect` `difference` `in`, `before` `after` `within` `between`, `|rel(?x)|`.

**Spec.** [rpl.md §5](../specification/rpl.md#5-operators).

**Example.**

```rpl
|locked-ingredient-line(?i, ?q)|
```

**Not.** `<=` as implication. Implication remains `<-` / `->`.
