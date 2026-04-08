# RPL — Motivation

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

## Language overview (why RPL is shaped this way)

The following states what RPL is for and how authors should read it, before
syntax and grammar in the [base specification](specification/rpl.md). (The base
spec’s §1 overview is a short pointer into this document and related prose.)

RPL (Relational Prompt Language) is a Markdown-embedded reasoning framework with
associated logic for defining **LLM-driven conversational protocols** as
relations. The **primary** use case is inspectable prompt reasoning in
human-agent collaboration. **Living documents** are also in scope: Markdown
that grows, versioned or edited over time, with the same relational reading.

RPL is an **enabling** framework: it **permits** formal rules, constraints, and
tool boundaries where you want them; it does **not** **prescribe** a single
planner, workflow engine, or decomposition strategy. Features described in the
base specification are **available**, not mandatory—use only the fidelity you
need.

RPL is also not a substitute for enterprise runtime infrastructure. It is not a
long-running orchestration substrate for mission-critical control loops. It is
a way to move prompt behavior out of black-box prose and into inspectable
structure.

Each step in a protocol can be read as a named relation with arguments.
Relations compose via implication into a dependency graph. Goals mark what
may be solved for. Tools reach external capabilities. Bound values flow forward
from prior steps or session context; unbound values may arrive via async vars or
interactive collection. An eight-phase operating model suggests a **rhythm** for
implementations; where the language does not pin behaviour, the agent uses its
best judgment.

**How to read RPL** — Read the surface syntax **declaratively**. A fragment states
**what holds**, **what follows from what**, or **what must remain true**, as
relations and constraints over bindings — not a script of steps for an engine to
execute. Heads (`rel`, `%`, `$`), connectives (`,`, `|`, `<-`, `->`), variables and
patterns, literals and collections, metadata (`^`), tools, goals, and abductives
each have a **meaning** (a claim or constraint shape) fixed in the base
specification; **lvars** in particular are §3 there. **How** an implementation or agent
**searches**, **schedules**, or **materialises** witnesses is not defined there
except where explicitly noted as suggestive (e.g. the timestep rhythm in §18).

**Readable expressions** — Where the base spec allows equivalent surface forms (e.g.
string literals with single or double quotes, §2), authors should choose what
reads best; the intended review experience is **clarity first**.

**Iterative authoring** — RPL authoring is collaborative and iterative in
practice: bootstrap structure, observe behavior, ask the agent to explain how it
interpreted the protocol, then harden prose and constraints where drift appears.

**Prose-first authoring** — Natural-language bodies are **materialised** into
rules when text is first **encountered**: either once (e.g. the agent normalises
a document in a dedicated pass) or **incrementally** as portions are read. A
side effect is that **carefully written prose alone** can describe a coherent RPL
program with **no** explicit `rel(...)`, `%`, or `$` syntax in the source—the
heading titles, emphasis, and structure still yield definitions under that
reading. Relational surface syntax remains the **canonical** interchange when
precision matters.

---

## Where to go next

- [Scope](scope.md) — what RPL is for, what it is not, and use cases.
- [Theory](theory.md) — Bloom, CALM, monotonicity, formal vs agent layer.
- [Vision](vision.md) — central ideas, trace, lazy extension summary, design principles.
- [Enterprise](enterprise.md) — boundary guidance for enterprise contexts.
- [Base specification](specification/rpl.md) — normative syntax, semantics, runtime, grammar.
- [LRPL specification](specification/lrpl.md) — lazy extension delta.
