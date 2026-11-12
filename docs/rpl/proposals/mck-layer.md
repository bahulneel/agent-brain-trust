# Proposal: a metacognitive kernel layer

**Status.** Proposal only. This document is not a language layer, is not part
of any instantiation, and is not in force. It must not be loaded as if it
lived under [`bootstrap/`](../bootstrap/). It does not change an existing
layer or the specification.

**Proposed layer name.** `mck` ("metacognitive kernel"), written McK in
prose. Bahul agreed the McK prose form on 11 Nov 2026; the code name `mck`
stays lowercase like `fol`, `rpl` and `agent`. Law ids stay `mck.1` and so on.

**Provides.** *(candidate)* Laws and surfaces for the five metacognitive
habits named in [agent-mck.md](../agent-mck.md), so those habits no longer
rest only on a test-role preamble.

**Depends on.** [`agent`](../bootstrap/agent.md) (and so [`rpl`](../bootstrap/rpl.md),
[`fol`](../bootstrap/fol.md)).

**Not provided.** New `fol` or `rpl` connectives. A rewrite of
[`agent.1`](../bootstrap/agent.md)–[`agent.3`](../bootstrap/agent.md). A host
or start procedure for the bot. A domain ontology (what counts as
mayonnaise, what counts as shellfish).

---

## Why this is proposed

[language-bootstrap.md](../language-bootstrap.md) says the language bootstrap
is not a metacognitive kernel. [agent-mck.md](../agent-mck.md) names five
habits and gives them no laws, no surface, and no start procedure. The
[`agent`](../bootstrap/agent.md) layer is only the judgment remainder,
coordination points, and a warning not to axiomatise interpretation. The
RPL test bot therefore had to invent a preamble that makes the habits
visible ([bots/rpl-bot.md](../bots/rpl-bot.md), gaps 1–3).

The first live run of that bot passed all six probes, and every pass still
rested on the preamble ([bots/rpl-bot-live-run-1.md](../bots/rpl-bot-live-run-1.md)).
The cross-probe gaps were: no rule linking a restriction fact to the
invariants that use it; no rule for how far a constraint reaches; no
protocol for presenting a coordination point, or for who may retract and
when; and no surface for any of the habits.

A second live run of edge cases
([bots/rpl-bot-live-run-2.md](../bots/rpl-bot-live-run-2.md)) raised four
further gaps: how far a correction retracts; whether a later preference
outranks a constraint still in force; whether "forget" erases or records
(the default proposed here is to record and keep the history); and a
third verdict, `"unchecked"`, for an invariant check that has no ground
([`fol.5`](../bootstrap/fol.md)). Those are mck.15–mck.18.

This proposal is a candidate layer that would close those gaps. Names are
for Bahul to decide. Acceptance, and any later move into `bootstrap/`, are
separate steps.

## How to read this document

Each candidate law uses the bootstrap shape: **Law**, **FOL reading** (or
*comment*), **Surface**, **Grounding**, **Example**, **Not**. There is no
**Spec** field, because nothing here is in the specification.
**Grounding** cites the document or probe gap the law answers.

Claims marked **inferred** are not stated in those documents. Every
proposed relation or operator name is marked **PROPOSED NAME, for Bahul
to decide**. Relation labels stay kebab-case and declarative
([`rpl.1`](../bootstrap/rpl.md)). Connectives in examples are the colon-style
forms already in `rpl` (`:-`, `-:`). Variables are `?lvars`. No new
paired operator is proposed.

**Relational shape.** Each core concept is a reified entity with its own
id, described by keyed binary or n-ary relations, in the style of a
normalised SQL schema: the first argument of an entity relation is its
key, every row is a fact, and session- or turn-scoped facts carry the
session or turn as an argument. There are no unary state flags and no
imperative names. Ids in examples are plain strings (`"s1"`, `"t1"`,
`"f1"`). Parties (`"user"`, `"agent"`, or a host-named party) are plain
strings and are not reified here.

## Proposed names

All of the following are **PROPOSED NAME, for Bahul to decide**. Keys are
listed first; a compound key is written `(a, b)`.

| Name | Key | Role |
| --- | --- | --- |
| `mck` | — | Layer name in code (McK in prose). |
| `session(?session, ?host)` | `?session` | A session and the host running it. |
| `session-authority(?session, ?party)` | `?session` | Who may accept a retraction in that session. |
| `session-posture(?session, ?posture)` | `?session` | `"test"` or `"production"` visibility for that session. |
| `turn(?turn, ?session, ?position, ?speaker)` | `?turn` | A turn: its session, its position in order, and who spoke. |
| `intent(?intent, ?turn, ?kind, ?content)` | `?intent` | An intent found in the utterance of a turn. |
| `context-frame(?frame, ?session, ?objective)` | `?frame` | A frame on a session's context stack. |
| `frame-parent(?frame, ?parent)` | `?frame` | The frame a tangent interrupts. |
| `active-frame(?session, ?frame)` | `?session` | The frame currently in force in a session. |
| `initiative(?initiative, ?session, ?purpose)` | `?initiative` | A unit of initiative: who drives the next step, and to what end. |
| `initiative-holder(?initiative, ?party)` | `?initiative` | Who holds the initiative now. |
| `initiative-ceded(?initiative, ?turn, ?party, ?reason)` | `(?initiative, ?turn)` | The initiative was ceded at a turn, to a party, for a reason. |
| `invariant(?invariant, ?session, ?rule)` | `?invariant` | Names a session invariant; `?rule` is its `LEFT -: RIGHT` form. |
| `restriction(?restriction, ?session, ?statement)` | `?restriction` | A recorded restriction, as stated. |
| `restriction-enforced-by(?restriction, ?invariant)` | `(?restriction, ?invariant)` | Link from a restriction to an invariant that enforces it. |
| `restriction-covers(?restriction, ?item)` | `(?restriction, ?item)` | Judged scope of a restriction. |
| `invariant-check(?check, ?turn, ?invariant, ?verdict)` | `?check` | The pre-output check of one invariant in one turn, and its verdict. |
| `invariant-check-grounding(?check, ?grounding)` | `?check` | The bindings the check was grounded on; absent when there were none. |
| `coordination-point(?point, ?turn, ?kind, ?conflict)` | `?point` | A non-monotonic step presented in a turn. |
| `repair-option(?option, ?point, ?proposal)` | `?option` | One option at a coordination point. |
| `repair-acceptance(?option, ?turn, ?party)` | `?option` | The session authority accepted that option in a turn. |
| `memory-item(?item, ?description, ?stratum)` | `?item` | A remembered item and its stratum. |
| `memory-item-record(?item, ?record)` | `(?item, ?record)` | A trace, handoff, or persisted record that grounds the item. |
| `confidence-report(?report, ?turn, ?claim, ?level, ?basis)` | `?report` | A confidence report uttered in a turn. |
| `graph-store(?store, ?host, ?durability)` | `?store` | A store the host provides for session graphs: `"persistent"` or `"session-only"`. |
| `session-graph-store(?session, ?store)` | `?session` | The store a session's graph lives in. |

## Entities

Each entity with the relations that describe it, key first. All names are
**PROPOSED NAME, for Bahul to decide**.

- **Session** (`?session`): `session(?session, ?host)`;
  `session-authority(?session, ?party)`; `session-posture(?session, ?posture)`;
  `active-frame(?session, ?frame)`.
- **Turn** (`?turn`): `turn(?turn, ?session, ?position, ?speaker)`.
- **Initiative** (`?initiative`): `initiative(?initiative, ?session, ?purpose)`;
  `initiative-holder(?initiative, ?party)`;
  `initiative-ceded(?initiative, ?turn, ?party, ?reason)`.
- **Frame** (`?frame`): `context-frame(?frame, ?session, ?objective)`;
  `frame-parent(?frame, ?parent)`; referenced by `active-frame`.
- **Intent** (`?intent`): `intent(?intent, ?turn, ?kind, ?content)`.
- **Invariant** (`?invariant`): `invariant(?invariant, ?session, ?rule)`.
- **Restriction** (`?restriction`): `restriction(?restriction, ?session, ?statement)`;
  `restriction-enforced-by(?restriction, ?invariant)`;
  `restriction-covers(?restriction, ?item)`.
- **Invariant check** (`?check`): `invariant-check(?check, ?turn, ?invariant, ?verdict)`;
  `invariant-check-grounding(?check, ?grounding)`.
- **Coordination point** (`?point`): `coordination-point(?point, ?turn, ?kind, ?conflict)`.
- **Repair option** (`?option`): `repair-option(?option, ?point, ?proposal)`;
  `repair-acceptance(?option, ?turn, ?party)`.
- **Session authority**: `session-authority(?session, ?party)`, one row per
  session.
- **Memory item** (`?item`): `memory-item(?item, ?description, ?stratum)`;
  `memory-item-record(?item, ?record)`.
- **Confidence report** (`?report`):
  `confidence-report(?report, ?turn, ?claim, ?level, ?basis)`.
- **Posture**: `session-posture(?session, ?posture)`, one row per session.
- **Graph store** (`?store`): `graph-store(?store, ?host, ?durability)`;
  referenced by `session-graph-store(?session, ?store)`, one row per
  session (mck.19).

A change of state (a pop, a cession, a new holder) is recorded as a
retraction of the old row (`… -: false`) and a new row, so the history is
kept under mck.17.

Proposed vocabularies, also **for Bahul to decide**:

- Intent kinds, from [agent-mck.md](../agent-mck.md): `"command"`,
  `"query"`, `"constraint"`, `"instruction"`, `"analogy"`, `"suggestion"`.
- Posture: `"test"`, `"production"`.
- Coordination kinds, from [`agent.2`](../bootstrap/agent.md):
  `"retraction"`, `"forced-choice"`, `"constraint-conflict"`,
  `"non-monotonic-schema-change"`.
- Initiative cession reasons: `"user-choice"`, `"coordination"`, `"missing-ground"`,
  `"uncertain-scope"`.
- Memory strata: `"short-term"`, `"long-term"`.
- Store durability: `"persistent"`, `"session-only"`.
- Confidence levels: `"high"`, `"medium"`, `"low"`, `"none"`. Basis:
  `"ground"`, `"judgment"`.
- Speakers and parties: `"user"`, `"agent"`, or a party a host names.
- Invariant-check verdicts, also **PROPOSED NAME, for Bahul to decide**:
  `"holds"`, `"fails"`, `"unchecked"`.

---

### mck.1 — Intent kinds

**Law.** An utterance may carry several distinct intents at once. Each
intent has one kind from the vocabulary in [agent-mck.md](../agent-mck.md):
command, query, constraint, instruction, analogy, or suggestion.

**FOL reading.** *Comment.* A classification of input, not a connective.

**Surface.** `intent(?intent, ?turn, ?kind, ?content)` — **PROPOSED
NAME, for Bahul to decide**. `?turn` is the turn whose utterance carries
the intent (`turn`, see Entities).

**Grounding.** [agent-mck.md](../agent-mck.md), "Contextual Intent
Tracking"; [bots/rpl-bot.md](../bots/rpl-bot.md) gap 2; live probe 1.

**Example.**

```rpl
turn("t1", "s1", 1, "user")
intent("i1", "t1", "command", "make a sandwich")
intent("i2", "t1", "constraint", "no mayonnaise")
intent("i3", "t1", "analogy", "like a chef")
intent("i4", "t1", "instruction", "say briefly what you will make")
```

**Not.** Collapsing two kinds into one. A constraint is not a suggestion.
An analogy is not an instruction.

---

### mck.2 — Criteria for classifying intents

**Law.** **Inferred.** Classify an intent by the role it plays in the
request:

- *command* — a request that the agent do or produce something; often
  the primary objective.
- *query* — a request for information, a recommendation, or a yes/no.
- *constraint* — a hard bound on what is allowed; it is not traded away
  for preference.
- *instruction* — a direction about manner, order, or the form of the
  reply.
- *analogy* — a comparison or style cue; it changes how work is done,
  not what is allowed.
- *suggestion* — a preference or inclination; it may be declined when it
  conflicts with a constraint or an invariant.

When two readings are open and the difference is material, treat the
ambiguity as a coordination point (mck.10), not as a silent pick.

**FOL reading.** *Comment.* Kernel classification, under `agent`. Not a
theorem of `fol` or `rpl`.

**Surface.** The kinds used in `intent` (mck.1).

**Grounding.** Live probe 1, gap (a): the essay lists kinds but gives no
criteria. [bots/rpl-bot.md](../bots/rpl-bot.md) gap 2.

**Example.** "I fancy a shrimp pasta tonight" is a suggestion.
"What should I cook?" is a query. "No mayo" is a constraint.
"Like a chef" is an analogy. "Say briefly what you will make" is an
instruction. "Make me a sandwich" is a command.

**Not.** A domain ontology, and not a licence to axiomatise
interpretation ([`agent.3`](../bootstrap/agent.md)).

---

### mck.3 — A constraint outranks style and preference

**Law.** A constraint, and an invariant already in force, outrank a
suggestion and an analogy. An analogy must not be read as an instruction
that overrides a constraint.

**FOL reading.** *Comment.* Precedence among intent kinds, not a new
implication form. The hard bound itself is an `rpl.4` invariant.

**Surface.** None beyond `intent` and `LEFT -: RIGHT`.

**Grounding.** [agent-mck.md](../agent-mck.md), "Contextual Intent
Tracking" (do not read a constraint as a suggestion, or an analogy as an
instruction); live probe 1 (the chef analogy must not license an
aioli).

**Example.**

```rpl
intent("i1", "t1", "command", "make a sandwich")
intent("i2", "t1", "constraint", "no mayonnaise")
intent("i3", "t1", "analogy", "like a chef")
recommended-sandwich(?s), contains-ingredient(?s, "mayonnaise") -: false
```

The analogy may shape bread, layering, and seasoning. It may not
introduce mayonnaise, including under another name (mck.9).

**Not.** A rewriting of `-:`. The precedence is about how intents are
treated, not about the invariant connective.

---

### mck.4 — The context stack

**Law.** Session work is a stack of frames, not a linear history. The
primary objective is the base frame. A tangent is pushed as a new
active frame whose parent is the frame it interrupts. When the tangent
is resolved, the stack pops and the parent frame becomes active again.

**FOL reading.** *Comment.* Session structure, not a FOL connective.

**Surface.** All three are **PROPOSED NAME, for Bahul to decide**:

- `context-frame(?frame, ?session, ?objective)`
- `frame-parent(?frame, ?parent)`
- `active-frame(?session, ?frame)` — one row per session.

A push asserts a new frame, a parent link, and a new `active-frame` row
for the session. A pop moves the session's `active-frame` row to the
parent (the old row is retracted with `… -: false`). There is no push or pop
operator; relations stay declarative ([`rpl.1`](../bootstrap/rpl.md)).

**Grounding.** [agent-mck.md](../agent-mck.md), "Context Stacking"; live
probe 4 (no surface for the stack); [bots/rpl-bot.md](../bots/rpl-bot.md)
gap 2.

**Example.** Primary objective: a vegetarian dinner shopping list.
Tangent: one guest cannot have dairy.

```rpl
context-frame("f1", "s1", "plan a vegetarian dinner for two")
context-frame("f2", "s1", "no dairy for one guest")
frame-parent("f2", "f1")
active-frame("s1", "f2")
```

After the list is adjusted, `active-frame("s1", "f1")` holds and `"f2"`
is no longer active.

**Not.** A linear chat log treated as the stack. History may still be
recorded; priority is the stack.

---

### mck.5 — A constraint survives a pop

**Law.** **Inferred.** A constraint or invariant recorded while a frame
is active remains in force after that frame is popped, unless it is
retracted under mck.11. Frame-local scratch — an open question, or a
plan item already superseded — does not automatically remain as the
plan of the parent.

**FOL reading.** *Comment.* Persistence of recorded obligations across
frames. Retraction is non-monotonic and stays under `agent`.

**Surface.** None beyond the frame relations (mck.4) and `-:`.

**Grounding.** Live probe 4: no law says whether a constraint added on a
tangent stays in force after the pop. The live bot kept the no-dairy
constraint because dropping a constraint silently is worse.
[`agent.2`](../bootstrap/agent.md) makes retraction a coordination
point. [`rpl-runtime.1`](../bootstrap/rpl-runtime.md) names an "update
plans" phase but does not say which plan items a new constraint
invalidates.

**Example.** After the pop in the mck.4 example, the dairy constraint
still applies to the shopping list and to recipes that come later. The
cream is replaced; the rest of the list stands.

**Not.** A silent drop of a constraint at pop, and not a rule that every
scratch fact in the tangent frame is kept.

---

### mck.6 — Check invariants before output

**Law.** Before emitting an output, every applicable session invariant
is checked against that output and the session facts. An output that
would violate an invariant is not emitted as if it held. The check
records a verdict under mck.18: `"holds"`, `"fails"`, or `"unchecked"`.

**FOL reading.** The obligation is [`rpl.4`](../bootstrap/rpl.md):
LEFT ⊨ RIGHT, checked, not used to generate heads.

**Surface.** `invariant-check(?check, ?turn, ?invariant, ?verdict)` and
`invariant-check-grounding(?check, ?grounding)` — **PROPOSED NAME, for
Bahul to decide**. `?invariant` names an `invariant` row. `?verdict` is
`"holds"`, `"fails"`, or `"unchecked"` (mck.18).

**Grounding.** [agent-mck.md](../agent-mck.md), "Recording Invariants"
(a check against session principles before every output);
[`rpl.4`](../bootstrap/rpl.md); [`rpl.6`](../bootstrap/rpl.md); live
probe 2.

**Example.**

```rpl
recommended-dish(?d), contains-ingredient(?d, "shrimp") -: false
recommended-dish(?d), contains-ingredient(?d, "prawn") -: false
invariant("inv1", "s1",
  (recommended-dish(?d), contains-ingredient(?d, "shrimp") -: false))
invariant("inv2", "s1",
  (recommended-dish(?d), contains-ingredient(?d, "prawn") -: false))

invariant-check("chk1", "t2", "inv1", "fails")
invariant-check-grounding("chk1", {?d "shrimp pasta"})
```

Shrimp pasta is not recommended. An alternative is offered only if it
passes the same checks.

**Not.** A replacement for `-:`. This is the habit of running the check
before a reply, and of recording that it ran.

---

### mck.7 — Silent check, inspectable trace, visible report

**Law.** **Inferred.** The check in mck.6 always runs. A grounded check
is a trace under [`rpl.6`](../bootstrap/rpl.md) and is recorded; it is
not optional debug output. Whether the check is uttered in the
user-visible reply depends on posture:

- `"production"` — the check is silent in the reply, as in
  [agent-mck.md](../agent-mck.md) ("silent, internal check"; "The
  Invisible Architecture"). The trace remains inspectable as structure.
- `"test"` — the check is named in the reply, so a probe can be scored.

**FOL reading.** *Comment.* A host posture over an already-recorded
trace, not a second meaning of `-:`.

**Surface.** `session-posture(?session, ?posture)` — **PROPOSED NAME,
for Bahul to decide**. One row per session; `?posture` is `"test"` or
`"production"`.

**Grounding.** [bots/rpl-bot.md](../bots/rpl-bot.md) gap 3 (the docs do
not reconcile the silent check with the inspectable trace); live probe
2 (tension between a silent and a visible check);
[`rpl.6`](../bootstrap/rpl.md) (**Not.** "The trace is not optional
debug output"); [cognition.md](../cognition.md) §II, "Inspectable
Structure vs. Black-Box Prose".

**Example.**

```rpl
session-posture("s1", "test")
invariant-check("chk1", "t2", "inv1", "fails")
invariant-check-grounding("chk1", {?d "shrimp pasta"})
```

In `"production"`, the same check still runs and is still recorded; the
reply does not have to name it.

**Not.** A licence to skip the check, or to skip recording the trace, in
production. Silence is about the user-visible reply, not about whether
the obligation was checked.

---

### mck.8 — A restriction fact links to the invariants that use it

**Law.** **Inferred.** A recorded restriction fact is not decorative. It
must be linked to the invariants that enforce it: either those
invariants are already in the session, or the agent derives and holds
the corresponding `LEFT -: false` forms (or other right-hand sides)
that the restriction requires. A restriction fact with no linked
invariant is a gap: fill the link, or cede the initiative (mck.12).

The *obligation to link* is a kernel law. The *domain mapping* (which
ingredients a named restriction rules out) is judgment, recorded under
mck.9, not a theorem of `fol` or `rpl` ([`agent.3`](../bootstrap/agent.md)).

**FOL reading.** *Comment.* A required connection between a fact and the
invariants that give it force. Not a new connective.

**Surface.** `restriction(?restriction, ?session, ?statement)` and
`restriction-enforced-by(?restriction, ?invariant)` — **PROPOSED NAME,
for Bahul to decide**. `?invariant` names an `invariant` row.

**Grounding.** Live probe 2 and cross-probe gap 1: `dietary-restriction("no-shellfish")`
is inert unless someone interprets it; no rule links a restriction fact
to the invariants that use it.

**Example.**

```rpl
restriction("r1", "s1", "no-shellfish")
invariant("inv1", "s1",
  (recommended-dish(?d), contains-ingredient(?d, "shrimp") -: false))
invariant("inv2", "s1",
  (recommended-dish(?d), contains-ingredient(?d, "prawn") -: false))
restriction-enforced-by("r1", "inv1")
restriction-enforced-by("r1", "inv2")
```

**Not.** A claim that the restriction row, by itself, fires `-:`.
Without the link, it blocks nothing.

---

### mck.9 — How far a constraint reaches

**Law.** **Inferred.** A constraint reaches the substances, preparations,
and aliases that would violate it under another name. At a shared
activity, a constraint attached to one participant applies to shared
outputs unless a per-person alternative is coordinated under mck.10.

When a scope extension is material and uncertain, name it as judgment
and cede the initiative (mck.12) rather than quietly widening or narrowing.

**FOL reading.** *Comment.* A judged scope record, not a domain theory.

**Surface.** `restriction-covers(?restriction, ?item)` — **PROPOSED
NAME, for Bahul to decide**. `?restriction` names a `restriction` row.

**Grounding.** Live probe 1, gap (b) (does aioli count as mayonnaise?);
live probe 2 (does "no-shellfish" reach crab, lobster, mussels?);
live probe 4 (does "one guest cannot have dairy" apply to every
shared course?); cross-probe gap 2.

**Example.**

```rpl
restriction("r1", "s1", "no-shellfish")
restriction("r2", "s1", "no mayonnaise")
restriction("r3", "s1", "no dairy for one guest")
restriction-covers("r2", "aioli")
restriction-covers("r1", "shrimp")
restriction-covers("r1", "prawn")
restriction-covers("r3", "200ml cream")
```

Extending "no-shellfish" to crab is the same kind of judgment. If that
extension would change the recommendation and is not already grounded,
cede the initiative rather than treat it as a law.

**Not.** A food ontology added to `rpl`. [`agent.3`](../bootstrap/agent.md)
still forbids axiomatising that interpretation.

---

### mck.10 — How to present a coordination point

**Law.** When a non-monotonic step arises — retraction, forced choice,
constraint conflict, or non-monotonic schema change
([`agent.2`](../bootstrap/agent.md)) — the agent presents a coordination
point and does not quietly drop a fact or apply a retraction. The
presentation names:

1. the kind of coordination;
2. the facts that still hold as asserted;
3. the invariant or choice that does not hold, or the options that
   cannot be taken together;
4. the repair options under consideration.

Repair options may be ordered with reasons. Ordering is not a
selection. The agent does not pick a retraction on the user's behalf.

**Inferred.** An inconsistent grounding does not license inventing that
a fact is false. Other queries may be answered if they do not depend on
the failing grounding; the clash is still named when it is relevant.

**FOL reading.** *Comment.* A protocol for the steps [`fol.9`](../bootstrap/fol.md)
does not decide, already reserved to `agent`.

**Surface.** Both are **PROPOSED NAME, for Bahul to decide**:

- `coordination-point(?point, ?turn, ?kind, ?conflict)`
- `repair-option(?option, ?point, ?proposal)`

`?kind` uses the [`agent.2`](../bootstrap/agent.md) list:
`"retraction"`, `"forced-choice"`, `"constraint-conflict"`,
`"non-monotonic-schema-change"`.

**Grounding.** [`agent.2`](../bootstrap/agent.md); [theory.md](../theory.md)
(non-monotonic steps need judgment); live probe 3 (no format for
presenting options, or for whether they may be ranked; whether an
inconsistent program still answers other queries); cross-probe gap 3.

**Example.**

```rpl
vegetarian("guest")
menu-item("guest", "beef stew")
contains-meat("beef stew")
vegetarian(?g), menu-item(?g, ?d), contains-meat(?d) -: false

coordination-point(
  "c1",
  "t3",
  "constraint-conflict",
  "vegetarian guest cannot be served beef stew"
)
repair-option("c1-a", "c1", "change the dish")
repair-option("c1-b", "c1", "drop the vegetarian fact for guest")
repair-option("c1-c", "c1", "drop the beef-stew menu item")
```

The three facts still hold as asserted. The invariant does not hold for
`?g = "guest"`, `?d = "beef stew"`. No fact is retracted in this turn.

**Not.** A quiet repair. Not a requirement that options be unranked.
Not a new retraction operator.

---

### mck.11 — Who may retract, and when

**Law.** **Inferred.** Retraction of a session fact or of a recorded
invariant uses the [`rpl.6`](../bootstrap/rpl.md) surface (`… -: false`)
and is a coordination step ([`rpl.6`](../bootstrap/rpl.md) comment;
[`agent.2`](../bootstrap/agent.md)). The agent may propose a retraction
as a repair option (mck.10). The agent may not apply that retraction
until the session authority accepts it.

The session authority is the user unless a host names another. The
agent may retract its own uncommitted scratch (a draft it just
proposed, a guess it flagged) without waiting, because that is not a
recorded session fact.

**FOL reading.** *Comment.* Authority over a non-monotonic step, not a
new connective.

**Surface.** `session-authority(?session, ?party)` and
`repair-acceptance(?option, ?turn, ?party)` — **PROPOSED NAME, for Bahul
to decide**. One `session-authority` row per session. Retraction itself
stays `… -: false`.

**Grounding.** [`rpl.6`](../bootstrap/rpl.md) ("Retraction is
non-monotonic. Coordination is `agent`."); live probe 3 (who may
retract, and when).

**Example.**

```rpl
session-authority("s1", "user")
repair-option("c1-c", "c1", "drop the beef-stew menu item")
```

Only after acceptance:

```rpl
repair-acceptance("c1-c", "t4", "user")
menu-item("guest", "beef stew") -: false
```

**Not.** A new operator for retraction, and not a licence for the agent
to repair an inconsistent program by itself.

---

### mck.12 — When to cede the initiative

**Law.** **Inferred.** The agent cedes the initiative to the user for
validation (it yields the turn) when any of these hold:

1. the user set an explicit choice or stop point;
2. a coordination point (mck.10) needs acceptance, including a proposed
   retraction (mck.11);
3. a material default, scope extension (mck.9), or missing fact would
   change the outcome, and the agent has only a guess;
4. required ground for the answer is absent (mck.13).

The agent keeps the initiative and carries on when the request is complete
enough to honour, every applicable invariant holds, no such choice or
gap is open, and no coordination point is pending.

**FOL reading.** *Comment.* Turn-taking policy, not a connective.

**Surface.** All three are **PROPOSED NAME, for Bahul to decide**:

- `initiative(?initiative, ?session, ?purpose)`
- `initiative-holder(?initiative, ?party)` — one row per initiative.
- `initiative-ceded(?initiative, ?turn, ?party, ?reason)`

A cession records who received the initiative, in which turn, and why,
and moves `initiative-holder` to that party (the old row is retracted
with `… -: false`). Proposed reasons: `"user-choice"`, `"coordination"`,
`"missing-ground"`, `"uncertain-scope"`.

**Grounding.** [agent-mck.md](../agent-mck.md), "Autonomy vs Turn-Taking"
(the habit is named, with no rule); live probe 1, gap (c); live probe 5
(the prompt itself set the yield point); live probe 3 (conflict yields);
live probe 6 (missing ground yields); [bots/rpl-bot.md](../bots/rpl-bot.md)
gap 2.

**Example.** "Give me a few options, then we will pick" is a point to
cede the initiative, even before any option is written:

```rpl
initiative("n1", "s1", "offer a few dinner options")
initiative-holder("n1", "agent")
```

Once the options are written, in turn `"t2"`:

```rpl
initiative-ceded("n1", "t2", "user", "user-choice")
initiative-holder("n1", "agent") -: false
initiative-holder("n1", "user")
```

"Like a chef, make me a sandwich, but no mayo" is a complete command
with one honourable constraint and no open choice: carry on. A default
filling (chicken, say) that was not given is a guess; if that default
is material, cede the initiative or flag it under mck.14 rather than treat it as
ground.

**Not.** A fixed number for "a few" options. That count remains
[`agent.1`](../bootstrap/agent.md) judgment. A one-line timing sketch
per option is not, by itself, committing to a recipe (live probe 5).

---

### mck.13 — Memory strata

**Law.** Session work distinguishes two strata:

- `"short-term"` — volatile state of this session: intents, frames,
  uncommitted plans, and facts asserted in this turn-sequence.
- `"long-term"` — persistent recall: a recorded trace
  ([`rpl.6`](../bootstrap/rpl.md)), a handoff, or a host-persisted
  record.

An answer about a prior session may cite only long-term ground that is
actually present. Absence of a trace or handoff is not ground for a
guess. Without that ground, a later session is a leap of faith
([cognition.md](../cognition.md) §I); the agent says it does not know
([cognition.md](../cognition.md) §III, the trace as reliable ground).

**Inferred** mapping for a chat bot: if the host has no session store
and the message carries no trace or handoff, the long-term stratum is
empty. Residual memory of another chat is not long-term ground unless
it is such a record.

**Inferred.** When the session's graph lives in a `"persistent"` store
(mck.19), long-term means persisted there: a long-term item is one whose
record is in that store, and an earlier session's items are long-term
ground only if that store holds them. When the store is `"session-only"`,
nothing the session writes becomes long-term by being written; only a
trace or handoff carried into the session counts.

**FOL reading.** *Comment.* A partition of what may be cited as ground.
Related to, but not the same as, the turn-to-turn stratification in
[cognition.md](../cognition.md) §III.

**Surface.** `memory-item(?item, ?description, ?stratum)` and
`memory-item-record(?item, ?record)` — **PROPOSED NAME, for Bahul to
decide**. A long-term item is ground only when it has a
`memory-item-record` row that is actually present.

**Grounding.** [agent-mck.md](../agent-mck.md), "Memory Stratification";
[cognition.md](../cognition.md) §I and §III; live probe 6 (no surface
for what counts as long-term for a bot; `cognition.md` is not in the
loaded prompt); [bots/rpl-bot.md](../bots/rpl-bot.md) gap 2.

**Example.**

```rpl
memory-item("m1", "locked recipe from a previous session", "long-term")
```

If no trace, handoff, or persisted record of that item is present (no
`memory-item-record("m1", ?record)` row), the
agent does not name a recipe. Confidence is `"none"` (mck.14).

**Not.** A claim that the model's residual weights are a long-term
store. Not a substitute for the trace.

---

### mck.14 — Confidence report

**Law.** **Inferred.** A claim the agent utters may carry a confidence
report: the claim, a level, and the basis (ground or judgment). Levels
are `"high"`, `"medium"`, `"low"`, and `"none"`.

- `"high"` — a direct reading of present facts, or of a fired
  invariant.
- `"medium"` — the claim depends on a named judgment (scope, a
  default).
- `"low"` or `"none"` — the claim would need ground that is missing
  (mck.13).

In `"production"` posture (mck.7), the report may stay silent unless
the user asks, or the level on a material claim is `"low"` or
`"none"`. In `"test"` posture, the report is uttered.

**FOL reading.** *Comment.* A report about a claim, not a probability
and not a connective.

**Surface.** `confidence-report(?report, ?turn, ?claim, ?level, ?basis)`
— **PROPOSED NAME, for Bahul to decide**. Proposed basis values:
`"ground"`, `"judgment"`.

**Grounding.** Live probe 6 and probe 1, gap (f): there is no surface
for reporting confidence. [bots/rpl-bot.md](../bots/rpl-bot.md) probe 6
already marks the request for an explicit report as inferred; the
documents do not require the bot to utter a score.
[`agent.1`](../bootstrap/agent.md) covers judgment where the language
does not pin behaviour.

**Example.**

```rpl
confidence-report("k1", "t6", "no locked recipe is known", "none", "ground")
confidence-report("k2", "t2", "the shrimp-pasta invariant fires", "high", "ground")
confidence-report("k3", "t5", "bread on the list may contain dairy", "medium", "judgment")
```

**Not.** A numeric score, and not a substitute for recording a trace.

---

### mck.15 — How far a correction retracts

**Law.** **Inferred.** A later utterance that corrects earlier guidance
retracts only what it clearly replaces. Other session facts, constraints,
and invariants stay in force. If the scope of the correction is unclear
— it might or might not also retract a remaining constraint — that
unclarity is a coordination point (mck.10). The agent does not silently
drop the remainder, and does not silently keep it without naming the
question.

**FOL reading.** *Comment.* Scope of a retraction, not a new connective.

**Surface.** None beyond the retraction form in mck.11 (`… -: false`) and
`coordination-point`.

**Grounding.** Live run 2, probe B
([bots/rpl-bot-live-run-2.md](../bots/rpl-bot-live-run-2.md)): "comfort
matters more" clearly replaces "cheapest", but leaves unclear whether a
£100 cap still holds. The bot raised that as a coordination point.

**Example.**

```rpl
intent("i1", "t1", "constraint", "budget cap of £100")
intent("i2", "t1", "suggestion", "cheapest option")
intent("i3", "t3", "suggestion", "comfort matters more")
```

The correction retracts `intent("i2", "t1", "suggestion", "cheapest option")`
(`… -: false`). The £100 cap is not clearly retracted. Present a
coordination point rather than dropping or keeping the cap quietly.

**Not.** A licence to treat every correction as wiping the session. Not
a new retraction operator.

---

### mck.16 — A later preference does not outrank a constraint still in force

**Law.** **Inferred.** mck.3 already ranks a constraint above a
suggestion. A later preference or suggestion, including one that
corrects an earlier preference (mck.15), does not retract or outrank a
constraint or invariant that is still in force. If honouring the
preference would violate that constraint, present a coordination point
(mck.10). Do not drop the constraint to satisfy the preference.

**FOL reading.** *Comment.* The same precedence as mck.3, applied after
a correction. Not a new connective.

**Surface.** None beyond `intent` and `LEFT -: RIGHT`.

**Grounding.** Live run 2, probe B
([bots/rpl-bot-live-run-2.md](../bots/rpl-bot-live-run-2.md)):
constraint-versus-preference priority, when "comfort matters more"
might clash with a remaining £100 cap.

**Example.** If the £100 cap still holds under mck.15, a more comfortable
option that exceeds it is not chosen unilaterally. The clash is
coordinated.

**Not.** A rewriting of mck.3, and not a licence to drop a constraint
because a later preference arrived.

---

### mck.17 — "Forget" records, and keeps the history

**Law.** **Inferred.** When the session authority accepts a retraction
(mck.11), including a request to "forget" a fact, the default is to
*record* that the fact no longer holds, using the
[`rpl.6`](../bootstrap/rpl.md) surface (`… -: false`), and to keep the
prior record in the history. The default is not to erase the history as
if the fact had never been asserted.

**FOL reading.** *Comment.* A policy for non-monotonic update, not a new
connective. Traces remain ordinary relations
([`rpl.6`](../bootstrap/rpl.md)).

**Surface.** Retraction stays `… -: false`. No new name.

**Grounding.** Live run 2, probe C
([bots/rpl-bot-live-run-2.md](../bots/rpl-bot-live-run-2.md)): the user
settled a coordination point; the bot recorded `likes -: false`,
asserted `dislikes`, and kept the history. [`rpl.6`](../bootstrap/rpl.md)
does not say whether "forget" means erasing or recording that the fact
no longer holds.

**Example.**

```rpl
likes("x") -: false
dislikes("x")
```

The earlier `likes("x")` remains in the history; the retraction is the
record that it no longer holds.

**Inferred.** When the session's graph lives in a `"persistent"` store
(mck.19), the retraction record and the earlier record both persist
there, so a later session sees that the fact no longer holds and when it
was retracted. In a `"session-only"` store they last only as long as the
session.

**Not.** A new erase operator, and not a licence to drop traces.
Whether a host may additionally offer an erase mode (for example, to
remove personal data from a store the host controls, including a
persistent store under mck.19) is an open question; it is not the
default of this layer, and it is not specified here.

---

### mck.18 — Unchecked when there is no ground

**Law.** **Inferred.** The pre-output check (mck.6) has three verdicts:
`"holds"`, `"fails"`, and `"unchecked"`. All three are **PROPOSED NAME,
for Bahul to decide**.

When the facts needed to ground the check are absent, the verdict is
`"unchecked"`, not `"holds"` and not `"fails"`.
[`fol.5`](../bootstrap/fol.md) says a missing fact is not automatically
a proof of `not P`. The same applies in the other direction: a missing
fact is not a proof that the invariant holds, and not a proof that it
fails.

Granted autonomy does not fill in the missing ground. Name the gap.
Cede the initiative (mck.12) when the missing ground would change the outcome, or
carry an `"unchecked"` record when the user has asked the agent to
proceed without that ground.

**FOL reading.** *Comment.* A third outcome of the check, required by
[`fol.5`](../bootstrap/fol.md). Not a new connective, and not a reading
of `not`.

**Surface.** `invariant-check(?check, ?turn, ?invariant, ?verdict)` and
`invariant-check-grounding(?check, ?grounding)` — **PROPOSED NAME, for
Bahul to decide** — as in mck.6, with `?verdict` one of `"holds"`,
`"fails"`, or `"unchecked"`. When the verdict is `"unchecked"`, the
grounding may be empty: there is no `invariant-check-grounding` row for
the check, or its `?grounding` is `{}`.

**Grounding.** Live run 2, probe D
([bots/rpl-bot-live-run-2.md](../bots/rpl-bot-live-run-2.md)): the bot
picked a recipe under granted autonomy, then reported the diet check as
UNCHECKED under [`fol.5`](../bootstrap/fol.md) rather than passed. Gap:
no form for a check with nothing to check against.

**Example.**

```rpl
invariant("inv3", "s2", (recommended-dish(?d), violates-diet(?d) -: false))
invariant-check("chk2", "t3", "inv3", "unchecked")
```

**Not.** A pass. Not a fail. Not a licence to invent the missing facts
in order to make the check look grounded.

---

### mck.19 — Provisioning the session graph into a store

**Law.** **Inferred.** Every session's graph (the facts, frames,
intents, checks, traces, and retraction records of this layer) lives in
exactly one graph store. When the host provides a `"persistent"` store,
the session's graph is provisioned into it and the agent uses it. When
the host provides none, the agent falls back to a `"session-only"` store
that lasts as long as the session. The agent does not claim persistence
it does not have: with a `"session-only"` store, nothing it writes is
long-term ground for a later session (mck.13).

This law is storage-agnostic. It names no database, file format, or
product; how a host realises a store is outside the layer.

**FOL reading.** *Comment.* Where facts are kept, not what they mean. A
fact means the same in either kind of store.

**Surface.** Both are **PROPOSED NAME, for Bahul to decide**:

- `graph-store(?store, ?host, ?durability)` — `?durability` is
  `"persistent"` or `"session-only"`.
- `session-graph-store(?session, ?store)` — one row per session.

**Grounding.** Bahul, 12 Nov 2026: the graph should be provisionable
into a persistent place when one is available. [cognition.md](../cognition.md)
§I and §III (a later session needs recorded ground);
[`rpl.6`](../bootstrap/rpl.md) (traces are ordinary relations); mck.13
and mck.17.

**Example.** A host with a persistent store:

```rpl
session("s1", "host-a")
graph-store("g1", "host-a", "persistent")
session-graph-store("s1", "g1")
```

A host with none, so the agent falls back:

```rpl
session("s2", "host-b")
graph-store("g2", "host-b", "session-only")
session-graph-store("s2", "g2")
```

**Not.** A specific database or product. Not a licence to treat residual
model memory as a store. Not an erase mode (mck.17 leaves that open).

---

## What this would change in the bot's system prompt

Nothing in this section is in force until the proposal is accepted and
the names are decided. The assembler today loads the **RPL** closure
and then [agent-mck.md](../agent-mck.md) as non-layer material, and a
role preamble tells the bot to make the habits visible
(`scripts/assemble-rpl-bot-prompt.ts`; [bots/rpl-bot.md](../bots/rpl-bot.md)).

If `mck` were taken:

1. **Load the layer after `agent`.** The assembler would append the
   accepted `mck` file after [`bootstrap/agent.md`](../bootstrap/agent.md).
   **Inferred.** `mck` should be an optional layer on top of instantiation
   **RPL**, taken by this test bot, not silently added to every RPL
   closure. [language-bootstrap.md](../language-bootstrap.md) says you
   do not take comments from a layer you did not take. Whether **RPL**
   itself later includes `mck` is a separate decision.

2. **Keep the essay as essay.** [agent-mck.md](../agent-mck.md) would
   remain motivation, not a stand-in for laws. The prompt can still
   point at it, clearly marked as non-layer material, or drop it once
   the laws cover the habits.

3. **Shrink the role preamble.** Visibility would come from
   `session-posture(?session, "test")` plus mck.7 and mck.14, not from a paragraph
   that has to invent the protocol. The role would tell the bot to take
   these laws, utter the surfaces in test posture (`intent`,
   `invariant-check`, the frame relations, `initiative-ceded`,
   `confidence-report`), and
   still obey [`agent.1`](../bootstrap/agent.md) (**Not.** do not
   contradict a law in a taken layer).

4. **Set posture and authority as session facts.** A test run would
   assert `session("s1", ?host)`, `session-posture("s1", "test")`,
   `session-authority("s1", "user")` and the session's
   `session-graph-store` (mck.19) at the start of the prompt, so probes 1–6 can expect the surfaces
   rather than improvised prose.

5. **Do not add `mck` to `docs/rpl/bootstrap/` or to
   `tests/support/content/bundles.config.ts` in this proposal.** Those
   changes wait on acceptance and on the names. The language catalog
   and the mermaid graph in [language-bootstrap.md](../language-bootstrap.md)
   would gain a row only then. This document stays under
   `docs/rpl/proposals/`.

6. **Probes can later be restated against the surfaces** (for example,
   expect `initiative-ceded(?initiative, ?turn, "user", "user-choice")`
   on probe 5, and `confidence-report(?report, ?turn, ?claim, "none",
   "ground")` on probe 6). That restatement is
   not part of this proposal.

---

## Open decisions

These are for Bahul, not settled by this document:

- Every name and vocabulary item in the table above.
- The reified shape in **Entities**: in particular whether
  `initiative-holder` is stored or derived from `initiative-ceded`,
  whether `invariant` should name a `-:` form by id, and whether
  `memory-item` should carry a session.
- Whether a constraint always survives a pop (mck.5), or may be tagged
  as frame-local.
- Who the default `session-authority` is when a host does not say
  (mck.11).
- Whether instantiation **RPL** should eventually include `mck`, or
  leave it optional.
- Whether `cognition.md` should be loaded into the test bot's prompt
  once mck.13 cites it, or whether the layer text is enough.
- Whether a host's persistent store (mck.19) should be shared across
  sessions of one user, or one store per session.
- Whether a host may offer an erase mode in addition to the default
  record-and-keep-history behaviour of "forget" (mck.17).
