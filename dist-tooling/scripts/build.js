import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT = join(ROOT, "content");
async function listSkillStems() {
    const dir = join(CONTENT, "skills");
    const files = await readdir(dir);
    return files.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
}
async function cmdValidate() {
    const stems = await listSkillStems();
    for (const stem of stems) {
        const entry = join(CONTENT, "skills", `${stem}.md`);
        await readFile(entry, "utf8");
    }
    console.log("validate ok:", stems.length, "skill entries");
}
const cmd = process.argv[2] ?? "build";
if (cmd === "build") {
    import("./build-impl.js")
        .then((m) => m.cmdBuild())
        .catch((e) => {
        console.error(e);
        process.exit(1);
    });
}
else if (cmd === "validate") {
    cmdValidate().catch((e) => {
        console.error(e);
        process.exit(1);
    });
}
else {
    console.error("usage: tsx scripts/build.ts [build|validate]");
    process.exit(1);
}
//# sourceMappingURL=build.js.map