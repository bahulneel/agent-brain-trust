# Build and validation

## Requirements

- Node 20+

## Commands

```bash
npm install
npm run build:packages   # turbo: all workspace `build` tasks (packages + repo-tooling → dist-tooling/)
npm run build:tooling    # turbo: repo-tooling only (brain-trust-core + brain-trust-db first, then scripts/**/*.ts → dist-tooling/)
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

- `dist/agent-brain-trust-cursor-plugin/` — Cursor plugin (`.cursor-plugin/plugin.json`, `skills/`, `resources/`, `.mcp.json`, `scripts/mcp-server.cjs` — a copy of `packages/brain-trust-mcp/dist/brain-trust-mcp.js`)
- `dist/agent-brain-trust-claude-plugin/` — Claude Code plugin (`.claude-plugin/plugin.json`, same `skills/`, `resources/`, `.mcp.json`, same MCP script copy; see [Create plugins](https://code.claude.com/docs/en/plugins))
- `dist/skill-zips/<name>.zip` — one zip per skill (includes `SKILL.md`, `scripts/brain-trust-cli.js`, `assets/`)
- `dist/prompts/RPL.md`, `dist/prompts/LRPL.md` — composed standalone prompt artefacts built from `content/RPL.md` and `content/LRPL.md`
- `packages/brain-trust-mcp/` — npm  **`npm run build`** in that package (also run via Turbo) writes **`dist/brain-trust-mcp.js`**; the repo root **`npm run build`** step then writes **`resources/`** and **`LICENSE`** beside **`package.json`** for **`npm pack` / `npm publish`**. Not shipped as a GitHub Release zip (consumers use npm).

## Prebuilt distribution

The [Release](https://github.com/bahulneel/agent-brain-trust/actions/workflows/release.yml) workflow produces **separate** archives so users download only what they need:

- **`agent-brain-trust-cursor-plugin.zip`**, **`agent-brain-trust-claude-plugin.zip`** — one zip each, uploaded as matching **workflow artifacts** on every run, and attached to the [GitHub Release](https://github.com/bahulneel/agent-brain-trust/releases) when the **`release: published`** event runs (not when you only push a tag). **MCP** is published to npm on that event via **OIDC trusted publishing** — not as a release zip.
- **Per-skill zips** — each `dist/skill-zips/<name>.zip` is attached to that same published release; the **`brain-trust-skill-zips`** artifact contains all of them for a given CI run.
- **`RPL.md`** and **`LRPL.md`** — each `dist/prompts/*.md` file is uploaded as an individual release asset; the **`brain-trust-prompts`** workflow artifact contains both prompt files for a given CI run.

**Maintainers:** from a clean `develop` branch you can run the project-level Cursor command **`/relase`**, which tells the agent to inspect commits since the last version tag, choose the semver bump, run the `git flow` release steps, bump workspace versions, push branches and tags, and publish the GitHub release for the workflow to populate. You can still create the tag manually and open **Releases → Draft a new release** if you prefer; the workflow builds from that tag and uploads the zips onto the release you publish. **Run workflow** (manual dispatch) only produces Actions artifacts—it does not add files to a Release.

Install steps: [install-prebuilt.md](install-prebuilt.md).

## Tooling (`dist-tooling/`)

TypeScript under [`scripts/`](https://github.com/bahulneel/agent-brain-trust/tree/main/scripts) compiles to committed **[`dist-tooling/`](https://github.com/bahulneel/agent-brain-trust/tree/main/dist-tooling)** via the **[`packages/repo-tooling`](https://github.com/bahulneel/agent-brain-trust/tree/main/packages/repo-tooling)**  its `build` runs `tsc` after **`brain-trust-core`** and **`brain-trust-db`** (Turbo `^build` graph and caching; outputs declared in `packages/repo-tooling/turbo.json`). The root **`tsconfig.json`** is a solution that references `repo-tooling` for `tsc --build`.

Unlike **`dist/`**, **`dist-tooling/` is tracked in git** so tooling can run without a local `tsc`. After editing any `scripts/**/*.ts`, run **`npm run build:tooling`** (or **`npm run build:packages`** / **`npm run build`**) and commit the updated **`dist-tooling/**/*`**. CI runs the same compile and **`git diff --exit-code dist-tooling`** so drift fails the build.

## MCP npm package (maintainers)

- **`npm run pack:mcp`** — full build, then **`npm pack -w @bahulneel/brain-trust-mcp`**.
- **`npm run publish:mcp`** — **`npm publish -w @bahulneel/brain-trust-mcp --access public`**. The release workflow ([`.github/workflows/release.yml`](https://github.com/bahulneel/agent-brain-trust/blob/main/.github/workflows/release.yml)) publishes on **`release: published`** using **[npm trusted publishing (OIDC)](https://docs.npmjs.com/trusted-publishers)** — no long-lived **`NPM_TOKEN`**. On npmjs.com, open **`@bahulneel/brain-trust-mcp` → Settings → Trusted publishing**, add **GitHub Actions** with this repo and workflow filename **`release.yml`** (exact match). Local publishes still use **`npm login`** / a token if you publish by hand.

**Build-time overrides** (plugin `.mcp.json` and default npx spec):

| Variable | Effect |
| -------- | ------ |
| `NPM_MCP_PACKAGE_NAME` | Overrides the **npx** package name in generated plugin `.mcp.json` only; **`packages/brain-trust-mcp/package.json`** `name` is what **`npm publish`** uses. |
| `BRAIN_TRUST_MCP_NPX_SPEC` | Full spec passed to `npx -y` in generated `.mcp.json` (e.g. pin or dist-tag). If unset, defaults to `NPM_MCP_PACKAGE_NAME@` monorepo version from root `package.json`. |

**Contributors:** this repo does **not** ship a project-level Cursor MCP file (avoids duplicating the plugin’s **`npx`** story). After **`npm run build`**, use the **installed plugin** (its **`.mcp.json`**), **`npx -y @bahulneel/brain-trust-mcp@…`**, or add a **user-level** MCP server in Cursor settings if you need to run **`node`** on **`packages/brain-trust-mcp/dist/brain-trust-mcp.js`** with **`BRAIN_TRUST_RESOURCES`** pointing at **`packages/brain-trust-mcp/resources`**.

## Validating built skills

After `npm run build`, validate every composed skill in both plugins:

```bash
npm run validate:skills-ref
```

To check one skill manually:

```bash
npx skills-ref validate dist/agent-brain-trust-cursor-plugin/skills/bt-prompt-engineering-trust
npx skills-ref validate dist/agent-brain-trust-claude-plugin/skills/bt-prompt-engineering-trust
```

CI runs `npm run validate:skills-ref` after the build so new `content/skills/*.md` entries are covered automatically. When you add a panel skill, you still need taxonomy, `expert-opinion.md` cross-links, and the README catalog (see [CONTRIBUTING.md](https://github.com/bahulneel/agent-brain-trust/blob/main/CONTRIBUTING.md)).

## Local Claude Code without install script

```bash
claude --plugin-dir ./dist/agent-brain-trust-claude-plugin
```

Optional: `npm run install:claude-plugin` copies the built Claude plugin into `~/.cursor/plugins/local/` and registers it for Claude Code (see script output). Same for `install:cursor-plugin` — full copy, not a symlink, so discovery works when clients do not follow symlinks (e.g. some macOS setups).
