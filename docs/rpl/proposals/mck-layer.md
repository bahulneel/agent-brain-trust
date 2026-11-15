# Proposal: a metacognitive kernel layer

**Scope.** This document proposes a layer. It is not a language layer and is not
part of any instantiation. It must not be loaded as if it lived under
[`bootstrap/`](../bootstrap/). It does not change an existing layer or the
specification. Its proposed changes to the specification are collected in
[Proposed specification additions](#proposed-specification-additions) and are
not made in the specification files.

**Proposed layer name.** `mck` ("metacognitive kernel"), written McK in
prose. Bahul suggested the McK prose form on 11 Nov 2026 ("would McK be better, in prose"); the code name `mck`
stays lowercase like `fol`, `rpl` and `agent`. Law N in this file is `mck.N`, cited as the
document anchor `mck.md#N`.

**Provides.** *(candidate)* Laws for the five metacognitive habits named in
[agent-mck.md](../agent-mck.md), written as logic programs: statements of
what holds, with no steps, fallbacks or try-order.

**Depends on.** [`agent`](../bootstrap/agent.md) (and so
[`rpl`](../bootstrap/rpl.md), [`fol`](../bootstrap/fol.md)). *(candidate)*
It also uses [`modal`](../bootstrap/modal.md) (`~:`, law 3),
[`interpretive`](../bootstrap/interpretive.md) (`@:`, the async sugar) and
[`lrpl`](../bootstrap/lrpl.md) (`$index`, `$write`, the `.rpl` memory files).

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
  contents, not ids.
- **Who said what.** A claim is labelled "Bahul's" only where one of his
  messages backs it, and the message is quoted verbatim (typos as written). The
  14 Nov messages carry their number, `#n`, in ABT's numbered record; earlier ones
  carry their date. Anything marked
  **ABT proposal** or **ABT's reading** is this document's suggestion or
  interpretation, not Bahul's words. Every name in a program is ABT's choice
  unless it comes from the specification (`$generate` is lrpl.md §5.3 and
  `english` is in logics.md §4.2) or is one of his own words, quoted where it is
  introduced: `$consult` (#8), `var!` (#21), `$yeild()` (#19), `google-it!`
  (#23), `config!` (#24), and "async rule" and "uncaptured" (#33). The
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

All **PROPOSED NAMES**. Arguments are listed so none is
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
| `inside(?g, ?f)` | **ABT name.** The frame `?g` is inside `?f`: `?f` is its parent or an ancestor (law 3). |
| `replaces(?new, ?old)` | A correction clearly replaces an earlier statement. |
| `posture(?posture)` | `:test` or `:production`. |
| `confidence(?claim, ?level)` | Levels: `:high`, `:medium`, `:low`, `:none`. |
| `guess(?slot, ?value)` | The agent has only a guess for the slot. |
| `changes(?slot, ?outcome)` | The slot's value would change the outcome. |
| `retraction(?fact)` | The agent proposes retracting a recorded fact. |
| `yield!` | **Bahul's name** ("But we will need to do one thing which is: $yeild()", #19; "yeild is 1 example", #23). Hands the initiative to the user; built from `$consult` ("we can use consult to build yield without and need for a special case", #18); see [Forms used](#yield-consult-and-the-name-notation). The spelling `yield!`, with the corrected `yield`, is ABT's. |
| `$consult(?agent, ?prompt)` | **Bahul's name** ("a new async call called $consult(?agent,?prompt) This, as you might imagine I'd used to message another agent but in a rule context", #8). The reply is the result. |
| `name!` | **Bahul's notation** ("Notation var! Is the same as $var()", #21). A zero-argument async call. `name!` is ABT's spelling of his `var!`; the grammar form `LABEL '!'` is an ABT proposal (see the proposed additions). |
| `can(?capability)` | **ABT proposal.** The agent has the capability. Capabilities are keywords such as `:read`, `:write`. |
| `%checks` | **ABT proposal.** An example goal (law 5) that writes the bindings of the law 2 invariant's left side to chat in `:test`. |

Names used only inside examples (`recommended`, `locked`, `options`, `dinner`,
`recipe`, `picked`, `reviewed`, `reviewer`, `answer`, and method names such as `method`, `pick` and `recall`) are
illustrations, not proposals. In particular McK defines no clarification goal,
method or relation: clarification is only a pattern, shown under
[Methods](#methods). Bahul (#0, 14 Nov): "But we are not supposed to encode clarify
directly just use it as a pattern".

---

## Forms used

### `yield!`, `$consult` and the `name!` notation

This follows Bahul's 14 Nov messages (#0 and #6–#28), quoted below by number. It
replaces the earlier form of `$yield` as a single bare avar (13 Nov). Bahul
introduced these items step by step ("Let's take a diversion through a new async
call called $consult(?agent,?prompt)", #8). Anything marked ABT is this document's
elaboration.

**Normalised syntax.** Bahul gave his syntax from memory and asked that it be
read as illustrative ("Assume that my rpl recollection is gaopy", #28, typo as
written).
The examples in this document are **normalised to the specification**: an lvar
on the left of the §13.3 bind sugar (`?msg = $generate(…)`, not an avar). The order of
literals in a conjunction is not semantic (`fol.3`).

**`$consult(?agent, ?prompt)`** is a new async call. Bahul (#8): "This, as you
might imagine I'd used to message another agent but in a rule context". The reply
is the result (ABT's reading: `?r = $consult(?agent, ?prompt)`, the §13.3 async
bind sugar). Bahul (#9) wrote it with a generator as `$consult(?agent, $prompt),
$prompt = $generate("construct a prompt that ...")`, and added "we can use string
interpretation to generate that string from bound cars, generate a table, etc or
use them by name, the agent knows". So `?prompt` can come from a generator, with the
string interpolation of bound variables, tables, or naming variables that the
agent knows how to do (rpl.md §2 string templates, `{?draft}` below). `?agent`
can come from a choice such as `$choose` (rpl.md §14.2) and the like. For
example:

```rpl
reviewed(?draft, ?verdict) :-
  reviewer(?agent),
  ?verdict = $consult(?agent, ?prompt),
  ?prompt = $generate("construct a prompt asking the agent to review {?draft}")
```

**`name!`**: Bahul (#21) "Notation var! Is the same as $var()", so it is a
zero-argument async call; he called it "an async thunk or void relation" (#25) and
said "because of the asynchrony we can use a term like thunk because the async
changes the evaluation direction monetarily" (#26). A postfix `!` does not clash with `!=` or with the
prefix `!%goal` (rpl.md §15.5).

**`yield!` is not a special case.** Bahul: "we can use consult to build yield
without and need for a special case" (#18), and "yeild has a fixed instruction
which boils down to do what you think is right" (#16). It is built from `$consult`
with `:user` as the agent, and from `$generate` given that one fixed instruction,
which he put as: And it's something "like given location of the yield and
whatever method best fits..." (#14). He said "consult carries the delivered message not the meta
instruction" (#17).

**One instruction covers both directions.** Bahul (#13): "aside from what to
generate generate the agent what to go with the response and both of those csses
are the duals of 1 thing which is initiative passing" (typos as written). And on
where interpretation lives (#28):
"Interpretation must be part of the prompt issued to the agent, the trick is we can
talk about what to do in the prompt generator, this is that breaking the 4th
wall". So the single fixed instruction covers both the outgoing message and what
to do with the reply, and interpretation lives in the generator prompt, not at
the call site. The definition below is normalised; the instruction wording is
illustrative, since Bahul gave it only as a "like" paraphrase (#14):

```rpl
$yield() :- $consult(:user, $generate("given where this yield sits and whatever method fits best, hand over what you think should be handed over, and interpret and act on the reply as you think is right"))
```

This relies on two proposed additions. The nested-call sugar (see
[Nested-call sugar](#nested-call-sugar-bahuls-design)) makes it the same as:

```rpl
$yield() :-
  $consult(:user, ?msg),
  ?msg = $generate("given where this yield sits and whatever method fits best, hand over what you think should be handed over, and interpret and act on the reply as you think is right")
```

The `$consult` result is uncaptured, so by Bahul's rule (#33: "if an async rule
calls an async any uncaptured result propagates to the head"; see
[Proposed specification additions](#uncaptured-async-results-propagate-to-the-head-rplmd-13-14))
it is the `:result` of `$yield()`, and so of `yield!`.

**A family of escape hatches.** Bahul (#22): "we can build a family of context
aware asyncs that can be used as escape hatches". `name!` forms a family: "yeild
is 1 example. We might also have a google-it!" (#23), or "config! Which is where
we load a config file, the same one every time, a context dependant one or
anything else the language can do without args at top of proof or anything we
can ask the agent to do extra to that" (#24). `google-it!` and `$lookup` (a way to
find an agent; "I invented it to demonstrate a point", #31) are illustrative names;
they are not proposed tools. Bahul (#24): "the context awareness is only a
property of the prompt generator if there's one".

**Uses.** The user may reply "stop"; termination is the user's
(rpl.md §15.6, §18.5). Valid uses:

```rpl
% :- yield!
foo('Bar') -: yield!
admin(?person) :- ?person = yield!
?person = yield!          -- same as: $yield() ^:result ?person (rpl.md §13.3)
```

Conjunction is `,`.

**Evaluation order.** Bahul (13 Nov 2026): "The yeild case is exploiting evaluation
order l, IE the yield occurs first". This document takes the ruling as only that. This document uses that for a
constraint that needs no body bindings, such as `-: yield!`: in
`A :- B -: yield!` the yield occurs before `B`. It claims nothing more general
about when a `-:` constraint is evaluated relative to a body.

**ABT proposal.** A `yield!` in the body, as in `A :- B, yield!`, yields as part
of `B`; it does not have to come first.

**Gating.** `yield!` is used ungated everywhere in this document: it is taken
to be always available unless the specification says otherwise. 

McK writes laws for **when** to yield (law 7), never for **how**. The how is the
definition of `yield!` above, which is not a McK definition.

### Methods

A goal is solved by methods. The shape is the double implication of
rpl.md §10, with the HTN-shaped reading of §16.6:

```rpl
%goal(?x) :- method(?x, ?extra) :- body
```

The middle predicate names the method. The goal's arguments are what other
rules refer to, so the method's arguments include **all** of them. A method may
add an argument only if its body binds it.

**The `-:` qualifier.** Bahul (13 Nov, 22:41): "It means that A:- B holds if C"
(of `A :- B -: C`), and `C` is read as a capability, so a method exists
only where the agent has that capability (law 8). That is the reading this
document uses; it is not the spelling of an existing rule (rpl.md §10 gives the
`-:` position, not this meaning).


When `C` is false, absent or undetermined, this document means one thing in
all three cases: the method is not established. It is not `%fail`, and nothing
is concluded about `C` itself (`fol.5`). The effect is that of an activation
clause: `; @when(C)` makes a rule ineligible, "not blocked, not waiting"
(rpl.md §16).

**Handing back is a pattern, not McK vocabulary** (Bahul, #0, 14 Nov: "But we are
not supposed to encode clarify directly just use it as a pattern"). A goal may have a method whose body is
`yield!`, written where handing back makes sense for that goal (not as a
universal rule over all goals). The following is an **example only**; the
method name belongs to the goal, and McK defines neither:

```rpl
%goal(?x) :- method(?x) :- ?x = yield!

%dinner(?dish) :- method(?dish) :- recommended(?dish)
%dinner(?dish) :- method(?dish) :- ?dish = yield!
```

Nothing at the call site interprets the reply: that is in the instruction behind
`yield!`.

The trace of the `yield!` method resolving is the record that the goal was
solved by handing back. "Last", if it is written last, is a position, not a
condition. McK adds no order of trying.

### Async interpretation

`$avar @: lang(~ Pattern)` reads an async reply as a shape the goal chooses,
without naming the reply. For example `$answer @: english(~ picked(?dish, ?kind))` (an example shape, not McK
vocabulary). It is specified in
[Proposed specification additions](#proposed-specification-additions). It is
not applied to `yield!`, whose interpretation lives in its own instruction.

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

**Not.** A collapse of two kinds into one. An axiomatised reading of the
utterance.

---

## 2. Reach

**Law.** **Inferred.** A constraint rules out every item it reaches, and it
reaches an item under another name. A recorded constraint therefore needs no
separate link to an invariant: this one rule is the link.

**FOL reading.** *Comment.* An invariant (`rpl.4`) and a transitive step.

**Surface.** `reply`, `contains`, `reaches`, `alias`, and for the scoped case `active` and
`inside` (law 3).

```rpl
reply(?r), contains(?r, ?item), intent(:constraint, ?c), reaches(?c, ?item) -: false
reply(?r), contains(?r, ?item), (intent(:constraint, ?c) ~: ?w), active(?a), (?a = ?w | inside(?a, ?w)), reaches(?c, ?item) -: false      -- ABT proposal: scoped case
reaches(?c, ?alias) :- reaches(?c, ?item), alias(?alias, ?item)
```

**Scoped constraints (ABT proposal).** The second invariant is the scoped case of
the first. A constraint recorded in a frame with `~:` (law 3) is checked only
while `?w` is the active frame or an ancestor of it (`?a = ?w | inside(?a, ?w)`).
The premises are all positive, and every variable occurs in a positive premise
(`?w` in the `~:` fact, `?a` in `active(?a)`), so the rule is safe and
monotonic. `(intent(:constraint, ?c) ~: ?w)` is parenthesised so that it reads as
one premise. ABT's reading: a bare `intent(:constraint, ?c)` does not match a
`~:`-scoped fact; the specification states neither.

The invariant is a live check until it grounds (rpl.md §12.2); a violated
check is `%fail` (§15.7, §18.6). So no verdict relation is needed, and a check
that has not grounded is simply still live. `fol.5` adds that a missing fact is
not a proof of `not P`, so an absent `contains` fact does not show the reply is
clean.

**Who asserts `reply`.** The agent asserts `reply(?content)` for a reply it has
put forward.

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
retraction (rpl.md §12.4) and a new `active` fact, per instance. A frame has at
most one parent, and the frames form a tree with no cycles, so no frame is inside
itself.

**FOL reading.** *Comment.* Session structure, as four invariants (and, as an ABT
proposal, two more for the tree). There is no
push or pop operator, and no negation: `not` would read a missing `resolved`
fact as proof of `not resolved`, which `fol.5` does not allow.

**Surface.** `frame`, `resolved`, `active`, and (ABT proposal) `inside`.

```rpl
active(?f) -: frame(?f, _)
active(?f), resolved(?f) -: false
active(?f), frame(?g, ?f) -: resolved(?g)
active(?f), active(?g) -: ?f = ?g
```

**Tree (ABT proposal).** Two further invariants encode the tree: at most one
parent, and no cycles, so no frame is inside itself.

```rpl
frame(?g, ?p), frame(?g, ?q) -: ?p = ?q
inside(?g, ?g) -: false
```

**Constraints and frames.** Bahul (12 Nov): "This is down to how you write the
constraint". ABT's reading: a constraint that mentions the frame holds only
inside that frame, and one that does not is session-wide, with no marker.
Resolving a frame changes which frame is active and nothing else.

**Frame scope with `~:` (ABT proposal, hybrid).** The invariants above are
core-only (`-:`, no `@:`). `frame`, `resolved` and `active` stay as the tree and
the current point, and a frame's scope is written with `~:`. Bahul (12 Nov): "We
can use world's to model conversations with scope"; ABT maps a frame to a world.
Bahul (13 Nov): "We should be leveraging all the logics in tge McK" and "Yes we
should try to avoid inventing language where the notation allows for the pure
general versions of a statement", so ABT proposes no scope marker, only `~:`
(logics.md §3: `A ~: B` means `A` is true within the world-view of `B`).

```rpl
intent(:constraint, :no-dairy)                      -- bare: session-wide
intent(:constraint, :no-onions) ~: :dairy-detour    -- holds in that world only
inside(?g, ?f) :- frame(?g, ?f), ?f != nil
inside(?g, ?f) :- frame(?g, ?h), inside(?h, ?f)
```

The base frame's `nil` is not a frame, so `inside` excludes it: the root has no
parent frame.

ABT's reading of `~:` here: `S ~: ?w` is in force while `?w` is the active frame
or an ancestor of it (by `inside`), so a frame-scoped constraint does not lapse
during a child tangent; law 2's scoped invariant uses this reading. `inside` is
ABT's name.

**Grounding.** [agent-mck.md](../agent-mck.md), "Context Stacking"; live probe
4 (no surface for the stack; a constraint added on a tangent stayed in force
after the pop, because dropping it silently is worse).

**Example.**

```rpl
frame(:dinner, nil)
frame(:dairy-detour, :dinner)
active(:dairy-detour)
intent(:constraint, :no-dairy)
intent(:constraint, :no-onions) ~: :dairy-detour
active(:dairy-detour) -: false
resolved(:dairy-detour)
active(:dinner)
```

The retraction of `active(:dairy-detour)` comes before `resolved(:dairy-detour)` is
asserted, so the second invariant is never violated; the trace log is ordered
(rpl.md §12.3).

The dairy constraint does not mention the frame, so it is session-wide and still
applies to later recipes. The onion constraint is scoped with `~:`: it is checked
while `:dairy-detour` is active (or a frame inside it is), and not once
`:dinner` is active again.

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

**ABT proposal.** A user's own correction skips the yield, and
only agent-proposed retractions yield (`retraction(?fact) -: yield!`, see
[Yielding](#yielding)). The reading is that the user's correction is itself the
acceptance.

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
(none when the check holds), not the trace itself.

**Grounding.** [bots/rpl-bot.md](../bots/rpl-bot.md) gap 3; live probe 2 (a
silent check against an inspectable trace); [agent-mck.md](../agent-mck.md),
"The Invisible Architecture".

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

**Not.** A numeric score. A substitute for the trace.

---

## 7. A material guess

**Law.** **ABT proposal.** If a value would change the outcome and the agent
has only a guess for it, the initiative passes to the user. A *default* is a
value the agent uses for a slot the user did not give; a *guess* is a default
the agent has no ground for.

**FOL reading.** *Comment.* An obligation (`rpl.4`) whose right-hand side is
`yield!`.

**Surface.** `guess`, `changes`, `yield!`.

```rpl
guess(?slot, ?value), changes(?slot, ?outcome) -: yield!
```

This is the only McK initiative law, **as an ABT proposal**: ABT's
reading of Bahul's yield examples is that the old yield triggers become plain RPL using
`yield!`; that nothing else of the earlier law survives is also ABT's
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

The law covers only a guess that would change the outcome. This document adds no
fallback for any other, because any fallback would be a step.

**Not.** A fixed number for "a few" options ([`agent.1`](../bootstrap/agent.md)).

---

## 8. Capabilities

**Law.** **ABT proposal.** The agent has capabilities, and they are facts it can
reason over like any other. A method qualified with `-: can(…)` is established
only where the capability holds. A capability can follow from others.

**FOL reading.** *Comment.* Facts and Horn rules. The `-:` qualifier is
Bahul's reading of 13 Nov (22:41), that `A :- B` holds if `C`, with `C` read as a
capability; see [Methods](#methods) for what a false, absent or undetermined `can`
means.

**Surface.** `can`.

```rpl
can(:read)
can(:write)
can(:remember) :- can(:write), can(:read)

%remember(?fact) :- commit(?fact) :- $write(?fact, ".rpl/long-term.log") -: can(:write)
```

`yield!` is not gated: no `can(:yield)` appears anywhere. The agent asks about
its own capabilities with an ordinary query (`% :- can(?c), $json(?c)`).

**Grounding.** Bahul's capabilities ruling, 13 Nov 2026.
[lrpl.md §7](../specification/lrpl.md#7-session-persistence-rpl-memory-files-and-rplrc):
durable output only on hosts that offer it. **Inferred:** the names. The path is
the spec's non-normative example (§7.2).

**Not.** A claim that a missing `can` fact means "cannot" (`fol.5`).

---

## 9. Ground about earlier sessions

**Law.** Something said about an earlier session rests on long-term ground
that is present: the ground the host's advertised reload brings in from the
long-term log
([lrpl.md §7.3](../specification/lrpl.md#73-committing-ground-truth-long-term),
§5.4).
Absence of such a record is not ground (`fol.5`), and residual memory of
another chat is not a record.

**FOL reading.** *Comment.* A partition of what may be cited, reusing
lrpl.md §5.1 and §5.4.

**Surface.** None of its own. Ground is what the host's advertised reload brings
in (lrpl.md §7.3: the long-term log must be stable enough for `$index` or
`$read` to reload "if the host advertises that workflow"). A trace stratum
written with `$write` is a valid `$index` source for a later stratum (lrpl.md
§5.4). ABT's schematic example of the log as an `$index` source, in the bare form
the tutorials use (tutorials 00, 02 and 04):

```rpl
$index(".rpl/long-term.log") -: can(:read)      -- schematic (lrpl.md §5.1)
```

Its rows become facts of the predicates they carry, so the law uses
`locked(?dish)` directly. The call is lazy (lrpl.md §5.0): it is not executed until
a value is required. ABT's note: the specification does not say whether `$index`
carries `-: false` retractions or log order (rpl.md §12.3–12.4).

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
other methods of the goal, such as one that hands back with `yield!` (see
[Yielding](#yielding)), still apply.

**Not.** A claim that model weights are a store. A substitute for the trace.

---

## Yielding

These are plain RPL, not McK laws. Each hands over by using `yield!`. The old
draft listed them as triggers; here each is what the program says. None
interprets the reply at the call site: that is in the instruction behind
`yield!` (ABT's reading of #13 and #28, quoted above).

**A choice or stop point the user set** ("give me a few options, then we will
pick"). The method takes one extra argument, `?options`, which its body binds.

```rpl
options([& ?v]) :- candidate(?v)
%dinner(?dish) :-
  pick(?dish, ?options) :-
    options(?options),
    ?dish = yield!,
    ?dish in ?options
```

**Absent ground, as a method of the goal** (the `recall` method is in law 9).
An example pattern:

```rpl
%recipe(?dish) :- method(?dish) :- ?dish = yield!
```

**Coordination.** Retraction is a coordination step
([`agent.2`](../bootstrap/agent.md)). **ABT proposal:** a retraction the agent
proposes yields, and a user's own correction does not (law 4). A violated
invariant surfaces as `%fail` and the user decides (rpl.md §18.6).

```rpl
retraction(?fact) -: yield!
```

**ABT proposal.** Only the user's turn resolves `yield!`, so the user is the
authority over a retraction without any authority relation.

A reply that is not an answer to the goal does not satisfy the method. A reply of
"stop" is not an answer; it is the user ending the run (§15.6, §18.5).

---

## Memory configuration

McK adds nothing to how this is configured. This section only lists what
[lrpl.md §7](../specification/lrpl.md#7-session-persistence-rpl-memory-files-and-rplrc)
says, so laws 8 and 9 have something to cite. The files exist only on **hosts
that give durable file output** (at minimum `$write`); core LRPL does not
require a filesystem. The words *should*, *may* and *must* are the
specification's. §7 uses the word "memory".

| Part | What the specification says | Host-defined |
| --- | --- | --- |
| **Long-term log** (§7.1, §7.3) | Long-term memory **is** an append-only record of ground truths: fully grounded facts and constraints (rpl.md §12), traces, stable conclusions. Each committed line is one append to a single tail-only log; earlier lines are never rewritten. When the agent can write files it **should** append newly established ground truths as they become traces. It **must not** put intermediate or unrealised memo-only state in it. | Path (e.g. `.rpl/long-term.log` or `.rpl/ground.ndjson`). Encoding (NDJSON, EDN, or one RPL sentence per line), which **must** be stable enough for `$index` or `$read` to reload in a later session if the host advertises that workflow. |
| **Short-term stores** (§7.1, §7.4) | Short-term memory **holds** intermediate material: open constraint checks, partial memo state ([§3](../specification/lrpl.md#3-constraint-memos)), candidate worlds not yet realised, scratch derivations. When the agent can write files it **should** persist constraint and memo intermediates (DNF memos, open invariants, partial bindings) to short-term files under `.rpl`, not to the log. Hosts **may** split these across one or more files and **may** truncate, rotate, merge or discard them when a task completes, a session ends, or satisfactory quiescence settles the bindings. The ground outcomes **should** then be appended to the long-term log. | How files are split (by goal, topic or stratum, e.g. `.rpl/short-term/` or `.rpl/constraints-*.ndjson`). |
| **`.rpl` directory** (§7.2) | Conforming hosts that implement file-backed memory **should** place these artifacts under `.rpl` at the workspace root, or the host's nearest equivalent. The normative requirements are an append-only long-term log and separate short-term store(s), both under `.rpl`. | Exact paths and suffixes. |
| **`.rplrc`** (§7.5) | Hosts **should** read it at the start of every session, before user messages are applied and after the programme loads. Its purpose is to carry **preferences** (tone, defaults, tool choices) and **background knowledge** between sessions without duplicating them in the log. Later traces and user assertions win over it unless the host documents another policy. | Search order (a common rule: workspace root, then documented fallbacks such as the user's home). Format (prose, markdown, EDN/RPL fragments, a structured block), and how it merges into the initial store or metadata. |
| **`$write`** (§5.4, §7.6) | The natural surface for these commits. A trace stratum written with `$write` is a valid `$index` source for a later stratum. Behaviour in §7.1–7.5 **should** hold when file output is available. | Hosts **may** map `$write` targets under `.rpl` automatically or expose explicit paths. |

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
| mck.11 (`session-authority`, `repair-acceptance`) | `agent.2`, and (ABT proposal) only the user's turn resolves `yield!` ([Yielding](#yielding)). |
| mck.12 (`initiative`, `initiative-holder`, `initiative-ceded`, reasons) | `yield!`. Three triggers are plain RPL ([Yielding](#yielding)); the one law proposed in their place is law 7 (ABT proposal). |
| mck.13 (`memory-item`, strata) | lrpl.md §7 ([Memory configuration](#memory-configuration)); law 9. |
| mck.14 | Law 6. |
| mck.15 (correction scope) | Law 4. |
| mck.17 ("forget" records) | rpl.md §12.4: retraction is recorded in the trace log, and the long-term log is append-only (lrpl.md §7.1).  |
| mck.19 (`graph-store`, durability) | The store is the `.rpl` directory or the host's equivalent (lrpl.md §7.2). Provisioning is host-defined. |
| mck.20 (`fact-provenance`, graphs, topics) | Provenance is metadata (rpl.md §11, `:file`, `:user`, `:relation`). A "graph" is the program and its log; the spec has no further concept. |
| mck.21 (composing graphs) | Loading more sentences. The Horn theory is monotonic (`fol.9`); `$read` brings them in (lrpl.md §5.2). |
| mck.22 (topic alignment) | Interpretation: two statements share a reading when their RPL readings unify (logics.md §4.2). |
| mck.23 (composition conflicts) | A violated invariant (`rpl.4`) is `%fail`; candidate worlds are lrpl.md §3 memos; non-monotonic repair is `agent.2` and `-: yield!`. |

Knowledge sharing between stores (Bahul, 12 Nov) therefore has no McK law of
its own here.

---

## Proposed specification additions

Each is a proposed change to the specification. None is made in the specification
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

so that the reply is suspended on and interpreted without being named. `?reply`
is local to the body: the method is the same predicate in both spellings, with the
goal's arguments plus only the extras the body needs. For example,

```rpl
method(?x, ?y) :- $answer @: english(~ picked(?x, ?y))
```

means

```rpl
method(?x, ?y) :- ?reply = $answer, #?reply @: english(~ picked(?x, ?y))
```

The sugar is a general form. It is not applied to `yield!`, whose interpretation
is part of the instruction behind it (see
[Forms used](#yield-consult-and-the-name-notation)).

The reading holds only if the reply fits the pattern, and the pattern binds
`?y`.

### Aliases and safety

Bahul's 13 Nov ruling was that a body variable that only provides an alias is
safe, recorded as the rule that rewriting will always drop the var. **ABT's reading: the 14 Nov
message supersedes that last rule.** His words were "2 needs a little revision"
(#6) and then, verbatim: "Safety isn't a property of
rewriting, but rewriting is a potentially cheap way to know if a variable is an
alias. It's not the only way and it will not always work because the grammar may
not have a form for it. But it's a good pedagogical device to explain why the cars
aren't needed in the args." (typos as written; "cars" is "vars"). So rewriting is
not the criterion: it is a cheap way to see that a variable is an alias, not the
only way, and it may fail where the grammar has no form for it. It stays as a
pedagogical device.

ABT's elaboration of the terms (Bahul has not defined them):

- An **alias** is an lvar that the body binds once, by
  `?v = ASYNC_RELATION` (rpl.md §13.3), and then only passes on within the same
  body. It names a value; it adds nothing else. `?reply` above is one.
- **Rewriting**, as a device, is the move between the sugar form and the
  desugared form: expanding the sugar introduces the alias, and substituting what
  the alias stands for removes it. Where such a substitution exists it shows a
  variable is an alias. It is not the criterion.
- The method arity rule (the goal's arguments plus extras the body binds) does
  not require an alias to appear in the args.

Standard safety already allows variables that occur only in the body
(vision.md, "head variables in body"; see
[vision.md](../vision.md#design-principles)), so a body-only alias needs no
exemption on its own, and no place in the args (Bahul, #6: "why the cars aren't
needed in the args"). The sugar form and the desugared form are one rule.

**Arity.** The sugar form and the desugared form have the same arity, because
`?reply` is body-local.

### The `name!` form (rpl.md §13, §14, Appendix)

Bahul's notation (#21): "Notation var! Is the same as $var()", chosen after
"are we using ! for anything except not?" (#20) and "Negation is fine because of
where I'm going to put it". He liked dropping the `$` ("I didn't like having to
prefix the $ do discarding it with sugar helps", #22). Writing it into the
grammar is **ABT's proposal**. The spelling `LABEL '!'` is ABT's; a postfix
`LABEL '!'` is a tool call with no arguments:

```
TOOL = '$' LABEL '(' [ ARG [ ',' ARG ]* ]? ')'
     | LABEL '!'                      -- same as '$' LABEL '(' ')'
```

So `name!` is `$name()`, a zero-argument async call, and it is valid wherever
`TOOL` is: as a `HEAD`, an `ATOM`, or the `ASYNC-ATOM` of the §13.3 bind sugar
(`?v = name!` is `name! ^:result ?v`). `google-it!` and `config!` are valid
labels, since `NAME` allows hyphens. ABT note: §5.1 already requires spaces
around operators, so `name! = ?x` and `name != ?x` are told apart by the space.

**Specification text that would change (ABT).** Places in rpl.md that say a tool
call is `$name(...)` and would need to include `name!`: §13's prose
("`$name(...)` invokes a **tool**"; `$tool(...)` in the §13 block), §14.1 (Tool
Call Syntax), the Appendix `TOOL` production and the Appendix **Namespaces**
paragraph ("`$name(` … `)` is a tool call"), and §10 "Namespaces in heads"
("**tool** call (`$…`, §14)").

### Nested-call sugar (Bahul's design)

Bahul (#30): "I.e A(B(?c)) is A(?b), ?b = B(?c)". Asked "why didn't you add the
sugar and proiceed?" (#34, 15 Nov 17:40), so it is in this proposal. Everything
below beyond that one equation is **ABT's elaboration**, as marked.

**Desugaring (Bahul's equation; the rest ABT).** A call written as an argument is
replaced, in that position, by a fresh lvar, and a bind of that lvar to the call
is added to the same clause. ABT: calls are lifted innermost first, and left to
right among arguments. `,` is not sequencing (`fol.3`), so the order of the
literals is not semantic.

```rpl
A(B(?c))                                  -- nested
A(?b), ?b = B(?c)                         -- desugared (Bahul, #30)
```

The bind differs by kind of call (ABT's reading). For an **async call** it is the
§13.3 bind sugar (`?b = B(?c)` is `B(?c) ^:result ?b`), which suspends until the
result arrives. For a **relation call** rpl.md §9 (Composition) already gives
the factored form, an lvar argument with a constraint, so the desugared form is
`outer(?r, ?y), ?r -: inner(?x)`, which means the same as the nested
`outer(inner(?x), ?y)`. The two desugarings are not the same mechanism.

**Async calls are covered.** So `$consult(:user, $generate("…"))` is valid, and
means `$consult(:user, ?m), ?m = $generate("…")`. A `name!` thunk is valid as an
argument for the same reason.

**Collections are unchanged.** Calls inside a collection (`[` … `]`, `#` `{` … `}`)
stay disallowed (rpl.md §4); the sugar covers arguments only, not collection
elements.

**Scope of the lifted bind (ABT's reading, a direct consequence).** The bind goes
inside the innermost enclosing scope of the call, not outside it: a `not`, a
disjunct of `|`, a `|…|` cardinality, or `@when(…)`. Lifting it outside would
change the meaning, since the call would then be evaluated unconditionally.

```rpl
not A(B(?c))                              -- nested
not (A(?b), ?b = B(?c))                   -- desugared: the bind stays under not
(A(B(?c)) | D)                            -- nested
((A(?b), ?b = B(?c)) | D)                 -- desugared: the bind stays in its disjunct
```

**Ordering (ABT's reading).** A tool's arguments must be ground at dispatch. The
specification does not state this (rpl.md §13.3 says only that resolved values
are ground), so this is ABT's reading, not a spec rule. Given it, literal order is irrelevant and the data dependency
decides the order: `$consult(:user, ?msg)` waits for `?msg = $generate("…")`
whichever is written first. This narrows the reading of §18.4 step 5 ("Unbound
args → async") for tool arguments: an unbound tool argument is not itself an
async to ask for; the tool waits for the binding.

**Grammar change (ABT proposal).** `ARG` gains `TOOL` as an alternative, and
`TOOL` includes the `LABEL '!'` form of the `name!` entry above:

```
ARG = VAR | LITERAL | COLLECTION | '_' | RELATION | TOOL
```

This sits beside the nested relation call that `ARG` already allows (rpl.md §9)
and the bind sugar of §13.3. No other rule is added.

**ABT's reading, not part of Bahul's design:** a call written as an argument of a
rule head or of a `-:` constraint has its lifted bind join the body literal of that
rule or constraint.

### Uncaptured async results propagate to the head (rpl.md §13, §14)

**Bahul's rule (#33):** "We can say that if an async rule calls an async any
uncaptured result propagates to the head." This resolves how a rule-defined tool
such as `$yield() :- …` gets its `:result`: the result of the `$consult` call in
its body is uncaptured, so it is the `:result` of `$yield()`, and `?v = yield!`
binds it (rpl.md §13.3).

**It overrides rpl.md §14.1 for async rules.** §14.1 shows `$tool(?args)` with
the comment "result discarded". For a call in the body of an async rule, an
uncaptured result is not discarded: it propagates to the head. §14.1's
"discarded" still holds elsewhere (ABT's reading).

"Async rule" and "uncaptured" are Bahul's words (#33). ABT's gloss, and ABT's
word for the dual: a result is *captured* when the call has a `?v = …` bind or a
`^:result …` / `^ ~ {:result …}` metadata match (rpl.md §11, §13.3), and
*uncaptured* otherwise.

### `$consult` and `yield!` (rpl.md §14, lrpl.md §5)

Bahul designed these (#8, #18, quoted under
[Forms used](#yield-consult-and-the-name-notation)). This proposal adds
to the specification:

- `$consult(?agent, ?prompt)` as an async call, next to `$ask` and `$choose`
  (rpl.md §14.2) and `$generate` (lrpl.md §5.3). Its name would be reserved like
  those, so users cannot redefine it (cf. lrpl.md's `STDLIB` rule);
- `yield!` defined from it and from `$generate`, as a rule-defined tool (rpl.md
  §10 allows a tool as a `HEAD`), not as a reserved name.

No change to evaluation order is proposed beyond Bahul's ruling that the yield
case exploits it.

### §17.7 uses a dot that `NAME` does not allow

rpl.md §17.7 shows `file.md#rel` and `%file.md#goal`. In the Appendix,
`LABEL = NAME | NS '#' NAME` and `NAME = [a-z] [a-z0-9\-]*`, so `file.md` is
not a `NAME`. Either the grammar allows a dot in a namespace segment, or §17.7
should drop the extension, or it should say these forms are informal. The
document anchors this proposal uses, `mck.md#19`, are citations, not RPL labels
(they have a dot, and `19` does not start with `a–z`), and they are not GitHub
anchors either.

---

## What this would change in the bot's system prompt

The assembler today loads the **RPL** closure and then
[agent-mck.md](../agent-mck.md) as non-layer material, and a role preamble
tells the bot to make the habits visible
(`scripts/assemble-rpl-bot-prompt.ts`; [bots/rpl-bot.md](../bots/rpl-bot.md)).

If `mck` were taken:

1. **Load the layer after `agent`.** The assembler would append the
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
   the check traces.
   The bot still obeys [`agent.1`](../bootstrap/agent.md).
4. **Set posture and capabilities as facts** at the start of a test run:
   `posture(:test)` and the `can(…)` facts of the host.
5. **Do not add `mck` to `docs/rpl/bootstrap/` or to
   `tests/support/content/bundles.config.ts` in this proposal.** This document stays under
   `docs/rpl/proposals/`.
6. **Probes can later be restated against the surfaces** (for example, expect
   a `yield!` on probe 5, and `confidence(?claim, :none)` on probe 6). That
   restatement is not part of this proposal.
