import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
const MAX_INCLUDE_DEPTH = 12;
const REPEAT_ROSTER = /@repeat\s+roster\s*\n([\s\S]*?)@endrepeat/g;
/**
 * `@include` forms:
 * - `@include path/to/file.md`
 * - `@include path/to/file.md?k=v&k2=v2` (query; values URL-decoded; duplicate `guest` keys merge into `roster` CSV)
 * - `@include path/to/file.md k=v,k2=v2` (comma-separated pairs after the path; path must end in `.md`)
 *
 * Template: `{{name}}` is replaced from the **merged environment** (outer includes + this include's params). Unresolved `{{name}}` stays literal.
 *
 * **`@repeat roster`**: expands the inner block once per id in env `roster` (comma-separated) or duplicated `guest=` query params, setting `{{id}}` each time. Inner `@include`s are processed in a later pass.
 */
export async function composeMarkdown(body, fragmentsRoot, target, depth = 0, env = {}) {
    if (depth > MAX_INCLUDE_DEPTH) {
        throw new Error(`@include nesting exceeded ${MAX_INCLUDE_DEPTH}`);
    }
    let text = applyTemplateVars(body, env);
    text = expandRepeatBlocks(text, env);
    const includeRe = /@include\s+([^\n]+)/;
    let m;
    while ((m = includeRe.exec(text)) !== null) {
        const spec = m[1].trim();
        const { path: relPath, vars: includeVars } = parseIncludeSpec(spec);
        const merged = mergeEnv(env, includeVars);
        const full = resolveIncludePath(relPath, fragmentsRoot);
        let nested = await readFile(full, "utf8");
        nested = applyTemplateVars(nested, merged);
        const composed = await composeMarkdown(nested, fragmentsRoot, target, depth + 1, merged);
        text = text.replace(m[0], composed);
    }
    text = expandConditionals(text, target);
    return text;
}
function mergeEnv(base, override) {
    return { ...base, ...override };
}
/** Expand `@repeat roster` / `@endrepeat` using `env.roster` (CSV) or duplicate `guest` merged into `roster`. */
export function expandRepeatBlocks(text, env) {
    const roster = env.roster?.trim();
    return text.replace(REPEAT_ROSTER, (_, inner) => {
        if (!roster) {
            return "";
        }
        const ids = roster.split(",").map((s) => s.trim()).filter(Boolean);
        if (ids.length === 0) {
            return "";
        }
        return ids.map((id) => applyTemplateVars(inner, mergeEnv(env, { id }))).join("\n\n");
    });
}
/** Parse path and optional k=v arguments (query string or comma list after `.md`). */
export function parseIncludeSpec(raw) {
    const trimmed = raw.trim();
    const q = trimmed.indexOf("?");
    if (q !== -1) {
        const path = trimmed.slice(0, q).trim();
        const query = trimmed.slice(q + 1);
        return { path, vars: parseQueryKvp(query) };
    }
    const mdThenArgs = /^(.+\.md)\s+(.+)$/.exec(trimmed);
    if (mdThenArgs) {
        return { path: mdThenArgs[1].trim(), vars: parseCommaKvp(mdThenArgs[2]) };
    }
    return { path: trimmed, vars: {} };
}
/**
 * Query params: `guest=a&guest=b` merges into `roster` as `a,b`. A single `roster=a,b` still works.
 */
export function parseQueryKvp(query) {
    const byKey = new Map();
    for (const part of query.split("&")) {
        if (!part)
            continue;
        const eq = part.indexOf("=");
        if (eq === -1)
            continue;
        const k = tryDecode(part.slice(0, eq).trim());
        const v = tryDecode(part.slice(eq + 1).trim());
        if (!byKey.has(k))
            byKey.set(k, []);
        byKey.get(k).push(v);
    }
    const out = {};
    const guests = [];
    for (const [k, vs] of byKey) {
        if (k === "guest") {
            guests.push(...vs);
            continue;
        }
        if (vs.length === 1) {
            out[k] = vs[0];
        }
        else {
            out[k] = vs.join(",");
        }
    }
    if (guests.length > 0) {
        const existing = out.roster?.trim();
        out.roster = existing ? `${existing},${guests.join(",")}` : guests.join(",");
    }
    return out;
}
function parseCommaKvp(s) {
    const out = {};
    for (const part of s.split(",")) {
        const seg = part.trim();
        if (!seg)
            continue;
        const eq = seg.indexOf("=");
        if (eq === -1)
            continue;
        out[seg.slice(0, eq).trim()] = seg.slice(eq + 1).trim();
    }
    return out;
}
function tryDecode(s) {
    try {
        return decodeURIComponent(s);
    }
    catch {
        return s;
    }
}
const TEMPLATE_VAR = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
export function applyTemplateVars(text, vars) {
    if (Object.keys(vars).length === 0)
        return text;
    return text.replace(TEMPLATE_VAR, (full, key) => (key in vars ? vars[key] : full));
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
/**
 * `compose` in YAML frontmatter supplies the initial template env for the skill body (merged into nested `@include`s).
 * It is stripped from the built `SKILL.md` so only `name` / `description` / etc. ship to the agent.
 * Values must stringify to the same keys used in fragments (`profile`, `roster`, `fidelity`, …).
 * `roster` may be a comma-separated string or a YAML array of expert ids.
 */
export function extractComposeEnv(frontmatterBlock) {
    const end = frontmatterBlock.indexOf("\n---", 3);
    if (!frontmatterBlock.startsWith("---") || end === -1) {
        return { frontmatterOut: frontmatterBlock, composeEnv: {} };
    }
    const inner = frontmatterBlock.slice(3, end).trim();
    let doc;
    try {
        doc = parseYaml(inner);
    }
    catch {
        return { frontmatterOut: frontmatterBlock, composeEnv: {} };
    }
    const rawCompose = doc.compose;
    delete doc.compose;
    const frontmatterOut = Object.keys(doc).length === 0
        ? "---\n---\n"
        : `---\n${stringifyYaml(doc, { lineWidth: 0 }).trimEnd()}\n---\n`;
    return {
        frontmatterOut,
        composeEnv: flattenComposeParams(rawCompose),
    };
}
function flattenComposeParams(raw) {
    if (raw === null || raw === undefined) {
        return {};
    }
    if (typeof raw !== "object" || Array.isArray(raw)) {
        return {};
    }
    const out = {};
    for (const [k, v] of Object.entries(raw)) {
        out[k] = composeValueToString(v);
    }
    return out;
}
function composeValueToString(v) {
    if (v === null || v === undefined) {
        return "";
    }
    if (Array.isArray(v)) {
        return v.map((x) => String(x).trim()).filter(Boolean).join(",");
    }
    if (typeof v === "object") {
        return JSON.stringify(v);
    }
    return String(v);
}
export async function loadAndCompose(entryPath, fragmentsRoot, target) {
    const raw = await readFile(entryPath, "utf8");
    if (!raw.startsWith("---")) {
        return { frontmatter: "", body: await composeMarkdown(raw, fragmentsRoot, target, 0, {}) };
    }
    const end = raw.indexOf("\n---", 3);
    if (end === -1) {
        return { frontmatter: "", body: await composeMarkdown(raw, fragmentsRoot, target, 0, {}) };
    }
    const fm = raw.slice(0, end + 5);
    const body = raw.slice(end + 5).replace(/^\s*\n/, "");
    const { frontmatterOut, composeEnv } = extractComposeEnv(fm);
    return {
        frontmatter: frontmatterOut,
        body: await composeMarkdown(body, fragmentsRoot, target, 0, composeEnv),
    };
}
//# sourceMappingURL=compose.js.map