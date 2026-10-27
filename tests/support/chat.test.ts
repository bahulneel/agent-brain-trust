import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ExpectationScalar } from "@test/support/types";
import { describe, expect, it } from "vitest";

import { toJS } from "./chat.js";
import { buildUserPrompt } from "./fixtures.js";

type ParserRobustnessRow = {
  id: string;
  description: string;
  output: string;
  expectation: Record<string, ExpectationScalar>;
};

function loadParserRobustnessCases(): ParserRobustnessRow[] {
  const path = join(
    process.cwd(),
    "tests/prompts/rpl/fixtures/parser-robustness.json"
  );
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as ParserRobustnessRow[];
}

describe("chat.toJS", () => {
  it("buildUserPrompt from string and array forms", () => {
    const fromString = buildUserPrompt({
      id: "s",
      description: "string input",
      rpl: "account('acct-1')",
      output: "account(?id)",
      expectation: { id: "acct-1" },
    });
    expect(fromString[0]).toBe("account('acct-1')");

    const fromArray = buildUserPrompt({
      id: "a",
      description: "array input",
      rpl: ["a('x')", "b('y')"],
      output: "a(?id)",
      expectation: { id: "x" },
    });
    expect(fromArray.slice(0, 2)).toEqual(["a('x')", "b('y')"]);
  });

  it("parses robustness fixture outputs and matches expectations", () => {
    const cases = loadParserRobustnessCases();
    for (const c of cases) {
      const parsed = toJS(c.output);
      expect(parsed, c.id).toMatchObject(c.expectation);
    }
  });

  it("returns the original string when nothing parses as JSON", () => {
    expect(toJS("model says hello")).toBe("model says hello");
  });
});
