export type ComposeTarget = "plugin" | "skill-zip" | "mcp";
/**
 * Expand @include path (relative to fragmentsRoot), then expand @if target ... @endif for plugin | skill-zip | mcp.
 */
export declare function composeMarkdown(body: string, fragmentsRoot: string, target: ComposeTarget, depth?: number): Promise<string>;
export declare function loadAndCompose(entryPath: string, fragmentsRoot: string, target: ComposeTarget): Promise<{
    frontmatter: string;
    body: string;
}>;
//# sourceMappingURL=compose.d.ts.map