# Discovering and reading references

## Layout

- Paths are **relative to the skill directory** (the folder that contains `SKILL.md`), matching the [Agent Skills spec](https://agentskills.io/specification#file-references).
- Example: `references/INDEX.md`, `references/mcp-tools.md`.

## Protocol

1. **List** what exists: use MCP `list_references` (plugin) or run `node scripts/brain-trust-cli.js list-references` (skill zip) from the skill root.
2. **Choose** files whose descriptions in [INDEX.md](INDEX.md) match your current capabilities (MCP vs CLI, need for dialogue rules, etc.).
3. **Read** with MCP `get_reference` with the path returned by `list-references`, or open the file from the workspace / read tool using the relative path above.
4. **Do not** load every reference up front — progressive disclosure saves context. Load **dialogue.md** when running inquiry phases; **mcp-tools.md** only when those tools are available.

## Experts vs references

- **`references/`** — general rules (tools, dialogue, discovery).  
- **`assets/experts/`** (and plugin `resources/experts/`) — **full roster**: `rost.json` is `{ version, experts: { [id]: markdown } }` for scripts/MCP; one `*.md` per figure remains for authoring (id = basename without `.md`). **`assets/topics/`** — prefer the **rooted** tree (`root/topic.yml` + branch `topic.yml` + leaf `*.yml`); legacy flat clades (`*.yaml`) and monolithic `taxonomy.yaml` still load. Each **leaf** may list **`expert_ids`** (many experts can share a leaf). Use **`topics-search.json`** + MCP **`search_topics`** or CLI **`search-topics`** for fuzzy lookup by label, id, aliases, and keywords. Resolve personas by **id**, not by suite.
