# CLI and bundled assets (skill zip)

When the skill is installed as a directory or zip with `scripts/brain-trust-cli.js`, run commands **from the skill root** (where `SKILL.md` lives). Requires **Node 20+**.

Paths are relative to **`assets/`** (topics, experts) except **references/**, which sit next to `SKILL.md`.

## Navigation-first (default)

With **no arguments**, or `help`, the CLI prints a **discovery guide** (skill root, asset path, suggested order: taxonomy → list experts → get one persona → references).

Each command prints **human-oriented** output with **Next** hints unless you pass **`--json`** (raw JSON for scripts only).

```bash
node scripts/brain-trust-cli.js
node scripts/brain-trust-cli.js help
node scripts/brain-trust-cli.js get-topic-taxonomy
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
- **Taxonomy**: composed from `assets/topics/taxonomy/manifest.yaml` and `assets/topics/taxonomy/clades/*.yaml` (one clade file per top-level subtree). `get-topic-taxonomy` prints a **tree** (default) or `--json` for the merged document.
- **References**: `references/*.md` — `list-references` then `get-reference <path>`.

Use the same discovery protocol as [discovery.md](discovery.md): narrow iteratively; load one file at a time when possible.
