export type ComposeTarget = "plugin" | "claude-code" | "skill-zip" | "mcp";
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
export declare function composeMarkdown(body: string, fragmentsRoot: string, target: ComposeTarget, depth?: number, env?: Record<string, string>): Promise<string>;
/** Expand `@repeat roster` / `@endrepeat` using `env.roster` (CSV) or duplicate `guest` merged into `roster`. */
export declare function expandRepeatBlocks(text: string, env: Record<string, string>): string;
/** Parse path and optional k=v arguments (query string or comma list after `.md`). */
export declare function parseIncludeSpec(raw: string): {
    path: string;
    vars: Record<string, string>;
};
/**
 * Query params: `guest=a&guest=b` merges into `roster` as `a,b`. A single `roster=a,b` still works.
 */
export declare function parseQueryKvp(query: string): Record<string, string>;
export declare function applyTemplateVars(text: string, vars: Record<string, string>): string;
/**
 * `compose` in YAML frontmatter supplies the initial template env for the skill body (merged into nested `@include`s).
 * It is stripped from the built `SKILL.md` so only `name` / `description` / etc. ship to the agent.
 * Values must stringify to the same keys used in fragments (`profile`, `roster`, `fidelity`, …).
 * `roster` may be a comma-separated string or a YAML array of expert ids.
 */
export declare function extractComposeEnv(frontmatterBlock: string): {
    frontmatterOut: string;
    composeEnv: Record<string, string>;
};
export declare function loadAndCompose(entryPath: string, fragmentsRoot: string, target: ComposeTarget): Promise<{
    frontmatter: string;
    body: string;
}>;
//# sourceMappingURL=compose.d.ts.map