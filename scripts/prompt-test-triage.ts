/**
 * Reads merged prompt-test failure NDJSON (CI matrix) and asks the configured LLM
 * to classify each distinct failure with category, pervasiveness, and recommendation.
 *
 * Env: PROMPTS_LLM_API_KEY (or NVIDIA_NIM_API_KEY), optional PROMPTS_LLM_MODEL.
 * Input: PROMPT_TRIAGE_INPUT (default .meta/prompt-test-failures-merged.ndjson)
 * Output: PROMPT_TRIAGE_OUTPUT (default .meta/prompt-test-triage.json)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { jsonrepair } from "jsonrepair";

const CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

type FailureRow = Record<string, unknown>;

function apiKey(): string {
  const k =
    process.env.PROMPTS_LLM_API_KEY?.trim() ||
    process.env.NVIDIA_NIM_API_KEY?.trim();
  if (!k) {
    throw new Error(
      "Set PROMPTS_LLM_API_KEY or NVIDIA_NIM_API_KEY for prompt triage."
    );
  }
  return k;
}

function modelId(): string {
  return (
    process.env.PROMPTS_LLM_MODEL?.trim() ||
    process.env.NIM_MODEL?.trim() ||
    "meta/llama3-70b-instruct"
  );
}

function loadNdjson(path: string): FailureRow[] {
  const text = readFileSync(path, "utf-8");
  const rows: FailureRow[] = [];
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    rows.push(JSON.parse(t) as FailureRow);
  }
  return rows;
}

function summarizeFailures(rows: FailureRow[]): string {
  const byKey = new Map<
    string,
    { sample: FailureRow; models: Set<string>; count: number }
  >();

  for (const row of rows) {
    const caseId = String(row.caseId ?? "");
    const err = String(row.errorMessage ?? "");
    const key = `${caseId}::${err.slice(0, 200)}`;
    const cur = byKey.get(key);
    if (cur) {
      cur.count += 1;
      const m = row.model;
      if (typeof m === "string") cur.models.add(m);
    } else {
      const models = new Set<string>();
      const m = row.model;
      if (typeof m === "string") models.add(m);
      byKey.set(key, { sample: row, models, count: 1 });
    }
  }

  const chunks: string[] = [];
  let i = 0;
  for (const { sample, models, count } of byKey.values()) {
    i += 1;
    chunks.push(
      `--- Failure group ${i} (occurrences: ${count}, models: ${[...models].sort().join(", ") || "unknown"}) ---\n` +
        JSON.stringify(
          {
            caseId: sample.caseId,
            caseDescription: sample.caseDescription,
            testFile: sample.testFile,
            suite: sample.suite,
            expectation: sample.expectation,
            received: sample.received,
            errorMessage: sample.errorMessage,
            userPrompt: sample.userPrompt,
          },
          null,
          2
        )
    );
  }
  return chunks.join("\n\n");
}

const SYSTEM = `You are a test triage assistant for RPL/LRPL prompt integration tests.
You receive a log of failed test cases (possibly duplicated across LLM model matrix runs).
For each distinct failure group in the user message, output one JSON object in an array with:
- "failureGroupIndex": number (1-based, matching the group order in the log)
- "category": short snake_case label (e.g. expectation_too_strict, model_json_shape, fixture_ambiguous, provider_flake, system_prompt_drift)
- "description": one or two sentences on what went wrong
- "pervasiveness": one of "single_model" | "multi_model" | "unknown" based on how many models failed similarly
- "recommendation": one sentence naming the most likely place to change first: test fixture expectation, system prompt content, Vitest test code, CI config, or provider/model behaviour

Respond with ONLY valid JSON: a single array of objects, no markdown fences.`;

async function complete(user: string): Promise<string> {
  const key = apiKey();
  const body = {
    model: modelId(),
    temperature: 0.2,
    max_tokens: 4096,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: user },
    ],
  };

  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Chat completion error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const text = data.choices?.[0]?.message?.content;
  return typeof text === "string" ? text : "";
}

function parseJsonArray(raw: string): unknown {
  const t = raw.trim();
  let repaired: string;
  try {
    repaired = jsonrepair(t);
  } catch {
    throw new Error("jsonrepair failed on model output");
  }
  return JSON.parse(repaired) as unknown;
}

async function main(): Promise<void> {
  const cwd = process.cwd();
  const inputPath =
    process.env.PROMPT_TRIAGE_INPUT?.trim() ||
    join(cwd, ".meta", "prompt-test-failures-merged.ndjson");
  const outputPath =
    process.env.PROMPT_TRIAGE_OUTPUT?.trim() ||
    join(cwd, ".meta", "prompt-test-triage.json");

  const rows = loadNdjson(inputPath);
  if (rows.length === 0) {
    const empty = {
      generatedAt: new Date().toISOString(),
      inputPath,
      failureCount: 0,
      distinctGroups: 0,
      analysis: [] as unknown[],
      note: "No failure rows in input; skipping LLM triage.",
    };
    writeFileSync(outputPath, `${JSON.stringify(empty, null, 2)}\n`, "utf-8");
    console.log(`Wrote ${outputPath} (empty)`);
    return;
  }

  const summary = summarizeFailures(rows);
  const userMsg = `Total NDJSON rows: ${rows.length}\n\n${summary}`;

  const raw = await complete(userMsg);
  let analysis: unknown;
  try {
    analysis = parseJsonArray(raw);
  } catch {
    analysis = { parseError: true, rawModelOutput: raw };
  }

  const out = {
    generatedAt: new Date().toISOString(),
    model: modelId(),
    inputPath,
    failureRowCount: rows.length,
    analysis,
  };

  const dir = dirname(outputPath);
  writeFileSync(outputPath, `${JSON.stringify(out, null, 2)}\n`, "utf-8");
  console.log(`Wrote ${outputPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
