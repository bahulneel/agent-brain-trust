import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ExpectationScalar, PassLogIndex, PassLogRow } from "@test/support/types";
import type { TestContext } from "vitest";
import hash from "object-hash";
import {
  afterEach,
  beforeEach,
  describe,
  test as baseTest,
} from "vitest";

import { apiKey, modelId, ready } from "./chat.js";

/** Bump when log row shape, dependency hashing, or skip semantics change. */
export const TEST_LOG_VERSION = 4;

export const LOG_PATH = join(process.cwd(), ".meta", "prompt-test-results.ndjson");

const CHAT_TEMPERATURE = 0.1;
const CHAT_MAX_TOKENS = 500;

function isScalar(v: unknown): v is ExpectationScalar {
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

function assertRow(raw: unknown): PassLogRow {
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

  const metaOut: Record<string, ExpectationScalar> = {};
  for (const [k, v] of Object.entries(metadata)) {
    if (!isScalar(v)) {
      throw new Error(`test result log: metadata "${k}" must be scalar`);
    }
    metaOut[k] = v;
  }

  return { name, hash: h, metadata: metaOut, timestamp };
}

export function logEnabled(): boolean {
  const v = process.env.PROMPT_TEST_RESULT_LOG?.trim().toLowerCase();
  if (v === "0" || v === "off" || v === "false") return false;
  return true;
}

export function fingerprint(deps: Record<string, unknown>): string {
  return hash(deps, { algorithm: "sha256", encoding: "hex" });
}

export function read(): PassLogIndex {
  const index: PassLogIndex = {};
  if (!existsSync(LOG_PATH)) return index;

  const text = readFileSync(LOG_PATH, "utf-8");
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

export function append(row: PassLogRow): void {
  const dir = dirname(LOG_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  appendFileSync(LOG_PATH, `${JSON.stringify(sortKeysDeep(row))}\n`, "utf-8");
}

function mergeDeps(
  suiteDeps: Record<string, unknown>,
  testDeps: Record<string, unknown>
): Record<string, unknown> {
  const { __env: _ignore, ...rest } = testDeps;
  return {
    ...suiteDeps,
    ...rest,
    __logVersion: TEST_LOG_VERSION,
    __env: {
      PROMPTS_LLM_MODEL: modelId(),
      chatTemperature: CHAT_TEMPERATURE,
      chatMaxTokens: CHAT_MAX_TOKENS,
    },
  };
}

export class PassLogSession {
  private index: PassLogIndex | null = null;
  private pending: {
    name: string;
    hash: string;
    metadata: Record<string, ExpectationScalar>;
  } | null = null;
  private readonly suiteDeps: Record<string, unknown> = {};

  load(): void {
    this.index = logEnabled() ? read() : {};
  }

  addDeps(partial: Record<string, unknown>): void {
    Object.assign(this.suiteDeps, partial);
  }

  alreadyPassed(testName: string, deps: Record<string, unknown>): boolean {
    this.pending = null;
    if (!logEnabled()) return false;

    if (!this.index) this.index = read();

    const hashValue = fingerprint(mergeDeps(this.suiteDeps, deps));
    if (this.index[testName]?.passed.has(hashValue)) return true;

    const metadata: Record<string, ExpectationScalar> = {
      model: modelId(),
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
    if (!logEnabled()) return;
    if (ctx.task.result?.state !== "pass") return;

    const p = this.pending;
    this.pending = null;
    if (!p || p.name !== ctx.task.name) return;

    append({
      name: p.name,
      hash: p.hash,
      metadata: p.metadata,
      timestamp: new Date().toISOString(),
    });

    if (!this.index) this.index = read();
    const entry =
      this.index[p.name] ?? (this.index[p.name] = { passed: new Set<string>(), metadata: {} });
    entry.passed.add(p.hash);
    entry.metadata = { ...entry.metadata, ...p.metadata };
  }
}

function hasApiKey(): boolean {
  return Boolean(apiKey());
}

const sessionStack: PassLogSession[] = [];

function currentSession(): PassLogSession {
  const active = sessionStack[sessionStack.length - 1];
  if (!active) {
    throw new Error(
      "Remote LLM tests must run inside describeLogged(...). Use only the `test` collector passed into the callback."
    );
  }
  return active;
}

export const test = baseTest.extend<{
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
  fn: (t: typeof test) => void
): void {
  describe.skipIf(!hasApiKey())(name, () => {
    const session = new PassLogSession();
    sessionStack.push(session);

    test.beforeAll(() => {
      session.load();
    });

    test.afterAll(() => {
      const last = sessionStack[sessionStack.length - 1];
      if (last === session) {
        sessionStack.pop();
      } else {
        const idx = sessionStack.indexOf(session);
        if (idx >= 0) sessionStack.splice(idx, 1);
      }
    });

    beforeEach(async () => {
      await ready();
    });

    afterEach(({ task }) => {
      session.recordPass({ task });
    });

    fn(test);
  });
}
