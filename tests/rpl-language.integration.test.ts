/**
 * NVIDIA NIM integration tests for RPL prompt packs under content/rpl/.
 * Set NVIDIA_NIM_API_KEY (e.g. in .env); Vitest loads .env via vitest.config.ts.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  DEFAULT_NIM_MODEL,
  RPL_CONTENT_DIR,
  acquireNimRequestSlot,
  loadRplPrompt,
  nimChatCompletion,
} from "./support/rpl-nim.js";

const hasApiKey = Boolean(process.env.NVIDIA_NIM_API_KEY);

describe.skipIf(!hasApiKey)("RPL language (NIM integration)", () => {
  it("has local prompt files", () => {
    expect(existsSync(RPL_CONTENT_DIR)).toBe(true);
    for (const file of ["rpl.md", "eager.md", "lazy.md", "translation.md"]) {
      expect(existsSync(join(RPL_CONTENT_DIR, file))).toBe(true);
    }
  });

  describe("NIM chat completions", () => {
    beforeEach(async () => {
      await acquireNimRequestSlot();
    });

    it(
      "translates prose to RPL with expected relation naming",
      { timeout: 120_000 },
      async () => {
        const system = loadRplPrompt("rpl.md", "translation.md");
        const user =
          "Translate this to RPL:\n# Process Refund\nCheck if the __refund amount__ is less than 100. If so, auto-approve it.";
        const output = await nimChatCompletion({
          apiKey: process.env.NVIDIA_NIM_API_KEY!,
          system,
          user,
        });
        expect(output.length).toBeGreaterThan(0);
        expect(output.toLowerCase()).toContain("process-refund");
      }
    );

    it(
      "predicts eager quiescence trace from rule and prior trace",
      { timeout: 120_000 },
      async () => {
        const system = loadRplPrompt("rpl.md", "eager.md");
        const user = [
          "Given the rule: `valid(?x) <- rel(?x)`.",
          'If the trace `rel(?x) ^^ {x "test"} -> true` is asserted in Phase 1, what trace is generated in Phase 3 (Quiesce)?',
        ].join("\n");
        const output = await nimChatCompletion({
          apiKey: process.env.NVIDIA_NIM_API_KEY!,
          system,
          user,
        });
        expect(output.length).toBeGreaterThan(0);
        expect(output.toLowerCase()).toContain(
          'valid(?x) ^^ {x "test"} -> true'.toLowerCase()
        );
      }
    );

    it(
      "explains LRPL constraint memos",
      { timeout: 120_000 },
      async () => {
        const system = loadRplPrompt("rpl.md", "lazy.md");
        const user =
          "In LRPL, before an lvar is bound, where does the agent record candidate worlds, and in what format?";
        const output = await nimChatCompletion({
          apiKey: process.env.NVIDIA_NIM_API_KEY!,
          system,
          user,
        });
        expect(output.length).toBeGreaterThan(0);
        expect(output.toLowerCase()).toContain(":memo");
      }
    );
  });
});

describe("RPL language (local checks, no API)", () => {
  it("documents the model used when NIM tests run", () => {
    expect(DEFAULT_NIM_MODEL).toMatch(/\S+/);
  });
});
