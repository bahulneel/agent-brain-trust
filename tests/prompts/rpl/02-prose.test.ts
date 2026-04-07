import { it } from "vitest";
import {
  chatCompletion,
  resolvedLlmApiKey,
  resolvedLlmModel,
} from "../support/llm-chat.js";
import {
  assertGoalBindings,
  buildGoalBindingsUserPrompt,
  type GoalBindingCase,
} from "../support/goal-bindings.js";
import { loadGoalBindingCases } from "../support/load-goal-binding-suite.js";
import {
  REMOTE_LLM_TIMEOUT_MS,
  describeRemotePrompts,
} from "../support/remote-suite.js";
import { proseSystemPrompt } from "../support/rpl-prompt-stacks.js";

const CASES: GoalBindingCase[] = loadGoalBindingCases(
  "tests/prompts/rpl/fixtures/prose.json"
);

describeRemotePrompts("Prose verification (remote LLM)", () => {
  const system = proseSystemPrompt();
  const apiKey = resolvedLlmApiKey()!;

  it.each(CASES)(
    "$id",
    { timeout: REMOTE_LLM_TIMEOUT_MS },
    async (c: GoalBindingCase) => {
      const output = await chatCompletion({
        apiKey,
        model: resolvedLlmModel(),
        system,
        user: buildGoalBindingsUserPrompt(c),
      });
      assertGoalBindings(output, c);
    }
  );
});
