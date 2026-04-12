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
editing-goal(?g)  -- ?g must already be known; this matches a known goal
editing-goal($g)  -- $g will be deduced; this relation produces a goal
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

**Single-session recipe planning and cooking** — the introductory example in the
README. A staged flow (explore, refine, lock, overview, cook mode) that stays in
one chat while naming explicit facts, collections, and outputs.

**Turn taking and discovery in one chat** — the user and agent alternate turns,
collect missing context, and converge on one or two immediate goals with explicit
facts.

**Lightweight tool orchestration** — a bounded sequence (for example, one search
and one summarization step) to support a single chat decision, not a large
multi-goal automation pipeline.

**Trace handoff between phases** — for multi-phase collaboration, persist traces
into documents or third-party systems (for example issue comments) and treat each
later phase as a new bounded session that reads prior trace facts.

**HCI over business artifacts** — RPL can sit between colleagues and business
systems/artifacts (process docs, siloed data, training material, org charts,
APIs, HR process descriptions), giving the model a shared semantic layer for
connecting and querying across them in conversation.

These are not different use cases requiring different tools. They are all instances
of the same structural problem: goal-directed reasoning that needs to hold
together across boundaries that would otherwise break it.

---

## A note on scope

The README introduces RPL through a recipe-building prompt — a familiar,
goal-rich example that makes the language mechanics easy to follow.
Continuations in [tutorial/](tutorial/) add cook-mode anchors, kitchen context,
scheduling, and handoff. Core README flow stays deliberately small.

The examples above suggest a wider range. The formal machinery that makes a
single editing session work — named relations, goal-driven execution, async
collection, dependency-driven ordering, a queryable trace — is the same
machinery that supports trace handoff across later phases. The single-session
example is the baseline, not the ceiling.

---

## Language extensions

The base and LRPL specifications stay small on purpose. **Extensions** live in
separate normative documents so hosts can support richer features without every
implementation carrying the same surface area. For example, the
**meta-programming** extension introduces meta-variables (`#m-…`) and tools such
as `$language` and `$read` so agents can hold **virtual** RPL-shaped readings of
languages and programs as opaque capsules instead of grounding huge definitions in
every context. See [specification/meta-programming.md](specification/meta-programming.md).

---

## Document map

- [README.md](README.md) — entry point and worked example.
- [tutorial/](tutorial/) — README continuations (cook mode, kitchen context, scheduling, handoff).
- [motivation.md](motivation.md) — problem framing and language overview.
- [theory.md](theory.md) — Bloom, CALM, layers.
- [vision.md](vision.md) — central ideas, trace, lazy extension summary, design principles.
- [enterprise.md](enterprise.md) — enterprise boundaries and HCI fit.
- [specification/rpl.md](specification/rpl.md) — base normative specification.
- [specification/lrpl.md](specification/lrpl.md) — LRPL delta specification.
- [specification/meta-programming.md](specification/meta-programming.md) — MRPL extension (meta-vars, `$language`, `$read`, `$index` + language).
