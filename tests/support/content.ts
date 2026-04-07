import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");

/**
 * Prompt content aggregation config.
 * `basePath` is repo-relative; each bundle value is relative to `basePath`.
 */
export const bundles = {
  basePath: "content",
  byLabel: {
    rplEager: ["rpl/rpl.md", "rpl/eager.md", "rpl/translation.md"],
    rplLazy: ["rpl/rpl.md", "rpl/lazy.md", "rpl/translation.md"],
  },
} as const;

export type Label = keyof typeof bundles.byLabel;

export type Loaded = {
  label: Label;
  files: Record<string, string>;
  text: string;
};

/** Load and aggregate configured content files for one label. */
export function load(label: Label): Loaded {
  const files = bundles.byLabel[label];
  const out: Record<string, string> = {};

  for (const relPath of files) {
    const repoRelPath = `${bundles.basePath}/${relPath}`;
    const abs = join(REPO_ROOT, repoRelPath);
    out[repoRelPath] = readFileSync(abs, "utf-8");
  }

  return {
    label,
    files: out,
    text: files
      .map((relPath) => out[`${bundles.basePath}/${relPath}`])
      .join("\n\n---\n\n"),
  };
}

/**
 * Join markdown files under a directory (repo-relative) with `---` separators.
 * Replaces the old `loadPromptFiles` helper from `chat.ts`.
 */
export function loadFiles(
  dirRelativeToRepoRoot: string,
  ...filenames: string[]
): string {
  const dir = join(REPO_ROOT, dirRelativeToRepoRoot);
  return filenames
    .map((filename) => readFileSync(join(dir, filename), "utf-8"))
    .join("\n\n---\n\n");
}
