# RPL Bootstrap — Relational Layer

Assumes core.md. Covers relations, rules, goals, tools, async vars, and the
trace. This is the complete RPL execution model.

---

## Variables

```
?x    inferred  — bound by existing facts; a pattern that matches
$x    deduced   — produced by evaluation; the relation body provides the value
_     anonymous — matches any value, binds nothing
```

`r(?x, ?y)` matches two known values. `r(?x, $y)` takes a known `?x` and
deduces `?y` — the body of `r` is the deduction procedure that produces the
binding. `$` marks output positions.

---

## Relations and Rules

Relations are Datalog-style. A **fact** asserts a ground relation. A **rule**
derives a relation from others via `<=`:

```rpl
severity("critical")                              -- ground fact
report(?t, ?n, ?l) <= description(?t),            -- rule: derived relation
                      component(?n),
                      severity(?l)
```

Conjunction is `,`. Disjunction is `|`. Standard Datalog fixpoint semantics
apply: derive to quiescence within each timestep.

**Rules are not ordered.** The dependency graph drives evaluation, not document
order. A relation is established when all its dependencies are satisfied,
regardless of where it appears in the document.

---

## Goals

Goals are **planning constructs** — they declare what must be achieved. They do
not assert facts; they drive the selection and ordering of work.

```rpl
% <= tail                  -- root goal; evaluated first when present
%name <= tail              -- named goal
%name(?a, ?b) <= tail      -- named goal with capture args
% <= %a | %b | %c          -- disjunction; first satisfiable branch wins
```

The root `%` is the agent's primary objective. If absent, the agent selects
among named goals by context and ease of satisfaction.

**Goal satisfaction** — a goal is satisfied when its tail is derivable. On
satisfaction the agent offers to continue; the user decides termination.

**Goal truth** — recorded in the trace:

```rpl
%goal ^ true     -- satisfied
%goal ^ false    -- not satisfied
!%goal           -- sugar for %goal ^ false
```

---

## Abductive Clauses

`;` introduces an **activation clause** — evaluated before the goal body. If it
holds, bindings flow into the body. If not, the rule is **ineligible** — not
blocked, not failed, simply not a candidate for this selection.

```rpl
%task(?x) <= body(?x) ; @when(precondition(?x))
%task(?x) <= body(?x) ; @each(?x)
%task(?x) <= body(?x) ; @for(?x, eligible(?x), next(?x))
```

Abductives belong to the **planning layer**. They determine which goals are
candidates; they do not affect relational truth.

---

## Async Variables and Tools

`$x` is a **temporal connective** following Bloom's asynchronous channel model:
a fact that arrives at a future timestep, non-deterministically, ground when it
arrives.

```
created     avar appears unbound
dispatched  agent fires the async operation
pending     awaiting external resolution
resolved    value arrives, asserted as ground fact
consumed    participates in quiescence and planning
```

Within a timestep, `?x` unifies deductively. `$x` marks where derivation
requires external input — from the user, a tool, or an event.

**Tools** are external deduction procedures:

```rpl
$tool(?args) ^ ~ {:result ?r}             -- result bound to ?r
$tool(?args) ^ ~ {:status ?s, :body ?b}   -- destructure result
```

Tool results arrive as grounded constraints in the trace at a future timestep.
The tool is implementation detail; wrap in a relation for a clean interface:

```rpl
ask(?prompt, ?answer) <= $ask(?prompt) ^ ~ {:result ?answer}
```

**Built-in tools:**

```rpl
$ask(?prompt) ^ ~ {:result ?answer}              -- open-ended user input
$choose(?desc, ?options) ^ ~ {:result ?choice}   -- closed choice
```

---

## Metadata

`^` accesses the metadata of the immediately preceding form:

```rpl
clause ^ ?meta               -- bind entire metadata map
clause ^ ~ {:key ?val}       -- match and destructure
clause ^^ ~ {a ?b}           -- shorthand for :bindings key
```

Provenance metadata is minted by the agent:

```rpl
:file, :heading, :relation, :user, :doc
```

---

## Constraints and the Trace

`=>` expresses an invariant:

```rpl
triage(?p, ?s), severity(?s) => valid-severity(?s)   -- must hold
rel1(?x), rel2(?x) => false                           -- exclusion
```

**Ungrounded constraints** are live checks evaluated at each quiescence until
fully grounded. **Fully grounded constraints** become **traces** — ground facts
that hold from the point of introduction onward.

The trace is a **first-class relational structure**, queryable as ordinary
relations. It is not a log. Every established fact, satisfied goal, and tool
result is recorded with provenance. A future stratum reasons over prior traces
without separate persistence machinery.

Retract a trace with `=> false`; retraction is recorded.

---

## Timestep Model

Eight phases per timestep:

```
1. Assert new avars (resolved async values enter as ground facts)
2. Assert input novelty (new facts and schema changes)
3. Quiesce relations (derive to fixpoint; check ungrounded constraints)
4. Activate goals (evaluate ; clauses; root % first)
5. Update plans
6. Progress plan (new facts become novelty)
7. Quiesce relations (again; constraints may become traces)
8. Dispatch asyncs (unresolved avars)
```

**Failure modes:**

```
No rule eligible          agent surfaces error; asks user
Circular dependency       agent warns; user may override
Constraint violated       agent surfaces; user decides
User declines arg         unbound; agent checks continuability
```
