import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  listExpertIds,
  readExpertFile,
  readExpertsRost,
  listReferencePaths,
  readReferenceFile,
  readTopicIndex,
  readTaxonomy,
  readTopicSearchRecords,
  buildTopicSearchRecords,
  searchTopicRecords,
  listSkillFrontmatter,
} from "brain-trust-core";
import { join, resolve } from "node:path";
import { z } from "zod";

function getResourcesRoot(): string {
  const fromEnv = process.env.BRAIN_TRUST_RESOURCES;
  if (fromEnv) return fromEnv;
  return join(process.cwd(), "resources");
}

const resourcesRoot = getResourcesRoot();

const server = new McpServer({
  name: "brain-trust",
  version: "0.1.0",
});

server.registerTool(
  "list_topics",
  {
    description:
      "Return topics/index.yaml if present (plugin resources include a build-generated skills list). Expert indexing uses topics/knowledge-work/ tree or legacy layout; see get_topic_taxonomy.",
    inputSchema: z.object({}),
  },
  async () => {
    const idx = await readTopicIndex(resourcesRoot);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ hasIndex: idx !== null, index: idx }, null, 2),
        },
      ],
    };
  }
);

server.registerTool(
  "get_topic_taxonomy",
  {
    description:
      "Return hierarchical topic taxonomy (flat topics/*.yaml merged under a root, or legacy taxonomy.yaml): topic nodes with expert_ids on leaves; same expert id may appear under multiple leaves.",
    inputSchema: z.object({}),
  },
  async () => {
    const tax = await readTaxonomy(resourcesRoot);
    return {
      content: [{ type: "text", text: JSON.stringify(tax ?? {}, null, 2) }],
    };
  }
);

server.registerTool(
  "search_topics",
  {
    description:
      "Fuzzy search topic nodes by id, label, path, keywords, aliases (Fuse.js). Uses topics/topics-search.json when present, else builds from taxonomy.",
    inputSchema: z.object({
      query: z.string().describe("Search string"),
      limit: z.number().int().positive().max(50).optional().describe("Max results (default 12)"),
    }),
  },
  async ({ query, limit }) => {
    let records = await readTopicSearchRecords(resourcesRoot);
    if (!records?.length) {
      const tax = await readTaxonomy(resourcesRoot);
      records = buildTopicSearchRecords(tax);
    }
    const hits = await searchTopicRecords(records, query, limit ?? 12);
    return {
      content: [{ type: "text", text: JSON.stringify({ query, hits }, null, 2) }],
    };
  }
);

server.registerTool(
  "list_experts",
  {
    description:
      "List expert ids (basename without .md). Persona text is in experts/rost.json as id → content; .md files also kept.",
    inputSchema: z.object({}),
  },
  async () => {
    const ids = await listExpertIds(resourcesRoot);
    return {
      content: [{ type: "text", text: JSON.stringify({ expertIds: ids }, null, 2) }],
    };
  }
);

server.registerTool(
  "get_expert",
  {
    description:
      "Read expert persona markdown by id (e.g. william-e-byrd) or experts/foo.md; prefers bundled rost.json",
    inputSchema: z.object({
      path: z.string().describe("Expert id or path under experts/, e.g. william-e-byrd or william-e-byrd.md"),
    }),
  },
  async ({ path: rel }) => {
    const body = await readExpertFile(resourcesRoot, rel);
    return {
      content: [{ type: "text", text: body ?? "not found" }],
    };
  }
);

server.registerTool(
  "get_experts_rost",
  {
    description:
      "Return full experts/rost.json object: { version, experts: { [id]: markdown } } for bulk/script access",
    inputSchema: z.object({}),
  },
  async () => {
    const rost = await readExpertsRost(resourcesRoot);
    return {
      content: [{ type: "text", text: rost ? JSON.stringify(rost, null, 2) : "{}" }],
    };
  }
);

server.registerTool(
  "list_references",
  {
    description: "List reference markdown paths under resources/references",
    inputSchema: z.object({}),
  },
  async () => {
    const paths = await listReferencePaths(resourcesRoot);
    return {
      content: [{ type: "text", text: JSON.stringify({ references: paths }, null, 2) }],
    };
  }
);

server.registerTool(
  "get_reference",
  {
    description: "Read reference markdown by path relative to resources/references",
    inputSchema: z.object({
      path: z.string().describe("Relative path under references/"),
    }),
  },
  async ({ path: rel }) => {
    const body = await readReferenceFile(resourcesRoot, rel);
    return {
      content: [{ type: "text", text: body ?? "not found" }],
    };
  }
);

server.registerTool(
  "list_skills",
  {
    description: "List skills from a directory of Agent Skill folders containing SKILL.md",
    inputSchema: z.object({
      skillsDir: z.string().describe("Absolute or cwd-relative path to skills/"),
    }),
  },
  async ({ skillsDir }) => {
    const list = await listSkillFrontmatter(resolve(skillsDir));
    return {
      content: [{ type: "text", text: JSON.stringify(list, null, 2) }],
    };
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
