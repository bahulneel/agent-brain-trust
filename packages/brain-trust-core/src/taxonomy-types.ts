/** Root or branch node; leaves include `expert_ids` (may repeat across leaves). */
export interface TaxonomyNode {
  id: string;
  /** Display name; UI falls back to `id` when absent. */
  label?: string;
  expert_ids?: string[];
  children?: TaxonomyNode[];
  /** Discovery / fuzzy search (optional). */
  keywords?: string[];
  aliases?: string[];
  description?: string;
}

export interface TaxonomyDoc {
  version: number;
  taxonomy: TaxonomyNode;
}
