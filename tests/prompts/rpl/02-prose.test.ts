import type { RplFixtureKey } from "@test/support/types";
import { expect } from "vitest";

import {
  chat,
  content,
  describeLogged,
  fixtures,
} from "@test/support";

const fixtureLabels: RplFixtureKey[] = ["prose", "proseQualityJudgement"];
const cases = fixtures.load(...fixtureLabels);

describeLogged("Prose verification (remote LLM)", (t) => {
  const system = content.load("rplEager").text;

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

        const modelOutput = await chat.complete({
          apiKey: key,
          model: chat.modelId(),
          system,
          user: userPrompt,
        });
        const parsed = chat.toJS(modelOutput);
        expect(parsed, userPrompt.join("\n")).toMatchObject(c.expectation);
      }
    );
  }
});
