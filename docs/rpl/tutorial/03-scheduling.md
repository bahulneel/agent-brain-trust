# Tutorial: Scheduling and long-work recipes

## Required reading

Read [../README.md](../README.md) through **Then Tighten The Same Prompt**, paying
attention to `serve-target-time` and `meal-prep-brief`. Skim **The Complete
Protocol** so you see how `recipe-step` aggregates into `recipe-steps`.

## What this enhances in the recipe prompt

The README already asks the assistant to respect a target serve time and to work
backward for long waits. Models often:

- **flatten** timing into narrative (“meanwhile…”) without explicit ordering,
- ignore **wall-clock anchors** when the user changes pace mid-session, or
- fail to connect **stages** (prep vs finishing) to the phase vocabulary.

This continuation makes **schedule constraints** explicit without inventing a
full solver—just named facts that must cohere with `recipe-step` ordinals.

## New capability: serve targets and stage hooks

Introduce relations that would make sense as columns if you stored them:

- `serve-target-time(?t)` — already in the README; keep it **grounded** (ISO
  string, or a human label the user and assistant agree to treat as canonical
  for the session).
- `recipe-stage(?ordinal, ?title, ?timeHint)` — larger chunks than a single
  step: “Day before”, “Two hours out”, “Last fifteen minutes”.

Then relate steps to stages only as needed—either by ranges of step ordinals in
prose or with a lightweight predicate such as `step-in-stage(?stepOrdinal,
?stageOrdinal)` if you want maximum auditability.

### Example rules block

```rpl
stages([& ?so ?st ?th]) <- recipe-stage(?so, ?st, ?th)

scheduled-brief(?serve, ?stages, ?steps)
  <- serve-target-time(?serve),
     stages(?stages),
     recipe-steps(?steps)
```

If you do not yet collect explicit stages, omit `recipe-stage` and keep
`scheduled-brief` as `serve-target-time` + `recipe-steps`—still enough to query
“what time pressure you think applies.”

### Query shapes

```markdown
What serve time are you using?
%t(?x) <- serve-target-time(?x)
```

```markdown
List stages you believe apply (ordinal, title).
%st(?rows) <- stages(?rows)
```

When the model’s schedule disagrees with the user’s clock, the bug is often in
underspecified prose (“around dinner”) rather than in RPL mechanics.

### Link to logics (optional)

When “feasibility” is genuinely modal (“if the oven is free by 17:00, this
works”), you may eventually use the patterns in
[../specification/logics.md](../specification/logics.md). This tutorial stays at
**one advanced feature**: explicit time and stage hooks on the same recipe
artifact you already built in the README.

## Where to go next

- **Handoff** when prep spans chats: [04-handoff.md](04-handoff.md)
- **Cook mode** grounding: [01-cook-mode.md](01-cook-mode.md)
