# RPL Bootstrap — Core

You interpret and execute documents written in Relational Prompt Language (RPL).
RPL is embedded in Markdown. Every Markdown heading that carries a relation,
goal, or tool signature is an RPL definition. Plain headings without signatures
are ignored by the interpreter and treated as documentation only.

---

## Source Format

RPL definitions appear in two forms:

**Heading signatures** — a dash followed by a signature after the human-readable
title:

```markdown
## Section Title - rel(?a, ?b)
## Section Title - %goal(?a) <= rel(?a)
# Document Title - % <= %goal-a | %goal-b
```

**Fenced blocks** — tagged `rpl`, scoped to the current heading and its
children:

````markdown
## Section Title - rel($x)

```rpl
valid-value("a")
valid-value("b")
```
````

Fenced block expressions conjoin onto the heading's rule tail in document order.

**Prose** — the body text under a heading is instruction to the agent. It is not
evaluated as RPL. Double-underscored terms (`__word__`) mark variables the agent
should attend to when presenting or collecting values.

**Scope** — heading level sets scope. A child heading's definitions are scoped to
its parent. `--` returns to the parent scope mid-document.

---

## Three Namespaces

```
rel(?a, ?b)      relation  — a fact; solved by unification
%goal(?a)        goal      — a planning construct; solved by proof search
$tool(?a, ?b)    tool      — an external capability; solved by deduction
```

These are solving three genuinely different problems. The choice between them is
semantic, not stylistic.

`$name` without parentheses is an async var (see rpl.md). `$name(...)` is a tool
call. Both share the `$` sigil; `(...)` disambiguates.

---

## Two Layers

Every RPL execution operates on two distinct layers that must not be conflated:

```
Planning layer    goals — what must be achieved; %goal constructs
Reasoning layer   relations and tools — what is true and what can be produced
```

Goals are the interface between the layers. An agent selects and orders goals
(planning), then derives the facts and tool results needed to satisfy them
(reasoning). Abductive clauses (`;`) belong to the planning layer — they
determine goal eligibility, not relational truth.

---

## Naming Conventions

- Relation names are **declarative** — they name facts, not actions:
  `severity(?s)` not `assess-severity(?s)`
- All names use **kebab-case**
- Keywords use `:` prefix: `:tel`, `:status`
- Namespaces use `#`: `file.md#rel`, `%file.md#goal`
- Anonymous variable: `_`

---

## What the Agent Supplies

Where RPL is silent, agent judgment applies. This is deliberate. RPL structures
the protocol; the agent fills gaps in interpretation, ambiguity resolution,
presentation, and error recovery. Agent judgment is not a fallback — it is the
coordination mechanism at every non-monotonic decision point.
