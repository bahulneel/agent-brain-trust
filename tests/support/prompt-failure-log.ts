import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";

import type { ExpectationScalar, RplCase } from "@test/support/types";

/** Bump when row shape changes. */
export const PROMPT_FAILURE_LOG_VERSION = 1;

export const FAILURE_LOG_PATH = join(
  process.cwd(),
  ".meta",
  "prompt-test-failures.ndjson"
);

export type PromptFailureRow = {
  schemaVersion: typeof PROMPT_FAILURE_LOG_VERSION;
  timestamp: string;
  testFile: string;
  suite: string;
  testName: string;
  model: string;
  caseId: string;
  caseDescription: string;
  expectation: Record<string, ExpectationScalar>;
  received: unknown;
  errorMessage: string;
  userPrompt: string[];
  systemPromptSha256Prefix: string;
};

export function failureLogEnabled(): boolean {
  const v = process.env.PROMPT_TEST_FAILURE_LOG?.trim().toLowerCase();
  if (v === "0" || v === "off" || v === "false") return false;
  return true;
}

function sortKeysDeep(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  const rec = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(rec).sort()) out[key] = sortKeysDeep(rec[key]);
  return out;
}

function sha256Prefix(text: string, len = 16): string {
  return createHash("sha256").update(text, "utf8").digest("hex").slice(0, len);
}

export function appendPromptFailure(row: Omit<PromptFailureRow, "schemaVersion">): void {
  if (!failureLogEnabled()) return;

  const full: PromptFailureRow = {
    schemaVersion: PROMPT_FAILURE_LOG_VERSION,
    ...row,
  };

  const dir = dirname(FAILURE_LOG_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  appendFileSync(
    FAILURE_LOG_PATH,
    `${JSON.stringify(sortKeysDeep(full))}\n`,
    "utf-8"
  );
}

export function buildFailureRow(params: {
  testFile: string;
  suite: string;
  testName: string;
  model: string;
  case: RplCase;
  system: string;
  userPrompt: string[];
  received: unknown;
  errorMessage: string;
}): Omit<PromptFailureRow, "schemaVersion"> {
  return {
    timestamp: new Date().toISOString(),
    testFile: params.testFile,
    suite: params.suite,
    testName: params.testName,
    model: params.model,
    caseId: params.case.id,
    caseDescription: params.case.description,
    expectation: params.case.expectation,
    received: params.received,
    errorMessage: params.errorMessage,
    userPrompt: params.userPrompt,
    systemPromptSha256Prefix: sha256Prefix(params.system),
  };
}
