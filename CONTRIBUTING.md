# Contributing: Brain Trust authoring guide

This document covers the three kinds of content contribution -- adding an **expert**, adding a **topic**, or adding a full **Brain Trust panel** -- along with the authoring conventions, compose system, and the reasoning behind roster construction. Experts and topics are the simplest standalone contributions; a new panel ties them together.

## Repository structure (authoring layer)

| Path | What you edit |
| ---- | ------------- |
| `content/skills/<name>.md` | Skill entry: YAML frontmatter (`compose:` block) + body text + `@include` directives |
| `content/skill-fragments/` | Shared protocol fragments: `profiles/` (prefix/suffix per profile type), `common/` (persona fidelity, guest protocol, debate mechanics, footer) |
| `content/experts/<id>.md` | One persona card per expert, kebab-case id matching the filename. Experts in the **contrapuntal voice** (the outlier) seat of a panel must include **Outlier Hooks**. |
| `content/topics/knowledge-work/…` | Rooted YAML tree: branch directories contain `topic.yml` with **`label` only** (children are discovered from subdirs / leaf files); leaf `*.yml` files list **`expert_ids`** and **`keywords`** (no `id` in YAML — it is the filename stem) |
| `content/references/` | General-purpose reference docs shipped alongside every built skill |

For the full workspace layout (including packages and scripts) and for build outputs and validation commands, see [docs/repository-layout.md](docs/repository-layout.md) and [docs/build.md](docs/build.md).

The build system (`scripts/compose.ts`) reads `content/skills/*.md`, resolves `@include` directives against `content/skill-fragments/`, injects expert personas via `@repeat roster`, and strips the `compose:` block from the output `SKILL.md`.

## Adding an expert

Adding a new expert persona is the simplest standalone contribution. An expert can be used by the `expert-opinion` skill (single-voice mode) and is available for any future panel roster.

### 1. Create the persona card

Add a file at `content/experts/<id>.md` where `<id>` is kebab-case from the person's full name (e.g. `barbara-liskov`, `joe-armstrong`).

Use this **persona card template** for every expert. Replace every field with real, finished copy — the structure is fixed; the content must be substantive.

```markdown
### Name — Epithet

**Bio**: Full name — one sentence situating them (works, contributions, domain).
**Attitude**: Characteristic stance toward problems.
**Tone**: Voice and rhetorical habits.

- **Core Drives**:
  - **Drive name**: One sentence.
  - **Drive name**: One sentence.
  - **Drive name**: One sentence.
- **Outlier Hooks**: (Optional, max 2)
  - **Hook name**: One sentence. Only for the **contrapuntal voice** (typically the last seat in a roster) or single-voice modes.
- **Core move**: How they typically advance understanding.
- **Prefers**: comma-separated tendencies.
- **Rejects**: comma-separated anti-patterns.
- **Watch for**: what they notice that others miss.
- **Signature question**: "A question in their voice?"
```

Do not commit placeholder persona content (partial templates, “replace later” bios, empty or parenthetical stubs). That breaks compose, search, and runtime persona fidelity. If the card is not finished yet, keep work on a branch until it fully matches the template above.

Guidelines when filling the template:

- **Cross-cutting (`Core move`, `Prefers`, `Rejects`, `Watch for`): priors, not scripts.** These fields should encode judgment tendencies, not instructions the model must perform every turn.
  - **Bad** — Procedural instructions:
    > In every reply, list all three Core Drives first, then ask one clarifying question.
  - **Good** — A judgment lens:
    > Reduce the problem until the irreversible decisions are visible.
  - **Better** — Preferences and failure modes that guide selective use:
    > reversible experiments, explicit tradeoffs, operational evidence
    >
    > hidden commitments smuggled in as defaults

- **Cross-cutting (`Bio`, `Attitude`, `Tone`, and the list fields together): whole mind, not tagline.** The card should feel like one coherent person viewed from multiple angles, not one slogan repeated in every slot.
  - **Bad** — Repetition masquerading as depth:
    > Values simplicity above all else.
    >
    > Simple, direct, minimalist.
    >
    > Simplify the problem.
  - **Good** — Different fields revealing different angles of the same mind:
    > Suspicious of elegant theories that have not met production constraints.
    >
    > Calm, exact, slightly impatient with vague claims.
    >
    > Turn abstractions into concrete failure cases, then rebuild upward.
  - **Better** — A fuller portrait with history, stance, and a characteristic concern:
    > Systems researcher who spent a decade studying coordination failures in large distributed teams.
    >
    > Wants ideas to survive contact with load, people, and time.
    >
    > solutions that work in the happy path but decay under handoffs

- **`Bio`: grounding, not hagiography.** One sentence. Name the works or contributions that situate them; skip superlatives.
  - **Bad** — Hype without grounding:
    > A legendary visionary and one of the greatest thinkers of the modern era.
  - **Good** — Domain and contribution:
    > Database engineer known for work on query planning and practical data-system reliability.
  - **Better** — Domain, contribution, and sharper specificity:
    > Database engineer known for query-planner design, operational reliability work, and essays on why production incidents expose model flaws.

- **`Core Drives`: three distinct drives, not one vague one or a pile of synonyms.** Three gives enough texture; more than three dilutes.
  - **Bad** — One vague drive, or a pile of synonyms:
    > Excellence: Cares about quality.
  - **Good** — Three distinct levers:
    > Evidence: Claims should survive contact with real cases.
    >
    > Legibility: A reader should be able to follow the chain of reasoning.
    >
    > Consequence: Advice should cash out in action, not admiration.
  - **Better** — Three drives that can create productive tension:
    > Local truth: Describe the mechanism honestly, even if it complicates the story.
    >
    > Operational mercy: Prefer designs that fail in ways humans can recover from.
    >
    > Composability: Parts should combine without hidden coupling.

- **`Outlier Hooks`: use them when the outlier needs extra pull beyond their core center of gravity.** Hooks are optional and should stay rare. Reach for them when the expert's value in a room depends on a direction, pressure, or provocation that is not already legible from the `Core Drives` alone.
  - **Bad** — Repeating the core in slightly different words:
    > Simplicity: Remove needless complexity.
    >
    > De-complecting: Separate braided concerns.
  - **Good** — A distinct directional pull that may only matter in certain rooms:
    > Reader delight: A technically correct draft may still fail if it leaves no mental residue.
  - **Better** — A hook that explains why this person changes the room's trajectory:
    > Defamiliarization: Make the familiar strange enough that a room full of specialists stops taking its own assumptions for granted.
  - Hooks are **not** backup drives, bonus traits, or a second personality. They are targeted levers that become useful when the expert is acting as the room's outlier or when a single-voice response needs that extra angle.

- **`Signature question`: make it unmistakably theirs.** It should sound like something they would actually ask in conversation, not a generic coaching prompt.
  - **Bad** — Generic coaching language:
    > What are your goals?
  - **Good** — A recognisable lens:
    > Which part of this will still make sense at 3 a.m. during an incident?
  - **Better** — Specific, opinionated, and voice-shaped:
    > Where, exactly, does this design ask a tired operator to perform a miracle?

- **Heading (`### Name — Epithet`): parenthetical prefix is optional.** Some panels use `### (X) Name — Epithet` with single-letter initials when the collective has an acronym. This is a panel-level style choice, not a per-card requirement.
  - **Bad** — Mixed styles with no panel-level pattern:
    > ### Morgan Hale — Failure Cartographer
    >
    > ### (H) Lena Park — Interface Naturalist
  - **Good** — A consistent plain heading style across the panel:
    > ### Name — Epithet
  - **Better** — Consistent initials when the panel uses an acronym:
    > ### (F) Morgan Hale — Failure Cartographer
    >
    > ### (L) Lena Park — Interface Naturalist
    >
    > ### (O) Taro Venn — Operational Skeptic

### 2. Register on a taxonomy leaf

Every expert file must appear on at least one taxonomy leaf. Find the leaf that best fits the expert's domain under `content/topics/knowledge-work/…/` and add the id to its `expert_ids` list. If no suitable leaf exists, create one (see "Adding a topic" below).

### 3. Validate

```bash
npm run db:build    # fails if expert ↔ taxonomy links are broken
```

## Adding a topic

Topics organise the taxonomy tree that the `expert-opinion` skill uses to match user queries to experts. Adding a topic is useful when you want to cover a new domain area or give existing experts a more specific home.

### Leaf topics

A leaf is a YAML file under `content/topics/knowledge-work/…/` named **`<id>.yml`** (the file stem is the topic id). It lists expert ids and keywords — **do not** put `id` in the file:

```yaml
label: Concurrency models
expert_ids:
  - joe-armstrong
  - carl-hewitt
  - tony-hoare
keywords:
  - concurrency
  - actors
  - CSP
  - message passing
```

Save as e.g. `concurrency-models.yml` next to sibling leaves or under the right branch directory.

- `expert_ids` lists every expert relevant to this topic. Each id must have a corresponding `content/experts/<id>.md`.
- `keywords` feed the fuzzy search index (`topics-search.json`).

The parent branch discovers leaves and child branches automatically from the directory; **no `children` list** in `topic.yml`.

### Branch topics

A branch is a directory with `topic.yml` containing **`label` only** (optional `description`, `keywords`, `aliases`). The branch **id** is the **directory name**. If you need a new mid-level grouping:

1. Create a directory under the appropriate parent in `content/topics/knowledge-work/…/` (directory name = topic id).
2. Add `topic.yml` inside it with at least `label:`.
3. Add child branch directories or leaf `*.yml` files as siblings under that directory — order on disk is lexicographic by name.

### Validate

```bash
npm run db:build    # checks bidirectional expert ↔ leaf integrity
```

## Adding a Brain Trust panel (bt-* skill)

### 1. Choose a profile

Two profile types exist under `content/skill-fragments/profiles/`:

- **`technical-dialectic`** -- structured debate with cohorts, tension axes, and a Moderator-led synthesis toward a "Substrate Truth." Use for architecture, design, systems, patterns, and similar problem-solving domains.
- **`editorial-room`** -- structured editorial critique with entry/stop points, writing lifecycle awareness, and markup sketches. Use for prose, documentation, explanation, and science communication.

The profile determines the prefix (operating principles, moderator role) and suffix (grounding phase, trajectory setting, cohort construction, debate protocol, output contract, grounding lenses). You almost never need to fork these; body text in the skill entry customises the collective's personality and framing.

### 2. Assemble the roster

The roster is the list of expert ids who form the panel's permanent members. Guests are drafted dynamically by the protocol at runtime; the roster defines the fixed core.

**Roster size is flexible.** The protocol adapts to different counts, but in practice you should aim for enough permanent members to support more than one cohort during debate. As a rule of thumb, that usually means at least **4** members, and more often **6-8** for a fully developed room. Choose the number that gives you the voices you need without padding.

#### The N + contrapuntal voice pattern

This is soft guidance, not a hard rule, but it often produces better dialectic:

- **N domain-matched voices** who share the panel's core territory but disagree on emphasis, style, or philosophy within it. In practice, `N` is usually **3-5**: enough for meaningful internal disagreement, not so many that the room loses shape.
- **1 contrapuntal voice** who brings a perspective the domain group would typically lack or underweight.

When this pattern works, the outlier should feel obvious from the roster itself. Their inclusion should make sense because of who they are in relation to the other members, not because the skill body pauses to explain it.

Very small panels are now the exception, not the default. You can still retract a room if the material truly wants it, but the default should be enough voices to support more than one group in the debate. If the room cannot naturally split into multiple cohorts, it may be too small for the full dialectical protocol.

### 3. Write expert persona cards

Each expert referenced from the taxonomy needs a substantive persona card at `content/experts/<id>.md`. See "Adding an expert" above for the card format and guidelines. **Roster members must already meet that bar** before they appear in a panel's `compose.roster`.

In practice, panel authors will often be assembling a room from **existing** experts rather than writing fresh cards. In the normal case, an existing card should already be largely right, because it is a profile of that person rather than of a specific room.

The main exception is when an expert is being drafted as the room's outlier. In that case, you may need to add `Outlier Hooks` so the expert pulls in the direction you want during debate, especially when that pressure would be hard to anticipate or encode in advance as part of their ordinary center of gravity.

Treat this as a targeted adjustment, not a rewrite of the whole card. Most reused experts should need no changes; add hooks only when the outlier function is important to the room and not already legible from the existing profile.

### 4. Write the skill entry

Create `content/skills/bt-<name>.md`. The structure is:

```markdown
---
name: bt-<name>
description: >-
  One to three sentences: what this panel does, who it includes, and when to
  use it. This becomes the skill's description in plugin manifests and
  discovery.
compose:
  profile: technical-dialectic   # or editorial-room
  roster:
    - expert-id-one
    - expert-id-two
    - expert-id-three
---

Body text: the room's identity, framing, and stakes.

@include common/skill-protocol-body.md
```

**Compose block keys:**

| Key | Required | Purpose |
| --- | -------- | ------- |
| `profile` | Yes | Which prefix/suffix pair to use (`technical-dialectic` or `editorial-room`) |
| `roster` | Yes | YAML array of expert ids; order determines speaking order in `@repeat roster` |

The `compose:` block is stripped from the built `SKILL.md`; only `name` and `description` ship to the agent. Clients use those fields first to decide when to load the full skill; for phrasing, trigger testing, and eval-style prompts, see [Optimizing skill descriptions](https://agentskills.io/skill-creation/optimizing-descriptions) on the Agent Skills site.

**Body text guidelines:**

- Set the scene. Describe the world or room where this debate is happening (e.g., "a Strange Loop hallway whiteboard", "the weekly editorial conference of a serious technical periodical"). Use a contextually appropriate but generic role for the agent (e.g., `delegate`, `editor`, `facilitator`, `reviewer`) and focus on the context and stakes of the dialectic rather than listing the experts. Avoid title-like proper-noun role names.
- One paragraph framing the domain and dialectic purpose.
- End with `@include common/skill-protocol-body.md`. This pulls in the full shared protocol (execution contract, prefix, persona fidelity, expert cards, suffix, references).

### 5. Register in the taxonomy

Any new experts must be registered on at least one taxonomy leaf. See "Adding an expert" and "Adding a topic" above for the leaf format and registration steps. Experts may appear on multiple leaves if they span domains (e.g. `martin-fowler` appears on `design-patterns`, `software-evolution`, `structure-editing`, `api-reference-writing`, and `prioritisation`).

### 6. Update cross-references

- **`content/skills/expert-opinion.md`** -- add the new `bt-*` skill name to the collective skills list so `expert-opinion` can point users toward it.
- **`.github/workflows/ci.yml`** -- no per-skill lines needed; CI runs `npm run validate:skills-ref` over every folder under `dist/.../skills/`.
- **`README.md`** -- add a **Skills catalog** subsection for the new `bt-*` skill (natural-language and direct examples), consistent with existing workshops.
- **`docs/build.md`** -- only if you change how validation works; the default is `npm run validate:skills-ref` after `npm run build`.

### 7. Build and validate

```bash
npm run db:build    # taxonomy validation + expert materialization
npm run build:packages  # turbo: all workspace builds, including repo-tooling → dist-tooling/
npm run build:tooling   # turbo: only repo-tooling (deps first) — if you changed scripts/**/*.ts; then commit dist-tooling/
npm run build       # turbo (includes `packages/brain-trust-mcp` → `dist/brain-trust-mcp.js`) then plugin + zips + MCP `resources/`/`LICENSE`

# Validate all built skills (includes the new one)
npm run validate:skills-ref
```

If you edit **`scripts/**/*.ts`**, run **`npm run build:tooling`** (or **`npm run build:packages`**) and include the regenerated **`dist-tooling/`** files in your PR; CI fails if they are out of sync.

When you bump the repo **`version`** in root **`package.json`**, set **`packages/brain-trust-mcp/package.json`** `version` to the same value — the build fails if they differ (npm publish and plugin **`npx`** spec stay aligned). Keep **`packages/repo-tooling/package.json`** `version` in step for consistency.

Common validation failures:

- **"taxonomy references unknown expert id"** -- you added an expert id to a leaf but there is no matching `content/experts/<id>.md` file.
- **"experts/<id>.md is not listed on any taxonomy leaf"** -- you created an expert file but did not add its id to any leaf's `expert_ids`.

## Persona fidelity (how cards are used at runtime)

Persona fidelity rules live in `content/skill-fragments/common/persona-fidelity.md` and apply identically to every panel. The key principles:

- **Cards are priors for judgment, not a script to perform.** The user's concrete problem, constraints, and evidence outrank any bullet that would force a shallow or theatrical take.
- **Selective use.** Do not try to exhibit every listed drive, preference, or rejection on every turn. Activate only what actually helps this question; the rest is background orientation.
- **Whole card.** Read each profile as a whole mind -- bio, tone, drives, and caveats together -- not as a tagline or checklist.
- **Channel, then deviate.** Start from the persona's gravitational center (Core Drives). If that center misfits the problem, fall back to their broader intellectual style rather than forcing a caricature.

There are no per-room fidelity overrides. All rooms share the same fidelity rules. The persona card itself (bio, tone, drives) is the only per-expert customisation.

## The compose system

The build system (`scripts/compose.ts`) processes skill entries through these steps:

1. **Extract compose env** -- the `compose:` block in YAML frontmatter becomes the initial template environment (`profile`, `roster`, etc.) and is stripped from the output.
2. **Template variables** -- `{{name}}` in any fragment is replaced from the merged environment.
3. **`@repeat roster` / `@endrepeat`** -- expands the inner block once per roster id, setting `{{id}}` each iteration.
4. **`@include path/to/file.md`** -- resolves against `content/skill-fragments/` (or `content/experts/` for paths starting with `experts/`). Supports query params (`?k=v`) and comma-separated params after `.md`.
5. **`@if target` / `@endif`** -- conditional blocks for `plugin`, `claude-code`, or `skill-zip` targets.

## Protocol checkpoints and eval-driven adherence

`content/skill-fragments/common/protocol-execution-contract.md` is included from `common/skill-protocol-body.md` for every panel. It tells the agent to treat the Brain Trust flow as **one human-gated milestone per turn** by default, to end turns with a visible **Protocol checkpoint** block when input is required, and to allow **fast-track** bundling only when the human explicitly opts in. That addresses the common failure mode where a model collapses Grounding, Trajectory, cohort construction, and debate into a single reply despite prose elsewhere that says “wait for confirmation.”

The Agent Skills evaluation workflow ([Evaluating skill output quality](https://agentskills.io/skill-creation/evaluating-skills)) is the right feedback loop for that behavior: design prompts that **invite** rushing (long briefs, “give me the whole workshop in one answer”), run **with-skill** vs baseline in **clean sessions** per case, then add **assertions** such as “first message contains only Readings plus a checkpoint,” “no Value Constraints in the same message as Trajectory,” or “no fabricated user confirmation.” Failed assertions and transcripts point back to tightening `protocol-execution-contract.md` or phase wording in the profile suffix — the spec does not provide a separate runtime “pause primitive”; explicit checkpoints plus eval pressure are the practical enforcement layer.

## Checklist for a new panel

- [ ] Roster constructed: domain voices + contrapuntal voice (if warranted)
- [ ] All roster experts have substantive persona cards (no stubs or TBD fields)
- [ ] Skill entry at `content/skills/bt-<name>.md` with compose block and body
- [ ] Taxonomy leaf created or updated with all roster expert ids
- [ ] Taxonomy leaf registered in parent `topic.yml` children
- [ ] `expert-opinion.md` collective skills list updated
- [ ] `README.md` skills catalog updated for the new `bt-*` skill
- [ ] `npm run db:build` passes (taxonomy + expert validation)
- [ ] `npm run build` passes (full build)
- [ ] `npm run validate:skills-ref` passes (CI runs this after build)
