import type { bundles } from "../fixtures/bundles.config.js";

export type ExpectationScalar = string | number | boolean | null;

export type RplCase = {
  id: string;
  description: string;
  rpl: string | string[];
  output: string;
  expectation: Record<string, ExpectationScalar>;
};

export type RplFixtureKey = keyof typeof bundles.byLabel;
