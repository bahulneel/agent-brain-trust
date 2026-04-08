import type { ExpectationScalar } from "./rpl-spec.js";

export type PassLogRow = {
  name: string;
  hash: string;
  metadata: Record<string, ExpectationScalar>;
  timestamp: string;
};

export type PassLogIndex = Record<
  string,
  { passed: Set<string>; metadata: Record<string, ExpectationScalar> }
>;
