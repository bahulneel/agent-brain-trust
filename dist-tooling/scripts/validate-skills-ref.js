/**
 * Run skills-ref validate on every skill under built Cursor and Claude plugins.
 * Requires: npm run build (dist/.../skills/<id>/ must exist).
 */
import { existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PLUGIN_SKILL_DIRS = [
    join(ROOT, "dist", "agent-brain-trust-cursor-plugin", "skills"),
    join(ROOT, "dist", "agent-brain-trust-claude-plugin", "skills"),
];
function listSkillPaths(skillsDir) {
    return readdirSync(skillsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => join(skillsDir, d.name))
        .sort();
}
function main() {
    const allPaths = [];
    for (const skillsDir of PLUGIN_SKILL_DIRS) {
        if (!existsSync(skillsDir)) {
            console.error(`Missing ${skillsDir}. Run npm run build first.`);
            process.exit(1);
        }
        allPaths.push(...listSkillPaths(skillsDir));
    }
    for (const skillPath of allPaths) {
        const r = spawnSync("npx", ["skills-ref", "validate", skillPath], {
            stdio: "inherit",
            cwd: ROOT,
            shell: false,
        });
        if (r.status !== 0) {
            process.exit(r.status ?? 1);
        }
    }
    console.log("skills-ref validate ok:", allPaths.length, "skill outputs");
}
main();
//# sourceMappingURL=validate-skills-ref.js.map