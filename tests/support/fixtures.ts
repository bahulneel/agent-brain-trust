import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { RplCase, RplFixtureKey } from "@test/support/types";

import { bundles } from "./fixtures/bundles.config.js";

export { bundles };

function loadFixtureFile(pathRelativeToRepoRoot: string): RplCase[] {
  const abs = join(process.cwd(), pathRelativeToRepoRoot);
  const raw = readFileSync(abs, "utf-8");
  return JSON.parse(raw) as RplCase[];
}

/** Load and concatenate fixture bundles in declared order. */
export function load(...labels: RplFixtureKey[]): RplCase[] {
  const out: RplCase[] = [];
  for (const label of labels) {
    const files = bundles.byLabel[label];
    for (const relPath of files) {
      out.push(...loadFixtureFile(`${bundles.basePath}/${relPath}`));
    }
  }
  return out;
}

export function buildUserPrompt(c: RplCase): string[] {
  const lines = Array.isArray(c.rpl) ? c.rpl : [c.rpl];
  return [
    ...lines,
    `% <- (${c.output}) ^^ ?result, $json(?result)`,
  ];
}
