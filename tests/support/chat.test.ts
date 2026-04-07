import { describe, expect, it } from "vitest";

import { DEFAULT_LLM_MODEL, resolvedLlmApiKey, resolvedLlmModel } from "./chat.js";

function withEnv<T>(mutate: () => T): T {
  const before = { ...process.env };
  try {
    return mutate();
  } finally {
    process.env = before;
  }
}

describe("chat env helpers", () => {
  it("resolves API key with PROMPTS alias precedence", () => {
    withEnv(() => {
      process.env.PROMPTS_LLM_API_KEY = " prompts-key ";
      process.env.NVIDIA_NIM_API_KEY = "nim-key";
      expect(resolvedLlmApiKey()).toBe("prompts-key");

      delete process.env.PROMPTS_LLM_API_KEY;
      process.env.NVIDIA_NIM_API_KEY = " nim-key ";
      expect(resolvedLlmApiKey()).toBe("nim-key");
    });
  });

  it("resolves model with env fallback order", () => {
    withEnv(() => {
      process.env.PROMPTS_LLM_MODEL = "model-a";
      process.env.NIM_MODEL = "model-b";
      process.env.NVIDIA_NIM_MODEL = "model-c";
      expect(resolvedLlmModel()).toBe("model-a");

      delete process.env.PROMPTS_LLM_MODEL;
      expect(resolvedLlmModel()).toBe("model-b");

      delete process.env.NIM_MODEL;
      expect(resolvedLlmModel()).toBe("model-c");

      delete process.env.NVIDIA_NIM_MODEL;
      expect(resolvedLlmModel()).toBe(DEFAULT_LLM_MODEL);
    });
  });
});
