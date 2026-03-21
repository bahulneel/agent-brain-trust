/**
 * Run brain-trust-cli against `packages/brain-trust-db/test-skill` (needs db + core built).
 * Usage: npm run db:cli -- list-experts
 *        npm run db:cli -- get-expert william-e-byrd
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const cli = join(root, "packages", "brain-trust-core", "dist", "cli.js");
const cwd = join(root, "packages", "brain-trust-db", "test-skill");
const args = process.argv.slice(2);
/** Empty args → CLI prints discovery help (navigation-first). */
const sub = args.length ? args : [];
const r = spawnSync(process.execPath, [cli, ...sub], { cwd, stdio: "inherit" });
process.exit(r.status ?? 1);
//# sourceMappingURL=db-cli-runner.js.map