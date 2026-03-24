import { lstat, mkdir, readFile, symlink, unlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PLUGIN_SRC = resolve(ROOT, "dist", "agent-brain-trust-claude-plugin");
const MANIFEST = join(PLUGIN_SRC, ".claude-plugin", "plugin.json");

/** Directory name under ~/.cursor/plugins/local/ (parallel to Cursor plugin symlink). */
const LINK_NAME = "agent-brain-trust-claude";

const PLUGIN_ID = `${LINK_NAME}@local`;

type InstalledPluginsFile = {
  plugins?: Record<string, Array<Record<string, unknown>>>;
};

async function readJsonFile(path: string): Promise<Record<string, unknown>> {
  try {
    const raw = await readFile(path, "utf8");
    const data = JSON.parse(raw) as unknown;
    return data !== null && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};
  } catch (e: unknown) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "ENOENT") return {};
    throw e;
  }
}

async function writeJsonFile(path: string, data: unknown): Promise<void> {
  await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function registerClaudePlugin(installPathAbs: string): Promise<void> {
  const claudePluginsDir = join(homedir(), ".claude", "plugins");
  const installedPath = join(claudePluginsDir, "installed_plugins.json");
  await mkdir(claudePluginsDir, { recursive: true });

  const installedRaw = await readJsonFile(installedPath);
  const installed = installedRaw as InstalledPluginsFile;
  const plugins: Record<string, Array<Record<string, unknown>>> = {
    ...(installed.plugins ?? {}),
  };
  const prev = plugins[PLUGIN_ID] ?? [];
  const rest = prev.filter((e) => !(typeof e === "object" && e && (e as { scope?: string }).scope === "user"));
  plugins[PLUGIN_ID] = [{ scope: "user", installPath: installPathAbs }, ...rest];
  await writeJsonFile(installedPath, { ...installedRaw, plugins });

  const settingsPath = join(homedir(), ".claude", "settings.json");
  const settings = await readJsonFile(settingsPath);
  const enabledPlugins = {
    ...((settings.enabledPlugins as Record<string, boolean> | undefined) ?? {}),
    [PLUGIN_ID]: true,
  };
  await writeJsonFile(settingsPath, { ...settings, enabledPlugins });
}

async function main(): Promise<void> {
  try {
    await lstat(MANIFEST);
  } catch {
    throw new Error(
      `Built Claude plugin not found at ${MANIFEST}. Run npm run build first (or use npm run install:claude-plugin).`
    );
  }

  const localRoot = join(homedir(), ".cursor", "plugins", "local");
  await mkdir(localRoot, { recursive: true });
  const linkPath = join(localRoot, LINK_NAME);
  const installPathAbs = resolve(linkPath);

  try {
    const st = await lstat(linkPath);
    if (st.isSymbolicLink()) {
      await unlink(linkPath);
    } else if (st.isDirectory()) {
      throw new Error(
        `${linkPath} exists and is a directory (not a symlink). Remove or rename it, then re-run this script.`
      );
    } else {
      await unlink(linkPath);
    }
  } catch (e: unknown) {
    const err = e as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") throw e;
  }

  await symlink(PLUGIN_SRC, linkPath, "dir");
  await registerClaudePlugin(installPathAbs);

  console.log(`Symlink: ${linkPath} -> ${PLUGIN_SRC}`);
  console.log(`Registered ${PLUGIN_ID} in ~/.claude/plugins/installed_plugins.json`);
  console.log(`Enabled ${PLUGIN_ID} in ~/.claude/settings.json`);
  console.log("Restart Claude Code or run /reload-plugins.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
