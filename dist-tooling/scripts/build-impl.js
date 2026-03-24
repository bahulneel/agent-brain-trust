import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readdir } from "node:fs/promises";
import { stringify } from "yaml";
import esbuild from "esbuild";
import { materializeExpertAssets } from "brain-trust-db";
import { buildTopicSearchRecords, readTaxonomy } from "brain-trust-core";
import { loadAndCompose } from "./compose.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CORE_SRC = join(ROOT, "packages", "brain-trust-core", "src", "index.ts");
const CONTENT = join(ROOT, "content");
const FRAGMENTS = join(CONTENT, "skill-fragments");
const DIST = join(ROOT, "dist");
const PLUGIN_OUT = join(DIST, "agent-brain-trust-cursor-plugin");
const CLAUDE_PLUGIN_OUT = join(DIST, "agent-brain-trust-claude-plugin");
const MCP_OUT = join(DIST, "agent-brain-trust-mcp");
const SKILL_ZIPS = join(DIST, "skill-zips");
async function readPkgVersion() {
    const p = join(ROOT, "package.json");
    const j = JSON.parse(await readFile(p, "utf8"));
    return j.version;
}
async function listSkillStems() {
    const dir = join(CONTENT, "skills");
    const files = await readdir(dir);
    return files.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
}
async function ensureNameInFrontmatter(fm, stem) {
    if (!fm.startsWith("---"))
        return `---\nname: ${stem}\n---\n\n`;
    if (/\bname\s*:/m.test(fm)) {
        return fm.replace(/^name:\s*.+$/m, `name: ${stem}`);
    }
    return fm.replace(/^---\n/, `---\nname: ${stem}\n`);
}
async function materialiseSkill(stem, parentDir, target) {
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
async function copyTree(src, dest) {
    await cp(src, dest, { recursive: true, force: true });
}
/** Precomputed rows for fuzzy topic search (Fuse.js) under `assets/topics/topics-search.json`. */
async function writeTopicSearchIndex(assetsRoot) {
    const doc = await readTaxonomy(assetsRoot);
    const records = buildTopicSearchRecords(doc);
    await mkdir(join(assetsRoot, "topics"), { recursive: true });
    await writeFile(join(assetsRoot, "topics", "topics-search.json"), JSON.stringify(records, null, 2), "utf8");
}
async function bundleCliWithYaml(skillDir) {
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
async function copyAssetsToSkill(skillDir) {
    try {
        await materializeExpertAssets(CONTENT, join(skillDir, "assets"));
        await writeTopicSearchIndex(join(skillDir, "assets"));
    }
    catch {
        /* optional */
    }
    try {
        await copyTree(join(CONTENT, "references"), join(skillDir, "references"));
    }
    catch {
        /* optional */
    }
}
async function buildPluginSkills(stems) {
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
async function buildClaudePluginSkills(stems) {
    const skillsRoot = join(CLAUDE_PLUGIN_OUT, "skills");
    await mkdir(skillsRoot, { recursive: true });
    for (const stem of stems) {
        const skillDir = join(skillsRoot, stem);
        await mkdir(skillDir, { recursive: true });
        await materialiseSkill(stem, skillsRoot, "claude-code");
        await bundleCliWithYaml(skillDir);
        await copyAssetsToSkill(skillDir);
    }
}
async function buildZipSkills(stems) {
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
async function copyResourcesToPluginRoot(pluginRoot, stems) {
    const res = join(pluginRoot, "resources");
    await mkdir(res, { recursive: true });
    try {
        await materializeExpertAssets(CONTENT, res);
        const skills = [...stems].sort();
        await writeFile(join(res, "topics", "index.yaml"), stringify({ skills }, { lineWidth: 0 }) + "\n", "utf8");
        await writeTopicSearchIndex(res);
    }
    catch {
        /* empty */
    }
    try {
        await copyTree(join(CONTENT, "references"), join(res, "references"));
    }
    catch {
        /* empty */
    }
}
async function writePluginManifest(version) {
    const dir = join(PLUGIN_OUT, ".cursor-plugin");
    await mkdir(dir, { recursive: true });
    const manifest = {
        name: "agent-brain-trust",
        version,
        description: "Agent Brain Trust: BT workshop/editorial skills, expert-opinion, MCP",
        author: { name: "agent-brain-trust" },
        skills: "./skills",
    };
    await writeFile(join(dir, "plugin.json"), JSON.stringify(manifest, null, 2), "utf8");
}
async function writeClaudePluginManifest(version) {
    const dir = join(CLAUDE_PLUGIN_OUT, ".claude-plugin");
    await mkdir(dir, { recursive: true });
    const manifest = {
        name: "agent-brain-trust",
        version,
        description: "Agent Brain Trust: BT workshop/editorial skills, expert-opinion, MCP",
        author: { name: "agent-brain-trust" },
    };
    await writeFile(join(dir, "plugin.json"), JSON.stringify(manifest, null, 2), "utf8");
}
async function writeMcpConfigAt(pluginRoot) {
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
    await writeFile(join(pluginRoot, ".mcp.json"), JSON.stringify(cfg, null, 2), "utf8");
}
async function bundleMcpServer() {
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
    }
    catch {
        await mkdir(join(MCP_OUT, "resources"), { recursive: true });
    }
}
async function copyMcpBundleToClaudePlugin() {
    await mkdir(join(CLAUDE_PLUGIN_OUT, "scripts"), { recursive: true });
    await copyTree(join(PLUGIN_OUT, "scripts"), join(CLAUDE_PLUGIN_OUT, "scripts"));
    await writeMcpConfigAt(CLAUDE_PLUGIN_OUT);
}
async function runSkillsRef(skillDir) {
    const bin = join(ROOT, "node_modules", ".bin", "skills-ref");
    const r = spawnSync(process.execPath, [bin, "validate", skillDir], {
        encoding: "utf8",
        cwd: ROOT,
    });
    if (r.status !== 0) {
        throw new Error(`skills-ref failed for ${skillDir}: ${r.stderr || r.stdout}`);
    }
}
export async function cmdBuild() {
    await rm(DIST, { recursive: true, force: true });
    await mkdir(DIST, { recursive: true });
    const version = await readPkgVersion();
    const stems = await listSkillStems();
    if (stems.length === 0) {
        throw new Error("No skills found in content/skills/*.md");
    }
    await mkdir(PLUGIN_OUT, { recursive: true });
    await mkdir(CLAUDE_PLUGIN_OUT, { recursive: true });
    await buildPluginSkills(stems);
    await buildClaudePluginSkills(stems);
    await copyResourcesToPluginRoot(PLUGIN_OUT, stems);
    await copyResourcesToPluginRoot(CLAUDE_PLUGIN_OUT, stems);
    await writePluginManifest(version);
    await writeClaudePluginManifest(version);
    await writeMcpConfigAt(PLUGIN_OUT);
    await bundleMcpServer();
    await copyMcpBundleToClaudePlugin();
    await buildZipSkills(stems);
    const readme = `# agent-brain-trust plugin (built)\n\nVersion ${version}\n`;
    await writeFile(join(PLUGIN_OUT, "README.md"), readme, "utf8");
    await writeFile(join(CLAUDE_PLUGIN_OUT, "README.md"), readme, "utf8");
    for (const stem of stems) {
        await runSkillsRef(join(PLUGIN_OUT, "skills", stem));
        await runSkillsRef(join(CLAUDE_PLUGIN_OUT, "skills", stem));
    }
    console.log("Build complete:", PLUGIN_OUT, CLAUDE_PLUGIN_OUT, MCP_OUT, SKILL_ZIPS);
}
//# sourceMappingURL=build-impl.js.map