# RPL and LRPL — Theory

This document consolidates academic grounding and layering that apply to RPL and
its lazy extension (LRPL). Normative mechanics live in
[specification/rpl.md](specification/rpl.md) and
[specification/lrpl.md](specification/lrpl.md).

---

## Bloom, CALM, and monotonicity (RPL)

RPL's operating model follows **Bloom** — a language for distributed programming
from Hellerstein, Alvaro, and collaborators, grounded in **CALM** (Consistency as
Logical Monotonicity). Joe Hellerstein introduced the conjecture (PODS 2010
keynote); Ameloot, Neven, and Van den Bussche proved a revised form (2013). The
**CALM theorem** says a problem has a consistent, coordination-free distributed
implementation **if and only if** the problem is monotonic — so monotonic stages
need no coordination for consistency, and non-monotonic steps are where
coordination is required. In RPL terms: any agent with the same facts reaches the
same conclusions in the monotonic core, regardless of order or timing.
Non-monotonic operations — retractions, forced choices, conflict resolutions —
are the coordination points.

RPL maps directly onto this model. The relational core — fact accumulation, rule
derivation, goal satisfaction — is monotonic. The trace grows but never shrinks.
Any agent with access to the same trace reaches the same conclusions. This is
what makes handoffs and cross-context continuity structurally sound rather than
hoped for.

The non-monotonic points are explicit: constraint conflict resolution, goal
selection under ambiguity, non-monotonic schema change. These are the points
where RPL defers to agent judgment — not because the language is incomplete, but
because these are precisely the coordination points that no purely declarative
system can resolve without external input.

Async variables (`$x`) follow Bloom's asynchronous channel model: a fact
asserted at a future timestep, arriving non-deterministically but ground when it
arrives. The trace is Bloom persistence — facts that survive across timestep
boundaries and form the ground for future derivation.

---

## Monotonic and non-monotonic points (LRPL)

The following is taken from the LRPL specification overview; it extends the
picture with memo narrowing, lazy entry, and forced realisation.

LRPL's evaluation model follows **Bloom** (Hellerstein, Alvaro, et al.) and the
**CALM** result (Consistency as Logical Monotonicity): Hellerstein conjectured
(PODS 2010); Ameloot, Neven, and Van den Bussche proved a revised statement
(2013) that a problem admits a consistent, coordination-free distributed
implementation **if and only if** it is monotonic. Work such as *Keeping CALM:
When Distributed Consistency Is Easy* (2019/2020) extends the story. The
relational core is monotonic — facts accumulate, memos narrow, the trace grows.
Non-monotonic operations are the coordination points where agent judgment is
required:

```
Monotonic:
  relational derivation, constraint accumulation,
  memo narrowing, trace growth

Non-monotonic (agent judgment required):
  memo disjunct retraction, constraint conflict resolution,
  lazy expression entry, goal selection under ambiguity,
  non-monotonic schema change, forced lvar realisation
```

---

## Layers (formal and agent)

The following is taken from the base runtime section of the RPL specification.

```
Formal layer     rules, constraints, abductives, quiescence, dispatch
Agent layer      interpretation, ambiguity, non-monotonic change, planning,
                 error recovery
```

---

## Satisfactory quiescence (LRPL, Bloom/CALM framing)

The following sentence is taken from the LRPL specification (satisfactory
quiescence section):

In Bloom/CALM terms: satisfactory quiescence identifies the **monotonic
frontier** of a goal — the largest set of derivations that can proceed
coordination-free before a non-monotonic commitment is required.

---

## Related documents

- [Motivation](motivation.md)
- [Vision](vision.md)
- [Scope](scope.md)
- [Base specification](specification/rpl.md)
- [LRPL specification](specification/lrpl.md)
