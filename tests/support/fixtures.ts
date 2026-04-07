import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Value = string | number | boolean | null;

export type Case = {
  id: string;
  description: string;
  rpl: string | string[];
  output: string;
  expectation: Record<string, Value>;
};

/**
 * Fixture aggregation config.
 * `basePath` is repo-relative; bundle values are relative to `basePath`.
 */
export const bundles = {
  basePath: "tests/prompts/rpl/fixtures",
  byLabel: {
    shared: ["shared.json"],
    rpl: ["rpl.json"],
    sourceFormat: ["source-format.json"],
    operatorsAndMatching: ["operators-and-matching.json"],
    goalsMetadataConstraints: ["goals-metadata-constraints.json"],
    prose: ["prose.json"],
    proseQualityJudgement: ["prose-quality-judgement.json"],
    lrpl: ["lrpl.json"],
    lrplAdvanced: ["lrpl-advanced.json"],
    lrplIndexInlineData: ["lrpl-index-inline-data.json"],
  },
} as const;

export type Label = keyof typeof bundles.byLabel;

function loadFixtureFile(pathRelativeToRepoRoot: string): Case[] {
  const abs = join(process.cwd(), pathRelativeToRepoRoot);
  const raw = readFileSync(abs, "utf-8");
  return JSON.parse(raw) as Case[];
}

/** Load and concatenate fixture bundles in declared order. */
export function load(...labels: Label[]): Case[] {
  const out: Case[] = [];
  for (const label of labels) {
    const files = bundles.byLabel[label];
    for (const relPath of files) {
      out.push(...loadFixtureFile(`${bundles.basePath}/${relPath}`));
    }
  }
  return out;
}

export function buildUserPrompt(c: Case): string[] {
  const lines = Array.isArray(c.rpl) ? c.rpl : [c.rpl];
  return [
    ...lines,
    "```rpl",
    `% <- ${c.output}`,
    "```",
    "When writing or completing RPL in your answer, prioritize readability: layout and quoting should make each expression easy to scan. Single- and double-quoted string literals are interchangeable; use whichever reads clearest in context.",
    "Respond with one JSON object only (no prose, no markdown).",
  ];
}
