import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
const MAX_INCLUDE_DEPTH = 12;
/**
 * Expand @include path (relative to fragmentsRoot), then expand @if target ... @endif for plugin | skill-zip | mcp.
 */
export async function composeMarkdown(body, fragmentsRoot, target, depth = 0) {
    if (depth > MAX_INCLUDE_DEPTH) {
        throw new Error(`@include nesting exceeded ${MAX_INCLUDE_DEPTH}`);
    }
    let text = body;
    const includeRe = /@include\s+([^\n]+)/;
    let m;
    while ((m = includeRe.exec(text)) !== null) {
        const rel = m[1].trim();
        const full = resolveIncludePath(rel, fragmentsRoot);
        const nested = await readFile(full, "utf8");
        const composed = await composeMarkdown(nested, fragmentsRoot, target, depth + 1);
        text = text.replace(m[0], composed);
    }
    text = expandConditionals(text, target);
    return text;
}
/** Paths starting with `experts/` resolve under `content/experts/` (sibling of skill-fragments). */
function resolveIncludePath(rel, fragmentsRoot) {
    const normalized = rel.replace(/\\/g, "/").trim();
    if (normalized.startsWith("experts/")) {
        return join(dirname(fragmentsRoot), normalized);
    }
    return join(fragmentsRoot, rel.trim());
}
function expandConditionals(text, target) {
    const blocks = [
        { name: "plugin", re: /@if plugin\n([\s\S]*?)@endif/g },
        { name: "skill-zip", re: /@if skill-zip\n([\s\S]*?)@endif/g },
        { name: "mcp", re: /@if mcp\n([\s\S]*?)@endif/g },
    ];
    let out = text;
    for (const { name, re } of blocks) {
        out = out.replace(re, (_, inner) => (target === name ? inner : ""));
    }
    return out;
}
export async function loadAndCompose(entryPath, fragmentsRoot, target) {
    const raw = await readFile(entryPath, "utf8");
    if (!raw.startsWith("---")) {
        return { frontmatter: "", body: await composeMarkdown(raw, fragmentsRoot, target) };
    }
    const end = raw.indexOf("\n---", 3);
    if (end === -1) {
        return { frontmatter: "", body: await composeMarkdown(raw, fragmentsRoot, target) };
    }
    const fm = raw.slice(0, end + 5);
    const body = raw.slice(end + 5).replace(/^\s*\n/, "");
    return {
        frontmatter: fm,
        body: await composeMarkdown(body, fragmentsRoot, target),
    };
}
//# sourceMappingURL=compose.js.map