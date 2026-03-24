#!/usr/bin/env node
"use strict";

/**
 * Stable npm `bin` entry: `node_modules/.bin/brain-trust-mcp` links here and does not
 * change when the bundled file path under `dist/` changes. The real server is the
 * esbuild output in `dist/`.
 */
require("../dist/brain-trust-mcp.js");
