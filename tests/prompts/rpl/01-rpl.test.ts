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
import { rplSystemPrompt } from "../support/rpl-prompt-stacks.js";

const SHARED = loadGoalBindingCases("tests/prompts/rpl/fixtures/shared.json");
const RPL_ONLY = loadGoalBindingCases("tests/prompts/rpl/fixtures/rpl.json");
const CASES: GoalBindingCase[] = [...SHARED, ...RPL_ONLY];

describeRemotePrompts("RPL spec verification (remote LLM)", () => {
  const system = rplSystemPrompt();
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
