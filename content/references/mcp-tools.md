# Brain Trust MCP tools

When the Agent Brain Trust Cursor plugin (or another client) exposes the **brain-trust** MCP server, `BRAIN_TRUST_RESOURCES` points at the bundled `resources/` tree. Use these tools **before** stuffing long persona text into context manually.

## Listing and reading

| Tool | Purpose |
| ---- | ------- |
| `list_topics` | Whether `topics/index.yaml` exists and its parsed content |
| `get_topic_taxonomy` | Hierarchical taxonomy (`topics/taxonomy/manifest.yaml` + `topics/taxonomy/clades/*.yaml`, or legacy `taxonomy.yaml`): topic nodes; **leaves** have `expert_ids` (same id may appear under multiple leaves) |
| `list_experts` | Expert **ids** (basename without `.md`); roster also in `experts/rost.json` as `id →` markdown |
| `get_expert` | One persona by **id** (e.g. `william-e-byrd`) or path; prefers `rost.json` |
| `get_experts_rost` | Full `{ version, experts: { [id]: markdown } }` for bulk/script use |
| `list_references` | Relative paths under `resources/references/*.md` |
| `get_reference` | Read one reference file by path under `references/` |
| `list_skills` | Pass the plugin `skills/` directory path to list installed skills’ frontmatter |

## Practice

1. **`get_topic_taxonomy`** when you need to navigate by subject; resolve **expert ids** at leaves, then **`get_expert`** (or **`get_experts_rost`** once if you need everyone).
2. Call `list_references` once per session if you need rules not already loaded.
3. `get_reference` for **INDEX.md** first if you need a route map; then fetch only what applies (e.g. **dialogue.md** during Grounding).

## When tools are absent

If MCP is not connected, use the CLI path in [cli-assets.md](cli-assets.md) or workspace file reads of `references/` next to `SKILL.md`.
