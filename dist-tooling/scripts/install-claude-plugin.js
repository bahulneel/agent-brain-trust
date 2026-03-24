import { cp, lstat, mkdir, readFile, rm, unlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PLUGIN_SRC = resolve(ROOT, "dist", "agent-brain-trust-claude-plugin");
const MANIFEST = join(PLUGIN_SRC, ".claude-plugin", "plugin.json");
/** Directory name under ~/.cursor/plugins/local/. */
const INSTALL_NAME = "agent-brain-trust-claude";
const PLUGIN_ID = `${INSTALL_NAME}@local`;
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
async function removeInstallTarget(path) {
    try {
        const st = await lstat(path);
        if (st.isSymbolicLink() || !st.isDirectory()) {
            await unlink(path);
        }
        else {
            await rm(path, { recursive: true, force: true });
        }
    }
    catch (e) {
        const err = e;
        if (err.code !== "ENOENT")
            throw e;
    }
}
async function main() {
    try {
        await lstat(MANIFEST);
    }
    catch {
        throw new Error(`Built Claude plugin not found at ${MANIFEST}. Run npm run build first (or use npm run install:claude-plugin).`);
    }
    const localRoot = join(homedir(), ".cursor", "plugins", "local");
    await mkdir(localRoot, { recursive: true });
    const destPath = join(localRoot, INSTALL_NAME);
    const installPathAbs = resolve(destPath);
    await removeInstallTarget(destPath);
    await cp(PLUGIN_SRC, destPath, { recursive: true, force: true });
    await registerClaudePlugin(installPathAbs);
    console.log(`Copied: ${PLUGIN_SRC} -> ${destPath}`);
    console.log(`Registered ${PLUGIN_ID} in ~/.claude/plugins/installed_plugins.json`);
    console.log(`Enabled ${PLUGIN_ID} in ~/.claude/settings.json`);
    console.log("Re-run this script after npm run build to refresh the copy. Restart Claude Code or run /reload-plugins.");
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=install-claude-plugin.js.map