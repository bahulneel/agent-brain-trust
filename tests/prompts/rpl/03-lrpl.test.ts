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
import { lrplSystemPrompt } from "../support/rpl-prompt-stacks.js";

const LRPL_ONLY = loadGoalBindingCases("tests/prompts/rpl/fixtures/lrpl.json");
const LRPL_ADVANCED = loadGoalBindingCases(
  "tests/prompts/rpl/fixtures/lrpl-advanced.json"
);
const LRPL_INDEX_INLINE_DATA = loadGoalBindingCases(
  "tests/prompts/rpl/fixtures/lrpl-index-inline-data.json"
);
const CASES: GoalBindingCase[] = [
  ...LRPL_ONLY,
  ...LRPL_ADVANCED,
  ...LRPL_INDEX_INLINE_DATA,
];

describeRemotePrompts("LRPL spec verification (remote LLM)", () => {
  const system = lrplSystemPrompt();
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
