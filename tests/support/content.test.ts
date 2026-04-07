import { describe, expect, it } from "vitest";

import { loadFiles } from "./content.js";

describe("content.loadFiles", () => {
  it("loads prompt files in requested order with separators", () => {
    const combined = loadFiles("content/rpl", "rpl.md", "eager.md");
    const relIdx = combined.indexOf("# Relational Prompt Language (RPL)");
    const eagerIdx = combined.indexOf("# RPL Eager Execution Algorithm");
    expect(relIdx).toBeGreaterThanOrEqual(0);
    expect(eagerIdx).toBeGreaterThan(relIdx);
    expect(combined).toContain("\n\n---\n\n");
  });

  it("throws when a prompt file is missing", () => {
    expect(() =>
      loadFiles("content/rpl", "rpl.md", "does-not-exist.md")
    ).toThrow(/ENOENT|no such file/i);
  });
});
