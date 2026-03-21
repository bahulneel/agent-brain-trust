import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { readTaxonomyMerged } from "./taxonomy-load.js";
import type { TaxonomyDoc, TaxonomyNode } from "./taxonomy-types.js";
import type { TopicSearchRecord } from "./topic-search.js";

export type { TaxonomyDoc, TaxonomyNode } from "./taxonomy-types.js";
export type { TopicSearchRecord, TopicSearchHit } from "./topic-search.js";
export {
  buildTopicSearchRecords,
  flattenTopicRecords,
  searchTopicRecords,
} from "./topic-search.js";

export interface TopicIndex {
  skills?: string[];
  /** @deprecated Prefer flat topics/*.yaml clades or legacy taxonomy.yaml for expert indexing */
  experts?: string[];
}

/** Bundled expert roster: id (markdown basename without extension) → markdown body. */
export interface ExpertsRost {
  version: number;
  experts: Record<string, string>;
}

export function resolveDataRoot(skillRoot: string): string {
  return join(skillRoot, "assets");
}

export async function readTopicIndex(assetsRoot: string): Promise<TopicIndex | null> {
  const p = join(assetsRoot, "topics", "index.yaml");
  try {
    const s = await stat(p);
    if (!s.isFile()) return null;
    const { parse } = await import("yaml");
    const text = await readFile(p, "utf8");
    return parse(text) as TopicIndex;
  } catch {
    return null;
  }
}

/**
 * Hierarchical expert index: rooted `topics/root/topic.yml` tree, legacy flat `topics/*.yaml` clades,
 * or monolithic `topics/taxonomy.yaml`.
 */
export async function readTaxonomy(assetsRoot: string): Promise<TaxonomyDoc | null> {
  return readTaxonomyMerged(assetsRoot);
}

/** Precomputed fuzzy-search rows under `assets/topics/topics-search.json`, or null. */
export async function readTopicSearchRecords(assetsRoot: string): Promise<TopicSearchRecord[] | null> {
  const p = join(assetsRoot, "topics", "topics-search.json");
  try {
    const s = await stat(p);
    if (!s.isFile()) return null;
    const raw = JSON.parse(await readFile(p, "utf8")) as unknown;
    return Array.isArray(raw) ? (raw as TopicSearchRecord[]) : null;
  } catch {
    return null;
  }
}

export async function readExpertsRost(assetsRoot: string): Promise<ExpertsRost | null> {
  const p = join(assetsRoot, "experts", "rost.json");
  try {
    const s = await stat(p);
    if (!s.isFile()) return null;
    const raw = await readFile(p, "utf8");
    return JSON.parse(raw) as ExpertsRost;
  } catch {
    return null;
  }
}

/** All expert ids declared on taxonomy leaves (may contain duplicates across leaves). */
export function collectTaxonomyExpertIds(node: TaxonomyNode): string[] {
  const out: string[] = [];
  if (node.expert_ids?.length) out.push(...node.expert_ids);
  if (node.children?.length) {
    for (const c of node.children) out.push(...collectTaxonomyExpertIds(c));
  }
  return out;
}

export async function listExpertPaths(assetsRoot: string): Promise<string[]> {
  const expertsDir = join(assetsRoot, "experts");
  const out: string[] = [];
  async function walk(dir: string, rootExperts: string): Promise<void> {
    let names: string[];
    try {
      names = await readdir(dir);
    } catch {
      return;
    }
    for (const name of names) {
      const full = join(dir, name);
      const s = await stat(full);
      if (s.isDirectory()) await walk(full, rootExperts);
      else if (s.isFile() && name.endsWith(".md")) {
        out.push(relative(rootExperts, full).replace(/\\/g, "/"));
      }
    }
  }
  await walk(expertsDir, expertsDir);
  return out.sort();
}

/** Resolve expert markdown: prefers bundled `rost.json` (id → content), else `experts/<id>.md`. */
export async function readExpertFile(assetsRoot: string, relPath: string): Promise<string | null> {
  const safe = relPath.replace(/\.\./g, "").replace(/^\/+/, "");
  const id = safe.replace(/\.md$/i, "");
  const rost = await readExpertsRost(assetsRoot);
  if (rost?.experts[id]) return rost.experts[id];
  const mdName = safe.endsWith(".md") ? safe : `${id}.md`;
  const p = join(assetsRoot, "experts", mdName);
  try {
    return await readFile(p, "utf8");
  } catch {
    return null;
  }
}

/** Sorted expert ids from `rost.json` if present, else basenames of `experts/*.md`. */
export async function listExpertIds(assetsRoot: string): Promise<string[]> {
  const rost = await readExpertsRost(assetsRoot);
  if (rost?.experts) return Object.keys(rost.experts).sort();
  const paths = await listExpertPaths(assetsRoot);
  return paths.map((p) => p.replace(/\.md$/, "")).sort();
}

/** `rootDir` is the directory that contains a `references/` folder (e.g. skill root or plugin `resources/`). */
export async function listReferencePaths(rootDir: string): Promise<string[]> {
  const refDir = join(rootDir, "references");
  const out: string[] = [];
  async function walk(dir: string, rootRefs: string): Promise<void> {
    let names: string[];
    try {
      names = await readdir(dir);
    } catch {
      return;
    }
    for (const name of names) {
      const full = join(dir, name);
      const s = await stat(full);
      if (s.isDirectory()) await walk(full, rootRefs);
      else if (s.isFile() && name.endsWith(".md")) {
        out.push(relative(rootRefs, full).replace(/\\/g, "/"));
      }
    }
  }
  await walk(refDir, refDir);
  return out.sort();
}

export async function readReferenceFile(rootDir: string, relPath: string): Promise<string | null> {
  const safe = relPath.replace(/\.\./g, "").replace(/^\/+/, "");
  const p = join(rootDir, "references", safe);
  try {
    return await readFile(p, "utf8");
  } catch {
    return null;
  }
}

export async function listSkillFrontmatter(
  skillsDir: string
): Promise<Array<{ id: string; name: string; description: string }>> {
  const out: Array<{ id: string; name: string; description: string }> = [];
  let names: string[];
  try {
    names = await readdir(skillsDir);
  } catch {
    return out;
  }
  for (const name of names) {
    const sub = join(skillsDir, name);
    const st = await stat(sub).catch(() => null);
    if (!st?.isDirectory()) continue;
    const skillMd = join(sub, "SKILL.md");
    try {
      const raw = await readFile(skillMd, "utf8");
      const fm = parseFrontmatter(raw);
      out.push({
        id: name,
        name: (fm.name as string) ?? name,
        description: (fm.description as string) ?? "",
      });
    } catch {
      /* skip */
    }
  }
  return out;
}

export function parseFrontmatter(raw: string): Record<string, unknown> {
  if (!raw.startsWith("---")) return {};
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return {};
  const block = raw.slice(3, end).trim();
  const out: Record<string, unknown> = {};
  for (const line of block.split("\n")) {
    const m = /^([a-zA-Z0-9_-]+):\s*(.*)$/.exec(line);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return out;
}
