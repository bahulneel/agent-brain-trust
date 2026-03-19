import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

export interface TaxonomyNode {
  id: string;
  label?: string;
  expert_ids?: string[];
  children?: TaxonomyNode[];
}

interface TaxonomyFile {
  version: number;
  taxonomy: TaxonomyNode;
}

/** Build `experts/rost.json`: `{ version, experts: { [id]: markdown } }` from `experts/*.md`. */
export async function writeExpertsRostJson(expertsDir: string): Promise<void> {
  let names: string[];
  try {
    names = await readdir(expertsDir);
  } catch {
    return;
  }
  const experts: Record<string, string> = {};
  for (const name of names) {
    if (!name.endsWith(".md")) continue;
    const id = name.replace(/\.md$/, "");
    const text = await readFile(join(expertsDir, name), "utf8");
    experts[id] = text;
  }
  if (Object.keys(experts).length === 0) return;
  const out = { version: 1, experts };
  await writeFile(join(expertsDir, "rost.json"), JSON.stringify(out, null, 2), "utf8");
}

function collectTaxonomyExpertIds(node: TaxonomyNode): Set<string> {
  const s = new Set<string>();
  for (const id of node.expert_ids ?? []) s.add(id);
  for (const c of node.children ?? []) {
    for (const x of collectTaxonomyExpertIds(c)) s.add(x);
  }
  return s;
}

/** Ensure every taxonomy leaf id has a matching `experts/<id>.md` and every expert file appears on some leaf. */
export async function validateExpertsAgainstTaxonomy(contentRoot: string): Promise<void> {
  const expertsDir = join(contentRoot, "experts");
  const mdNames = (await readdir(expertsDir)).filter((f) => f.endsWith(".md"));
  const fileIds = new Set(mdNames.map((n) => n.replace(/\.md$/, "")));
  const taxPath = join(contentRoot, "topics", "taxonomy.yaml");
  const doc = parseYaml(await readFile(taxPath, "utf8")) as TaxonomyFile;
  const fromTax = collectTaxonomyExpertIds(doc.taxonomy);
  for (const id of fromTax) {
    if (!fileIds.has(id)) {
      throw new Error(`taxonomy.yaml references unknown expert id (no ${id}.md): ${id}`);
    }
  }
  for (const id of fileIds) {
    if (!fromTax.has(id)) {
      throw new Error(`experts/${id}.md is not listed on any taxonomy leaf`);
    }
  }
}

/**
 * Copy `content/experts` and `content/topics` into `assetsOut/experts` and `assetsOut/topics`,
 * validate taxonomy, then write `assetsOut/experts/rost.json`.
 */
export async function materializeExpertAssets(contentRoot: string, assetsOutRoot: string): Promise<void> {
  await validateExpertsAgainstTaxonomy(contentRoot);
  const srcExperts = join(contentRoot, "experts");
  const srcTopics = join(contentRoot, "topics");
  const destExperts = join(assetsOutRoot, "experts");
  const destTopics = join(assetsOutRoot, "topics");
  await mkdir(destExperts, { recursive: true });
  await mkdir(destTopics, { recursive: true });
  await cp(srcExperts, destExperts, { recursive: true, force: true });
  await cp(srcTopics, destTopics, { recursive: true, force: true });
  await writeExpertsRostJson(destExperts);
}
