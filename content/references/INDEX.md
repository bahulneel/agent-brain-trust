# Brain Trust — reference index

Bundled markdown beside each skill’s `SKILL.md` (`references/`). Load **on demand** per [Agent Skills file references](https://agentskills.io/specification#file-references): keep the main skill body light; read a file when its conditions apply.

| File | Load when |
| ---- | --------- |
| [discovery.md](discovery.md) | First time you use this skill or need the discovery protocol |
| [mcp-tools.md](mcp-tools.md) | MCP exposes Brain Trust tools (`list_experts`, `get_expert`, `list_topics`, `list_references`, `get_reference`, …) |
| [cli-assets.md](cli-assets.md) | Skill is used as a zip / you run `brain-trust-cli.js` |
| [dialogue.md](dialogue.md) | Running Grounding inquiry, user Q&A, or confirmation rounds |

**Topics:** the hierarchical expert index lives in **`topics/taxonomy.yaml`** (bundled under `assets/topics/`). Use MCP `get_topic_taxonomy` or CLI `get-topic-taxonomy` before loading experts by subject.

Start with **discovery.md**, then pull **mcp-tools.md** or **cli-assets.md** depending on environment.
