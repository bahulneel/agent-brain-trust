# Install prebuilt plugins and skills (no local build)

You do **not** need Node, npm, or a clone of this repository. Download **only** the archive you need—there is no combined “everything” bundle.

## Where to download

**GitHub Releases (best for picking one asset):** [Releases](https://github.com/bahulneel/agent-brain-trust/releases). When maintainers **publish** a release, the workflow attaches separate zip files to that release (picking one download per need):

| Asset | Use it for |
| ----- | ---------- |
| `agent-brain-trust-cursor-plugin.zip` | Cursor (full plugin: skills, MCP wiring, resources) |
| `agent-brain-trust-claude-plugin.zip` | Claude Code as a plugin |
| `<skill-name>.zip` (e.g. `expert-opinion.zip`) | That skill alone, portable |

**Standalone MCP** is no longer attached as `agent-brain-trust-mcp.zip` on new releases — install from **[npm](https://www.npmjs.com/package/@bahulneel/brain-trust-mcp)** instead (see below). Older releases may still include the zip for history.

**CI builds:** [Actions → Release workflow](https://github.com/bahulneel/agent-brain-trust/actions/workflows/release.yml). Pick a run and download **only** the artifact you need:

| Artifact name | Contents |
| ------------- | -------- |
| `agent-brain-trust-cursor-plugin` | Cursor plugin zip (one file) |
| `agent-brain-trust-claude-plugin` | Claude plugin zip (one file) |
| `brain-trust-skill-zips` | All per-skill zips from that build (folder of `.zip` files inside the downloaded artifact) |

GitHub may expire workflow artifacts after a retention period; prefer Releases when you can.

## Cursor (full plugin)

1. Download **`agent-brain-trust-cursor-plugin.zip`** and unzip it. You should get a single top-level folder `agent-brain-trust-cursor-plugin/`. Call its absolute path **`PLUGIN`** below.

2. Ensure the local plugin directory exists:

   ```bash
   mkdir -p ~/.cursor/plugins/local
   ```

3. Symlink the plugin (id `agent-brain-trust`):

   ```bash
   ln -sf "$PLUGIN" ~/.cursor/plugins/local/agent-brain-trust
   ```

   Use the **absolute** path to the unzipped `agent-brain-trust-cursor-plugin` directory for `$PLUGIN`.

4. Register the plugin so the agent discovers it. Merge the following — **do not** remove unrelated keys.

   **`~/.claude/plugins/installed_plugins.json`** — under `plugins`, set `agent-brain-trust@local` to your symlink’s absolute path:

   ```json
   {
     "plugins": {
       "agent-brain-trust@local": [
         {
           "scope": "user",
           "installPath": "/absolute/path/to/.cursor/plugins/local/agent-brain-trust"
         }
       ]
     }
   }
   ```

   **`~/.claude/settings.json`** — enable the plugin:

   ```json
   {
     "enabledPlugins": {
       "agent-brain-trust@local": true
     }
   }
   ```

5. Restart Cursor or **Developer: Reload Window**. Enable the Brain Trust MCP server if you use MCP. The plugin’s **`.mcp.json`** runs the server with **`npx -y`** and a pinned **`@bahulneel/brain-trust-mcp@…`** spec (see [Cursor MCP docs](https://cursor.com/docs/mcp)). The symlink name **`agent-brain-trust`** should still match your layout. If resources fail to resolve, set **`BRAIN_TRUST_RESOURCES`** to your plugin’s `resources/` directory.

## Claude Code (full plugin)

1. Download **`agent-brain-trust-claude-plugin.zip`** and unzip to a folder; call that directory’s absolute path **`PLUGIN`**.

2. **Directory install (no symlink):**

   ```bash
   claude --plugin-dir "$PLUGIN"
   ```

3. **Optional — symlink + registration** (same idea as Cursor): link `~/.cursor/plugins/local/agent-brain-trust-claude` → `$PLUGIN`, then register **`agent-brain-trust-claude@local`** in `installed_plugins.json` and set `enabledPlugins["agent-brain-trust-claude@local"]` to `true`. Reload plugins in Claude Code.

## Standalone MCP (no plugin)

Install from npm ([`@bahulneel/brain-trust-mcp`](https://www.npmjs.com/package/@bahulneel/brain-trust-mcp)):

```bash
npm install -g @bahulneel/brain-trust-mcp
brain-trust-mcp
```

Or run once without a global install:

```bash
npx -y @bahulneel/brain-trust-mcp
```

Point your MCP client at the same command (stdio). The built plugin zips use the same **`npx -y …`** spec in **`.mcp.json`**. For a local clone, **`npm run build`** writes the bundled CLI and **`resources/`** under **`packages/brain-trust-mcp/`** — see [build.md](build.md).

## One skill only (zip)

1. Download **`expert-opinion.zip`** or the **`bt-… .zip`** you want from Releases (or take that file from the **`brain-trust-skill-zips`** CI artifact).

2. Unzip where your agent expects a skill directory (the zip is the skill root: `SKILL.md`, `scripts/`, `assets/`, `references/`).

Each skill zip includes `SKILL.md`, the bundled CLI, `assets/`, and `references/` for discovery and CLI usage.

## Compare: prebuilt vs clone

| | Prebuilt (one zip) | Clone + `npm run build` |
| --- | --- | --- |
| Node / npm | Not required to obtain artifacts | Required |
| Cursor install script | Not used; symlink + JSON as above | `npm run install:cursor-plugin` after build |

If you change content or need validation tooling, use a clone and [build.md](build.md).
