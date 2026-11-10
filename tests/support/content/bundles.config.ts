/**
 * Content bundle map only (for `keyof` in types and runtime `content.load`).
 * No imports from `content.ts` to avoid cycles.
 *
 * Instantiations from docs/rpl/language-bootstrap.md:
 *   RPL  = fol + rpl + rpl-source + rpl-runtime + agent
 *   LRPL = RPL set + lrpl
 */
export const bundles = {
  basePath: "docs/rpl/bootstrap",
  byLabel: {
    rplEager: [
      "fol.md",
      "rpl.md",
      "rpl-source.md",
      "rpl-runtime.md",
      "agent.md",
    ],
    rplLazy: [
      "fol.md",
      "rpl.md",
      "rpl-source.md",
      "rpl-runtime.md",
      "agent.md",
      "lrpl.md",
    ],
  },
} as const;
