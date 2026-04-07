import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Minimal .env loader (KEY=value, optional quotes). Avoids a vite peer install
 * that currently conflicts with workspace esbuild versions.
 */
function loadDotEnvFile(envPath: string): Record<string, string> {
  if (!existsSync(envPath)) return {};

  const out: Record<string, string> = {};
  const text = readFileSync(envPath, "utf-8");

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const envFromFile = loadDotEnvFile(join(process.cwd(), ".env"));

/** CI / shell env overrides values from `.env` for prompt integration tests. */
const PROMPTS_ENV_KEYS = [
  "PROMPTS_LLM_API_KEY",
  "PROMPTS_LLM_MODEL",
  "PROMPTS_LLM_REQUESTS_PER_SECOND",
  "PROMPTS_LLM_RATE_LIMIT",
  "NVIDIA_NIM_API_KEY",
  "NIM_MODEL",
  "NVIDIA_NIM_MODEL",
  "NIM_MAX_REQUESTS_PER_SECOND",
  "NIM_RATE_LIMIT",
] as const;

function processEnvOverrides(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of PROMPTS_ENV_KEYS) {
    const v = process.env[key];
    if (v !== undefined) out[key] = v;
  }
  return out;
}

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    /** One worker, one file at a time — avoids shared LLM rate-limit queue buildup across parallel tests. */
    maxWorkers: 1,
    fileParallelism: false,
    testTimeout: 120_000,
    hookTimeout: 30_000,
    env: { ...envFromFile, ...processEnvOverrides() },
  },
});
