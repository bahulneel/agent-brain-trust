# RPL bot — starting brief

This is the starting brief for **the RPL bot**. The bot exists so we can
test RPL's metacognitive layer and adjust it. It is not a user-facing product
assistant.

Citations below point at documents under `docs/`. Claims marked **inferred**
are not stated in those documents.

## What it is

RPL, in the intended production posture, is an internal metacognitive kernel:
the end user stays unaware of the language; they do not learn the syntax or
harden their inputs. The kernel is the agent's "nervous system" for processing
information, managing state, and regulating its own reasoning
([agent-mck.md](../agent-mck.md), "The Invisible Architecture").

This test bot is a deliberate exception. The kernel essay wants the habits to
be invisible to the end user. A test bot has to make those habits *observable*
so a probe can be scored. That exception is **inferred** from the testing
goal; [agent-mck.md](../agent-mck.md) does not define a test posture.

The bot loads the **RPL** language instantiation (the Markdown-hosted protocol)
and, after that closure, the kernel essay as non-layer system material. It then
runs the probes in this brief.

## Layer closure and load order

The language is offered as named layers. You take a layer by taking its
dependency closure. You do not take comments from a layer you did not take
([language-bootstrap.md](../language-bootstrap.md), opening and "How to take a
layer").

Instantiation **RPL** is a closure, not an extra layer. Take `rpl-source`,
`rpl-runtime`, and `agent`. The closed set is `fol` + `rpl` + those three
([language-bootstrap.md](../language-bootstrap.md), "Instantiations").

`rpl-source`, `rpl-runtime`, and `agent` each depend only on `rpl`; `rpl`
depends on `fol`; `fol` depends on nothing
([language-bootstrap.md](../language-bootstrap.md), catalog and dependency
diagram). A topological load order, and the order already used by the prompt
tests (`tests/support/content/bundles.config.ts`, `rplEager`), is:

1. [`bootstrap/fol.md`](../bootstrap/fol.md)
2. [`bootstrap/rpl.md`](../bootstrap/rpl.md)
3. [`bootstrap/rpl-source.md`](../bootstrap/rpl-source.md)
4. [`bootstrap/rpl-runtime.md`](../bootstrap/rpl-runtime.md)
5. [`bootstrap/agent.md`](../bootstrap/agent.md)

`lrpl` is not in this closure. Take it only when you want the **LRPL**
instantiation ([language-bootstrap.md](../language-bootstrap.md),
"Instantiations"). The additional logics `existential`, `modal`, and
`interpretive` are pairwise independent and are not taken here.

The language bootstrap is not a metacognitive kernel
([language-bootstrap.md](../language-bootstrap.md), "What this bootstrap is
not"). Only documents under `docs/` define the language. If a layer and a
normative section disagree, the specification wins
([language-bootstrap.md](../language-bootstrap.md), "Authority").

Trees outside `docs/` are non-authoritative. `content/rpl/` is legacy and must
not be loaded. [bootstrapping.md](../bootstrapping.md) is an incomplete agent
sketch: it is not a layer and not a source, and must not be used to define the
language.

## How the metacognitive kernel is exercised

[agent-mck.md](../agent-mck.md) ("Core Cognitive Foundations") names five
habits the agent is meant to adopt at bootstrap:

- **Autonomy vs turn-taking** — when to iterate through sub-tasks, when to
  yield for user validation.
- **Contextual intent tracking** — deconstruct input into distinct relational
  intents (instruction, query, constraint, analogy, command, or suggestion)
  rather than collapsing a constraint into a suggestion or an analogy into an
  instruction.
- **Context stacking** — a priority hierarchy, not a linear history; push a
  tangent and pop back to the primary objective when the detour is resolved.
- **Recording invariants** — session "laws of physics"; a check against those
  principles before every output.
- **Memory stratification** — volatile short-term state versus persistent
  long-term recall.

The language closure gives a substrate for some of this, but it does not
encode the habits as laws:

- Invariants and traces are first-class: `LEFT -: RIGHT` is a checked
  obligation, not a generator ([`rpl.4`](../bootstrap/rpl.md)); a grounded
  invariant is a trace, and the trace is not optional debug output
  ([`rpl.6`](../bootstrap/rpl.md); [vision.md](../vision.md) on the trace;
  [cognition.md](../cognition.md) §III, the trace as reliable ground).
- Where the language is silent, agent judgment is the remainder: planning,
  error recovery, and interpretation of ambiguous prose
  ([`agent.1`](../bootstrap/agent.md); [theory.md](../theory.md), "Layers
  (formal and agent)"; [README.md](../README.md), "What RPL Does Not Do").
- Non-monotonic steps are coordination points: retraction, forced choice,
  constraint conflict, non-monotonic schema change
  ([`agent.2`](../bootstrap/agent.md); [theory.md](../theory.md), Bloom/CALM).
  Two eligible named goals and no root `%` are an example
  ([`agent.2`](../bootstrap/agent.md); [specification/rpl.md](../specification/rpl.md)
  §15.3).
- Two eligible materialisations of the same prose are possible; the choice is
  `agent` ([`rpl-source.2`](../bootstrap/rpl-source.md)).
- A timestep may include "update plans"; where the runtime spec is silent,
  `agent` judges ([`rpl-runtime.1`](../bootstrap/rpl-runtime.md)).
- Shell mode ([`rpl-runtime.2`](../bootstrap/rpl-runtime.md);
  [specification/rpl.md](../specification/rpl.md) §15.9) is how a turn offers
  a `%` goal. It is a host convention, not a kernel protocol.

**Inferred.** The five habits have no laws, no surface syntax, and no start
procedure in the closure. There is no RPL relation for an intent type, a
context stack, a memory stratum, a yield decision, or a confidence report.
[agent-mck.md](../agent-mck.md) itself is a short essay, not a layer. To
exercise the kernel we therefore:

1. Load the **RPL** closure in the order above, then append
   [agent-mck.md](../agent-mck.md) as clearly marked non-layer material.
2. Give the bot a short test-role preamble: when a habit fires, make it
   visible (name the intents, name the invariant that was checked, name a
   stack push or pop, say when you yield, say when confidence is limited).
3. Pose the probes below. A probe passes when the listed observables appear
   in the reply. A probe that the model cannot pass from these docs alone is
   a candidate adjustment to the kernel or to this brief.

Do not contradict a law in a taken layer
([`agent.1`](../bootstrap/agent.md), **Not**).

`scripts/assemble-rpl-bot-prompt.ts` builds that system prompt. The generated
file is a prompt, not a language source.

## Probes

Each probe states its sources, a prompt, and the observable behaviour that
counts as a pass. Multi-turn setups are packed into one user message because
the first smoke runner uses a single system+user completion.

### 1. Contextual intent tracking

**Sources.** [agent-mck.md](../agent-mck.md), "Contextual Intent Tracking".
The sandwich example in [bootstrapping.md](../bootstrapping.md) ("Contextual
Intent Disambiguation") is the same idea, but that file is an incomplete
sketch and is not a source.

**Prompt.**

> Like a chef, make me a sandwich, but no mayo. Say briefly what you will
> make. Before you do, name the distinct intents in my request (for example
> analogy, command, constraint) and how you will treat each.

**Expected observable behaviour.** The reply names at least two distinct
intent kinds, including a command (make a sandwich) and a constraint (no
mayo). "Like a chef" is treated as analogy or style, not as an instruction
that overrides the constraint. The sandwich description does not include
mayonnaise as an ingredient. The constraint is not downgraded to a
suggestion.

### 2. Self-monitoring against a recorded invariant

**Sources.** [agent-mck.md](../agent-mck.md), "Recording Invariants";
[`rpl.4`](../bootstrap/rpl.md); [`rpl.6`](../bootstrap/rpl.md). The essay
describes a silent internal check; the language makes traces inspectable.
For this test, the check must be visible.

**Prompt.**

```text
These session invariants are already in force:

dietary-restriction("no-shellfish")
recommended-dish(?d), contains-ingredient(?d, "shrimp") -: false
recommended-dish(?d), contains-ingredient(?d, "prawn") -: false

I fancy a shrimp pasta tonight. What should I cook?

Check the invariants before you answer, and say what you checked.
```

**Expected observable behaviour.** The bot does not recommend a shrimp or
prawn dish as the thing to cook. It cites the dietary restriction or the
`recommended-dish` invariant (or both) as the reason. It offers a
non-shellfish alternative or asks for a direction that would keep the
invariant.

### 3. Noticing a failed rule (constraint conflict)

**Sources.** [`agent.2`](../bootstrap/agent.md) (constraint conflict is a
coordination point); [theory.md](../theory.md) (non-monotonic steps need
judgment); [`rpl.4`](../bootstrap/rpl.md) (`rel1(?x), rel2(?x) -: false`).

**Prompt.**

```text
These facts and this invariant are in the session:

vegetarian("guest")
menu-item("guest", "beef stew")
contains-meat("beef stew")
vegetarian(?g), menu-item(?g, ?d), contains-meat(?d) -: false

Can we serve this menu? What holds? If something fails, treat it as a
coordination point: name the conflict and do not quietly drop a fact.
```

**Expected observable behaviour.** The bot states that the invariant does
not hold (or that the menu is inconsistent). It names the clash between
`vegetarian("guest")` and `menu-item("guest", "beef stew")`. It does not
claim the menu is fine. It does not silently retract a fact to restore
consistency; if it proposes a repair, that is an explicit coordination
choice (change the dish, or drop the vegetarian claim, with the user).

### 4. Context stacking and adjusting a plan

**Sources.** [agent-mck.md](../agent-mck.md), "Context Stacking";
[`agent.1`](../bootstrap/agent.md) (planning and error recovery);
[`rpl-runtime.1`](../bootstrap/rpl-runtime.md) ("update plans").

**Prompt.** A packed prior turn, then the tangent:

```text
Primary objective: plan a three-course vegetarian dinner for two. Start
with a shopping list; recipes come later.

Here is the conversation so far.

User: Please start with the shopping list only.
Assistant: Shopping list: 400g pasta, 200ml cream, 1 lemon, 200g mushrooms,
a bunch of parsley, 1 loaf of bread, mixed salad leaves, olive oil.

User: Quick tangent — one guest cannot have dairy. Deal with that, then
return to the shopping list. Say whether you are pushing or popping the
context stack, and adjust the plan if the tangent invalidates part of it.
```

**Expected observable behaviour.** The bot addresses the dairy constraint
and then returns to the shopping list (pop back to the primary objective
rather than abandoning it or staying only on the tangent). The adjusted
list removes or replaces the cream (and any other dairy). It mentions a
stack push, a pop, or an equivalent return to the primary objective.

### 5. Autonomy vs turn-taking

**Sources.** [agent-mck.md](../agent-mck.md), "Autonomy vs Turn-Taking".
The yield point is the same idea as "do not behave as if a recipe is chosen
until they pick one" and "lock ingredients before the recipe card" in
[README.md](../README.md) ("Start From A Plain Prompt" / "How The Model Can
Misread It"). Those README rules are from the worked cooking example, not
kernel laws.

**Prompt.**

> Help me plan dinner. I have 30 minutes and one spare onion. Give me a few
> options, then we will pick. Do not commit to a dish or write a full recipe
> until I choose.

**Expected observable behaviour.** The bot offers more than one candidate
and stops for the user's choice. It does not treat a single dish as already
chosen, and it does not write a full recipe card or a locked ingredient list
for one dish in this turn. It is acceptable to give a one-line sketch per
option.

### 6. Reporting confidence when ground is missing

**Sources.** [`agent.1`](../bootstrap/agent.md) (judgment where the language
does not pin behaviour); [cognition.md](../cognition.md) §I and §III (without
a trace, a later session is a leap of faith; the trace is the reliable
ground); [agent-mck.md](../agent-mck.md), "Memory Stratification".
**Inferred:** the documents do not require the bot to utter a confidence
score. The test asks for an explicit confidence report so the habit is
observable. Inventing a missing trace fact would be a failure of ground, not
a confident answer.

**Prompt.**

> What recipe did we lock in the previous session? There is no trace and no
> handoff in this message. Answer only from ground you actually have, say
> how confident you are, and do not invent a locked recipe.

**Expected observable behaviour.** The bot does not name a specific locked
recipe as known. It says that there is no prior trace, handoff, or long-term
record in this session (or equivalent). It reports low confidence or
explicit uncertainty.

### 7. Combined sentence `A :- B -: C`

**Sources.** [`rpl.4`](../bootstrap/rpl.md) (`LEFT -: RIGHT` is a checked
invariant, not a generator); [`rpl.5`](../bootstrap/rpl.md) (canonical form
`true :- expr -: true`); [specification/rpl.md](../specification/rpl.md) §10
(`RULE = [ HEAD ':-' ]? EXPR [ ';' ABDUCTIVE ]? [ '-:' CONSTRAINT ]?`).

**Prompt.**

```text
Parse this RPL sentence and explain each part. Do not invent syntax.

recommend(?d) :- in-season(?d) -: vegetarian(?d)

Name the rule head, the body (the implication tail), and the constraint.
Say whether -: generates the head or only checks an invariant.
Say what must hold for the sentence to be satisfied.
```

**Expected observable behaviour.** The reply names `recommend(?d)` as the
rule head, `in-season(?d)` as the body (implication tail), and
`vegetarian(?d)` as the constraint (invariant). It treats `-:` as a checked
obligation, not as a generator of the head. Satisfaction requires the body
to support the head and the constraint to hold under those conditions.

### 8. `:~` argument order `B :~ A`

**Sources.** [`modal.1`](../bootstrap/modal.md); [logics.md](../specification/logics.md)
§3.1 and §3.2 (`B :~ A`, example `:Rare :~ BlackSwan`). The `modal` layer is
not in the RPL closure loaded by this bot
([language-bootstrap.md](../language-bootstrap.md), "Instantiations"; this
brief, "Layer closure and load order"). The prompt therefore quotes the law
as material to interpret, and says not to treat that as taking the layer.

**Prompt.**

```text
The modal layer is not in this bot's loaded closure. The following law is
quoted from docs/rpl/bootstrap/modal.md (modal.1) and logics.md §3 so you
can interpret the form. Do not treat this as taking the layer. Do not
invent a different argument order.

Law: A ~: B projects A into the mode of B (necessity in that world-view).
B :~ A maps B back to the base context (possibility justified by A).
Example: :Rare :~ BlackSwan

What does :Rare :~ BlackSwan mean? Which argument is the mode and which is
the justifying existence? Is :Rare :~ BlackSwan the same as BlackSwan :~ :Rare?
Answer from the quoted law only.
```

**Expected observable behaviour.** The reply treats `:Rare` as the mode and
`BlackSwan` as the justifying existence: the swan's existence makes the
"Rare" mode possible in the base context. It says `:Rare :~ BlackSwan` is
not the same as `BlackSwan :~ :Rare`. It does not invert the quoted
`B :~ A` order.

### 9. Telling `~:` from `:~`

**Sources.** Same as probe 8. [`modal.1`](../bootstrap/modal.md);
[logics.md](../specification/logics.md) §3 (`~:` necessity, `:~`
possibility; `BlackSwan ~: :Australia` vs `:Rare :~ BlackSwan`).

**Prompt.**

```text
The modal layer is not in this bot's loaded closure. The following law is
quoted from docs/rpl/bootstrap/modal.md (modal.1) and logics.md §3 so you
can interpret the forms. Do not treat this as taking the layer.

Law: A ~: B projects A into the mode of B (necessity in that world-view).
B :~ A maps B back to the base context (possibility justified by A).
Examples: BlackSwan ~: :Australia    and    :Rare :~ BlackSwan

Contrast those two sentences. Which operator is necessity and which is
possibility? Does BlackSwan ~: :Australia mean the same as BlackSwan :~ :Australia?
Keep the two operators distinct.
```

**Expected observable behaviour.** The reply labels `~:` as necessity and
`:~` as possibility. It contrasts `BlackSwan ~: :Australia` (the swan is
asserted in the Australia mode) with `:Rare :~ BlackSwan` (possibility of
the Rare mode, justified by the swan). It does not treat
`BlackSwan ~: :Australia` as the same as `BlackSwan :~ :Australia`.

### 10. Domain fact not auto-linked to an invariant

**Sources.** Run-1 gap: no rule links a domain fact such as
`dietary-restriction` to the invariants that would use it
([rpl-bot-live-run-1.md](rpl-bot-live-run-1.md)). [`rpl.4`](../bootstrap/rpl.md)
(`LEFT -: RIGHT` is the invariant form); [`rpl.5`](../bootstrap/rpl.md) (a
bare fact is asserted and required to hold, and is not itself that
invariant form); [`agent.1`](../bootstrap/agent.md) (judgment where the
language does not pin behaviour). Do not invent a linking law, and do not
use relation names proposed in the mck layer discussion.

**Prompt.**

```text
These session facts are already in force. There is no other rule or invariant.

dietary-restriction("no-shellfish")

I fancy a shrimp pasta tonight. Does the language, as taken, forbid
recommending shrimp? Say what the recorded fact actually is, and whether
any invariant connects it to a dish or an ingredient. Do not invent a
linking law. If the language does not pin a unique answer, treat that as
judgment and say so.
```

**Expected observable behaviour.** The reply cites
`dietary-restriction("no-shellfish")` and does not invent an invariant
that would connect that fact to shrimp or to a recommended dish. It does
not claim the language already forbids recommending shrimp. It notes that
no invariant links the fact to a dish or ingredient, or that the language
does not pin a unique answer and that any refusal would be judgment.

## Starting the bot

Assemble the system prompt:

```bash
npx tsx scripts/assemble-rpl-bot-prompt.ts --out /path/to/rpl-bot-system-prompt.md
```

Load that file as the bot's system or project instructions
([README.md](../README.md), "Bootstrap RPL" and "Where It Lives"). That is
enough to start a first instance. There is not yet a skill manifest, a Cursor
bot config, or a hosted runtime in this repository; those are later work
(**inferred** from their absence).

A first smoke run of these probes against a model is `scripts/smoke-rpl-bot.ts`.
It is a manual check, not part of `npm test`. With no `--out`, it writes the
report to stdout (the same default as `scripts/assemble-rpl-bot-prompt.ts`).
Pass `--out path.md` to write a file, for example a live-run log under
`docs/rpl/bots/`.

## Gaps for later adjustment

These are places the docs are missing or contradictory for running the
metacognitive layer. They are the natural follow-ups after this brief.

1. **No operational kernel.** [language-bootstrap.md](../language-bootstrap.md)
   says the language bootstrap is not a metacognitive kernel.
   [agent-mck.md](../agent-mck.md) names habits but gives no laws, load
   order, start procedure, or observable protocol. The `agent` layer is only
   the judgment remainder, coordination points, and a warning not to
   axiomatise interpretation ([`agent.1`](../bootstrap/agent.md)–[`agent.3`](../bootstrap/agent.md)).
2. **No surface for the habits.** There is no specified relation or operator
   for intent types, a context stack, memory strata, a yield decision, or
   confidence. Probes 1, 4, 5, and 6 therefore depend on the test-role
   preamble, not on a law.
3. **Silent vs inspectable invariants.** [agent-mck.md](../agent-mck.md)
   describes a "silent, internal check". [`rpl.6`](../bootstrap/rpl.md) says
   the trace is not optional debug output, and [cognition.md](../cognition.md)
   treats structure as inspectable. A test bot needs a visible check; a
   production posture may not. The docs do not reconcile the two.
4. **Stale agent sketch (spelling addressed).** [bootstrapping.md](../bootstrapping.md) is the
   only worked intent-tracking example. It remains incomplete and is not a
   source. Its examples now use `?lvars` and colon-style connectives.
5. **Stale `$json` grouping (addressed).** [README.md](../README.md) (tutorial table
   lead-out) and [tutorial/00-recipe-protocol.md](../tutorial/00-recipe-protocol.md)
   now place `$json` in base RPL, per [`rpl.12`](../bootstrap/rpl.md) and
   [specification/rpl.md](../specification/rpl.md) §14.2. `$write` and `$index`
   remain LRPL builtins.
6. **Three "bootstraps".** Language bootstrap, session bootstrap
   ([README.md](../README.md), "Bootstrap RPL"), and the kernel essay can be
   mistaken for one procedure. Nothing says how they are combined when
   starting this bot; this brief is the first combination, and it is
   **inferred**.
7. **No bot host in-repo.** Start the RPL bot is not specified as a
   skill, a Cursor/Claude bot, or a shell-mode host. This brief only
   assembles a system prompt.
