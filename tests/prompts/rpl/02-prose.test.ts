import {
  assert,
  chat,
  content,
  describeLogged,
  fixtures,
} from "@test/support";

const fixtureLabels: fixtures.Label[] = ["prose", "proseQualityJudgement"];
const cases = fixtures.load(...fixtureLabels);

describeLogged("Prose verification (remote LLM)", (suite) => {
  const system = content.load("rplEager").text;

  suite.beforeAll(({ addDeps }) => {
    addDeps({ system });
  });

  const apiKey = chat.resolvedLlmApiKey()!;

  for (const c of cases) {
    suite(
      c.id,
      async ({ alreadyPassed }) => {
        const userPrompt = fixtures.buildUserPrompt(c);
        if (alreadyPassed({ case: c, userPrompt, system })) return;

        const modelOutput = await chat.chatCompletion({
          apiKey,
          model: chat.resolvedLlmModel(),
          system,
          user: userPrompt,
        });
        assert.assertModelJson(modelOutput, c);
      }
    );
  }
});
