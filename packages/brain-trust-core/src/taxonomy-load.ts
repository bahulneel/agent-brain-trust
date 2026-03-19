import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";
import type { TaxonomyDoc, TaxonomyNode } from "./taxonomy-types.js";

export interface TaxonomyManifest {
  version: number;
  root: { id: string; label: string };
  /** Filenames under `topics/taxonomy/clades/` (order = child order under root). */
  clades: string[];
}

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

async function fileExists(p: string): Promise<boolean> {
  try {
    const s = await stat(p);
    return s.isFile();
  } catch {
    return false;
  }
}

async function loadClade(cladesDir: string, filename: string): Promise<TaxonomyNode> {
  const p = join(cladesDir, filename);
  const text = await readFile(p, "utf8");
  const node = parse(text) as TaxonomyNode;
  if (!node?.id || typeof node.id !== "string") {
    throw new Error(`taxonomy clade ${filename}: missing root id`);
  }
  return node;
}

/**
 * Load merged taxonomy from `topics/taxonomy/manifest.yaml` + `topics/taxonomy/clades/*.yaml`,
 * or fall back to monolithic `topics/taxonomy.yaml`.
 *
 * `assetsRoot` is the directory that contains `topics/` and `experts/` (e.g. skill `assets/` or repo `content/`).
 */
export async function readTaxonomyMerged(assetsRoot: string): Promise<TaxonomyDoc | null> {
  const topicsDir = join(assetsRoot, "topics");
  const manifestPath = join(topicsDir, "taxonomy", "manifest.yaml");
  const legacyPath = join(topicsDir, "taxonomy.yaml");
  const cladesDir = join(topicsDir, "taxonomy", "clades");

  if (await fileExists(manifestPath)) {
    const manifest = parse(await readFile(manifestPath, "utf8")) as TaxonomyManifest;
    if (!manifest.root?.id || !manifest.root?.label) {
      throw new Error("taxonomy manifest: root.id and root.label required");
    }
    if (!Array.isArray(manifest.clades)) {
      throw new Error("taxonomy manifest: clades must be an array of filenames");
    }
    const children: TaxonomyNode[] = [];
    for (const name of manifest.clades) {
      children.push(await loadClade(cladesDir, name));
    }
    const taxonomy: TaxonomyNode = {
      id: manifest.root.id,
      label: manifest.root.label,
      children,
    };
    assertUniqueTaxonomyNodeIds(taxonomy);
    return { version: manifest.version, taxonomy };
  }

  if (await fileExists(legacyPath)) {
    const text = await readFile(legacyPath, "utf8");
    const doc = parse(text) as TaxonomyDoc;
    if (doc?.taxonomy) assertUniqueTaxonomyNodeIds(doc.taxonomy);
    return doc;
  }

  return null;
}
