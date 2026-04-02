# Relational Prompt Language (RPL)

RPL is a Markdown-embedded language for describing multi-step LLM-driven
protocols as composable, declarative relations. Instead of writing imperative
instructions that tell an agent *how* to do something step by step, you write
relations that declare *what* must be true, and the agent derives a path through
them.

This document motivates the language, introduces its key ideas, and shows how
RPL protocols slot into three common deployment shapes: a **single prompt**, a
**project system prompt**, and an **agent skill**. The companion
[spec.md](spec.md) provides the full formal specification and grammar.

---

## Why RPL?

Natural-language system prompts work well for simple tasks, but they hit limits
as protocols grow:

- **Ordering is fragile.** Rearranging paragraphs can silently change behaviour.
- **Composition is manual.** Combining two prompts means copy-pasting and
  hoping nothing conflicts.
- **Branching is verbose.** "If X then do A, otherwise if Y then do B, unless
  Z..." becomes unreadable quickly.
- **Traceability is absent.** There is no structural record of which steps ran,
  what values were collected, or why a branch was taken.
- **Reuse is copy-paste.** The same intake pattern gets rewritten in every
  prompt that needs it.

RPL addresses these by giving protocols a small, precise structure while keeping
everything inside ordinary Markdown. Prose remains prose — instructions, tone
guidance, presentation hints — but the skeleton of the protocol is machine-
readable, composable, and traceable.

---

## Core Ideas

### Three Namespaces

RPL partitions everything into three syntactically distinct namespaces:

```
rel(?a, ?b)      relation — a fact to establish or query
%goal(?a)        goal — something to solve for
$tool(?a, ?b)    tool — an external capability
```

**Relations** are the building blocks. They name facts: `name(?first, ?last)`,
`severity(?s)`, `triage(?patient, ?severity)`. A relation says *what* is true,
not *how* to make it true.

**Goals** drive execution. A goal like `%critical(?patient, ?tel)` asks the
agent to find bindings that satisfy it. Multiple goals compose with disjunction
(`|`) or mutual exclusion, letting the same protocol serve several outcomes.

**Tools** connect to external capabilities — user input (`$ask`, `$choose`),
database queries, API calls. They use the same structural rules as relations
and goals, so a tool result feeds into the rest of the protocol without special
plumbing.

### Variables and Binding

Logical variables (`?x`) unify within a single reasoning step. Async variables
(`$x`) mark values that arrive later — user answers, tool results, external
events. This distinction lets the agent know exactly where it needs to pause
and wait for input versus where it can derive forward.

### Markdown Is the Source Format

RPL lives inside Markdown. A heading that carries a signature is an RPL
definition; a heading without one is plain documentation:

```markdown
# Patient History - history(?patient-id, $symptoms)

Confirm the patient's __patient-id__ and record their __symptoms__.
```

The heading declares the relation and its arguments. The prose body is both
human-readable documentation and agent instruction. Fenced ` ```rpl ` blocks
add formal expressions. This means an RPL protocol is always a readable
document first, with machine structure layered in.

### Rules and Composition

Relations compose through implication:

```rpl
triage(?p, ?s) <= history(?p, ?symptoms), severity(?s)
```

This reads: "triage is established when history and severity are both known."
The agent derives a dependency graph from these rules and walks it, collecting
values as needed. No explicit ordering is required — the structure implies
the order.

### Goals as Entry Points

Goals are the top-level "what do you want?" of a protocol:

```rpl
% <= %critical(?p, _) | %warning(?p, _) | %low(?p)
```

The root goal (`%`) says: satisfy any of the three triage levels. Each named
goal has its own body that chains through the relations it needs. The agent
picks the first eligible goal and works toward it.

### Constraints and Traces

Constraints (`=>`) express invariants. While variables remain unbound, a
constraint is a live check. Once every variable is bound, it becomes a
**trace** — a grounded record of what happened:

```
severity(?s) ^^ {s "critical", p "patient-0"} => true
```

Traces are the protocol's memory. They are queryable as ordinary relations, so
later steps (or even later sessions) can reason over what was established
earlier.

---

## Usage Patterns

The examples below assume the agent already understands RPL — either because
the spec has been provided previously, or because RPL is part of the agent's
base capabilities. All three patterns use the same language; what differs is
*where* the protocol text lives and *how much* protocol you need.

### 1. Single Prompt

Drop RPL directly into a conversation when you need structured multi-step
reasoning for a one-off task. No project setup required.

**Example — quick intake form:**

````markdown
You understand RPL (Relational Prompt Language).

Run the following protocol:

# Intake - %intake <= name(?first, ?last), email($email), role($role)

Greet the user, then collect their details.

## Name - name(?first, ?last)

Ask for the user's full name. Parse into __first__ and __last__.

## Email - email($email)

Ask for a work email address.

## Role - role($role)

```rpl
valid-role("engineer")
valid-role("designer")
valid-role("manager")
```

Ask the user to choose a __role__ from the valid roles.
````

The agent reads the protocol, identifies `%intake` as the goal, and walks the
dependency graph: it needs `name`, `email`, and `role`, each of which involves
collecting a value from the user. The prose under each heading tells it *how*
to ask. When all three are satisfied, the goal resolves.

This is useful when you want to hand a structured interaction to an agent
mid-conversation without writing procedural instructions.

### 2. Project System Prompt

Place an RPL document in your project's system prompt (or rules/instructions
file) to define a protocol that applies across all conversations in that
project. This suits recurring workflows — code review checklists, onboarding
flows, bug triage, etc.

**Example — code review protocol as a project instruction:**

````markdown
You understand RPL (Relational Prompt Language).

When the user asks for a code review, run this protocol:

# Code Review - %review(?file, ?verdict) <= diff(?file, $changes), analysis(?file, ?issues), verdict(?file, ?issues, ?verdict)

## Diff - diff(?file, $changes)

Identify the __file__ under review and read its __changes__ (diff or content).

## Analysis - analysis(?file, ?issues)

```rpl
analysis(?file, ?issues) <= diff(?file, ?changes), check(?file, ?changes, ?issues)
```

### Correctness - check(?file, ?changes, $issues)

Review __changes__ for correctness bugs, logic errors, and edge cases.
Report __issues__ found.

### Style - check(?file, ?changes, $issues)

Review __changes__ against project conventions and flag __issues__.

## Verdict - verdict(?file, ?issues, $verdict)

```rpl
verdict(?file, ?issues, "approve") <= |?issues| = 0
verdict(?file, ?issues, "request-changes") <= |?issues| > 0
```

If no issues were found, approve. Otherwise, present the issues and
request changes.
````

Because this lives in the project system prompt, every conversation inherits
it. The agent activates the protocol when the context matches (a review
request) and follows the same structured steps each time. The relational
structure means you can add new `check` sub-relations (security, performance,
accessibility) without rewriting the existing ones — they compose
automatically through `analysis`.

### 3. Agent Skill

Package an RPL protocol as an agent skill — a self-contained document that a
skill-aware client loads on demand. The protocol becomes a reusable capability
that any project can invoke.

**Example — RFC review skill (sketch of a `SKILL.md`):**

````markdown
---
name: rfc-review
description: >
  Structured review of an RFC or design document: completeness, risks,
  alternatives, and a clear verdict. Use when someone asks for a
  design review or RFC feedback.
---

You understand RPL (Relational Prompt Language).

# RFC Review - %review <= document($doc), sections(?doc, ?sections), completeness(?doc, ?sections, ?gaps), risks(?doc, ?risks), verdict(?doc, ?gaps, ?risks, $verdict)

## Document - document($doc)

Ask the user to provide or reference the RFC __doc__ to review.

## Sections - sections(?doc, ?sections)

Parse the __doc__ and identify its __sections__: problem statement,
proposed solution, alternatives, rollback plan, success metrics.

## Completeness - completeness(?doc, ?sections, ?gaps)

```rpl
expected-section("problem-statement")
expected-section("proposed-solution")
expected-section("alternatives")
expected-section("rollback-plan")
expected-section("success-metrics")

completeness(?doc, ?sections, #{& ?gap}) <=
  expected-section(?gap), ?gap not in ?sections
```

Report any __gaps__ — expected sections that are missing or
substantively empty.

## Risks - risks(?doc, $risks)

Identify __risks__: unaddressed failure modes, scaling concerns,
dependencies on uncommitted work, irreversible decisions without
escape hatches.

## Verdict - verdict(?doc, ?gaps, ?risks, $verdict)

Synthesize gaps and risks into a __verdict__: approve, revise, or
reject. Explain the reasoning.
````

The skill is discovered by its `name` and `description`. When a user's request
matches, the client loads the full document and the agent runs the RPL
protocol. The same skill works in Cursor, Claude Code, or any client that
supports the skill format — the RPL protocol is portable because it is just
Markdown with structure.

---

## What RPL Does Not Do

RPL is a protocol language, not a programming language. A few boundaries worth
noting:

- **No control flow.** There are no loops, conditionals, or mutable variables
  in the imperative sense. Branching emerges from disjunction and goal
  eligibility; iteration from set semantics and abductives.
- **No computation.** RPL does not evaluate arithmetic or transform data. It
  expresses what must hold and lets the agent (and tools) do the work.
- **No enforcement.** RPL is a contract between author and agent. The agent
  interprets it in good faith; there is no sandbox or runtime that prevents
  deviation. Constraints and traces provide accountability, not enforcement.
- **Agent judgment fills gaps.** Where the spec does not prescribe behaviour,
  the agent uses its best judgment. This is by design — RPL specifies the
  structure, not every micro-decision.

---

## Further Reading

- [spec.md](spec.md) — Full formal specification: syntax, semantics, execution
  model, worked example, formal grammar.
