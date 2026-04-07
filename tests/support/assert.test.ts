import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { assertModelJson, assertRemoteLlmOutput } from "./assert.js";
import { buildUserPrompt, type Case, type Value } from "./fixtures.js";

type ParserRobustnessRow = {
  id: string;
  description: string;
  output: string;
  expectation: Record<string, Value>;
};

function loadParserRobustnessCases(): ParserRobustnessRow[] {
  const path = join(
    process.cwd(),
    "tests/prompts/rpl/fixtures/parser-robustness.json"
  );
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as ParserRobustnessRow[];
}

describe("assert (model JSON)", () => {
  it("buildUserPrompt from string and array forms", () => {
    const fromString = buildUserPrompt({
      id: "s",
      description: "string input",
      rpl: "account('acct-1')",
      output: "account(?id)",
      expectation: { id: "acct-1" },
    });
    expect(fromString[0]).toBe("account('acct-1')");
    expect(fromString.at(-1)).toBe(
      "Respond with one JSON object only (no prose, no markdown)."
    );

    const fromArray = buildUserPrompt({
      id: "a",
      description: "array input",
      rpl: ["a('x')", "b('y')"],
      output: "a(?id)",
      expectation: { id: "x" },
    });
    expect(fromArray.slice(0, 2)).toEqual(["a('x')", "b('y')"]);
  });

  it("parses robustness fixture outputs through assertModelJson", () => {
    const cases = loadParserRobustnessCases();
    for (const c of cases) {
      const testCase: Case = {
        id: c.id,
        description: c.description,
        rpl: [],
        output: "quality(?v)",
        expectation: c.expectation,
      };
      expect(() => assertModelJson(c.output, testCase)).not.toThrow();
    }
  });

  it("accepts remote substring expectations", () => {
    expect(() =>
      assertRemoteLlmOutput("Result: user u-1 is eligible", {
        id: "ok",
        user: "noop",
        expectSubstrings: ["user", "eligible"],
      })
    ).not.toThrow();
  });

  it("rejects empty remote output", () => {
    expect(() =>
      assertRemoteLlmOutput("", {
        id: "empty",
        user: "noop",
        expectSubstrings: ["anything"],
      })
    ).toThrow(/empty model output/);
  });

  it("rejects missing expected substrings", () => {
    expect(() =>
      assertRemoteLlmOutput("all clear", {
        id: "missing",
        user: "noop",
        expectSubstrings: ["critical"],
      })
    ).toThrow(/expected output to contain/);
  });

  it("throws for unparseable output", () => {
    const c: Case = {
      id: "unparseable",
      description: "no parseable JSON object",
      rpl: [],
      output: "x(?id)",
      expectation: { id: "x" },
    };
    expect(() => assertModelJson("model says hello", c)).toThrow(
      /model did not return a JSON object/
    );
  });
});
