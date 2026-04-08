import { describe, expect, it } from "vitest";

import { load } from "./content.js";

describe("content.load", () => {
  it("loads prompt files in requested order with separators", () => {
    const combined = load("content/rpl", "rpl.md", "eager.md");
    const relIdx = combined.indexOf("# Relational Prompt Language (RPL)");
    const eagerIdx = combined.indexOf("# RPL Eager Execution Algorithm");
    expect(relIdx).toBeGreaterThanOrEqual(0);
    expect(eagerIdx).toBeGreaterThan(relIdx);
    expect(combined).toContain("\n\n---\n\n");
  });

  it("throws when a prompt file is missing", () => {
    expect(() =>
      load("content/rpl", "rpl.md", "does-not-exist.md")
    ).toThrow(/ENOENT|no such file/i);
  });
});
