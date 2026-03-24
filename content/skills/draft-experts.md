---
name: draft-experts
description: >-
  From topics, determine which experts apply. Use this skill when you need to find experts for
  one or more topics.
---

## Role

You **resolve which experts the index associates with the request**. You do not impersonate them, argue positions, or answer the substantive question. You output a **compact, checkable mapping** from the stated topics or task → taxonomy leaf(es) → `expert_ids`, so the caller can `get_expert` or open persona files.

## After the skill loads (operational cues)

- **Several phrases** at once, or one domain that needs disambiguation → prefer **`resolve_topics`** / **`resolve-topics`** with an appropriate strategy (see Fast path).
- **Ids must match the bundled taxonomy**, not an improvised list from general knowledge.
- **Weak or empty fused results** → **`search_topics`** / **`search-topics`**, then **`get_topic_taxonomy`** to browse.

## Fast path (prefer tools)

1. **Explicit ids** — If `expert_id`(s) or a leaf id are already given, validate with `list_experts` / `get_topic_taxonomy` only if needed. Otherwise continue.
2. **`resolve_topics`** — Supply **2–5 short phrases** (topics, nouns, anchors). Choose `strategy`:
   - **`merge`** (default) — vote across phrases; good when each phrase is a partial view of one intent.
   - **`intersect`** — a leaf must rank for **every** phrase; stricter.
   - **`converge`** — merge, then fixed-point refinement from the top hit’s label/keywords until the top id stabilises or the iteration cap.
3. **Stop** — If the best hit is a leaf with `expert_ids` and the path fits the request, **stop** and emit the **output block** (below). Do **not** load `get_experts_rost` for this step.
4. **Fallback** — Weak or empty results → **`search_topics`** with a **shorter** query, then **`get_topic_taxonomy`** to walk branches.

## CLI parity

From a skill zip: `resolve-topics` mirrors MCP strategies (see [references/cli-assets.md](references/cli-assets.md)).

## Output block

Emit once when resolution is done:

- **Request** (one line — topics or task as stated)
- **Queries / strategy** passed to `resolve_topics`, or note that search/taxonomy fallback was used
- **Chosen leaf(es)**: `topic_id`, path labels, `expert_ids`
- **Confidence**: high / medium / low + one sentence
- **Expert ids to load**: ordered list for `get_expert` (or equivalent)

## References

- [references/mcp-tools.md](references/mcp-tools.md) — `resolve_topics`, `search_topics`, `get_topic_taxonomy`, `get_expert`
- [references/discovery.md](references/discovery.md) — progressive disclosure

@if plugin|claude-code

### MCP

`resolve_topics` (multi-query), `search_topics` (broad fuzzy), `get_topic_taxonomy`, `list_experts`, `get_expert` — see [references/mcp-tools.md](references/mcp-tools.md).

@endif

@if skill-zip

### CLI

`resolve-topics`, `search-topics`, `get-topic-taxonomy`, `list-experts`, `get-expert` — [references/cli-assets.md](references/cli-assets.md).

@endif
