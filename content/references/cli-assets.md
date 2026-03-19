# CLI and bundled assets (skill zip)

When the skill is installed as a directory or zip with `scripts/brain-trust-cli.js`, run commands **from the skill root** (where `SKILL.md` lives). Requires **Node 20+**.

Paths are relative to **`assets/`** (topics, experts) except **references/**, which sit next to `SKILL.md`.

```bash
node scripts/brain-trust-cli.js list-experts
node scripts/brain-trust-cli.js get-expert william-e-byrd
node scripts/brain-trust-cli.js get-experts-rost
node scripts/brain-trust-cli.js get-topic-taxonomy
node scripts/brain-trust-cli.js list-references
node scripts/brain-trust-cli.js get-reference INDEX.md
```

- **Experts**: `assets/experts/rost.json` maps **id →** markdown body; individual `*.md` files remain for authoring. **`list-experts`** returns `expertIds`; use **`get-experts-rost`** for the full JSON object.
- **Taxonomy**: `assets/topics/taxonomy.yaml` — hierarchical topics; leaves list **`expert_ids`**. **`get-topic-taxonomy`** prints parsed JSON.
- **References**: `references/*.md` — paths from `list-references` are relative to `references/`.

Use the same discovery protocol as [discovery.md](discovery.md): list, then read only what you need.
