import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";
import type { TaxonomyDoc, TaxonomyNode } from "./taxonomy-types.js";

/** Merged root id when loading from `topics/root/topic.yml`. */
export const DEFAULT_TAXONOMY_ROOT_ID = "root";
export const DEFAULT_TAXONOMY_ROOT_LABEL = "Brain Trust knowledge map";
export const DEFAULT_TAXONOMY_VERSION = 2;

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

export interface TopicBranchFile {
  id: string;
  label: string;
  children?: string[];
  description?: string;
  keywords?: string[];
  aliases?: string[];
}

/**
 * Load a branch from `dir/topic.yml` or `dir/topic.yaml`, then resolve each child id as either
 * `dir/<id>/` (subtree) or `dir/<id>.yml` / `dir/<id>.yaml` (leaf).
 */
export async function loadTopicBranchDir(dir: string): Promise<TaxonomyNode> {
  const yml = join(dir, "topic.yml");
  const yaml = join(dir, "topic.yaml");
  const branchPath = (await isFile(yml)) ? yml : (await isFile(yaml)) ? yaml : null;
  if (!branchPath) {
    throw new Error(`taxonomy: missing topic.yml in ${dir}`);
  }
  const raw = parse(await readFile(branchPath, "utf8")) as TopicBranchFile;
  if (!raw?.id || typeof raw.id !== "string") {
    throw new Error(`taxonomy: branch ${branchPath} must have string id`);
  }
  if (!raw.label || typeof raw.label !== "string") {
    throw new Error(`taxonomy: branch ${branchPath} must have string label`);
  }
  const childIds = raw.children ?? [];
  const children: TaxonomyNode[] = [];
  for (const childId of childIds) {
    const subDir = join(dir, childId);
    const leafYml = join(dir, `${childId}.yml`);
    const leafYaml = join(dir, `${childId}.yaml`);
    if (await isDirectory(subDir)) {
      children.push(await loadTopicBranchDir(subDir));
    } else if (await isFile(leafYml)) {
      children.push(await loadTopicLeafFile(leafYml));
    } else if (await isFile(leafYaml)) {
      children.push(await loadTopicLeafFile(leafYaml));
    } else {
      throw new Error(`taxonomy: child "${childId}" not found under ${dir} (expect dir or ${childId}.yml)`);
    }
  }
  const node: TaxonomyNode = { id: raw.id, label: raw.label, children };
  if (raw.description) node.description = raw.description;
  if (raw.keywords?.length) node.keywords = raw.keywords;
  if (raw.aliases?.length) node.aliases = raw.aliases;
  return node;
}

async function loadTopicLeafFile(filePath: string): Promise<TaxonomyNode> {
  const raw = parse(await readFile(filePath, "utf8")) as TaxonomyNode;
  if (!raw?.id || typeof raw.id !== "string") {
    throw new Error(`taxonomy: leaf ${filePath} must have string id`);
  }
  if (!raw.label || typeof raw.label !== "string") {
    throw new Error(`taxonomy: leaf ${filePath} must have string label`);
  }
  const node: TaxonomyNode = {
    id: raw.id,
    label: raw.label,
    expert_ids: raw.expert_ids,
    children: raw.children,
  };
  if (raw.description) node.description = raw.description;
  if (raw.keywords?.length) node.keywords = raw.keywords;
  if (raw.aliases?.length) node.aliases = raw.aliases;
  return node;
}

/**
 * True if `topics/root/topic.yml` exists (new rooted layout).
 */
export async function hasRootedTopicLayout(topicsDir: string): Promise<boolean> {
  const rootDir = join(topicsDir, "root");
  const yml = join(rootDir, "topic.yml");
  const yaml = join(rootDir, "topic.yaml");
  return (await isFile(yml)) || (await isFile(yaml));
}

/**
 * List legacy flat clade files: `topics/*.yaml` excluding index and the `root/` directory.
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
 * Load taxonomy from `topics/root/topic.yml` (rooted tree), else legacy flat `topics/*.yml` clades
 * merged under a synthetic root, else `topics/taxonomy.yaml`.
 */
export async function readTaxonomyMerged(assetsRoot: string): Promise<TaxonomyDoc | null> {
  const topicsDir = join(assetsRoot, "topics");
  const legacyPath = join(topicsDir, "taxonomy.yaml");
  const legacyPathYml = join(topicsDir, "taxonomy.yml");

  if (await hasRootedTopicLayout(topicsDir)) {
    const rootDir = join(topicsDir, "root");
    const taxonomy = await loadTopicBranchDir(rootDir);
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
