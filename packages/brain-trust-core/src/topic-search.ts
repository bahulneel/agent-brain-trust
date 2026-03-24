import Fuse from "fuse.js";
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

type FuseHit<T> = { item: T; score?: number };

type TopicFuse = InstanceType<typeof Fuse<TopicSearchRecord>>;

/** How to combine multi-query search into a ranked list (see {@link resolveTopicRecords}). */
export type ResolveTopicStrategy = "merge" | "intersect" | "converge";

export interface ResolveTopicRecordsParams {
  /** Non-empty search strings (trimmed, deduped). */
  queries: string[];
  /** Max rows returned after merge / intersect / converge. */
  limit?: number;
  /** Fuse depth per query before aggregation (default: max(limit, 10)). */
  perQueryLimit?: number;
  /** merge = vote across queries; intersect = must appear in every query’s top band; converge = merge + fixed-point refinement. */
  strategy?: ResolveTopicStrategy;
  /** Max refinement rounds for `converge` (default 3). */
  maxConvergeIterations?: number;
}

export interface ResolveTopicHit {
  item: TopicSearchRecord;
  /** Best (lowest) Fuse score seen for this topic across supporting queries. */
  bestScore: number;
  /** How many input queries returned this topic in their per-query band. */
  support: number;
}

export interface ResolveTopicRecordsResult {
  queries: string[];
  strategy: ResolveTopicStrategy;
  converged: boolean;
  iterations: number;
  hits: ResolveTopicHit[];
}

function createTopicFuse(records: TopicSearchRecord[]): TopicFuse {
  return new Fuse(records, {
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
  }) as TopicFuse;
}

function scoreValue(score: number | undefined): number {
  return score ?? 1;
}

function mergeQueryHits(
  fuse: TopicFuse,
  queries: string[],
  perQueryLimit: number
): Map<string, { item: TopicSearchRecord; bestScore: number; support: number }> {
  const byId = new Map<string, { item: TopicSearchRecord; bestScore: number; support: number }>();
  for (const q of queries) {
    const trimmed = q.trim();
    if (!trimmed) continue;
    const hits = fuse.search(trimmed, { limit: perQueryLimit }) as FuseHit<TopicSearchRecord>[];
    for (const r of hits) {
      const id = r.item.id;
      const sc = scoreValue(r.score);
      const prev = byId.get(id);
      if (!prev) {
        byId.set(id, { item: r.item, bestScore: sc, support: 1 });
      } else {
        prev.support += 1;
        if (sc < prev.bestScore) prev.bestScore = sc;
      }
    }
  }
  return byId;
}

function sortMerged(
  byId: Map<string, { item: TopicSearchRecord; bestScore: number; support: number }>,
  limit: number
): ResolveTopicHit[] {
  return [...byId.values()]
    .sort((a, b) => {
      if (b.support !== a.support) return b.support - a.support;
      return a.bestScore - b.bestScore;
    })
    .slice(0, limit)
    .map((v) => ({
      item: v.item,
      bestScore: v.bestScore,
      support: v.support,
    }));
}

function intersectQueryHits(
  fuse: TopicFuse,
  queries: string[],
  perQueryLimit: number
): ResolveTopicHit[] {
  if (queries.length === 0) return [];
  const bands = queries
    .map((q) => q.trim())
    .filter(Boolean)
    .map((q) => fuse.search(q, { limit: perQueryLimit }) as FuseHit<TopicSearchRecord>[]);
  if (bands.length === 0) return [];
  const first = bands[0];
  const out: ResolveTopicHit[] = [];
  for (const r of first) {
    const id = r.item.id;
    let sum = scoreValue(r.score);
    let ok = true;
    for (let i = 1; i < bands.length; i++) {
      const hit = bands[i].find((h) => h.item.id === id);
      if (!hit) {
        ok = false;
        break;
      }
      sum += scoreValue(hit.score);
    }
    if (ok) {
      out.push({
        item: r.item,
        bestScore: sum / bands.length,
        support: bands.length,
      });
    }
  }
  out.sort((a, b) => a.bestScore - b.bestScore);
  return out;
}

function refinementQueryFromHit(hit: ResolveTopicHit | undefined): string | null {
  if (!hit) return null;
  const parts: string[] = [hit.item.label];
  for (const k of hit.item.keywords ?? []) {
    if (parts.join(" ").length > 180) break;
    parts.push(k);
  }
  const s = parts.join(" ").trim();
  return s.length ? s : null;
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
  const fuse = createTopicFuse(records);
  return fuse.search(query.trim(), { limit }).map((r) => ({ item: r.item, score: r.score }));
}

/**
 * Multi-query topic resolution: merges votes, strict intersection, or merge + fixed-point refinement
 * using the top hit’s label/keywords. Use {@link searchTopicRecords} for open-ended progressive discovery.
 */
export async function resolveTopicRecords(
  records: TopicSearchRecord[],
  params: ResolveTopicRecordsParams
): Promise<ResolveTopicRecordsResult> {
  const raw = params.queries.map((q) => q.trim()).filter(Boolean);
  const queries = [...new Set(raw)];
  const limit = params.limit ?? 12;
  const perQueryLimit = params.perQueryLimit ?? Math.max(limit, 10);
  const strategy = params.strategy ?? "merge";
  const maxConverge = params.maxConvergeIterations ?? 3;

  if (queries.length === 0) {
    return { queries: [], strategy, converged: false, iterations: 0, hits: [] };
  }

  const fuse = createTopicFuse(records);

  if (strategy === "intersect") {
    const hits =
      queries.length === 1
        ? sortMerged(mergeQueryHits(fuse, queries, perQueryLimit), limit)
        : intersectQueryHits(fuse, queries, perQueryLimit).slice(0, limit);
    return {
      queries,
      strategy,
      converged: true,
      iterations: 1,
      hits,
    };
  }

  if (strategy === "merge") {
    const byId = mergeQueryHits(fuse, queries, perQueryLimit);
    return {
      queries,
      strategy,
      converged: true,
      iterations: 1,
      hits: sortMerged(byId, limit),
    };
  }

  // converge: fixed-point — expand query set with top-hit refinement until stable top id or cap
  let roundQueries = [...queries];
  const seenRefinements = new Set<string>();
  let prevTopId: string | undefined;
  let converged = false;

  for (let iter = 0; iter < maxConverge; iter++) {
    const byId = mergeQueryHits(fuse, roundQueries, perQueryLimit);
    const hits = sortMerged(byId, limit);
    const topId = hits[0]?.item.id;

    if (iter > 0 && topId !== undefined && topId === prevTopId) {
      converged = true;
      return {
        queries: roundQueries,
        strategy,
        converged,
        iterations: iter + 1,
        hits,
      };
    }
    prevTopId = topId;

    const ref = refinementQueryFromHit(hits[0]);
    if (!ref || seenRefinements.has(ref)) {
      return {
        queries: roundQueries,
        strategy,
        converged: iter > 0,
        iterations: iter + 1,
        hits,
      };
    }
    seenRefinements.add(ref);
    roundQueries = [...roundQueries, ref];
  }

  const byId = mergeQueryHits(fuse, roundQueries, perQueryLimit);
  const finalHits = sortMerged(byId, limit);
  return {
    queries: roundQueries,
    strategy,
    converged,
    iterations: maxConverge,
    hits: finalHits,
  };
}
