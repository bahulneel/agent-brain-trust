# Brain Trust MCP tools

When the Agent Brain Trust Cursor plugin (or another client) exposes the **brain-trust** MCP server, `BRAIN_TRUST_RESOURCES` points at the bundled `resources/` tree. Use these tools **before** stuffing long persona text into context manually.

## Listing and reading

| Tool | Purpose |
| ---- | ------- |
| `list_topics` | Parsed `topics/index.yaml` if present (plugin `resources/` includes a **build-generated** `skills:` list from `content/skills/*.md`; per-skill zips usually have no index file) |
| `get_topic_taxonomy` | Hierarchical taxonomy: **rooted** `topics/knowledge-work/topic.yml` tree when present; otherwise flat `topics/*.yaml` clades merged under a synthetic root, or legacy `taxonomy.yaml`. **Leaves** may list `expert_ids` |
| `search_topics` | Fuzzy search over the topic index (`topics-search.json`): labels, ids, aliases, keywords; returns path context for disambiguation |
| `list_experts` | Expert **ids** (basename without `.md`); roster also in `experts/rost.json` as `id →` markdown |
| `get_expert` | One persona by **id** (e.g. `william-e-byrd`) or path; prefers `rost.json` |
| `get_experts_rost` | Full `{ version, experts: { [id]: markdown } }` for bulk/script use |
| `list_references` | Relative paths under `resources/references/*.md` |
| `get_reference` | Read one reference file by path under `references/` |
| `list_skills` | Pass the plugin `skills/` directory path to list installed skills’ frontmatter |

## Practice

1. **`get_topic_taxonomy`** or **`search_topics`** when you need to navigate by subject; resolve **expert ids** at leaves, then **`get_expert`** (or **`get_experts_rost`** once if you need everyone). Prefer **exact id** when known; use **`search_topics`** as fallback.
2. Call `list_references` once per session if you need rules not already loaded.
3. `get_reference` for **INDEX.md** first if you need a route map; then fetch only what applies (e.g. **dialogue.md** during Grounding).

## When tools are absent

If MCP is not connected, use the CLI path in [cli-assets.md](cli-assets.md) or workspace file reads of `references/` next to `SKILL.md`.
