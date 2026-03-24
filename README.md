# Agent Brain Trust

Composable [Agent Skills](https://agentskills.io/specification) (`expert-opinion`, `bt-*` workshops/editorial skills), **Cursor** and **[Claude Code](https://code.claude.com/docs/en/plugins)** plugin bundles, and a **Brain Trust MCP** server. Authoring lives under `content/`; TypeScript tooling under `packages/` and `scripts/build.ts`.

## Layout

| Path | Purpose |
| ---- | ------- |
| `content/skills/*.md` | Skill entries: YAML `compose:` (profile, roster, fidelity, …) becomes the initial include env; stripped from built `SKILL.md`. Body uses `@include` + `scripts/compose.ts` (merged env, `{{name}}`, `@repeat roster` … `@endrepeat`, `guest=` → roster) |
| `content/skill-fragments/` | **`profiles/`** (prefix/suffix per variation), **`common/`** (`skill-protocol-body`, persona fidelity, guest/debate/footer), **`fidelity/`** (one room-specific anti-caricature block per profile); roster is CSV in query params |
| `content/topics/` | **Flat folder**: one **`<clade>.yaml` per broad topic space** (top-level `id`/`label`/`children`; leaves list `expert_ids`). Loader merges files (sorted by name) under a synthetic root. Optional legacy **`taxonomy.yaml`**. **`index.yaml`** is not authored here — the plugin build **writes** it under `resources/topics/` from `content/skills/*.md`. Copied into skill `assets/` and plugin `resources/` |
| `content/experts/` | One `.md` per expert (kebab-case from full name); build emits **`rost.json`** (`id` → markdown) for MCP/CLI. Composed via `@include experts/<file>.md` |
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
npm run db:cli        # build packages + run brain-trust-cli from test-skill cwd (no args: discovery help)
# npm run db:cli -- get-expert william-e-byrd
# npm run db:cli -- get-experts-rost
```

[Turborepo](https://turbo.build) runs `brain-trust-db` and `brain-trust-core` builds before the main `tsx scripts/build.ts build` step. Expert/topic **materialization** (copy + `rost.json`) lives in `packages/brain-trust-db` and is reused by the plugin build via `materializeExpertAssets`.

Outputs:

- `dist/agent-brain-trust-cursor-plugin/` — Cursor plugin (`.cursor-plugin/plugin.json`, `skills/`, `resources/`, `.mcp.json`, `scripts/mcp-server.js`)
- `dist/agent-brain-trust-claude-plugin/` — Claude Code plugin (`.claude-plugin/plugin.json`, same `skills/`, `resources/`, `.mcp.json`, `scripts/mcp-server.js`; see [Create plugins](https://code.claude.com/docs/en/plugins))
- `dist/skill-zips/<name>.zip` — one zip per skill (includes `SKILL.md`, `scripts/brain-trust-cli.js`, `assets/`)
- `dist/agent-brain-trust-mcp/` — standalone MCP package (`brain-trust-mcp.js`, `package.json`, `resources/`)

Validate a built skill:

```bash
npx skills-ref validate dist/agent-brain-trust-cursor-plugin/skills/expert-opinion
npx skills-ref validate dist/agent-brain-trust-cursor-plugin/skills/bt-software-systems-workshop
npx skills-ref validate dist/agent-brain-trust-claude-plugin/skills/expert-opinion
npx skills-ref validate dist/agent-brain-trust-claude-plugin/skills/bt-software-systems-workshop
```

Local Claude Code: `claude --plugin-dir ./dist/agent-brain-trust-claude-plugin`. Optional: `npm run install:claude-plugin` symlinks the built Claude plugin and registers it for Claude Code (see script output).

## Requirements

- Node 20+

## Licence

MIT (unless you specify otherwise).
