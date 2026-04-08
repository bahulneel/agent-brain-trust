/**
 * Content bundle map only (for `keyof` in types and runtime `content.load`).
 * No imports from `content.ts` to avoid cycles.
 */
export const bundles = {
  basePath: "content",
  byLabel: {
    rplEager: ["rpl/rpl.md", "rpl/eager.md", "rpl/translation.md"],
    rplLazy: ["rpl/rpl.md", "rpl/lazy.md", "rpl/translation.md"],
  },
} as const;
