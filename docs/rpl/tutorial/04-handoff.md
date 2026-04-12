# Tutorial: Handoff and trace parking

## Required reading

Read [00-recipe-protocol.md](00-recipe-protocol.md) through **Trace hooks for
handoff**. For existential or modal framing (optional below), skim
[../specification/logics.md](../specification/logics.md).

LRPL builtins: [../specification/lrpl.md](../specification/lrpl.md).

## What this enhances in the recipe prompt

Single-chat workflows still end: the user closes the laptop between stages, or
starts “the same” feast in a different client. Without an explicit slice of state,
the next session reinvents **menu identity**, **locked ingredients**, or **how
far cooking progressed**.

This continuation treats a **handoff slice** as data you can write, reload, and
reconcile—mirroring the ERD idea of a slice that **covers** a known stage without
pretending the entire conversational runtime migrated.

## New capability: trace projection + `$write` + `$index`

You already have `recipe-artifact(?candidates, ?title, ?steps, ?parked)` in
[00-recipe-protocol.md](00-recipe-protocol.md). For handoff, project the fields
you are willing to trust across sessions, plus cook-mode anchors if you adopted
[01-cook-mode.md](01-cook-mode.md):

```rpl
handoff-slice(?title, ?phase, ?stepOrdinal, ?stepText, ?serve)
  <- committed-recipe-title(?title),
     current-workflow-phase(?phase),
     current-recipe-step(?stepOrdinal, ?stepText),
     serve-target-time(?serve)
```

(If you have not added `current-recipe-step` yet, drop those positions or
replace with `?stepOrdinal = nil`-friendly alternatives in your own catalog.)

Emit and persist:

```rpl
% <- handoff-slice(?title, ?phase, ?o, ?t, ?serve) ^^ ?slice, $json(?slice), $write(?slice, "handoff-supper.json")
```

In the **next** session’s stratum:

```rpl
$index("handoff-supper.json")
```

…and require the assistant to **read aloud the slice constraints** before
proposing new dishes: title, phase, and current step should agree unless the user
overrides.

### Naming the slice (optional prose)

Add a short instruction in the system prompt: when creating a handoff file,
include a human title like `"Sunday supper — grill stage"` so `$index` rows are
recognizable in issue trackers or notes.

### Logics (optional, one step further)

If you want to separate facts the user **asserted** from facts the assistant
**hypothesized**, compose separate relations and use the logics doc’s guidance on
layering—without blocking readers who only need write/index continuity.

## Where to go next

- Re-anchor cook mode after reload: [01-cook-mode.md](01-cook-mode.md)
- Refresh pantry files between sessions: [02-kitchen-context.md](02-kitchen-context.md)
