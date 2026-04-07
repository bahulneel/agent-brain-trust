import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
export const RPL_CONTENT_DIR = join(ROOT, "content", "rpl");

export const DEFAULT_NIM_MODEL = "meta/llama3-70b-instruct";
export const NIM_CHAT_COMPLETIONS_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";

/** Rolling 1s window: max HTTP request *starts* (default 40). Override with NIM_MAX_REQUESTS_PER_SECOND. Set NIM_RATE_LIMIT=0 to disable. */
const RATE_LIMIT_WINDOW_MS = 1000;

function parseMaxRps(): number {
  if (process.env.NIM_RATE_LIMIT === "0" || process.env.NIM_RATE_LIMIT === "off") {
    return Infinity;
  }
  const raw = process.env.NIM_MAX_REQUESTS_PER_SECOND ?? "40";
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 40;
  return n;
}

const requestTimestamps: number[] = [];
let acquireChain: Promise<void> = Promise.resolve();

/** Acquire a slot in the rolling-window limiter before a NIM HTTP request. */
export async function acquireNimRequestSlot(): Promise<void> {
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

export function loadRplPrompt(...filenames: string[]): string {
  return filenames
    .map((filename) => readFileSync(join(RPL_CONTENT_DIR, filename), "utf-8"))
    .join("\n\n---\n\n");
}

type ChatChoice = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

/** Call after `acquireNimRequestSlot()` (e.g. in `beforeEach`). One slot per HTTP request. */
export async function nimChatCompletion(options: {
  apiKey: string;
  system: string;
  user: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const {
    apiKey,
    system,
    user,
    model = DEFAULT_NIM_MODEL,
    temperature = 0.1,
    maxTokens = 500,
  } = options;

  const response = await fetch(NIM_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `NIM API error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  const data = (await response.json()) as ChatChoice;
  const content = data.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
}
