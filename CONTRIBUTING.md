# Contributing: Brain Trust authoring guide

This document covers the three kinds of content contribution -- adding an **expert**, adding a **topic**, or adding a full **Brain Trust panel** -- along with the authoring conventions, compose system, and the reasoning behind roster construction. Experts and topics are the simplest standalone contributions; a new panel ties them together.

## Repository structure (authoring layer)

| Path | What you edit |
| ---- | ------------- |
| `content/skills/<name>.md` | Skill entry: YAML frontmatter (`compose:` block) + body text + `@include` directives |
| `content/skill-fragments/` | Shared protocol fragments: `profiles/` (prefix/suffix per profile type), `common/` (persona fidelity, guest protocol, debate mechanics, footer) |
| `content/experts/<id>.md` | One persona card per expert, kebab-case id matching the filename |
| `content/topics/root/…` | Rooted YAML tree: branch `topic.yml` files list `children`, leaf `*.yml` files list `expert_ids` and `keywords` |
| `content/references/` | General-purpose reference docs shipped alongside every built skill |

The build system (`scripts/compose.ts`) reads `content/skills/*.md`, resolves `@include` directives against `content/skill-fragments/`, injects expert personas via `@repeat roster`, and strips the `compose:` block from the output `SKILL.md`.

## Adding an expert

Adding a new expert persona is the simplest standalone contribution. An expert can be used by the `expert-opinion` skill (single-voice mode) and is available for any future panel roster.

### 1. Create the persona card

Add a file at `content/experts/<id>.md` where `<id>` is kebab-case from the person's full name (e.g. `barbara-liskov`, `joe-armstrong`).

If you are adding the expert to an active panel roster, write a **substantive card**:

```markdown
### Name — Epithet

**Bio**: Full name — one sentence situating them (works, contributions, domain).
**Attitude**: Characteristic stance toward problems.
**Tone**: Voice and rhetorical habits.

- **Core Drives**:
  - **Drive name**: One sentence.
  - **Drive name**: One sentence.
  - **Drive name**: One sentence.
- **Core move**: How they typically advance understanding.
- **Prefers**: comma-separated tendencies.
- **Rejects**: comma-separated anti-patterns.
- **Watch for**: what they notice that others miss.
- **Signature question**: "A question in their voice?"
```

If the expert is not yet on any roster and you want to reserve them in the taxonomy for future use, a **draft placeholder** is acceptable:

```markdown
### Name

**Bio**: Draft persona for **Name** — replace with accurate biography and primary domain.
**Attitude**: Replace with characteristic stance toward problems in their field.
**Tone**: Replace with typical voice and rhetorical habits.

- **Core Drives**: (what they optimise for)
- **Core move**: (how they typically advance understanding)
- **Prefers**: …
- **Rejects**: …
- **Watch for**: …
- **Signature question**: …
```

Guidelines for substantive cards:

- **Priors, not scripts.** Cards are gravitational centers -- the agent activates only what helps the current question.
- **Whole mind, not tagline.** A coherent intellectual portrait, not one catchphrase.
- **Bio line is grounding, not hagiography.** One sentence. Name the works or contributions that situate them; skip superlatives.
- **3 core drives, not more.** Three gives enough texture; more than three dilutes.
- **Signature question must be in their voice.** It should sound like something they would actually ask.
- **Parenthetical prefix is optional.** Some panels use `### (X) Name — Epithet` with single-letter initials when the collective has an acronym. This is a stylistic choice per panel, not a requirement.

### 2. Register on a taxonomy leaf

Every expert file must appear on at least one taxonomy leaf. Find the leaf that best fits the expert's domain under `content/topics/root/…/` and add the id to its `expert_ids` list. If no suitable leaf exists, create one (see "Adding a topic" below).

### 3. Validate

```bash
npm run db:build    # fails if expert ↔ taxonomy links are broken
```

## Adding a topic

Topics organise the taxonomy tree that the `expert-opinion` skill uses to match user queries to experts. Adding a topic is useful when you want to cover a new domain area or give existing experts a more specific home.

### Leaf topics

A leaf is a YAML file under `content/topics/root/…/` that lists expert ids and keywords:

```yaml
id: concurrency-models
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

- `id` must match the filename (without `.yml`).
- `expert_ids` lists every expert relevant to this topic. Each id must have a corresponding `content/experts/<id>.md`.
- `keywords` feed the fuzzy search index (`topics-search.json`).

After creating the leaf, register it in the nearest parent branch's `topic.yml` by adding its id to the `children` list:

```yaml
id: software-systems
label: Software systems
children:
  - software-architecture
  - design-patterns
  - concurrency-models
  - distributed-systems
  - data-intensive-systems
  - software-evolution
```

### Branch topics

A branch is a `topic.yml` that groups children (other branches or leaves). If you need a new mid-level grouping:

1. Create a directory under the appropriate parent in `content/topics/root/…/`.
2. Add a `topic.yml` inside it with `id`, `label`, and `children`.
3. Register the new branch id in its parent's `children` list.

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

**Roster size is flexible.** Existing panels range from 3 members (e.g. `bt-frontend-ux-critique`) to 8 (e.g. `bt-technical-writing-editorial`). The `technical-dialectic` suffix text references "six" members in some places, but the protocol adapts to any count -- smaller panels produce fewer cohorts. Choose the number that gives you the voices you need without padding.

#### The N + contrapuntal voice pattern

This is soft guidance, not a hard rule, but it produces better dialectic:

- **N domain-matched voices** who share the panel's core territory but disagree on emphasis, style, or philosophy within it.
- **1 contrapuntal voice** who brings a perspective the domain group would typically lack or underweight -- not as a "wildcard" but for an **explicitly stated reason** that addresses a real blind spot.

The contrapuntal voice is justified in the skill body (the paragraph before `@include common/skill-protocol-body.md`). State concretely what the domain group tends to miss and why this voice fills that gap. Examples from existing panels:

| Panel | Domain voices | Contrapuntal voice | Stated reason |
| ----- | ------------- | ------------------ | ------------- |
| `bt-software-systems-workshop` | Byrd, Alvaro, Sussman, Hickey, Steele | M. C. Escher | Structural symmetry, recursion, and visual/spatial reasoning about system shape -- perspectives that pure-code thinkers underweight |
| `bt-design-patterns-workshop` | Gamma, Helm, Johnson, Vlissides, Fowler | Rich Hickey | OO pattern discussions omit data-first / de-complecting pressure: when values beat object graphs, when patterns braid concerns that should stay separate |
| `bt-technical-writing-editorial` | Knuth, Kernighan, Kidder, Gleick, Sierra, Fowler, Feynman | Douglas Adams | Irreverence, reader delight, and the editorial instinct that technical prose can be too serious for its own good |

A panel of 3 tightly scoped experts (e.g. `bt-visual-communication-critique`: Tufte, Escher, Spiekermann) may not need a contrapuntal voice at all -- when every seat is load-bearing and the scope is narrow, do not pad.

### 3. Write expert persona cards

Each roster member needs a substantive persona card at `content/experts/<id>.md`. See "Adding an expert" above for the card format and guidelines. **Before adding an expert to a roster, replace any draft placeholder with a substantive card.**

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

Body text: the collective's identity, framing, and any explicit rationale
for non-obvious roster choices (e.g. the contrapuntal voice justification).

@include common/skill-protocol-body.md
```

**Compose block keys:**

| Key | Required | Purpose |
| --- | -------- | ------- |
| `profile` | Yes | Which prefix/suffix pair to use (`technical-dialectic` or `editorial-room`) |
| `roster` | Yes | YAML array of expert ids; order determines speaking order in `@repeat roster` |

The `compose:` block is stripped from the built `SKILL.md`; only `name` and `description` ship to the agent.

**Body text guidelines:**

- Name the collective. Some panels have acronyms (BASHES); others use descriptive names ("the Design Patterns collective," "the Writing Collective").
- One paragraph framing the domain and dialectic purpose.
- If the roster includes a contrapuntal voice, state the reason explicitly in the body. See the `bt-design-patterns-workshop` Rich Hickey paragraph as an example.
- End with `@include common/skill-protocol-body.md`. This pulls in the full shared protocol (prefix, persona fidelity, expert cards, suffix, references).

### 5. Register in the taxonomy

Any new experts must be registered on at least one taxonomy leaf. See "Adding an expert" and "Adding a topic" above for the leaf format and registration steps. Experts may appear on multiple leaves if they span domains (e.g. `martin-fowler` appears on `design-patterns`, `software-evolution`, `structure-editing`, `api-reference-writing`, and `prioritisation`).

### 6. Update cross-references

- **`content/skills/expert-opinion.md`** -- add the new `bt-*` skill name to the collective skills list so `expert-opinion` can point users toward it.
- **`.github/workflows/ci.yml`** -- add `npx skills-ref validate` lines for both the Cursor and Claude plugin paths.
- **`README.md`** -- optionally mirror the same validate commands in the "Validate a built skill" section.

### 7. Build and validate

```bash
npm run db:build    # taxonomy validation + expert materialization
npm run build       # full plugin + zip + MCP build

# Validate the new skill
npx skills-ref validate dist/agent-brain-trust-cursor-plugin/skills/bt-<name>
npx skills-ref validate dist/agent-brain-trust-claude-plugin/skills/bt-<name>
```

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
5. **`@if target` / `@endif`** -- conditional blocks for `plugin`, `claude-code`, `skill-zip`, or `mcp` targets.

## Checklist for a new panel

- [ ] Roster constructed: domain voices + contrapuntal voice (if warranted) with explicit rationale
- [ ] All roster experts have substantive persona cards (no draft placeholders)
- [ ] Skill entry at `content/skills/bt-<name>.md` with compose block and body
- [ ] Taxonomy leaf created or updated with all roster expert ids
- [ ] Taxonomy leaf registered in parent `topic.yml` children
- [ ] `expert-opinion.md` collective skills list updated
- [ ] CI workflow updated with `skills-ref validate` lines
- [ ] `npm run db:build` passes (taxonomy + expert validation)
- [ ] `npm run build` passes (full build)
- [ ] `npx skills-ref validate` passes for both Cursor and Claude plugin outputs
