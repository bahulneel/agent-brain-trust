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

## Cursor

Merge into `.mcp.json`:

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

## Resources

The server loads bundled `resources/` next to this package unless **`BRAIN_TRUST_RESOURCES`** is set to the absolute path of a `resources/` directory (for example from a Cursor plugin checkout).

## Monorepo / development

This package is developed in [agent-brain-trust](https://github.com/bahulneel/agent-brain-trust). Run **`npm run build`** in this package (or **`npm run build`** at the repo root, which runs Turbo first) to emit **`dist/brain-trust-mcp.js`** (the npm `bin` entry). The root build also materializes **`resources/`** and **`LICENSE`** here for publishing. Cursor/Claude plugin zips include a byte-identical copy of the CLI as `scripts/mcp-server.cjs`. Do not edit generated files by hand.
