# Proposal: a metacognitive kernel layer

**Status.** Proposal only. This document is not a language layer, is not part
of any instantiation, and is not in force. It must not be loaded as if it
lived under [`bootstrap/`](../bootstrap/). It does not change an existing
layer or the specification. Its proposed changes to the specification are
collected in [Proposed specification additions](#proposed-specification-additions)
and are not made in the specification files.

**Proposed layer name.** `mck` ("metacognitive kernel"), written McK in
prose. Bahul suggested the McK prose form on 11 Nov 2026 ("would McK be better, in prose"); the code name `mck`
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
  identified by traces (rpl.md §12.2–12.5), rules by metadata (§11), and laws
  and documents by anchors. There are no instance ids, rule names or law ids
  inside the programs. Keywords such as `:no-dairy` in examples stand for
  contents, not ids (how contents are represented is an open decision).
- **Who said what.** Bahul's words are cited with their date. Anything marked
  **ABT proposal** is this document's suggestion, pending Bahul. Every name in
  a program is a placeholder for Bahul unless it comes from the specification
  (`$yield` and `@:` are Bahul's, `english` is in logics.md §4.2). The
  [name table](#proposed-names) lists them. Hyphenated names are avoided
  because they tend to hide an argument that was left out.
- **Law shape.** Each law uses the bootstrap fields: **Law**, **FOL reading**
  (or *comment*), **Surface**, **Grounding**, **Example**, **Not**. There is no
  **Spec** field, because nothing here is in the specification.
  **Inferred** marks a claim the cited documents do not state.
- Connectives are the colon forms already in `rpl` (`:-`, `-:`, `@:`).
  Variables are `?lvars`. Constants such as kinds and postures are keywords.
- **Citing laws.** Law headings start with a digit (`## 3. Frames`), and a
  law's prefix is the basename, so law 3 is `mck.3`, cited as the document
  anchor `mck.md#3`. That is a citation convention only: GitHub would anchor
  `## 3. Frames` as `#3-frames`, and `mck.md#3` is not an RPL label (see
  [§17.7](#177-uses-a-dot-that-name-does-not-allow)).

## Proposed names

All **PROPOSED NAME, for Bahul to decide**. Arguments are listed so none is
hidden in the name.

| Name | Reads as |
| --- | --- |
| `mck` | The layer, in code. |
| `intent(?kind, ?content)` | The utterance carries an intent of that kind. Kinds: `:command`, `:query`, `:constraint`, `:instruction`, `:analogy`, `:suggestion`. |
| `conflicts(?x, ?y)` | `?x` cannot be honoured together with `?y`. Judgment. |
| `declined(?x)` | `?x` is not honoured. |
| `reply(?content)` | `?content` is a reply the agent has put forward (law 2). |
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
| `retraction(?fact)` | The agent proposes retracting a recorded fact. |
| `can(?capability)` | **ABT proposal.** The agent has the capability. Capabilities are keywords such as `:read`, `:write`. |
| `%checks` | **ABT proposal.** An example goal (law 5) that writes the bindings of the law 2 invariant's left side to chat in `:test`. |
| `chosen(?x, …)` | **ABT proposal.** The shape a reply is read as in a clarification. |

Names used only inside examples (`recommended`, `locked`, `options`, `dinner`,
`recipe`, method names such as `clarify`) are illustrations, not proposals.

---

## Forms used

### `$yield`

`$yield` is a single bare avar (Bahul, 13 Nov). It takes no arguments and has
no variants. It passes the initiative to the user: the agent decides what to
say and interprets the reply. The user may reply "stop"; termination is the
user's (rpl.md §15.6, §18.5). Valid uses:

```rpl
% :- $yield
foo('Bar') -: $yield
admin(?person) :- ?person = $yield
?person = $yield          -- same as: $yield ^:result ?person (rpl.md §13.3)
```

Conjunction is `,`.

**Evaluation order.** Bahul's ruling is only that the yield case exploits
evaluation order: the yield occurs first. This document uses that for a
constraint that needs no body bindings, such as `-: $yield`: in
`A :- B -: $yield` the yield occurs before `B`. It claims nothing more general
about when a `-:` constraint is evaluated relative to a body (gap 5).

**ABT proposal.** A `$yield` in the body, as in `A :- B, $yield`, yields as part
of `B`; it does not have to come first.

**Gating.** `$yield` is used ungated everywhere in this document: it is taken
to be always available unless the specification says otherwise. Whether a host
with no user turn (a batch run, say) needs it gated on a capability is an open
decision.

McK writes laws for **when** to yield (law 7), never for **how**. Whether and
how the agent hands over is `agent.1` judgment.

### Methods

A goal is solved by methods. The shape is the double implication of
rpl.md §10, with the HTN-shaped reading of §16.6:

```rpl
%goal(?x) :- method(?x, ?extra) :- body
```

The middle predicate names the method. The goal's arguments are what other
rules refer to, so the method's arguments include **all** of them. A method may
add an argument only if its body binds it.

**The `-:` qualifier.** Bahul (13 Nov, 22:41): `A :- B -: C` means "the rule
`A :- B` holds if `C`", and `C` is read as a capability, so a method exists
only where the agent has that capability (law 8). That is the reading this
document uses; it is not the spelling of an existing rule (rpl.md §10 gives the
`-:` position, not this meaning). It conflicts with how the specification reads
`-:` elsewhere, as a checked obligation whose violation is `%fail`
(rpl.md §12.1–12.2, §18.6; `rpl.4`). That conflict is for Bahul (gap 4).

When `C` is false, absent or undetermined, this document means one thing in
all three cases: the method is not established. It is not `%fail`, and nothing
is concluded about `C` itself (`fol.5`). The effect is that of an activation
clause: `; @when(C)` makes a rule ineligible, "not blocked, not waiting"
(rpl.md §16). Whether `-: C` or `; @when(C)` should be the spelling is an open
decision.

**Clarification** is a method, written per goal where handing back makes sense
(not as a universal rule over all goals), as the last method of its set:

```rpl
%dinner(?dish) :- recommend(?dish) :- recommended(?dish)
%dinner(?dish) :- clarify(?dish) :- $yield @: english(~ chosen(?dish))
```

The method name `clarify` says what the hand-back is for. The trace of
`clarify` resolving is the record that this goal was solved by asking. "Last"
is a position, not a condition. The only order in the specification is
rpl.md §18.4 step 4, an order of trying, which is exactly what McK does not
add (gap 6).

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
intent(:command, :make-sandwich)
intent(:constraint, :no-mayonnaise)
intent(:analogy, :like-a-chef)
intent(:instruction, :say-what-you-will-make)
```

The analogy may shape bread, layering and seasoning. It does not introduce
mayonnaise, so a chef's aioli that conflicts with the constraint is declined.

**Open (design, not decided here).**

- Nothing in McK consumes `declined`. What the agent does with a declined
  intent, such as telling the user, is not specified.
- The law covers a suggestion or an analogy against a constraint. A command or
  an instruction against a constraint, and a constraint against a constraint,
  are not covered. A constraint conflict is an `agent.2` coordination step; no
  rule here says so.
- `conflicts(?s, ?c)` and `reaches(?c, ?item)` (law 2) overlap: a suggestion
  that contains an item the constraint reaches conflicts with it. Whether
  `conflicts` should be derived from `reaches` and `contains` is open.

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

The invariant is a live check until it grounds (rpl.md §12.2); a violated
check is `%fail` (§15.7, §18.6). So no verdict relation is needed, and a check
that has not grounded is simply still live. `fol.5` adds that a missing fact is
not a proof of `not P`, so an absent `contains` fact does not show the reply is
clean.

**Who asserts `reply`.** The agent asserts `reply(?content)` for a reply it has
put forward. Whether that is a candidate it is still weighing, or only the
final reply, is not decided: if candidates count, a violating candidate raises
`%fail` before anything is said, and if only the final reply counts, the check
comes too late. This is an open decision.

**Grounding.** Live probe 1, gap (b) (does aioli count as mayonnaise?); probe
2 (does "no shellfish" reach crab?); probe 4 (does one guest's dairy
constraint reach shared courses?); the cross-probe gaps for linking and reach.

**Example.**

```rpl
intent(:constraint, :no-mayonnaise)
reaches(:no-mayonnaise, :mayonnaise)
alias(:aioli, :mayonnaise)
contains(:chicken-with-aioli, :aioli)
reply(:chicken-with-aioli)
```

`reaches(:no-mayonnaise, :aioli)` follows, so the reply violates the invariant
and `%fail` results. A reach the agent can only guess, which would change the
reply, is a guess (law 7).

**Not.** A food ontology. `reaches` and `alias` are judgment.

---

## 3. Frames

**Law.** Work is a tree of frames, not a linear history. The base frame has
parent `nil`. A tangent is a frame whose parent is the frame it interrupts. The
active frame is a frame that is not resolved and whose children are all
resolved. At most one frame is active. Which frame is active moves by
retraction (rpl.md §12.4) and a new `active` fact, per instance.

**FOL reading.** *Comment.* Session structure, as four invariants. There is no
push or pop operator, and no negation: `not` would read a missing `resolved`
fact as proof of `not resolved`, which `fol.5` does not allow.

**Surface.** `frame`, `resolved`, `active`.

```rpl
active(?f) -: frame(?f, _)
active(?f), resolved(?f) -: false
active(?f), frame(?g, ?f) -: resolved(?g)
active(?f), active(?g) -: ?f = ?g
```

**Constraints and frames.** **Inferred.** `intent` has no frame argument, so a
constraint stated while a frame is active is not a fact about that frame.
Resolving a frame changes which frame is active and nothing else. Whether a
constraint may be tagged as frame-local is an open decision, so this is the
default pending that decision.

**Grounding.** [agent-mck.md](../agent-mck.md), "Context Stacking"; live probe
4 (no surface for the stack; a constraint added on a tangent stayed in force
after the pop, because dropping it silently is worse).

**Example.**

```rpl
frame(:dinner, nil)
frame(:no-dairy, :dinner)
active(:no-dairy)
intent(:constraint, :no-dairy)
active(:no-dairy) -: false
resolved(:no-dairy)
active(:dinner)
```

The retraction of `active(:no-dairy)` comes before `resolved(:no-dairy)` is
asserted, so the second invariant is never violated; the trace log is ordered
(rpl.md §12.3).

The dairy constraint still applies to later recipes.

**Open (design, not decided here).**

- Two unresolved siblings under one frame: the parent cannot be active, and
  nothing says which sibling is.
- No active frame at all, for example before the first frame or once the base
  is resolved: the invariants do not require one, and an existence requirement
  would need negation.
- Frame-local scratch (an open question, a superseded plan item) is not covered.

**Not.** A linear chat log treated as the stack. A rule that drops a
constraint when a frame is resolved.

---

## 4. Corrections

**Law.** **Inferred.** A correction replaces exactly what it clearly replaces.
When `replaces(?new, ?old)` holds, the retraction of what `?old` stood for
(rpl.md §12.4) is licensed, and the agent may assert it for that instance. Only
that is licensed; everything else stays.

**FOL reading.** *Comment.* Retraction is non-monotonic (`fol.9`,
[`agent.2`](../bootstrap/agent.md)), so it cannot be a standing rule. A rule
such as `replaces(?new, ?old), intent(?kind, ?old) -: false` would be an
exclusion invariant (rpl.md §12.1), not a retraction, and it would `%fail` as
soon as `replaces` was asserted. The retraction is a trace asserted per
instance.

**Surface.** `replaces`.

**Grounding.** Live run 2, probe B: "comfort matters more" clearly replaces
"cheapest", and leaves open whether a £100 cap still holds. An open case is a
guess (law 7), not a silent keep or drop. Whether a retraction records or
erases history is answered by rpl.md §12.4 and lrpl.md §7.1 (see the covered
table); live run 2, probe C.

**Example.**

```rpl
intent(:constraint, :budget-cap)
intent(:suggestion, :cheapest)
replaces(:comfort-first, :cheapest)
intent(:suggestion, :cheapest) -: false     -- the §12.4 retraction, for this instance
```

The cap is not clearly replaced, so it holds.

**ABT proposal, pending Bahul.** A user's own correction skips the yield, and
only agent-proposed retractions yield (`retraction(?fact) -: $yield`, see
[Yielding](#yielding)). The reading is that the user's correction is itself the
acceptance. ABT is asking Bahul.

**Not.** A rule that every correction wipes the session. A new retraction
operator.

---

## 5. Posture

**Law.** A session has a posture, `:test` or `:production`. The traces of the
invariant checks exist in both (`rpl.6`). In `:test` they are written to chat
([`rpl.12`](../bootstrap/rpl.md), `$json`); in `:production` they are
inspectable structure and are not written unless the user asks. Confidence
(law 6) follows the same posture.

**FOL reading.** *Comment.* A host fact about what is shown, not a second
meaning of `-:`.

**Surface.** `posture(:test)`, `posture(:production)`.

```rpl
posture(:test)
%checks :-
  posture(:test),
  (reply(?r), contains(?r, ?item), intent(:constraint, ?c), reaches(?c, ?item)) ^^ ?b,
  $json(?b)
```

The goal writes the bindings of the left side of the law 2 invariant, in the
`^^ ?b, $json(?b)` form of rpl.md §14.2.1 B. That is the violating instances
(none when the check holds), not the trace itself. Selecting the traces of one
family of checks is still open (gap 8).

**Grounding.** [bots/rpl-bot.md](../bots/rpl-bot.md) gap 3; live probe 2 (a
silent check against an inspectable trace); [agent-mck.md](../agent-mck.md),
"The Invisible Architecture".

**Open (design, not decided here).** If no `posture` fact is present, nothing
says which posture holds. The law says "unless the user asks" and does not say
how a request is recognised.

**Not.** A licence to skip the check, or the trace, in production.

---

## 6. Confidence

**Law.** **Inferred.** A claim may carry a confidence level.
`:high` — it is read directly from present facts or a grounded invariant.
`:medium` — it depends on a named judgment (a reach, a default).
`:low` or `:none` — it needs ground that is absent (law 9).

**FOL reading.** *Comment.* A report about a claim. Not a probability, not a
connective.

**Surface.** `confidence(?claim, ?level)`. There is no rule here: the criteria
are judgment, and a rule would need names for "depends on" and "absent" that
nobody has chosen.

**Grounding.** Live probe 6 and probe 1, gap (f); [bots/rpl-bot.md](../bots/rpl-bot.md).

**Example.**

```rpl
confidence(locked(:recipe), :none)
confidence(reaches(:no-dairy, :bread), :medium)
```

**Open (design, not decided here).** How confidence relates to a guess (law 7)
is not stated: a `:medium` claim resting on a default, and a `guess`, describe
overlapping situations.

**Not.** A numeric score. A substitute for the trace.

---

## 7. A material guess

**Law.** **ABT proposal.** If a value would change the outcome and the agent
has only a guess for it, the initiative passes to the user. A *default* is a
value the agent uses for a slot the user did not give; a *guess* is a default
the agent has no ground for.

**FOL reading.** *Comment.* An obligation (`rpl.4`) whose right-hand side is
`$yield`.

**Surface.** `guess`, `changes`, `$yield`.

```rpl
guess(?slot, ?value), changes(?slot, ?outcome) -: $yield
```

This is the only McK initiative law, **as an ABT proposal pending Bahul**: ABT's
reading of Bahul's ruling is that the old yield triggers become plain RPL using
`$yield`; that nothing else of the earlier law survives is also ABT's
proposal. The
triggers are in [Yielding](#yielding). A guessed `reaches`, `alias` or
`replaces` is a `guess` in the same way.

**Grounding.** [agent-mck.md](../agent-mck.md), "Autonomy vs Turn-Taking" (the
habit is named, with no rule); live probe 1, gap (c) (a default filling that
was not given); live probe 6.

**Example.**

```rpl
guess(:filling, :chicken)
changes(:filling, :the-sandwich)
```

"Like a chef, make me a sandwich, but no mayo" has no material guess: nothing
is open, so nothing yields.

**Open (design, not decided here).** A guess that would *not* change the
outcome: nothing says what the agent does with it. This document adds no
fallback, because any fallback would be a step.

**Not.** A fixed number for "a few" options ([`agent.1`](../bootstrap/agent.md)).

---

## 8. Capabilities

**Law.** **ABT proposal.** The agent has capabilities, and they are facts it can
reason over like any other. A method qualified with `-: can(…)` is established
only where the capability holds. A capability can follow from others.

**FOL reading.** *Comment.* Facts and Horn rules. The `-:` qualifier is
Bahul's reading of 13 Nov (22:41), "`A :- B` holds if `C`", with `C` read as a
capability; see [Methods](#methods) for the conflict with `rpl.4` and for what
a false, absent or undetermined `can` means.

**Surface.** `can`.

```rpl
can(:read)
can(:write)
can(:remember) :- can(:write), can(:read)

%remember(?fact) :- commit(?fact) :- $write(?fact, ".rpl/long-term.log") -: can(:write)
```

`$yield` is not gated: no `can(:yield)` appears anywhere. The agent asks about
its own capabilities with an ordinary query (`% :- can(?c), $json(?c)`).

**Grounding.** Bahul's capabilities ruling, 13 Nov 2026.
[lrpl.md §7](../specification/lrpl.md#7-session-persistence-rpl-memory-files-and-rplrc):
durable output only on hosts that offer it. **Inferred:** the names. The path is
the spec's non-normative example (§7.2).

**Not.** A claim that a missing `can` fact means "cannot" (`fol.5`). How the
agent comes to know its capabilities is a gap (gap 7).

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
[Memory configuration](#memory-configuration) for what the specification fixes
and what it leaves to the host.

**Example.** The log holds a `locked` fact, and the recipe goal has a method
that uses it:

```rpl
locked(:recipe-a)
%recipe(?dish) :- recall(?dish) :- locked(?dish)
```

Where the log has no `locked` fact, `recall` does not hold, and the goal's
other methods, such as `clarify` (see [Yielding](#yielding)), still apply.

**Not.** A claim that model weights are a store. A substitute for the trace.

---

## Yielding

These are plain RPL, not McK laws. Each hands over by using `$yield`. The old
draft listed them as triggers; here each is what the program says.

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

**Absent ground, as a method of the goal** (the `recall` method is in law 9).

```rpl
%recipe(?dish) :- clarify(?dish) :- $yield @: english(~ chosen(?dish))
```

**Coordination.** Retraction is a coordination step
([`agent.2`](../bootstrap/agent.md)). **ABT proposal:** a retraction the agent
proposes yields, and a user's own correction does not (law 4). A violated
invariant surfaces as `%fail` and the user decides (rpl.md §18.6).

```rpl
retraction(?fact) -: $yield
```

**ABT proposal.** Only the user's turn resolves `$yield`, so the user is the
authority over a retraction without any authority relation.

A reply that does not fit the `~` pattern does not satisfy the method. What
happens next is not specified: §18.6 has the row "No rule is eligible: emit
`%fail(reason, explanation)`; ask user", which may cover a reply that fits no
pattern, and the row "User declines arg", which does not (a non-fitting reply
is not a decline). Which applies is open (gap 3). A reply of "stop" is not an
answer to the pattern; it is the user ending the run (§15.6, §18.5).

---

## Memory configuration

McK adds nothing to how this is configured. This section only lists what
[lrpl.md §7](../specification/lrpl.md#7-session-persistence-rpl-memory-files-and-rplrc)
says, so laws 8 and 9 have something to cite. The files exist only on **hosts
that give durable file output** (at minimum `$write`); core LRPL does not
require a filesystem. The words *should*, *may* and *must* are the
specification's. Bahul may prefer other terms than "memory" for this (for
example knowledge or beliefs); that is an open decision, and §7 uses "memory".

| Part | What the specification says | Left to the host |
| --- | --- | --- |
| **Long-term log** (§7.1, §7.3) | Long-term memory **is** an append-only record of ground truths: fully grounded facts and constraints (rpl.md §12), traces, stable conclusions. Each committed line is one append to a single tail-only log; earlier lines are never rewritten. When the agent can write files it **should** append newly established ground truths as they become traces. It **must not** put intermediate or unrealised memo-only state in it. | Path (e.g. `.rpl/long-term.log` or `.rpl/ground.ndjson`). Encoding (NDJSON, EDN, or one RPL sentence per line), which **must** be stable enough for `$index` or `$read` to reload in a later session if the host advertises that workflow. |
| **Short-term stores** (§7.1, §7.4) | Short-term memory **holds** intermediate material: open constraint checks, partial memo state ([§3](../specification/lrpl.md#3-constraint-memos)), candidate worlds not yet realised, scratch derivations. When the agent can write files it **should** persist constraint and memo intermediates (DNF memos, open invariants, partial bindings) to short-term files under `.rpl`, not to the log. Hosts **may** split these across one or more files and **may** truncate, rotate, merge or discard them when a task completes, a session ends, or satisfactory quiescence settles the bindings. The ground outcomes **should** then be appended to the long-term log. | How files are split (by goal, topic or stratum, e.g. `.rpl/short-term/` or `.rpl/constraints-*.ndjson`). |
| **`.rpl` directory** (§7.2) | Conforming hosts that implement file-backed memory **should** place these artifacts under `.rpl` at the workspace root, or the host's nearest equivalent. The normative requirements are an append-only long-term log and separate short-term store(s), both under `.rpl`. | Exact paths and suffixes. |
| **`.rplrc`** (§7.5) | Hosts **should** read it at the start of every session, before user messages are applied and after the programme loads. Its purpose is to carry **preferences** (tone, defaults, tool choices) and **background knowledge** between sessions without duplicating them in the log. Later traces and user assertions win over it unless the host documents another policy. | Search order (a common rule: workspace root, then documented fallbacks such as the user's home). Format (prose, markdown, EDN/RPL fragments, a structured block), and how it merges into the initial store or metadata. |
| **`$write`** (§5.4, §7.6) | The natural surface for these commits. A trace stratum written with `$write` is a valid `$index` source for a later stratum. Behaviour in §7.1–7.5 **should** hold when file output is available. | Hosts **may** map `$write` targets under `.rpl` automatically or expose explicit paths. |

**Gaps in this part of the specification** (see also the gap list below):

- It does not say what long-term memory is on a host with no durable file
  output, such as a plain chat. That case is the one the probes exercise.
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
| mck.6, 18 (`invariant-check`, verdicts, "unchecked") | An invariant is a live check until grounded, then a trace (rpl.md §12.2–12.3; `rpl.4`, `rpl.6`). A failed check is `%fail` (§15.7, §18.6). "Unchecked" is a check that has not grounded, still live. `fol.5` adds that a missing fact is not a proof of `not P`. Law 2 puts invariants over `reply`. |
| mck.7 (silent check, visible report) | Law 5. |
| mck.8, 9 (`restriction-enforced-by`, `restriction-covers`) | Law 2: derivation replaces the link. |
| mck.10 (`coordination-point`, `repair-option`) | `agent.2`; `%fail(?reason, ?explanation)`; the user decides (§18.6). Ordering options is not selecting one; the user does. |
| mck.11 (`session-authority`, `repair-acceptance`) | `agent.2`, and (ABT proposal) only the user's turn resolves `$yield` ([Yielding](#yielding)). |
| mck.12 (`initiative`, `initiative-holder`, `initiative-ceded`, reasons) | `$yield`. Three triggers are plain RPL ([Yielding](#yielding)); the one law proposed in their place is law 7 (ABT proposal). |
| mck.13 (`memory-item`, strata) | lrpl.md §7 ([Memory configuration](#memory-configuration)); law 9. |
| mck.14 | Law 6. |
| mck.15 (correction scope) | Law 4. |
| mck.17 ("forget" records) | rpl.md §12.4: retraction is recorded in the trace log, and the long-term log is append-only (lrpl.md §7.1). Mostly answered; whether a host may also erase, for personal data say, stays open. |
| mck.19 (`graph-store`, durability) | The store is the `.rpl` directory or the host's equivalent (lrpl.md §7.2). Provisioning is host-defined. |
| mck.20 (`fact-provenance`, graphs, topics) | Provenance is metadata (rpl.md §11, `:file`, `:user`, `:relation`). A "graph" is the program and its log; the spec has no further concept. |
| mck.21 (composing graphs) | Loading more sentences. The Horn theory is monotonic (`fol.9`); `$read` brings them in (lrpl.md §5.2). |
| mck.22 (topic alignment) | Interpretation: two statements share a reading when their RPL readings unify (logics.md §4.2). |
| mck.23 (composition conflicts) | A violated invariant (`rpl.4`) is `%fail`; candidate worlds are lrpl.md §3 memos; non-monotonic repair is `agent.2` and `-: $yield`. |

Knowledge sharing between stores (Bahul, 12 Nov) therefore has no McK law of
its own here. Whether that is acceptable, given he asked for graph composition
and conflict resolution, is an open decision. The spec does not cover composing
two separate stores.

---

## Proposed specification additions

These are proposals for Bahul to approve. None is made in the specification
files here.

### Async interpretation (rpl.md §13, logics.md §4)

An avar may stand as the Statement of `@:`:

```rpl
$avar @: lang(~ Pattern)
```

It desugars to a fresh lvar bound by the async bind sugar of rpl.md §13.3, read
as syntax:

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
`?y`. Logics §4.2 writes `~ $de @: german(?i)`, but that puts an avar under
`~` (an in-place match), not the bare avar proposed here, so it is not a
precedent. Precedence of `@:` against `,` and `-:` is not in rpl.md §5.6, so
`$yield @: english(~ chosen(?dish))` followed by `, ?dish in ?options` or by
`-: C` has no stated grouping (gap 4).

### Safety is judged after rewriting

Bahul's rule (13 Nov, 23:09–23:11): a body variable that only provides an alias
is safe; safety is judged after rewriting; any variable the rewrite drops is
exempt; the desugared form keeps `?reply` in the head, and the sugar hides it.

The next three items are Bahul's rule with ABT's elaboration of the terms;
Bahul has not defined *alias* or *rewriting* himself.

- An **alias** is an lvar that the body binds once, by
  `?v = ASYNC_RELATION` (rpl.md §13.3), and then only passes on within the same
  body. It names a value; it adds nothing else. `?reply` above is one.
- **Rewriting** is the move between the sugar form and the desugared form:
  expanding the sugar introduces the alias, and substituting what the alias
  stands for removes it.
- The rule is that safety, and the method arity rule (the goal's arguments plus
  extras the body binds), are judged on the rewritten rule. A variable the
  rewrite drops is exempt.

Standard safety already allows variables that occur only in the body
(vision.md, "head variables in body"; see
[vision.md](../vision.md#design-principles)), so a body-only alias needs no
exemption on its own. What the rule adds concerns the desugared head argument:
the sugar form and the desugared form `clarify(?x, ?y, ?reply)` are one rule
(the sugar hides `?reply`), and hiding it does not break the arity rule. This is a rule about
rpl.md §10 and §3, which today carries safety only as a design principle.

**Arity (open).** The two spellings differ in arity, three arguments against
two. Which argument list callers see, whether a caller may refer to `?reply`,
and so whether `clarify/2` and `clarify/3` are one predicate or two, is an open
decision. This document's examples write the sugar form only for brevity and
choose nothing.

### `$yield` as a reserved avar (rpl.md §13)

`$yield` is a bare avar, reserved like `%fail` (rpl.md §15.7). It takes no
arguments and has no variants. It resolves when the user next speaks, and the
agent interprets that reply. `?v = $yield` is the §13.3 sugar for
`$yield ^:result ?v`. When a constraint needs no body bindings (`-: $yield`),
the yield occurs first (Bahul's ruling); nothing more general about
evaluation order is proposed.

### §17.7 uses a dot that `NAME` does not allow

rpl.md §17.7 shows `file.md#rel` and `%file.md#goal`. In the Appendix,
`LABEL = NAME | NS '#' NAME` and `NAME = [a-z] [a-z0-9\-]*`, so `file.md` is
not a `NAME`. Either the grammar allows a dot in a namespace segment, or §17.7
should drop the extension, or it should say these forms are informal. The
document anchors this proposal uses, `mck.md#19`, are citations, not RPL labels
(they have a dot, and `19` does not start with `a–z`), and they are not GitHub
anchors either.

---

## Spec gaps found

1. **Safety** is only a design principle in vision.md; rpl.md has no rule. The
   proposed rule, and the arity of a method whose sugar hides an alias, are in
   [Safety is judged after rewriting](#safety-is-judged-after-rewriting).
2. **§17.7** `file.md#rel` is not valid under the grammar (above).
3. **Non-fitting reply and stop.** The spec has no case for a reply that
   fits no pattern. §18.6's "No rule is eligible" row may cover it and its
   "User declines arg" row does not; which applies is open. A reply of "stop"
   is routed via §15.6 and §18.5.
4. **`-:` as a method qualifier.**
   - Bahul's "holds if `C`" reading conflicts with `rpl.4`, rpl.md §12.1–12.2
     and §18.6, where `-:` is a checked obligation whose violation is `%fail`.
   - The specification does not say what a `-:` constraint means when its
     condition is false, absent or undetermined.
   - It overlaps `; @when(…)` (§16), which already makes a rule ineligible.
   - `~ PATTERN` allows a map, list, set, string or regex in the Appendix, but
     logics.md §4.1 and §4.3 and the proposed sugar write `~ foo(_)`.
   - The logics operators (`@:`, `:@`, …) are outside rpl.md's Appendix grammar
     by design, and their precedence against `,` and `-:` (§5.6) is not stated,
     so the avar sugar has no grammar home.
5. **Evaluation order.** Bahul's yield-first ruling conflicts with rpl.md
   §12.2 and §18.3 phase 3, where constraints are checked at quiescence, and
   with §18.3 phase 8, where avars are dispatched after the plan progresses.
   `fol.3` also says a comma is not sequencing.
6. **"Last method of a set"** is a position, not a condition. Taken as an
   order of trying, it contradicts the no-try-order stance; the only order in
   the spec is rpl.md §18.4 step 4 ("Eligible rules: syntactic order"); "first
   valid resolution" is only a design principle (vision.md:131).
7. **Capabilities.** §14 defines tools but does not say how the agent learns
   which tools it has, or whether tool headings (§14.3) are the declaration.
8. **Traces as values.** Part of this is answered: rpl.md §14.2.1 B writes the
   binding map as `^^ ?b, $json(?b)`, as law 5 does. What is open is selecting
   the traces of one family of checks (for example the invariant checks) rather
   than the bindings of one conjunction.
9. **Memory** gaps in [Memory configuration](#memory-configuration): a host with
   no file output such as a plain chat, sharing between stores, and the reload
   of a log of traces.
10. **`$yield` gating.** This document uses it ungated; the specification does
    not say whether it is always available.
11. **Who asserts `reply`, and when.** Candidate or final is undecided (law 2).
12. **Frames and posture.** Multiple or no active frame, and who asserts
    `active` (law 3); an absent `posture` (law 5).
13. **Intents.** A command against a constraint, a constraint against a
    constraint, an unconsumed `declined`, and the overlap of `conflicts` with
    `reaches` (law 1).
14. **Guess and confidence.** How they relate, and what a non-material guess
    leads to (laws 6 and 7).
15. **Retraction.** How `replaces`, the §12.4 retraction and
    `retraction(?fact) -: $yield` relate: law 4 licenses the first to allow the
    second per instance, and which retractions yield is an ABT proposal.
16. **Strings as ids.** An intent's content has no id, and an utterance string
    would tie identity to wording. Examples use keywords; the representation of
    content is open.
17. **Erase.** The long-term log is append-only (lrpl.md §7.1), which mostly
    answers it; the spec does not say whether erasure for personal data is
    allowed.

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
   posture the bot utters `intent`, `active` and `confidence`. The `%checks`
   block of law 5 writes the bindings of the law 2 invariant's left side, not
   the check traces, because the spec has no form for selecting those (gap 8).
   The bot still obeys [`agent.1`](../bootstrap/agent.md).
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

For Bahul, not settled by this document. The first block matters most.

**Direction and semantics**

- Which retractions yield: ABT proposes that a user's correction does not and
  an agent-proposed retraction does (law 4, Yielding). ABT is asking.
- The `-:` method qualifier: Bahul's "holds if `C`" against the specification's
  checked-obligation reading; what a false, absent or undetermined `can` means
  (this draft: the method is not established, no `%fail`); and `-: C` against
  `; @when(C)`.
- Whether law 7 (a material guess) should be the only McK initiative law, and
  what a non-material guess leads to.
- Evaluation order: how the yield-first ruling fits §12.2 and §18.3.
- Safety: whether the after-rewriting rule is needed beyond the standard rule,
  and whether `clarify/2` and `clarify/3` are one predicate or two.
- Whether `$yield` is ever gated on a capability.

**Coverage**

- Graph composition and conflict resolution, which Bahul asked for on 12 Nov,
  are covered here only by existing spec mechanisms. Is that enough?
- Whether to use more of the logics (existential, modal) than interpretive.
- Which of Bahul's two source kinds McK is (KE's review, 14 Nov); this
  proposal does not decide.
- Whether to avoid the word "memory" (knowledge, beliefs).

**Design details**

- Every name in the [name table](#proposed-names), the keyword vocabularies,
  and how an intent's content is represented.
- Who asserts `reply` and when (candidate or final).
- Multiple or no active frame, and whether a constraint may be tagged
  frame-local (law 3).
- Command or constraint against a constraint; what consumes `declined`; whether
  `conflicts` is derived from `reaches` (law 1).
- How confidence relates to a guess; the default posture; how "asked by the
  user" is recognised (laws 5–7).
- Whether a host may offer an erase mode in addition to record-and-keep-history.
- Whether `mck` should depend on `interpretive` and `lrpl`, or leave `@:` and
  `$read`/`$write` to the host.
- Whether instantiation **RPL** should eventually include `mck`, or leave it
  optional.
- Whether `cognition.md` should be loaded into the test bot's prompt once law 9
  cites it.
- Where the spec additions go, and how to fix §17.7.
