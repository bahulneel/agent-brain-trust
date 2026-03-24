# Repository layout

Authoring lives under `content/`; TypeScript tooling under `packages/` and `scripts/build.ts`.

| Path | Purpose |
| ---- | ------- |
| `content/skills/*.md` | Skill entries: YAML `compose:` (profile, roster, …) becomes the initial include env; stripped from built `SKILL.md`. Body uses `@include` + `scripts/compose.ts` (merged env, `{{name}}`, `@repeat roster` … `@endrepeat`, `guest=` → roster) |
| `content/skill-fragments/` | **`profiles/`** (prefix/suffix per variation), **`common/`** (`skill-protocol-body`, persona fidelity, guest/debate/footer); roster is CSV in query params |
| `content/topics/` | **Rooted tree** under **`knowledge-work/`**: each branch is a directory with `topic.yml` (`label` only; child topics are subdirs with `topic.yml` or sibling leaf `*.yml`). Node **ids** are directory names and leaf file stems — not duplicated in YAML. Legacy: flat **`<clade>.yaml`** files merged under a synthetic root, or **`taxonomy.yaml`**. **`index.yaml`** is not authored here — the plugin build **writes** it under `resources/topics/` from `content/skills/*.md`. Copied into skill `assets/` and plugin `resources/` |
| `content/experts/` | One `.md` per expert (kebab-case from full name); build emits **`rost.json`** (`id` → markdown) for MCP/CLI. Composed via `@include experts/<file>.md` |
| `content/references/` | General rules (discovery, MCP/CLI usage, dialogue); copied to `references/` next to each built `SKILL.md` and to `resources/references/` for MCP ([file references](https://agentskills.io/specification#file-references)). Runtime behaviour for agents is documented in that tree, not duplicated here. |
| `packages/brain-trust-core` | Discovery helpers + CLI bundled into every skill |
| `packages/brain-trust-db` | Taxonomy validation + `materializeExpertAssets` + `dist/assets` for local CLI tests |
| `packages/brain-trust-mcp` | MCP server (stdio): package **`build`** emits **`dist/brain-trust-mcp.js`**; root build adds **`resources/`** + **`LICENSE`** for publish |
| `turbo.json` | `turbo run build` compiles workspace packages (including MCP bundle) before the plugin build |
| `scripts/build.ts` | Compose markdown, skill CLI bundles, plugin + zips; copies MCP **`dist/`** bundle into plugins and materializes **`resources/`** into the MCP package |
