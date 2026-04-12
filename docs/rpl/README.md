# Relational Prompt Language (RPL)

RPL is a Markdown-embedded reasoning framework with associated logic for
structuring how an LLM reasons about user requests in an abstract, inspectable
way. Instead of relying only on highly tuned prose and then guessing what the
model inferred, you can declare explicit relations, goals, and constraints so
reasoning state is easier to inspect, question, and improve.

## Document map

| Document | Role |
|----------|------|
| [motivation.md](motivation.md) | Problem framing and language overview (why RPL, how to read it) |
| [scope.md](scope.md) | Boundaries, `?` vs `$`, use cases, document index |
| [theory.md](theory.md) | Bloom, CALM, monotonicity, formal vs agent layer |
| [vision.md](vision.md) | Central ideas, trace, lazy extension summary, design principles |
| [specification/rpl.md](specification/rpl.md) | Normative base spec: syntax, semantics, runtime, grammar |
| [specification/lrpl.md](specification/lrpl.md) | Normative LRPL delta (lazy expressions, memos, stdlib) |
| [specification/logics.md](specification/logics.md) | Additional logics: existential, modal, interpretive (`<@`, `@>`) |
| [tutorial/](tutorial/) | Continuations of the worked example (cook mode, kitchen context, scheduling, handoff) |

The sections below walk through one **worked example**: a single-chat
**recipe-building and cooking** prompt that starts as ordinary Markdown, gets
misread in predictable ways, then becomes more reliable as you layer in
relational structure. **Bootstrapping** is turning RPL on in **system or
project** instructions so Markdown in scope **materialises** as RPL; relation
heads on the task prompt appear only where a named fact addresses a concrete
failure mode. Relation names stay concrete
(who/when/what) rather than vague validators—see
[content/rpl/rpl.md](../../content/rpl/rpl.md) on arity and subject–value facts.
They are not a substitute for the specifications.

---

## Start From A Plain Prompt

Start with a complete prompt for a real task, not an isolated line item.

Here is a plausible system prompt for helping a home cook **plan and execute**
a meal in one conversation: explore options, refine for their kitchen, lock
ingredients, publish a readable recipe card, then optionally enter stepwise cook
mode.

````markdown
# Collaborative Recipe Session

You are helping a home cook plan and execute a meal in this single chat. The
cook may need clear steps, small chunks of information, and explicit checkpoints
rather than long unstructured paragraphs.

## Explore Before Committing

Before you commit them to a dish or a final ingredient list, be explicit about
which stage of this workflow you are using.

Offer a small set of candidate dishes that fit what they have said so far (time,
effort, diet, vibe). Do not behave as if a recipe is chosen until they pick one.

## Refine With Equipment And Process

Ask what equipment and techniques they are willing to use. Adjust the leading
candidates; drop ones that clash with their kitchen or patience level.

## Lock Ingredients Before The Recipe Card

Agree the ingredient list with approximate quantities before you write the full
recipe. Flag substitutions only after they confirm the list.

## Recipe Card Overview

Produce a classical recipe shape: yield, ingredients, numbered steps with times
and sensory cues where it helps. Warn before steps that are easy to get wrong
or hard to undo.

## Cook Mode Only When They Ask

When they explicitly enter cook mode, go one step at a time. Passive reminders
(oven preheating while something rests) are fine; do not start two hands-on steps
at once. If they interrupt with a question, answer in the context of the
**current** step without restarting the whole plan.

## Scheduling

If they give a target serve time or pacing constraint, respect it. Work backward
for long waits, marinades, or multi-stage prep.

## Tone

Be neutral, precise, and instructional. Avoid dumping everything at once.
Group related tasks. Prefer a short warning over silently “fixing” a risky move.
````

This is already a meaningful process. It names workflow stages, requires
turn-taking, and commits to specific output shapes (candidates, locked
ingredients, numbered steps).

---

## How The Model Can Misread It

A model can still abuse or misread that prompt in ways that show up in real
cooks’ chats:

- It may **jump to a full recipe** during “explore” and tacitly treat a
  candidate as chosen—**recipe identity drifts** from what the user thinks is
  locked in.
- It may **collapse several candidates into one “best” dish** without a clear
  selection event.
- It may **skip or compress ingredient lockdown** and “helpfully” rewrite the
  list while drafting steps.
- In cook mode it may **ignore the numbered-step format**, paste the whole
  recipe again, or **lose track of the current step** while answering a sidebar
  question.
- It may **forget pantry, equipment, or serve-time constraints** unless the
  user repeats them—there is no stable **kitchen context** or **schedule
  anchor** in the reasoning surface.
- If the user switches to a fresh chat later, it may **lose where this session
  sits** inside a longer feast prep—**handoff** context vanishes.

This is where RPL starts to help. It does not replace the prose. It gives the
model an inspectable reading of what the prose is already trying to say—phases,
commitments, collections, and outputs—using relations that sound like rows you
could put in tables: a step **has** an ordinal and text, a session **targets**
a serve time, a recipe **locks** ingredient lines.

---

## Bootstrap RPL

**Bootstrapping** means turning RPL on in **system or project** instructions.
That is enough for the agent to treat Markdown in scope as the RPL surface:
structure and prose **materialise** into relations as they are encountered (see
[motivation.md](motivation.md) on prose-first authoring). Shell turns, signatures
on headings, and fenced `rpl` blocks then behave as specified without an extra
“how to read this” layer. For normative detail and examples such as **RPL shell
mode** and `$json`, see [content/rpl/rpl.md](../../content/rpl/rpl.md).

Bootstrapping is not the same as filling the workflow document with relation
heads on day one. Keep the task prompt mostly plain until a section still
misreads; add signatures and rules there first.

---

## Add Relation Heads For Specific Failures

Introduce a signature on a heading—or a small fenced `rpl` block—when the prose
alone keeps misfiring on something you can name. Skip headings that are already
stable; empty ceremony makes the surface noisier without improving behavior.

### Example: phase drift

If the model **jumps phases** or loses track of which stage applies, anchor
**workflow phase** first. Leave “Explore”, “Refine”, and the rest as ordinary
headings until you need more structure there.

````markdown
# Collaborative Recipe Session - % <- recipe-session(?phase)

You are helping a home cook plan and execute a meal in this single chat.
…

## Where we are - current-workflow-phase($phase)

Before actions that commit the user (locking ingredients, writing the recipe
card, advancing cook-mode steps), state which workflow phase applies.

```rpl
names-workflow-phase("explore")
names-workflow-phase("refine")
names-workflow-phase("lock")
names-workflow-phase("overview")
names-workflow-phase("cook")

current-workflow-phase($phase)
recipe-session(?phase) <- current-workflow-phase(?phase)
```
````

Closed phase labels plus an explicit **current** phase give the model a single
place to look before it acts—without yet turning every section into a relation.

### Example: ingredient list drift

If the model **skips lock-in** or silently rewrites quantities while drafting
steps, attach a collection-shaped head **only** on the ingredient-lock section
when that failure shows up in traces.

````markdown
## Lock Ingredients Before The Recipe Card - locked-ingredient-line($ingredient, $qtyNote)

Agree the ingredient list with approximate quantities before you write the full
recipe. Flag substitutions only after they confirm the list.

```rpl
ingredient-lines([& ?i ?q]) <- locked-ingredient-line(?i, ?q)
```
````

`locked-ingredient-line($ingredient, $qtyNote)` is a **binary-shaped** record per
line; the rule lifts many rows into one `ingredient-lines` value when you need
“the whole list” in later queries or summaries.

---

## Then Tighten The Same Prompt

When more headings still blur together, align them the same way: one signature
or rule at a time, driven by what still misreads. Do not add new sections or
invent a different workflow—only make the existing prose easier to audit.

### Naming Facts

Give headings signatures so the model has named facts rather than just vibes:

```markdown
## Where we are - current-workflow-phase($phase)

## Explore Before Committing - proposed-candidate-dish($label)

## Refine With Equipment And Process - equipment-note($text)

## Lock Ingredients Before The Recipe Card - locked-ingredient-line($ingredient, $qtyNote)

## Recipe Card Overview - committed-recipe-title($title)

## Cook Mode Only When They Ask - recipe-step($ordinal, $instruction)

## Scheduling - serve-target-time($isoOrHumanLabel)
```

The prose is still the instruction surface. The signatures make its semantics
inspectable.

> **`$`** means "this value must be collected or supplied from outside the
> current deduction." **`?`** means "this value is already available or can be
> derived."

### Declaring The Phase Vocabulary

Closed vocabularies belong in RPL, not buried only in prose:

````markdown
## Phase vocabulary

```rpl
names-workflow-phase("explore")
names-workflow-phase("refine")
names-workflow-phase("lock")
names-workflow-phase("overview")
names-workflow-phase("cook")

current-workflow-phase($phase)
```
````

### Collecting More Than One Thing

The prose asks for **several** candidates, **many** ingredient lines, **many**
steps, and possibly **several** parked questions. That is collection, not a
single value.

Make the collections explicit:

```rpl
candidate-dishes([& ?d]) <- proposed-candidate-dish(?d)
ingredient-lines([& ?i ?q]) <- locked-ingredient-line(?i, ?q)
recipe-steps([& ?o ?t]) <- recipe-step(?o, ?t)
parked-cook-questions([& ?q]) <- parked-cook-question(?q)
```

Now the model has a concrete reading for “more than one thing collected here”
instead of guessing whether one example is enough.

### Composing Facts

The protocol is not only gathering independent facts. It is assembling a state
from which the next phase can run honestly:

````markdown
## Prep brief - meal-prep-brief(?phase, ?candidates, ?locks, ?title, ?serve)
  <- current-workflow-phase(?phase),
     candidate-dishes(?candidates),
     ingredient-lines(?locks),
     committed-recipe-title(?title),
     serve-target-time(?serve)

Before cook mode or before rewriting the recipe card, summarize phase, candidate
set, locked ingredient lines, committed title, and serve-time target.
````

This is where the prompt stops being a pile of headings and becomes an explicit
model of what the cooking flow depends on.

### Stating A Goal With Values

The goal is not just "done". It yields useful values you might inspect, log, or
hand off:

```markdown
# Collaborative Recipe Session - % <- recipe-artifact(?candidates, ?title, ?steps, ?parked)
```

That says the protocol is working toward an output relation whose pieces matter:
what was on the table during ideation, what recipe title was committed, the
numbered steps, and anything parked for later.

### Branching On Outcome

Different phases justify different immediate sub-goals:

```markdown
# Collaborative Recipe Session - % <- %planning | %cookMode

# Planning track - %planning
  <- current-workflow-phase("explore")
  | current-workflow-phase("refine")
  | current-workflow-phase("lock")
  | current-workflow-phase("overview")

Keep candidates, constraints, and locks explicit before cook mode.

# Cook mode track - %cookMode <- current-workflow-phase("cook")

One numbered step at a time; answer questions against the active step only.
```

This is still one chat session. The difference is that the branching is now
declared instead of left to vibes.

---

## Query The Model About The Prompt

RPL also makes the prompt debuggable.

After a run, you can ask the model what it thinks is true, what remains
unresolved, and why it acted the way it did. That helps find bugs in the prose.

Useful questions:

- Which workflow phase do you think we are in?
- Which candidate dishes have been proposed?
- What ingredient lines are locked?
- What do you think the current recipe step is (ordinal and text)?
- Which sentence made you think the user had already chosen a dish?

In shell-style querying, that can become explicit:

USER:
```markdown
What workflow phase do you think is active?
%phase(?p) <- current-workflow-phase(?p)
```

AGENT:
```text
lock
```

Or:

USER:
```markdown
What ingredient lines are locked?
%locks(?lines) <- ingredient-lines(?lines)
```

If the answer surprises you, the bug may be in the prose rather than the model.

---

## The Complete Protocol

Here is the same document with a fuller RPL reading. It is still the same
workflow, only more explicit. Advanced pieces that deserve more room—**stable
step identity in cook mode**, **kitchen context from files**, **serve-time
decomposition**, **trace handoff**—are continued in the [tutorial/](tutorial/)
docs; those concerns are acknowledged here so the design pressure does not
disappear.

The relations below are a small **catalog derived from the cooking-oriented
model** (phases, candidates, a committed recipe, ingredient lines, equipment
notes, steps, serve target, parked questions). Each name is meant to pass a
“table test”: if this were a row, would the columns mean what they say?

````markdown
# Collaborative Recipe Session - % <- %planning | %cookMode

You are helping a home cook plan and execute a meal in this single chat. The
cook may need clear steps, small chunks of information, and explicit checkpoints
rather than long unstructured paragraphs.

## Where we are - current-workflow-phase($phase)

Before actions that commit the user, state which workflow phase applies.

## Explore Before Committing - proposed-candidate-dish($label)

Offer a small set of candidate dishes that fit what they have said so far (time,
effort, diet, vibe). Do not behave as if a recipe is chosen until they pick one.

## Refine With Equipment And Process - equipment-note($text)

Ask what equipment and techniques they are willing to use. Adjust the leading
candidates; drop ones that clash with their kitchen or patience level.

## Lock Ingredients Before The Recipe Card - locked-ingredient-line($ingredient, $qtyNote)

Agree the ingredient list with approximate quantities before you write the full
recipe. Flag substitutions only after they confirm the list.

## Recipe Card Overview - committed-recipe-title($title)

Produce a classical recipe shape: yield, ingredients, numbered steps with times
and sensory cues where it helps. Warn before steps that are easy to get wrong
or hard to undo.

## Cook Mode Only When They Ask - recipe-step($ordinal, $instruction)

When they explicitly enter cook mode, go one step at a time. Passive reminders
(oven preheating while something rests) are fine; do not start two hands-on steps
at once. If they interrupt with a question, answer in the context of the
**current** step without restarting the whole plan.

## Scheduling - serve-target-time($isoOrHumanLabel)

If they give a target serve time or pacing constraint, respect it. Work backward
for long waits, marinades, or multi-stage prep.

## Tone

Be neutral, precise, and instructional. Avoid dumping everything at once.
Group related tasks. Prefer a short warning over silently “fixing” a risky move.

## Parked questions - parked-cook-question($text)

When something should be remembered but should not block the current phase,
park it here.

```rpl
names-workflow-phase("explore")
names-workflow-phase("refine")
names-workflow-phase("lock")
names-workflow-phase("overview")
names-workflow-phase("cook")

current-workflow-phase($phase)

candidate-dishes([& ?d]) <- proposed-candidate-dish(?d)
ingredient-lines([& ?i ?q]) <- locked-ingredient-line(?i, ?q)
recipe-steps([& ?o ?t]) <- recipe-step(?o, ?t)
parked-cook-questions([& ?q]) <- parked-cook-question(?q)

meal-prep-brief(?phase, ?candidates, ?locks, ?title, ?serve)
  <- current-workflow-phase(?phase),
     candidate-dishes(?candidates),
     ingredient-lines(?locks),
     committed-recipe-title(?title),
     serve-target-time(?serve)

recipe-artifact(?candidates, ?title, ?steps, ?parked)
  <- candidate-dishes(?candidates),
     committed-recipe-title(?title),
     recipe-steps(?steps),
     parked-cook-questions(?parked)
```

# Planning track - %planning
  <- current-workflow-phase("explore")
  | current-workflow-phase("refine")
  | current-workflow-phase("lock")
  | current-workflow-phase("overview")

Keep candidates, constraints, and locks explicit before cook mode.

# Cook mode track - %cookMode <- current-workflow-phase("cook")

One numbered step at a time; answer questions against the active step only.
````

The result is still Markdown. But now the model has explicit facts, collections,
goal values, branch conditions, and an auditable interpretation surface—while
still facing the same staged cooking workflow the plain prompt described.

---

## Go Further

Once the core prompt is working in one chat session, LRPL and the additional
logics open up more advanced patterns. **Continue the same recipe prompt** in
small focused branches:

| Tutorial | Capability |
|----------|-------------|
| [tutorial/01-cook-mode.md](tutorial/01-cook-mode.md) | Current step, questions without losing recipe identity |
| [tutorial/02-kitchen-context.md](tutorial/02-kitchen-context.md) | Pantry/equipment context via `$index(...)` |
| [tutorial/03-scheduling.md](tutorial/03-scheduling.md) | Serve-time targets and stage-shaped prep |
| [tutorial/04-handoff.md](tutorial/04-handoff.md) | Trace parking and continuation in a new session |

### Park Progress In A Trace

If you want a user-visible record of current bindings, `$json(?x)` emits NDJSON
to chat:

```rpl
% <- recipe-artifact(?candidates, ?title, ?steps, ?parked) ^^ ?trace, $json(?trace)
```

This is grounded in [specification/lrpl.md](specification/lrpl.md), where
`$json` is a built-in chat-facing observability tool.

### Move That Trace Between Sessions

LRPL also gives you persistence primitives. A trace stratum written via
`$write` is a valid `$index` source for a future stratum:

```rpl
$write(?trace, "supper-trace.json")
$index("supper-trace.json")
```

That makes it possible to park progress in a trace file or frontmatter-like
block, then reintroduce it in a later session without pretending one giant live
runtime is still in flight. Step-by-step cook mode and **handoff slices** are
worked examples in the tutorials.

### Connect External Kitchen Notes To The Session

Because `$index(...)` maps external sources into relation positions, you can tie
a pantry list or equipment inventory file back to the session instead of
restating everything in every message. See
[tutorial/02-kitchen-context.md](tutorial/02-kitchen-context.md).

### Model Narrative Flow Explicitly

The additional logics in [specification/logics.md](specification/logics.md) let
you separate durable trace from transient impulses, and content from narrative
mode.

Examples:

```rpl
true <% recipe-choice(?d)
candidate-dish(?d) <% true
recipe-step(?o, ?t) ~> :hands-on
recipe-step(?o, ?t) ~> :passive
```

Use those tools when lifecycle or narrative context genuinely matters. Do not
add them just because they exist.

---

## Where It Lives

The protocol above is ordinary Markdown. Where you put it determines when and
how it runs. All three patterns below use exactly the same RPL; what varies is
scope and triggering.

**In a single prompt** — paste the protocol into a conversation when you need
structured intake for a one-off task. With RPL enabled for the session, the same
Markdown is read relationally without extra preamble. Useful for ad-hoc
workflows mid-conversation.

**In a project system prompt** — place it in your project's rules or
instructions file. Every conversation in that project inherits the protocol.
Useful for recurring workflows: code reviews, onboarding, **standing recipe
assistants**.

**As an agent skill** — wrap the protocol in a skill manifest (YAML
frontmatter with `name` and `description`) and package it as a `SKILL.md`.
Skill-aware clients (Cursor, Claude Code) load it on demand when a user's
request matches the description. The protocol is portable because it is just
Markdown with structure.

**For multi-phase handoff** — keep each execution bounded to one chat session,
then embed selected trace facts in issue comments or third-party systems for the
next session. Example: park `recipe-artifact` slices and `current-recipe-step`
bindings so a later session does not hallucinate a new menu.

For enterprise boundary guidance, see [enterprise.md](enterprise.md).

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
- **Not an enterprise runtime substrate.** Do not treat RPL as infrastructure
  for long-running mission-critical application control loops.

---

## Further reading

- [specification/rpl.md](specification/rpl.md) — Base specification: syntax, semantics, execution model, grammar.
- [specification/lrpl.md](specification/lrpl.md) — LRPL delta: lazy evaluation, memos, satisfactory quiescence, stdlib.
- [specification/logics.md](specification/logics.md) — Additional logic frameworks: existential, modal, and interpretive operators.
- [tutorial/](tutorial/) — Cook mode, kitchen context, scheduling, handoff.
- [scope.md](scope.md) — Scope, boundaries, and document map.
- [enterprise.md](enterprise.md) — Enterprise boundary: non-fit for long-running systems, fit as HCI with business artifacts.
