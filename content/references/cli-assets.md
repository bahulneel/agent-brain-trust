# CLI and bundled assets (skill zip)

When the skill is installed as a directory or zip with `scripts/brain-trust-cli.js`, run commands **from the skill root** (where `SKILL.md` lives). Requires **Node 20+**.

Paths are relative to **`assets/`** (topics, experts) except **references/**, which sit next to `SKILL.md`.

## Navigation-first (default)

With **no arguments**, or `help`, the CLI prints a **discovery guide** (skill root, asset path, fast `resolve-topics` vs broad `search-topics`, then personas and references).

Each command prints **human-oriented** output with **Next** hints unless you pass **`--json`** (raw JSON for scripts only).

```bash
node scripts/brain-trust-cli.js
node scripts/brain-trust-cli.js help
node scripts/brain-trust-cli.js resolve-topics distributed consistency
node scripts/brain-trust-cli.js resolve-topics --strategy intersect organisation squads
node scripts/brain-trust-cli.js get-topic-taxonomy
node scripts/brain-trust-cli.js search-topics distributed systems
node scripts/brain-trust-cli.js list-experts
node scripts/brain-trust-cli.js get-expert william-e-byrd
node scripts/brain-trust-cli.js list-references
node scripts/brain-trust-cli.js get-reference INDEX.md
```

Machine-readable:

```bash
node scripts/brain-trust-cli.js list-experts --json
node scripts/brain-trust-cli.js get-topic-taxonomy --json
node scripts/brain-trust-cli.js get-experts-rost --json
```

- **Experts**: `assets/experts/rost.json` maps **id →** markdown. Prefer `get-expert <id>`; use `get-experts-rost --json` when a tool needs the full object.
- **Taxonomy**: rooted **`assets/topics/knowledge-work/topic.yml`** tree when present; otherwise flat `assets/topics/<clade>.yaml` (excluding `index.yaml`), merged at load. `get-topic-taxonomy` prints a **tree** (default) or `--json` for the merged document. **`resolve-topics`** and **`search-topics`** use **`assets/topics/topics-search.json`** when the build emitted it; prefer **`resolve-topics`** for several task keywords (**`--strategy merge|intersect|converge`**), **`search-topics`** for catch-all fuzzy discovery.
- **References**: `references/*.md` — `list-references` then `get-reference <path>`.

Use the same discovery protocol as [discovery.md](discovery.md) and skill **`draft-experts`**: **`resolve-topics`** first when mapping the task to ids; **`search-topics`** / **`get-topic-taxonomy`** when browsing; load one file at a time when possible.
