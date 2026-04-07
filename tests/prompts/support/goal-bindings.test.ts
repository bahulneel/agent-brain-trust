import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertGoalBindings,
  buildGoalBindingsUserPrompt,
  type GoalBindingCase,
  type GoalBindingValue,
} from "./goal-bindings.js";

type ParserRobustnessCase = {
  id: string;
  description: string;
  output: string;
  expectation: Record<string, GoalBindingValue>;
};

function loadParserRobustnessCases(): ParserRobustnessCase[] {
  const path = join(
    process.cwd(),
    "tests/prompts/rpl/fixtures/parser-robustness.json"
  );
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as ParserRobustnessCase[];
}

describe("goal-bindings helpers", () => {
  it("builds user prompt from string and array forms", () => {
    const fromString = buildGoalBindingsUserPrompt({
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

    const fromArray = buildGoalBindingsUserPrompt({
      id: "a",
      description: "array input",
      rpl: ["a('x')", "b('y')"],
      output: "a(?id)",
      expectation: { id: "x" },
    });
    expect(fromArray.slice(0, 2)).toEqual(["a('x')", "b('y')"]);
  });

  it("parses robustness fixture outputs through assertGoalBindings", () => {
    const cases = loadParserRobustnessCases();
    for (const c of cases) {
      const testCase: GoalBindingCase = {
        id: c.id,
        description: c.description,
        rpl: [],
        output: "quality(?v)",
        expectation: c.expectation,
      };
      expect(() => assertGoalBindings(c.output, testCase)).not.toThrow();
    }
  });

  it("throws for unparseable output", () => {
    const c: GoalBindingCase = {
      id: "unparseable",
      description: "no parseable bindings",
      rpl: [],
      output: "x(?id)",
      expectation: { id: "x" },
    };
    expect(() => assertGoalBindings("model says hello", c)).toThrow(
      /did not return JSON/
    );
  });
});
