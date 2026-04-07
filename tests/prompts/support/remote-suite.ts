import { beforeEach, describe } from "vitest";
import { acquireLlmRequestSlot, resolvedLlmApiKey } from "./llm-chat.js";

export function hasRemoteLlmApiKey(): boolean {
  return Boolean(resolvedLlmApiKey());
}

/** Default timeout for one chat completion round-trip. */
export const REMOTE_LLM_TIMEOUT_MS = 120_000;

/**
 * Remote prompt tests: skip entire block without API key; rate-limit slot before each case.
 */
export function describeRemotePrompts(name: string, fn: () => void): void {
  describe.skipIf(!hasRemoteLlmApiKey())(name, () => {
    beforeEach(async () => {
      await acquireLlmRequestSlot();
    });
    fn();
  });
}
