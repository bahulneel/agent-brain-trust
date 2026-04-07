import { jsonrepair } from "jsonrepair";

/** OpenAI-compatible chat completions (current backend: NVIDIA integrate). */
const CHAT_COMPLETIONS_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export type PromptInput = string | string[];

/** Default model id when no env overrides are set. */
export const DEFAULT_LLM_MODEL = "meta/llama3-70b-instruct";

/**
 * When `PROMPTS_LLM_RESPONSE_FORMAT_JSON` is `1`, `true`, or `on`, requests include
 * `response_format: { type: "json_object" }` (ignored by some providers).
 */
function useJsonObjectResponseFormat(): boolean {
  const v = process.env.PROMPTS_LLM_RESPONSE_FORMAT_JSON?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "on";
}

/**
 * API key for remote chat tests. Prefer `PROMPTS_LLM_API_KEY`; `NVIDIA_NIM_API_KEY` remains a supported alias for local setups.
 */
export function resolvedLlmApiKey(): string | undefined {
  const k =
    process.env.PROMPTS_LLM_API_KEY?.trim() ||
    process.env.NVIDIA_NIM_API_KEY?.trim();
  return k && k.length > 0 ? k : undefined;
}

/**
 * Chat model id. Prefer `PROMPTS_LLM_MODEL`; `NIM_MODEL` / `NVIDIA_NIM_MODEL` are legacy aliases.
 */
export function resolvedLlmModel(): string {
  const raw =
    process.env.PROMPTS_LLM_MODEL?.trim() ||
    process.env.NIM_MODEL?.trim() ||
    process.env.NVIDIA_NIM_MODEL?.trim() ||
    DEFAULT_LLM_MODEL;
  return raw.length > 0 ? raw : DEFAULT_LLM_MODEL;
}

const RATE_LIMIT_WINDOW_MS = 1000;

function parseMaxRps(): number {
  const off =
    process.env.PROMPTS_LLM_RATE_LIMIT === "0" ||
    process.env.PROMPTS_LLM_RATE_LIMIT === "off" ||
    process.env.NIM_RATE_LIMIT === "0" ||
    process.env.NIM_RATE_LIMIT === "off";
  if (off) return Infinity;

  const raw =
    process.env.PROMPTS_LLM_REQUESTS_PER_SECOND ??
    process.env.NIM_MAX_REQUESTS_PER_SECOND ??
    "40";
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 40;
  return n;
}

const requestTimestamps: number[] = [];
let acquireChain: Promise<void> = Promise.resolve();

/** Rolling-window limiter: call once per outbound chat request (e.g. in `beforeEach`). */
export async function acquireLlmRequestSlot(): Promise<void> {
  const maxPerWindow = parseMaxRps();
  if (!Number.isFinite(maxPerWindow)) return;

  acquireChain = acquireChain.then(async () => {
    for (;;) {
      const now = Date.now();
      while (
        requestTimestamps.length > 0 &&
        now - requestTimestamps[0]! >= RATE_LIMIT_WINDOW_MS
      ) {
        requestTimestamps.shift();
      }
      if (requestTimestamps.length < maxPerWindow) {
        requestTimestamps.push(Date.now());
        return;
      }
      const oldest = requestTimestamps[0]!;
      const waitMs = RATE_LIMIT_WINDOW_MS - (now - oldest) + 1;
      await new Promise<void>((resolve) =>
        setTimeout(resolve, Math.max(1, Math.ceil(waitMs)))
      );
    }
  });
  return acquireChain;
}

type ChatChoice = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

function tryExtractLastBraceObject(text: string): string | undefined {
  for (let i = text.length - 1; i >= 0; i--) {
    if (text[i] !== "}") continue;
    const end = i + 1;
    const start = text.lastIndexOf("{", i);
    if (start < 0) break;
    const slice = text.slice(start, end).trim();
    if (slice.startsWith("{") && slice.endsWith("}")) return slice;
  }
  return undefined;
}

/**
 * Prefer markdown JSON fence contents; else the last `{…}` slice in the raw reply.
 */
export function extractJsonCandidate(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const fenced = fenceMatch?.[1];
  if (fenced) {
    const inner = tryExtractLastBraceObject(fenced);
    if (inner) return inner;
    const trimmed = fenced.trim();
    if (trimmed.length > 0) return trimmed;
  }

  const brace = tryExtractLastBraceObject(raw);
  if (brace) return brace;

  throw new Error(`model did not return a JSON object:\n${raw}`);
}

/**
 * Repair near-JSON with jsonrepair, then parse. Throws if the value is not a plain object.
 */
export function parseModelJsonObject(raw: string): Record<string, unknown> {
  const candidate = extractJsonCandidate(raw);
  let repaired: string;
  try {
    repaired = jsonrepair(candidate);
  } catch (e) {
    throw new Error(
      `jsonrepair failed for model output: ${e instanceof Error ? e.message : String(e)}\n${raw}`
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(repaired);
  } catch (e) {
    throw new Error(
      `JSON.parse failed after jsonrepair: ${e instanceof Error ? e.message : String(e)}\nrepaired:\n${repaired}\nraw:\n${raw}`
    );
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(
      `model JSON must be a single object, got ${parsed === null ? "null" : typeof parsed}\n${raw}`
    );
  }
  return parsed as Record<string, unknown>;
}

/** POST chat completions. Caller should `acquireLlmRequestSlot()` first when using the limiter. */
export async function chatCompletion(options: {
  apiKey: string;
  system: string;
  user: PromptInput;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const {
    apiKey,
    system,
    user,
    model,
    temperature = 0.1,
    maxTokens = 500,
  } = options;

  const effectiveModel = model ?? resolvedLlmModel();
  const userPrompt = Array.isArray(user) ? user.join("\n") : user;

  const body: Record<string, unknown> = {
    model: effectiveModel,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
  };

  if (useJsonObjectResponseFormat()) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Chat completion error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  const data = (await response.json()) as ChatChoice;
  const content = data.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
}
