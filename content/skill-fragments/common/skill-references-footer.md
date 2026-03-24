## References (load on demand)

Per [Agent Skills: file references](https://agentskills.io/specification#file-references), read files under `references/` next to this skill when their topic applies — avoid loading all of them up front.

- [references/INDEX.md](references/INDEX.md) — which file to open when
- [references/discovery.md](references/discovery.md) — how to list and read bundled rules
- Skill **`draft-experts`** — find experts for one or more topics via the taxonomy (`resolve_topics` / `resolve-topics`; fall back to search/taxonomy browse)

@if plugin|claude-code

- [references/mcp-tools.md](references/mcp-tools.md) — when Brain Trust **MCP** tools are available (`list_experts`, `get_expert`, `list_references`, `get_reference`, `list_topics`, …)

@endif

@if claude-code

- **Claude Code**: plugin skills are namespaced — e.g. `/agent-brain-trust:expert-opinion`. Test locally with `claude --plugin-dir ./dist/agent-brain-trust-claude-plugin` ([plugins](https://code.claude.com/docs/en/plugins)).

@endif

@if skill-zip

- [references/cli-assets.md](references/cli-assets.md) — when using **`node scripts/brain-trust-cli.js`** from this skill directory

@endif

- [references/dialogue.md](references/dialogue.md) — inquiry, confirmations, and moderator dialogue (Grounding and similar)
