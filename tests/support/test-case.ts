import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { TestContext } from "vitest";
import hash from "object-hash";
import {
  afterEach,
  beforeEach,
  describe,
  test as baseTest,
} from "vitest";

import { acquireLlmRequestSlot, resolvedLlmApiKey, resolvedLlmModel } from "./chat.js";

/** Bump when assertion/parsing logic changes (invalidates prior passes). */
export const TEST_ASSERT_VERSION = 2;

export type Scalar = string | number | boolean | null;

export type TestResultRow = {
  name: string;
  hash: string;
  metadata: Record<string, Scalar>;
  timestamp: string;
};

export type TestResultIndex = Record<
  string,
  { passed: Set<string>; metadata: Record<string, Scalar> }
>;

export const TEST_RESULTS_LOG_PATH = join(
  process.cwd(),
  ".meta",
  "prompt-test-results.ndjson"
);

const CHAT_TEMPERATURE = 0.1;
const CHAT_MAX_TOKENS = 500;

function isScalar(v: unknown): v is Scalar {
  return v === null || ["string", "number", "boolean"].includes(typeof v);
}

function sortKeysDeep(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  const rec = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(rec).sort()) out[key] = sortKeysDeep(rec[key]);
  return out;
}

function assertRow(raw: unknown): TestResultRow {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("test result log: row must be a JSON object");
  }
  const row = raw as Record<string, unknown>;
  for (const key of ["name", "hash", "metadata", "timestamp"] as const) {
    if (!(key in row)) throw new Error(`test result log: missing field "${key}"`);
  }

  const name = row.name;
  const h = row.hash;
  const metadata = row.metadata;
  const timestamp = row.timestamp;

  if (typeof name !== "string" || name.length === 0) {
    throw new Error("test result log: name must be a non-empty string");
  }
  if (typeof h !== "string" || h.length === 0) {
    throw new Error("test result log: hash must be a non-empty string");
  }
  if (typeof timestamp !== "string" || timestamp.length === 0) {
    throw new Error("test result log: timestamp must be a non-empty string");
  }
  if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error("test result log: metadata must be a plain object");
  }

  const metaOut: Record<string, Scalar> = {};
  for (const [k, v] of Object.entries(metadata)) {
    if (!isScalar(v)) {
      throw new Error(`test result log: metadata "${k}" must be scalar`);
    }
    metaOut[k] = v;
  }

  return { name, hash: h, metadata: metaOut, timestamp };
}

export function testResultLogEnabled(): boolean {
  const v = process.env.PROMPT_TEST_RESULT_LOG?.trim().toLowerCase();
  if (v === "0" || v === "off" || v === "false") return false;
  return true;
}

export function hashDeps(deps: Record<string, unknown>): string {
  return hash(deps, { algorithm: "sha256", encoding: "hex" });
}

export function loadTestResultIndex(): TestResultIndex {
  const index: TestResultIndex = {};
  if (!existsSync(TEST_RESULTS_LOG_PATH)) return index;

  const text = readFileSync(TEST_RESULTS_LOG_PATH, "utf-8");
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      throw new Error(`test result log: invalid JSON on line ${i + 1}`);
    }

    const row = assertRow(parsed);
    const entry =
      index[row.name] ?? (index[row.name] = { passed: new Set<string>(), metadata: {} });
    entry.passed.add(row.hash);
    entry.metadata = { ...entry.metadata, ...row.metadata };
  }

  return index;
}

export function appendPass(row: TestResultRow): void {
  const dir = dirname(TEST_RESULTS_LOG_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  appendFileSync(
    TEST_RESULTS_LOG_PATH,
    `${JSON.stringify(sortKeysDeep(row))}\n`,
    "utf-8"
  );
}

function mergeDeps(
  suiteDeps: Record<string, unknown>,
  testDeps: Record<string, unknown>
): Record<string, unknown> {
  const { __env: _ignore, ...rest } = testDeps;
  return {
    ...suiteDeps,
    ...rest,
    __assertVersion: TEST_ASSERT_VERSION,
    __env: {
      PROMPTS_LLM_MODEL: resolvedLlmModel(),
      chatTemperature: CHAT_TEMPERATURE,
      chatMaxTokens: CHAT_MAX_TOKENS,
    },
  };
}

export class TestResultSession {
  private index: TestResultIndex | null = null;
  private pending: { name: string; hash: string; metadata: Record<string, Scalar> } | null =
    null;
  private readonly suiteDeps: Record<string, unknown> = {};

  load(): void {
    this.index = testResultLogEnabled() ? loadTestResultIndex() : {};
  }

  addDeps(partial: Record<string, unknown>): void {
    Object.assign(this.suiteDeps, partial);
  }

  alreadyPassed(testName: string, deps: Record<string, unknown>): boolean {
    this.pending = null;
    if (!testResultLogEnabled()) return false;

    if (!this.index) this.index = loadTestResultIndex();

    const hashValue = hashDeps(mergeDeps(this.suiteDeps, deps));
    if (this.index[testName]?.passed.has(hashValue)) return true;

    const metadata: Record<string, Scalar> = {
      model: resolvedLlmModel(),
    };
    const gitSha =
      process.env.GITHUB_SHA?.trim() ||
      process.env.CI_COMMIT_SHA?.trim() ||
      process.env.GIT_SHA?.trim();
    if (gitSha) metadata.gitSha = gitSha;

    this.pending = { name: testName, hash: hashValue, metadata };
    return false;
  }

  /** Only `task` is read; extended suites add `expect` / `_local` on full `TestContext`. */
  recordPass(ctx: Pick<TestContext, "task">): void {
    if (!testResultLogEnabled()) return;
    if (ctx.task.result?.state !== "pass") return;

    const p = this.pending;
    this.pending = null;
    if (!p || p.name !== ctx.task.name) return;

    appendPass({
      name: p.name,
      hash: p.hash,
      metadata: p.metadata,
      timestamp: new Date().toISOString(),
    });

    if (!this.index) this.index = loadTestResultIndex();
    const entry =
      this.index[p.name] ?? (this.index[p.name] = { passed: new Set<string>(), metadata: {} });
    entry.passed.add(p.hash);
    entry.metadata = { ...entry.metadata, ...p.metadata };
  }
}

function hasApiKey(): boolean {
  return Boolean(resolvedLlmApiKey());
}

const sessionStack: TestResultSession[] = [];

function currentSession(): TestResultSession {
  const active = sessionStack[sessionStack.length - 1];
  if (!active) {
    throw new Error(
      "Remote LLM tests must run inside describeLogged(...). Use only the `suite` collector passed into the callback."
    );
  }
  return active;
}

export const suiteTest = baseTest.extend<{
  addDeps: (partial: Record<string, unknown>) => void;
  alreadyPassed: (deps: Record<string, unknown>) => boolean;
}>({
  addDeps: [
    async ({}, use) => {
      await use((partial) => {
        currentSession().addDeps(partial);
      });
    },
    { scope: "file", auto: true },
  ],
  alreadyPassed: async ({ task }, use) => {
    await use(
      ({
        case: caseVal,
        userPrompt,
        system,
      }: Record<string, unknown>) =>
        currentSession().alreadyPassed(task.name, {
          case: caseVal,
          userPrompt,
          system,
        })
    );
  },
});

export function describeLogged(
  name: string,
  fn: (suite: typeof suiteTest) => void
): void {
  describe.skipIf(!hasApiKey())(name, () => {
    const session = new TestResultSession();
    sessionStack.push(session);

    suiteTest.beforeAll(() => {
      session.load();
    });

    suiteTest.afterAll(() => {
      const last = sessionStack[sessionStack.length - 1];
      if (last === session) {
        sessionStack.pop();
      } else {
        const idx = sessionStack.indexOf(session);
        if (idx >= 0) sessionStack.splice(idx, 1);
      }
    });

    beforeEach(async () => {
      await acquireLlmRequestSlot();
    });

    afterEach(({ task }) => {
      session.recordPass({ task });
    });

    fn(suiteTest);
  });
}
