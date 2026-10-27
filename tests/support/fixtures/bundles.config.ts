/**
 * Fixture bundle map only (for `keyof` in types and runtime `fixtures.load`).
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
