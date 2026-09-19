# Layer `rpl-source`

**Provides.** How a Markdown document denotes an RPL program.

**Depends on.** [`rpl`](rpl.md).

**Not provided.** New connectives. This layer is a source format, not a logic.

---

### rpl-source.1 — Headings start rules

**Law.** A heading may carry a relation, goal, or tool head, optionally with a tail. The heading starts the rule. The body conjoins.

**FOL reading.** *Comment.* Notation for writing the same sentences as `rpl`.

**Surface.**

```
# Human Title - rel(?arg)
# Human Title - %goal(?arg) <- body-rel(?arg)
```

**Spec.** [rpl.md §17.1](../specification/rpl.md#171-heading-forms), [rpl.md §17.4](../specification/rpl.md#174-full-rule-tail-order).

**Example.** Tail order is heading tail, then prose unification terms, then fenced `rpl` blocks.

**Not.** A heading title is not itself a predicate name unless a signature says so.

---

### rpl-source.2 — Prose materialises

**Law.** Body prose is instruction and, after materialisation, part of the rule. `__word__` marks a variable site, normalized to kebab-case.

**FOL reading.** *Comment.* Two eligible materialisations of the same prose are possible. Choice is [`agent`](agent.md).

**Surface.** `__first name__` → `?first-name`. In a goal heading, emphasis is advisory.

**Spec.** [rpl.md §17.2](../specification/rpl.md#172-body-prose), [motivation.md](../motivation.md).

**Example.** A heading plus emphasised spans can denote a rule with no fenced block.

**Not.** Prose does not add a connective. It denotes `rpl` sentences.

---

### rpl-source.3 — Fences and scope

**Law.** A fenced `rpl` block conjoins expressions onto the current heading’s rule, including child headings, not siblings or parents. Heading level sets scope. `--` returns to the parent scope.

**FOL reading.** *Comment.* Scope of which sentences are in the program.

**Surface.** ` ```rpl ` blocks; `--`.

**Spec.** [rpl.md §17.3](../specification/rpl.md#173-fenced-rpl-blocks), [rpl.md §17.5](../specification/rpl.md#175-scope-and---).

**Example.** See [rpl.md §17.5](../specification/rpl.md#175-scope-and---).

**Not.** A fence does not start a new logic.
