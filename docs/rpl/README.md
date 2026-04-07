# Relational Prompt Language (RPL)

RPL is a Markdown-embedded language for describing multi-step LLM protocols as
composable, declarative relations. Instead of imperative instructions that tell
an agent *how* to proceed step by step, you declare *what* must be true and the
agent derives a path.

## Document map

| Document | Role |
|----------|------|
| [motivation.md](motivation.md) | Problem framing and language overview (why RPL, how to read it) |
| [scope.md](scope.md) | Boundaries, `?` vs `$`, use cases, document index |
| [theory.md](theory.md) | Bloom, CALM, monotonicity, formal vs agent layer |
| [vision.md](vision.md) | Central ideas, trace, lazy extension summary, design principles |
| [specification/rpl.md](specification/rpl.md) | Normative base spec: syntax, semantics, runtime, grammar |
| [specification/lrpl.md](specification/lrpl.md) | Normative LRPL delta (lazy expressions, memos, stdlib) |

The sections below walk through one **worked example** (bug report intake) to show
how signatures and goals compose. They are not a substitute for the
specifications.

---

## A Plain Markdown Prompt

Here is a system prompt for bug report intake, written the way most people
write one today:

```markdown
# Bug Report

When a user reports a bug, walk them through these steps.

## Describe the Problem

Ask the user to describe what went wrong, including what they
expected and what actually happened.

## Identify the Component

Ask which part of the system is affected. Valid components are:
frontend, backend, database, and infrastructure.

## Assess Severity

Ask how severe the issue is. Valid levels: critical, high,
medium, and low.
```

This works. An agent reads it top to bottom, asks the questions, and wraps up.
But the structure is entirely implicit. The agent has to *infer* that the
sections are steps, that severity is a closed list, and that the protocol is
done when all three are collected. As the prompt grows — more steps, branching
outcomes, reuse across prompts — those inferences become fragile.

RPL makes the structure explicit, one piece at a time.

---

## Naming Facts

The first addition: give each heading a **relation signature**. A relation
names a fact that the section establishes.

```markdown
## Describe the Problem - description($text)

## Identify the Component - component($name)

## Assess Severity - severity($level)
```

The prose under each heading is unchanged. What changes is the dash and the
signature after the human-readable title.

`description($text)` says: "this section establishes a fact called
`description`, and its value is `$text`." The **`$`** sigil marks an **async
variable** — a value that comes from outside the protocol. The user types it,
a tool returns it, an event provides it. The agent knows it must pause and
collect this value before moving on.

> **`$`** means "goes out to get it." **`?`** means "already have it or can
> derive it."

We will see `?` variables shortly. For now, the point is that each section has
a name and declares what it produces.

---

## Stating the Goal

The agent knows what facts each section produces, but not what it is working
*toward*. Add a **goal** to the top-level heading:

```markdown
# Bug Report - % <- description($text), component($name), severity($level)

Summarize the report and confirm with the user before filing.
```

**`%`** marks a **goal** — the thing the agent is trying to satisfy. **`<-`**
reads as "is satisfied when." So this says: *the bug report goal is satisfied
when description, component, and severity are all established.*

Now the agent works backward from the goal. It sees that `%` needs three
facts, checks which are missing, and goes to establish them — reading the prose
under each relation's heading to learn how. The order of sections in the
document no longer matters; the dependency structure drives execution.

The prose on the goal heading ("Summarize the report…") tells the agent what
to do once the goal is satisfied. Prose is always instruction; the signature
is the structure.

---

## Declaring Valid Options

"Valid components are: frontend, backend, database, and infrastructure" is
buried in a sentence. If someone adds a fifth component, they have to find and
update prose. RPL lets you state these as formal facts in a fenced block:

````markdown
## Identify the Component - component($name)

Ask which part of the system is affected.

```rpl
valid-component("frontend")
valid-component("backend")
valid-component("database")
valid-component("infrastructure")
```
````

String literals in these blocks may use `"…"` or `'…'` interchangeably (same meaning); pick the form that keeps each line easiest to read.

A fenced block tagged **`rpl`** adds formal expressions to the current
heading's scope. Here, four `valid-component` facts declare the closed set of
options. The agent can present these as a structured choice rather than parsing
them from a sentence.

Same for severity:

````markdown
## Assess Severity - severity($level)

Ask how severe the issue is.

```rpl
valid-severity("critical")
valid-severity("high")
valid-severity("medium")
valid-severity("low")
```
````

The prose becomes cleaner — it provides the instruction ("ask how severe")
while the `rpl` block provides the data. Adding a new option is one line, not
a prose edit.

---

## Composing Facts

So far each relation stands alone. But a real protocol often needs to group
several facts into a composite — "the report" is the description, the
component, and the severity taken together. Make this explicit with a **rule**:

````markdown
## Report - report(?text, ?name, ?level) <- description(?text), component(?name), severity(?level)

Present the complete report: __text__, __name__, and __level__.
Confirm with the user before filing.
````

**`<-`** on a non-goal heading creates a **rule**: `report` is established
when `description`, `component`, and `severity` are all known. The shared
variable names wire them together — `?text` in `report` binds to whatever
value `description` collected as `$text`.

The **`__text__`** emphasis in the prose marks the same variable. It tells the
agent which values to weave into its response. The heading declares the data
flow; the prose describes the presentation.

Now the goal can reference the composite instead of listing every piece:

```markdown
# Bug Report - % <- report(?text, ?name, ?level)
```

The agent sees that `%` depends on `report`, and `report` depends on the three
intake relations. It walks the dependency graph — the protocol's skeleton —
and the prose under each heading is the skin.

---

## Branching on Outcome

Every bug report collects the same information. But what happens next should
depend on severity. Instead of writing "if critical then… else if high
then…" in prose, express this as **multiple goals** joined by disjunction:

```markdown
# Bug Report - % <- %urgent | %normal | %backlog
```

**`|`** means **or** — the root goal succeeds when any one of the named goals
succeeds. Each named goal defines its own conditions:

```markdown
# Urgent - %urgent <- report(_, _, "critical")

Page the on-call engineer immediately. Include the full report.

# Normal - %normal <- report(_, ?name, ?level), ?level != "critical", ?level != "low"

Create a ticket in the __name__ component's queue.

# Backlog - %backlog <- report(_, _, "low")

Add to the backlog. No immediate action required.
```

**`_`** is the **anonymous variable** — it matches any value and discards it.
`%urgent` only cares that the third argument is `"critical"`; it does not need
the description or component to decide whether it is eligible.

The agent collects the report (same intake relations, shared across all
branches), then picks the first eligible sub-goal based on the severity that
was collected. No duplication, no prose conditionals.

---

## The Complete Protocol

Here is the full document with every feature applied:

````markdown
# Bug Report - % <- %urgent | %normal | %backlog

## Describe the Problem - description($text)

Ask the user to describe what went wrong, including what they
expected and what actually happened.

## Identify the Component - component($name)

Ask which part of the system is affected.

```rpl
valid-component("frontend")
valid-component("backend")
valid-component("database")
valid-component("infrastructure")
```

## Assess Severity - severity($level)

Ask how severe the issue is.

```rpl
valid-severity("critical")
valid-severity("high")
valid-severity("medium")
valid-severity("low")
```

## Report - report(?text, ?name, ?level) <- description(?text), component(?name), severity(?level)

Present the complete report: __text__, __name__, and __level__.
Confirm with the user before filing.

# Urgent - %urgent <- report(_, _, "critical")

Page the on-call engineer immediately. Include the full report.

# Normal - %normal <- report(_, ?name, ?level), ?level != "critical", ?level != "low"

Create a ticket in the __name__ component's queue.

# Backlog - %backlog <- report(_, _, "low")

Add to the backlog. No immediate action required.
````

Roughly forty lines of Markdown — all of it readable as documentation — and
the agent has: named facts, a declared goal, typed inputs, closed option sets,
a composition rule, and severity-based branching.

---

## Where It Lives

The protocol above is ordinary Markdown. Where you put it determines when and
how it runs. All three patterns below use exactly the same RPL; what varies is
scope and triggering.

**In a single prompt** — paste the protocol into a conversation when you need
structured intake for a one-off task. Prefix with "You understand RPL" so the
agent knows to interpret the signatures. Useful for ad-hoc workflows
mid-conversation.

**In a project system prompt** — place it in your project's rules or
instructions file. Every conversation in that project inherits the protocol.
Useful for recurring workflows: code reviews, onboarding, bug triage. The
agent activates the protocol whenever the context matches.

**As an agent skill** — wrap the protocol in a skill manifest (YAML
frontmatter with `name` and `description`) and package it as a `SKILL.md`.
Skill-aware clients (Cursor, Claude Code) load it on demand when a user's
request matches the description. The protocol is portable because it is just
Markdown with structure.

---

## What RPL Does Not Do

RPL is a protocol language, not a programming language:

- **No imperative control flow.** No loops, conditionals, or mutable state.
  Branching comes from goal disjunction; iteration from set semantics.
- **No computation.** RPL declares what must hold. The agent and its tools do
  the work.
- **No enforcement.** RPL is a contract between author and agent, interpreted
  in good faith. Constraints and traces provide accountability, not a sandbox.
- **Agent judgment fills gaps.** Where the spec is silent, the agent decides.
  This is deliberate — RPL structures the protocol, not every micro-decision.

---

## Further reading

- [specification/rpl.md](specification/rpl.md) — Base specification: syntax, semantics, execution model, grammar.
- [specification/lrpl.md](specification/lrpl.md) — LRPL delta: lazy evaluation, memos, satisfactory quiescence, stdlib.
- [scope.md](scope.md) — Scope, boundaries, and document map.
