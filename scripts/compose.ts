import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  isMap,
  isScalar,
  parse as parseYaml,
  parseDocument,
  Scalar,
  stringify as stringifyYaml,
} from "yaml";

export type ComposeTarget = "plugin" | "claude-code" | "skill-zip";

const MAX_INCLUDE_DEPTH = 12;

const REPEAT_ROSTER =
  /@repeat\s+roster\s*\n([\s\S]*?)@endrepeat/g;

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
export async function composeMarkdown(
  body: string,
  fragmentsRoot: string,
  target: ComposeTarget,
  depth = 0,
  env: Record<string, string> = {}
): Promise<string> {
  if (depth > MAX_INCLUDE_DEPTH) {
    throw new Error(`@include nesting exceeded ${MAX_INCLUDE_DEPTH}`);
  }

  let text = applyTemplateVars(body, env);
  text = expandRepeatBlocks(text, env);

  const includeRe = /@include\s+([^\n]+)/;
  let m: RegExpExecArray | null;
  while ((m = includeRe.exec(text)) !== null) {
    const spec = m[1]!.trim();
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

function mergeEnv(
  base: Record<string, string>,
  override: Record<string, string>
): Record<string, string> {
  return { ...base, ...override };
}

/** Expand `@repeat roster` / `@endrepeat` using `env.roster` (CSV) or duplicate `guest` merged into `roster`. */
export function expandRepeatBlocks(text: string, env: Record<string, string>): string {
  const roster = env.roster?.trim();
  return text.replace(REPEAT_ROSTER, (_, inner: string) => {
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
export function parseIncludeSpec(raw: string): { path: string; vars: Record<string, string> } {
  const trimmed = raw.trim();
  const q = trimmed.indexOf("?");
  if (q !== -1) {
    const path = trimmed.slice(0, q).trim();
    const query = trimmed.slice(q + 1);
    return { path, vars: parseQueryKvp(query) };
  }
  const mdThenArgs = /^(.+\.md)\s+(.+)$/.exec(trimmed);
  if (mdThenArgs) {
    return { path: mdThenArgs[1]!.trim(), vars: parseCommaKvp(mdThenArgs[2]!) };
  }
  return { path: trimmed, vars: {} };
}

/**
 * Query params: `guest=a&guest=b` merges into `roster` as `a,b`. A single `roster=a,b` still works.
 */
export function parseQueryKvp(query: string): Record<string, string> {
  const byKey = new Map<string, string[]>();
  for (const part of query.split("&")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const k = tryDecode(part.slice(0, eq).trim());
    const v = tryDecode(part.slice(eq + 1).trim());
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(v);
  }

  const out: Record<string, string> = {};
  const guests: string[] = [];

  for (const [k, vs] of byKey) {
    if (k === "guest") {
      guests.push(...vs);
      continue;
    }
    if (vs.length === 1) {
      out[k] = vs[0]!;
    } else {
      out[k] = vs.join(",");
    }
  }

  if (guests.length > 0) {
    const existing = out.roster?.trim();
    out.roster = existing ? `${existing},${guests.join(",")}` : guests.join(",");
  }

  return out;
}

function parseCommaKvp(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of s.split(",")) {
    const seg = part.trim();
    if (!seg) continue;
    const eq = seg.indexOf("=");
    if (eq === -1) continue;
    out[seg.slice(0, eq).trim()] = seg.slice(eq + 1).trim();
  }
  return out;
}

function tryDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

const TEMPLATE_VAR = /\{\{([a-zA-Z0-9_-]+)\}\}/g;

export function applyTemplateVars(text: string, vars: Record<string, string>): string {
  if (Object.keys(vars).length === 0) return text;
  return text.replace(TEMPLATE_VAR, (full, key: string) => (key in vars ? vars[key]! : full));
}

/** Paths starting with `experts/` resolve under `content/experts/` (sibling of skill-fragments). */
function resolveIncludePath(rel: string, fragmentsRoot: string): string {
  const normalized = rel.replace(/\\/g, "/").trim();
  if (normalized.startsWith("experts/")) {
    return join(dirname(fragmentsRoot), normalized);
  }
  return join(fragmentsRoot, rel.trim());
}

/** `@if target` or `@if a|b|c` (pipe-separated); keep inner block when `target` is listed. */
function expandConditionals(text: string, target: ComposeTarget): string {
  const re = /@if ([^\n]+)\n([\s\S]*?)@endif/g;
  return text.replace(re, (_, spec: string, inner: string) => {
    const targets = spec
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    return targets.includes(target) ? inner : "";
  });
}

/**
 * `compose` in YAML frontmatter supplies the initial template env for the skill body (merged into nested `@include`s).
 * It is stripped from the built `SKILL.md` so only `name` / `description` / etc. ship to the agent.
 * Values must stringify to the same keys used in fragments (`profile`, `roster`, …).
 * `roster` may be a comma-separated string or a YAML array of expert ids.
 */
export function extractComposeEnv(frontmatterBlock: string): {
  frontmatterOut: string;
  composeEnv: Record<string, string>;
} {
  const end = frontmatterBlock.indexOf("\n---", 3);
  if (!frontmatterBlock.startsWith("---") || end === -1) {
    return { frontmatterOut: frontmatterBlock, composeEnv: {} };
  }
  const inner = frontmatterBlock.slice(3, end).trim();
  let docJs: Record<string, unknown>;
  try {
    docJs = parseYaml(inner) as Record<string, unknown>;
  } catch {
    return { frontmatterOut: frontmatterBlock, composeEnv: {} };
  }
  const rawCompose = docJs.compose;
  const composeEnv = flattenComposeParams(rawCompose);

  const yamlDoc = parseDocument(inner);
  if (yamlDoc.errors.length > 0) {
    return { frontmatterOut: frontmatterBlock, composeEnv };
  }
  const root = yamlDoc.contents;
  if (!isMap(root)) {
    return { frontmatterOut: frontmatterBlock, composeEnv };
  }

  root.items = root.items.filter((pair) => {
    const keyStr = isScalar(pair.key) ? String(pair.key.value) : "";
    return keyStr !== "compose";
  });

  for (const pair of root.items) {
    if (isScalar(pair.value) && typeof pair.value.value === "string") {
      const v = pair.value.value;
      if (v.includes("\n") || v.includes(":") || v.length > 72) {
        pair.value.type = Scalar.BLOCK_FOLDED;
      }
    }
  }

  const frontmatterOut =
    root.items.length === 0
      ? "---\n---\n"
      : `---\n${stringifyYaml(yamlDoc, { lineWidth: 0 }).trimEnd()}\n---\n`;
  return { frontmatterOut, composeEnv };
}

function flattenComposeParams(raw: unknown): Record<string, string> {
  if (raw === null || raw === undefined) {
    return {};
  }
  if (typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    out[k] = composeValueToString(v);
  }
  return out;
}

function composeValueToString(v: unknown): string {
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

export async function loadAndCompose(
  entryPath: string,
  fragmentsRoot: string,
  target: ComposeTarget
): Promise<{ frontmatter: string; body: string }> {
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
