#!/usr/bin/env node
/**
 * Writes `dist/assets/` (experts + topics + rost.json) from repo `content/` for CLI tests and turbo DB build.
 */
import { cp } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { materializeExpertAssets } from "./index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");
const repoRoot = join(packageRoot, "..", "..");
const contentRoot = join(repoRoot, "content");
const assetsOut = join(packageRoot, "dist", "assets");

await materializeExpertAssets(contentRoot, assetsOut);
console.log("brain-trust-db: materialized", assetsOut);

const testSkillAssets = join(packageRoot, "test-skill", "assets");
await cp(assetsOut, testSkillAssets, { recursive: true, force: true });
console.log("brain-trust-db: copied assets to test-skill/ for CLI smoke tests");
