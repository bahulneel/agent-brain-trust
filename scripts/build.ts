import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readdir } from "node:fs/promises";
import esbuild from "esbuild";
import { materializeExpertAssets } from "brain-trust-db";
import { loadAndCompose } from "./compose.js";
import type { ComposeTarget } from "./compose.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CORE_SRC = join(ROOT, "packages", "brain-trust-core", "src", "index.ts");
const CONTENT = join(ROOT, "content");
const FRAGMENTS = join(CONTENT, "skill-fragments");
const DIST = join(ROOT, "dist");
const PLUGIN_OUT = join(DIST, "agent-brain-trust-cursor-plugin");
const MCP_OUT = join(DIST, "agent-brain-trust-mcp");
const SKILL_ZIPS = join(DIST, "skill-zips");

async function readPkgVersion(): Promise<string> {
  const p = join(ROOT, "package.json");
  const j = JSON.parse(await readFile(p, "utf8")) as { version: string };
  return j.version;
}

async function listSkillStems(): Promise<string[]> {
  const dir = join(CONTENT, "skills");
  const files = await readdir(dir);
  return files.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
}

async function ensureNameInFrontmatter(fm: string, stem: string): Promise<string> {
  if (!fm.startsWith("---")) return `---\nname: ${stem}\n---\n\n`;
  if (/\bname\s*:/m.test(fm)) {
    return fm.replace(/^name:\s*.+$/m, `name: ${stem}`);
  }
  return fm.replace(/^---\n/, `---\nname: ${stem}\n`);
}

async function materialiseSkill(
  stem: string,
  parentDir: string,
  target: ComposeTarget
): Promise<void> {
  const entry = join(CONTENT, "skills", `${stem}.md`);
  const { frontmatter, body } = await loadAndCompose(entry, FRAGMENTS, target);
  const fm = frontmatter
    ? await ensureNameInFrontmatter(frontmatter, stem)
    : `---\nname: ${stem}\n---\n\n`;
  const skillDir = join(parentDir, stem);
  await mkdir(join(skillDir, "scripts"), { recursive: true });
  await mkdir(join(skillDir, "references"), { recursive: true });
  await mkdir(join(skillDir, "assets", "topics"), { recursive: true });
  await mkdir(join(skillDir, "assets", "experts"), { recursive: true });
  await writeFile(join(skillDir, "SKILL.md"), `${fm}${body}`, "utf8");
}

async function copyTree(src: string, dest: string): Promise<void> {
  await cp(src, dest, { recursive: true, force: true });
}

async function bundleCliWithYaml(skillDir: string): Promise<void> {
  const entry = join(ROOT, "packages", "brain-trust-core", "src", "cli.ts");
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    target: "node20",
    format: "esm",
    outfile: join(skillDir, "scripts", "brain-trust-cli.js"),
    packages: "bundle",
  });
}

async function copyAssetsToSkill(skillDir: string): Promise<void> {
  try {
    await materializeExpertAssets(CONTENT, join(skillDir, "assets"));
  } catch {
    /* optional */
  }
  try {
    await copyTree(join(CONTENT, "references"), join(skillDir, "references"));
  } catch {
    /* optional */
  }
}

async function buildPluginSkills(stems: string[]): Promise<void> {
  const skillsRoot = join(PLUGIN_OUT, "skills");
  await mkdir(skillsRoot, { recursive: true });
  for (const stem of stems) {
    const skillDir = join(skillsRoot, stem);
    await mkdir(skillDir, { recursive: true });
    await materialiseSkill(stem, skillsRoot, "plugin");
    await bundleCliWithYaml(skillDir);
    await copyAssetsToSkill(skillDir);
  }
}

async function buildZipSkills(stems: string[]): Promise<void> {
  const stage = join(DIST, "_zip_stage");
  await rm(stage, { recursive: true, force: true });
  await mkdir(SKILL_ZIPS, { recursive: true });
  await mkdir(stage, { recursive: true });
  for (const stem of stems) {
    await materialiseSkill(stem, stage, "skill-zip");
    const skillDir = join(stage, stem);
    await bundleCliWithYaml(skillDir);
    await copyAssetsToSkill(skillDir);
    const zipFile = join(SKILL_ZIPS, `${stem}.zip`);
    const zipResult = spawnSync("zip", ["-q", "-r", zipFile, stem], {
      cwd: stage,
      encoding: "utf8",
    });
    if (zipResult.status !== 0) {
      throw new Error(`zip failed for ${stem}: ${zipResult.stderr}`);
    }
  }
  await rm(stage, { recursive: true, force: true });
}

async function copyResourcesToPlugin(): Promise<void> {
  const res = join(PLUGIN_OUT, "resources");
  await mkdir(res, { recursive: true });
  try {
    await materializeExpertAssets(CONTENT, res);
  } catch {
    /* empty */
  }
  try {
    await copyTree(join(CONTENT, "references"), join(res, "references"));
  } catch {
    /* empty */
  }
}

async function writePluginManifest(version: string): Promise<void> {
  const dir = join(PLUGIN_OUT, ".cursor-plugin");
  await mkdir(dir, { recursive: true });
  const manifest = {
    name: "agent-brain-trust",
    version,
    description: "Agent Brain Trust: BASHES, Writers Room, Librarian skills with MCP",
    author: { name: "agent-brain-trust" },
  };
  await writeFile(join(dir, "plugin.json"), JSON.stringify(manifest, null, 2), "utf8");
}

async function writeMcpConfig(): Promise<void> {
  const mcpEntry = join("scripts", "mcp-server.js");
  const cfg = {
    mcpServers: {
      "brain-trust": {
        command: "node",
        args: [mcpEntry],
        env: {
          BRAIN_TRUST_RESOURCES: "${workspaceFolder}/resources",
        },
      },
    },
  };
  await writeFile(join(PLUGIN_OUT, ".mcp.json"), JSON.stringify(cfg, null, 2), "utf8");
}

async function bundleMcpServer(): Promise<void> {
  const entry = join(ROOT, "packages", "brain-trust-mcp", "src", "index.ts");
  await mkdir(join(PLUGIN_OUT, "scripts"), { recursive: true });
  const mcpAlias = { "brain-trust-core": CORE_SRC };

  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    target: "node20",
    format: "esm",
    outfile: join(PLUGIN_OUT, "scripts", "mcp-server.js"),
    packages: "bundle",
    alias: mcpAlias,
  });

  await mkdir(MCP_OUT, { recursive: true });
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    target: "node20",
    format: "esm",
    outfile: join(MCP_OUT, "brain-trust-mcp.js"),
    packages: "bundle",
    alias: mcpAlias,
  });
  const pkg = {
    name: "agent-brain-trust-mcp-dist",
    version: await readPkgVersion(),
    type: "module",
    bin: { "brain-trust-mcp": "./brain-trust-mcp.js" },
  };
  await writeFile(join(MCP_OUT, "package.json"), JSON.stringify(pkg, null, 2), "utf8");
  try {
    await copyTree(join(PLUGIN_OUT, "resources"), join(MCP_OUT, "resources"));
  } catch {
    await mkdir(join(MCP_OUT, "resources"), { recursive: true });
  }
}

async function runSkillsRef(skillDir: string): Promise<void> {
  const bin = join(ROOT, "node_modules", ".bin", "skills-ref");
  const r = spawnSync(process.execPath, [bin, "validate", skillDir], {
    encoding: "utf8",
    cwd: ROOT,
  });
  if (r.status !== 0) {
    throw new Error(`skills-ref failed for ${skillDir}: ${r.stderr || r.stdout}`);
  }
}

async function cmdBuild(): Promise<void> {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
  const version = await readPkgVersion();
  const stems = await listSkillStems();
  if (stems.length === 0) {
    throw new Error("No skills found in content/skills/*.md");
  }

  await mkdir(PLUGIN_OUT, { recursive: true });
  await buildPluginSkills(stems);
  await copyResourcesToPlugin();
  await writePluginManifest(version);
  await writeMcpConfig();
  await bundleMcpServer();

  await buildZipSkills(stems);

  const readme = `# agent-brain-trust plugin (built)\n\nVersion ${version}\n`;
  await writeFile(join(PLUGIN_OUT, "README.md"), readme, "utf8");

  for (const stem of stems) {
    await runSkillsRef(join(PLUGIN_OUT, "skills", stem));
  }

  console.log("Build complete:", PLUGIN_OUT, MCP_OUT, SKILL_ZIPS);
}

async function cmdValidate(): Promise<void> {
  const stems = await listSkillStems();
  for (const stem of stems) {
    const entry = join(CONTENT, "skills", `${stem}.md`);
    await readFile(entry, "utf8");
  }
  console.log("validate ok:", stems.length, "skill entries");
}

const cmd = process.argv[2] ?? "build";
if (cmd === "build") {
  cmdBuild().catch((e) => {
    console.error(e);
    process.exit(1);
  });
} else if (cmd === "validate") {
  cmdValidate().catch((e) => {
    console.error(e);
    process.exit(1);
  });
} else {
  console.error("usage: tsx scripts/build.ts [build|validate]");
  process.exit(1);
}
