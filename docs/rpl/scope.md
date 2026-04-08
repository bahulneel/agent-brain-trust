# RPL — Scope

Product boundaries, variable roles at a glance, and typical use cases. For why
RPL exists, see [motivation.md](motivation.md). For aspirations and design
principles, see [vision.md](vision.md).

---

## Inference and Deduction

RPL uses two kinds of variables, and the distinction is load-bearing.

`?x` is an **inferred** variable — it must be bound by existing facts before the
relation can be evaluated. It is a pattern that matches against what is already
known.

`$x` is a **deduced** variable — the relation body *provides* its value.
Evaluation of the relation is the deduction procedure that produces the binding.
Where `?x` goes in, `$x` comes out.

This is most visible in relation signatures:

```rpl
severity(?s)      -- ?s must already be known; this matches a known severity
severity($s)      -- $s will be deduced; this relation produces a severity
```

The `$` sigil marks the produced positions — the values that come out of
evaluation rather than going in. This is also why tool calls use `$`: a tool is
a deduction procedure that produces a value the agent does not yet have.

---

## What RPL Is Not

RPL is not a programming language. It has no loops, no mutable state, no
imperative control flow.

RPL is not an enterprise runtime substrate. It should not be used as a
long-running mission-critical execution layer.

RPL is not an agent framework. It does not specify how an agent reasons, plans,
or recovers from failure. Where the language is silent, agent judgment applies.

RPL is not a workflow engine. It does not schedule tasks, manage queues, or
orchestrate services.

RPL is not a prompt template. Its relation to prose is the opposite of a template:
prose provides human-readable instruction, RPL provides the formal structure
that makes that instruction composable and verifiable.

RPL is not a way to avoid thinking about prompts. It usually requires more
intentional reasoning up front, in exchange for better inspectability and
repairability.

---

## What RPL Is For

RPL is for any goal-directed conversation process that:

- exceeds what a single context can hold,
- requires verifiable continuity across steps or participants,
- and benefits from an auditable record of what was established and why.

This covers more ground than it might first appear.

**Structured intake and triage** — the introductory example in the README. A
multi-step process for collecting facts, validating them, and routing to an
outcome. Simple enough to introduce the language; not representative of its
range.

**Phased reviews and approvals** — a code review, a design critique, a regulatory
sign-off. Each phase has entry conditions, exit conditions, and a declared set of
facts that must be established before the next phase can proceed. The trace is the
audit trail.

**Collaborative workshops** — multiple participants, multiple perspectives, a
shared goal. The relational structure ensures that each participant's contribution
is a named fact with declared provenance, not a voice in an undifferentiated
stream.

**Automated pipelines with human checkpoints** — a process that is mostly
automated but requires human judgment at specific decision points. RPL declares
where those points are and what must be true before and after each one.

**Cross-session and cross-agent continuity** — a task that spans multiple context
windows, multiple model instances, or multiple sessions. The trace from one
stratum is the ground facts for the next. Continuity is structural, not assumed.

**HCI over business artifacts** — RPL can sit between colleagues and business
systems/artifacts (process docs, siloed data, training material, org charts,
APIs, HR process descriptions), giving the model a shared semantic layer for
connecting and querying across them in conversation.

These are not different use cases requiring different tools. They are all instances
of the same structural problem: goal-directed reasoning that needs to hold
together across boundaries that would otherwise break it.

---

## A note on scope

The README introduces RPL through a bug report intake — a familiar, bounded
example that makes the language mechanics easy to follow. It is deliberately
simple.

The examples above suggest a wider range. The formal machinery that makes a bug
report work — named relations, goal-driven execution, async collection,
dependency-driven ordering, a queryable trace — is the same machinery that makes
a multi-phase workshop, a cross-session pipeline, or a distributed approval
process work. The bug report is one instance. It is not the intended ceiling.

---

## Document map

- [README.md](README.md) — entry point and worked example.
- [motivation.md](motivation.md) — problem framing and language overview.
- [theory.md](theory.md) — Bloom, CALM, layers.
- [vision.md](vision.md) — central ideas, trace, lazy extension summary, design principles.
- [enterprise.md](enterprise.md) — enterprise boundaries and HCI fit.
- [specification/rpl.md](specification/rpl.md) — base normative specification.
- [specification/lrpl.md](specification/lrpl.md) — LRPL delta specification.
