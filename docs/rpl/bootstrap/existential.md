# Layer `existential`

**Provides.** Lifecycle operators that split `rpl.5`’s two-sided commitment into log, impulse, consistency, and eventually.

**Depends on.** [`rpl`](rpl.md).

**Not provided.** Modal or interpretive operators. Those are sibling layers.

---

### existential.1 — Head `<%` and tail `%>`

**Law.** Four modes:

| Mode | Surface | Reading |
| --- | --- | --- |
| Log | `true <% A` | Permanent record |
| Impulse | `A <% true` | Transient until next quiescence |
| Consistency | `true %> A` | Structural invariant |
| Eventually | `A %> true` | Pending until A holds |

**FOL reading.** *Comment.* Not Horn. An additional logic over `rpl` sentences.

**Surface.** `<%`, `%>`.

**Spec.** [logics.md §2](../specification/logics.md#2-additional-logic-a-existential).

**Example.**

```rpl
true <% BlackSwan
BlackSwan %> true
```

**Not.** A replacement for `<-` or `->`. Impulses evaporate at satisfactory quiescence when [`lrpl`](lrpl.md) is also taken; that interaction is specified in [logics.md](../specification/logics.md), not here.
