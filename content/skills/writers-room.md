---
name: writers-room
description: >-
  Writers' Room editorial collective (Knuth, Kernighan, Kidder, Gleick, Sierra, Fowler,
  Feynman, Adams). Use for structured editorial feedback, draft diagnosis, and clarity
  work on technical and explanatory prose.
---

@include writers-room/body.md

## References (load on demand)

Per [Agent Skills: file references](https://agentskills.io/specification#file-references), read files under `references/` next to this skill when their topic applies — avoid loading all of them up front.

- [references/INDEX.md](references/INDEX.md) — which file to open when
- [references/discovery.md](references/discovery.md) — how to list and read bundled rules

@if plugin

- [references/mcp-tools.md](references/mcp-tools.md) — when Brain Trust **MCP** tools are available (`list_experts`, `get_expert`, `list_references`, `get_reference`, `list_topics`, …)

@endif

@if skill-zip

- [references/cli-assets.md](references/cli-assets.md) — when using **`node scripts/brain-trust-cli.js`** from this skill directory

@endif

- [references/dialogue.md](references/dialogue.md) — inquiry, confirmations, and moderator dialogue (Grounding and similar)
