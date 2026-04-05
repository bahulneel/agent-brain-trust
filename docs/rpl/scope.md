# RPL and LRPL — Scope and Vision

## The Problem

Complex reasoning tasks break. Not because the logic is wrong, but because the
context that holds the logic together runs out.

A large language model operates within a bounded context window. Within that
window, it can reason, derive, compose, and conclude with considerable
sophistication. But real tasks — a phased design review, a multi-stage approval
process, a collaborative workshop, a long-running system reconciliation — exceed
what any single context can hold. When the boundary is crossed, continuity
breaks. State is lost. The agent cannot verify what was established, by whom, or
why. The next step has no reliable ground to stand on.

This is not a model capability problem. It is a structural problem. The reasoning
itself has no declared shape — no explicit record of what has been established,
what depends on what, and what remains. Without that structure, every context
boundary is a discontinuity, and every handoff is a leap of faith.

---

## The Central Idea

RPL is the glue that makes stratified relational reasoning possible.

By *stratified* we mean reasoning that proceeds in layers, where each layer's
conclusions become the ground facts for the next. A single conversation turn is
one stratum. A phase in a workshop is another. A handoff between agents, or
between sessions, or between human and automated participants, is a stratum
boundary. The task as a whole is the full stack.

By *relational* we mean that the content of each stratum — the facts established,
the goals pursued, the dependencies between them — is expressed as named
relations with declared argument structure. Not prose that implies structure, but
structure that is explicit, composable, and queryable.

By *glue* we mean that RPL does not replace the reasoning. It declares the shape
of the reasoning so that any participant, at any point, with access to the trace,
can determine what has been established, what depends on what, and what
remains to be done. The context boundary becomes a practical concern, not a
structural one.

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

## Theoretical Foundations

RPL's operating model follows **Bloom** — Peter Alvaro's language for distributed
programming under the CALM theorem. The central insight of CALM is that monotonic
logic is coordination-free: any agent with the same facts reaches the same
conclusions, regardless of order or timing. Non-monotonic operations — retractions,
forced choices, conflict resolutions — are the points where coordination is
required.

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

## What RPL Is Not

RPL is not a programming language. It has no loops, no mutable state, no
imperative control flow.

RPL is not an agent framework. It does not specify how an agent reasons, plans,
or recovers from failure. Where the language is silent, agent judgment applies.

RPL is not a workflow engine. It does not schedule tasks, manage queues, or
orchestrate services.

RPL is not a prompt template. Its relation to prose is the opposite of a template:
prose provides human-readable instruction, RPL provides the formal structure
that makes that instruction composable and verifiable.

---

## What RPL Is For

RPL is for any goal-directed process that:

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

These are not different use cases requiring different tools. They are all instances
of the same structural problem: goal-directed reasoning that needs to hold
together across boundaries that would otherwise break it.

---

## The Trace

The trace is not a log. It is a first-class relational structure.

Every fact established during execution, every goal satisfied, every tool result
received — all of these become ground facts in the trace, queryable as ordinary
relations. A future stratum can reason over the trace of a prior stratum without
any separate persistence machinery. Prior conclusions are just relations with
provenance.

This is what makes stratification coherent. Each stratum does not start from
scratch; it starts from the trace of everything that came before. The trace is the
continuity mechanism.

---

## LRPL — The Lazy Extension

RPL, as specified, derives facts eagerly within each timestep — working toward
quiescence, then activating goals, then dispatching async operations. This is
correct and sufficient for many tasks.

But stratified reasoning over large or external fact sets introduces a different
requirement: the ability to reason *about* a set of facts without enumerating them,
to accumulate constraints against a binding before committing to it, and to defer
evaluation until progress genuinely requires it.

LRPL extends RPL with lazy evaluation. A lazy expression `<expr>` participates in
constraint propagation — constraints accumulate against its free variables from
outside — but its interior is not entered until forward progress stalls without it.
When evaluation is finally triggered, the accumulated constraints act as a lens,
minimising what must be scanned, read, or generated.

This enables:

**Transparent external references** — a file, a remote resource, or a large
relation is referenced by name and reasoned about through constraints before any
content is loaded. The read happens at the last possible moment, filtered to the
minimum necessary.

**Constraint memos** — before an lvar is bound, the agent records the worlds it
is tracking as constraints in disjunctive normal form. Binding is deferred while
the constraint space remains large or uncertain. Conflicts surface early, before
any concrete value is committed to.

**Satisfactory quiescence** — rather than deriving to full fixpoint on every
timestep, the runtime identifies the minimal set of bindings that must be
resolved for the current goal to proceed. Work is scoped to what is necessary,
not what is possible.

**Structural unwinding of external data** — indexed external sources (files,
tables, nested documents) are traversed lazily, with each level of structure
peeled by a separate relation. Only the bindings that downstream goals require
are ever materialised.

LRPL does not change the semantics of RPL. Every valid RPL programme is valid
under LRPL. The extension adds the machinery for lazy evaluation without
disturbing the relational and goal layer beneath it.

---

## How to Read These Documents

**README.md** — start here. A progressive introduction to the language through a
single worked example. Teaches the syntax and the core concepts without
assuming any background in logic programming or relational databases.

**spec.md** — the full formal specification of RPL. Syntax, semantics, execution
model, and grammar. The reference document for anyone implementing or
extending the language.

**lrpl-spec.md** — the formal specification of LRPL. Extends the base spec with
lazy evaluation, constraint memos, satisfactory quiescence, the standard library
tools `$index`, `$generate`, and `$write`, and the tool algebra. Requires
familiarity with the base spec.

---

## A Note on Scope

The README introduces RPL through a bug report intake — a familiar, bounded
example that makes the language mechanics easy to follow. It is deliberately
simple.

The examples in this document suggest a wider range. The formal machinery that
makes a bug report work — named relations, goal-driven execution, async
collection, dependency-driven ordering, a queryable trace — is the same
machinery that makes a multi-phase workshop, a cross-session pipeline, or a
distributed approval process work. The bug report is one instance. It is not the
intended ceiling.
