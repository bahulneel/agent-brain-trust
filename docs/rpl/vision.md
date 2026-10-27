# RPL and LRPL — Vision

Aspirations, central ideas, and design principles. Normative rules and grammar are
in [specification/rpl.md](specification/rpl.md) and
[specification/lrpl.md](specification/lrpl.md).

---

## The Central Idea

RPL is the reasoning framework that makes stratified relational reasoning
possible in collaborative LLM conversations.

By *stratified* we mean reasoning that proceeds in layers, where each layer's
conclusions become the ground facts for the next. A single conversation turn is
one stratum. A follow-up pass in a later session is another. A trace handoff
through a document or issue comment is a stratum boundary. The task as a whole
is the full conversational stack.

By *relational* we mean that the content of each stratum — the facts established,
the goals pursued, the dependencies between them — is expressed as named
relations with declared argument structure. Not prose that implies structure, but
structure that is explicit, composable, and queryable.

By *framework* we mean that RPL does not replace reasoning judgment. It
declares the shape of reasoning so that any participant, at any point, with
access to the trace, can determine what has been established, what depends on
what, and what remains to be done. The context boundary becomes a practical
concern, not a structural one.

---

## The Trace

The trace is not just a log. It is a first-class relational structure and
reasoning checkpoint surface.

Every fact established during execution, every goal satisfied, every tool result
received — all of these become ground facts in the trace, queryable as ordinary
relations. A future stratum can reason over the trace of a prior stratum without
any separate persistence machinery. Prior conclusions are just relations with
provenance.

This is what makes stratification coherent. Each stratum does not start from
scratch; it starts from the trace of everything that came before. The trace is
the continuity mechanism and the basis for explainable state queries ("what do
you currently believe and why?").

---

## LRPL — The Lazy Extension

RPL, as specified, derives facts eagerly within each timestep — working toward
quiescence, then activating goals, then dispatching async operations. This is
correct and sufficient for many conversational reasoning tasks.

But stratified reasoning over external fact sets introduces a different
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
under LRPL. The extension adds machinery for lazy evaluation without disturbing
the relational and goal layer beneath it.

---

## Design principles

This list reproduces what was formerly §20 of the base specification; it is
authored here so normative [specification/rpl.md](specification/rpl.md) stays
syntax- and runtime-focused. Section numbers in the bullets refer to that spec.

- **Enabling, not limiting** — the spec states what RPL **may** express and what
  implementations **might** enforce at boundaries (e.g. collection literals vs
  relation calls); it does not dictate a single workflow, planner, or authoring
  style.
- **Readability-first surface** — when equivalent spellings exist (e.g. string
  delimiters, §2 in the base spec), prefer the form that makes each expression
  easiest for humans to read and review.
- **Primary vs secondary use** — **prompts and LLM protocols** are the main
  target; **living Markdown** and long-lived documents are also supported.
- **Prose canonical at Author’s option** — relational syntax is the precision
  interchange; **prose-first** documents can still denote valid programs when
  materialised unambiguously (§17).
- **Technical vs prescriptive** — rules such as “gather relation into collection
  via head” are **constraints on that pattern** (§8), not commandments about
  every head.
- **HTN-shaped, not HTN-bound** — nested methods and `@when` are **permitted**
  idioms (§16.6), not **the** execution model.
- **Declarative naming** — relations name facts, not actions.
- **Three namespaces** — relations, goals, tools are syntactically distinct but
  uniform under the rule grammar (§10).
- **Uniform interpretation** — the same form means the same thing in the same
  context.
- **`VAR` subsumes matching** — `?lvar`, `$avar`, and `~ PATTERN` are **VAR**
  forms; **`=` is equality**; **in-place matching** is via **`~ PATTERN`** (§6).
- **`^` is single metadata access** — bind the whole map or match in place (§11).
- **Async as temporal connective** — `$x` bridges timesteps (§13, §18).
- **Activation not blocking** — `;` activates or disqualifies; no busy-wait (§16).
- **Undirected composition** — definitions do not encode callers.
- **Safety by default** — head variables in body; provenance metadata for gaps.
- **First valid resolution** — syntactic order among eligible rules.
- **User-driven termination** — agent offers continue; user stops (§15.6).
- **Constraints ground to traces** — live check vs trace; order; retraction
  (§12).
- **Agent judgment is default** — rigour where specified; judgment elsewhere.
- **Conversational co-authorship** — user may extend schema and facts live.
- **Timestep discipline** — eight phases (§18).

---

## Related documents

- [Motivation](motivation.md)
- [Theory](theory.md)
- [Scope](scope.md)
- [Enterprise](enterprise.md)
- [Base specification](specification/rpl.md)
- [LRPL specification](specification/lrpl.md)
