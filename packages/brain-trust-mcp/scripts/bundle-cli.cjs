"use strict";

/**
 * Produce the publishable CJS CLI bundle (npm `bin`).
 * Run from package root: `npm run build` (also `prepack`).
 * Requires workspace `brain-trust-core` built (`dist/`) so imports resolve.
 */

const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const pkgRoot = path.join(__dirname, "..");
const entry = path.join(pkgRoot, "src", "index.ts");
const outDir = path.join(pkgRoot, "dist");
const outfile = path.join(outDir, "brain-trust-mcp.js");

const banner = {
  js: `#!/usr/bin/env node
globalThis.__BT_IMPORT_META_URL__ = require("url").pathToFileURL(__filename).href;
`,
};

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    target: "node20",
    format: "cjs",
    outfile,
    packages: "bundle",
    banner,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
