# Layer `agent`

**Provides.** The remainder: where `rpl` is silent, the agent decides. No new syntax.

**Depends on.** [`rpl`](rpl.md).

**Not provided.** Laws that belong in a spec. If a behaviour must be a theorem, it is specified first, then added to the owning layer.

---

### agent.1 — Judgment is the default remainder

**Law.** *Comment.* Agent judgment applies where the language does not pin behaviour.

**FOL reading.** None. Not a connective.

**Surface.** None.

**Spec.** [vision.md](../vision.md#design-principles), [scope.md](../scope.md#what-rpl-is-not), [README.md](../README.md#what-rpl-does-not-do).

**Example.** Planning, error recovery, and interpretation of ambiguous prose.

**Not.** A licence to contradict a law in a taken layer.

---

### agent.2 — Coordination points

**Law.** *Comment.* Non-monotonic steps are coordination: retraction, forced choice, constraint conflict, non-monotonic schema change, and — if [`lrpl`](lrpl.md) is taken — lazy entry and forced realisation.

**FOL reading.** These are exactly the steps `fol.9` does not decide.

**Surface.** `-> false` and host choices. No extra operator.

**Spec.** [theory.md](../theory.md).

**Example.** Two eligible named goals and no root `%` ([rpl.md §15.3](../specification/rpl.md#153-named-goals-and-agent-choice)).

**Not.** A missing axiom of `rpl`. The split is deliberate.

---

### agent.3 — Do not axiomatise interpretation

**Law.** *Comment.* Readings such as “trace a path back to the origin of an idea” are interpretations of a program. They are not laws of `fol` or `rpl`.

**FOL reading.** None.

**Surface.** None.

**Spec.** This bootstrap’s worked example on [language-bootstrap.md](../language-bootstrap.md).

**Example.** `ancestor` is transitive closure of `parent`. Nothing else.

**Not.** A substitute for [`rpl`](rpl.md) traces when you need continuity.
