# Build and validation

## Requirements

- Node 20+

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

## Outputs

- `dist/agent-brain-trust-cursor-plugin/` — Cursor plugin (`.cursor-plugin/plugin.json`, `skills/`, `resources/`, `.mcp.json`, `scripts/mcp-server.js`)
- `dist/agent-brain-trust-claude-plugin/` — Claude Code plugin (`.claude-plugin/plugin.json`, same `skills/`, `resources/`, `.mcp.json`, `scripts/mcp-server.js`; see [Create plugins](https://code.claude.com/docs/en/plugins))
- `dist/skill-zips/<name>.zip` — one zip per skill (includes `SKILL.md`, `scripts/brain-trust-cli.js`, `assets/`)
- `dist/agent-brain-trust-mcp/` — standalone MCP package (`brain-trust-mcp.js`, `package.json`, `resources/`)

## Prebuilt distribution

The [Release](https://github.com/bahulneel/agent-brain-trust/actions/workflows/release.yml) workflow produces **separate** archives so users download only what they need:

- **`agent-brain-trust-cursor-plugin.zip`**, **`agent-brain-trust-claude-plugin.zip`**, **`agent-brain-trust-mcp.zip`** — one zip each, uploaded as matching **workflow artifacts** on every run, and attached to the [GitHub Release](https://github.com/bahulneel/agent-brain-trust/releases) when the **`release: published`** event runs (not when you only push a tag).
- **Per-skill zips** — each `dist/skill-zips/<name>.zip` is attached to that same published release; the **`brain-trust-skill-zips`** artifact contains all of them for a given CI run.

**Maintainers:** create the tag, open **Releases → Draft a new release**, choose that tag, then **Publish release**. The workflow builds from that tag and uploads the zips onto the release you just published. **Run workflow** (manual dispatch) only produces Actions artifacts—it does not add files to a Release.

Install steps: [install-prebuilt.md](install-prebuilt.md).

## Validating built skills

```bash
npx skills-ref validate dist/agent-brain-trust-cursor-plugin/skills/expert-opinion
npx skills-ref validate dist/agent-brain-trust-cursor-plugin/skills/bt-software-systems-workshop
npx skills-ref validate dist/agent-brain-trust-cursor-plugin/skills/bt-design-patterns-workshop
npx skills-ref validate dist/agent-brain-trust-claude-plugin/skills/expert-opinion
npx skills-ref validate dist/agent-brain-trust-claude-plugin/skills/bt-software-systems-workshop
npx skills-ref validate dist/agent-brain-trust-claude-plugin/skills/bt-design-patterns-workshop
```

When you add a new `bt-*` skill, add matching `npx skills-ref validate` lines for both Cursor and Claude plugin paths in `.github/workflows/ci.yml`, and extend the examples above in this file if you want a single place to copy commands from.

## Local Claude Code without install script

```bash
claude --plugin-dir ./dist/agent-brain-trust-claude-plugin
```

Optional: `npm run install:claude-plugin` symlinks the built Claude plugin and registers it for Claude Code (see script output).
