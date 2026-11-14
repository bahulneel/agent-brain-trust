# Proposal: a metacognitive kernel layer

**Status.** Proposal only. This document is not a language layer, is not part
of any instantiation, and is not in force. It must not be loaded as if it
lived under [`bootstrap/`](../bootstrap/). It does not change an existing
layer or the specification. Its proposed changes to the specification are
collected in [Proposed specification additions](#proposed-specification-additions)
and are not made in the specification files.

**Proposed layer name.** `mck` ("metacognitive kernel"), written McK in
prose. Bahul agreed the McK prose form on 11 Nov 2026; the code name `mck`
stays lowercase like `fol`, `rpl` and `agent`. If accepted, this file becomes
`bootstrap/mck.md`, and law N in it is `mck.N`, cited as the document anchor
`mck.md#N`.

**Provides.** *(candidate)* Laws for the five metacognitive habits named in
[agent-mck.md](../agent-mck.md), written as logic programs: statements of
what holds, with no steps, fallbacks or try-order.

**Depends on.** [`agent`](../bootstrap/agent.md) (and so
[`rpl`](../bootstrap/rpl.md), [`fol`](../bootstrap/fol.md)). *(candidate)*
It also uses [`interpretive`](../bootstrap/interpretive.md) (`@:`) and
[`lrpl`](../bootstrap/lrpl.md) (`$read`, `$write`, the `.rpl` memory files).

**Not provided.** New `fol` or `rpl` connectives. A rewrite of
[`agent.1`](../bootstrap/agent.md)–[`agent.3`](../bootstrap/agent.md). A host
or start procedure for the bot. A domain ontology (what counts as
mayonnaise, what counts as shellfish). Anything the specification already
says (see [What the specification already covers](#what-the-specification-already-covers)).

---

## Why this is proposed

[language-bootstrap.md](../language-bootstrap.md) says the language bootstrap
is not a metacognitive kernel. [agent-mck.md](../agent-mck.md) names five
habits and gives them no laws. The [`agent`](../bootstrap/agent.md) layer is
only the judgment remainder, coordination points, and a warning not to
axiomatise interpretation. The RPL test bot therefore invented a preamble
that makes the habits visible ([bots/rpl-bot.md](../bots/rpl-bot.md), gaps 1–3).

Two live runs
([run 1](../bots/rpl-bot-live-run-1.md), [run 2](../bots/rpl-bot-live-run-2.md))
passed their probes, with every pass resting on the preamble. They left
these gaps: no rule linking a restriction fact to the invariants that use
it; none for how far a constraint reaches; none for how far a correction
retracts or whether a later preference outranks a constraint; none for
what counts as long-term ground; and none for when the agent should hand
the turn to the user.

An earlier draft of this proposal answered with a relational schema: ids for
sessions, turns, checks, options and graphs, and rules written as steps. It
re-stated much of the specification. This draft drops all of that. It keeps
only what the specification does not already give, and writes it as logic.

## How to read this document

- **Rules say what holds.** A rule defines what something is. It does not say
  when the agent does it, in what order, or what it falls back to. How the
  solving is done is the agent's business (rpl.md §18.3).
- **Only goals and predicates are referenced by name.** Instances are
  identified by traces (rpl.md §12.2–12.5), rules by metadata (§11), and
  laws and documents by anchors (`mck.md#19`). There are no instance ids,
  rule names or law ids inside the programs.
- **Every name in a program is a placeholder for Bahul** unless it comes from
  the specification or from his rulings (`$yield`, `%` goals, `@:`, `english`,
  `chosen`). The [name table](#proposed-names) lists them. Hyphenated names
  are avoided because they tend to hide an argument that was left out.
- **Law shape.** Each law uses the bootstrap fields: **Law**, **FOL reading**
  (or *comment*), **Surface**, **Grounding**, **Example**, **Not**. There is no
  **Spec** field, because nothing here is in the specification.
  **Inferred** marks a claim the cited documents do not state.
- Connectives are the colon forms already in `rpl` (`:-`, `-:`, `@:`).
  Variables are `?lvars`. Constants such as kinds and postures are keywords.
  Law headings start with a digit (`## 3. Frames`), and a law's prefix is the
  basename, so law 3 is `mck.3`.

## Proposed names

All **PROPOSED NAME, for Bahul to decide**. Arguments are listed so none is
hidden in the name.

| Name | Reads as |
| --- | --- |
| `mck` | The layer, in code. |
| `intent(?kind, ?content)` | The utterance carries an intent of that kind. Kinds: `:command`, `:query`, `:constraint`, `:instruction`, `:analogy`, `:suggestion`. |
| `conflicts(?x, ?y)` | `?x` cannot be honoured together with `?y`. Judgment. |
| `declined(?x)` | `?x` is not honoured. |
| `reply(?content)` | `?content` is what the agent says. |
| `contains(?content, ?item)` | The content has that item in it. |
| `reaches(?constraint, ?item)` | The constraint rules the item out. Judgment. |
| `alias(?name, ?item)` | `?name` is the item under another name. Judgment. |
| `frame(?objective, ?parent)` | A line of work, and the one it interrupts (`nil` for the base). |
| `resolved(?objective)` | That line of work is finished. |
| `active(?objective)` | That line of work is the one in force. |
| `replaces(?new, ?old)` | A correction clearly replaces an earlier statement. |
| `posture(?posture)` | `:test` or `:production`. |
| `confidence(?claim, ?level)` | Levels: `:high`, `:medium`, `:low`, `:none`. |
| `guess(?slot, ?value)` | The agent has only a guess for the slot. |
| `changes(?slot, ?outcome)` | The slot's value would change the outcome. |
| `retraction(?fact)` | A retraction of a recorded fact is proposed. |
| `can(?capability)` | The agent has the capability. Capabilities are keywords such as `:yield`, `:read`, `:write`. |

Names used only inside examples (`recommended`, `locked`, `options`, `dinner`,
`recipe`, method names such as `clarify`) are illustrations, not proposals.

---

## Forms used

### `$yield`

`$yield` is a single bare avar. It takes no arguments and has no variants. It
passes the initiative to the user: the agent decides what to say, interprets
the reply, and the user may reply "stop" (rpl.md §15.6, §18.5). Valid uses:

```rpl
% :- $yield
foo('Bar') -: $yield
admin(?person) :- $yield
?person = $yield          -- same as: $yield ^:result ?person (rpl.md §13.3)
```

Conjunction is `,`. The constraint side of `A :- B -: $yield` is evaluated
first, so the rule yields before `B`; `$yield` in the body yields as part of
`B`. McK writes laws for **when** to yield (law 7), never for **how**. Whether
and how the agent hands over is `agent.1` judgment.

### Methods

A goal is solved by methods. The shape is the double implication of
rpl.md §10, with the HTN-shaped reading of §16.6:

```rpl
%goal(?x) :- method(?x, ?extra) :- body
```

The middle predicate names the method. The goal's arguments are what other
rules refer to, so the method's arguments include **all** of them. A method
may add an argument only if its body binds it. `A :- B -: C` states that the
rule `A :- B` holds if `C`. Writing a capability as `C` (law 8) makes the
method exist only where the agent has that capability.

Clarification is a method, written per goal where handing back makes sense
(not as a universal rule over all goals), as the last method of its set:

```rpl
%dinner(?dish) :- recommend(?dish) :- recommended(?dish)
%dinner(?dish) :- clarify(?dish) :- $yield @: english(~ chosen(?dish)) -: can(:yield)
```

The method name `clarify` says what the hand-back is for. The trace of
`clarify` resolving is the record that this goal was solved by asking.
"Last" here is only the document order of rpl.md §18.4 step 4; McK adds no
order (gap 6).

### Async interpretation (proposed sugar)

`$yield @: english(~ chosen(?dish, ?kind))` reads the user's reply as that
shape without naming the reply. It is proposed sugar, specified in
[Proposed specification additions](#proposed-specification-additions).

---

## 1. Intents

**Law.** An utterance may carry several intents at once, each of one kind. A
suggestion or an analogy that conflicts with a constraint is declined.

- *command* — a request that the agent do or produce something.
- *query* — a request for information, a recommendation, or a yes/no.
- *constraint* — a hard bound on what is allowed.
- *instruction* — a direction about manner, order, or the form of the reply.
- *analogy* — a comparison or style cue: it changes how, not what is allowed.
- *suggestion* — a preference, which may be declined.

**FOL reading.** *Comment.* A classification of input, plus one Horn rule.

**Surface.** `intent`, `conflicts`, `declined`.

```rpl
declined(?s) :-
  (intent(:suggestion, ?s) | intent(:analogy, ?s)),
  intent(:constraint, ?c),
  conflicts(?s, ?c)
```

**Grounding.** [agent-mck.md](../agent-mck.md), "Contextual Intent Tracking";
live probe 1 (the chef analogy must not license an aioli); live run 2,
probe B (a later preference does not outrank a constraint in force).
**Inferred:** the criteria, and that a constraint is not traded for a
suggestion. `conflicts` is judgment ([`agent.3`](../bootstrap/agent.md)).

**Example.**

```rpl
intent(:command, "make a sandwich")
intent(:constraint, "no mayonnaise")
intent(:analogy, "like a chef")
intent(:instruction, "say briefly what you will make")
```

The analogy may shape bread, layering and seasoning. It does not introduce
mayonnaise, so a chef's aioli that conflicts with the constraint is declined.

**Not.** A collapse of two kinds into one. An axiomatised reading of the
utterance.

---

## 2. Reach

**Law.** **Inferred.** A constraint rules out every item it reaches, and it
reaches an item under another name. A recorded constraint therefore needs no
separate link to an invariant: this one rule is the link.

**FOL reading.** *Comment.* An invariant (`rpl.4`) and a transitive step.

**Surface.** `reply`, `contains`, `reaches`, `alias`.

```rpl
reply(?r), contains(?r, ?item), intent(:constraint, ?c), reaches(?c, ?item) -: false
reaches(?c, ?alias) :- reaches(?c, ?item), alias(?alias, ?item)
```

The invariant is a live check until it grounds (rpl.md §12.2). While it has
no grounding it is neither true nor false (`fol.5`). A violated check is
`%fail` (rpl.md §15.7, §18.6), so no verdict relation is needed.

**Grounding.** Live probe 1, gap (b) (does aioli count as mayonnaise?); probe
2 (does "no shellfish" reach crab?); probe 4 (does one guest's dairy
constraint reach shared courses?); the cross-probe gaps for linking and reach.

**Example.**

```rpl
intent(:constraint, "no mayonnaise")
reaches("no mayonnaise", "mayonnaise")
alias("aioli", "mayonnaise")
```

`reaches("no mayonnaise", "aioli")` follows. A reply that contains aioli
violates the invariant. A reach the agent can only guess, which would change
the reply, is a material guess (law 7).

**Not.** A food ontology. `reaches` and `alias` are judgment.

---

## 3. Frames

**Law.** Work is a tree of frames, not a linear history. The base frame has
parent `nil`. A tangent is a frame whose parent is the frame it interrupts.
The active frame is the one that is not resolved and has no unresolved child.
Intents are not scoped by a frame, so resolving a frame changes which frame is
active and nothing else.

**FOL reading.** *Comment.* Session structure, defined by a stratified rule.
There is no push or pop: asserting `frame` and `resolved` facts moves
`active`, and the earlier facts remain.

**Surface.** `frame`, `resolved`, `active`.

```rpl
active(?f) :-
  frame(?f, _),
  not resolved(?f),
  not (frame(?g, ?f), not resolved(?g))
```

**Grounding.** [agent-mck.md](../agent-mck.md), "Context Stacking"; live probe
4 (no surface for the stack; a constraint added on a tangent stayed in force
after the pop, because dropping it silently is worse). **Inferred:** that
constraints survive. `not` here is read as failure to prove (gap 11).

**Example.**

```rpl
frame("plan a vegetarian dinner for two", nil)
frame("no dairy for one guest", "plan a vegetarian dinner for two")
intent(:constraint, "no dairy for one guest")
resolved("no dairy for one guest")
```

`active("plan a vegetarian dinner for two")` holds, and the dairy constraint
still applies to later recipes. Frame-local scratch is not covered (open
decision).

**Not.** A linear chat log treated as the stack. A rule that drops a
constraint at a pop.

---

## 4. Corrections

**Law.** **Inferred.** A correction replaces exactly what it clearly replaces.
What it replaces no longer holds, and is retracted in the trace
(rpl.md §12.4). Nothing else changes.

**FOL reading.** *Comment.* Scope of a retraction. Retraction is
non-monotonic and stays under [`agent.2`](../bootstrap/agent.md).

**Surface.** `replaces`.

```rpl
replaces(?new, ?old), intent(?kind, ?old) -: false
```

**Grounding.** Live run 2, probe B: "comfort matters more" clearly replaces
"cheapest", and leaves open whether a £100 cap still holds. An open case is a
material guess (law 7), not a silent keep or drop. Whether a retraction
records or erases history is already answered by rpl.md §12.4 and
lrpl.md §7.1 (see the covered table); live run 2, probe C.

**Example.**

```rpl
intent(:constraint, "budget cap of £100")
intent(:suggestion, "cheapest option")
replaces("comfort matters more", "cheapest option")
intent(:suggestion, "cheapest option") -: false
```

The cap is not clearly replaced, so it holds.

**Not.** A rule that every correction wipes the session. A new retraction
operator.

---

## 5. Posture

**Law.** A session has a posture, `:test` or `:production`. The traces of the
invariant checks exist in both (`rpl.6`). In `:test` they are written to chat
([`rpl.12`](../bootstrap/rpl.md), `$json`); in `:production` they are
inspectable structure and are not written unless asked. Confidence (law 6)
follows the same posture.

**FOL reading.** *Comment.* A host fact about what is shown, not a second
meaning of `-:`.

**Surface.** `posture(:test)`, `posture(:production)`.

**Grounding.** [bots/rpl-bot.md](../bots/rpl-bot.md) gap 3; live probe 2 (a
silent check against an inspectable trace); [agent-mck.md](../agent-mck.md),
"The Invisible Architecture". **Inferred.** There is no rule here, because the
specification has no form for "the traces of these checks" as a value (gap 8).

**Example.**

```rpl
posture(:test)
```

**Not.** A licence to skip the check, or the trace, in production.

---

## 6. Confidence

**Law.** **Inferred.** A claim may carry a confidence level.
`:high` — it is read directly from present facts or a grounded invariant.
`:medium` — it depends on a named judgment (a reach, a default).
`:low` or `:none` — it needs ground that is absent (law 9).

**FOL reading.** *Comment.* A report about a claim. Not a probability, not a
connective.

**Surface.** `confidence(?claim, ?level)`.

**Grounding.** Live probe 6 and probe 1, gap (f); [bots/rpl-bot.md](../bots/rpl-bot.md).

**Example.**

```rpl
confidence(locked("recipe from a previous session"), :none)
confidence(reaches("no dairy for one guest", "bread"), :medium)
```

**Not.** A numeric score. A substitute for the trace.

---

## 7. A material guess

**Law.** **Inferred.** If a value would change the outcome and the agent has
only a guess for it, the initiative passes to the user.

**FOL reading.** *Comment.* An obligation (`rpl.4`) whose right-hand side is
`$yield`.

**Surface.** `guess`, `changes`, `$yield`.

```rpl
guess(?slot, ?value), changes(?slot, ?outcome) -: $yield
```

This is the only McK initiative law. The cases the earlier draft listed as
separate triggers are plain RPL, shown in [Yielding](#yielding) below. A
guessed `reaches`, `alias` or `replaces` is a `guess` in the same way.

**Grounding.** [agent-mck.md](../agent-mck.md), "Autonomy vs Turn-Taking" (the
habit is named, with no rule); live probe 1, gap (c) (a default filling that
was not given); live probe 6.

**Example.**

```rpl
guess(:filling, "chicken")
changes(:filling, "the sandwich")
```

"Like a chef, make me a sandwich, but no mayo" has no material guess: nothing
is open, so nothing yields.

**Not.** A fixed number for "a few" options ([`agent.1`](../bootstrap/agent.md)).

---

## 8. Capabilities

**Law.** The agent has capabilities, and they are facts it can reason over like
any other. A method qualified with `-: can(…)` exists only where the capability
holds. A capability can follow from others.

**FOL reading.** *Comment.* Facts and Horn rules. `-:` as the qualifier of
a rule is `A :- B -: C` (rpl.md §10).

**Surface.** `can`.

```rpl
can(:yield)
can(:read)
can(:write)
can(:remember) :- can(:write), can(:read)

%remember(?fact) :- commit(?fact) :- $write(?fact, ".rpl/long-term.log") -: can(:write)
```

The agent asks about its own capabilities with an ordinary query
(`% :- can(?c), $json(?c)`).

**Grounding.** Bahul's ruling of 14 Nov 2026. [lrpl.md §7](../specification/lrpl.md#7-session-persistence-rpl-memory-files-and-rplrc):
durable output only on hosts that offer it. **Inferred:** the names. The path
is the spec's non-normative example (§7.2).

**Not.** A claim that a missing `can` fact means "cannot" (`fol.5`); where a
capability is unknown the agent has a guess (law 7). How the agent comes to
know its capabilities is a gap (gap 7).

---

## 9. Ground about earlier sessions

**Law.** Something said about an earlier session rests on long-term ground
that is present: the facts reloaded from the long-term log
([lrpl.md §7.3](../specification/lrpl.md#73-committing-ground-truth-long-term)).
Absence of such a record is not ground (`fol.5`), and residual memory of
another chat is not a record.

**FOL reading.** *Comment.* A partition of what may be cited, reusing
lrpl.md §5.2.

**Surface.** The reload form of lrpl.md §5.2:

```rpl
#?facts :- $read(".rpl/long-term.log", {}) ^:result ?facts -: can(:read)
```

**Grounding.** [agent-mck.md](../agent-mck.md), "Memory Stratification";
[cognition.md](../cognition.md) §I and §III; live probe 6. See
[Memory configuration](#memory-configuration) for exactly what the
specification fixes and what it leaves to the host.

**Example.** Where the log has no `locked` fact, the recipe goal is solved by
asking, not by naming a recipe (see [Yielding](#yielding)).

**Not.** A claim that model weights are a store. A substitute for the trace.

---

## Yielding

These are plain RPL, not McK laws. Each hands over by using `$yield`. The
old draft listed them as triggers; here each is what the program says.

**A choice or stop point the user set** ("give me a few options, then we will
pick"). The method takes one extra argument, `?options`, which its body binds.

```rpl
options([& ?v]) :- candidate(?v)
%dinner(?dish) :-
  pick(?dish, ?options) :-
    options(?options),
    $yield @: english(~ chosen(?dish)),
    ?dish in ?options
```

**Absent ground, as a method of the goal.**

```rpl
%recipe(?dish) :- recall(?dish) :- locked(?dish)
%recipe(?dish) :- clarify(?dish) :- $yield @: english(~ chosen(?dish)) -: can(:yield)
```

**Coordination.** Retraction is a coordination step
([`agent.2`](../bootstrap/agent.md)), and the user decides it. A violated
invariant surfaces as `%fail` and the user decides (rpl.md §18.6).

```rpl
retraction(?fact) -: $yield
```

Only the user's turn resolves `$yield`, so the user is the authority over a
retraction without any authority relation.

---

## Memory configuration

McK adds nothing to how memory is configured. This section only enumerates
what [lrpl.md §7](../specification/lrpl.md#7-session-persistence-rpl-memory-files-and-rplrc)
says, so laws 8 and 9 have something to cite. The memory files exist only on
**hosts that give durable file output** (at minimum `$write`); the
specification does not require a filesystem.

| Part | What the specification fixes | Left to the host |
| --- | --- | --- |
| **Long-term log** (§7.1, §7.3) | One append-only, tail-only log of fully grounded ground truths: traces (rpl.md §12.2–12.3) and stable conclusions. Earlier lines are never rewritten. Intermediate or memo-only state **must not** go in it. New ground **should** be appended as it becomes a trace. | Path (e.g. `.rpl/long-term.log` or `.rpl/ground.ndjson`). Encoding (NDJSON, EDN, or one RPL sentence per line), stable enough for `$index`/`$read` to reload if the host advertises that. |
| **Short-term stores** (§7.1, §7.4) | One or more files under `.rpl`, separate from the log. They hold open constraint checks, DNF memos ([§3](../specification/lrpl.md#3-constraint-memos)), candidate worlds not yet realised, partial bindings and scratch derivations. Hosts **may** merge, truncate, rotate or discard them at task end, session end, or satisfactory quiescence; settled ground outcomes **should** then be appended to the log. | How files are split (by goal, topic or stratum, e.g. `.rpl/short-term/` or `.rpl/constraints-*.ndjson`). |
| **`.rpl` directory** (§7.2) | The home of both, at the workspace root (or the host's nearest equivalent). | Exact paths and suffixes. |
| **`.rplrc`** (§7.5) | Read at the start of every session, before user messages are applied and after the programme loads. Carries **preferences** (tone, defaults, tool choices) and **background knowledge** between sessions, without duplicating them in the log. Later traces and user assertions win over it unless the host documents another policy. | Search order (workspace root, then documented fallbacks such as the user's home). Format (prose, markdown, EDN/RPL fragments, a structured block). How it merges into the initial store or metadata. |
| **`$write`** (§5.4, §7.6) | The natural surface for commits. A trace stratum written with `$write` is a valid `$index` source for a later stratum. | Whether `$write` targets under `.rpl` are mapped automatically or by explicit path. |

**Gaps in this part of the specification** (see also the gap list below):

- It does not say what long-term memory is on a host with no durable file
  output, such as a plain chat. That case is the one the probes exercise.
- It does not say whether a constraint the user states belongs in the log, in
  short-term files, or in `.rplrc`. `.rplrc` names preferences and background
  knowledge only.
- It says nothing about sharing a log or `.rplrc` between workspaces, agents
  or users, so there is no spec ground for composing two stores.
- `#?facts :- $read(…)` (lrpl.md §5.2) needs every expanded result to be a
  valid head (rpl.md §5.7), yet the log holds traces, which are constraints
  and not heads. The reload form is not defined.

---

## What the specification already covers

Each item of the earlier draft that the specification already gives was
removed, with no relation of its own.

| Earlier draft | Now |
| --- | --- |
| `session`, `session-authority`, `turn`, instance ids, law ids, rule names | Not needed. Traces identify instances (rpl.md §12.2–12.5); metadata names rules (§11); documents are cited by anchor. |
| mck.1–3, 16 (intent kinds, precedence, later preference) | Law 1. |
| mck.4–5 (context stack, survives a pop) | Law 3. |
| mck.6, 18 (`invariant-check`, verdicts, "unchecked") | An invariant is a live check until grounded, then a trace (rpl.md §12.2–12.3; `rpl.4`, `rpl.6`). A failed check is `%fail` (§15.7, §18.6). "Unchecked" is a check still ungrounded, which `fol.5` already separates from true and false. Law 2 puts invariants over `reply`. |
| mck.7 (silent check, visible report) | Law 5. |
| mck.8, 9 (`restriction-enforced-by`, `restriction-covers`) | Law 2: derivation replaces the link. |
| mck.10 (`coordination-point`, `repair-option`) | `agent.2`; `%fail(?reason, ?explanation)`; the user decides (§18.6). Ordering options is not selecting one; the user does. |
| mck.11 (`session-authority`, `repair-acceptance`) | `agent.2`, and only the user's turn resolves `$yield` ([Yielding](#yielding)). |
| mck.12 (`initiative`, `initiative-holder`, `initiative-ceded`, reasons) | `$yield`. Three triggers are plain RPL ([Yielding](#yielding)); the only law left is law 7. |
| mck.13 (`memory-item`, strata) | lrpl.md §7 ([Memory configuration](#memory-configuration)); law 9. |
| mck.14 | Law 6. |
| mck.15 (correction scope) | Law 4. |
| mck.17 ("forget" records) | rpl.md §12.4: retraction is recorded in the trace log, and the log is ordered and append-only (lrpl.md §7.1). The spec records and keeps history. Whether a host may also **erase** (for personal data, say) stays open. |
| mck.19 (`graph-store`, durability) | The store is the `.rpl` directory or the host's equivalent (lrpl.md §7.2). Provisioning is host-defined. |
| mck.20 (`fact-provenance`, graphs, topics) | Provenance is metadata (rpl.md §11, `:file`, `:user`, `:relation`). A "graph" is the program and its log; the spec has no further concept. |
| mck.21 (composing graphs) | Loading more sentences. The Horn theory is monotonic (`fol.9`); `$read` brings them in (lrpl.md §5.2). |
| mck.22 (topic alignment) | Interpretation: two statements share a reading when their RPL readings unify (logics.md §4.2). |
| mck.23 (composition conflicts) | A violated invariant (`rpl.4`) is `%fail`; candidate worlds are lrpl.md §3 memos; non-monotonic repair is `agent.2` and `-: $yield`. |

Knowledge sharing between stores (Bahul, 12 Nov) therefore has no McK law of
its own. The one thing the specification does not cover is composing two
separate stores (gap in Memory configuration).

---

## Proposed specification additions

These are proposals for Bahul to approve. None is made in the specification
files here.

### Async interpretation (rpl.md §13, logics.md §4)

An avar may stand as the Statement of `@:`:

```rpl
$avar @: lang(~ Pattern)
```

It desugars to a fresh lvar bound by the async bind sugar of rpl.md §13.3,
read as syntax:

```rpl
?reply = $avar, #?reply @: lang(~ Pattern)
```

so that the reply is suspended on and interpreted without being named. For
example,

```rpl
clarify(?x, ?y) :- $yield @: english(~ chosen(?x, ?y))
```

means

```rpl
clarify(?x, ?y, ?reply) :- ?reply = $yield, #?reply @: english(~ chosen(?x, ?y))
```

The reading holds only if the reply fits the pattern, and the pattern binds
`?y`. A reply that does not fit does not satisfy the method. Logics §4.2
already writes an avar in statement position (`~ $de @: german(?i)`) without
defining it.

### Safety is judged after rewriting

A rule is safe when every variable in its head is bound by its body **after
rewriting**. Any variable the rewrite drops, such as an alias that only names a
value bound elsewhere in the body (`?reply` above), need not be in the head,
because rewriting substitutes what it stands for. This is general, not special
to async interpretation. It belongs in rpl.md §10 or §3; today it appears only
as a design principle in [vision.md](../vision.md#design-principles) ("head
variables in body").

### `$yield` as a reserved avar (rpl.md §13)

`$yield` is a bare avar, reserved like `%fail` (rpl.md §15.7). It takes no
arguments and has no variants. It resolves when the user next speaks, and
the agent interprets that reply. `?v = $yield` is the §13.3 sugar for
`$yield ^:result ?v`. Evaluation order: the constraint side of `A :- B -: C`
is evaluated before `B`.

### §17.7 uses a dot that `NAME` does not allow

rpl.md §17.7 shows `file.md#rel` and `%file.md#goal`. In the Appendix,
`LABEL = NAME | NS '#' NAME` and `NAME = [a-z] [a-z0-9\-]*`, so `file.md` is
not a `NAME`. Either the grammar allows a dot in a namespace segment, or §17.7
should drop the extension, or it should say these forms are informal. The
document anchors this proposal uses, `mck.md#19`, are citations, not RPL
labels (they have a dot, and `19` does not start with `a–z`).

---

## Spec gaps found

1. **Safety** is only a design principle in vision.md; rpl.md has no rule.
2. **§17.7** `file.md#rel` is not valid under the grammar (above).
3. **`~ PATTERN`** allows a map, list, set, string or regex in the Appendix,
   but logics.md §4.1, §4.3 and the proposed sugar write `~ foo(_)` (a relation
   call).
4. **Logics operators** (`@:`, `:@`, …) are outside rpl.md's Appendix grammar by
   design, so the avar sugar needs a grammar home in logics.md.
5. **Order of `-:` constraint and body** is Bahul's ruling; the specification
   does not state it (§12.2 is about grounding, §16 about activation), and
   `fol.3` says a comma is not sequencing.
6. **"Last method of a set"** relies on §18.4 step 4 ("syntactic order"),
   which is an order of trying. It sits against the no-try-order stance,
   and `fol.4` leaves which alternative is tried first to `agent` and
   `rpl-runtime`.
7. **Capabilities.** The specification does not say how the agent learns which
   tools and capabilities it has.
8. **Traces as values.** rpl.md §12.5 says traces are queryable, with no form
   for selecting the traces of one family of checks (for example to `$json`
   them).
9. **Memory** gaps in [Memory configuration](#memory-configuration): hosts
   with no file output, where a stated constraint lives, sharing between
   stores, and the reload of a log of traces.
10. **`$yield` and safety.** In `admin(?person) :- $yield` the body binds
    `?person` only through the agent's reading of the reply. It is unclear
    whether that satisfies the safety rule, or `$yield` needs the sugar.
11. **`not`** (`fol.5`) is not classified as classical or failure to prove;
    law 3 reads it as failure to prove.
12. **`%fail`** has `?reason` and `?explanation` and no slot for repair
    options.
13. **Erase.** The specification records retractions and keeps history. It does
    not say whether a host may erase.
14. **Name syntax in sketches.** `someGoal` and `clarifyX` are not valid
    `NAME`s (lowercase kebab only); this draft uses `dinner`, `clarify`.
15. In the spelled-out expansion, `?reply` appears in the method head to make the
    rewrite explicit; under the safety rule above it is dropped after
    rewriting. The two readings should be stated together.

---

## What this would change in the bot's system prompt

Nothing in this section is in force until the proposal is accepted and the
names are decided. The assembler today loads the **RPL** closure and then
[agent-mck.md](../agent-mck.md) as non-layer material, and a role preamble
tells the bot to make the habits visible
(`scripts/assemble-rpl-bot-prompt.ts`; [bots/rpl-bot.md](../bots/rpl-bot.md)).

If `mck` were taken:

1. **Load the layer after `agent`.** The assembler would append the accepted
   `mck` file after [`bootstrap/agent.md`](../bootstrap/agent.md).
   **Inferred.** `mck` should be an optional layer on top of **RPL**, taken
   by this test bot, not silently added to every RPL closure.
   [language-bootstrap.md](../language-bootstrap.md) says you do not take
   comments from a layer you did not take.
2. **Keep the essay as essay.** [agent-mck.md](../agent-mck.md) remains
   motivation, marked as non-layer material, or is dropped once the laws cover
   the habits.
3. **Shrink the role preamble.** Visibility comes from `posture(:test)` and
   laws 5 and 6, not from a paragraph that invents the protocol. In test
   posture the bot utters `intent`, `active`, `confidence` and the check
   traces, and still obeys [`agent.1`](../bootstrap/agent.md).
4. **Set posture and capabilities as facts** at the start of a test run:
   `posture(:test)` and the `can(…)` facts of the host.
5. **Do not add `mck` to `docs/rpl/bootstrap/` or to
   `tests/support/content/bundles.config.ts` in this proposal.** Those changes
   wait on acceptance and on the names. This document stays under
   `docs/rpl/proposals/`.
6. **Probes can later be restated against the surfaces** (for example, expect
   a `$yield` on probe 5, and `confidence(?claim, :none)` on probe 6). That
   restatement is not part of this proposal.

---

## Open decisions

For Bahul, not settled by this document:

- Every name in the [name table](#proposed-names), and the keyword vocabularies.
- Whether `mck` should depend on `interpretive` and `lrpl`, or whether the
  `@:` and `$read`/`$write` uses should be left to the host.
- Whether a constraint always survives a frame being resolved (law 3), or may
  be tagged as frame-local.
- Whether a host may offer an erase mode in addition to record-and-keep-history.
- Whether instantiation **RPL** should eventually include `mck`, or leave it
  optional.
- Whether `cognition.md` should be loaded into the test bot's prompt once law
  9 cites it, or the layer text is enough.
- Where the spec additions above go, and how to fix §17.7.
