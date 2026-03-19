---
name: librarian
description: >-
  Librarian entry point for the Brain Trust: discover topics, experts, references, and
  skills before running BASHES or Writers' Room protocols.
---

## Role

Coordinate discovery: which protocol fits the user, then pull only the bundled material you need (experts, reference rules) using the steps in [references/discovery.md](references/discovery.md).

- Route map: [references/INDEX.md](references/INDEX.md)

@if plugin

### MCP

Use `get_topic_taxonomy`, `list_experts`, `get_expert` / `get_experts_rost`, `list_topics`, `list_references`, `get_reference`, and `list_skills` (pass the plugin `skills/` path) per [references/mcp-tools.md](references/mcp-tools.md).

@endif

@if skill-zip

### CLI

From this skill directory: `get-topic-taxonomy`, `list-experts`, `get-experts-rost`, `list-references`, `get-reference`, … See [references/cli-assets.md](references/cli-assets.md). Requires Node 20+.

@endif

## Chaining

1. Ground what the user needs (BASHES dialectic vs Writers' Room editorial).
2. List and fetch relevant **experts** and **references** (do not preload every file).
3. Hand off to the `bashes` or `writers-room` skill for the full protocol.
