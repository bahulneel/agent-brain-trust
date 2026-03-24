import { lstat, mkdir, readFile, symlink, unlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PLUGIN_SRC = resolve(ROOT, "dist", "agent-brain-trust-cursor-plugin");
const MANIFEST = join(PLUGIN_SRC, ".cursor-plugin", "plugin.json");
/** Directory name under ~/.cursor/plugins/local/ (Cursor docs local path). */
const LINK_NAME = "agent-brain-trust";
/** Cursor loads user local plugins via Claude Code config; `@local` marks non-marketplace installs. */
const PLUGIN_ID = `${LINK_NAME}@local`;
async function readJsonFile(path) {
    try {
        const raw = await readFile(path, "utf8");
        const data = JSON.parse(raw);
        return data !== null && typeof data === "object" && !Array.isArray(data)
            ? data
            : {};
    }
    catch (e) {
        const err = e;
        if (err.code === "ENOENT")
            return {};
        throw e;
    }
}
async function writeJsonFile(path, data) {
    await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}
/**
 * Register plugin so Cursor’s agent discovers it (symlink under ~/.cursor/plugins/local is not always enough).
 */
async function registerClaudePlugin(installPathAbs) {
    const claudePluginsDir = join(homedir(), ".claude", "plugins");
    const installedPath = join(claudePluginsDir, "installed_plugins.json");
    await mkdir(claudePluginsDir, { recursive: true });
    const installedRaw = await readJsonFile(installedPath);
    const installed = installedRaw;
    const plugins = {
        ...(installed.plugins ?? {}),
    };
    const prev = plugins[PLUGIN_ID] ?? [];
    const rest = prev.filter((e) => !(typeof e === "object" && e && e.scope === "user"));
    plugins[PLUGIN_ID] = [{ scope: "user", installPath: installPathAbs }, ...rest];
    await writeJsonFile(installedPath, { ...installedRaw, plugins });
    const settingsPath = join(homedir(), ".claude", "settings.json");
    const settings = await readJsonFile(settingsPath);
    const enabledPlugins = {
        ...(settings.enabledPlugins ?? {}),
        [PLUGIN_ID]: true,
    };
    await writeJsonFile(settingsPath, { ...settings, enabledPlugins });
}
async function main() {
    try {
        await lstat(MANIFEST);
    }
    catch {
        throw new Error(`Built plugin not found at ${MANIFEST}. Run npm run build first (or use npm run install:cursor-plugin).`);
    }
    const localRoot = join(homedir(), ".cursor", "plugins", "local");
    await mkdir(localRoot, { recursive: true });
    const linkPath = join(localRoot, LINK_NAME);
    const installPathAbs = resolve(linkPath);
    try {
        const st = await lstat(linkPath);
        if (st.isSymbolicLink()) {
            await unlink(linkPath);
        }
        else if (st.isDirectory()) {
            throw new Error(`${linkPath} exists and is a directory (not a symlink). Remove or rename it, then re-run this script.`);
        }
        else {
            await unlink(linkPath);
        }
    }
    catch (e) {
        const err = e;
        if (err.code !== "ENOENT")
            throw e;
    }
    await symlink(PLUGIN_SRC, linkPath, "dir");
    await registerClaudePlugin(installPathAbs);
    console.log(`Symlink: ${linkPath} -> ${PLUGIN_SRC}`);
    console.log(`Registered ${PLUGIN_ID} in ~/.claude/plugins/installed_plugins.json`);
    console.log(`Enabled ${PLUGIN_ID} in ~/.claude/settings.json`);
    console.log("MCP: plugin .mcp.json uses npx for the published package; symlink ~/.cursor/plugins/local/agent-brain-trust matches install docs. For repo dev, use .cursor/mcp.json (workspace dist path).");
    console.log("Restart Cursor or run “Developer: Reload Window”.");
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=install-cursor-plugin.js.map