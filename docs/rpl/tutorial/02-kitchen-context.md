# Tutorial: Kitchen context and retrieval

## Required reading

Read [../README.md](../README.md) through **Go Further**, so you have seen the
core collections (`candidate-dishes`, `ingredient-lines`, `recipe-steps`) and
the mention of `$index(...)` as a way to pull external material into relation
positions.

LRPL normative text for `$index`: [../specification/lrpl.md](../specification/lrpl.md).

## What this enhances in the recipe prompt

The README tells the assistant to ask about equipment and to lock ingredient
lines. In long threads, users still re-type pantry staples, oven size, or
allergies because **kitchen state** only lived in free prose.

This continuation uses **indexed context** so repeatable facts can live in a
small file (or export) and return as facts in the stratum—without turning the
system prompt into a wall of inventory.

## New capability: `$index` for pantry and equipment

Assume the user maintains (or exports) something like `kitchen-context.json` or
`kitchen-context.edn` with stable rows you map into predicates, e.g.:

- `pantry-stock(?ingredient, ?quantityNote)`
- `equipment-owned(?name)`
- `dietary-constraint(?label)`

The exact shape is project-specific; the teaching point is **one external source
becomes many ground facts** after indexing.

### Example: index then use in rules

```rpl
$index("kitchen-context.json")

# After index facts appear in the stratum, treat them like any other facts:
pantry-aware-lock(?i, ?q)
  <- locked-ingredient-line(?i, ?q), pantry-stock(?i, _)
```

In real prompts you would document the expected JSON keys beside the file—but
keep the protocol **conversation-first**: the file backs the assistant, it does
not replace asking when something is ambiguous.

### Why not paste the whole pantry every time?

Because RPL/LRPL lets you **separate durability (file, trace) from elicitation
(dialogue)**. The README’s `meal-prep-brief` pattern still applies: summarize
what matters for *this* recipe before moving phase.

### Composability with cook mode

When `current-workflow-phase("cook")`, indexed `equipment-owned` may justify
substitutions (“no stand mixer—hand whisk step”). Teach the model to **warn**
when a step assumption conflicts with an indexed equipment fact, mirroring the
README’s “warn before incorrect actions” tone.

## Where to go next

- Time and stages: [03-scheduling.md](03-scheduling.md)
- Carrying indexed + inline facts to another session: [04-handoff.md](04-handoff.md)
