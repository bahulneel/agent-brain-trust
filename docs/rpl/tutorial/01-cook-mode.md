# Tutorial: Cook mode continuity

## Required reading

Read [00-recipe-protocol.md](00-recipe-protocol.md) through **The complete
protocol**, including the branch between `%recipe-session-planning` and
`%recipe-session-cook`. You should
already understand `current-workflow-phase`, `recipe-step`, and how collections
like `recipe-steps` aggregate step facts.

Normative details for lazy tools and traces: [../specification/lrpl.md](../specification/lrpl.md).

## What this enhances in the recipe prompt

The recipe protocol already says: in cook mode, go one step at a time and answer
questions in the context of the **current** step. In practice, models still:

- lose **which ordinal** is “now”,
- reprint the **entire recipe** after a clarifying question, or
- quietly **re-identify** the dish after enough turns.

This continuation makes **active execution state** a first-class fact tied to the
same `committed-recipe-title` you already committed during planning—so
“current step” is not implied only by chat scrollback.

## New capability: explicit current-step bindings

Add unary or binary relations that always say what cook mode is anchored to:

- `active-recipe-title(?title)` — should stay aligned with
  `committed-recipe-title` during cook mode (you can derive one from the other in
  a tightened rules block, or require both to unify on each turn).
- `current-recipe-step($ordinal, $instruction)` — the **one** hands-on or
  attention step the user is meant to execute right now.

Then require that **sidebar questions** update nothing about
`current-recipe-step` unless the user explicitly asks to jump or restart.

### Example tightening (drop-in section)

Add **after** your cook-mode prose, still inside the same protocol document:

```markdown
## Active cook anchor - active-recipe-title($title)

Must match the recipe the user committed before cook mode. If unsure, ask
before advancing.

## Current step - current-recipe-step($ordinal, $instruction)

Exactly one step is current during cook mode. When answering a question, do
not advance this unless the user confirms the step is done.
```

And extend your RPL block:

```rpl
cook-mode-anchored(?title, ?o, ?t)
  <- current-workflow-phase("cook"),
     active-recipe-title(?title),
     committed-recipe-title(?title),
     current-recipe-step(?o, ?t)
```

`cook-mode-anchored` is deliberately redundant: if the model drifts `title`,
the conjunction fails in review or in agent self-check.

### Querying during debugging

```markdown
What step do you treat as current?
%cur(?o, ?t) <- current-recipe-step(?o, ?t)
```

If `?o` jumps backward without user intent, fix the prose that made “helpful
rewrites” sound allowed.

## Where to go next

- Stable **kitchen facts** pulled from outside the chat: [02-kitchen-context.md](02-kitchen-context.md)
- **Serve-time** shaping: [03-scheduling.md](03-scheduling.md)
- **New chat** continuations: [04-handoff.md](04-handoff.md)
