#!/usr/bin/env node
import {
  resolveDataRoot,
  readTopicIndex,
  readTaxonomy,
  readTopicSearchRecords,
  buildTopicSearchRecords,
  searchTopicRecords,
  resolveTopicRecords,
  listExpertIds,
  readExpertFile,
  readExpertsRost,
  listReferencePaths,
  readReferenceFile,
  parseFrontmatter,
} from "./index.js";
import type { ExpertsRost, TaxonomyNode } from "./index.js";
import { readFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function findSkillRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  if (basename(here) === "scripts") {
    return dirname(here);
  }
  return process.cwd();
}

function parseArgs(argv: string[]): { json: boolean; rest: string[] } {
  const rest = argv.filter((a) => a !== "--json");
  return { json: argv.includes("--json"), rest };
}

function printDiscoveryHelp(skillRoot: string, assets: string): void {
  console.log(`Brain Trust CLI — iterative discovery (skill root: ${skillRoot})
Assets: ${assets}

How to move (fast resolve vs broad browse):
  • Several task keywords  →  resolve-topics <q1> [q2 ...] [--strategy merge|intersect|converge]
  • Broad / exploratory    →  search-topics <q>  then  get-topic-taxonomy  as needed
  • Personas                              →  list-experts  →  get-expert <id>
  • Bundled playbooks                     →  list-references  →  get-reference <path>

Topic index (skills list)     get-topic-index | list-topics
Full roster (large)           get-experts-rost   (add --json for scripts)
This skill’s frontmatter      read-skill-md

Commands:
  get-topic-taxonomy [--json]   Topic tree (topics/knowledge-work/ or legacy); leaves list expert_ids
  search-topics <q> [--json]    Fuzzy topic search (Fuse.js); catch-all progressive discovery
  resolve-topics [opts] <q1> [q2 ...] [--json]
                                Multi-query resolution: --strategy merge (default) | intersect | converge
                                --limit N  --per-query-limit N
  list-experts [--json]         All expert ids (rost keys)
  get-expert <id>               One persona markdown (try an id from taxonomy or list-experts)
  get-experts-rost [--json]     Full { experts: { id: body } } — prefer get-expert for one voice
  get-topic-index [--json]      Parsed topics/index.yaml (optional; plugin resources may include build-generated skills list)
  list-topics [--json]          Whether index exists + path reminder
  list-references [--json]      Paths under references/
  get-reference <path>          One reference doc (see list-references)
  read-skill-md [--json]        SKILL.md YAML frontmatter

  help | --help                 This screen

Global:
  --json                        Raw JSON only (no hints); use for automation.

Examples:
  brain-trust-cli resolve-topics --strategy converge distributed consistency
  brain-trust-cli get-topic-taxonomy
  brain-trust-cli list-experts
  brain-trust-cli get-expert william-e-byrd
  brain-trust-cli list-references
  brain-trust-cli get-reference discovery.md
`);
}

type ResolveCliStrategy = "merge" | "intersect" | "converge";

function parseResolveTopicsArgv(argv: string[]): {
  json: boolean;
  strategy: ResolveCliStrategy;
  limit?: number;
  perQueryLimit?: number;
  maxConvergeIterations?: number;
  positional: string[];
} {
  let json = false;
  let strategy: ResolveCliStrategy = "merge";
  let limit: number | undefined;
  let perQueryLimit: number | undefined;
  let maxConvergeIterations: number | undefined;
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") {
      json = true;
      continue;
    }
    if (a === "--strategy" && argv[i + 1]) {
      const v = argv[++i] as ResolveCliStrategy;
      if (v === "merge" || v === "intersect" || v === "converge") strategy = v;
      continue;
    }
    if (a === "--limit" && argv[i + 1]) {
      limit = Number.parseInt(argv[++i], 10);
      continue;
    }
    if (a === "--per-query-limit" && argv[i + 1]) {
      perQueryLimit = Number.parseInt(argv[++i], 10);
      continue;
    }
    if (a === "--max-converge-iterations" && argv[i + 1]) {
      maxConvergeIterations = Number.parseInt(argv[++i], 10);
      continue;
    }
    if (a.startsWith("-")) continue;
    positional.push(a);
  }
  return { json, strategy, limit, perQueryLimit, maxConvergeIterations, positional };
}

function printTaxonomyHuman(doc: { version: number; taxonomy: TaxonomyNode } | null, assets: string): void {
  if (!doc?.taxonomy) {
    console.log(`No taxonomy found under ${join(assets, "topics")} (expect topics/knowledge-work/topic.yml, legacy *.yaml clades, or taxonomy.yaml)`);
    console.log(`\nNext: confirm assets path (cwd should be a skill with assets/topics/).`);
    return;
  }
  console.log(`Topic taxonomy (v${doc.version}) — drill from root to leaves; leaves list expert_ids.\n`);

  function walk(node: TaxonomyNode, depth: number): void {
    const label = node.label ?? node.id;
    const indent = "  ".repeat(depth);
    if (depth === 0) {
      console.log(`${label}  [${node.id}]`);
    } else {
      console.log(`${indent}└ ${label}  [${node.id}]`);
    }
    if (node.expert_ids?.length) {
      const pad = `${indent}   `;
      console.log(`${pad}experts: ${node.expert_ids.join(", ")}`);
      console.log(`${pad}→      get-expert ${node.expert_ids[0]}`);
    }
    for (const ch of node.children ?? []) {
      walk(ch, depth + 1);
    }
  }
  walk(doc.taxonomy, 0);

  console.log(`
Next:
  list-experts               # flat list of all ids
  get-expert <id>            # load one persona
  get-experts-rost --json    # full bundle (tools only; large)
`);
}

function printExpertListHuman(ids: string[]): void {
  console.log(`${ids.length} expert persona(s). Pick one and load it:\n`);
  for (const id of ids) {
    console.log(`  • ${id}`);
  }
  console.log(`
Next:
  get-expert ${ids[0] ?? "<id>"}     # replace with any id above
  get-topic-taxonomy               # see how ids group under topics
`);
}

function printRostHuman(rost: ExpertsRost | null): void {
  if (!rost?.experts) {
    console.log("No rost.json found under assets/experts/");
    console.log("Next: run from a built skill with materialized experts.");
    return;
  }
  const keys = Object.keys(rost.experts).sort();
  console.log(`Expert roster (${keys.length} personas). Full JSON is large — prefer one id at a time.\n`);
  console.log(`Ids: ${keys.join(", ")}\n`);
  console.log(`Next:
  get-expert ${keys[0] ?? "id"}        # one persona
  get-experts-rost --json   # full { version, experts } for tools only
`);
}

function printReferencesHuman(paths: string[], skillRoot: string): void {
  console.log(`${paths.length} reference file(s) under ${join(skillRoot, "references")}:\n`);
  for (const p of paths) {
    console.log(`  • ${p}`);
  }
  console.log(`
Next:
  get-reference INDEX.md           # route map
  get-reference discovery.md       # how to use this tree
  get-reference mcp-tools.md       # if using MCP
`);
}

async function main(): Promise<void> {
  const raw = process.argv.slice(2);
  const { json, rest } = parseArgs(raw);
  const cmd = rest[0] ?? "help";
  const skillRoot = findSkillRoot();
  const assets = resolveDataRoot(skillRoot);

  if (cmd === "help" || cmd === "--help") {
    printDiscoveryHelp(skillRoot, assets);
    return;
  }

  if (cmd === "list-topics") {
    const idx = await readTopicIndex(assets);
    if (json) {
      console.log(JSON.stringify({ assetsRoot: assets, hasIndex: idx !== null }, null, 2));
      return;
    }
    console.log(`Topics index: ${idx ? "present" : "missing"} at ${join(assets, "topics", "index.yaml")}`);
    console.log(`assets: ${assets}\n`);
    console.log(`Next:
  get-topic-index       # full YAML as data
  get-topic-taxonomy    # expert placement (start here for navigation)
`);
    return;
  }

  if (cmd === "get-topic-index") {
    const idx = await readTopicIndex(assets);
    if (json) {
      console.log(JSON.stringify(idx ?? {}, null, 2));
      return;
    }
    console.log(JSON.stringify(idx ?? {}, null, 2));
    console.log(`
Next:
  get-topic-taxonomy    # hierarchical map + expert_ids on leaves
`);
    return;
  }

  if (cmd === "list-experts") {
    const ids = await listExpertIds(assets);
    if (json) {
      console.log(JSON.stringify({ expertIds: ids }, null, 2));
      return;
    }
    printExpertListHuman(ids);
    return;
  }

  if (cmd === "get-experts-rost") {
    const rost = await readExpertsRost(assets);
    if (json) {
      console.log(JSON.stringify(rost ?? {}, null, 2));
      return;
    }
    printRostHuman(rost);
    return;
  }

  if (cmd === "get-topic-taxonomy") {
    const tax = await readTaxonomy(assets);
    if (json) {
      console.log(JSON.stringify(tax ?? {}, null, 2));
      return;
    }
    printTaxonomyHuman(tax, assets);
    return;
  }

  if (cmd === "search-topics") {
    const q = rest.slice(1).join(" ").trim();
    if (!q) {
      console.error(`usage: search-topics <query>

Example:
  brain-trust-cli search-topics distributed consistency
`);
      process.exit(1);
    }
    let records = await readTopicSearchRecords(assets);
    if (!records?.length) {
      const tax = await readTaxonomy(assets);
      records = buildTopicSearchRecords(tax);
    }
    const hits = await searchTopicRecords(records, q, 15);
    if (json) {
      console.log(JSON.stringify({ query: q, hits }, null, 2));
      return;
    }
    console.log(`Topic search: "${q}" (${hits.length} hit(s))\n`);
    for (const h of hits) {
      const path = h.item.pathLabels.join(" → ");
      console.log(`  • ${h.item.label} [${h.item.id}]`);
      console.log(`    path: ${path}`);
      if (h.item.expert_ids?.length) {
        console.log(`    experts: ${h.item.expert_ids.join(", ")}`);
      }
      console.log("");
    }
    console.log(`Next: get-topic-taxonomy  |  get-expert <id>  |  resolve-topics …`);
    return;
  }

  if (cmd === "resolve-topics") {
    const ro = parseResolveTopicsArgv(rest.slice(1));
    const queries = ro.positional.map((s) => s.trim()).filter(Boolean);
    if (queries.length === 0) {
      console.error(`usage: resolve-topics [options] <query1> [query2 ...]

Options:
  --strategy merge|intersect|converge   default merge
  --limit N                             max merged results (default 12)
  --per-query-limit N                   fuse depth per query
  --max-converge-iterations N           cap for converge (default 3)
  --json

Examples:
  brain-trust-cli resolve-topics distributed consistency
  brain-trust-cli resolve-topics --strategy intersect organisation squads
  brain-trust-cli resolve-topics --strategy converge --json agent skills MCP
`);
      process.exit(1);
    }
    let records = await readTopicSearchRecords(assets);
    if (!records?.length) {
      const tax = await readTaxonomy(assets);
      records = buildTopicSearchRecords(tax);
    }
    const result = await resolveTopicRecords(records, {
      queries,
      limit: ro.limit,
      perQueryLimit: ro.perQueryLimit,
      strategy: ro.strategy,
      maxConvergeIterations: ro.maxConvergeIterations,
    });
    if (ro.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    console.log(
      `resolve-topics: strategy=${result.strategy} iterations=${result.iterations} converged=${result.converged} queries=${JSON.stringify(result.queries)}\n`
    );
    for (const h of result.hits) {
      const path = h.item.pathLabels.join(" → ");
      console.log(`  • ${h.item.label} [${h.item.id}]  support=${h.support} score≈${h.bestScore.toFixed(4)}`);
      console.log(`    path: ${path}`);
      if (h.item.expert_ids?.length) {
        console.log(`    experts: ${h.item.expert_ids.join(", ")}`);
      }
      console.log("");
    }
    console.log(`Next: get-expert <id>  |  search-topics <broader q>  |  get-topic-taxonomy`);
    return;
  }

  if (cmd === "get-expert") {
    const rel = rest[1];
    if (!rel) {
      console.error(`usage: get-expert <id>

No id given. Discover ids with:
  list-experts
  get-topic-taxonomy
`);
      process.exit(1);
    }
    const body = await readExpertFile(assets, rel);
    if (body === null) {
      console.error(`not found: ${rel}

Try:
  list-experts
  get-topic-taxonomy
`);
      process.exit(1);
    }
    console.log(body);
    console.log(`
— end of persona: ${rel.replace(/\.md$/i, "")} —
Next:
  get-expert <another-id>   # compare voices
  get-topic-taxonomy        # see topic placement
`);
    return;
  }

  if (cmd === "list-references") {
    const paths = await listReferencePaths(skillRoot);
    if (json) {
      console.log(JSON.stringify({ references: paths }, null, 2));
      return;
    }
    printReferencesHuman(paths, skillRoot);
    return;
  }

  if (cmd === "get-reference") {
    const rel = rest[1];
    if (!rel) {
      console.error(`usage: get-reference <path>

List paths with: list-references
`);
      process.exit(1);
    }
    const body = await readReferenceFile(skillRoot, rel);
    if (body === null) {
      console.error(`not found: ${rel}

Try: list-references
`);
      process.exit(1);
    }
    console.log(body);
    console.log(`
— end of reference: ${rel} —
Next:
  get-reference INDEX.md     # overview of reference set
  list-references
`);
    return;
  }

  if (cmd === "read-skill-md") {
    const skillMd = join(skillRoot, "SKILL.md");
    const rawMd = await readFile(skillMd, "utf8");
    const fm = parseFrontmatter(rawMd);
    if (json) {
      console.log(JSON.stringify(fm, null, 2));
      return;
    }
    console.log(JSON.stringify(fm, null, 2));
    console.log(`
Next:
  get-topic-taxonomy     # how experts are indexed
  list-experts
  list-references        # progressive-disclosure docs
`);
    return;
  }

  console.error(`Unknown command: ${cmd}

`);
  printDiscoveryHelp(skillRoot, assets);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
