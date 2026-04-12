# Tutorial: Build the recipe protocol

Continue the [README](../README.md) worked example: you already have a plain
Markdown prompt and two **targeted** RPL slices (phase drift, ingredient lock).
This chapter carries the **same document** to a fuller relational reading—more
signatures, collections, a prep summary, named root and branch goals
(`%active-recipe-session`, `%recipe-session-planning`, `%recipe-session-cook`),
and one assembled protocol block—before the focused tutorials refine cook mode,
files, scheduling, and handoff.

## Required reading

Read [../README.md](../README.md) through **Add Relation Heads For Specific
Failures** (both examples).

---

## Then tighten the same prompt

When more headings still blur together, align them the same way: one signature
or rule at a time, driven by what still misreads. Do not add new sections or
invent a different workflow—only make the existing prose easier to audit.

### Naming facts

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

### Declaring the phase vocabulary

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

### Collecting more than one thing

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

### Composing facts

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

### Stating a goal with values

The goal is not just "done". It yields useful values you might inspect, log, or
hand off:

```markdown
# Collaborative Recipe Session - %recipe-artifact(?candidates, ?title, ?steps, ?parked) <- recipe-artifact(?candidates, ?title, ?steps, ?parked)
```

That says the protocol is working toward an output relation whose pieces matter:
what was on the table during ideation, what recipe title was committed, the
numbered steps, and anything parked for later.

### Branching on outcome

Different phases justify different immediate sub-goals:

```markdown
# Collaborative Recipe Session - %active-recipe-session <- %recipe-session-planning | %recipe-session-cook

# Planning track - %recipe-session-planning
  <- current-workflow-phase("explore")
  | current-workflow-phase("refine")
  | current-workflow-phase("lock")
  | current-workflow-phase("overview")

Keep candidates, constraints, and locks explicit before cook mode.

# Cook mode track - %recipe-session-cook <- current-workflow-phase("cook")

One numbered step at a time; answer questions against the active step only.
```

This is still one chat session. The difference is that the branching is now
declared instead of left to implicit reading.

---

## Query the model about the prompt

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

## The complete protocol

Here is the same document with a fuller RPL reading. It is still the same
workflow, only more explicit. **Stable step identity in cook mode**, **kitchen
context from files**, **serve-time decomposition**, and **trace handoff** are
the subjects of the numbered tutorials after this chapter.

The relations below are a small **catalog derived from the cooking-oriented
model** (phases, candidates, a committed recipe, ingredient lines, equipment
notes, steps, serve target, parked questions). Each name is meant to pass a
“table test”: if this were a row, would the columns mean what they say?

````markdown
# Collaborative Recipe Session - %active-recipe-session <- %recipe-session-planning | %recipe-session-cook

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

# Planning track - %recipe-session-planning
  <- current-workflow-phase("explore")
  | current-workflow-phase("refine")
  | current-workflow-phase("lock")
  | current-workflow-phase("overview")

Keep candidates, constraints, and locks explicit before cook mode.

# Cook mode track - %recipe-session-cook <- current-workflow-phase("cook")

One numbered step at a time; answer questions against the active step only.
````

The result is still Markdown. The model now has explicit facts, collections,
goal values, branch conditions, and an auditable interpretation surface—while
still facing the same staged cooking workflow the plain prompt described.

---

## Trace hooks for handoff

If you want a user-visible record of current bindings, `$json(?x)` emits NDJSON
to chat:

```rpl
% <- recipe-artifact(?candidates, ?title, ?steps, ?parked) ^^ ?trace, $json(?trace)
```

See [../specification/lrpl.md](../specification/lrpl.md) for the `$json` contract.

A trace written via `$write` is a valid `$index` source for a later stratum:

```rpl
$write(?trace, "supper-trace.json")
$index("supper-trace.json")
```

[04-handoff.md](04-handoff.md) builds on this pattern for multi-session continuity.

---

## Where to go next

| Tutorial | Capability |
|----------|------------|
| [01-cook-mode.md](01-cook-mode.md) | Current step, questions without losing recipe identity |
| [02-kitchen-context.md](02-kitchen-context.md) | Pantry/equipment context via `$index(...)` |
| [03-scheduling.md](03-scheduling.md) | Serve-time targets and stage-shaped prep |
| [04-handoff.md](04-handoff.md) | Trace parking and continuation in a new session |

Normative LRPL builtins (`$json`, `$write`, `$index`, …): [../specification/lrpl.md](../specification/lrpl.md).
