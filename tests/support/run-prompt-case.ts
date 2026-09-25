import type { RplCase } from "@test/support/types";
import { expect } from "vitest";

import * as chat from "./chat.js";
import { appendPromptFailure, buildFailureRow } from "./prompt-failure-log.js";

type CompleteFn = typeof chat.complete;

export async function runPromptCase(options: {
  case: RplCase;
  suite: string;
  testFile: string;
  testName: string;
  system: string;
  userPrompt: string[];
  apiKey: string;
  model: string;
  complete?: CompleteFn;
}): Promise<void> {
  const complete = options.complete ?? chat.complete;
  let received: unknown;

  try {
    const modelOutput = await complete({
      apiKey: options.apiKey,
      model: options.model,
      system: options.system,
      user: options.userPrompt,
    });
    received = chat.toJS(modelOutput);
    expect(received, options.userPrompt.join("\n")).toMatchObject(
      options.case.expectation
    );
  } catch (err) {
    if (failureLogEligible(options.testFile)) {
      const message = err instanceof Error ? err.message : String(err);
      appendPromptFailure(
        buildFailureRow({
          testFile: options.testFile,
          suite: options.suite,
          testName: options.testName,
          model: options.model,
          case: options.case,
          system: options.system,
          userPrompt: options.userPrompt,
          received,
          errorMessage: message,
        })
      );
    }
    throw err;
  }
}

/** Skip logging for synthetic tests (e.g. chat unit tests) that reuse this helper. */
function failureLogEligible(testFile: string): boolean {
  return testFile.includes("/prompts/");
}
