#!/usr/bin/env node
import {
  resolveDataRoot,
  readTopicIndex,
  readTaxonomy,
  readTopicSearchRecords,
  buildTopicSearchRecords,
  searchTopicRecords,
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

How to move (repeat and narrow):
  1. Map the domain     →  get-topic-taxonomy
  2. List persona ids    →  list-experts
  3. Open one voice      →  get-expert <id>
  4. Bundled playbooks   →  list-references  →  get-reference <path>

Topic index (skills list)     get-topic-index | list-topics
Full roster (large)           get-experts-rost   (add --json for scripts)
This skill’s frontmatter      read-skill-md

Commands:
  get-topic-taxonomy [--json]   Topic tree (topics/root/ or legacy); leaves list expert_ids
  search-topics <q> [--json]    Fuzzy topic search (Fuse.js); uses topics-search.json if present
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

Examples (iterative):
  brain-trust-cli get-topic-taxonomy
  brain-trust-cli list-experts
  brain-trust-cli get-expert william-e-byrd
  brain-trust-cli list-references
  brain-trust-cli get-reference discovery.md
`);
}

function printTaxonomyHuman(doc: { version: number; taxonomy: TaxonomyNode } | null, assets: string): void {
  if (!doc?.taxonomy) {
    console.log(`No taxonomy found under ${join(assets, "topics")} (expect topics/root/topic.yml, legacy *.yaml clades, or taxonomy.yaml)`);
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
    console.log(`Next: get-topic-taxonomy  |  get-expert <id>`);
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
