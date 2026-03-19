# Agent Brain Trust

Composable [Agent Skills](https://agentskills.io/specification) (BASHES, Writers' Room, Librarian), a **Cursor plugin** bundle, and a **Brain Trust MCP** server. Authoring lives under `content/`; TypeScript tooling under `packages/` and `scripts/build.ts`.

## Layout

| Path | Purpose |
| ---- | ------- |
| `content/skills/*.md` | Skill entries (YAML frontmatter + `@include` + `@if plugin` / `@if skill-zip`) |
| `content/skill-fragments/` | Shared markdown fragments; suite bodies may `@include` a single file that lists further `@include` chains (personas, guest protocol, debate tail) |
| `content/topics/` | Topic index (`index.yaml`) copied into skill `assets/` and plugin `resources/` |
| `content/experts/` | One `.md` per expert (kebab-case from full name); build emits **`rost.json`** (`id` → markdown) for MCP/CLI. Composed via `@include experts/<file>.md` |
| `content/topics/taxonomy.yaml` | Hierarchical topic tree; **leaves** list `expert_ids` (experts indexed by topic; ids refer to `rost` / `.md` basenames) |
| `content/references/` | General rules (discovery, MCP/CLI usage, dialogue); copied to `references/` next to each built `SKILL.md` and to `resources/references/` for MCP ([file references](https://agentskills.io/specification#file-references)) |
| `packages/brain-trust-core` | Discovery helpers + CLI bundled into every skill |
| `packages/brain-trust-db` | Taxonomy validation + `materializeExpertAssets` + `dist/assets` for local CLI tests |
| `packages/brain-trust-mcp` | MCP server (stdio) |
| `turbo.json` | `turbo run build` compiles workspace packages before the plugin build |
| `scripts/build.ts` | Compose markdown, esbuild bundles, plugin + zips + MCP dist |

## Commands

```bash
npm install
npm run validate      # quick checks
npm run build         # turbo (brain-trust-db + brain-trust-core) then Cursor plugin / zips / MCP
npm run db:build      # taxonomy validation + materialize `packages/brain-trust-db/dist/assets` + `rost.json`
npm run db:test       # build packages + smoke-test roster/taxonomy via brain-trust-core
npm run db:cli        # build packages + run brain-trust-cli from test-skill cwd (default: list-experts)
# npm run db:cli -- get-expert william-e-byrd
# npm run db:cli -- get-experts-rost
```

[Turborepo](https://turbo.build) runs `brain-trust-db` and `brain-trust-core` builds before the main `tsx scripts/build.ts build` step. Expert/topic **materialization** (copy + `rost.json`) lives in `packages/brain-trust-db` and is reused by the plugin build via `materializeExpertAssets`.

Outputs:

- `dist/agent-brain-trust-cursor-plugin/` — Cursor plugin (`.cursor-plugin/plugin.json`, `skills/`, `resources/`, `.mcp.json`, `scripts/mcp-server.js`)
- `dist/skill-zips/<name>.zip` — one zip per skill (includes `SKILL.md`, `scripts/brain-trust-cli.js`, `assets/`)
- `dist/agent-brain-trust-mcp/` — standalone MCP package (`brain-trust-mcp.js`, `package.json`, `resources/`)

Validate a built skill:

```bash
npx skills-ref validate dist/agent-brain-trust-cursor-plugin/skills/bashes
```

## Requirements

- Node 20+

## Licence

MIT (unless you specify otherwise).
