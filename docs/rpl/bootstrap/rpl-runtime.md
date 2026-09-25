# Layer `rpl-runtime`

**Provides.** Host rhythm for running `rpl`, and the user-facing shell convention.

**Depends on.** [`rpl`](rpl.md).

**Not provided.** A new meaning for `,` or `<-`. Those stay [`fol`](fol.md).

---

### rpl-runtime.1 — The timestep is a rhythm

**Law.** A timestep may run eight phases: assert avars, assert novelty, quiesce, activate goals, update plans, progress, quiesce, dispatch asyncs. Where the spec is silent, [`agent`](agent.md) judges.

**FOL reading.** *Comment.* Scheduling, not the semantics of a sentence.

**Surface.** None. Host behaviour.

**Spec.** [rpl.md §18](../specification/rpl.md#18-runtime--operating-model), [theory.md](../theory.md#layers-formal-and-agent).

**Example.** Quiesce derives the `fol`+`rpl` theory to fixpoint (or to [`lrpl`](lrpl.md) satisfactory quiescence if that layer is taken).

**Not.** Phase order does not redefine conjunction.

---

### rpl-runtime.2 — RPL shell mode

**Law.** When the user’s last non-empty line starts with `%`, that line is a goal for this turn. Lines above are context. Capture arguments ask for values only. With no substantive output, reply `true` or a short reason.

**FOL reading.** *Comment.* A host convention for posing an `rpl` query.

**Surface.** A final line `% <- …` or `%name(?x) <- …`.

**Spec.** [rpl.md §15.9](../specification/rpl.md#159-rpl-shell-mode-user-message-convention).

**Example.**

```rpl
parent("ann", "bob")
% <- parent("ann", ?c)
```

**Not.** Shell mode is not a new namespace. It is how a turn offers a `%` goal.
