# Discovering and reading references

## Layout

- Paths are **relative to the skill directory** (the folder that contains `SKILL.md`), matching the [Agent Skills spec](https://agentskills.io/specification#file-references).
- Example: `references/INDEX.md`, `references/mcp-tools.md`.

## Protocol

1. **Draft experts from the task** — Prefer MCP **`resolve_topics`** or CLI **`resolve-topics`** with a few short task phrases (`merge`, `intersect`, or `converge`). If hits are weak or you need to browse, fall back to **`search_topics`** / **`search-topics`**, then **`get_topic_taxonomy`**. Skill **`draft-experts`** documents the workflow and output shape for topic → expert id resolution.
2. **List** what exists: use MCP `list_references` (plugin) or run `node scripts/brain-trust-cli.js list-references` (skill zip) from the skill root.
3. **Choose** files whose descriptions in [INDEX.md](INDEX.md) match your current capabilities (MCP vs CLI, need for dialogue rules, etc.).
4. **Read** with MCP `get_reference` with the path returned by `list-references`, or open the file from the workspace / read tool using the relative path above.
5. **Do not** load every reference up front — progressive disclosure saves context. Load **dialogue.md** when running inquiry phases; **mcp-tools.md** only when those tools are available.

## Experts vs references

- **`references/`** — general rules (tools, dialogue, discovery).  
- **`assets/experts/`** (and plugin `resources/experts/`) — **full roster**: `rost.json` is `{ version, experts: { [id]: markdown } }` for scripts/MCP; one `*.md` per figure remains for authoring (id = basename without `.md`). **`assets/topics/`** — prefer the **rooted** tree (`knowledge-work/topic.yml` + branch `topic.yml` per subdirectory + leaf `*.yml`; node **ids** come from directory names and leaf filenames, not from YAML); legacy flat clades (`*.yaml`) and monolithic `taxonomy.yaml` still load. Each **leaf** may list **`expert_ids`** (many experts can share a leaf). Use **`topics-search.json`** with MCP **`resolve_topics`** / **`search_topics`** (or CLI **`resolve-topics`** / **`search-topics`**): **`resolve_*`** for fast multi-query resolution; **`search_*`** for catch-all progressive discovery. Resolve personas by **id**, not by suite.
