#!/usr/bin/env node
import {
  resolveDataRoot,
  readTopicIndex,
  readTaxonomy,
  listExpertIds,
  readExpertFile,
  readExpertsRost,
  listReferencePaths,
  readReferenceFile,
  parseFrontmatter,
} from "./index.js";
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

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const cmd = args[0] ?? "help";
  const skillRoot = findSkillRoot();
  const assets = resolveDataRoot(skillRoot);

  if (cmd === "help" || cmd === "--help") {
    console.log(`brain-trust-cli — Brain Trust discovery (run with cwd or from skill scripts/)

Commands:
  list-topics              JSON: whether topics/index.yaml exists
  get-topic-index          JSON: parsed index.yaml
  list-experts             JSON: expertIds from rost.json (or .md basenames)
  get-expert <id>          Print expert markdown (id or experts/foo.md)
  get-experts-rost         Print full experts/rost.json
  get-topic-taxonomy       Print topics/taxonomy.yaml as JSON
  list-references          JSON: reference .md paths under references/
  get-reference <rel-path> Print reference file (path under references/)
  read-skill-md            JSON: SKILL.md frontmatter
`);
    return;
  }

  if (cmd === "list-topics") {
    const idx = await readTopicIndex(assets);
    console.log(JSON.stringify({ assetsRoot: assets, hasIndex: idx !== null }, null, 2));
    return;
  }

  if (cmd === "get-topic-index") {
    const idx = await readTopicIndex(assets);
    console.log(JSON.stringify(idx ?? {}, null, 2));
    return;
  }

  if (cmd === "list-experts") {
    const ids = await listExpertIds(assets);
    console.log(JSON.stringify({ expertIds: ids }, null, 2));
    return;
  }

  if (cmd === "get-experts-rost") {
    const rost = await readExpertsRost(assets);
    console.log(JSON.stringify(rost ?? {}, null, 2));
    return;
  }

  if (cmd === "get-topic-taxonomy") {
    const tax = await readTaxonomy(assets);
    console.log(JSON.stringify(tax ?? {}, null, 2));
    return;
  }

  if (cmd === "get-expert") {
    const rel = args[1];
    if (!rel) {
      console.error("usage: get-expert <id-or-path-under-experts>");
      process.exit(1);
    }
    const body = await readExpertFile(assets, rel);
    if (body === null) {
      console.error("not found");
      process.exit(1);
    }
    console.log(body);
    return;
  }

  if (cmd === "list-references") {
    const paths = await listReferencePaths(skillRoot);
    console.log(JSON.stringify({ references: paths }, null, 2));
    return;
  }

  if (cmd === "get-reference") {
    const rel = args[1];
    if (!rel) {
      console.error("usage: get-reference <relative-path-under-references>");
      process.exit(1);
    }
    const body = await readReferenceFile(skillRoot, rel);
    if (body === null) {
      console.error("not found");
      process.exit(1);
    }
    console.log(body);
    return;
  }

  if (cmd === "read-skill-md") {
    const skillMd = join(skillRoot, "SKILL.md");
    const raw = await readFile(skillMd, "utf8");
    console.log(JSON.stringify(parseFrontmatter(raw), null, 2));
    return;
  }

  console.error("unknown command:", cmd);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
