import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { PromptContentBundle, PromptContentKey } from "@test/support/types";

import { bundles } from "./content/bundles.config.js";

export { bundles };

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");

function loadBundle(label: PromptContentKey): PromptContentBundle {
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

function loadMarkdownDir(dirRelativeToRepoRoot: string, ...filenames: string[]): string {
  const dir = join(REPO_ROOT, dirRelativeToRepoRoot);
  return filenames
    .map((filename) => readFileSync(join(dir, filename), "utf-8"))
    .join("\n\n---\n\n");
}

export function load(key: PromptContentKey): PromptContentBundle;
export function load(repoRelativeDir: string, ...filenames: string[]): string;
export function load(
  a: PromptContentKey | string,
  ...rest: string[]
): PromptContentBundle | string {
  if (rest.length === 0) {
    return loadBundle(a as PromptContentKey);
  }
  return loadMarkdownDir(a, ...rest);
}
