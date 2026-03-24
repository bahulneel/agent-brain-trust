/**
 * Integration test: run the brain-trust MCP server (stdio) and exercise the tool
 * sequence a workshop moderator uses when applying the Guest Protocol drafting
 * discipline (taxonomy search → resolve expert id → load persona; plus references).
 *
 * Usage: from repo root, after `npm run build`:
 *   tsx scripts/test-mcp-drafting-protocol.ts
 *
 * Runs the same bundle and resources layout as the published npm package (`@bahulneel/brain-trust-mcp`).
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MCP_SERVER = join(ROOT, "packages/brain-trust-mcp/dist/brain-trust-mcp.js");
const RESOURCES = join(ROOT, "packages/brain-trust-mcp/resources");

function firstText(result: Awaited<ReturnType<Client["callTool"]>>): string {
  const content = result.content;
  if (!Array.isArray(content)) return "";
  for (const c of content) {
    if (c && typeof c === "object" && "type" in c && c.type === "text" && "text" in c) {
      const t = (c as { text: unknown }).text;
      if (typeof t === "string") return t;
    }
  }
  return "";
}

async function main(): Promise<void> {
  if (!existsSync(MCP_SERVER)) {
    console.error("Missing MCP bundle. Run: npm run build");
    process.exit(1);
  }
  if (!existsSync(RESOURCES)) {
    console.error("Missing plugin resources. Run: npm run build");
    process.exit(1);
  }

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [MCP_SERVER],
    env: { ...process.env, BRAIN_TRUST_RESOURCES: RESOURCES },
    stderr: "inherit",
  });

  const client = new Client(
    { name: "drafting-protocol-test", version: "0.0.1" },
    { capabilities: {} }
  );

  await client.connect(transport);

  const { tools } = await client.listTools();
  const names = new Set(tools.map((t) => t.name));
  const required = [
    "search_topics",
    "get_topic_taxonomy",
    "list_experts",
    "get_expert",
    "list_references",
    "get_reference",
  ];
  const missing = required.filter((n) => !names.has(n));
  if (missing.length) {
    console.error("Missing tools:", missing.join(", "));
    process.exit(1);
  }
  console.log("tools/list ok:", tools.length, "tools");

  // --- Simulate drafting workflow (MCP primitives; protocol is in SKILL text) ---

  const search = await client.callTool({
    name: "search_topics",
    arguments: { query: "agent interfaces prompting", limit: 8 },
  });
  const searchText = firstText(search);
  const searchJson = JSON.parse(searchText) as {
    hits?: { item?: { id?: string; expert_ids?: string[] } }[];
  };
  const firstHit = searchJson.hits?.[0]?.item;
  if (!firstHit?.id) {
    console.error("search_topics: expected hits[0].item.id, got:", searchText.slice(0, 500));
    process.exit(1);
  }
  console.log("search_topics ok: first hit", firstHit.id);

  const tax = await client.callTool({ name: "get_topic_taxonomy", arguments: {} });
  if (!firstText(tax).includes("knowledge-work")) {
    console.warn("get_topic_taxonomy: unexpected shape (no knowledge-work string in first 200 chars)");
  }
  console.log("get_topic_taxonomy ok: bytes", firstText(tax).length);

  const experts = await client.callTool({ name: "list_experts", arguments: {} });
  const expertJson = JSON.parse(firstText(experts)) as { expertIds?: string[] };
  if (!expertJson.expertIds?.includes("denny-zhou")) {
    console.error("list_experts: expected denny-zhou in roster");
    process.exit(1);
  }
  console.log("list_experts ok: count", expertJson.expertIds?.length);

  const pick =
    firstHit.expert_ids?.[0] ??
    (searchJson.hits
      ?.map((h) => h.item)
      .find((it) => it?.expert_ids?.length)?.expert_ids?.[0] ??
      "denny-zhou");
  const persona = await client.callTool({
    name: "get_expert",
    arguments: { path: pick },
  });
  const body = firstText(persona);
  if (!body.includes("Bio") && !body.includes("bio")) {
    console.error("get_expert: expected persona markdown for", pick);
    process.exit(1);
  }
  console.log("get_expert ok:", pick, "chars", body.length);

  const refs = await client.callTool({ name: "list_references", arguments: {} });
  const refsJson = JSON.parse(firstText(refs)) as { references?: string[] };
  if (!refsJson.references?.includes("mcp-tools.md")) {
    console.error("list_references: expected mcp-tools.md");
    process.exit(1);
  }
  console.log("list_references ok");

  const mcpTools = await client.callTool({
    name: "get_reference",
    arguments: { path: "mcp-tools.md" },
  });
  if (!firstText(mcpTools).includes("list_experts")) {
    console.error("get_reference mcp-tools.md: unexpected content");
    process.exit(1);
  }
  console.log("get_reference ok: mcp-tools.md");

  await transport.close();
  console.log("\nDrafting-protocol MCP exercise: all checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
