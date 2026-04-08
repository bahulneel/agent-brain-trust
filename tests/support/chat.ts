import type { ChatPrompt } from "@test/support/types";
import { jsonrepair } from "jsonrepair";

/** OpenAI-compatible chat completions (current backend: NVIDIA integrate). */
const CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

/**
 * Best-effort: optional markdown fence (`json` / `ndjson`), then whole string or each non-empty line
 * (NDJSON / trailing line wins) via [`jsonrepair`](https://www.npmjs.com/package/jsonrepair) + `JSON.parse`.
 * Any JSON top-level value. On failure, returns `raw` unchanged.
 */
const payload = (() => {
  function unfence(s: string): string {
    const m = s.match(/```(?:json|ndjson)?\s*([\s\S]*?)```/i);
    const inner = m?.[1]?.trim();
    return inner && inner.length > 0 ? inner : s;
  }

  function tryParse(s: string): unknown | undefined {
    const t = s.trim();
    if (!t) return undefined;
    let repaired: string;
    try {
      repaired = jsonrepair(t);
    } catch {
      return undefined;
    }
    try {
      return JSON.parse(repaired) as unknown;
    } catch {
      return undefined;
    }
  }

  function fromRaw(raw: string): unknown {
    const head = raw.trim();
    if (!head) return raw;

    const body = unfence(head);
    const whole = tryParse(body);
    if (whole !== undefined) return whole;

    const rows = body
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    for (let i = rows.length - 1; i >= 0; i--) {
      const v = tryParse(rows[i]!);
      if (v !== undefined) return v;
    }
    return raw;
  }

  return { fromRaw };
})();

export function toJS(raw: string): unknown {
  return payload.fromRaw(raw);
}

/** Default model id when no env overrides are set. */
export const DEFAULT_MODEL = "meta/llama3-70b-instruct";

/**
 * When `PROMPTS_LLM_RESPONSE_FORMAT_JSON` is `1`, `true`, or `on`, requests include
 * `response_format: { type: "json_object" }` (ignored by some providers).
 */
function wantsJson(): boolean {
  const v = process.env.PROMPTS_LLM_RESPONSE_FORMAT_JSON?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "on";
}

/**
 * API key for remote chat tests. Prefer `PROMPTS_LLM_API_KEY`; `NVIDIA_NIM_API_KEY` remains a supported alias for local setups.
 */
export function apiKey(): string | undefined {
  const k =
    process.env.PROMPTS_LLM_API_KEY?.trim() ||
    process.env.NVIDIA_NIM_API_KEY?.trim();
  return k && k.length > 0 ? k : undefined;
}

/**
 * Chat model id. Prefer `PROMPTS_LLM_MODEL`; `NIM_MODEL` / `NVIDIA_NIM_MODEL` are legacy aliases.
 */
export function modelId(): string {
  const env =
    process.env.PROMPTS_LLM_MODEL?.trim() ||
    process.env.NIM_MODEL?.trim() ||
    process.env.NVIDIA_NIM_MODEL?.trim() ||
    DEFAULT_MODEL;
  return env.length > 0 ? env : DEFAULT_MODEL;
}

const windowMs = 1000;

function maxRps(): number {
  const off =
    process.env.PROMPTS_LLM_RATE_LIMIT === "0" ||
    process.env.PROMPTS_LLM_RATE_LIMIT === "off" ||
    process.env.NIM_RATE_LIMIT === "0" ||
    process.env.NIM_RATE_LIMIT === "off";
  if (off) return Infinity;

  const nStr =
    process.env.PROMPTS_LLM_REQUESTS_PER_SECOND ??
    process.env.NIM_MAX_REQUESTS_PER_SECOND ??
    "40";
  const n = Number.parseInt(nStr, 10);
  if (!Number.isFinite(n) || n < 1) return 40;
  return n;
}

const stamps: number[] = [];
let chain: Promise<void> = Promise.resolve();

/** Rolling-window limiter: call once per outbound chat request (e.g. in `beforeEach`). */
export async function ready(): Promise<void> {
  const cap = maxRps();
  if (!Number.isFinite(cap)) return;

  chain = chain.then(async () => {
    for (;;) {
      const now = Date.now();
      while (stamps.length > 0 && now - stamps[0]! >= windowMs) {
        stamps.shift();
      }
      if (stamps.length < cap) {
        stamps.push(Date.now());
        return;
      }
      const oldest = stamps[0]!;
      const waitMs = windowMs - (now - oldest) + 1;
      await new Promise<void>((resolve) =>
        setTimeout(resolve, Math.max(1, Math.ceil(waitMs)))
      );
    }
  });
  return chain;
}

type Choice = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

/** POST chat completions. Caller should `await chat.ready()` first when using the limiter. */
export async function complete(options: {
  apiKey: string;
  system: string;
  user: ChatPrompt;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const {
    apiKey: key,
    system,
    user,
    model,
    temperature = 0.1,
    maxTokens = 500,
  } = options;

  const picked = model ?? modelId();
  const prompt = Array.isArray(user) ? user.join("\n") : user;

  const body: Record<string, unknown> = {
    model: picked,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    temperature,
    max_tokens: maxTokens,
  };

  if (wantsJson()) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(
      `Chat completion error: ${response.status} ${response.statusText}\n${err}`
    );
  }

  const data = (await response.json()) as Choice;
  const text = data.choices?.[0]?.message?.content;
  return typeof text === "string" ? text : "";
}
