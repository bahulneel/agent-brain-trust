import { existsSync } from "node:fs";
import { cp, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
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
const CONTENT = join(ROOT, "content");
const FRAGMENTS = join(CONTENT, "skill-fragments");
const DIST = join(ROOT, "dist");
const PROMPT_ARTIFACTS = join(DIST, "prompts");
const PLUGIN_OUT = join(DIST, "agent-brain-trust-cursor-plugin");
const CLAUDE_PLUGIN_OUT = join(DIST, "agent-brain-trust-claude-plugin");
/** Publishable MCP package (manifest + README in repo; bundle + resources written here by build). */
const MCP_PKG_ROOT = join(ROOT, "packages", "brain-trust-mcp");
const MCP_PKG_JSON = join(MCP_PKG_ROOT, "package.json");
const SKILL_ZIPS = join(DIST, "skill-zips");
async function readMcpWorkspacePackage() {
    const j = JSON.parse(await readFile(MCP_PKG_JSON, "utf8"));
    const name = j.name;
    const version = j.version;
    if (typeof name !== "string" || typeof version !== "string") {
        throw new Error("packages/brain-trust-mcp/package.json must include string name and version");
    }
    return { name, version };
}
async function readAndAssertMcpPackageMatchesRoot() {
    const mcp = await readMcpWorkspacePackage();
    const rootV = await readPkgVersion();
    if (mcp.version !== rootV) {
        throw new Error(`packages/brain-trust-mcp/package.json version (${mcp.version}) must match root package.json (${rootV})`);
    }
    return mcp;
}
function publishMcpPackageName(pkgName) {
    return process.env.NPM_MCP_PACKAGE_NAME ?? pkgName;
}
function resolveMcpNpxSpec(version, publishName) {
    const override = process.env.BRAIN_TRUST_MCP_NPX_SPEC;
    if (override !== undefined && override.length > 0) {
        return override;
    }
    return `${publishName}@${version}`;
}
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
async function buildPromptArtifacts() {
    await mkdir(PROMPT_ARTIFACTS, { recursive: true });
    for (const filename of ["RPL.md", "LRPL.md"]) {
        const entry = join(CONTENT, filename);
        const { frontmatter, body } = await loadAndCompose(entry, CONTENT, "plugin");
        const text = `${frontmatter}${body}`.trimEnd() + "\n";
        await writeFile(join(PROMPT_ARTIFACTS, filename), text, "utf8");
    }
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
/**
 * Shipped plugin MCP config: stdio via npx and a pinned package spec (npm publish).
 * Override at build time: BRAIN_TRUST_MCP_NPX_SPEC, NPM_MCP_PACKAGE_NAME (npx spec only).
 */
async function writeMcpConfigAt(pluginRoot) {
    const mcp = await readAndAssertMcpPackageMatchesRoot();
    const publishName = publishMcpPackageName(mcp.name);
    const spec = resolveMcpNpxSpec(mcp.version, publishName);
    const cfg = {
        mcpServers: {
            "brain-trust": {
                type: "stdio",
                command: "npx",
                args: ["-y", spec],
            },
        },
    };
    await writeFile(join(pluginRoot, ".mcp.json"), JSON.stringify(cfg, null, 2), "utf8");
}
async function bundleMcpServer() {
    await readAndAssertMcpPackageMatchesRoot();
    await rm(join(MCP_PKG_ROOT, "resources"), { recursive: true, force: true });
    await rm(join(MCP_PKG_ROOT, "LICENSE"), { force: true });
    const mcpBundle = join(MCP_PKG_ROOT, "dist", "brain-trust-mcp.js");
    if (!existsSync(mcpBundle)) {
        throw new Error(`Missing ${mcpBundle}. The MCP package must be built first (turbo): run npm run build:packages or full npm run build before the plugin pipeline.`);
    }
    await mkdir(join(PLUGIN_OUT, "scripts"), { recursive: true });
    // Same bytes as npm `bin` (`@bahulneel/brain-trust-mcp`); plugins ship a `.cjs` copy for `node …/mcp-server.cjs`.
    await copyFile(mcpBundle, join(PLUGIN_OUT, "scripts", "mcp-server.cjs"));
    try {
        await copyFile(join(ROOT, "LICENSE"), join(MCP_PKG_ROOT, "LICENSE"));
    }
    catch {
        /* optional */
    }
    try {
        await copyTree(join(PLUGIN_OUT, "resources"), join(MCP_PKG_ROOT, "resources"));
    }
    catch {
        await mkdir(join(MCP_PKG_ROOT, "resources"), { recursive: true });
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
    await buildPromptArtifacts();
    await buildPluginSkills(stems);
    await buildClaudePluginSkills(stems);
    await copyResourcesToPluginRoot(PLUGIN_OUT, stems);
    await copyResourcesToPluginRoot(CLAUDE_PLUGIN_OUT, stems);
    await writePluginManifest(version);
    await writeClaudePluginManifest(version);
    await bundleMcpServer();
    await writeMcpConfigAt(PLUGIN_OUT);
    await copyMcpBundleToClaudePlugin();
    await buildZipSkills(stems);
    const readme = `# agent-brain-trust plugin (built)\n\nVersion ${version}\n`;
    await writeFile(join(PLUGIN_OUT, "README.md"), readme, "utf8");
    await writeFile(join(CLAUDE_PLUGIN_OUT, "README.md"), readme, "utf8");
    for (const stem of stems) {
        await runSkillsRef(join(PLUGIN_OUT, "skills", stem));
        await runSkillsRef(join(CLAUDE_PLUGIN_OUT, "skills", stem));
    }
    console.log("Build complete:", PROMPT_ARTIFACTS, PLUGIN_OUT, CLAUDE_PLUGIN_OUT, MCP_PKG_ROOT, SKILL_ZIPS);
}
//# sourceMappingURL=build-impl.js.map