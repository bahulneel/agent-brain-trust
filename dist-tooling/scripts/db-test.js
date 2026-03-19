/**
 * Smoke-test expert/topic database using brain-trust-core against brain-trust-db dist output.
 * Run after: npm run db:build (or full turbo build).
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { listExpertIds, readExpertsRost, readTaxonomy } from "brain-trust-core";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assets = join(root, "packages", "brain-trust-db", "dist", "assets");
const ids = await listExpertIds(assets);
const rost = await readExpertsRost(assets);
const tax = await readTaxonomy(assets);
console.log("--- expert ids ---");
console.log(JSON.stringify(ids, null, 2));
console.log("--- rost.json keys ---", rost ? Object.keys(rost.experts).length : 0, "experts");
console.log("--- taxonomy root ---", tax?.taxonomy?.label ?? "(missing)");
if (rost && ids.length !== Object.keys(rost.experts).length) {
    console.warn("warning: listExpertIds length != rost.experts keys");
}
process.exit(0);
//# sourceMappingURL=db-test.js.map