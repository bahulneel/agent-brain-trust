# @bahulneel/brain-trust-mcp

Brain Trust MCP server: taxonomy, experts, and references for agent clients.

## Requirements

Node.js 20+.

## Install

```bash
npm install -g @bahulneel/brain-trust-mcp
```

```bash
brain-trust-mcp
```

Or run with npx (no global install):

```bash
npx -y @bahulneel/brain-trust-mcp
```

## Cursor (standalone package)

Merge into user/project `.mcp.json` when installing from npm (not the plugin zip):

```json
{
  "mcpServers": {
    "brain-trust": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@bahulneel/brain-trust-mcp@VERSION"]
    }
  }
}
```

Replace `VERSION` with the release you want (or use a dist-tag).

**Cursor/Claude plugin zips** do not use this npx path. Their generated `.mcp.json` runs **`node`** on the bundled **`scripts/mcp-server.cjs`** and sets **`BRAIN_TRUST_RESOURCES`** to the plugin **`resources/`** directory — via **`${CURSOR_PLUGIN_ROOT}`** (Cursor) or **`${CLAUDE_PLUGIN_ROOT}`** (Claude Code).

## Resources

The server loads bundled `resources/` next to this package unless **`BRAIN_TRUST_RESOURCES`** is set to the absolute path of a `resources/` directory (for example from a Cursor plugin checkout).

## Monorepo / development

This package is developed in [agent-brain-trust](https://github.com/bahulneel/agent-brain-trust). Run **`npm run build`** in this package (or **`npm run build`** at the repo root, which runs Turbo first) to emit **`dist/brain-trust-mcp.js`** (the npm `bin` entry). The root build also materializes **`resources/`** and **`LICENSE`** here for publishing. Cursor/Claude plugin zips include a byte-identical copy of the CLI as `scripts/mcp-server.cjs`. Do not edit generated files by hand.
