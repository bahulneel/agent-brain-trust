import { describe, expect, it } from "vitest";
import { assertRemoteLlmOutput } from "./remote-case.js";

describe("remote-case helpers", () => {
  it("accepts outputs containing all expected fragments", () => {
    expect(() =>
      assertRemoteLlmOutput("Result: user u-1 is eligible", {
        id: "ok",
        user: "noop",
        expectSubstrings: ["user", "eligible"],
      })
    ).not.toThrow();
  });

  it("rejects empty output", () => {
    expect(() =>
      assertRemoteLlmOutput("", {
        id: "empty",
        user: "noop",
        expectSubstrings: ["anything"],
      })
    ).toThrow(/empty model output/);
  });

  it("rejects missing expected fragments", () => {
    expect(() =>
      assertRemoteLlmOutput("all clear", {
        id: "missing",
        user: "noop",
        expectSubstrings: ["critical"],
      })
    ).toThrow(/expected output to contain/);
  });
});
