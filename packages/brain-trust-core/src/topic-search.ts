import type { TaxonomyDoc, TaxonomyNode } from "./taxonomy-types.js";

/** Flat row for fuzzy topic discovery and tooling. */
export interface TopicSearchRecord {
  id: string;
  label: string;
  pathIds: string[];
  pathLabels: string[];
  expert_ids?: string[];
  keywords?: string[];
  aliases?: string[];
  description?: string;
}

export function flattenTopicRecords(taxonomy: TaxonomyNode): TopicSearchRecord[] {
  const out: TopicSearchRecord[] = [];
  function walk(node: TaxonomyNode, pathIds: string[], pathLabels: string[]): void {
    const ids = [...pathIds, node.id];
    const labels = [...pathLabels, node.label ?? node.id];
    out.push({
      id: node.id,
      label: node.label ?? node.id,
      pathIds: ids,
      pathLabels: labels,
      expert_ids: node.expert_ids,
      keywords: node.keywords,
      aliases: node.aliases,
      description: node.description,
    });
    for (const c of node.children ?? []) walk(c, ids, labels);
  }
  walk(taxonomy, [], []);
  return out;
}

export function buildTopicSearchRecords(doc: TaxonomyDoc | null): TopicSearchRecord[] {
  if (!doc?.taxonomy) return [];
  return flattenTopicRecords(doc.taxonomy);
}

export interface TopicSearchHit {
  item: TopicSearchRecord;
  score?: number;
}

/**
 * Fuzzy search over topic records (labels, ids, paths, keywords, aliases, description).
 */
export async function searchTopicRecords(
  records: TopicSearchRecord[],
  query: string,
  limit = 12
): Promise<TopicSearchHit[]> {
  if (!query.trim()) return [];
  const Fuse = (await import("fuse.js")).default;
  const fuse = new Fuse(records, {
    keys: [
      { name: "id", weight: 0.35 },
      { name: "label", weight: 0.28 },
      { name: "pathLabels", weight: 0.12 },
      { name: "keywords", weight: 0.15 },
      { name: "aliases", weight: 0.08 },
      { name: "description", weight: 0.08 },
    ],
    threshold: 0.45,
    ignoreLocation: true,
  });
  return fuse.search(query.trim(), { limit }).map((r) => ({ item: r.item, score: r.score }));
}
