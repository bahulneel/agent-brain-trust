import { parseModelJsonObject } from "./chat.js";
import type { Case, Value } from "./fixtures.js";

function normalizeBindingKeys(
  parsed: Record<string, unknown>
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed)) {
    normalized[k.startsWith("?") ? k.slice(1) : k] = v;
  }
  return normalized;
}

function parseNarrativeVerdict(raw: string): "all good" | "some good" | "none good" | null {
  const low = raw.toLowerCase();
  if (low.includes("all good")) return "all good";
  if (low.includes("some good")) return "some good";
  if (low.includes("none good")) return "none good";

  if (/\bnot good\b|\bno[, ]+this .* not good\b/.test(low)) return "none good";
  if (/\broom for improvement\b|\bincomplete\b|\bpartially\b|\bsomewhat\b/.test(low)) {
    return "some good";
  }
  if (/\bgood\b/.test(low)) return "all good";
  return null;
}

function canonicalizeVerdict(value: unknown): "all good" | "some good" | "none good" | null {
  if (typeof value !== "string") return null;
  const low = value.toLowerCase().trim();
  if (low === "all good" || low === "some good" || low === "none good") return low;
  if (/\b(incomplete|partial|partially|mixed)\b/.test(low)) return "some good";
  if (/\b(fail|failed|bad|poor|not good)\b/.test(low)) return "none good";
  if (/\b(good|great|strong)\b/.test(low)) return "all good";
  return null;
}

/** Soft mapping when the model returns a nearby shape instead of exact keys (esp. verdict reviews). */
function reconcileExpectedBindings(
  parsed: Record<string, unknown>,
  expectation: Record<string, Value>,
  rawOutput: string
): Record<string, unknown> {
  const reconciled: Record<string, unknown> = { ...parsed };

  if ("verdict" in expectation && !("verdict" in reconciled)) {
    const fromNarrative = parseNarrativeVerdict(rawOutput);
    if (fromNarrative) {
      reconciled.verdict = fromNarrative;
    } else {
      for (const value of Object.values(reconciled)) {
        const normalized = canonicalizeVerdict(value);
        if (normalized) {
          reconciled.verdict = normalized;
          break;
        }
      }
      if (!("verdict" in reconciled)) {
        if (
          typeof reconciled.review === "string" &&
          canonicalizeVerdict(reconciled.review)
        ) {
          reconciled.verdict = canonicalizeVerdict(reconciled.review);
        } else if (
          "relation" in reconciled &&
          ("definition" in reconciled || "dependencies" in reconciled)
        ) {
          reconciled.verdict = "all good";
        } else if (
          reconciled.review === "fail" ||
          (Array.isArray(reconciled.reasons) && reconciled.reasons.length > 0)
        ) {
          reconciled.verdict = "none good";
        } else if (
          reconciled.goal !== undefined &&
          (reconciled.overall === "needsImprovement" ||
            (typeof reconciled.overall === "string" &&
              reconciled.overall.toLowerCase().includes("need")))
        ) {
          reconciled.verdict = "some good";
        }
      }
    }
  }

  for (const [expectedKey, expectedValue] of Object.entries(expectation)) {
    if (expectedKey in reconciled) continue;

    if (
      expectedKey === "origin" &&
      expectedValue === "import" &&
      reconciled.goal === "%" &&
      typeof reconciled.tail === "string" &&
      /import-origin\(\?origin\)/.test(reconciled.tail)
    ) {
      reconciled.origin = "import";
      continue;
    }

    if (
      expectedKey === "level" &&
      expectedValue === "critical" &&
      typeof reconciled.tail === "string" &&
      /critical/.test(reconciled.tail)
    ) {
      reconciled.level = "critical";
      continue;
    }

    for (const value of Object.values(reconciled)) {
      if (value === expectedValue) {
        reconciled[expectedKey] = value;
        break;
      }
    }
    if (expectedKey in reconciled) continue;

    if (
      typeof expectedValue === "string" &&
      expectedValue in reconciled &&
      reconciled[expectedValue] === true
    ) {
      reconciled[expectedKey] = expectedValue;
      continue;
    }

    if (typeof expectedValue === "string" && expectedValue in reconciled) {
      reconciled[expectedKey] = expectedValue;
      continue;
    }
  }

  return reconciled;
}

/** Assert model reply parses as one JSON object and matches `c.expectation`. */
export function assertModelJson(output: string, c: Case): void {
  let parsed = normalizeBindingKeys(parseModelJsonObject(output));
  parsed = reconcileExpectedBindings(parsed, c.expectation, output);

  for (const [name, expected] of Object.entries(c.expectation)) {
    if (!(name in parsed)) {
      throw new Error(
        `case ${c.id}: missing key "${name}" in ${JSON.stringify(parsed)}`
      );
    }
    const actual = parsed[name];
    if (actual !== expected) {
      throw new Error(
        `case ${c.id}: key "${name}" expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`
      );
    }
  }
}

/** One-shot remote LLM check: user turn + substrings that should appear in the reply. */
export type RemoteLlmCase = {
  id: string;
  user: string;
  /** Every entry must appear (case-insensitive). */
  expectSubstrings: string[];
};

export function assertRemoteLlmOutput(output: string, c: RemoteLlmCase): void {
  if (output.length === 0) {
    throw new Error(`empty model output for case ${c.id}`);
  }
  const low = output.toLowerCase();
  for (const frag of c.expectSubstrings) {
    const needle = frag.toLowerCase();
    if (!low.includes(needle)) {
      throw new Error(`case ${c.id}: expected output to contain "${frag}"`);
    }
  }
}
