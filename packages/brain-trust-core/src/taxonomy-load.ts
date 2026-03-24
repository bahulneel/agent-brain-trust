import { readFile, readdir, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import { parse } from "yaml";
import type { TaxonomyDoc, TaxonomyNode } from "./taxonomy-types.js";

/**
 * Merged root id when loading **legacy** flat `topics/*.yaml` clades under a synthetic root.
 * Not used for the rooted `topics/knowledge-work/` tree (that node's id is `knowledge-work`).
 */
export const DEFAULT_TAXONOMY_ROOT_ID = "root";
export const DEFAULT_TAXONOMY_ROOT_LABEL = "Brain Trust knowledge map";
export const DEFAULT_TAXONOMY_VERSION = 2;

/** Directory under `topics/` that contains the rooted clade (`topic.yml`). */
export const ROOTED_TOPIC_CLADE_DIR = "knowledge-work";

/** Filenames under `topics/` that are not taxonomy nodes. */
const EXCLUDED_TOPIC_FILES = new Set(["index.yaml", "index.yml"]);

function collectNodeIds(node: TaxonomyNode, out: string[]): void {
  out.push(node.id);
  for (const c of node.children ?? []) collectNodeIds(c, out);
}

/** Every `id` in the tree must be unique (navigation and future lookups). */
export function assertUniqueTaxonomyNodeIds(root: TaxonomyNode): void {
  const ids: string[] = [];
  collectNodeIds(root, ids);
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      throw new Error(`taxonomy: duplicate node id "${id}"`);
    }
    seen.add(id);
  }
}

async function isDirectory(p: string): Promise<boolean> {
  try {
    const s = await stat(p);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function isFile(p: string): Promise<boolean> {
  try {
    const s = await stat(p);
    return s.isFile();
  } catch {
    return false;
  }
}

/** Parsed branch `topic.yml` / `topic.yaml`: metadata only; `id` and `children` come from the filesystem. */
export interface TopicBranchMeta {
  label: string;
  description?: string;
  keywords?: string[];
  aliases?: string[];
}

/** Parsed leaf `*.yml`: metadata only; `id` comes from the filename stem. */
export interface TopicLeafMeta {
  label: string;
  expert_ids?: string[];
  description?: string;
  keywords?: string[];
  aliases?: string[];
}

function yamlStem(filename: string): string {
  if (filename.endsWith(".yaml")) return filename.slice(0, -".yaml".length);
  if (filename.endsWith(".yml")) return filename.slice(0, -".yml".length);
  return filename;
}

function assertBranchYamlNoFilesystemKeys(raw: Record<string, unknown>, branchPath: string): void {
  if (Object.prototype.hasOwnProperty.call(raw, "id")) {
    throw new Error(`taxonomy: branch ${branchPath} must not contain id (directory name is the id)`);
  }
  if (Object.prototype.hasOwnProperty.call(raw, "children")) {
    throw new Error(`taxonomy: branch ${branchPath} must not contain children (discovered from directory)`);
  }
}

function assertLeafYamlNoIdKey(raw: Record<string, unknown>, leafPath: string): void {
  if (Object.prototype.hasOwnProperty.call(raw, "id")) {
    throw new Error(`taxonomy: leaf ${leafPath} must not contain id (filename stem is the id)`);
  }
}

type ChildSlot = { kind: "branch"; path: string } | { kind: "leaf"; path: string };

/**
 * Discover immediate child topics: subdirectories with `topic.yml`/`topic.yaml`, or leaf `*.yml`/`*.yaml`
 * (excluding `topic.*` and index files). Sorted lexicographically by id (dir name or leaf stem).
 */
async function discoverChildSlots(dir: string): Promise<ChildSlot[]> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const byStem = new Map<string, ChildSlot>();

  for (const ent of entries) {
    if (ent.name.startsWith(".")) continue;

    if (ent.isDirectory()) {
      const subDir = join(dir, ent.name);
      const hasBranch =
        (await isFile(join(subDir, "topic.yml"))) || (await isFile(join(subDir, "topic.yaml")));
      if (!hasBranch) continue;

      const stem = ent.name;
      const existing = byStem.get(stem);
      if (existing) {
        throw new Error(
          `taxonomy: ambiguous child "${stem}" under ${dir}: both branch dir and leaf file exist`,
        );
      }
      byStem.set(stem, { kind: "branch", path: subDir });
      continue;
    }

    if (!ent.isFile()) continue;
    if (!ent.name.endsWith(".yml") && !ent.name.endsWith(".yaml")) continue;
    if (ent.name === "topic.yml" || ent.name === "topic.yaml") continue;
    if (EXCLUDED_TOPIC_FILES.has(ent.name)) continue;

    const stem = yamlStem(ent.name);
    const filePath = join(dir, ent.name);
    const existing = byStem.get(stem);
    if (existing) {
      throw new Error(
        `taxonomy: ambiguous child "${stem}" under ${dir}: both branch dir and leaf file exist`,
      );
    }
    byStem.set(stem, { kind: "leaf", path: filePath });
  }

  return [...byStem.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, slot]) => slot);
}

/**
 * Load a branch from `dir/topic.yml` or `dir/topic.yaml`. Node `id` is `basename(dir)`; children are
 * discovered from the directory (subtrees or leaf YAML siblings).
 */
export async function loadTopicBranchDir(dir: string): Promise<TaxonomyNode> {
  const yml = join(dir, "topic.yml");
  const yaml = join(dir, "topic.yaml");
  const branchPath = (await isFile(yml)) ? yml : (await isFile(yaml)) ? yaml : null;
  if (!branchPath) {
    throw new Error(`taxonomy: missing topic.yml in ${dir}`);
  }
  const rawUnknown = parse(await readFile(branchPath, "utf8")) as Record<string, unknown>;
  assertBranchYamlNoFilesystemKeys(rawUnknown, branchPath);
  const raw = rawUnknown as unknown as TopicBranchMeta;
  if (!raw?.label || typeof raw.label !== "string") {
    throw new Error(`taxonomy: branch ${branchPath} must have string label`);
  }

  const id = basename(dir);
  const slots = await discoverChildSlots(dir);
  const children: TaxonomyNode[] = [];
  for (const slot of slots) {
    if (slot.kind === "branch") {
      children.push(await loadTopicBranchDir(slot.path));
    } else {
      children.push(await loadTopicLeafFile(slot.path));
    }
  }

  const node: TaxonomyNode = { id, label: raw.label, children };
  if (raw.description) node.description = raw.description;
  if (raw.keywords?.length) node.keywords = raw.keywords;
  if (raw.aliases?.length) node.aliases = raw.aliases;
  return node;
}

async function loadTopicLeafFile(filePath: string): Promise<TaxonomyNode> {
  const rawUnknown = parse(await readFile(filePath, "utf8")) as Record<string, unknown>;
  assertLeafYamlNoIdKey(rawUnknown, filePath);
  const raw = rawUnknown as unknown as TopicLeafMeta;
  if (!raw?.label || typeof raw.label !== "string") {
    throw new Error(`taxonomy: leaf ${filePath} must have string label`);
  }
  const id = yamlStem(basename(filePath));
  const node: TaxonomyNode = {
    id,
    label: raw.label,
    expert_ids: raw.expert_ids,
  };
  if (raw.description) node.description = raw.description;
  if (raw.keywords?.length) node.keywords = raw.keywords;
  if (raw.aliases?.length) node.aliases = raw.aliases;
  return node;
}

/**
 * True if `topics/knowledge-work/topic.yml` exists (rooted clade layout).
 */
export async function hasRootedTopicLayout(topicsDir: string): Promise<boolean> {
  const cladeDir = join(topicsDir, ROOTED_TOPIC_CLADE_DIR);
  const yml = join(cladeDir, "topic.yml");
  const yaml = join(cladeDir, "topic.yaml");
  return (await isFile(yml)) || (await isFile(yaml));
}

/**
 * List legacy flat clade files: `topics/*.yaml` excluding index (rooted clade lives in a subdirectory).
 */
export async function listLegacyTopicCladeFilenames(topicsDir: string): Promise<string[]> {
  let names: string[];
  try {
    names = await readdir(topicsDir);
  } catch {
    return [];
  }
  return names
    .filter((n) => (n.endsWith(".yaml") || n.endsWith(".yml")) && !EXCLUDED_TOPIC_FILES.has(n))
    .sort((a, b) => a.localeCompare(b));
}

async function loadLegacyFlatClades(topicsDir: string): Promise<TaxonomyNode[]> {
  const files = await listLegacyTopicCladeFilenames(topicsDir);
  const nodes: TaxonomyNode[] = [];
  for (const f of files) {
    const text = await readFile(join(topicsDir, f), "utf8");
    const node = parse(text) as TaxonomyNode;
    if (!node?.id || typeof node.id !== "string") {
      throw new Error(`topics/${f}: expected a taxonomy node with string id at top level`);
    }
    nodes.push(node);
  }
  return nodes;
}

/**
 * Load taxonomy from `topics/knowledge-work/topic.yml` (rooted tree), else legacy flat `topics/*.yml` clades
 * merged under a synthetic root, else `topics/taxonomy.yaml`.
 */
export async function readTaxonomyMerged(assetsRoot: string): Promise<TaxonomyDoc | null> {
  const topicsDir = join(assetsRoot, "topics");
  const legacyPath = join(topicsDir, "taxonomy.yaml");
  const legacyPathYml = join(topicsDir, "taxonomy.yml");

  if (await hasRootedTopicLayout(topicsDir)) {
    const cladeDir = join(topicsDir, ROOTED_TOPIC_CLADE_DIR);
    const taxonomy = await loadTopicBranchDir(cladeDir);
    assertUniqueTaxonomyNodeIds(taxonomy);
    return { version: DEFAULT_TAXONOMY_VERSION, taxonomy };
  }

  const children = await loadLegacyFlatClades(topicsDir);
  if (children.length > 0) {
    const taxonomy: TaxonomyNode = {
      id: DEFAULT_TAXONOMY_ROOT_ID,
      label: DEFAULT_TAXONOMY_ROOT_LABEL,
      children,
    };
    assertUniqueTaxonomyNodeIds(taxonomy);
    return { version: DEFAULT_TAXONOMY_VERSION, taxonomy };
  }

  const mono = (await isFile(legacyPath)) ? legacyPath : (await isFile(legacyPathYml)) ? legacyPathYml : null;
  if (mono) {
    const text = await readFile(mono, "utf8");
    const legacy = parse(text) as TaxonomyDoc;
    if (legacy?.taxonomy) assertUniqueTaxonomyNodeIds(legacy.taxonomy);
    return legacy;
  }

  return null;
}
