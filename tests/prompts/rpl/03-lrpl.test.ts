import type { RplFixtureKey } from "@test/support/types";
import { fileURLToPath } from "node:url";

import {
  chat,
  content,
  describeLogged,
  fixtures,
  runPromptCase,
} from "@test/support";

const TEST_FILE = fileURLToPath(import.meta.url);
const SUITE = "LRPL spec verification (remote LLM)";

const fixtureLabels: RplFixtureKey[] = [
  "lrpl",
  "lrplAdvanced",
  "lrplIndexInlineData",
];
const cases = fixtures.load(...fixtureLabels);

describeLogged(SUITE, (t) => {
  const system = content.load("rplLazy").text;

  t.beforeAll(({ addDeps }) => {
    addDeps({ system });
  });

  const key = chat.apiKey()!;

  for (const c of cases) {
    t(
      c.id,
      async ({ alreadyPassed }) => {
        const userPrompt = fixtures.buildUserPrompt(c);
        if (alreadyPassed({ case: c, userPrompt, system })) return;

        await runPromptCase({
          case: c,
          suite: SUITE,
          testFile: TEST_FILE,
          testName: c.id,
          system,
          userPrompt,
          apiKey: key,
          model: chat.modelId(),
        });
      }
    );
  }
});
