import { describe, expect, it } from "vitest";
import {
  DEFAULT_LLM_MODEL,
  loadPromptFiles,
  resolvedLlmApiKey,
  resolvedLlmModel,
} from "./llm-chat.js";

function withEnv<T>(mutate: () => T): T {
  const before = { ...process.env };
  try {
    return mutate();
  } finally {
    process.env = before;
  }
}

describe("llm-chat helpers", () => {
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

  it("loads prompt files in requested order with separators", () => {
    const combined = loadPromptFiles("content/rpl", "rpl.md", "eager.md");
    const relIdx = combined.indexOf("# Relational Prompt Language (RPL)");
    const eagerIdx = combined.indexOf("# RPL Eager Execution Algorithm");
    expect(relIdx).toBeGreaterThanOrEqual(0);
    expect(eagerIdx).toBeGreaterThan(relIdx);
    expect(combined).toContain("\n\n---\n\n");
  });

  it("throws when a prompt file is missing", () => {
    expect(() =>
      loadPromptFiles("content/rpl", "rpl.md", "does-not-exist.md")
    ).toThrow(/ENOENT|no such file/i);
  });
});
